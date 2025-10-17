import { useAuth } from '@/context/auth-context.tsx';
import { logout } from '@/services/auth-service.ts';
import { useNavigate } from 'react-router-dom';
import { CircleFadingPlus, CircleUserRound } from 'lucide-react';

import {
  CLASS_BELOW_BP_HIDDEN,
  CLASS_BELOW_BP_WIDTH,
  CLASS_HIDE_BELOW_BP_OPACITY,
  CLASS_MIN_BP_HIDDEN,
  CLASS_MIN_BP_WIDTH,
  CLASS_OPACITY_TOGGLE,
} from '@layouts/header/header-breakpoints/headerBreakpoints.ts';
import clsx from 'clsx';
import defaultAvatar from '../../../../public/avatars/avatar-1.webp';

const HeaderUserActions = ({
  searchOpen,
  currentPath,
  isScrolled,
}: {
  searchOpen: boolean;
  currentPath: string;
  isScrolled: boolean;
}) => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  const goToAuth = () => navigate('/auth');
  const goToNewRoute = () => {
    navigate('/new');
  };

  const isHome = currentPath === '/';
  const isForge = currentPath.startsWith('/new');
  const isProfile = currentPath.includes('/profile');
  const isDetails = currentPath.includes('/post');

  const headerClass = isHome ? '' : isForge ? '!pointer-events-none !hidden' : '';

  // Función para cerrar el dropdown
  const closeDropdown = () => {
    // Eliminar el foco del elemento activo para cerrar el dropdown
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    closeDropdown(); // Cerrar dropdown después de logout
  };

  const goToProfile = () => {
    if (user) {
      navigate(`/profile`);
      closeDropdown(); // Cerrar dropdown después de navegar
    }
  };

  const handleAuthClick = () => {
    goToAuth();
    closeDropdown(); // Cerrar dropdown después de navegar
  };

  const handleNewRouteClick = () => {
    if (user) {
      goToNewRoute();
    } else {
      goToAuth();
    }
    closeDropdown(); // Cerrar dropdown después de navegar
  };

  // Los datos del perfil ya están disponibles en userProfile del contexto
  // y se actualizan automáticamente con onSnapshot

  return (
    <div
      className={`flex items-center justify-end 
                        ${CLASS_BELOW_BP_WIDTH} ${CLASS_MIN_BP_WIDTH}
                        ${searchOpen ? CLASS_HIDE_BELOW_BP_OPACITY : 'opacity-100'}
                        ${CLASS_OPACITY_TOGGLE}`}
    >
      {/* Botón visible desde el breakpoint */}
      <div className={`${CLASS_BELOW_BP_HIDDEN} ${headerClass} `}>
        <button
          onClick={() => (user ? goToNewRoute() : goToAuth())}
          className={clsx(
            'btn text-accent bg-transparent border-0 font-medium space-x-2 shadow-none focus:shadow-none hover:shadow-none gap-2 transition-all duration-300',
            isHome
              ? isScrolled
                ? 'lg:opacity-0 lg:-z-10 lg:pointer-events-none'
                : 'lg:flex'
              : isScrolled || isProfile || !isDetails
              ? 'text-accent lg:opacity-0 lg:-z-10 lg:pointer-events-none'
              : 'sm:flex lg:hidden'
          )}
        >
          <p>Añade tu ruta</p>
          <CircleFadingPlus size={42} strokeWidth={1} className="text-secondary" />
        </button>
      </div>

      {/* Dropdown del avatar */}
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className={clsx(
            'btn-ghost btn-circle avatar border-0 shadow-none focus:shadow-none hover:shadow-none !p-0 transition-all duration-300',
            // Cambio el breakpoint para que se oculte cuando sea menor o igual a 1340px
            isScrolled &&
              searchOpen &&
              'max-[1340px]:opacity-0 max-[1340px]:-z-10 max-[1340px]:pointer-events-none'
          )}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer ml-auto">
            {user ? (
              <img
                alt="user avatar"
                src={userProfile?.profilePicture || defaultAvatar}
                className="w-full h-full object-cover"
              />
            ) : (
              <CircleUserRound className="w-full h-full text-gray-400" strokeWidth={1} />
            )}
          </div>
        </div>

        {!loading && (
          <ul className="menu menu-sm dropdown-content bg-base-100 rounded-field z-10 mt-3 w-fit min-w-[160px] p-2 gap-1 shadow">
            {/* Botón mobile visible solo por debajo del breakpoint o en desktop si isHome && isScrolled */}
            {!isForge && (
              <li
                className={clsx(
                  'flex',
                  isHome && isScrolled ? 'lg:flex' : CLASS_MIN_BP_HIDDEN,
                  isScrolled && '!flex'
                )}
              >
                <button onClick={handleNewRouteClick} className="w-full text-left text-secondary">
                  Añade tu ruta
                </button>
              </li>
            )}

            {user ? (
              <>
                <li className="pointer-events-none hover:bg-transparent">
                  <span className="text-sm font-medium text-neutral whitespace-nowrap">
                    {userProfile?.name || user?.email || 'Usuario'}
                  </span>
                </li>
                <li>
                  <button onClick={goToProfile} className="w-full text-left">
                    Perfil
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout} className="w-full text-left">
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button onClick={handleAuthClick} className="w-full text-left">
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
