import { useEffect, useState } from "react";
import {Link, useParams} from "react-router-dom";
import { getPostById , getRouteByPostId,getUserById} from "@/services/db-service"; // asegúrate de que esto existe
import { Post,Route } from "@/types";
import Comments from "@/components/ui/comments/comments";
import Carouselcards from "@/components/ui/carouselcards/carouselcards";
import { LocateFixed, Timer, Share2, Bookmark } from "lucide-react";
import IconDistance from "@/assets/distance.svg";
import MapBaseDirections from "@components/ui/map-base/map-base-directions.tsx";
import {getFormattedRouteMetaData} from "@/utils/route-data.ts";

const DetailsPage = () => {
    const { postId } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const[route,setRoute] = useState<Route | null>(null);
    const [loading, setLoading] = useState(true);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
    const [author, setAuthor] = useState<{ username: string } | null>(null);


    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) return;

            try {



                const fetchedPost = await getPostById(postId);
                setPost(fetchedPost);

                const fetchedRoute = await getRouteByPostId(postId);
                setRoute(fetchedRoute);

                setPost(fetchedPost); //obtenemos el autor del post

                const fetchedAuthor = await getUserById(fetchedPost.userId);
                setAuthor({ username: fetchedAuthor.username });

                if (!fetchedRoute) throw new Error("No se encontró la ruta.");
                const meta = await getFormattedRouteMetaData(fetchedRoute.waypoints);

                setRouteInfo(meta);

            } catch (error) {
                console.error("Error al cargar el post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) {
        return <p className="text-center translate-y-20 text-gray-700">Cargando publicación...</p>;
    }

    if (!post) {
        return <p className="text-center translate-y-20 text-red-500">No se encontró la publicación.</p>;
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

              <div className="w-full lg:w-[45%] flex flex-col justify-center gap-7 px-5 lg:px-20 pt-10 ">
                  <div className="flex gap-x-2">
                      <Share2 strokeWidth={1.5}  />
                      <Bookmark strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                      {author && (
                        <p className="text-sm text-gray-500">
                            Publicado por{" "}
                            <Link
                              to={`/profile/${post.userId}`}
                              className="text-blue-600 hover:underline"
                            >
                                @{author.username}
                            </Link>
                        </p>
                      )}
                      <h2 className="text-4xl font-bold">{post.title}</h2>
                  </div>

                  <p className="whitespace-pre-line">{post.description}</p>

                  <div className="flex shadow px-4 rounded gap-8 items-center justify-between py-2 ">
                      <div className="flex items-center gap-2">
                          <LocateFixed />
                          <span>{post.locationName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <img src={IconDistance} alt="Distancia" className="w-6 h-6" />
                          <span>{routeInfo?.distance ?? "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <Timer />
                          <span>{routeInfo?.duration ?? "—"}</span>
                      </div>

                  </div>
                  <div className=" rounded overflow-auto">
                      {route && <MapBaseDirections waypoints={route.waypoints} />}
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
