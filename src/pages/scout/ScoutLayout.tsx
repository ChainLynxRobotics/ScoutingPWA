import { useContext } from "react";
import { Outlet } from "react-router-dom";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchAvailable";
import { AllianceColor } from "../../components/ScoutingData";

const ScoutPage = () => {
    
    const context = useContext(ScoutingContext);
    
    if (!context) return (<NoMatchAvailable />);
    return (
        <div className="w-full h-full flex flex-col relative">
            <div className="w-full mb-2 bg-background-secondary text-center shadow">
                <h1 className="text-lg m-2">
                    You are scouting 
                    <span className="rounded mx-2 px-1 font-bold" style={{background: context.meta.allianceColor == AllianceColor.Red ? 'red' : 'blue'}}>
                        {context.meta.teamNumber}
                    </span>
                </h1>
            </div>
            <Outlet />
            <div className="w-full mt-16 text-center">
                <span className="text-sm text-secondary">Match Id: <code>{context.meta.matchId}</code></span>
            </div>
        </div>
    );
};
  
export default ScoutPage;

  