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
                    <div className="flex items-center p-2">
                        <span className="text-xl">Match {game.matchNum} - Team {game.teamNum}</span>
                        <IconButton>
                            <span className="material-symbols-outlined">more_vert</span>
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

        <div className="absolute bottom-20 left-0 right-0 flex justify-center items-center">
            <Stack direction="row" spacing={1} justifyContent="center">
                <Chip
                    color="primary"
                    label="Share"
                    component="a"
                    href="data/qrcode"
                    clickable
                    icon={<span className="material-symbols-outlined">qr_code_2</span>}
                />
                <Chip label="Collect" onClick={() => {}} 
                    icon={<span className="material-symbols-outlined">photo_camera</span>} />
                <Chip label="Export" onClick={() => {}} 
                    icon={<span className="material-symbols-outlined">download</span>}/>
            </Stack>
            <Tooltip title={<span className="text-md">One device is designated as the 'host' device. 
                If you ARE the host, click the Collect button and scan other qr codes. 
                If you are NOT the host device, click on Share to generate qr codes containing match data for the host to scan.</span>}>
                <IconButton>
                    <span className="material-symbols-outlined">info</span>
                </IconButton>
            </Tooltip>
        </div>
    </div>
    );
};
  
export default DataPage;
  