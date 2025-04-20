import {useRoutes} from "react-router-dom";
import Home from "@pages/HomePage";
import Test from "@pages/TestPage";
import MainLayout from "@layouts/MainLayout";





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
    ]);
};

export default App;

