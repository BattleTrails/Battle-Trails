import { useAuthHandler } from "@hooks/useAuthHandler";
import { logout } from "@/services/auth-service";
import { useNavigate } from "react-router-dom";
import { CircleFadingPlus } from "lucide-react";

const UserActions = ({ searchOpen }: { searchOpen: boolean }) => {
    const { user, loading } = useAuthHandler();
    const navigate = useNavigate();

    const goToAuth = () => navigate("/auth");
    const goToNewRoute = () => {
        /* navigate("/ruta/nueva"); */
    };

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div className={`flex items-center justify-end min-w-[64px] min-[701px]:min-w-[120px] 
            ${searchOpen ? "opacity-0 pointer-events-none min-[701px]:opacity-100 min-[701px]:pointer-events-auto" : "opacity-100"}
            transition-opacity duration-300 ml-auto`}>
            <div className="hidden min-[701px]:flex">
                <button
                    onClick={() => (user ? goToNewRoute() : goToAuth())}
                    className="btn text-secondary bg-transparent border-0 shadow-none focus:shadow-none hover:shadow-none gap-2"
                >
                    <CircleFadingPlus />
                    <p>Añade tu ruta</p>
                </button>
            </div>

            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className=" btn-ghost btn-circle avatar  border-0 shadow-none focus:shadow-none hover:shadow-none!p-0">
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
                        <div className="flex min-[701px]:hidden">
                            <button
                                onClick={() => (user ? goToNewRoute() : goToAuth())}
                                className="btn text-secondary bg-transparent border-0 shadow-none focus:shadow-none hover:shadow-none gap-2"
                            >
                                <CircleFadingPlus />
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
    );
};

export default UserActions;
