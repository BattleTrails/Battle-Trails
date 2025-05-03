import { Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="contents">
            <Outlet />
        </div>
    );
};

export default AuthLayout;
