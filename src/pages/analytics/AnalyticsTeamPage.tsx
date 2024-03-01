import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MatchData, MatchEventData } from "../../types/MatchData";
import MatchDatabase from "../../util/MatchDatabase";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Rating } from "@mui/material";
import ME from "../../enums/MatchEvent";
import AccuracyStatistic from "../../components/analytics/AccuracyStatistic";
import PerMatchStatistic from "../../components/analytics/PerMatchStatistic";
import { PieChart } from "@mui/x-charts";
import HumanPlayerLocation from "../../enums/HumanPlayerLocation";
import Statistic from "../../components/analytics/Statistic";
import ClimbResult from "../../enums/ClimbResult";
import { autoEvents, numOfEvents, perMatchStats, teleopEvents } from "../../util/analyticsUtil";
import Divider from "../../components/Divider";

const AnalyticsPage = () => {

    const { team } = useParams();

    const [hasLoaded, setHasLoaded] = useState(false);
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [events, setEvents] = useState<MatchEventData[]>([]);

    const auto = useMemo(()=>autoEvents(matches, events), [matches, events]);
    const teleop = useMemo(()=>teleopEvents(matches, events), [matches, events]);

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

    if (!hasLoaded) return (<div className="w-full h-full flex items-center justify-center">Loading...</div>);
    return (
        <>
            <h1 className="text-xl text-center mb-4">Analytics for <b>Team {team}</b></h1>
            <div className="w-full max-w-md px-2 flex flex-col items-start">
                
                <Statistic name="Matches Scouted">
                    {matches.length}
                </Statistic>
                
                <Divider />
                
                <h2 className="mt-4 text-xl font-bold">Pre Match:</h2>
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
                
                <Divider />

                <h2 className="mt-4 text-xl font-bold">During Match (Auto):</h2>
                <div className="pl-4 my-4">
                    <AccuracyStatistic name="Pickup Accuracy" 
                        value={numOfEvents(auto, ME.acquireGround, ME.acquireStation)} 
                        total={numOfEvents(auto, ME.acquireGround, ME.acquireStation, ME.acquireFail)} 
                    />
                    <PerMatchStatistic name="└ Attempts Per Match" pl="24px" 
                        {...perMatchStats(matches, auto, ME.acquireGround, ME.acquireStation, ME.acquireFail)}
                    />

                    <div className="h-4"></div>

                    <AccuracyStatistic name="Speaker Accuracy" 
                        value={numOfEvents(auto, ME.scoreMid, ME.scoreMidBoost)} 
                        total={numOfEvents(auto, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                    />
                    <PerMatchStatistic name="└ Attempts Per Match" pl="24px" 
                        {...perMatchStats(matches, auto, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                    />

                    <AccuracyStatistic name="Amp Accuracy" 
                        value={numOfEvents(auto, ME.scoreLow, ME.scoreLowBoost)} 
                        total={numOfEvents(auto, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                    />
                    <PerMatchStatistic name="└ Attempts Per Match" pl="24px" 
                        {...perMatchStats(matches, auto, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                    />

                    <div className="h-4"></div>

                    <AccuracyStatistic name="Leave Autonomous Zone" 
                        value={matches.filter(m=>events.find(e=>e.matchId===m.matchId && e.event===ME.specialAuto)).length} 
                        total={matches.length}
                    />
                </div>

                <Divider />

                <h2 className="mt-4 text-xl font-bold">During Match (Teleop):</h2>
                <div className="pl-4 my-4">
                    <AccuracyStatistic name="Pickup Accuracy" 
                        value={numOfEvents(teleop, ME.acquireGround, ME.acquireStation)} 
                        total={numOfEvents(teleop, ME.acquireGround, ME.acquireStation, ME.acquireFail)} 
                    />
                    <PerMatchStatistic name="└ Attempts Per Match" pl="24px" 
                        {...perMatchStats(matches, teleop, ME.acquireGround, ME.acquireStation, ME.acquireFail)}
                    />

                    <div className="h-4"></div>

                    <AccuracyStatistic name="Speaker Accuracy" 
                        value={numOfEvents(teleop, ME.scoreMid, ME.scoreMidBoost)} 
                        total={numOfEvents(teleop, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                    />
                    <PerMatchStatistic name="└ Attempts Per Match" pl="24px" 
                        {...perMatchStats(matches, teleop, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                    />

                    <AccuracyStatistic name="Amp Accuracy" 
                        value={numOfEvents(teleop, ME.scoreLow, ME.scoreLowBoost)} 
                        total={numOfEvents(teleop, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                    />
                    <PerMatchStatistic name="└ Attempts Per Match" pl="24px" 
                        {...perMatchStats(matches, teleop, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                    />

                    <AccuracyStatistic name="Trap Accuracy" 
                        value={numOfEvents(teleop, ME.scoreHigh, ME.scoreHighBoost)} 
                        total={numOfEvents(teleop, ME.scoreHigh, ME.scoreHighBoost, ME.scoreHighFail)}
                    />
                    <PerMatchStatistic name="└ Attempts Per Match" pl="24px" 
                        {...perMatchStats(matches, teleop, ME.scoreHigh, ME.scoreHighBoost, ME.scoreHighFail)}
                    />

                    <div className="h-4"></div>

                    <AccuracyStatistic name="Attempts to Cooperate" 
                        value={matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.Amp)
                                .filter(m=>events.find(e=>e.matchId===m.matchId && e.event===ME.specialCoop)).length} 
                        total={matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.Amp).length}
                        desc="Only counts for the times this team's human player is at the Amp"
                    />
                </div>

                <Divider />

                <h2 className="mt-4 text-xl font-bold">Post Match:</h2>
                <div className="pl-4 my-4">
                    <AccuracyStatistic name="Climbs" 
                        value={matches.filter(m=>m.climb===ClimbResult.Climb).length} 
                        total={matches.length} 
                    />
                    <AccuracyStatistic name="└ Parks" pl="24px"
                        value={matches.filter(m=>m.climb!==ClimbResult.None).length} 
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
    )
}

export default AnalyticsPage;