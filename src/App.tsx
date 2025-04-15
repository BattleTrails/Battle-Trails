import {useRoutes} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/HomePage";
import Test from "./pages/TestPage";


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

