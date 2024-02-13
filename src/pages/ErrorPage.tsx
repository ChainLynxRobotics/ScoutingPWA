const ErrorPage = ({msg}: {msg: string}) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-2">Error :(</h1>
            <h2 className="text-xl">{msg}</h2>
        </div>
    );
};
  
export default ErrorPage;