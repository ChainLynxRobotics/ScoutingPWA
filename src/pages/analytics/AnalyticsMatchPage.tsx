import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MatchData, MatchEventData } from "../../types/MatchData";
import MatchDatabase from "../../util/MatchDatabase";

export default function AnalyticsMatchPage() {

    const { matchId } = useParams();

    const [hasLoaded, setHasLoaded] = useState(false);
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [events, setEvents] = useState<MatchEventData[]>([]);

    useEffect(() => {
        if (hasLoaded) return;
        // Load matches for team
        async function loadMatches() {
            if (!matchId) return;
            const matches = await MatchDatabase.getMatchesByMatchId(matchId);
            matches.sort((a, b) => a.matchId.localeCompare(b.matchId));
            const events = await MatchDatabase.getEventsByMatch(matchId);
            setMatches(matches);
            setEvents(events);
            setHasLoaded(true);
        }
        loadMatches();
    }, [matchId]);
    
    return (
        <div>
            <h1>AnalyticsMatchPage</h1>
        </div>
    )
}
