import { useEffect, useState } from "react";
import { Settings, Share2, CircleFadingPlus } from "lucide-react";
import { motion } from "framer-motion";
import {Link, useNavigate} from "react-router-dom";
import ModalSettings from "@/components/ui/modal-settings/modal-settings";
import { useAuthHandler } from "@hooks/useAuthHandler.ts";
import { getPostsByUserId, getUserById } from "@/services/db-service.ts";
import Card from "@components/ui/card/card.tsx";
import { Post } from "@/types";

const PerfilPage = () => {
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
    const [loading, setLoading] = useState(true);


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


    return (
      <>
          <ModalSettings showModal={showModal} setShowModal={setShowModal} />
          <div className="px-4 translate-y-25 sm:px-10">
              {/* Header */}
              <div className="flex flex-col lg:flex-row flex-wrap gap-6 items-center">
                  <div className="w-28 aspect-square overflow-hidden rounded">
                      <img src={profile.profilePicture} alt={`foto de perfil de ${profile.name}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-[150px] text-center lg:text-start">
                      <h2 className="text-2xl sm:text-4xl mb-1">{profile.name}</h2>
                      <span className="text-lg font-light sm:text-xl">@{profile.username}</span>
                      <div className="flex flex-wrap gap-3 mt-3 justify-center lg:justify-start w-full lg:w-fit">
                          <button className="border border-b-blue-950 text-blue-950 px-3 py-1 rounded-md text-sm sm:text-base">Editar perfil</button>
                          <button onClick={() => setShowModal(true)} className="bg-blue-950 p-1.5 rounded-md">
                              <Settings color="white" strokeWidth={1} className="size-5" />
                          </button>
                          <button className="bg-blue-950 p-1.5 rounded-md">
                              <Share2 color="white" strokeWidth={1} className="size-5" />
                          </button>
                      </div>
                  </div>
              </div>

              {/* Tabs principales */}
              <button
                onClick={handleCreateRoute}
                className="flex items-center gap-x-2 bg-gray-200 w-fit px-4 mt-5 rounded py-1 mx-auto lg:hidden"
              >
                  <span>Añade tu ruta</span>
                  <CircleFadingPlus />
              </button>


              <div className="flex flex-col lg:flex-row items-center lg:items-end relative mt-5 mb-10">
                  <div className="relative mt-8 flex gap-x-10 text-lg sm:text-xl overflow-x-auto no-scrollbar">
                      {["guardados", "publicaciones"].map((tab) => (
                        <motion.button
                          key={tab}
                          onClick={() => setActiveTab(tab as "guardados" | "publicaciones")}
                          className={`relative pb-1 transition-colors duration-300 whitespace-nowrap ${
                            activeTab === tab ? "text-black font-medium" : "text-gray-500"
                          }`}
                          whileTap={{ scale: 0.95 }}
                        >
                            {tab === "guardados" ? "Guardados" : "Mis publicaciones"}
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
              <div className="mt-5">
                  {activeTab === "guardados" ? (
                    <p className="text-center lg:text-start text-base sm:text-lg text-gray-700">
                        Aquí se mostrarán tus rutas guardadas.
                    </p>
                  ) : posts.length === 0 ? (
                    <p className="text-center lg:text-start text-base sm:text-lg text-gray-700">
                        Aún no has publicado ninguna ruta.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 pt-5 lg:pt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-20 justify-items-center lg:justify-items-start">
                        {posts.map((post) => (
                          <Card key={post.id} post={post} />
                        ))}
                    </div>
                  )}
              </div>
          </div>
      </>
    );
};

export default PerfilPage;
