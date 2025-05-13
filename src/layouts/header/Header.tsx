import {useState} from "react";
import {useNavigate} from "react-router-dom";
import HeaderLogo from "@layouts/header/header-logo/header-logo.tsx";
import HeaderSearchBarWrapper from "@layouts/header/header-search-bar-wrapper/header-search-bar-wrapper.tsx";
import HeaderUserActions from "@layouts/header/header-user-actions/header-user-actions.tsx";


const Header = () => {
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <div
            className="fixed flex items-center top-0 left-0 w-full z-50 bg-primary shadow-sm h-[70px] md:h-[70px] lg:h-[90px] px-4 py-4 md:py-5 lg:py-6">
            <div className="relative flex items-center w-full h-full">
                <HeaderLogo searchOpen={searchOpen} onClick={() => navigate("/")}/>
                <HeaderSearchBarWrapper setSearchOpen={setSearchOpen}/>
                <HeaderUserActions searchOpen={searchOpen}/>
            </div>
        </div>
    );
};

export default Header;
