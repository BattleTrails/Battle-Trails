import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import HeaderLogo from "@layouts/header/header-logo/header-logo.tsx";
import HeaderSearchBarWrapper from "@layouts/header/header-search-bar-wrapper/header-search-bar-wrapper.tsx";
import HeaderUserActions from "@layouts/header/header-user-actions/header-user-actions.tsx";
import FilterBar from "@components/ui/filter-bar/filter-bar.tsx";


const Header = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div
      className={`fixed flex-col gap-4 backdrop-blur-sm  flex items-center top-0 left-0 w-full z-50  h-[140px] md:h-[140px] lg:h-[150px] px-4 py-4 md:py-5 lg:py-6  `}>
      <div className="relative flex items-center w-full h-full ">
        <HeaderLogo searchOpen={searchOpen}
                    onClick={() => navigate("/")}
                    currentPath={currentPath}/>

        <HeaderSearchBarWrapper setSearchOpen={setSearchOpen} currentPath={currentPath}/>
        <HeaderUserActions searchOpen={searchOpen} currentPath={currentPath}/>

      </div>
      <FilterBar/>
    </div>
  );
};

export default Header;
