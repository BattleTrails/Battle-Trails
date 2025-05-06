import {useRoutes} from "react-router-dom";
import Home from "@pages/home-page.tsx";
import Test from "@pages/test-page.tsx";
import MainLayout from "@layouts/main-layout.tsx";
import AuthLayout from "@layouts/auth-layout.tsx";
import AuthPage from "@pages/auth-page.tsx";

const App = () => {
    return useRoutes([
        {
            path: "/",
            element: <MainLayout/>,
            children: [
                {index: true, element: <Home/>},
                {path: "test", element: <Test/>}
            ],
        },
        {
            path: "/auth",
            element: <AuthLayout />,
            children: [
                { path: "", element: <AuthPage /> },

            ],
        },
    ]);
};

export default App;

