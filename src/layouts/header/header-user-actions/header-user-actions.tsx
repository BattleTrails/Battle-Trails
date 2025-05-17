import {useAuthHandler} from "@hooks/useAuthHandler.ts";
import {logout} from "@/services/auth-service.ts";
import {useNavigate} from "react-router-dom";
import {CircleFadingPlus} from "lucide-react";

import {
    CLASS_BELOW_BP_WIDTH,
    CLASS_MIN_BP_WIDTH,
    CLASS_HIDE_BELOW_BP_OPACITY,
    CLASS_OPACITY_TOGGLE,
    CLASS_BELOW_BP_HIDDEN, CLASS_MIN_BP_HIDDEN
} from "@layouts/header/header-breakpoints/headerBreakpoints.ts";

const HeaderUserActions = ({searchOpen,currentPath}: { searchOpen: boolean ;currentPath:string}) => {
    const {user, loading} = useAuthHandler();
    const navigate = useNavigate();

    const goToAuth = () => navigate("/auth");
    const goToNewRoute = () => {  navigate("/new");};

    const isHome = currentPath === "/";
    const isForge = currentPath.startsWith("/new");

    const headerClass = isHome
        ? ""
        : isForge ? "!pointer-events-none !hidden" : "";


    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div
            className={`flex items-center justify-end ml-auto
                        ${CLASS_BELOW_BP_WIDTH} ${CLASS_MIN_BP_WIDTH}
                        ${searchOpen ? CLASS_HIDE_BELOW_BP_OPACITY : "opacity-100"}
                        ${CLASS_OPACITY_TOGGLE}`}
        >
            {/* Botón visible desde el breakpoint */}
            <div className={`${CLASS_BELOW_BP_HIDDEN} ${headerClass}`} >
                <button
                    onClick={() => (user ? goToNewRoute() : goToAuth())}
                    className="btn text-secondary bg-transparent border-0 shadow-none focus:shadow-none hover:shadow-none gap-2"
                >
                    <CircleFadingPlus/>
                    <p>Añade tu ruta</p>
                </button>
            </div>

            {/* Dropdown del avatar */}
            <div className="dropdown dropdown-end">
                <div
                    tabIndex={0}
                    role="button"
                    className="btn-ghost btn-circle avatar border-0 shadow-none focus:shadow-none hover:shadow-none !p-0"
                >
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
                        {/* Botón mobile visible solo por debajo del breakpoint */}
                        <li className={`flex ${CLASS_MIN_BP_HIDDEN}`}>
                            <button onClick={() => (user ? goToNewRoute() : goToAuth())}
                                    className="w-full text-left text-secondary">
                                Añade tu ruta
                            </button>
                        </li>
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
    );
};

export default HeaderUserActions;
