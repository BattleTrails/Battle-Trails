import {useAuthHandler} from "@hooks/useAuthHandler.ts";
import {logout} from "@/services/auth-service.ts";
import {useNavigate} from "react-router-dom";
import {CircleFadingPlus,CircleUserRound} from "lucide-react";


import {
  CLASS_BELOW_BP_HIDDEN,
  CLASS_BELOW_BP_WIDTH,
  CLASS_HIDE_BELOW_BP_OPACITY,
  CLASS_MIN_BP_HIDDEN,
  CLASS_MIN_BP_WIDTH,
  CLASS_OPACITY_TOGGLE
} from "@layouts/header/header-breakpoints/headerBreakpoints.ts";
import clsx from "clsx";
import {useEffect, useState} from "react";
import {doc, getDoc} from "firebase/firestore";
import {db} from "@config/firebaseConfig.ts";
import defaultAvatar from "@assets/avatars/avatar-1.webp";

const HeaderUserActions = ({searchOpen, currentPath,isScrolled}: { searchOpen: boolean; currentPath: string;isScrolled:boolean }) => {
  const {user, loading} = useAuthHandler();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState<string>(defaultAvatar);






  const goToAuth = () => navigate("/auth");
  const goToNewRoute = () => {
    navigate("/new");
  };

  const isHome = currentPath === "/";
  const isForge = currentPath.startsWith("/new");
  const isProfile = currentPath.includes("/profile");

  const headerClass = isHome
    ? ""
    : isForge ? "!pointer-events-none !hidden" : "";


  const handleLogout = async () => {
    await logout();
    navigate("/");

  };
  const goToProfile = () => {
    if (user) {
      navigate(`/profile`);

    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfilePicture(data.profilePicture);
      }
    };

    fetchUserProfile();
  }, [user]);


  return (
    <div
      className={`flex items-center justify-end 
                        ${CLASS_BELOW_BP_WIDTH} ${CLASS_MIN_BP_WIDTH}
                        ${searchOpen ? CLASS_HIDE_BELOW_BP_OPACITY : "opacity-100"}
                        ${CLASS_OPACITY_TOGGLE}`}
    >
      {/* Botón visible desde el breakpoint */}
      <div className={`${CLASS_BELOW_BP_HIDDEN} ${headerClass}`}>

        <button
          onClick={() => (user ? goToNewRoute() : goToAuth())}
          className={clsx("btn text-secondary bg-transparent border-0 shadow-none focus:shadow-none hover:shadow-none gap-2",
            isScrolled || isProfile  ? "min-[1250px]:!hidden" : "min-[1250px]:flex",)}
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
          className={clsx(
            "btn-ghost btn-circle avatar border-0 shadow-none focus:shadow-none hover:shadow-none !p-0 transition-all duration-300",
            // Aplica solo en pantallas >= 1250px

            isScrolled && searchOpen && "min-[1250px]:opacity-0 min-[1250px]:-z-10 min-[1250px]:pointer-events-none"
          )}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer ml-auto">
            {user ? <img
              alt="user avatar"
              src={profilePicture}
              className="w-full h-full object-cover"
            /> : <CircleUserRound className="w-full h-full text-gray-400" strokeWidth={1} />}

          </div>
        </div>

        {!loading && (
          <ul
            className="menu menu-sm dropdown-content bg-base-100 rounded-field z-10 mt-3 w-fit min-w-[160px] p-2 gap-1 shadow">
            {/* Botón mobile visible solo por debajo del breakpoint */}
            {!isForge && (
              <li className={clsx(
                "flex",
                CLASS_MIN_BP_HIDDEN,
                isScrolled && "!flex"
              )}>
                <button
                  onClick={() => (user ? goToNewRoute() : goToAuth())}
                  className="w-full text-left text-secondary"
                >
                  Añade tu ruta
                </button>
              </li>
            )}

            {user ? (
              <>
                <li className="pointer-events-none hover:bg-transparent">
                  <span className="text-sm text-neutral whitespace-nowrap">{user.email}</span>
                </li>
                <li> <button onClick={goToProfile} className="w-full text-left">
                  Perfil
                </button></li>
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
