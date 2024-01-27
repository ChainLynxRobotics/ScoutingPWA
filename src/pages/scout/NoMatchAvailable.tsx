import { Link } from "react-router-dom";


const NoMatchAvailable = () => {
    
    return (
        <div className="w-full h-full flex flex-col p-4 justify-center items-center text-center">
            <h1 className="text-3xl">You have not been assigned a match yet!</h1>
            <span className="text-lg">Go to the <Link to='/settings' className="underline">Settings Page</Link> to scan a schedule qr or manually override a match</span>
        </div>
    );
};
  
export default NoMatchAvailable;
