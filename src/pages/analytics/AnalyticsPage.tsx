import { Button, Card, TextField } from "@mui/material";
import useLocalStorageState from "../../util/localStorageState";
import { useEffect, useState } from "react";
import MatchDatabase from "../../util/MatchDatabase";
import { Link } from "react-router-dom";
import Divider from "../../components/Divider";

const AnalyticsPage = () => {

    const [search, setSearch] = useLocalStorageState('', 'analyticsSearch');

    const [teamList, setTeamList] = useState<number[]>([]);
    const [matchList, setMatchList] = useState<string[]>([]);

    useEffect(() => {
        MatchDatabase.getUniqueTeams().then(setTeamList);
        MatchDatabase.getUniqueMatches().then(setMatchList);
    }, []);

    return (
    <div className="w-full h-full flex flex-col items-center relative">
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
            <h2 className="text-lg font-bold">Teams</h2>
            <div className="flex flex-col my-4 px-4">
                {teamList.map((team) => (
                    <Link to={`/analytics/team/${team}`} key={team} style={{display: search && !team.toString().includes(search) ? 'none': ''}}>
                        <Card variant="outlined" className="flex justify-between items-center">
                            <div className="text-lg font-bold px-2">{team}</div>
                            <Button endIcon={<span className="material-symbols-outlined">navigate_next</span>}>View</Button>
                        </Card>
                    </Link>
                ))}
            </div>
            <Divider />
            <h2 className="text-lg font-bold">Matches</h2>
            <div className="flex flex-col my-4 px-4">
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