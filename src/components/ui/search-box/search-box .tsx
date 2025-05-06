import {Search} from "lucide-react";
import {useEffect, useState} from "react";

const SearchBox = () => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showPlaceholder, setShowPlaceholder] = useState(false);

    const isExpanded = isFocused || isHovered;
    const sharedTransition = "transition-all duration-400 ease-in-out";

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (isExpanded) {
            timeout = setTimeout(() => {
                setShowPlaceholder(true);
            }, 400);
        } else {
            setShowPlaceholder(false);
        }
        return () => clearTimeout(timeout);
    }, [isExpanded]);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative">
                <div
                    className={`
                        absolute top-1/2 -translate-y-1/2 
                        flex items-center justify-center rounded-full bg-primary backdrop-blur-sm
                        w-6 h-6
                        ${sharedTransition}
                        ${isExpanded
                        ? "left-2 translate-x-0 w-7 h-7"
                        : "left-[80%] -translate-x-1/2 "}
                    `}
                >
                    <Search
                        size={16}
                        className={`
                            ${sharedTransition}
                            ${isExpanded ? "text-secondary" : "text-white/70"}
                        `}
                    />
                </div>

                <input
                    type="text"
                    placeholder={showPlaceholder ? "Buscar rutas o lugares..." : ""}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
                        pl-11 pr-8 rounded-full bg-white/20 text-white placeholder-white/60 outline-none border text-sm font-light
                        placeholder:top-[-1px] placeholder:relative 
                        ${sharedTransition}
                        ${isExpanded
                        ? "w-64 h-10 bg-white text-secondary placeholder-secondary border-secondary shadow-lg"
                        : "w-8 h-8 border-transparent cursor-pointer"}
                        focus:w-64 hover:w-64
                    `}
                />
            </div>
        </div>
    );
};

export default SearchBox;
