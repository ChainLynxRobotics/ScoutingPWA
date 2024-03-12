import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MatchData, MatchEventData } from "../../types/MatchData";
import MatchDatabase from "../../util/MatchDatabase";
import { Button, Card, CardContent, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Rating, Select, SelectChangeEvent } from "@mui/material";
import ME from "../../enums/MatchEvent";
import AccuracyStatistic from "../../components/analytics/AccuracyStatistic";
import PerMatchStatistic from "../../components/analytics/PerMatchStatistic";
import { PieChart } from "@mui/x-charts";
import HumanPlayerLocation from "../../enums/HumanPlayerLocation";
import Statistic, { StatisticProps } from "../../components/analytics/Statistic";
import ClimbResult from "../../enums/ClimbResult";
import { autoEvents, numOfEvents, perMatchStats, teleopEvents } from "../../util/analyticsUtil";
import matchCompare from "../../util/matchCompare";
import AnalyticsGraph, { AnalyticsGraphFunction } from "../../components/analytics/AnalyticsGraph";
import useLocalStorageState from "../../util/localStorageState";

// Plotting functions that can be selected, the function returns the number of times the event happened per match
const graphOptions: { [key: string]: AnalyticsGraphFunction } = {
    "Note Preloaded": (match, auto, teleop) => match.preload ? 1 : 0,
    "Auto Pickup": (match, auto, teleop) => numOfEvents(auto, ME.acquireGround, ME.acquireStation),
    "Auto Speaker": (match, auto, teleop) => numOfEvents(auto, ME.scoreMid, ME.scoreMidBoost),
    "Auto Amp": (match, auto, teleop) => numOfEvents(auto, ME.scoreLow, ME.scoreLowBoost),
    "Auto Leave Auto Zone": (match, auto, teleop) => match.humanPlayerLocation===HumanPlayerLocation.Amp ? 1 : 0,
    "Teleop Pickup": (match, auto, teleop) => numOfEvents(teleop, ME.acquireGround, ME.acquireStation),
    "Teleop Speaker": (match, auto, teleop) => numOfEvents(teleop, ME.scoreMid, ME.scoreMidBoost),
    "Teleop Amp": (match, auto, teleop) => numOfEvents(teleop, ME.scoreLow, ME.scoreLowBoost),
    "Teleop Trap": (match, auto, teleop) => numOfEvents(teleop, ME.scoreHigh, ME.scoreHighBoost),
    "Cooperate": (match, auto, teleop) => match.humanPlayerLocation===HumanPlayerLocation.Amp ? 1 : 0,
    "Climb": (match, auto, teleop) => match.climb===ClimbResult.Climb ? 1 : 0,
    "Park": (match, auto, teleop) => match.climb!==ClimbResult.None ? 1 : 0,
    "Human Player Scored": (match, auto, teleop) => match.humanPlayerLocation===HumanPlayerLocation.Amp ? match.humanPlayerPerformance : null,
    "Defense": (match, auto, teleop) => match.defense,
}

const graphColors = [
    "#FFC107", "#FF5722", "#E91E63", "#9C27B0", "#3F51B5", "#03A9F4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FF5722", "#795548", "#9E9E9E", "#607D8B"
]

