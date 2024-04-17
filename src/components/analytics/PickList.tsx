import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import SettingsContext from "../context/SettingsContext";
import { DragDropContext, Draggable, DropResult } from "react-beautiful-dnd";
import { StrictModeDroppable } from "../StrickModeDroppable";
import { List, ListItemIcon } from "@mui/material";
import { TeamListItem } from "../../pages/analytics/AnalyticsPage";
import MatchDatabase from "../../util/MatchDatabase";
import useLocalStorageState from "../hooks/localStorageState";

export default function PickList() {
    const settings = useContext(SettingsContext);

    const [pickListIndex, setPickListIndex] = useLocalStorageState<{[key: string]: number[]}>({}, "analyticsPickListIndex"); // Store picklist for each competition id separately

    // Deal with the picklist for the current competition
    const pickList = useMemo(() => {
        if (!settings) return [];
        console.log("PickList", pickListIndex[settings.competitionId] || []);
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

            console.log("Updating pick list index for competition", settings.competitionId, teams);
            
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
            </div>
        </>
    )
}

const DraggableTeamListItem = ({team, index}: {team: number, index: number}) => {
    return (
        <Draggable key={team.toString()} draggableId={team.toString()} index={index}>
            {(provided, snapshot) => (
                <TeamListItem 
                    team={team} 
                    key={team.toString()} 
                    listItemProps={{ 
                        ref: provided.innerRef, 
                        ...provided.draggableProps, 
                        ...provided.dragHandleProps,
                        sx: snapshot.isDragging ? { bgcolor: (theme) => theme.palette.action.hover } : {}
                    }}
                    primaryAction={
                        <ListItemIcon >
                            <span className="material-symbols-outlined">drag_indicator</span>
                        </ListItemIcon>
                    }
                />
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