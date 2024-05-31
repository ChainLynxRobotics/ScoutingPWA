import { SnackbarProvider, SnackbarProviderProps } from "notistack";
import { Outlet, NavLink } from "react-router-dom";
import SnackbarCloseButton from "../components/SnackbarCloseButton";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../components/ErrorFallback";
import { useEffect, useRef } from "react";
import MatchDataIO from "../util/MatchDataIO";
import MatchDatabase from "../util/MatchDatabase";

const snackbarProps: SnackbarProviderProps = {
    maxSnack: 3,
    anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
    },
    autoHideDuration: 6000,
    preventDuplicate: true,
    action: snackbarKey => <SnackbarCloseButton snackbarKey={snackbarKey} />
};

const Layout = () => {

    const importing = useRef(false);

    useEffect(() => {
        if (!importing.current) {
            importing.current = true;

            const importData = async () => {
                try {
                    const data = await MatchDataIO.importDataFromUrl("/dummydata_2024wasam.zip");
                    await MatchDatabase.importData(data.matches, data.events);
                } catch (e) {
                    console.error(e);
                    importing.current = false;
                }
            };
            importData();
        }
    }, []);

    return (
        <SnackbarProvider {...snackbarProps}>
            <div className="w-full h-dvh relative flex flex-col overflow-hidden">
                <div className="w-full h-full overflow-y-auto">
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Outlet />
                    </ErrorBoundary>
                </div>
                <div className={"w-full text-center flex bg-background-secondary text-secondary py-1"} style={{paddingBottom: getComputedStyle(document.documentElement).getPropertyValue("--sab")}}>                
                    <NavLink to="/scout" className={s=>"flex-grow flex flex-col"+(s.isActive ? ' text-primary' : '')}>
                        <span className="material-symbols-outlined">description</span>
                        <span className="text-sm">Scout</span>
                    </NavLink>
                    <NavLink to="/data" className={s=>"flex-grow flex flex-col"+(s.isActive ? ' text-primary' : '')}>
                        <span className="material-symbols-outlined">storage</span>
                        <span className="text-sm">Data</span>
                    </NavLink>
                    <NavLink to="/analytics" className={s=>"flex-grow flex flex-col"+(s.isActive ? ' text-primary' : '')}>
                        <span className="material-symbols-outlined">query_stats</span>
                        <span className="text-sm">Analytics</span>
                    </NavLink>
                    <NavLink to="/settings" className={s=>"flex-grow flex flex-col"+(s.isActive ? ' text-primary' : '')}>
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-sm">Settings</span>
                    </NavLink>
                </div>
            </div>
        </SnackbarProvider>
    )
};

export default Layout;

