import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <div className="w-full h-screen relative">
        <div className="w-full h-full overflow-y-auto">
            <Outlet />
        </div>
        <div className="absolute bottom-0 w-full text-center flex pt-2 bg-secondary">
            <Link to="/scout" className="flex-grow flex flex-col">
                <span className="material-symbols-outlined">description</span>
                <span className="text-sm">Scout</span>
            </Link>
            <Link to="/data" className="flex-grow flex flex-col">
                <span className="material-symbols-outlined">bar_chart</span>
                <span className="text-sm">Data</span>
            </Link>
            <Link to="/settings" className="flex-grow flex flex-col">
                <span className="material-symbols-outlined">settings</span>
                <span className="text-sm">Settings</span>
            </Link>
        </div>
    </div>
  )
};

export default Layout;
