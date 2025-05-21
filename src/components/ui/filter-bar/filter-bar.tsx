import {useEffect, useState} from "react";
import {Eye, Flame, Gem, LocateFixed,} from "lucide-react";

const FILTERS = [
  {key: "populares", label: "Populares", icon: Flame},
  {key: "cercanos", label: "Cercanos", icon: LocateFixed},
  /*{ key: "explorados", label: "Más explorados", icon: Compass },*/
  {key: "vistos", label: "Más vistos", icon: Eye},
  {key: "descubre", label: "Joyas Ocultas", icon: Gem},
];

const VALID_COMBINATIONS: Record<string, string[]> = {
  populares: ["cercanos", "vistos"],
  cercanos: ["populares", "descubre"],
  explorados: ["vistos"],
  vistos: ["populares", "explorados"],
  descubre: ["cercanos"],
};

const FilterBar = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const toggleFilter = (key: string) => {
    const isSelected = selectedFilters.includes(key);

    if (isSelected) {
      setSelectedFilters((prev) => prev.filter((f) => f !== key));
    } else if (selectedFilters.length === 0) {
      setSelectedFilters([key]);
    } else {
      const validWithCurrent = selectedFilters.every((f) =>
        VALID_COMBINATIONS[f]?.includes(key)
      );

      if (validWithCurrent) {
        setSelectedFilters((prev) => [...prev, key]);
      } else {
        setSelectedFilters([key]);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 701);
    };

    handleResize(); // inicial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <div
        className="fixed top-[70px] z-40 w-full h-[70px] bg-primary border-b border-neutral text-[14px] flex items-center">
        {FILTERS.map(({key, label, icon: Icon}) => {
          const isActive = selectedFilters.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <Icon
                className={`w-5 h-5 mb-1 ${
                  isActive ? "text-secondary" : "text-accent/60"
                }`}
              />
              <span
                className={`text-[11px] font-medium ${
                  isActive ? "text-secondary" : "text-accent/60"
                }`}
              >
                {label}
              </span>
              {isActive && (
                <div className="mt-1 h-[2px] w-6 bg-secondary rounded-full"/>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // 🖥 Desktop layout (original intacto)
  return (
    <div
      className="bg-base-100 rounded-4xl mx-auto px-2 py-3 shadow flex flex-wrap justify-center gap-3 max-w-full">
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
