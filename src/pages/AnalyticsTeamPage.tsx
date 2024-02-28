import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MatchData, MatchEventData } from "../types/MatchData";
import MatchDatabase from "../util/MatchDatabase";
import { Button } from "@mui/material";

const AnalyticsPage = () => {

    const { team } = useParams();
    const navigate = useNavigate();

    const [hasLoaded, setHasLoaded] = useState(false);
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [events, setEvents] = useState<MatchEventData[]>([]);

    useEffect(() => {
        if (hasLoaded) return;
        // Load matches for team
        async function loadMatches() {
            if (!team) return;
            const matches = await MatchDatabase.getMatchesByTeam(parseInt(team));
            matches.sort((a, b) => a.matchId.localeCompare(b.matchId));
            const events = await MatchDatabase.getEventsByTeam(parseInt(team));
            setMatches(matches);
            setEvents(events);
            setHasLoaded(true);
        }
        loadMatches();
    }, [team]);

    if (!hasLoaded) return (<div className="w-full h-full flex items-center justify-center">Loading...</div>);

    
    
    
    return (
    <div className="w-full h-full flex flex-col items-center relative">
        <div className="w-full max-w-md flex justify-start">
            <Button 
                onClick={()=>navigate(-1)} 
                color="secondary"
                sx={{padding: '12px'}}
                startIcon={<span className="material-symbols-outlined">arrow_back_ios</span>}
            >Back</Button>
        </div>
        { !hasLoaded ? 
            <div className="w-full h-full flex items-center justify-center">Loading...</div>
        :
            <>
                <h1 className="text-xl text-center mb-4 font-bold">Analytics for Team {team}</h1>
            </>
        }
    </div>
    )
}

export default AnalyticsPage;