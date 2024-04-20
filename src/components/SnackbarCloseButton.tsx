import { IconButton } from '@mui/material';
import { SnackbarKey, useSnackbar } from 'notistack';

/**
 * A helper component for notistack snackbars that provides a close button.
 * 
 * @param snackbarKey The key of the snackbar to close.
 * @returns An IconButton that closes the snackbar with the given key.
 */
function SnackbarCloseButton({ snackbarKey }: { snackbarKey: SnackbarKey }) {
    const { closeSnackbar } = useSnackbar();

    return (
        <IconButton onClick={() => closeSnackbar(snackbarKey)}>
            <span className="material-symbols-outlined">close</span>
        </IconButton>
    );
}

export default SnackbarCloseButton;