import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@layouts/Header/logo"
import SearchBarWrapper from "@layouts/Header/search-bar-wrapper.tsx";
import UserActions from "@layouts/Header/user-actions.tsx";




const Header = () => {
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <div className="fixed flex items-center top-0 left-0 w-full z-50 bg-primary shadow-sm h-[70px] md:h-[80px] lg:h-[90px] px-4 py-4 md:py-5 lg:py-6">
            <div className="relative flex items-center w-full h-full">
                <Logo searchOpen={searchOpen} onClick={() => navigate("/")} />
                <SearchBarWrapper setSearchOpen={setSearchOpen} />
                <UserActions searchOpen={searchOpen} />
            </div>
        </div>
    );
};

export default Header;
