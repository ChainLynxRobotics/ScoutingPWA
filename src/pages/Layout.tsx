import { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

const Layout = () => {

    const navigate = useNavigate();

    // If the app is not installed, redirect to the install page
    useEffect(() => {
        if (import.meta.env.DEV) return; // Don't redirect in dev mode

        if (!window.matchMedia('(display-mode: standalone)').matches) {
            navigate('/');
        }
    }, []);

    return (
        <div className="w-full h-screen relative pb-12">
            <div className="w-full h-full overflow-y-auto">
                <Outlet />
            </div>
            <div className="absolute bottom-0 w-full h-12 text-center flex items-end bg-background-secondary text-secondary">
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
    )
};

export default Layout;
