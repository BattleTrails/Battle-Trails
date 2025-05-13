import logo from "@assets/btlogo_full.svg";
import logo2 from "@assets/Logo-sm.svg";

import {
    CLASS_BELOW_BP_WIDTH,
    CLASS_MIN_BP_WIDTH,
    CLASS_HIDE_BELOW_BP_OPACITY,
    CLASS_OPACITY_TOGGLE,
    CLASS_LOGO_LARGE,
    CLASS_LOGO_SMALL
} from "@layouts/header/header-breakpoints/headerBreakpoints.ts";

const HeaderLogo = ({searchOpen, onClick}: { searchOpen: boolean; onClick: () => void }) => {
    return (
        <div
            className={`flex items-center cursor-pointer justify-start 
        ${CLASS_BELOW_BP_WIDTH} ${CLASS_MIN_BP_WIDTH} 
        ${searchOpen ? CLASS_HIDE_BELOW_BP_OPACITY : "opacity-100"} 
        ${CLASS_OPACITY_TOGGLE}`}
            onClick={onClick}
        >
            <img src={logo} alt="logo" className={`${CLASS_LOGO_LARGE} h-10`}/>
            <img src={logo2} alt="logo" className={`${CLASS_LOGO_SMALL} h-8`}/>
        </div>
    );
};

export default HeaderLogo;
