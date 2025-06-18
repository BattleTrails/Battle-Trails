import { useEffect, useState } from "react";
import { Settings, Share2, CircleFadingPlus } from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import { motion } from "framer-motion"
import ModalSettings from "@pages/profile-page/modal-settings/modal-settings";
import { useAuthHandler } from "@hooks/useAuthHandler.ts";
import { getPostsByUserId, getUserById, getSavedRoutesByUserId } from "@/services/db-service.ts";
import Card from "@components/ui/card/card.tsx";
import { Post } from "@/types";

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState<"guardados" | "publicaciones">("publicaciones");
    const [showModal, setShowModal] = useState(false);
    const { user } = useAuthHandler();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<null | {
        name: string;
        username: string;
        profilePicture: string;
    }>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [savedRoutes, setSavedRoutes] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [savedRoutesLoading, setSavedRoutesLoading] = useState(false);
    const [savedRoutesLoaded, setSavedRoutesLoaded] = useState(false); // Nuevo estado

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;

            try {
                const [userData, userPosts] = await Promise.all([
                    getUserById(user.uid),
                    getPostsByUserId(user.uid),
                ]);

                setProfile({
                    name: userData.name,
                    username: userData.username,
                    profilePicture: userData.profilePicture!,
                });

                setPosts(userPosts);
            } catch (error) {
                console.error("Error al cargar perfil del usuario logueado:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    // Cargar rutas guardadas cuando se selecciona la pestaña
    useEffect(() => {
        const fetchSavedRoutes = async () => {
            if (!user || activeTab !== "guardados") return;
            
            // Si ya están cargadas, no volver a cargar
            if (savedRoutesLoaded && savedRoutes.length > 0) return;

            setSavedRoutesLoading(true);
            try {
                console.log('Cargando rutas guardadas para usuario:', user.uid); // Debug
                const routes = await getSavedRoutesByUserId(user.uid);
                console.log('Rutas guardadas obtenidas:', routes); // Debug
                setSavedRoutes(routes);
                setSavedRoutesLoaded(true);
            } catch (error) {
                console.error("Error al cargar rutas guardadas:", error);
            } finally {
                setSavedRoutesLoading(false);
            }
        };

        fetchSavedRoutes();
    }, [user, activeTab, savedRoutesLoaded, savedRoutes.length]);

    // Función para refrescar las rutas guardadas
    const refreshSavedRoutes = async () => {
        if (!user) return;
        
        setSavedRoutesLoading(true);
        try {
            const routes = await getSavedRoutesByUserId(user.uid);
            setSavedRoutes(routes);
        } catch (error) {
            console.error("Error al refrescar rutas guardadas:", error);
        } finally {
            setSavedRoutesLoading(false);
        }
    };

    // Resetear el estado cuando cambie el usuario
    useEffect(() => {
        setSavedRoutesLoaded(false);
        setSavedRoutes([]);
    }, [user]);

    if (loading || !profile) {
        return (
          <div className="flex items-center justify-center h-screen">
              <span className="text-gray-500">Cargando perfil...</span>
          </div>
        );
    }

    const handleCreateRoute = () => {
        if (user) {
            navigate("/new");
        }
    };

    const handleTabChange = (tab: "guardados" | "publicaciones") => {
        setActiveTab(tab);
        // Si cambiamos a guardados y no están cargadas, forzar la carga
        if (tab === "guardados" && !savedRoutesLoaded) {
            setSavedRoutesLoaded(false);
        }
    };

    const renderContent = () => {
        if (activeTab === "guardados") {
            if (savedRoutesLoading) {
                return (
                  <div className="flex items-center justify-center py-10">
                      <div className="flex items-center gap-2">
                          <div className="w-6 h-6 border-2 border-neutral border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-gray-600">Cargando rutas guardadas...</span>
                      </div>
                  </div>
                );
            }

            if (savedRoutes.length === 0) {
                return (
                  <div className="text-center py-10">
                      <p className="text-base sm:text-lg text-gray-700 mb-4">
                          Aún no has guardado ninguna ruta.
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                          Explora rutas y usa el botón de guardar para verlas aquí.
                      </p>
                      <button 
                        onClick={refreshSavedRoutes}
                        className="inline-flex items-center gap-2 text-neutral hover:text-neutral-600 transition-colors"
                      >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Actualizar
                      </button>
                  </div>
                );
            }

            return (
              <div className="grid grid-cols-1 pt-2 lg:pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-20 justify-items-center">
                  {savedRoutes.map((post) => (
                    <Card key={post.id} post={post} isEditable={false} />
                  ))}
              </div>
            );
        } else {
            // Contenido para "publicaciones"
            if (posts.length === 0) {
                return (
                  <div className="text-center py-10">
                      <p className="text-base sm:text-lg text-gray-700 mb-4">
                          Aún no has publicado ninguna ruta.
                      </p>
                      <Link 
                        to="/new"
                        className="inline-flex items-center gap-2 bg-neutral text-white px-4 py-2 rounded-md hover:bg-neutral-500 transition-colors"
                      >
                          <CircleFadingPlus className="w-4 h-4" />
                          Crear tu primera ruta
                      </Link>
                  </div>
                );
            }

            return (
              <div className="grid grid-cols-1 pt-2 lg:pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-20 justify-items-center lg:justify-items-start">
                  {posts.map((post) => (
                    <Card 
                      key={post.id} 
                      post={post} 
                      isEditable={true} 
                      onDeleted={(id) => {
                        setPosts(posts.filter(post => post.id !== id));
                      }}
                    />
                  ))}
              </div>
            );
        }
    };

    return (
      <>
          <ModalSettings showModal={showModal} setShowModal={setShowModal} />
          <div className="px-4 pt-25 sm:px-10">
              {/* Header */}
              <div className="flex flex-col lg:flex-row flex-wrap gap-6 items-center">
                  <div className="w-28 aspect-square overflow-hidden rounded">
                      <img src={profile.profilePicture} alt={`foto de perfil de ${profile.name}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-[150px] text-center lg:text-start">
                      <h2 className="text-2xl sm:text-4xl mb-1">{profile.name}</h2>
                      <span className="text-lg font-light sm:text-xl">@{profile.username}</span>
                      <div className="flex flex-wrap gap-3 mt-3 justify-center lg:justify-start w-full lg:w-fit">
                          <button className="border border-b-neutral text-neutral px-3 py-1 rounded-md text-sm sm:text-base">Editar perfil</button>
                          <button onClick={() => setShowModal(true)} className="bg-neutral p-1.5 rounded-md">
                              <Settings color="white" strokeWidth={1} className="size-5" />
                          </button>
                          <button className="bg-neutral p-1.5 rounded-md">
                              <Share2 color="white" strokeWidth={1} className="size-5" />
                          </button>
                      </div>
                  </div>
              </div>

              {/* Botón móvil para crear ruta */}
              <button
                onClick={handleCreateRoute}
                className="flex items-center gap-x-2 bg-gray-200 w-fit px-4 mt-5 rounded py-1 mx-auto lg:hidden"
              >
                  <span>Añade tu ruta</span>
                  <CircleFadingPlus />
              </button>

              {/* Tabs principales */}
              <div className="flex flex-col lg:flex-row items-center lg:items-end relative mt-5 mb-8">
                  <div className="relative mt-8 flex gap-x-10 text-lg sm:text-xl w-full justify-center lg:justify-start">
                      {["guardados", "publicaciones"].map((tab) => (
                        <motion.button
                          key={tab}
                          onClick={() => handleTabChange(tab as "guardados" | "publicaciones")}
                          className={`relative pb-1 transition-colors duration-300 whitespace-nowrap ${
                            activeTab === tab ? "text-black font-medium" : "text-gray-500"
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                            {tab === "guardados" ? (
                              <span className="flex items-center gap-2">
                                  Guardados
                                  {savedRoutes.length > 0 && (
                                    <span className="text-sm text-gray-500">
                                        ({savedRoutes.length})
                                    </span>
                                  )}
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                  Mis publicaciones
                                  {posts.length > 0 && (
                                    <span className="text-sm text-gray-500">
                                        ({posts.length})
                                    </span>
                                  )}
                              </span>
                            )}
                            {activeTab === tab && (
                              <motion.div
                                layoutId="underline"
                                className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                        </motion.button>
                      ))}
                  </div>

                  <Link
                    to="/new"
                    className="lg:absolute left-1/2 -translate-x-1/2 mx-auto lg:mt-0 mt-5 hidden lg:block"
                    aria-label="Añadir nueva ruta"
                  >
                      <CircleFadingPlus />
                  </Link>
              </div>

              {/* Contenido */}
              <div className="mt-5 mb-10">
                  {renderContent()}
              </div>
          </div>
      </>
    );
};

export default ProfilePage;
