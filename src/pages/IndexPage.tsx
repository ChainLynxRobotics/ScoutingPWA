import Button from "@mui/material/Button/Button";
import { useNavigate } from "react-router-dom";
import Divider from "../components/Divider";

const IndexPage = () => {

    const navigate = useNavigate();
    
    return (
        <div className="w-full h-dvh relative overflow-hidden">
            <div className="w-full h-full overflow-y-auto">
                <div className="">
                    <div className="w-full h-full max-w-lg mx-auto px-8 py-16 flex flex-col items-center justify-center text-center">
                        <h1 className="text-3xl">Welcome to the ChainLynx Scouting App</h1>

                        <Divider />

                        <p className="mt-4 mb-2">
                            This was created by <a href="https://chainlynx8248.com/" target="_blank" className="underline">FRC Team 8248</a> to help scout matches at competitions.
                            Once you see a notification telling you the app is ready to work offline, you can use every feature without an internet connection, including transferring data with QR codes.
                            Click the blue button below to continue to the scouting page.
                        </p>
                        <p className="italic">
                            The source code is available on <a href="https://github.com/ChainLynxRobotics/ScoutingPWA" target="_blank" className="underline">GitHub</a>.
                        </p>

                        <div className="mt-16">
                            <Button variant="contained" color="primary" size="large" onClick={() => {navigate('/scout')}}>
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
  