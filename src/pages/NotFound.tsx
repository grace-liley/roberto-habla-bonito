import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel text-center px-8 py-10">
        <h1 className="hand-drawn mb-4 text-5xl">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="font-daniel text-2xl font-bold underline underline-offset-4 decoration-accent decoration-2">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
