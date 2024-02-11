import { useContext } from "react";
import { Outlet } from "react-router-dom";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchAvailable";
import { Button } from "@mui/material";
import CountUp from "../../components/CountUp";
import AllianceColor from "../../enums/AllianceColor";

const ScoutPage = () => {
    
    const context = useContext(ScoutingContext);
    
    if (!context) return (<NoMatchAvailable />);

    function skipAuto() {
        context?.match.setIsAuto(false);
    }

    function endMatch() {
        context?.match.endMatch();
    }

    return (
        <div className="w-full h-full flex flex-col relative">
            <div className="w-full bg-background-secondary shadow">
                <h1 className="text-lg m-2 flex-1 flex items-center">
                    <span className={`flex-1 text-start font-bold ${context.meta.allianceColor == AllianceColor.Red ? 'text-red-400' : 'text-blue-400'}`}>
                        {context.meta.teamNumber}
                    </span>
                    <div className="flex-1 text-center whitespace-nowrap">
                        {!context.match.matchStart ?
                            <Button variant="contained" size="small" color="success" onClick={() => context.match.startMatch()}>Start Match</Button>
                            :
                            (context.match.matchActive ?
                                <CountUp start={context.match.matchStart}></CountUp>
                                :
                                <span></span>
                            )
                        }
                    </div>
                    <div className="flex-1 text-end">
                        {context.match.matchActive ?
                            (context.match.inAuto ?
                                <span className="">Auto <button className="text-sm text-secondary" onClick={skipAuto}>&#40;skip&#41;</button></span>
                                :
                                <span className="">Teleop <button className="text-sm text-secondary" onClick={endMatch}>&#40;end&#41;</button></span>
                            )
                            :
                            (context.match.matchStart ?
                                <span className="text-sm text-secondary">Match Ended</span>
                                :
                                <span className="text-sm text-secondary">Not Started</span>
                            )
                        }
                    </div>
                </h1>
            </div>
            <Outlet />
            <div className="w-full mt-16 pb-2 text-center">
                <span className="text-sm text-secondary">Match Id: <code>{context.meta.matchId}</code></span>
            </div>
        </div>
    );
};
  
export default ScoutPage;

  