import Button from "@mui/material/Button/Button";
import { useNavigate } from "react-router-dom";
import Divider from "../components/Divider";
import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal } from "@mui/material";

const IndexPage = () => {

    const navigate = useNavigate();

    // The install prompt event, which is fired when the browser is ready to prompt the user to install the app
    // we store this in state so that we can call prompt() on it later
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

    const [desktopInstallModalOpen, setDesktopInstallModalOpen] = useState(false);
    const [mobileInstallModalOpen, setMobileInstallModalOpen] = useState(false);

    useEffect(() => {
        // This event fires when the browser is ready to prompt the user to install the app
        const handler = (e: Event) => {
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
    }, []);

    const tryInstall = useCallback(() => {
        if (installPrompt) (installPrompt as any).prompt();
    }, [installPrompt]);
    
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
                            Click a button below to continue to the scouting page.
                        </p>
                        <p className="italic">
                            The source code is available on <a href="https://github.com/ChainLynxRobotics/ScoutingPWA" target="_blank" className="underline">GitHub</a>.
                        </p>

                        <div className="mt-16">
                            <div className="flex flex-col items-center gap-4 standalone:hidden">
                                <Button
                                    variant="outlined" 
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
                        If you don't see the prompt/icon, try refreshing the page or using a different browser. (Chrome/Edge is recommended)
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
                        Click the Share Button &#40;<span className="material-symbols-outlined">ios_share</span>&#41; in your browser and tap "Add to Home Screen" to install the app.
                    </DialogContentText>
                    <DialogContentText>
                        If you don't see the button, try refreshing the page or using a different browser. (Chrome is recommended)
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
  