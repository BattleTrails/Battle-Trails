import {Mail, Lock} from "lucide-react";
import {AuthInputsProps} from "@/types";
import {JSX} from "react";


const AuthInputs = ({email, password, setEmail, setPassword}: AuthInputsProps): JSX.Element => {
    return (
        <div className="flex flex-col gap-5 w-[350px]">
            {/* Email Input */}
            <div className="flex flex-col gap-1">
                <label htmlFor="email" className=" text-left font-medium ">Correo electrónico</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input
                        type="text"
                        id="email"
                        placeholder="Escribe tu correo"
                        className="w-full h-[48px] bg-white border border-gray-200 rounded-field pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 shadow focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1">
                <label htmlFor="password" className=" text-left font-medium ">Contraseña</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input
                        type="password"
                        id="password"
                        placeholder="Introduce tu contraseña"
                        className="w-full h-[48px] bg-white border border-gray-200 rounded-field pl-10 pr-4 py-3 text-gray-800 placeholder-gray-400 shadow focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <p className="text-sm text-left text-accent/70 cursor-pointer hover:text-accent w-fit">¿Olvidaste la
                    contraseña?</p>
            </div>


        </div>
    );
};

export default AuthInputs;
