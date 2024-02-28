import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MatchData, MatchEventData } from "../types/MatchData";
import MatchDatabase from "../util/MatchDatabase";
import { Button } from "@mui/material";
import MatchEvent from "../enums/MatchEvent";
import AccuracyStatistic from "../components/analytics/AccuracyStatistic";

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

    /**
     * Gets the number of a certain type or types of events that have been saved
     * @param event - Event(s) to look for
     * @returns the number of the events that have been recorded
     */
    function numOfEvents(...eventsToFilter: MatchEvent[]): number {
        return events.filter(e=>eventsToFilter.includes(e.event)).length;
    }
    
    
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
                <h1 className="text-xl text-center mb-4">Analytics for <b>Team {team}</b></h1>
                <div className="w-full max-w-md px-4 flex flex-col items-start">
                    <AccuracyStatistic name="Speaker Accuracy" 
                        value={numOfEvents(MatchEvent.scoreMid, MatchEvent.scoreMidBoost)} 
                        total={numOfEvents(MatchEvent.scoreMid, MatchEvent.scoreMidBoost, MatchEvent.scoreMidFail)}
                    />
                    <AccuracyStatistic name="Amp Accuracy" 
                        value={numOfEvents(MatchEvent.scoreLow, MatchEvent.scoreLowBoost)} 
                        total={numOfEvents(MatchEvent.scoreLow, MatchEvent.scoreLowBoost, MatchEvent.scoreLowFail)}
                    />
                    <AccuracyStatistic name="Trap Accuracy" 
                        value={numOfEvents(MatchEvent.scoreHigh, MatchEvent.scoreHighBoost)} 
                        total={numOfEvents(MatchEvent.scoreHigh, MatchEvent.scoreHighBoost, MatchEvent.scoreHighFail)}
                    />
                    <AccuracyStatistic name="Climbs" 
                        value={matches.filter(m=>m.climb).length} 
                        total={matches.length} 
                    />
                </div>
            </>
        }
    </div>
    )
}

export default AnalyticsPage;