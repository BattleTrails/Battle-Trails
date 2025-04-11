import {useRoutes} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/HomePage";


const App = () => {
    return useRoutes([
        {
            path: "/",
            element: <MainLayout/>,
            children: [
                {index: true, element: <Home/>},
                /*{ path: "about", element: <About /> }*/
            ],
        },
    ]);
};

export default App;

