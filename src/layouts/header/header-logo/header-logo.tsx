import {
  CLASS_BELOW_BP_WIDTH,
  CLASS_HIDE_BELOW_BP_OPACITY,
  CLASS_LOGO_LARGE,
  CLASS_LOGO_SMALL,
  CLASS_MIN_BP_WIDTH,
  CLASS_OPACITY_TOGGLE
} from "@layouts/header/header-breakpoints/headerBreakpoints.ts";
import BtLogoLg from "@components/logo/bt-logo-lg/bt-logo-lg.tsx";
import BtLogoSm from "@components/logo/bt-logo-sm/bt-logo-sm.tsx";

const HeaderLogo = ({searchOpen, onClick, currentPath}: {
  searchOpen: boolean;
  onClick: () => void;
  currentPath: string
}) => {

  const isHome = currentPath === "/";
  const isForge = currentPath.startsWith("/new");


  const logoColor = isHome ? "text-white" : isForge ? "text-neutral" : "text-accent";


  return (
    <div
      className={`flex items-center cursor-pointer justify-start 
        ${CLASS_BELOW_BP_WIDTH} ${CLASS_MIN_BP_WIDTH} 
        ${searchOpen ? CLASS_HIDE_BELOW_BP_OPACITY : "opacity-100"} 
        ${CLASS_OPACITY_TOGGLE}`}
      onClick={onClick}
    >
      {/*<img src={logo} alt="logo" className={`${CLASS_LOGO_LARGE} h-10`}/>
            <img src={logo2} alt="logo" className={`${CLASS_LOGO_SMALL} h-8`}/>*/}
      <BtLogoLg className={`${CLASS_LOGO_LARGE} h-10 ${logoColor}`}/>
      <BtLogoSm className={`${CLASS_LOGO_SMALL} h-8 ${logoColor}`}/>
    </div>
  );
};

export default HeaderLogo;
