import Alert from '@mui/material/Alert/Alert'
import Button from '@mui/material/Button/Button'
import { useRegisterSW } from 'virtual:pwa-register/react'
import useLocalStorageState from './hooks/localStorageState'
import { useEffect, useState } from 'react';

/**
 * Deals with the service worker registration and prompts the user to reload the page when new content is available.
 * 
 * When the service worker is initially registered, it will tell the user that the content is actively downloading and will automatically reload the page when complete.
 * 
 * This component uses the `useRegisterSW` hook from `virtual:pwa-register/react` to handle the service worker registration.
 * 
 * @returns A component that displays a message when the app is ready to work offline or when new content is available.
 */
function ReloadPrompt() {

  const [hasDownloaded, setHasDownloaded] = useLocalStorageState(false, 'hasDownloadedPWA');
  const [hasDismissedDownloadingPopup, setHasDismissedDownloadingPopup] = useState(false);

  const [offlineReadyPopupDismissed, setOfflineReadyPopupDismissed] = useLocalStorageState(false, 'offlineReadyPopupDismissed');

  const {
    offlineReady: [offlineReady], // offlineReady is a boolean that indicates if the app is ready to work offline, but only directly after the service worker is installed
    needRefresh: [needRefresh, setNeedRefresh], // needRefresh is a boolean that indicates if the app has new content available and needs to be refreshed
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r)
      if (r?.active?.state === 'activated') setHasDownloaded(true);
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  // This is basically a useEffect that runs when the service worker is first installed
  useEffect(() => {
    if (offlineReady && !hasDownloaded) {
      setHasDownloaded(true);
      window.location.reload(); // Reload the page to make sure the new service worker is active, this makes sure offline content is available immediately
    }
  }, [offlineReady, hasDownloaded, setHasDownloaded]);

  useEffect(() => {
    // For development, there is no need to wait for the service worker to download
    if (import.meta.env.DEV) {
      setHasDownloaded(true);
      setOfflineReadyPopupDismissed(true);
    }
  }, [setHasDownloaded, setOfflineReadyPopupDismissed]);

  return (
    <div className='fixed left-0 z-[999] bottom-0'>
      { (!hasDownloaded && !hasDismissedDownloadingPopup) &&
        <div className="m-4 p-3">
            <Alert severity="info" variant="filled" onClose={() => setHasDismissedDownloadingPopup(true)}>
                <div>App is downloading...</div>
                <div>It will automatically reload once complete</div>
            </Alert>
        </div>
      }
      { (hasDownloaded && !offlineReadyPopupDismissed) &&
        <div className="m-4 p-3">
            <Alert severity="info" variant="filled" onClose={() => setOfflineReadyPopupDismissed(true)}>
                <div className="">
                    <span>App ready to work offline</span>
                </div>
            </Alert>
        </div>
      }
      { needRefresh &&
        <div className="m-4 p-3">
            <Alert severity="info" variant="filled" onClose={() => setNeedRefresh(false)}>
                <div className="">
                    <span>Update available, click on reload button to update.</span>
                </div>
                <Button variant="contained" color="info" size="small" onClick={() => updateServiceWorker(true)}>Reload</Button>
            </Alert>
        </div>
      }
    </div>
  )
}

export default ReloadPrompt