import { useState } from "react";
import Button from "@mui/material/Button/Button";

const ScoutPage = () => {
    const [count, setCount] = useState(0);
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <h1>Scouting Page</h1>
            <Button variant="contained" onClick={()=>setCount(count+1)}>Counter is {count}</Button>
        </div>
    );
  };
  
  export default ScoutPage;
  