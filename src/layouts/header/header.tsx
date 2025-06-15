import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import HeaderLogo from "@layouts/header/header-logo/header-logo.tsx";
import HeaderSearchBarWrapper from "@layouts/header/header-search-bar-wrapper/header-search-bar-wrapper.tsx";
import HeaderUserActions from "@layouts/header/header-user-actions/header-user-actions.tsx";
import FilterBar from "@components/ui/filter-bar/filter-bar.tsx";
import clsx from "clsx";


const Header = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const [isScrolled, setIsScrolled] = useState(false);


  const isHome = currentPath === "/";
  const isForge = currentPath.startsWith("/new")|| currentPath.startsWith("/edit");
  const isDetails = currentPath.includes("/post");
  const isProfile = currentPath.includes("/profile");

  const headerClass = isHome
    ? ""
    : isForge ? "!h-[75px] " : isDetails || isProfile ? "!h-[75px] !md:-[75px] " : "";

  useEffect(() => {
    if (isDetails) {
      setIsScrolled(true);
      return; // no añadir el listener en este caso
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDetails]);


  return (
    <div
      className={clsx(
        "fixed flex-col gap-5 transition-all duration-300 flex items-center top-0 left-0 w-full z-50 h-[140px] md:h-[140px] lg:h-[140px] px-4 py-4",
        !isDetails && "backdrop-blur-sm",
        headerClass,
        isScrolled && "min-[1250px]:!h-[75px]"
      )
      }
    >
      <div className="relative flex flex-row justify-between items-center w-full h-full ">
        <HeaderLogo searchOpen={searchOpen}
                    onClick={() => navigate("/")}
                    currentPath={currentPath}/>

        <div
          className={clsx(
            "w-full max-w-md flex justify-center transition-transform duration-300",
            "min-[1250px]:absolute min-[1250px]:top-1/2 min-[1250px]:left-1/2 min-[1250px]:-translate-y-1/2",
            isScrolled
              ? "min-[1250px]:translate-x-[240px]"
              : "min-[1250px]:-translate-x-1/2"
          )}
        >

        <HeaderSearchBarWrapper
            setSearchOpen={setSearchOpen}
            currentPath={currentPath}
          />
        </div>

        <HeaderUserActions searchOpen={searchOpen} currentPath={currentPath} isScrolled={isScrolled}/>

      </div>
      {isHome && (
        <div
          className={clsx(
            "transition-transform duration-300 w-full",
            isScrolled
              ? "min-[1250px]:-translate-y-18 min-[1250px]:w-auto"
              : "min-[1250px]:translate-y-0 min-[1250px]:w-auto"
          )}
        >
          <FilterBar />
        </div>
      )}


    </div>
  );
};

export default Header;
