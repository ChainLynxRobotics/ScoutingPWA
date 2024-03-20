import Button from "@mui/material/Button/Button";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SettingsContext from "../components/context/SettingsContext";
import Divider from "../components/Divider";

const IndexPage = () => {

    const navigate = useNavigate();
    const settings = useContext(SettingsContext);
    
    return (
        <div className="w-full h-dvh relative overflow-hidden">
            <div className="w-full h-full overflow-y-auto">
                <div className="">
                    <div className="px-8 py-16 w-full h-full flex flex-col items-center justify-center text-center">
                        <h1 className="text-3xl">Welcome to the ChainLynx 8248 Scouting App</h1>

                        <Divider />

                        <div className="mt-8">
                            <Button variant="contained" color="primary" size="large" onClick={() => {settings?.setBypassInstall(true); navigate('/scout')}}>
                                Continue
                            </Button> 
                        </div>
                        <div className="mt-16 flex flex-col items-center">
                            <div className="text-secondary">App Version: <i>{APP_VERSION}</i></div>
                            <div className="text-secondary">Build Date: <i>{new Date(BUILD_DATE).toLocaleString()}</i></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  };
  
  export default IndexPage;
  