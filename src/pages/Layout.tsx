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
        <div className="w-full h-screen relative">
            <div className="w-full h-full overflow-y-auto">
                <Outlet />
            </div>
            <div className="absolute bottom-0 w-full text-center flex pt-2 bg-background-secondary text-secondary">
                <NavLink to="/scout" className={s=>"flex-grow flex flex-col"+(s.isActive ? ' text-primary' : '')}>
                    <span className="material-symbols-outlined">description</span>
                    <span className="text-sm">Scout</span>
                </NavLink>
                <NavLink to="/data" className={s=>"flex-grow flex flex-col"+(s.isActive ? ' text-primary' : '')}>
                    <span className="material-symbols-outlined">bar_chart</span>
                    <span className="text-sm">Data</span>
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
