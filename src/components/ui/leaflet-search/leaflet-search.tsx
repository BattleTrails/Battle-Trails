import { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";
import { searchPlaces, GeocodingResult } from "@/services/geocoding-service";
import debounce from "lodash.debounce";

interface LeafletSearchProps {
  onPlaceSelect: (result: GeocodingResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const LeafletSearch = ({
  onPlaceSelect,
  placeholder = "Buscar ubicación...",
  className = "",
  disabled = false
}: LeafletSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Función de búsqueda con debounce
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 3) {
        setResults([]);
        setShowResults(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchPlaces(searchQuery);
        setResults(searchResults);
        setShowResults(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error en búsqueda:", error);
        setResults([]);
        setShowResults(false);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);
    setIsLoading(true);
    debouncedSearch(value);
  };

  const handlePlaceSelect = (result: GeocodingResult) => {
    setQuery(result.displayName);
    setShowResults(false);
    setResults([]);
    setSelectedIndex(-1);
    onPlaceSelect(result);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handlePlaceSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay para permitir que se ejecute el click en los resultados
    setTimeout(() => {
      setShowResults(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => query.length >= 3 && setShowResults(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${disabled ? "text-gray-500" : "text-gray-900"}
          `}
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {showResults && (results.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
              <span className="ml-2 text-sm">Buscando...</span>
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={result.placeId}
                type="button"
                onClick={() => handlePlaceSelect(result)}
                className={`
                  w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50
                  ${index === selectedIndex ? "bg-blue-50" : ""}
                  ${index === 0 ? "rounded-t-lg" : ""}
                  ${index === results.length - 1 ? "rounded-b-lg" : ""}
                `}
              >
                <div className="text-sm font-medium text-gray-900">
                  {result.displayName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {result.address}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {showResults && !isLoading && results.length === 0 && query.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-3 text-center text-gray-500 text-sm">
            No se encontraron resultados para "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafletSearch;
