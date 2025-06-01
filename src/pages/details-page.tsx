import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostById } from "@/services/db-service"; // asegúrate de que esto existe
import { Post } from "@/types";
import Comments from "@/components/ui/comments/comments";
import Carouselcards from "@/components/ui/carouselcards/carouselcards";
import { LocateFixed, Timer, Share2, Bookmark } from "lucide-react";
import IconDistance from "@/assets/distance.svg";

const DetailsPage = () => {
    const { postId } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) return;
            try {
                const fetchedPost = await getPostById(postId);
                setPost(fetchedPost);
            } catch (error) {
                console.error("Error al cargar el post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) {
        return <p className="text-center mt-10 text-white/60">Cargando publicación...</p>;
    }

    if (!post) {
        return <p className="text-center mt-10 text-red-500">No se encontró la publicación.</p>;
    }

    return (
      <div>
          <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-[55%] h-[55dvh] lg:h-screen overflow-y-scroll snap-y snap-mandatory">
                  {post.images.map((src, index) => (
                    <div
                      key={index}
                      className="h-[55dvh] lg:h-screen w-full snap-start relative"
                    >
                        <img
                          src={src}
                          alt={`Imagen ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                    </div>
                  ))}
              </div>

              <div className="w-full lg:w-[45%] flex flex-col justify-center px-5 lg:px-20 pt-10 lg:pt-0">
                  <div className="flex gap-x-2 mb-6">
                      <Share2 />
                      <Bookmark />
                  </div>
                  <h2 className="text-4xl font-bold mb-4">{post.title}</h2>
                  <p className="whitespace-pre-line">{post.description}</p>

                  <div className="flex shadow px-4 rounded gap-8 items-center justify-between py-2 mt-6">
                      <div className="flex items-center gap-2">
                          <LocateFixed />
                          <span>{post.locationName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <img src={IconDistance} alt="Distancia" className="w-6 h-6" />
                          <span>8 km</span> {/* esto de momento es mock */}
                      </div>
                      <div className="flex items-center gap-2">
                          <Timer />
                          <span>7 horas</span> {/* también mock */}
                      </div>
                  </div>
              </div>
          </div>

          <div className="mt-20 ml-5">
              <h2 className="mb-8 font-semibold text-3xl">Comentarios</h2>
              <div className="px-0 lg:px-20">
                  <Comments/>
              </div>
          </div>

          <div className="mt-20 bg-[#1E1E1E] py-12">
              <h2 className="pl-5 font-semibold text-3xl text-white mb-10">Rutas relacionadas</h2>
              <Carouselcards />
          </div>
      </div>
    );
};

export default DetailsPage;
