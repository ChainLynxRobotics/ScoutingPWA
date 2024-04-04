import Alert from '@mui/material/Alert/Alert'
import Button from '@mui/material/Button/Button'
import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line prefer-template
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