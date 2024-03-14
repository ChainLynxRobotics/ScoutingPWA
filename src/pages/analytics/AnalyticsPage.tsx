import { Button, Card, TextField } from "@mui/material";
import useLocalStorageState from "../../util/localStorageState";
import { useContext, useEffect, useState } from "react";
import MatchDatabase from "../../util/MatchDatabase";
import { Link } from "react-router-dom";
import Divider from "../../components/Divider";
import matchCompare from "../../util/matchCompare";
import SettingsContext from "../../components/context/SettingsContext";

const AnalyticsPage = () => {

    const settings = useContext(SettingsContext);

    const [search, setSearch] = useLocalStorageState('', 'analyticsSearch');

    const [teamList, setTeamList] = useState<number[]>([]);
    const [matchList, setMatchList] = useState<string[]>([]);

    useEffect(() => {
        MatchDatabase.getUniqueTeams().then(setTeamList);
        MatchDatabase.getUniqueMatches().then((matches)=>setMatchList(matches.sort(matchCompare)));
    }, []);

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
        <div className="w-full max-w-md flex flex-col">

            <h2 className="text-lg font-bold mt-4">Starred Teams</h2>
            <div className="flex flex-col gap-2 my-4 px-4">
                {teamList.filter(team=>settings?.starredTeams.includes(team)).map((team) => (
                    <Link to={`/analytics/team/${team}`} key={team} style={{display: search && !team.toString().includes(search) ? 'none': ''}}>
                        <Card variant="outlined" className="flex justify-between items-center">
                            <div className="flex items-center gap-2 px-2">
                                <b className="text-xl">{team}</b>
                                <button onClick={(e)=>unstarTeam(e, team)} className="material-symbols-outlined text-yellow-300" style={{fontSize: "20px"}}>star</button>
                            </div>
                            <Button endIcon={<span className="material-symbols-outlined">navigate_next</span>}>View</Button>
                        </Card>
                    </Link>
                ))}
                {settings!.starredTeams.length===0 &&
                    <div className="text-center text-secondary">No starred teams</div>
                }
            </div>

            <Divider />

            <h2 className="text-lg font-bold mt-4">All Teams</h2>
            <div className="flex flex-col gap-2 my-4 px-4">
                {teamList.map((team) => (
                    <Link to={`/analytics/team/${team}`} key={team} style={{display: search && !team.toString().includes(search) ? 'none': ''}}>
                        <Card variant="outlined" className="flex justify-between items-center">
                            <div className="flex items-center gap-2 px-2">
                                <b className="text-xl">{team}</b>
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
            </div>

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
        </div>
    </div>
    )
}

export default AnalyticsPage;