import { Button, Card, TextField } from "@mui/material";
import useLocalStorageState from "../util/localStorageState";
import { useEffect, useState } from "react";
import MatchDatabase from "../util/MatchDatabase";
import { Link } from "react-router-dom";

const AnalyticsPage = () => {

    const [search, setSearch] = useLocalStorageState(0, 'analyticsSearch');

    const [teamList, setTeamList] = useState<number[]>([]);

    useEffect(() => {
        MatchDatabase.getAllTeams().then(setTeamList);
    }, []);

    return (
    <div className="w-full h-full flex flex-col items-center relative">
        <h1 className="text-xl text-center mb-4 pt-4 font-bold">Analytics</h1>
        <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">search</span>
            <TextField 
                id="team-search"
                label="Team #"
                type="number"
                size="small"
                value={search || ''} 
                onChange={(e)=>setSearch(Math.min(Math.max(parseInt(e.target.value), 0), 9999))}
            />
        </div>
        <div className="w-full max-w-md flex flex-col">
            <div className="flex flex-col my-4 px-4">
                {teamList.map((team) => (
                    <Link to={`/analytics/${team}`} key={team} style={{display: search && !team.toString().includes(search.toString()) ? 'none': ''}}>
                        <Card variant="outlined" className="flex justify-between items-center">
                            <div className="text-lg font-bold px-2">{team}</div>
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