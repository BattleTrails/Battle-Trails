import {useState} from "react";
import {
    Flame,
    LocateFixed,
    Compass,
    Eye,
    Search,
} from "lucide-react";

const FILTERS = [
    {key: "populares", label: "Populares", icon: Flame},
    {key: "cercanos", label: "Cercanos", icon: LocateFixed},
    {key: "explorados", label: "Más explorados", icon: Compass},
    {key: "vistos", label: "Más vistos", icon: Eye},
    {key: "descubre", label: "Descubre", icon: Search},
];

// Define qué combinaciones son válidas
const VALID_COMBINATIONS: Record<string, string[]> = {
    populares: ["cercanos", "vistos"],
    cercanos: ["populares", "descubre"],
    explorados: ["vistos"],
    vistos: ["populares", "explorados"],
    descubre: ["cercanos"],
};

const FilterBar = () => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    const toggleFilter = (key: string) => {
        const isSelected = selectedFilters.includes(key);

        if (isSelected) {
            // Deselecciona
            setSelectedFilters((prev) => prev.filter((f) => f !== key));
        } else if (selectedFilters.length === 0) {
            // Primera selección
            setSelectedFilters([key]);
        } else {
            const validWithCurrent = selectedFilters.every((f) =>
                VALID_COMBINATIONS[f]?.includes(key)
            );

            if (validWithCurrent) {
                setSelectedFilters((prev) => [...prev, key]);
            } else {
                // Si no es compatible, reemplaza el anterior con el nuevo
                setSelectedFilters([key]);
            }
        }
    };

    return (
        <div className="bg-base-100 rounded-4xl mx-auto px-2 py-3 shadow flex flex-wrap justify-center gap-3 max-w-full">

        {FILTERS.map(({key, label, icon: Icon}) => {
                const isActive = selectedFilters.includes(key);

                return (
                    <button
                        key={key}
                        onClick={() => toggleFilter(key)}
                        className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm ${
                            isActive
                                ? "bg-accent text-secondary font-semibold"
                                : "hover:bg-accent/20"
                        }`}
                    >
                        <Icon className="w-4 h-4"/>
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default FilterBar;
