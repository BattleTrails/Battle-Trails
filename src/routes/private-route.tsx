import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import {JSX} from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user,loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default PrivateRoute;
