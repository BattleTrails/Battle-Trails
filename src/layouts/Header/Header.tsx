import {useState} from "react";
import {useNavigate} from "react-router-dom";

import logo from "@assets/btlogo_full.svg";
import logo2 from "@assets/Logo-sm.svg";

import {useAuthHandler} from "@hooks/useAuthHandler.ts";
import {logout} from "@/services/auth-service";
import {CircleFadingPlus} from "lucide-react";
import SearchBox from "@components/ui/search-box/search-box .tsx";


const Header = () => {
    const {user, loading} = useAuthHandler();
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false); // estado controlado desde SearchBox

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const goToAuth = () => navigate("/auth");
    const goToNewRoute = () => {
        /* navigate("/ruta/nueva"); */
    };

    return (
        <div
            className="fixed items-center top-0 left-0 w-full z-50 bg-primary shadow-sm h-[70px] md:h-[80px] lg:h-[100px] px-4 py-4 md:py-5 lg:py-6">
            <div className="flex items-center justify-between w-full">
                {/* Logo */}
                <div
                    className={`flex items-center cursor-pointer justify-start w-[64px] sm:w-auto
                    ${searchOpen ? "opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto" : "opacity-100"}
                    transition-opacity duration-300`}
                    onClick={() => navigate("/")}
                >
                    <img src={logo} alt="logo" className="hidden min-[701px]:block h-10" />
                    <img src={logo2} alt="logo" className="block min-[701px]:hidden h-8" />
                </div>



                {/* SearchBox */}
                <div className="flex-1 flex justify-center">
                    <SearchBox onFocusChange={setSearchOpen}/>
                </div>

                {/* Botón + Avatar */}
                <div
                    className={`flex items-center justify-end gap-4 w-[64px] sm:w-auto
                    ${searchOpen ? "opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto" : "opacity-100"}
                    transition-opacity duration-300`}
                >
                    <div className="hidden min-[701px]:flex">
                        <button
                            onClick={() => (user ? goToNewRoute() : goToAuth())}
                            className="btn text-secondary bg-transparent border-0 shadow-none focus:shadow-none hover:shadow-none gap-2"
                        >
                            <CircleFadingPlus/>
                            <p>Añade tu ruta</p>
                        </button>
                    </div>

                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar !p-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer ml-auto">
                                <img
                                    alt="user avatar"
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {!loading && (
                            <ul className="menu menu-sm dropdown-content bg-base-100 rounded-field z-10 mt-3 w-fit min-w-[160px] p-2 gap-1 shadow">
                                <div className="hidden sm:flex">
                                    <button
                                        onClick={() => (user ? goToNewRoute() : goToAuth())}
                                        className="btn text-secondary bg-transparent border-0 shadow-none focus:shadow-none hover:shadow-none gap-2"
                                    >
                                        <CircleFadingPlus/>
                                        <p>Añade tu ruta</p>
                                    </button>
                                </div>
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
        </div>
    );
};

export default Header;
