import { AppBar, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemProps, ListItemText, MenuItem, Paper, Select, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField } from "@mui/material";
import { ReactElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import MatchDatabase from "../../util/MatchDatabase";
import { useNavigate } from "react-router-dom";
import matchCompare from "../../util/matchCompare";
import SettingsContext from "../../components/context/SettingsContext";
import useLocalStorageState from "../../components/hooks/localStorageState";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { StrictModeDroppable } from "../../components/StrickModeDroppable";

const AnalyticsPage = () => {

    const settings = useContext(SettingsContext);

    const [search, setSearch] = useLocalStorageState('', 'analyticsSearch');
    const [tab, setTab] = useLocalStorageState(0, 'analyticsTab');
    const [contributorsOpen, setContributorsOpen] = useState<boolean>(false);

    const [teamList, setTeamList] = useState<number[]>([]);
    const [matchList, setMatchList] = useState<string[]>([]);
    const [contributors, setContributors] = useState<{[key: string]: number}>({});

    const [analyticsMatchIndex, setAnalyticsMatchIndex] = useLocalStorageState(settings?.currentMatchIndex||0, "analyticsMatchIndex");
    const [currentMatchOnly, setCurrentMatchOnly] = useLocalStorageState(false, "analyticsCurrentMatchOnly");

    const [pickListIndex, setPickListIndex] = useLocalStorageState<{[key: string]: number[]}>({}, "analyticsPickListIndex"); // Store picklist for each competition id separately

    useEffect(() => {
        const analyticsCompetition = settings?.analyticsCurrentCompetitionOnly ? settings?.competitionId : undefined;

        MatchDatabase.getUniqueTeams(analyticsCompetition).then(setTeamList);
        MatchDatabase.getUniqueMatches(analyticsCompetition).then((matches)=>setMatchList(matches.sort(matchCompare)));
        MatchDatabase.getContributions(analyticsCompetition).then((contributors)=>setContributors(contributors));

    }, [settings?.analyticsCurrentCompetitionOnly, settings?.competitionId]);

    function setCurrentMatch(matchId: string) {
        if (!settings) return;
        const index = settings.matches.findIndex(match=>match.matchId===matchId);
        if (index!==-1) setAnalyticsMatchIndex(index);
    }

    const teamsInCurrentMatch = useMemo(() => {
        if (!settings) return [];
        const match = settings.matches[analyticsMatchIndex] || [];
        const teams = [match.blue1, match.blue2, match.blue3, match.red1, match.red2, match.red3]
        return teams.filter(team=>teamList.includes(team));
    }, [analyticsMatchIndex, settings, teamList]);

    const sortedTeamList = useMemo(() => {
        let list = teamList.filter(team=>team.toString().includes(search));
        if (currentMatchOnly) {
            list = list.filter(team=>teamsInCurrentMatch.includes(team));
        }
        return list.sort((a, b)=>
            settings?.starredTeams.includes(a) === settings?.starredTeams.includes(b) ? a-b : settings?.starredTeams.includes(a) ? -1 : 1
        );
    }, [teamList, search, currentMatchOnly, settings?.starredTeams, teamsInCurrentMatch]);


    // Pick List Stuff
    const hasUpdatedPickListIndex = useRef(false);
    const updatePickListIndexTeams = useCallback(async () => {
        if (hasUpdatedPickListIndex.current) return;
        if (!settings) return;
        if (teamList.length == 0) return;

        hasUpdatedPickListIndex.current = true;

        var teams = settings.analyticsCurrentCompetitionOnly ? teamList : await MatchDatabase.getUniqueTeams(settings.competitionId);

        console.log("Updating pick list index for competition", settings.competitionId, teams);
        
        const newPickListIndex = {...pickListIndex, [settings.competitionId]: [...new Set([...(pickListIndex[settings.competitionId] || []), ...teams])]};
        setPickListIndex(newPickListIndex);
    }, [settings?.competitionId, settings?.analyticsCurrentCompetitionOnly, teamList]);

    useEffect(()=>{
        updatePickListIndexTeams();
    }, [updatePickListIndexTeams]);

    const pickList = useMemo(() => {
        if (!settings) return [];
        return pickListIndex[settings.competitionId] || [];
    }, [pickListIndex, settings?.competitionId]);

    const setPickList = useCallback((teams: number[]) => {
        if (!settings) return;
        const newPickListIndex = {...pickListIndex, [settings.competitionId]: teams};
        setPickListIndex(newPickListIndex);
    }, [pickListIndex, settings?.competitionId]);

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
    <div className="w-full h-full px-4 flex flex-col items-center relative">
        <h1 className="text-xl text-center mb-4 pt-4 font-bold">Analytics</h1>
        <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">search</span>
            <TextField 
                id="search"
                label="Team # or Match ID"
                size="small"
                value={search || ''} 
                onChange={(e)=>setSearch(e.target.value)}
            />
        </div>
        <div className="flex items-center text-center">
            {settings && 
                <FormControlLabel 
                    control={
                        <Checkbox checked={settings.analyticsCurrentCompetitionOnly} 
                            onChange={(event)=>settings.setAnalyticsCurrentCompetitionOnly(event.target.checked)} />
                    }
                    label="Current Competition Only" 
                    className="mt-4 text-sm text-secondary"
                />
            }
        </div>
        <div className="flex items-center text-center">
            {settings && 
                <FormControlLabel 
                    control={
                        <Checkbox checked={currentMatchOnly} 
                            onChange={(event, checked)=>setCurrentMatchOnly(checked)} />
                    }
                    label={
                        <span>
                            Teams in this match: &nbsp;
                            <Select
                                variant="standard"
                                labelId="match-select-label"
                                id="match-select"
                                value={settings?.matches[analyticsMatchIndex]?.matchId}
                                onChange={(event) => setCurrentMatch(event.target.value)}
                                label="Select Match">
                                {settings?.matches.map((match) => (
                                    <MenuItem key={match.matchId} value={match.matchId}><b>{match.matchId}</b></MenuItem>
                                ))}
                            </Select>
                        </span>
                    }
                    className="text-sm text-secondary"
                />
            }
        </div>

        <div className="w-full max-w-md mt-4 bg-black bg-opacity-20">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }} component={Paper}>
                <AppBar position="static">
                    <Tabs value={tab} onChange={(e,val)=>setTab(val)} variant="fullWidth" aria-label="basic tabs example">
                        <Tab label="Teams" id="analytics-tab-0" aria-controls="analytics-tabpanel-0" />
                        <Tab label="Matches" id="analytics-tab-1" aria-controls="analytics-tabpanel-1" />
                        <Tab label="Pick List" id="analytics-tab-2" aria-controls="analytics-tabpanel-2" />
                    </Tabs>
                </AppBar>
                <div role="tabpanel" hidden={tab!==0} id="analytics-tabpanel-0" aria-labelledby="analytics-tab-0">
                    <List>
                        {sortedTeamList.map((team) => (
                            <TeamListItem team={team} key={team} />
                        ))}
                        {sortedTeamList.length===0 &&
                            <div className="text-center text-secondary my-4">No teams</div>
                        }
                    </List>
                </div>
                <div role="tabpanel" hidden={tab!==1} id="analytics-tabpanel-1" aria-labelledby="analytics-tab-1">
                    <List>
                        {matchList.map((matchId) => (
                            <MatchListItem matchId={matchId} key={matchId} />
                        ))}
                        {matchList.length===0 &&
                            <div className="text-center text-secondary my-4">No matches</div>
                        }
                    </List>
                </div>
                <div role="tabpanel" hidden={tab!==2} id="analytics-tabpanel-2" aria-labelledby="analytics-tab-2">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <StrictModeDroppable droppableId="droppable">
                            {(provided, snapshot) => (
                                    <List ref={provided.innerRef} {...provided.droppableProps}>
                                        {pickList.map((team, index) => (
                                            <Draggable key={team.toString()} draggableId={team.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <TeamListItem 
                                                        team={team} 
                                                        key={team.toString()} 
                                                        listItemProps={{ 
                                                            ref: provided.innerRef, 
                                                            ...provided.draggableProps, 
                                                            ...provided.dragHandleProps,
                                                        }}
                                                        primaryAction={
                                                            <ListItemIcon >
                                                                <span className="material-symbols-outlined">drag_indicator</span>
                                                            </ListItemIcon>
                                                        }
                                                    />
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </List>
                            )}
                        </StrictModeDroppable>
                    </DragDropContext>
                </div>
            </Box>
        </div>

        <div className="py-8">
            <Button variant="contained" color="secondary" onClick={()=>setContributorsOpen(true)}>Scouter Statistics</Button>
        </div>

        <Dialog 
            open={contributorsOpen} 
            onClose={()=>setContributorsOpen(false)}
            aria-labelledby="contributors-dialog-title"
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle id="contributors-dialog-title">Scouter Statistics</DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table aria-label="Contributors list">
                        <TableHead>
                            <TableRow>
                                <TableCell>Scout Name</TableCell>
                                <TableCell align="right">Matches Scouted</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(contributors).sort((a, b)=>b[1]-a[1]).map((row) => (
                                <TableRow
                                    key={row[0]}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">{row[0]}</TableCell>
                                    <TableCell align="right">{row[1]}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>setContributorsOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
    </div>
    )
}

const TeamListItem = (props: {team: number, primaryAction?: ReactElement, listItemProps?: ListItemProps}) => {

    const settings = useContext(SettingsContext);
    const navigate = useNavigate();

    const labelId = `team-list-label-${props.team}`;

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
        <ListItem
            secondaryAction={
                <IconButton edge="end" aria-label="expand">
                    <span className="material-symbols-outlined">navigate_next</span>
                </IconButton>
            }
            disablePadding
            onClick={()=>navigate(`/analytics/team/${props.team}`)}
            {...props.listItemProps}
        >
            <ListItemButton role={undefined}>
                {props.primaryAction}
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
                <ListItemText id={labelId} primary={<b>{props.team}</b>} />
            </ListItemButton>
        </ListItem>
    )
}

const MatchListItem = ({matchId}: {matchId: string}) => {

    const navigate = useNavigate();

    const labelId = `match-list-label-${matchId}`;

    return (
        <ListItem
            secondaryAction={
                <IconButton edge="end" aria-label="expand">
                    <span className="material-symbols-outlined">navigate_next</span>
                </IconButton>
            }
            disablePadding
            onClick={()=>navigate(`/analytics/match/${matchId}`)}
        >
            <ListItemButton role={undefined}>
                <ListItemText id={labelId} primary={<b>{matchId}</b>} />
            </ListItemButton>
        </ListItem>
    )
}

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
  
    return result;
};

export default AnalyticsPage;