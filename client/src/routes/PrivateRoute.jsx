import { useContext } from "react";
import { AuthContext } from "../provider/AuthProvider";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* DaisyUI loading spinner */}
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-lg font-medium text-gray-600 animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    );

  if (user) return children;

  return <Navigate to="/login" state={location.pathname} replace={true} />;
};

export default PrivateRoute;
