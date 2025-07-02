import { Eye, Flame, Gem, LocateFixed } from "lucide-react";
import clsx from "clsx";
import { useSearchStore, FilterType } from "@/store/useSearchStore";

const FILTERS = [
  { key: "populares" as FilterType, label: "Populares", icon: Flame },
  { key: "cercanos" as FilterType, label: "Cercanos", icon: LocateFixed },
  { key: "vistos" as FilterType, label: "Más vistos", icon: Eye },
  { key: "descubre" as FilterType, label: "Joyas Ocultas", icon: Gem },
];


const FilterBar = () => {
  const { activeFilters, toggleFilter } = useSearchStore();

  const handleFilterClick = (filter: FilterType) => {
    toggleFilter(filter);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        const isActive = activeFilters.includes(key);
        return (
          <button
            key={key}
            onClick={() => handleFilterClick(key)}
            className={clsx(
              // MOBILE
              "flex flex-col flex-1 items-center justify-center h-full",
              // DESKTOP override
              "md:flex-row md:flex-none md:gap-2 md:px-4 md:py-2 md:rounded-full md:border-1 md:text-sm font-light",
              isActive
                ? "text-secondary md:border-secondary "
                : "text-accent/60 md:border-transparent md:hover:border-white"
            )}
          >
            <Icon className="w-5 h-5 mb-1 md:mb-0" strokeWidth={1}/>
            <span className="text-[11px] md:text-sm">{label}</span>
            {isActive && (
              <div className="mt-1 h-[1px] w-6 bg-secondary rounded-full md:hidden" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterBar;
