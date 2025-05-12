import logo from "@assets/btlogo_full.svg";
import logo2 from "@assets/Logo-sm.svg";

const Logo = ({ searchOpen, onClick }: { searchOpen: boolean, onClick: () => void }) => {
    return (
        <div
            className={`flex items-center cursor-pointer justify-start min-w-[64px] min-[701px]:min-w-[120px]
            ${searchOpen ? "opacity-0 pointer-events-none min-[701px]:opacity-100 min-[701px]:pointer-events-auto" : "opacity-100"}
            transition-opacity duration-300`}
            onClick={onClick}
        >
            <img src={logo} alt="logo" className="hidden min-[701px]:block h-10" />
            <img src={logo2} alt="logo" className="block min-[701px]:hidden h-8" />
        </div>
    );
};

export default Logo;
