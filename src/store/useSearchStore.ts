import { create } from 'zustand';

export type FilterType = 'populares' | 'cercanos' | 'vistos' | 'descubre';

interface SearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilters: FilterType[];
  setActiveFilters: (filters: FilterType[]) => void;
  toggleFilter: (filter: FilterType) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  activeFilters: [],
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  toggleFilter: (filter) => set((state) => {
    const isSelected = state.activeFilters.includes(filter);
    if (isSelected) {
      return { activeFilters: state.activeFilters.filter(f => f !== filter) };
    }
    if (state.activeFilters.length === 0) {
      return { activeFilters: [filter] };
    }
    // Validar combinaciones
    const validWithCurrent = state.activeFilters.every(f => 
      VALID_COMBINATIONS[f]?.includes(filter)
    );
    if (validWithCurrent) {
      return { activeFilters: [...state.activeFilters, filter] };
    }
    return { activeFilters: [filter] };
  }),
}));

// Combinaciones válidas de filtros
const VALID_COMBINATIONS: Record<FilterType, FilterType[]> = {
  populares: ['cercanos', 'vistos'],
  cercanos: ['populares', 'descubre'],
  vistos: ['populares'],
  descubre: ['cercanos'],
}; 