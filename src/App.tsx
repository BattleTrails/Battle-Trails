import {useRoutes} from "react-router-dom";
import Home from "@pages/HomePage";
import Test from "@pages/TestPage";
import MainLayout from "@layouts/MainLayout";
import AuthLayout from "@layouts/AuthLayout.tsx";
import AuthPage from "@pages/AuthPage.tsx";

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

