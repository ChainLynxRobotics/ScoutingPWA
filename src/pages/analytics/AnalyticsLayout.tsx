import { Button } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";

export default function AnalyticsLayout() {
    const navigate = useNavigate();
    return (
        <div className="w-full h-full flex flex-col items-center relative">
            <div className="w-full flex justify-start">
                <Button 
                    onClick={()=>navigate(-1)} 
                    color="secondary"
                    sx={{padding: '12px'}}
                    startIcon={<span className="material-symbols-outlined">arrow_back_ios</span>}
                >Back</Button>
            </div>
            <Outlet />
        </div>
    )
}