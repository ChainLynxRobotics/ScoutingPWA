import { Alert, Button } from "@mui/material";
import { useEffect, useRef } from "react";
import { FallbackProps } from "react-error-boundary";
import { useLocation } from "react-router-dom";

/**
 * A fallback component for when an error occurs in a component wrapped in an `ErrorBoundary`.
 * 
 * Displays the error message and provides buttons to try again or reload the page.
 */
export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {

    const location = useLocation();

    const originalLocation = useRef(location.pathname);

    useEffect(() => {
        if (location.pathname != originalLocation.current) resetErrorBoundary();
    }, [location, originalLocation, resetErrorBoundary]);

    return (
        <div className="h-full flex flex-col gap-4 items-center justify-center">
            <div className="text-center p-2">
                <h1 className="text-2xl font-bold text-primary">Well this is awkward... 😅</h1>
                <p className="mt-4">An error occurred while rendering this page. Please try again or reload the page.</p>
            </div>
            <Alert severity="error" className="my-4">{error+""}</Alert>
            <div className="flex gap-2">
                <Button variant="contained" color="primary" className="mt-4" onClick={resetErrorBoundary}>Try again</Button>
                <Button variant="contained" color="secondary" className="mt-4" onClick={() => window.location.reload()}>Reload</Button>
            </div>
        </div>
    )
}