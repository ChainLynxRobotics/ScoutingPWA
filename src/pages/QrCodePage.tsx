import { useContext } from "react";
import QRCode from "react-qr-code";
import ScoutingContext from "../components/context/ScoutingContext";
import { IconButton } from "@mui/material";

const QrCodePage = () => {
    const context = useContext(ScoutingContext);

    return <div className="text-center">
        <div className="absolute left-2 top-2">
            <IconButton href="/data">
                <span className="material-symbols-outlined">arrow_back</span>
            </IconButton>
        </div>
        <p className="text-xl font-bold m-5">Open the scanner on another device to import results</p>
        <div className="p-2 bg-white w-min m-auto">
            <QRCode value={JSON.stringify(context)} style={{ height: "min(80vw, 80vh)", width: "min(80vw, 80vh)"}} />
        </div>
    </div>
}

export default QrCodePage;