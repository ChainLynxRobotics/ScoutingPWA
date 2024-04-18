import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import SettingsContext from "../context/SettingsContext";
import { DragDropContext, Draggable, DropResult } from "react-beautiful-dnd";
import { StrictModeDroppable } from "../StrickModeDroppable";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import MatchDatabase from "../../util/MatchDatabase";
import useLocalStorageState from "../hooks/localStorageState";
import { useNavigate } from "react-router-dom";
import { QRCodeData } from "../../types/QRCodeData";
import QrCodeType from "../../enums/QrCodeType";
import QrCodeList from "../qr/QrCodeList";
import QrCodeScanner from "../qr/QrCodeScanner";
import { useSnackbar } from "notistack";

export default function PickList() {
    const settings = useContext(SettingsContext);

    const {enqueueSnackbar} = useSnackbar();

    // QR code sending and receiving
    const [qrData, setQrData] = useState<QRCodeData>();
    const [scannerOpen, setScannerOpen] = useState(false);


    const [pickListIndex, setPickListIndex] = useLocalStorageState<{[key: string]: number[]}>({}, "analyticsPickListIndex"); // Store picklist for each competition id separately

    // Deal with the picklist for the current competition
    const pickList = useMemo(() => {
        if (!settings) return [];
        return pickListIndex[settings.competitionId] || [];
    }, [pickListIndex, settings?.competitionId]);
    
    const setPickList = useCallback((teams: number[]) => {
        if (!settings) return;
        const newPickListIndex = {...pickListIndex};
        newPickListIndex[settings.competitionId] = teams;
        setPickListIndex(newPickListIndex);
    }, [pickListIndex, settings?.competitionId]);


    const hasUpdatedPickListIndex = useRef(false);
    useEffect(()=>{
        if (hasUpdatedPickListIndex.current) return;
        hasUpdatedPickListIndex.current = true;
        async function updatePickListIndexTeams() {
            if (!settings) return;

            var teams = await MatchDatabase.getUniqueTeams(settings.competitionId);
            
            const combinedList = [...new Set([...(pickListIndex[settings.competitionId] || []), ...teams])];
            setPickList(combinedList);
        }
        updatePickListIndexTeams()
    }, [settings?.competitionId, pickListIndex]);

    function onDragEnd(result: DropResult) {
        // dropped outside the list
        if (!result.destination) return;
    
        const items = reorder(
            pickList,
            result.source.index,
            result.destination.index
        );
    
        setPickList(items);
    }

    const openQrCodes = () => {
        if (!settings) return;
        const data = {
            qrType: QrCodeType.PickList,
            version: APP_VERSION,
            pickListData: {
                pickList: pickList,
                competitionId: settings.competitionId
            }
        };
        setQrData(data);
    }

    const onQrData = (data: QRCodeData) => {
        console.log(data);
        if (data.qrType === QrCodeType.PickList && data.pickListData) {
            const newPickListIndex = {...pickListIndex};
            newPickListIndex[data.pickListData.competitionId] = data.pickListData.pickList;
            setPickListIndex(newPickListIndex);
            setScannerOpen(false);
            if (settings?.competitionId !== data.pickListData.competitionId) {
                enqueueSnackbar(`Pick List is for a different competition: ${data.pickListData.competitionId}. 
                                 The data has been imported, but you must change your competition Id in settings to view it.`, {variant: "success"});
            } else {
                enqueueSnackbar("Pick List imported", {variant: "success"});
            }
        } else {
            enqueueSnackbar("QR does not contain a Pick List", {variant: "error"});
        }
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <StrictModeDroppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <List ref={provided.innerRef} {...provided.droppableProps}>
                            {pickList.map((team, index) => (
                                <DraggableTeamListItem team={team} index={index} key={team} />
                            ))}
                            {provided.placeholder}
                        </List>
                    )}
                </StrictModeDroppable>
            </DragDropContext>
            <div className="w-fill flex flex-col items-center">
                <span className="text-secondary">PickList for competition: <i>{settings?.competitionId}</i></span>
                <div className="flex flex-wrap gap-2 my-4">
                    <Button variant="contained" onClick={openQrCodes} startIcon={<span className="material-symbols-outlined">qr_code_2</span>}>Share</Button>
                    <Button variant="contained" color="secondary" onClick={()=>setScannerOpen(true)} startIcon={<span className="material-symbols-outlined">photo_camera</span>}>Scan</Button>
                </div>
            </div>


            {/* Share pick list popup */}
            <Dialog
                open={qrData !== undefined}
                onClose={() => {setQrData(undefined)}}
                aria-labelledby="share-dialog-title"
                fullScreen
            >
                <DialogTitle id="share-dialog-title">
                    Share Pick List
                </DialogTitle>
                <DialogContent sx={{scrollSnapType: "y mandatory"}}>
                    <div className="w-full flex flex-col items-center">
                        <div className="w-full max-w-md">
                            <p className="text-center">Scan the following QR code(s) on copy this pick list onto other devices</p>
                            {qrData && <QrCodeList data={qrData} />}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button size="large" onClick={() => {setQrData(undefined)}}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Scan pick list popup */}
            <Dialog
                open={scannerOpen}
                onClose={() => {setScannerOpen(false)}}
                aria-labelledby="scan-dialog-title"
                fullScreen
            >
                <DialogTitle id="scan-dialog-title">
                    Scan Pick List
                </DialogTitle>
                <DialogContent sx={{paddingX: 0}}>
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-full max-w-xl">
                            <QrCodeScanner onReceiveData={onQrData} />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button size="large" onClick={() => {setScannerOpen(false)}}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

const DraggableTeamListItem = (props: {team: number, index: number}) => {

    const settings = useContext(SettingsContext);
    const navigate = useNavigate();

    const labelId = `pick-list-label-${props.team}`;

    function toggleStarred(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.stopPropagation();
        e.preventDefault();
        if (settings) {
            if (settings.starredTeams.includes(props.team)) {
                settings.setStarredTeams(settings.starredTeams.filter(t=>t!==props.team));
            } else {
                settings.setStarredTeams([...settings.starredTeams, props.team]);
            }
        }
    }
    
    return (
        <Draggable key={props.team.toString()} draggableId={props.team.toString()} index={props.index}>
            {(provided, snapshot) => (
                <ListItem
                    secondaryAction={
                        <IconButton edge="end" aria-label="expand">
                            <span className="material-symbols-outlined">navigate_next</span>
                        </IconButton>
                    }
                    disablePadding
                    onClick={()=>navigate(`/analytics/team/${props.team}`)}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={snapshot.isDragging ? { bgcolor: (theme) => theme.palette.action.hover } : {}}
                >
                    <ListItemButton role={undefined} disableRipple>
                        <ListItemIcon >
                            <span className="material-symbols-outlined">drag_indicator</span>
                        </ListItemIcon>
                        <ListItemIcon onClick={toggleStarred}>
                            <Checkbox
                                edge="start"
                                checked={settings?.starredTeams.indexOf(props.team) !== -1}
                                tabIndex={-1}
                                inputProps={{ 'aria-labelledby': labelId }}
                                disableRipple
                                icon={<span className="material-symbols-outlined">star_outline</span>}
                                checkedIcon={<span className="material-symbols-outlined">star</span>}
                            />
                        </ListItemIcon>
                        <ListItemText id={labelId} primary={
                            <span className="flex gap-2">
                                {!snapshot.isDragging && <span className="text-secondary">#{props.index + 1}</span>}
                                <b>{props.team}</b>
                            </span>
                        } />
                    </ListItemButton>
                </ListItem>
            )}
        </Draggable>
    )
}

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
};