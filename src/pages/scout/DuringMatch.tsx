import { useContext } from "react";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchAvailable";
import { Button } from "@mui/material";
import { NavLink } from "react-router-dom";
import AllianceColor from "../../enums/AllianceColor";
import SettingsContext from "../../components/context/SettingsContext";


const DuringMatch = () => {

    const settings = useContext(SettingsContext);

    const context = useContext(ScoutingContext);
    if (!context) return (<NoMatchAvailable />);

    

    const rotateField = settings?.fieldRotated || false;
    const isBlue = context.allianceColor == AllianceColor.Blue;
    const reverseX = ( rotateField && !isBlue ) || ( !rotateField && isBlue );
    const reverseY = rotateField;
    return (
        <>
        <div className="w-full mb-2 flex">
            <div className="flex-1 flex justify-start items-center">
                <NavLink to="/scout">
                    <Button variant="text">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                        Pre
                    </Button>
                </NavLink>
            </div>
            <h1 className="text-lg m-2 flex-1 flex justify-center items-center">
                During Match
            </h1>
            <div className="flex-1 flex justify-end items-center">
                <NavLink to="/scout/post">
                    <Button variant="text">
                        Post
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </Button>
                </NavLink>
            </div>
        </div>
        <div className="w-full max-w-xl mx-auto flex flex-col items-center px-4">
            
            <div className="max-w-md relative my-12 whitespace-nowrap">
                <img src={`/imgs/crescendo_field_render_${context.allianceColor == AllianceColor.Red ? "red" : "blue"}.png`} 
                    alt="Crescendo Field Render" className={`w-full ${rotateField ? '-scale-100' : ''}`} />
                
                {/* Allows the field to be rotated depending on the pov of the scouter */}
                <button onClick={()=>settings?.setFieldRotated(!rotateField)}
                        className={`absolute top-0 bg-black bg-opacity-75 right-0 rounded-bl-lg`}>
                    <span className="material-symbols-outlined m-2">360</span>
                </button>
                


            </div>
        </div>
        </>
    );
};
  
export default DuringMatch;
