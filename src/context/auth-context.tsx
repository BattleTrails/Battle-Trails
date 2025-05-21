import {createContext, useContext} from "react";
import {useAuthHandler} from "@hooks/useAuthHandler";

const AuthContext = createContext<ReturnType<typeof useAuthHandler> | null>(null);

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
  const auth = useAuthHandler();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
};
