import { Button, Card, Checkbox, FormControl, FormControlLabel, MenuItem, Select, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import MatchDatabase from "../../util/MatchDatabase";
import { Link } from "react-router-dom";
import Divider from "../../components/Divider";
import matchCompare from "../../util/matchCompare";
import SettingsContext from "../../components/context/SettingsContext";
import useLocalStorageState from "../../util/localStorageState";

const AnalyticsPage = () => {

    const settings = useContext(SettingsContext);

    const [search, setSearch] = useLocalStorageState('', 'analyticsSearch');

    const [teamList, setTeamList] = useState<number[]>([]);
    const [matchList, setMatchList] = useState<string[]>([]);
    const [contributors, setContributors] = useState<{[key: string]: number}>({});

    const [analyticsMatchIndex, setAnalyticsMatchIndex] = useLocalStorageState(settings?.currentMatchIndex||0, "analyticsMatchIndex");

    const analyticsCompetition = settings?.analyticsCurrentCompetitionOnly ? settings?.competitionId : undefined;
    useEffect(() => {
        MatchDatabase.getUniqueTeams(analyticsCompetition).then(setTeamList);
        MatchDatabase.getUniqueMatches(analyticsCompetition).then((matches)=>setMatchList(matches.sort(matchCompare)));
        MatchDatabase.getContributions(analyticsCompetition).then((contributors)=>setContributors(contributors));
    }, [analyticsCompetition]);

    function setCurrentMatch(matchId: string) {
        if (!settings) return;
        let index = settings.matches.findIndex(match=>match.matchId===matchId);
        if (index!==-1) setAnalyticsMatchIndex(index);
    }

    function teamsInCurrentMatch() {
        if (!settings) return [];
        const match = settings.matches[analyticsMatchIndex] || [];
        const teams = [match.blue1, match.blue2, match.blue3, match.red1, match.red2, match.red3]
        return teams.filter(team=>teamList.includes(team));
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
                        <Checkbox value={settings.analyticsCurrentCompetitionOnly} 
                            onChange={(event)=>settings.setAnalyticsCurrentCompetitionOnly(event.target.checked)} />
                    }
                    label="Current Competition Only" 
                    className="mt-4 text-sm text-secondary"
                />
            }
        </div>
        <div className="w-full max-w-md flex flex-col">

            <h2 className="text-lg font-bold mt-4">Starred Teams</h2>
            <TeamList teams={teamList.filter(team=>settings?.starredTeams.includes(team))} search={search} />

            <Divider />

            <h2 className="text-lg font-bold mt-4">
                <span>Teams in match </span>
                <FormControl variant="standard">
                    <Select
                        labelId="match-select-label"
                        id="match-select"
                        value={settings?.matches[analyticsMatchIndex]?.matchId}
                        onChange={(event) => setCurrentMatch(event.target.value)}
                        label="Select Match">
                        {settings?.matches.map((match) => {
                            return <MenuItem key={match.matchId} value={match.matchId}><b>{match.matchId}</b></MenuItem>;
                        })}
                    </Select>
                </FormControl>
            </h2>
            <TeamList teams={teamsInCurrentMatch()} search={search} colored />

            <Divider />

            <h2 className="text-lg font-bold mt-4">All Teams</h2>
            <TeamList teams={teamList} search={search} />

            <Divider />

            <h2 className="text-lg font-bold mt-4">Matches</h2>
            <div className="flex flex-col gap-2 my-4 px-4">
                {matchList.map((match) => (
                    <Link to={`/analytics/match/${match}`} key={match} style={{display: search && !match.includes(search) ? 'none': ''}}>
                        <Card variant="outlined" className="flex justify-between items-center">
                            <div className="text-lg font-bold px-2">{match}</div>
                            <Button endIcon={<span className="material-symbols-outlined">navigate_next</span>}>View</Button>
                        </Card>
                    </Link>
                ))}
            </div>

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

const TeamList = ({teams, search, colored}: {teams: number[], search: string, colored?: boolean}) => {

    const settings = useContext(SettingsContext);

    function starTeam(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, team: number) {
        e.stopPropagation();
        e.preventDefault();
        if (settings) {
            settings.setStarredTeams([...settings.starredTeams, team]);
        }
    }

    function unstarTeam(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, team: number) {
        e.stopPropagation();
        e.preventDefault();
        if (settings) {
            settings.setStarredTeams(settings.starredTeams.filter(t=>t!==team));
        }
    }

    return (
        <div className="flex flex-col gap-2 my-4 px-4">
            {teams.map((team, i) => (
                <Link to={`/analytics/team/${team}`} key={team} style={{display: search && !team.toString().includes(search) ? 'none': ''}}>
                    <Card variant="outlined" className="flex justify-between items-center">
                        <div className="flex items-center gap-2 px-2">
                            <b className={"text-xl" + (colored ? (i <= 2 ? ' text-blue-400' : ' text-red-400') : '')}>{team}</b>
                            {settings?.starredTeams.includes(team) ?
                                <button onClick={(e)=>unstarTeam(e, team)} className="material-symbols-outlined text-yellow-300" style={{fontSize: "20px"}}>star</button>
                                :
                                <button onClick={(e)=>starTeam(e, team)} className="material-symbols-outlined text-secondary opacity-50 hover:text-yellow-300" style={{fontSize: "20px"}}>star</button>
                            }
                        </div>
                        <Button endIcon={<span className="material-symbols-outlined">navigate_next</span>}>View</Button>
                    </Card>
                </Link>
            ))}
            {teams.length===0 &&
                <div className="text-center text-secondary">No teams</div>
            }
        </div>
    )
}

export default AnalyticsPage;