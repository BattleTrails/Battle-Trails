import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type Props = {
  onFocusChange?: (value: boolean) => void;
};

const SearchBox = ({ onFocusChange }: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isDetails = location.pathname.includes("/post");
  const isProfile = location.pathname.includes("/profile");

  const isExpanded = isFocused || isHovered;
  const sharedTransition = "transition-all duration-400 ease-in-out";

  const iconColorClass = isHome
    ? "text-white"
    : isDetails || isProfile
      ? "text-neutral-800"
      : "";

  const borderColorClass = isHome
    ? "border-white"
    : isDetails || isProfile
      ? "border-neutral-800"
      : "";

  const textColorClass = isHome
    ? "text-white placeholder-white"
    : isDetails || isProfile
      ? "text-neutral-800 placeholder-neutral-800"
      : "";

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

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
        relative flex items-center
        rounded-full overflow-hidden
        ${isDetails ? "bg-white/20 backdrop-blur-sm" : ""}
        ${sharedTransition}
      `}
      >
        <div
          className={`
          absolute top-1/2 -translate-y-1/2 
          flex items-center justify-center rounded-full bg-transparent 
          ${borderColorClass} border
          ${sharedTransition}
          ${isExpanded
            ? "left-2 translate-x-0 w-7 h-7"
            : "left-[80%] -translate-x-1/2 w-6 h-6"}
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
      </div>
    </div>
  );
}

  export default SearchBox;
