import Button from "@mui/material/Button/Button";
import { useNavigate } from "react-router-dom";
import Divider from "../components/Divider";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { BeforeInstallPromptEvent } from "../types/beforeInstallPromptEvent";

const IndexPage = () => {

    const navigate = useNavigate();

    // The install prompt event, which is fired when the browser is ready to prompt the user to install the app
    // we store this in state so that we can call prompt() on it later
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

    const [desktopInstallModalOpen, setDesktopInstallModalOpen] = useState(false);
    const [mobileInstallModalOpen, setMobileInstallModalOpen] = useState(false);

    useEffect(() => {
        // This event fires when the browser is ready to prompt the user to install the app
        const handler = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    useEffect(() => {
        // This event fires once the app is installed
        const handler = () => {
            setDesktopInstallModalOpen(false);
            setMobileInstallModalOpen(false);
            navigate('/scout');
        }
        window.addEventListener('appinstalled', handler);
        return () => window.removeEventListener('appinstalled', handler);
    }, [navigate, setDesktopInstallModalOpen, setMobileInstallModalOpen]);

    const tryInstall = useCallback(() => {
        if (installPrompt) (installPrompt as BeforeInstallPromptEvent).prompt();
    }, [installPrompt]);
    
    return (
        <div className="w-full h-dvh relative overflow-hidden">
            <div className="w-full h-full overflow-y-auto">
                <div className="">
                    <div className="w-full h-full max-w-lg mx-auto px-8 py-16 flex flex-col items-center justify-center text-center">
                        <h1 className="text-3xl sm:text-5xl font-bold">Welcome to C.L.A.W.</h1>
                        <p className="mt-4">The <b>C</b>hain <b>L</b>ynx <b>A</b>nalytics <b>W</b>ebtool</p>

                        <Divider />

                        <p className="mt-4 mb-2">
                            This was created by FRC team <a href="https://chainlynx8248.com/" target="_blank" rel="noreferrer" className="underline">ChainLynx 8248</a> to help scout matches at FIRST competitions.
                            Click a button below to continue to the scouting page.
                        </p>

                        <div className="mt-12">
                            <div className="flex flex-col items-center gap-4 standalone:hidden">
                                <Button
                                    variant="contained" 
                                    color="secondary" 
                                    className="" 
                                    onClick={() => {navigate('/scout')}}
                                >
                                    Continue on web (not recommended)
                                </Button>

                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    className="mt-4" 
                                    onClick={() => {
                                        tryInstall();
                                        setMobileInstallModalOpen(true);
                                    }}
                                    startIcon={<span className="material-symbols-outlined">install_mobile</span>}
                                >
                                    Install on Mobile
                                </Button>

                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    className="mt-4" 
                                    onClick={() => {
                                        tryInstall();
                                        setDesktopInstallModalOpen(true);
                                    }}
                                    startIcon={<span className="material-symbols-outlined">install_desktop</span>}
                                >
                                    Install on Desktop
                                </Button>
                            </div>

                            <div className="flex-col items-center gap-4 hidden standalone:flex">
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    size="large" 
                                    onClick={() => {navigate('/scout')}}
                                >
                                    Continue
                                </Button> 
                            </div>
                        </div>

                        <div className="mt-16 flex flex-col items-center">
                            <div className="text-secondary">App Version: <i>{APP_VERSION}</i></div>
                            <div className="text-secondary">Build Date: <i>{new Date(BUILD_DATE).toLocaleString()}</i></div>
                            <div className="text-secondary"><a href="https://github.com/ChainLynxRobotics/ScoutingPWA" target="_blank" rel="noreferrer" className="underline">GitHub</a></div>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog
                open={desktopInstallModalOpen}
                onClose={() => setDesktopInstallModalOpen(false)}
                aria-labelledby="desktop-install-dialog-title"
            >
                <DialogTitle id="desktop-install-dialog-title">
                    Installing on Desktop
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You should now see a prompt or icon (<span className="material-symbols-outlined">install_desktop</span>) in the address bar to install the app.
                    </DialogContentText>
                    <DialogContentText>
                        If you don&apos;t see the prompt/icon, try refreshing the page or using a different browser. (Chrome/Edge is recommended)
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => setDesktopInstallModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={mobileInstallModalOpen}
                onClose={() => setMobileInstallModalOpen(false)}
                aria-labelledby="mobile-install-dialog-title"
            >
                <DialogTitle id="mobile-install-dialog-title">
                    Installing on Mobile
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Click the Share Button &#40;<span className="material-symbols-outlined">ios_share</span>&#41; in your browser and tap &quot;Add to Home Screen&quot; to install the app.
                    </DialogContentText>
                    <DialogContentText>
                        If you don&apos;t see the button, try refreshing the page or using a different browser. (Chrome is recommended)
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => setMobileInstallModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
  };
  
  export default IndexPage;
  