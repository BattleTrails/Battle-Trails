import Card from "@components/ui/card/card.tsx";
import {useEffect, useState, useMemo} from "react";
import {Post} from "@/types";
import {getPosts, getRouteByPostId} from "@/services/db-service.ts";
import { useSearchStore } from "@/store/useSearchStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { calculateDistance } from "@/utils/calculate-distance";

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
   * Ordena los posts basándose en los filtros activos.
   * En lugar de limitar por percentiles, ordena todas las publicaciones
   * de mayor a menor según el criterio del filtro seleccionado.
   */
  const sortedPosts = useMemo(() => {
    if (activeFilters.length === 0) return searchFilteredPosts;

    // Si hay múltiples filtros activos, aplicamos el primero como criterio principal
    const primaryFilter = activeFilters[0];
    
    switch (primaryFilter) {
      case 'populares':
        // Ordenar por número de likes de mayor a menor
        return [...searchFilteredPosts].sort((a, b) => b.likes - a.likes);
      
      case 'vistos':
        // Ordenar por número de vistas de mayor a menor
        return [...searchFilteredPosts].sort((a, b) => b.views - a.views);
      
      case 'descubre':
        // Ordenar por likes de menor a mayor (joyas ocultas - menos conocidas pero con potencial)
        return [...searchFilteredPosts].sort((a, b) => a.likes - b.likes);
      
      default:
        return searchFilteredPosts;
    }
  }, [searchFilteredPosts, activeFilters]);

  // Estado para los posts filtrados por distancia
  const [distanceFilteredPosts, setDistanceFilteredPosts] = useState<Post[]>([]);

  /**
   * Efecto para manejar el filtrado por distancia.
   * Calcula la distancia entre el usuario y cada post,
   * y ordena los posts por distancia de menor a mayor.
   */
  useEffect(() => {
    const filterByDistance = async () => {
      // Si no hay filtro de cercanía o no hay ubicación, usar los posts ordenados
      if (!activeFilters.includes('cercanos') || !latitude || !longitude) {
        setDistanceFilteredPosts(sortedPosts);
        return;
      }

      try {
        // Calcular distancias para cada post
        const postsWithDistances = await Promise.all(
          sortedPosts.map(async (post) => {
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

        // Ordenar por distancia de menor a mayor (más cercanos primero)
        const sortedByDistance = postsWithDistances.sort((a, b) => a.distance - b.distance);
        setDistanceFilteredPosts(sortedByDistance.map(d => d.post));
      } catch (error) {
        console.error("Error al aplicar filtro de cercanía:", error);
        setDistanceFilteredPosts(sortedPosts);
      }
    };

    filterByDistance();
  }, [sortedPosts, activeFilters, latitude, longitude]);

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
