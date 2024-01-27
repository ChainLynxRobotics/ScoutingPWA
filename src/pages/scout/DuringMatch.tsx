import { useContext, useState } from "react";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchavailable";


const DuringMatch = () => {

    const context = useContext(ScoutingContext);

    const [rotateField, setRotateField] = useState(false);
    
    if (!context) return (<NoMatchAvailable />);

    return (
        <>
            <div className="max-w-md relative my-4">
                <img src={`/imgs/crescendo_field_render_${context.meta.allianceColor}.png`} 
                    alt="Crescendo Field Render" className={`w-full ${rotateField ? '-scale-100' : ''}`} />
                
                {/* Allows the field to be rotated depending on the pov of the scouter */}
                <button onClick={()=>setRotateField(!rotateField)}
                        className={`absolute top-0 bg-black bg-opacity-75 ${rotateField ? 'left-0 rounded-br-lg' : 'right-0 rounded-bl-lg'}`}>
                    <span className="material-symbols-outlined m-2">360</span>
                </button>
            </div>
        </>
    );
};
  
export default DuringMatch;
