import iconslogo from "@assets/iconslogo.svg"
import {Handshake} from "lucide-react"

const AuthHeader = () => {
    return (
        <div className="flex flex-col justify-center items-center pt-8 text-center gap-8">
            <img src={iconslogo} alt="Logo"/>

            <div className="flex items-end justify-center text-[20px] gap-3">
                <div className="w-[120px] text-right">
                    <p>Bienvenido!</p>
                </div>
                <Handshake color="#D4AF37" className="w-6 h-6" />
                <div className="w-[120px] text-left">
                    <p>Registrate</p>
                </div>
            </div>
        </div>

    );
};

export default AuthHeader;