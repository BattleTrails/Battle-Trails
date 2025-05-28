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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={clsx(
        "fixed flex-col gap-4 backdrop-blur-sm transition-all duration-300 flex items-center top-0 left-0 w-full z-50 h-[140px] md:h-[140px] lg:h-[150px] px-4 py-4 md:py-5 lg:py-6",
        isScrolled ? "min-[801px]:!h-[70px]" : ""
      )}
    >
      <div className="relative flex flex-row justify-between items-center w-full h-full ">
        <HeaderLogo searchOpen={searchOpen}
                    onClick={() => navigate("/")}
                    currentPath={currentPath}/>

        <div
          className={clsx(
            "w-full max-w-md flex justify-center transition-transform duration-300",
            "min-[801px]:absolute min-[801px]:top-1/2 min-[801px]:left-1/2 min-[801px]:-translate-y-1/2",
            isScrolled
              ? "min-[801px]:translate-x-[290px]"
              : "min-[801px]:-translate-x-1/2"
          )}
        >

        <HeaderSearchBarWrapper
            setSearchOpen={setSearchOpen}
            currentPath={currentPath}
          />
        </div>

        <HeaderUserActions searchOpen={searchOpen} currentPath={currentPath}/>

      </div>
      <div
        className={clsx(
          "transition-transform duration-300 w-fill",
          isScrolled ? "min-[801px]:-translate-y-14" : "min-[801px]:translate-y-0"
        )}
      >

      <FilterBar />
      </div>
    </div>
  );
};

export default Header;
