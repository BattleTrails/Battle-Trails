import Card from "@components/ui/card/card.tsx";
import {useEffect, useState, useMemo} from "react";
import {Post} from "@/types";
import {getPosts, getRouteByPostId} from "@/services/db-service.ts";
import { useSearchStore } from "@/store/useSearchStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { calculateDistance } from "@/utils/calculate-distance";

/**
 * Constantes que definen los percentiles para cada tipo de filtro.
 * Estos valores determinan qué porcentaje de posts se mostrarán en cada categoría.
 */
const PERCENTILES = {
  POPULARES: 0.2,  // Top 20% de posts con más likes
  VISTOS: 0.3,     // Top 30% de posts más vistos
  DESCUBRE: 0.2,   // Bottom 20% de posts con menos likes (joyas ocultas)
  CERCANOS: 0.3    // Top 30% de posts más cercanos
} as const;

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, activeFilters } = useSearchStore();
  const { latitude, longitude, error: locationError } = useGeolocation();

  /**
   * Efecto para cargar los posts iniciales desde la base de datos.
   * Se ejecuta solo una vez al montar el componente.
   */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsFromDb = await getPosts();
        setPosts(postsFromDb);
      } catch (error) {
        console.error("Error al cargar posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  /**
   * Filtra los posts basándose en el texto de búsqueda.
   * La búsqueda se realiza en título, descripción y nombre de ubicación.
   * Utiliza useMemo para evitar recálculos innecesarios.
   */
  const searchFilteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      post.locationName.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  /**
   * Filtra los posts basándose en estadísticas (likes y vistas).
   * Implementa la lógica para los filtros:
   * - Populares: top 20% de posts con más likes
   * - Vistos: top 30% de posts más vistos
   * - Joyas Ocultas: bottom 20% de posts con menos likes
   */
  const statsFilteredPosts = useMemo(() => {
    if (activeFilters.length === 0) return searchFilteredPosts;

    const filterSets = new Map<string, Set<string>>();
    const totalPosts = searchFilteredPosts.length;
    if (totalPosts === 0) return [];

    /**
     * Función helper para crear conjuntos de filtros basados en percentiles.
     * @param posts - Array de posts a filtrar
     * @param sortFn - Función de ordenamiento
     * @param percentile - Porcentaje de posts a incluir
     * @param isBottom - Si es true, toma los últimos posts en lugar de los primeros
     */
    const createFilterSet = (posts: Post[], sortFn: (a: Post, b: Post) => number, percentile: number, isBottom = false) => {
      const sorted = [...posts].sort(sortFn);
      const count = Math.ceil(totalPosts * percentile);
      const slice = isBottom ? sorted.slice(-count) : sorted.slice(0, count);
      return new Set(slice.map(p => p.id));
    };

    // Aplicar filtros de estadísticas según los filtros activos
    if (activeFilters.includes('populares')) {
      filterSets.set('populares', createFilterSet(
        searchFilteredPosts,
        (a, b) => b.likes - a.likes,
        PERCENTILES.POPULARES
      ));
    }

    if (activeFilters.includes('vistos')) {
      filterSets.set('vistos', createFilterSet(
        searchFilteredPosts,
        (a, b) => b.views - a.views,
        PERCENTILES.VISTOS
      ));
    }

    if (activeFilters.includes('descubre')) {
      filterSets.set('descubre', createFilterSet(
        searchFilteredPosts,
        (a, b) => b.likes - a.likes,
        PERCENTILES.DESCUBRE,
        true
      ));
    }

    // Aplicar todos los filtros activos (intersección de conjuntos)
    return searchFilteredPosts.filter(post => 
      activeFilters.every(filter => {
        const filterSet = filterSets.get(filter);
        return filterSet ? filterSet.has(post.id) : true;
      })
    );
  }, [searchFilteredPosts, activeFilters]);

  // Estado para los posts filtrados por distancia
  const [distanceFilteredPosts, setDistanceFilteredPosts] = useState<Post[]>([]);

  /**
   * Efecto para manejar el filtrado por distancia.
   * Calcula la distancia entre el usuario y cada post,
   * y muestra los posts más cercanos según el percentil definido.
   */
  useEffect(() => {
    const filterByDistance = async () => {
      // Si no hay filtro de cercanía o no hay ubicación, mostrar posts sin filtrar
      if (!activeFilters.includes('cercanos') || !latitude || !longitude) {
        setDistanceFilteredPosts(statsFilteredPosts);
        return;
      }

      try {
        // Calcular distancias para cada post
        const postsWithDistances = await Promise.all(
          statsFilteredPosts.map(async (post) => {
            try {
              const route = await getRouteByPostId(post.id);
              const firstWaypoint = route?.waypoints?.[0]?.geoPoint;
              
              if (!firstWaypoint) return { post, distance: Infinity };

              return {
                post,
                distance: calculateDistance(
                  latitude,
                  longitude,
                  firstWaypoint.latitude,
                  firstWaypoint.longitude
                )
              };
            } catch (error) {
              console.error(`Error al obtener ruta para post ${post.id}:`, error);
              return { post, distance: Infinity };
            }
          })
        );

        // Ordenar por distancia y tomar el percentil superior
        const sortedByDistance = postsWithDistances.sort((a, b) => a.distance - b.distance);
        const topDistanceCount = Math.ceil(statsFilteredPosts.length * PERCENTILES.CERCANOS);
        setDistanceFilteredPosts(sortedByDistance.slice(0, topDistanceCount).map(d => d.post));
      } catch (error) {
        console.error("Error al aplicar filtro de cercanía:", error);
        setDistanceFilteredPosts(statsFilteredPosts);
      }
    };

    filterByDistance();
  }, [statsFilteredPosts, activeFilters, latitude, longitude]);

  return (
    <div className="flex flex-col items-center gap-5 p-5">
      {loading ? (
        <p className="bg-transparent text-white/50">Cargando publicaciones...</p>
      ) : (
        <>
          {locationError && activeFilters.includes('cercanos') && (
            <p className="text-red-500 text-sm">{locationError}</p>
          )}
          <div className="grid grid-cols-1 pt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
            {distanceFilteredPosts.map((post) => (
              <Card key={post.id} post={post}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
