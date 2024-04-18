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

type PickListData = {
    pickList: number[],
    crossedOut: number[],
}

export default function PickList() {
    const settings = useContext(SettingsContext);

    const {enqueueSnackbar} = useSnackbar();

    // QR code sending and receiving
    const [qrData, setQrData] = useState<QRCodeData>();
    const [scannerOpen, setScannerOpen] = useState(false);


    const [pickListIndex, setPickListIndex] = useLocalStorageState<{[key: string]: PickListData}>({}, "analyticsPickListIndex"); // Store picklist for each competition id separately

    // Deal with the picklist for the current competition
    const pickListData = useMemo(() => {
        if (!settings || !pickListIndex[settings.competitionId]) return {pickList: [], crossedOut: []};
        return pickListIndex[settings.competitionId];
    }, [pickListIndex, settings]);
    
    const setPickListData = useCallback((data: Partial<PickListData>) => {
        if (!settings) return;
        const newPickListIndex = {...pickListIndex};
        newPickListIndex[settings.competitionId] = {
            pickList: data.pickList || pickListIndex[settings.competitionId]?.pickList || [], // Keep the old pick list if not provided
            crossedOut: data.crossedOut || pickListIndex[settings.competitionId]?.crossedOut || [] // Keep the old crossed out list if not provided
        };
        setPickListIndex(newPickListIndex);
    }, [pickListIndex, setPickListIndex, settings]);


    const hasUpdatedPickListIndex = useRef(false);
    useEffect(()=>{
        if (hasUpdatedPickListIndex.current) return;
        hasUpdatedPickListIndex.current = true;
        async function updatePickListIndexTeams() {
            if (!settings) return;

            const teams = await MatchDatabase.getUniqueTeams(settings.competitionId);
            
            const combinedList = [...new Set([...(pickListData.pickList), ...teams])];
            setPickListData({pickList: combinedList});
        }
        updatePickListIndexTeams()
    }, [settings, settings?.competitionId, pickListIndex, setPickListData]);

    function onDragEnd(result: DropResult) {
        // dropped outside the list
        if (!result.destination) return;
    
        const items = reorder(
            pickListData.pickList,
            result.source.index,
            result.destination.index
        );
    
        setPickListData({pickList: items});
    }

    const openQrCodes = () => {
        if (!settings) return;
        const data = {
            qrType: QrCodeType.PickList,
            version: APP_VERSION,
            pickListData: {
                ...pickListData,
                competitionId: settings.competitionId
            }
        };
        setQrData(data);
    }

    const onQrData = (data: QRCodeData) => {
        console.log(data);
        if (data.qrType === QrCodeType.PickList && data.pickListData) {
            const newPickListIndex = {...pickListIndex};
            newPickListIndex[data.pickListData.competitionId] = {
                pickList: data.pickListData.pickList,
                crossedOut: data.pickListData.crossedOut
            }
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

    const setCrossedOut = (team: number, value: boolean) => {
        if (!pickListData.crossedOut.includes(team) && value) {
            setPickListData({crossedOut: [...pickListData.crossedOut, team]});
        } else if (pickListData.crossedOut.includes(team) && !value) {
            setPickListData({crossedOut: pickListData.crossedOut.filter(t => t !== team)});
        }
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <StrictModeDroppable droppableId="droppable">
                    {(provided) => (
                        <List ref={provided.innerRef} {...provided.droppableProps}>
                            {pickListData.pickList.map((team, index) => (
                                <DraggableTeamListItem team={team} index={index} key={team} 
                                    crossedOut={pickListData.crossedOut.includes(team)} 
                                    setCrossedOut={(value)=>setCrossedOut(team, value)}
                                />
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

const DraggableTeamListItem = (props: {team: number, index: number, crossedOut: boolean, setCrossedOut: (value: boolean)=>void}) => {
    
    const navigate = useNavigate();
    const settings = useContext(SettingsContext);

    const labelId = `pick-list-label-${props.team}`;
    
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
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                        bgcolor: snapshot.isDragging ? (theme) => theme.palette.action.hover : undefined,
                    }}
                >
                    <ListItemButton role={undefined} disableRipple onClick={()=>navigate(`/analytics/team/${props.team}`)}>
                        <ListItemIcon >
                            <span className="material-symbols-outlined">drag_indicator</span>
                        </ListItemIcon>
                        <ListItemIcon onClick={(e)=>{props.setCrossedOut(!props.crossedOut);e.preventDefault();e.stopPropagation()}}>
                            <Checkbox
                                edge="start"
                                checked={props.crossedOut}
                                tabIndex={-1}
                                inputProps={{ 'aria-labelledby': labelId }}
                                disableRipple
                                checkedIcon={<span className="material-symbols-outlined">close</span>}
                                color="secondary"
                            />
                        </ListItemIcon>
                        <ListItemText id={labelId} primary={
                            <span className={"flex gap-2"+(props.crossedOut ? " strikeout opacity-50" : "")}>
                                <span className="text-secondary">#{props.index + 1}:</span>
                                <b>{props.team}</b>
                                {settings?.starredTeams.includes(props.team) && 
                                    <span className="material-symbols-outlined inline-icon text-yellow-300 scale-75">star</span>
                                }
                            </span>
                        } 
                        className="relative"
                        />
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
}