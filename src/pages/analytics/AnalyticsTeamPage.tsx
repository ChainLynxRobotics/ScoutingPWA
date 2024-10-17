import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MatchData } from "../../types/MatchData";
import matchDatabase from "../../util/db/matchDatabase";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select } from "@mui/material";
import Statistic from "../../components/analytics/Statistic";
import matchCompare from "../../util/matchCompare";
import SettingsContext from "../../components/context/SettingsContext";

const AnalyticsPage = () => {

    const { team } = useParams();
    const navigate = useNavigate();
    const [teamList, setTeamList] = useState<number[]|undefined>(undefined);

    const settings = useContext(SettingsContext);

    const analyticsCompetition = settings?.analyticsCurrentCompetitionOnly ? settings?.competitionId : undefined;
    useEffect(() => {
        async function loadTeams() {
            setTeamList(await matchDatabase.getUniqueTeams(analyticsCompetition));
        }
        loadTeams();
    }, [analyticsCompetition]);

    const [hasLoaded, setHasLoaded] = useState<string|undefined>(undefined);
    const [entries, setEntries] = useState<MatchData[]>([]);

    const [notesOpen, setNotesOpen] = useState(false);

    useEffect(() => {
        if (hasLoaded===team) return;
        // Load entries for team
        async function loadEntries() {
            if (!team) return;
            const entries = await matchDatabase.getAllByTeam(parseInt(team), analyticsCompetition);
            entries.sort((a, b) => matchCompare(a.matchId, b.matchId));
            setEntries(entries);
            setHasLoaded(team);
        }
        loadEntries();
    }, [team, analyticsCompetition, hasLoaded]);

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
                {entries.length}
            </Statistic>
            <div className="mt-2 flex flex-col items-center text-secondary text-sm">
                <div>&quot;P.M.&quot; = &quot;Per Match&quot;</div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">query_stats</span> = Tap to show on graph
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">info</span> = Tap for more info
                </div>
            </div>

            <div className="w-full mt-4 px-2 pb-12 flex flex-wrap gap-8 justify-center">
                
                

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
                        {entries.filter(m=>m.notes.trim()).map(match=>
                            <div key={match.matchId}>
                                <div>Notes during <b>{match.matchId}</b>:</div>
                                <textarea className="ml-2 p-1 w-full italic h-32 text-white bg-black bg-opacity-20 resize-none" disabled value={match.notes} />
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button size="large" onClick={()=>setNotesOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
            </>
            }
        </>
    )
}

export default AnalyticsPage;