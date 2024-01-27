import { useContext } from "react";
import { Outlet } from "react-router-dom";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchavailable";
import { AllianceColor } from "../../components/ScoutingData";

const ScoutPage = () => {
    
    const context = useContext(ScoutingContext);
    
    if (!context) return (<NoMatchAvailable />);
    return (
        <div className="w-full h-full flex flex-col items-center relative">
            <h1>
                You are scouting 
                <span className="rounded mx-2 px-1 font-bold" style={{background: context.meta.allianceColor == AllianceColor.Red ? 'red' : 'blue'}}>
                    {context.meta.teamNumber}
                </span>
            </h1>
            <Outlet />
            <span className="text-sm text-secondary">Match Id: <code>{context.meta.matchId}</code></span>
        </div>
    );
};
  
export default ScoutPage;

  