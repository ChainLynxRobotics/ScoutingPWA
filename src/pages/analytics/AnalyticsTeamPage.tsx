import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { autoEvents, numOfEvents, perMatchStats, teleopEvents } from "../../util/analytics/analyticsUtil";
import matchCompare from "../../util/matchCompare";
import PerMatchGraph from "../../components/analytics/PerMatchGraph";
import useLocalStorageState from "../../util/localStorageState";
import plotFunctions, { PlotDefinition } from "../../util/analytics/analyticsPlotFunctions";
import PerMatchScatterPlot from "../../components/analytics/PerMatchScatterPlot";
import SettingsContext from "../../components/context/SettingsContext";

const AnalyticsPage = () => {

    const { team } = useParams();
    const navigate = useNavigate();
    const [teamList, setTeamList] = useState<number[]|undefined>(undefined);

    const settings = useContext(SettingsContext);

    useEffect(() => {
        async function loadTeams() {
            setTeamList(await MatchDatabase.getUniqueTeams());
        }
        loadTeams();
    }, []);

    const [hasLoaded, setHasLoaded] = useState<string|undefined>(undefined);
    const [matches, setMatches] = useState<MatchData[]>([]);
    const [events, setEvents] = useState<MatchEventData[]>([]);

    const auto = useMemo(()=>autoEvents(matches, events), [matches, events]);
    const teleop = useMemo(()=>teleopEvents(matches, events), [matches, events]);

    const [notesOpen, setNotesOpen] = useState(false);


    const [plotsEnabled, setPlotsEnabled] = useLocalStorageState<string[]>([], "analyticsPlotsEnabled");


    useEffect(() => {
        if (hasLoaded===team) return;
        // Load matches for team
        async function loadMatches() {
            if (!team) return;
            const matches = await MatchDatabase.getMatchesByTeam(parseInt(team));
            matches.sort((a, b) => matchCompare(a.matchId, b.matchId));
            const events = await MatchDatabase.getEventsByTeam(parseInt(team));
            events.sort((a, b) => a.time - b.time);
            setMatches(matches);
            setEvents(events);
            setHasLoaded(team);
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

    // Generates plot props for a statistic component
    function plotPropsOf(plot: PlotDefinition): StatisticProps["plot"] {
        return {
            name: plot.name,
            color: plot.color,
            enabled: plotsEnabled.includes(plot.name),
            setEnabled: (enabled: boolean) => {
                if (enabled && !plotsEnabled.includes(plot.name)) setPlotsEnabled([...plotsEnabled, plot.name]);
                else if (!enabled && plotsEnabled.includes(plot.name)) setPlotsEnabled(plotsEnabled.filter(n=>n!==plot.name));
            }
        }
    }

    function handleChangePlotsEnabled(event: SelectChangeEvent<string[]>): void {
        const value = event.target.value;
        setPlotsEnabled(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    }

    return (
        <>
            <h1 className="text-xl mb-2 flex items-center gap-2">
                <span>Analytics for </span>
                <b>Team </b>
                <FormControl variant="standard" sx={{ minWidth: 120 }}>
                    <Select
                        id="team-select-label"
                        value={team}
                        onChange={(e)=>navigate(`/analytics/team/${e.target.value}`)}
                        label="Age"
                    >
                        {teamList ? 
                            teamList.map(t=> 
                                <MenuItem key={t} value={t}>
                                    <div className="flex items-center gap-1">
                                        <b className="text-xl">{t}</b>
                                        {settings?.starredTeams.includes(t) && 
                                            <span className="material-symbols-outlined text-yellow-300" style={{fontSize: "20px"}}>star</span>
                                        }
                                    </div>
                                </MenuItem>
                            )
                        :
                            <MenuItem value={team}><b className="text-xl">{team}</b></MenuItem>
                        }
                    </Select>
                </FormControl>
            </h1>

            <a href={`https://www.thebluealliance.com/team/${team}`} target="_blank" rel="noreferrer" className="text-sm mb-4 text-blue-400 underline hover:text-blue-500 transition">View on The Blue Alliance</a>

            {hasLoaded===undefined || hasLoaded!==team ?
                <div className="w-full h-full flex items-center justify-center">Loading...</div>
            :
            <>
            <Statistic name="Matches Scouted">
                {matches.length}
            </Statistic>
            <div className="mt-2 flex flex-col items-center text-secondary text-sm">
                <div>"P.M." = "Per Match"</div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">query_stats</span> = Tap to show on graph
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">info</span> = Tap for more info
                </div>
            </div>

            <div className="w-full mt-4 px-2 pb-12 flex flex-wrap gap-8 justify-center">
                
                <Card className="w-full max-w-md">
                    <CardContent>
                        <h2 className="text-xl font-bold">Pre Match:</h2>
                        <div className="pl-4 mt-4">
                            <div>{team !== "8248" ? "Human Player Location:" : "Soren's Location:"}</div>
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
                                plot={plotPropsOf(plotFunctions.notePreload)}
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
                                plot={plotPropsOf(plotFunctions.autoPickup)}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, auto, ME.acquireGround, ME.acquireStation, ME.acquireFail)}
                            />

                            <div className="h-4"></div>

                            <AccuracyStatistic name="Speaker Accuracy" 
                                value={numOfEvents(auto, ME.scoreMid, ME.scoreMidBoost)} 
                                total={numOfEvents(auto, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                                plot={plotPropsOf(plotFunctions.autoSpeaker)}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, auto, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                            />

                            <AccuracyStatistic name="Amp Accuracy" 
                                value={numOfEvents(auto, ME.scoreLow, ME.scoreLowBoost)} 
                                total={numOfEvents(auto, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                                plot={plotPropsOf(plotFunctions.autoAmp)}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, auto, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                            />

                            <div className="h-4"></div>

                            <AccuracyStatistic name="Leave Autonomous Zone" 
                                value={matches.filter(m=>events.find(e=>e.matchId===m.matchId && e.event===ME.specialAuto)).length} 
                                total={matches.length}
                                plot={plotPropsOf(plotFunctions.autoLeaveAutoZone)}
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
                                plot={plotPropsOf(plotFunctions.teleopPickup)}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, teleop, ME.acquireGround, ME.acquireStation, ME.acquireFail)}
                            />

                            <div className="h-4"></div>

                            <AccuracyStatistic name="Speaker Accuracy" 
                                value={numOfEvents(teleop, ME.scoreMid, ME.scoreMidBoost)} 
                                total={numOfEvents(teleop, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                                plot={plotPropsOf(plotFunctions.teleopSpeaker)}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, teleop, ME.scoreMid, ME.scoreMidBoost, ME.scoreMidFail)}
                            />

                            <AccuracyStatistic name="Amp Accuracy" 
                                value={numOfEvents(teleop, ME.scoreLow, ME.scoreLowBoost)} 
                                total={numOfEvents(teleop, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                                plot={plotPropsOf(plotFunctions.teleopAmp)}
                            />
                            <PerMatchStatistic name="└ Attempts P.M." pl="24px" 
                                {...perMatchStats(matches, teleop, ME.scoreLow, ME.scoreLowBoost, ME.scoreLowFail)}
                            />

                            <AccuracyStatistic name="Trap Accuracy" 
                                value={numOfEvents(teleop, ME.scoreHigh, ME.scoreHighBoost)} 
                                total={numOfEvents(teleop, ME.scoreHigh, ME.scoreHighBoost, ME.scoreHighFail)}
                                plot={plotPropsOf(plotFunctions.teleopTrap)}
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
                                plot={plotPropsOf(plotFunctions.cooperate)}
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
                                plot={plotPropsOf(plotFunctions.climb)}
                            />
                            <AccuracyStatistic name="└ Parks" pl="24px"
                                value={matches.filter(m=>m.climb!==ClimbResult.None).length} 
                                total={matches.length} 
                                plot={plotPropsOf(plotFunctions.park)}
                            />
                            <PerMatchStatistic name="Human Player Scored" 
                                desc="The notes scored by the human player at the end of the game. Only counts for the times this team's human player is at the Amp."
                                {...humanPlayerPerformancePerMatch()}
                                plot={plotPropsOf(plotFunctions.humanPlayerScored)}
                            />
                            <Statistic name="Avg Defense Rating" plot={plotPropsOf(plotFunctions.defense)}>
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
                        <h2 className="text-xl font-bold">Per match graph:</h2>
                        <div className="w-full flex flex-col gap-6 mt-4">
                            <PerMatchGraph 
                                matches={matches} 
                                autoEvents={auto} 
                                teleopEvents={teleop} 
                                plots={Object.values(plotFunctions).filter(plot=>plotsEnabled.includes(plot.name))}
                            />
                            <FormControl fullWidth>
                                <InputLabel id="plot-multiple-checkbox-label">Show Plots</InputLabel>
                                <Select
                                    labelId="plot-multiple-checkbox-label"
                                    id="plot-multiple-checkbox"
                                    multiple
                                    value={plotsEnabled}
                                    onChange={handleChangePlotsEnabled}
                                    input={<OutlinedInput label="Show Plots" />}
                                    renderValue={(selected) => selected.join(', ')}
                                >
                                {Object.values(plotFunctions).map(({ name }) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={plotsEnabled.indexOf(name) > -1} />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full max-w-md">
                    <CardContent>
                        <h2 className="text-xl font-bold">Scatter plot:</h2>
                        <div className="w-full flex flex-col gap-6 mt-4">
                            <PerMatchScatterPlot
                                matches={matches} 
                                autoEvents={auto} 
                                teleopEvents={teleop} 
                                plots={Object.values(plotFunctions).filter(plot=>plotsEnabled.includes(plot.name))}
                            />
                        </div>
                        <div className="italic text-secondary indent-4 px-4 text-sm">To control items displayed, use the same select menu as the previous graph</div>
                        <div className="italic text-secondary indent-4 px-4 text-sm mt-2">First 15 seconds are in autonomous mode</div>
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
            }
        </>
    )
}

export default AnalyticsPage;