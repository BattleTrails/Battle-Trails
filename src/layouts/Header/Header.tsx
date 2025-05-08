import {useNavigate} from "react-router-dom";

import SearchBox from "@components/ui/search-box/search-box .tsx";
import logo from "@assets/btlogo_full.svg";

import { useAuthHandler } from "@hooks/useAuthHandler.ts";
import { logout } from "@/services/auth-service";


const Header = () => {
    const { user, loading } = useAuthHandler();

    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/"); // o simplemente recarga la vista
    };


    const goToAuth = () => {
        navigate("/auth");
    };

    return (
        <div className="fixed top-0 left-0 w-full z-50 py-5 bg-primary shadow-sm flex justify-between items-center px-4">

            <div className="flex items-center basis-1/4 cursor-pointer" onClick={() => navigate("/")}>
                <img src={logo} alt="logo" className=""/>
            </div>

            <div className="flex justify-center basis-1/2">
                <SearchBox/>
            </div>

            <div className="flex justify-end basis-1/4 gap-4">
                <button className="btn text-accent bg-primary border-0 shadow-none focus:shadow-none hover:shadow-none">
                    Publica una ruta
                </button>

                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="user avatar"
                                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                            />
                        </div>
                    </div>
                    {!loading && (
                        <ul className="menu menu-sm dropdown-content bg-base-100 rounded-field z-1 mt-3 w-fit min-w-[140px] p-2 gap-1 shadow">
                            {user ? (
                                <>
                                    <li className="pointer-events-none hover:bg-transparent">
                                        <span className="text-sm text-neutral whitespace-nowrap">{user.email}</span>
                                    </li>
                                    <li><a>Perfil</a></li>
                                    <li>
                                        <button onClick={handleLogout} className="w-full text-left">
                                            Cerrar sesión
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <button onClick={goToAuth} className="w-full text-left">
                                        Iniciar sesión
                                    </button>
                                </li>

                            )}
                        </ul>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Header;
