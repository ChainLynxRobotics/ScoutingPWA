
export type PitIdentifier = {
    teamNumber: number;
}

export type PitHeader = PitIdentifier & {
    competitionId: string;
}