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

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const goToAuth = () => {
        navigate("/auth");
    };

    const goToNewRoute = () => {
        /*navigate("/ruta/nueva");*/
    };

    return (
        <div
            className="fixed top-0 left-0 w-full z-50 bg-primary shadow-sm flex justify-between items-center px-4 py-4 md:py-5 lg:py-6 h-[70px] md:h-[80px] lg:h-[100px]">
            {/* Logo */}
            {/*<div className="flex items-center basis-1/4 cursor-pointer" onClick={() => navigate("/")}>
                <img src={logo} alt="logo" className="hidden md:block h-10" />
                <img src={logo2} alt="logo" className="block md:hidden h-8" />
            </div>*/}
            <div className="flex items-center  cursor-pointer" onClick={() => navigate("/")}>
                <img src={logo} alt="logo" className="hidden sm:block h-10"/>
                <img src={logo2} alt="logo" className="block sm:hidden h-8"/>
            </div>

            {/* SearchBox */}
            <div className="absolute left-1/2 -translate-x-1/2">
                <SearchBox/>
            </div>

            {/* Botón y Avatar */}
            <div className="flex justify-end  items-center gap-4">
                {/* Solo visible en md+ */}
                {/*<div className="hidden md:flex">
                    <button
                        onClick={() => {
                            if (user) {
                                goToNewRoute();
                            } else {
                                goToAuth();
                            }
                        }}
                        className="btn text-secondary bg-transparent border-0 shadow-none focus:shadow-none hover:shadow-none gap-2"
                    >
                        <CircleFadingPlus />
                        <p>Añade tu ruta</p>
                    </button>
                </div>*/}
                <div className="hidden sm:flex">
                    <button
                        onClick={() => {
                            if (user) {
                                goToNewRoute();
                            } else {
                                goToAuth();
                            }
                        }}
                        className="btn text-secondary bg-transparent border-0 shadow-none focus:shadow-none hover:shadow-none gap-2"
                    >
                        <CircleFadingPlus/>
                        <p>Añade tu ruta</p>
                    </button>
                </div>


                {/* Dropdown */}
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
                        <ul className="menu menu-sm dropdown-content bg-base-100 rounded-field z-10 mt-3 w-fit min-w-[160px] p-2 gap-1 shadow">

                            {/* Botón visible siempre (solo mobile) */}
                            {/*<li className="md:hidden">
                                <button
                                    onClick={() => {
                                        if (user) {
                                            goToNewRoute();
                                        } else {
                                            goToAuth();
                                        }
                                    }}
                                    className="w-full text-left flex gap-2 items-center"
                                >
                                    <CircleFadingPlus size={18} />
                                    Añade tu ruta
                                </button>
                            </li>*/}
                            <div className="hidden sm:flex">
                                <button
                                    onClick={() => {
                                        if (user) {
                                            goToNewRoute();
                                        } else {
                                            goToAuth();
                                        }
                                    }}
                                    className="btn text-secondary bg-transparent border-0 shadow-none focus:shadow-none hover:shadow-none gap-2"
                                >
                                    <CircleFadingPlus/>
                                    <p>Añade tu ruta</p>
                                </button>
                            </div>

                            {/* Condicional de contenido restante */}
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
