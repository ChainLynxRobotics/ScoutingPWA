import { ScheduledMatch } from '../components/context/SettingsContextProvider';
import { TBA_API_BASE, TBA_API_KEY } from '../constants';

export async function getSchedule(competitionId: string): Promise<ScheduledMatch[]> {
    const res = await fetch(`${TBA_API_BASE}/event/${competitionId}/matches/simple`, {
        headers: {
            'X-TBA-Auth-Key': TBA_API_KEY
        }
    })
    const json = await res.json();

    if (json.Error) {
        throw new Error("TBA returned error: "+json.Error);
    }

    if (!Array.isArray(json)) {
        throw new Error("TBA returned an unexpected response: "+JSON.stringify(json));
    }

    if (json.length === 0) {
        throw new Error("TBA returned no matches");
    }

    const matches: ScheduledMatch[] = json.sort((a, b)=>a.match_number-b.match_number).map((match: any): ScheduledMatch => {
        return {
            matchId: match.key.substring(competitionId.length+1),
            blue1: match.alliances.blue.team_keys[0].substring(3),
            blue2: match.alliances.blue.team_keys[1].substring(3),
            blue3: match.alliances.blue.team_keys[2].substring(3),
            red1: match.alliances.red.team_keys[0].substring(3),
            red2: match.alliances.red.team_keys[1].substring(3),
            red3: match.alliances.red.team_keys[2].substring(3),
        }
    });
    return matches;
}