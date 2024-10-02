import { Backdrop, BackdropOwnProps, CircularProgress } from "@mui/material";

export default function LoadingBackdrop(props: BackdropOwnProps) {
    return (
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            {...props}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    )
}