const AnalyticsPage = () => {

    const { team } = useParams();

    const [hasLoaded, setHasLoaded] = useState(false);
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [events, setEvents] = useState<MatchEventData[]>([]);

    const auto = useMemo(()=>autoEvents(matches, events), [matches, events]);
    const teleop = useMemo(()=>teleopEvents(matches, events), [matches, events]);

    const [notesOpen, setNotesOpen] = useState(false);


    const [graphsEnabled, setGraphsEnabled] = useLocalStorageState<string[]>([], "analyticsGraphsEnabled");


    useEffect(() => {
        if (hasLoaded) return;
        // Load matches for team
        async function loadMatches() {
            if (!team) return;
            const matches = await MatchDatabase.getMatchesByTeam(parseInt(team));
            matches.sort((a, b) => matchCompare(a.matchId, b.matchId));
            const events = await MatchDatabase.getEventsByTeam(parseInt(team));
            events.sort((a, b) => a.time - b.time);
            setMatches(matches);
            setEvents(events);
            setHasLoaded(true);
        }
        loadMatches();
    }, [team]);

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

    // Generates graph props for a statistic component
    function graphPropsOf(name: string): StatisticProps["plot"] {
        return {
            name,
            color: graphColors[Object.keys(graphOptions).indexOf(name)],
            enabled: graphsEnabled.includes(name),
            setEnabled: (enabled: boolean) => {
                if (enabled && !graphsEnabled.includes(name)) setGraphsEnabled([...graphsEnabled, name]);
                else if (!enabled && graphsEnabled.includes(name)) setGraphsEnabled(graphsEnabled.filter(n=>n!==name));
            }
        }
    }

    function handleChangeGraphsEnabled(event: SelectChangeEvent<string[]>): void {
        const value = event.target.value;
        setGraphsEnabled(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    }

    if (!hasLoaded) return (<div className="w-full h-full flex items-center justify-center">Loading...</div>);

    return (
        <>
            <h1 className="text-xl text-center mb-4">Analytics for <b>Team {team}</b></h1>
            <Statistic name="Matches Scouted">
                {matches.length}
            </Statistic>
            <div className="text-secondary text-sm">"P.M." = "Per Match"</div>

            <div className="w-full mt-4 px-2 pb-12 flex flex-wrap gap-8 justify-center">
                
                <Card className="w-full max-w-md">
                    <CardContent>
                        <h2 className="text-xl font-bold">Pre Match:</h2>
                        <div className="pl-4 mt-4">
                            <div>Human Player Location:</div>
                            <PieChart
                                series={[{ data: [
                                    { id: 1, value: matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.None).length, label: "Not on Field" },
                                    { id: 2, value: matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.Source).length, label: "Source" },
                                    { id: 3, value: matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.Amp).length, label: "Amp" },
                                ]}]}
                                width={300}
                                height={100}
                            />
                            <AccuracyStatistic name="Note Preloaded" 
                                value={matches.filter(m=>m.preload).length} 
                                total={matches.length} 
                                plot={graphPropsOf("Note Preloaded")}
                            />
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="w-full max-w-md">
                    <CardContent>
                        <h2 className="text-xl font-bold">During Match (Auto):</h2>
                        <div className="pl-4 mt-4">
                            <AccuracyStatistic name="Pickup Accuracy" 
                                value={numOfEvents(auto, ME.acquireGround, ME.acquireStation)} 
                                total={numOfEvents(auto, ME.acquireGround, ME.acquireStation, ME.acquireFail)} 
                                plot={graphPropsOf("Auto Pickup")}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, auto, ME.acquireGround, ME.acquireStation, ME.acquireFail)}
                            />

                            <div className="h-4"></div>

                            <AccuracyStatistic name="Speaker Accuracy" 
                                value={numOfEvents(auto, ME.scoreMid, ME.scoreMidBoost)} 
                                total={numOfEvents(auto, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                                plot={graphPropsOf("Auto Speaker")}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, auto, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                            />

                            <AccuracyStatistic name="Amp Accuracy" 
                                value={numOfEvents(auto, ME.scoreLow, ME.scoreLowBoost)} 
                                total={numOfEvents(auto, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                                plot={graphPropsOf("Auto Amp")}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, auto, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                            />

                            <div className="h-4"></div>

                            <AccuracyStatistic name="Leave Autonomous Zone" 
                                value={matches.filter(m=>events.find(e=>e.matchId===m.matchId && e.event===ME.specialAuto)).length} 
                                total={matches.length}
                                plot={graphPropsOf("Auto Leave Auto Zone")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full max-w-md">
                    <CardContent>
                        <h2 className="text-xl font-bold">During Match (Teleop):</h2>
                        <div className="pl-4 mt-4">
                            <AccuracyStatistic name="Pickup Accuracy" 
                                value={numOfEvents(teleop, ME.acquireGround, ME.acquireStation)} 
                                total={numOfEvents(teleop, ME.acquireGround, ME.acquireStation, ME.acquireFail)} 
                                plot={graphPropsOf("Teleop Pickup")}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, teleop, ME.acquireGround, ME.acquireStation, ME.acquireFail)}
                            />

                            <div className="h-4"></div>

                            <AccuracyStatistic name="Speaker Accuracy" 
                                value={numOfEvents(teleop, ME.scoreMid, ME.scoreMidBoost)} 
                                total={numOfEvents(teleop, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                                plot={graphPropsOf("Teleop Speaker")}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, teleop, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                            />

                            <AccuracyStatistic name="Amp Accuracy" 
                                value={numOfEvents(teleop, ME.scoreLow, ME.scoreLowBoost)} 
                                total={numOfEvents(teleop, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                                plot={graphPropsOf("Teleop Amp")}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, teleop, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                            />

                            <AccuracyStatistic name="Trap Accuracy" 
                                value={numOfEvents(teleop, ME.scoreHigh, ME.scoreHighBoost)} 
                                total={numOfEvents(teleop, ME.scoreHigh, ME.scoreHighBoost, ME.scoreHighFail)}
                                plot={graphPropsOf("Teleop Trap")}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, teleop, ME.scoreHigh, ME.scoreHighBoost, ME.scoreHighFail)}
                            />

                            <div className="h-4"></div>

                            <AccuracyStatistic name="Attempts to Cooperate" 
                                value={matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.Amp)
                                        .filter(m=>events.find(e=>e.matchId===m.matchId && e.event===ME.specialCoop)).length} 
                                total={matches.filter(m=>m.humanPlayerLocation===HumanPlayerLocation.Amp).length}
                                desc="Only counts for the times this team's human player is at the Amp"
                                plot={graphPropsOf("Cooperate")}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full max-w-md">
                    <CardContent>
                        <h2 className="text-xl font-bold">Post Match:</h2>
                        <div className="pl-4 mt-4">
                            <AccuracyStatistic name="Climbs" 
                                value={matches.filter(m=>m.climb===ClimbResult.Climb).length} 
                                total={matches.length} 
                                plot={graphPropsOf("Climb")}
                            />
                            <AccuracyStatistic name="└ Parks" pl="24px"
                                value={matches.filter(m=>m.climb!==ClimbResult.None).length} 
                                total={matches.length} 
                                plot={graphPropsOf("Park")}
                            />
                            <PerMatchStatistic name="Human Player Scored" 
                                desc="The notes scored by the human player at the end of the game. Only counts for the times this team's human player is at the Amp."
                                {...humanPlayerPerformancePerMatch()}
                                plot={graphPropsOf("Human Player Scored")}
                            />
                            <Statistic name="Avg Defense Rating" plot={graphPropsOf("Defense")}>
                                <Rating value={matches.reduce((acc, m)=>acc+m.defense, 0) / matches.length} precision={0.1} readOnly />
                                <span className="text-secondary italic">({Math.round(matches.reduce((acc, m)=>acc+m.defense, 0) / matches.length * 100) / 100})</span>
                            </Statistic>
                            <div className="h-4"></div>
                            <Button onClick={()=>setNotesOpen(true)} variant="contained" color="secondary">View Notes</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full max-w-md">
                    <CardContent>
                        <h2 className="text-xl font-bold">Per match analysis:</h2>
                        <div className="w-full flex flex-col gap-6 mt-4">
                            <AnalyticsGraph 
                                matches={matches} 
                                autoEvents={auto} 
                                teleopEvents={teleop} 
                                functions={Object.keys(graphOptions)
                                    .filter(name=>graphsEnabled.includes(name))
                                    .reduce((acc, key)=>({...acc, [key]: graphOptions[key]}), {})
                                }
                                colors={Object.keys(graphOptions)
                                    .filter(name=>graphsEnabled.includes(name))
                                    .reduce((acc, key)=>({...acc, [key]: graphColors[Object.keys(graphOptions).indexOf(key)]}), {})
                                }
                            />
                            <FormControl fullWidth>
                                <InputLabel id="graph-multiple-checkbox-label">Show Graphs</InputLabel>
                                <Select
                                    labelId="graph-multiple-checkbox-label"
                                    id="graph-multiple-checkbox"
                                    multiple
                                    value={graphsEnabled}
                                    onChange={handleChangeGraphsEnabled}
                                    input={<OutlinedInput label="Show Graphs" />}
                                    renderValue={(selected) => selected.join(', ')}
                                >
                                {Object.keys(graphOptions).map((name) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={graphsEnabled.indexOf(name) > -1} />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                        </div>
                    </CardContent>
                </Card>

            </div>

            <Dialog 
                open={notesOpen} 
                onClose={()=>setNotesOpen(false)}
                aria-labelledby="info-dialog-title"
                fullScreen
            >
                <DialogTitle id="info-dialog-title">Notes given to team {team}</DialogTitle>
                <DialogContent>
                    <div className="w-full max-w-lg flex flex-col gap-8">
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