import { Search, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

type Props = {
  onFocusChange?: (value: boolean) => void;
  onSearch?: (query: string) => void;
};

const SearchBox = ({ onFocusChange, onSearch }: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";
  const isDetails = location.pathname.includes("/post");
  const isProfile = location.pathname.includes("/profile");

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 860); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isExpanded = isFocused || isHovered || searchValue.length > 0 || (!isScrolled && isHome && !isMobile);
  const sharedTransition = "transition-all duration-400 ease-in-out";

  const iconColorClass = isHome
    ? "text-white"
    : isDetails || isProfile
      ? "text-gray-600"
      : "text-neutral-600";

  const textColorClass = isHome
    ? "text-white placeholder-white/80"
    : isDetails || isProfile
      ? "text-gray-700 placeholder-gray-500"
      : "text-neutral-700 placeholder-neutral-400";

  const bgClass = isHome
    ? "bg-white/10 backdrop-blur-md"
    : isDetails || isProfile
      ? "bg-gray-100/80 backdrop-blur-sm border border-gray-200"
      : "bg-white/90 backdrop-blur-sm";

  const borderColorClass = isHome
    ? "border-white/20"
    : isDetails || isProfile
      ? "border-gray-300"
      : "border-neutral-300";

  // Crear la función debounce
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch?.(value);
    }, 200),
    [onSearch]
  );

  // Efecto para detectar el scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Verificar estado inicial

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isExpanded) {
      timeout = setTimeout(() => {
        setShowPlaceholder(true);
      }, 400);
    } else {
      setShowPlaceholder(false);
    }
    return () => clearTimeout(timeout);
  }, [isExpanded]);

  useEffect(() => {
    onFocusChange?.(isExpanded);
  }, [isExpanded]);

  // Efecto para manejar el parámetro de búsqueda en la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    
    if (searchQuery) {
      setSearchValue(searchQuery);
      onSearch?.(searchQuery);
    } else if (isHome) {
      setSearchValue("");
      onSearch?.("");
    }
  }, [location.search, isHome, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isHome && searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (isHome) {
      debouncedSearch(value);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    onSearch?.("");
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
        relative flex items-center
        rounded-full overflow-hidden
        ${bgClass}
        ${sharedTransition}
        ${isExpanded 
          ? "shadow-lg shadow-black/5" 
          : "shadow-md shadow-black/3"
        }
        
      `}
      >
        <div
          className={`
          absolute top-1/2 -translate-y-1/2 
          flex items-center justify-center rounded-full
          ${sharedTransition}
          ${isExpanded
            ? "left-2 translate-x-0 w-7 h-7 bg-gray-100/60"
            : "left-[80%] -translate-x-1/2 w-6 h-6 bg-gray-100/60"}
        `}
        >
          <Search
            size={16}
            className={`
            ${sharedTransition}
            ${iconColorClass}
          `}
          />
        </div>

        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={showPlaceholder ? "Buscar rutas o lugares..." : ""}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
          pl-11 pr-8 rounded-full outline-none border text-sm font-light
          placeholder:top-[-1px] placeholder:relative 
          ${sharedTransition}
          ${isExpanded
            ? `w-72 h-10 bg-transparent ${textColorClass} ${borderColorClass} shadow-lg`
            : `w-8 h-8 cursor-pointer ${borderColorClass}`}
          focus:w-72 hover:w-72
        `}
        />

        {searchValue && (
          <button
            onClick={handleClear}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2
              p-1 rounded-full
              ${sharedTransition}
              ${isHome 
                ? "text-white/80 hover:text-white hover:bg-white/20" 
                : isDetails || isProfile
                  ? "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                  : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
              }
              hover:scale-110 active:scale-95
            `}
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Efecto de brillo en hover */}
      <div
        className={`
          absolute inset-0 rounded-full
          bg-gradient-to-r from-transparent via-white/10 to-transparent
          ${sharedTransition}
          ${isHovered || isFocused ? "opacity-100" : "opacity-0"}
          pointer-events-none
        `}
      />
    </div>
  );
}

export default SearchBox;
