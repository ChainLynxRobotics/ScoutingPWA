import Alert from '@mui/material/Alert/Alert'
import Button from '@mui/material/Button/Button'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Deals with the service worker registration and prompts the user to reload the page when new content is available.
 * 
 * This component uses the `useRegisterSW` hook from `virtual:pwa-register/react` to handle the service worker registration.
 * 
 * @returns A component that displays a message when the app is ready to work offline or when new content is available.
 */
function ReloadPrompt() {

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div>
      { (offlineReady || needRefresh)
        && <div className="fixed left-0 z-[999] bottom-0 m-4 p-3">
            <Alert severity="info" variant="filled" onClose={() => close()}>
                <div className="">
                    { offlineReady
                        ? <span>App ready to work offline</span>
                        : <span>New content available, click on reload button to update.</span>
                    }
                </div>
                { needRefresh && <Button variant="contained" color="info" size="small" onClick={() => updateServiceWorker(true)}>Reload</Button> }
            </Alert>
        </div>
      }
    </div>
  )
}

export default ReloadPrompt