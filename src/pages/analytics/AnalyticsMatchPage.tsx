import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MatchData, MatchEventData } from "../../types/MatchData";
import MatchDatabase from "../../util/MatchDatabase";
import { FormControl, Select, MenuItem } from "@mui/material";

export default function AnalyticsMatchPage() {

    const { matchId } = useParams();
    const navigate = useNavigate();
    const [matchList, setMatchList] = useState<string[]|undefined>(undefined);

    useEffect(() => {
        async function loadMatches() {
            setMatchList(await MatchDatabase.getUniqueMatches());
        }
        loadMatches();
    }, []);

    const [hasLoaded, setHasLoaded] = useState(false);
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [_events, setEvents] = useState<MatchEventData[]>([]);

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
        <>
            <h1 className="text-xl mb-2 flex items-center gap-2">
                <span>Analytics for </span>
                <b>Match </b>
                <FormControl variant="standard" sx={{ minWidth: 120 }}>
                    <Select
                        id="match-select-label"
                        value={matchId}
                        onChange={(e)=>navigate(`/analytics/match/${e.target.value}`)}
                        label="Age"
                    >
                        {matchList ? 
                            matchList.map(m=> 
                                <MenuItem key={m} value={m}>
                                    <div className="flex items-center gap-1">
                                        <b className="text-xl">{m}</b>
                                    </div>
                                </MenuItem>
                            )
                        :
                            <MenuItem value={matchId}><b className="text-xl">{matchId}</b></MenuItem>
                        }
                    </Select>
                </FormControl>
            </h1>

            <a href={`https://www.thebluealliance.com/match/${matchId}`} target="_blank" rel="noreferrer" className="text-sm mb-4 text-blue-400 underline hover:text-blue-500 transition">View on The Blue Alliance</a>
            
            
            <span>Not done :(</span>
            <div className="w-full max-w-md px-2 flex flex-col items-start">
                <h3 className="text-lg mt-4">Known teams in this match: </h3>
                <ul className="list-disc pl-8">
                    {matches.map(m => m.teamNumber).map((team) => 
                        <li key={team}>
                            <Link to={'/analytics/team/'+team} className="text-blue-500 underline">{team}</Link>
                        </li>
                    )}
                </ul>
            </div>
        </>
    )
}
