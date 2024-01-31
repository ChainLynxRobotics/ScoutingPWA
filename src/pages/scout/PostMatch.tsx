import Button from "@mui/material/Button/Button";
import { NavLink } from "react-router-dom";


const PostMatch = () => {
    
    return (
        <>
        <div className="w-full mb-2 flex">
            <div className="flex-1 flex justify-start items-center">
                <NavLink to="/scout/during">
                    <Button variant="text">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                        Match
                    </Button>
                </NavLink>
            </div>
            <h1 className="text-lg m-2 flex-1 flex justify-center items-center">
                Post Match
            </h1>
            <div className="flex-1 flex justify-end items-center"></div>
        </div>
        <div className="w-full max-w-xl mx-auto flex flex-col items-center px-4">
            Post Match
        </div>
        </>
    );
};
  
export default PostMatch;
