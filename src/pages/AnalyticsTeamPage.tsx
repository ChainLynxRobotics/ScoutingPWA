import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MatchData, MatchEventData } from "../types/MatchData";
import MatchDatabase from "../util/MatchDatabase";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Rating } from "@mui/material";
import ME from "../enums/MatchEvent";
import AccuracyStatistic from "../components/analytics/AccuracyStatistic";
import PerMatchStatistic from "../components/analytics/PerMatchStatistic";
import { PieChart } from "@mui/x-charts";
import HumanPlayerLocation from "../enums/HumanPlayerLocation";
import Statistic from "../components/analytics/Statistic";

const AnalyticsPage = () => {

    const { team } = useParams();
    const navigate = useNavigate();

    const [hasLoaded, setHasLoaded] = useState(false);
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [events, setEvents] = useState<MatchEventData[]>([]);

    const [notesOpen, setNotesOpen] = useState(false);

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
    function numOfEvents(...eventsToFilter: ME[]): number {
        return events.filter(e=>eventsToFilter.includes(e.event)).length;
    }

    /**
     * Gets the average, minimum, and maximum number of events per match
     * @param eventsToFilter - Event(s) to look for
     * @returns the average, minimum, and maximum number of events per match
     */
    function perMatchStats(...eventsToFilter: ME[]): {avg: number, min: number, max: number} {
        var sum = 0, min = Infinity, max = 0, total = 0;
        matches.forEach(match=> {
            const count = events.filter(e=>match.matchId===e.matchId).filter(e=>eventsToFilter.includes(e.event)).length;
            sum += count;
            if (count < min) min = count;
            if (count > max) max = count;
            total++;
        })
        if (total == 0) return {avg: NaN, min: 0, max: 0}
        return {avg: sum/matches.length, min, max};
    }


    function humanPlayerPerformancePerMatch(): {avg: number, min: number, max: number} {
        var sum = 0, min = 0, max = 0, total = 0;
        matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.Amp).forEach(match=> {
            const count = match.humanPlayerPerformance;
            sum += count;
            if (count < min) min = count;
            if (count > max) max = count;
            total++;
        })
        if (total == 0) return {avg: NaN, min: 0, max: 0}
        return {avg: sum/matches.length, min, max};
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
                <div className="w-full max-w-md px-2 flex flex-col items-start">
                    
                    
                    <h2 className="text-lg font-bold">Pre Match:</h2>
                    <div className="flex flex-col items-center my-2">
                        <div>Human Player Location</div>
                        <PieChart
                            series={[{ data: [
                                { id: 1, value: matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.None).length, label: "Not on Field" },
                                { id: 2, value: matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.Source).length, label: "Source" },
                                { id: 3, value: matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.Amp).length, label: "Amp" },
                            ]}]}
                            width={300}
                            height={100}
                        />
                    </div>
                    <div className="pl-4">
                        <AccuracyStatistic name="Note Preloaded" 
                            value={matches.filter(m=>m.preload).length} 
                            total={matches.length} 
                        />
                    </div>


                    <h2 className="mt-8 text-xl font-bold">During Match:</h2>
                    <div className="pl-4 my-4">
                        <AccuracyStatistic name="Pickup Accuracy" 
                            value={numOfEvents(ME.acquireGround, ME.acquireStation)} 
                            total={numOfEvents(ME.acquireGround, ME.acquireStation, ME.acquireFail)} 
                        />
                        <PerMatchStatistic name="└ Attempts Per Match" pl="24px" {...perMatchStats(ME.acquireGround, ME.acquireStation, ME.acquireFail)} />
                        <div className="h-4"></div>
                        <AccuracyStatistic name="Speaker Accuracy" 
                            value={numOfEvents(ME.scoreMid, ME.scoreMidBoost)} 
                            total={numOfEvents(ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                        />
                        <PerMatchStatistic name="└ Attempts Per Match" pl="24px" {...perMatchStats(ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)} />
                        <AccuracyStatistic name="Amp Accuracy" 
                            value={numOfEvents(ME.scoreLow, ME.scoreLowBoost)} 
                            total={numOfEvents(ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                        />
                        <PerMatchStatistic name="└ Attempts Per Match" pl="24px" {...perMatchStats(ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)} />
                        <AccuracyStatistic name="Trap Accuracy" 
                            value={numOfEvents(ME.scoreHigh, ME.scoreHighBoost)} 
                            total={numOfEvents(ME.scoreHigh, ME.scoreHighBoost, ME.scoreHighFail)}
                        />
                        <PerMatchStatistic name="└ Attempts Per Match" pl="24px" {...perMatchStats(ME.scoreHigh, ME.scoreHighBoost, ME.scoreHighFail)} />
                        <div className="h-4"></div>
                        <AccuracyStatistic name="Leave Autonomous Zone" 
                            value={matches.filter(m=>events.find(e=>e.matchId===m.matchId && e.event===ME.specialAuto)).length} 
                            total={matches.length}
                        />
                        <AccuracyStatistic name="Attempts to Cooperate" 
                            value={matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.Amp)
                                    .filter(m=>events.find(e=>e.matchId===m.matchId && e.event===ME.specialCoop)).length} 
                            total={matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.Amp).length}
                            desc="Only counts for the times this team's human player is at the Amp"
                        />
                    </div>

                    <h2 className="mt-4 text-xl font-bold">Post Match:</h2>
                    <div className="pl-4 my-4">
                        <AccuracyStatistic name="Climbs" 
                            value={matches.filter(m=>m.climb).length} 
                            total={matches.length} 
                        />
                        <PerMatchStatistic name="Human Player Scored" 
                            desc="The notes scored by the human player at the end of the game. Only counts for the times this team's human player is at the Amp."
                            {...humanPlayerPerformancePerMatch()}
                        />
                        <Statistic name="Average Defense Rating">
                            <Rating value={matches.reduce((acc, m)=>acc+m.defense, 0) / matches.length} precision={0.1} readOnly />
                            <span className="text-secondary italic">({Math.round(matches.reduce((acc, m)=>acc+m.defense, 0) / matches.length * 100) / 100})</span>
                        </Statistic>
                        <div className="h-4"></div>
                        <Button onClick={()=>setNotesOpen(true)} variant="contained" color="secondary">View Notes</Button>
                    </div>
                </div>
                <Dialog 
                    open={notesOpen} 
                    onClose={()=>setNotesOpen(false)}
                    aria-labelledby="info-dialog-title"
                    fullScreen
                >
                    <DialogTitle id="info-dialog-title">Notes given to team {team}</DialogTitle>
                    <DialogContent>
                        <div>
                            {matches.filter(m=>m.notes.trim()).map(match=>
                                <div key={match.matchId}>
                                    <div>Notes during <b>{match.matchId}</b>:</div>
                                    <textarea className="ml-2 p-1 w-full italic h-32 text-white bg-black bg-opacity-20 resize-none" disabled value={match.notes} />
                                </div>
                            )}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={()=>setNotesOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </>
        }
    </div>
    )
}

export default AnalyticsPage;