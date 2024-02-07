import { Card, Chip, IconButton, Stack, Tooltip } from "@mui/material";
import { ReactElement } from "react";

const DataPage = () => {
    let games: Array<ReactElement> = [];
    [
        {
            matchNum: 1,
            teamNum: "8248",
        },
        {
            matchNum: 2,
            teamNum: "2930",
        },
        {
            matchNum: 3,
            teamNum: "4682",
        },
        {
            matchNum: 4,
            teamNum: "2910",
        },
    ].forEach((game) => {
        games.push(
            <div className="mx-5 my-2">
                <Card variant="outlined">
                    <div className="p-2 block">
                        <span className="text-xl">Match {game.matchNum} - Team {game.teamNum}</span>
                        <IconButton>
                            <MoreIcon/>
                        </IconButton>
                    </div>
                </Card>
            </div>
        )
    });
    return (
    <div className="w-full h-full block justify-center relative">
        <h1 className="text-xl text-center mb-4 pt-4 font-bold">Saved Games</h1>
        <div className="h-min block">
            {games}
        </div>

        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
            <Stack direction="row" spacing={1} justifyContent="center">
                <Chip icon={<ShareIcon />} label="Share" onClick={() => {}} />
                <Chip icon={<CollectIcon />} label="Collect" onClick={() => {}} />
                <Chip icon={<ExportIcon />} label="Export" onClick={() => {}} />
            </Stack>
            {/* Tyler please help me center these */}
            <div className="float-right"> {/* help why isn't this doing anything */}
                <Tooltip title="Idk what this is supposed to do 🤷">
                    <IconButton>
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    </div>
    );
  };

const ShareIcon = () => {
    return (
        <span className="material-symbols-outlined">
        qr_code_2
        </span>
    )
}

const CollectIcon = () => {
    return (
        <span className="material-symbols-outlined">
        photo_camera
        </span>
    )
}

const ExportIcon = () => {
    return (
        <span className="material-symbols-outlined">
        download
        </span>
    )
}

const InfoIcon = () => {
    return (
        <span className="material-symbols-outlined">
            info
        </span>
    )
}

const MoreIcon = () => {
    return (
        <span className="material-symbols-outlined">
            more_vert
        </span>
    )
}
  
  export default DataPage;
  