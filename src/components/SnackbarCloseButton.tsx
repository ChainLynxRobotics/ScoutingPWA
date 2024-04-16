import { IconButton } from '@mui/material';
import { SnackbarKey, useSnackbar } from 'notistack';

function SnackbarCloseButton({ snackbarKey }: { snackbarKey: SnackbarKey }) {
    const { closeSnackbar } = useSnackbar();

    return (
        <IconButton onClick={() => closeSnackbar(snackbarKey)}>
            <span className="material-symbols-outlined">close</span>
        </IconButton>
    );
}

export default SnackbarCloseButton;