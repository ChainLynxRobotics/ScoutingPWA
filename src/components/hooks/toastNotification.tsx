import { Alert, Snackbar } from "@mui/material";
import { useState } from "react";

type SetToastFunction = (message: string, severity?: "error" | "warning" | "info" | "success") => void;

export default function useToastNotification(): [JSX.Element, SetToastFunction] {

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"error" | "warning" | "info" | "success">("info");

    const close = () => {
        setOpen(false);
    }

    const setToast = (message: string, severity: "error" | "warning" | "info" | "success" = "info") => {
        setMessage(message);
        setSeverity(severity);
        setOpen(true);
    }

    return [
        (
            <Snackbar 
                open={open}
                autoHideDuration={6000}
                onClose={close}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
                <Alert 
                    severity={severity} 
                    variant="filled"
                    onClose={close}
                    sx={{width: "100%"}}
                >
                    {message}
                </Alert>
            </Snackbar>
        ),
        setToast
    ]
}