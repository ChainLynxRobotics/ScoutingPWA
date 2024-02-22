import Button from "@mui/material/Button/Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const IndexPage = () => {

    const navigate = useNavigate();

    // The install prompt event, which is fired when the browser is ready to prompt the user to install the app
    // we store this in state so that we can call prompt() on it later
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

    useEffect(() => {
        // If the app is already installed, redirect to the scout page, checking every second
        const handler = () => {
            if (window.matchMedia('(display-mode: standalone)').matches) {
                location.href = '/scout'; // Use location.href instead of navigate() to force a full page reload
            }
        }
        handler(); // Check immediately
        const id = window.setInterval(handler, 1000);
        return () => window.clearInterval(id);
    }, []);

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
        // This event fires when the user has installed the app, so we can redirect to the scout page
        const handler = () => {
            location.href = '/scout'; // Use location.href instead of navigate() to force a full page reload
        }
        window.addEventListener('appinstalled', handler);
        return () => window.removeEventListener('appinstalled', handler);
    }, []);

    // This function is called when the user clicks the install button
    function installApp() {
        if (!installPrompt) return;
        (installPrompt as any).prompt();
        setInstallPrompt(null);
    }
    
    return (
        <div className="p-16 w-full h-full flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl">Welcome to the Chainlynx 8248 Scouting App</h1>
            <p className="mb-8">Please install this website as a Progressive Web App to continue</p>
            { installPrompt != null ? 
                <Button variant="contained" onClick={installApp}>Install App</Button>
                :
                <Button variant="contained" disabled>Install App</Button>
            }

            <p className="mt-8">On Desktop/Android, you must click the Install Button above. If the button is disabled, <a href="https://caniuse.com/mdn-api_beforeinstallpromptevent" target="_blank" className="underline">PWAs may not be supported on your browser.</a></p>
            <p className="mt-4">On iOS, you must click the Share Button &#40;<span className="material-symbols-outlined">ios_share</span>&#41; and tap "Add to Home Screen" to install the app.</p>

            { import.meta.env.DEV && /* If we're in dev mode, show a button to skip the install page */
                <div className="mt-12">
                    <Button variant="contained" onClick={() => navigate('/scout')} color="warning">
                        Continue to Scout Page &#40;Dev mode override&#41;
                    </Button> 
                </div>
            }
        </div>
    );
  };
  
  export default IndexPage;
  