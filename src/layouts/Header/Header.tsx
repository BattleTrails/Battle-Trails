import {useNavigate} from "react-router-dom";
import SearchBox from "@components/ui/SearchBox/SearchBox";
import logo from "@assets/btlogo_full.svg";

const Header = () => {
    const navigate = useNavigate();

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
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-field z-1 mt-3 w-52 p-2 shadow"
                    >
                        <li><a onClick={goToAuth}>Iniciar Sesion</a></li>
                        <li><a>Perfil</a></li>
                        <li><a>Cerrar Sesion</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Header;
