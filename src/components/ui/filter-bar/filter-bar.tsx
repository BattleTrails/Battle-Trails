import { useState } from "react";
import { Eye, Flame, Gem, LocateFixed } from "lucide-react";
import clsx from "clsx";

const FILTERS = [
  { key: "populares", label: "Populares", icon: Flame },
  { key: "cercanos", label: "Cercanos", icon: LocateFixed },
  { key: "vistos", label: "Más vistos", icon: Eye },
  { key: "descubre", label: "Joyas Ocultas", icon: Gem },
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

  return (
    <div
      className={clsx(
        // MOBILE
        "w-full flex justify-between h-[70px] text-[14px]",
        // DESKTOP override
        "md:h-auto md:w-auto md:justify-center md:flex-wrap md:gap-3 md:rounded-4xl md:px-2 md:py-3"
      )}
    >
      {FILTERS.map(({ key, label, icon: Icon }) => {
        const isActive = selectedFilters.includes(key);
        return (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            className={clsx(
              // MOBILE
              "flex flex-col flex-1 items-center justify-center h-full",
              // DESKTOP override
              "md:flex-row md:flex-none md:gap-2 md:px-4 md:py-2 md:rounded-full md:border-2 md:text-sm",
              isActive
                ? "text-secondary md:border-secondary md:font-semibold"
                : "text-accent/60 md:border-transparent md:hover:border-white"
            )}
          >
            <Icon className="w-5 h-5 mb-1 md:mb-0" />
            <span className="text-[11px] md:text-sm">{label}</span>
            {isActive && (
              <div className="mt-1 h-[2px] w-6 bg-secondary rounded-full md:hidden" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterBar;
