import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MatchData, MatchEventData } from "../../types/MatchData";
import MatchDatabase from "../../util/MatchDatabase";

export default function AnalyticsMatchPage() {

    const { matchId } = useParams();

    // const [hasLoaded, setHasLoaded] = useState(false);
    // const [matches, setMatches] = useState<MatchData[]>([]);
    // const [events, setEvents] = useState<MatchEventData[]>([]);

    // useEffect(() => {
    //     if (hasLoaded) return;
    //     // Load matches for team
    //     async function loadMatches() {
    //         if (!matchId) return;
    //         const matches = await MatchDatabase.getMatchesByMatchId(matchId);
    //         matches.sort((a, b) => a.matchId.localeCompare(b.matchId));
    //         const events = await MatchDatabase.getEventsByMatch(matchId);
    //         setMatches(matches);
    //         setEvents(events);
    //         setHasLoaded(true);
    //     }
    //     loadMatches();
    // }, [matchId]);
    
    return (
        <>
            <h1 className="text-xl text-center mb-4">Analytics for <b>match {matchId}</b></h1>
            <span>Not done :(</span>
            {/* <div className="w-full max-w-md px-2 flex flex-col items-start">
                <h3 className="text-lg mt-4">Known teams in this match: </h3>
                <ul className="list-disc pl-8">
                    {matches.map(m => m.teamNumber).map((team) => 
                        <li><Link to={'/analytics/team/'+team} key={team} className="text-blue-500 underline">{team}</Link></li>
                    )}
                </ul>
            </div> */}
        </>
    )
}
