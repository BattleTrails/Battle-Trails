import {useRoutes} from "react-router-dom";
import Home from "@pages/home-page.tsx";
import Test from "@pages/test-page.tsx";
import MainLayout from "@layouts/main-layout.tsx";
import AuthLayout from "@layouts/auth-layout.tsx";
import Auth from "@pages/auth-page.tsx";
import Forge from "@pages/forge-page.tsx";
import PrivateRoute from "@/routes/private-route.tsx";
import Perfil from "@pages/profile-page.tsx"
import PostDetails from "@pages/details-page"
import ProfileUserPage from "@pages/profile-user-page.tsx";
import EditProfile from "@pages/edit-profile-page.tsx";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';



const App = () => {
  return useRoutes([
    {
      path: "/",
      element: <MainLayout/>,
      children: [
        {index: true, element: <Home/>},
        {path: "test", element: <Test/>},
        {path: "new", element: <PrivateRoute><Forge/></PrivateRoute>},
        {path: "edit/:postId?", element: <PrivateRoute><Forge/></PrivateRoute>},
        {path: "profile", element: <PrivateRoute><Perfil/></PrivateRoute>},
        {path: "edit-profile", element: <PrivateRoute><EditProfile/></PrivateRoute>},
        {path: "profile/:userId", element: <ProfileUserPage/>},
        {path: "post/:postId", element: <PostDetails/>},

      ],
    },
    {
      path: "/auth",
      element: <AuthLayout/>,
      children: [
        {path: "", element: <Auth/>},

      ],
    },
  ]);
};

export default App;

