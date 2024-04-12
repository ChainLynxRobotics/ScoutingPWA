import { AppBar, Box, Button, Card, Checkbox, FormControl, FormControlLabel, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, Tab, Tabs, TextField, tableCellClasses } from "@mui/material";
import { useContext, useEffect, useMemo, useState } from "react";
import MatchDatabase from "../../util/MatchDatabase";
import { Link, useNavigate } from "react-router-dom";
import Divider from "../../components/Divider";
import matchCompare from "../../util/matchCompare";
import SettingsContext from "../../components/context/SettingsContext";
import useLocalStorageState from "../../util/localStorageState";

const AnalyticsPage = () => {

    const settings = useContext(SettingsContext);

    const [search, setSearch] = useLocalStorageState('', 'analyticsSearch');
    const [tab, setTab] = useState(0);

    const [teamList, setTeamList] = useState<number[]>([]);
    const [matchList, setMatchList] = useState<string[]>([]);
    const [contributors, setContributors] = useState<{[key: string]: number}>({});

    const [analyticsMatchIndex, setAnalyticsMatchIndex] = useLocalStorageState(settings?.currentMatchIndex||0, "analyticsMatchIndex");
    const [currentMatchOnly, setCurrentMatchOnly] = useLocalStorageState(false, "analyticsCurrentMatchOnly");

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
                        <Checkbox value={settings.analyticsCurrentCompetitionOnly} 
                            onChange={(event)=>settings.setAnalyticsCurrentCompetitionOnly(event.target.checked)} />
                    }
                    label="Current Competition Only" 
                    className="mt-4 text-sm text-secondary"
                />
            }
        </div>

        <div className="w-full max-w-md mt-4 bg-black bg-opacity-20">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <AppBar position="static">
                    <Tabs value={tab} onChange={(e,val)=>setTab(val)} variant="fullWidth" aria-label="basic tabs example">
                        <Tab label="Teams" id="analytics-tab-0" aria-controls="analytics-tabpanel-1" />
                        <Tab label="Matches" id="analytics-tab-1" aria-controls="analytics-tabpanel-1" />
                    </Tabs>
                </AppBar>
            </Box>
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
        </div>

        <div className="w-full max-w-md flex flex-col">

            <Divider />

            <h2 className="text-lg font-bold mt-4">Matches Scouted</h2>
            <div className="flex flex-col gap-2 my-4 px-4">
                {Object.entries(contributors).sort((a, b)=>b[1]-a[1]).map((contributor) => (
                    <Card key={contributor[0]} variant="outlined" className="flex justify-between items-center">
                        <div className="text-lg font-bold px-2">{contributor[0]}</div>
                        <div className="text-xl font-cold px-2"><code>{contributor[1]}</code></div>
                    </Card>
                ))}
            </div>
        </div>
    </div>
    )
}

const TeamListItem = ({team}: {team: number}) => {

    const settings = useContext(SettingsContext);
    const navigate = useNavigate();

    const labelId = `team-list-label-${team}`;

    function toggleStarred(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        e.stopPropagation();
        e.preventDefault();
        if (settings) {
            if (settings.starredTeams.includes(team)) {
                settings.setStarredTeams(settings.starredTeams.filter(t=>t!==team));
            } else {
                settings.setStarredTeams([...settings.starredTeams, team]);
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
            onClick={()=>navigate(`/analytics/team/${team}`)}
        >
            <ListItemButton role={undefined}>
                <ListItemIcon onClick={toggleStarred}>
                    <Checkbox
                        edge="start"
                        checked={settings?.starredTeams.indexOf(team) !== -1}
                        tabIndex={-1}
                        inputProps={{ 'aria-labelledby': labelId }}
                        disableRipple
                        icon={<span className="material-symbols-outlined">star_outline</span>}
                        checkedIcon={<span className="material-symbols-outlined">star</span>}
                    />
                </ListItemIcon>
                <ListItemText id={labelId} primary={<b>{team}</b>} />
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

export default AnalyticsPage;