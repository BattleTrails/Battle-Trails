import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostById, getRouteByPostId, getUserById } from "@/services/db-service";
import { Post, Route } from "@/types";
import Comments from "@/components/ui/comments/comments";
import Carouselcards from "@/components/ui/carouselcards/carouselcards";
import { LocateFixed, Timer, Share2, Heart, Eye } from "lucide-react"; // ✅ Importar Eye
import IconDistance from "@/assets/distance.svg";
import MapBaseDirections from "@components/ui/map-base/map-base-directions.tsx";
import { getFormattedRouteMetaData } from "@/utils/route-data.ts";
import { useJsApiLoader } from "@react-google-maps/api";
import RouteTimeline from "@pages/route-timeline.tsx";

const libraries: ("places")[] = ["places"];
import useSavedRoutes from "@/hooks/useSavedRoutes";
import useLikes from "@/hooks/useLikes";
import useViews from "@/hooks/useViews"; // ✅ Importar useViews
import SaveRouteButton from "@/components/ui/save-route-button/save-route-button";

const DetailsPage = () => {
    const { postId } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [author, setAuthor] = useState<{ username: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
         libraries,
    });

    // Hook para manejar rutas guardadas
    const { canSave } = useSavedRoutes(postId || '');

    // Hook para manejar likes
    const { likes, isLiked, isLoading: isLikeLoading, toggleLike, canLike } = useLikes(
        postId || '',
        post?.likes || 0
    );

    // ✅ Hook para manejar vistas
    const { views, incrementView } = useViews(postId || '', post?.views);

    useEffect(() => {
        const fetchPost = async (): Promise<void> => {
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
                const meta = await getFormattedRouteMetaData(
                    fetchedRoute.waypoints.map((point) => point.geoPoint)
                );
                setRouteInfo(meta);

            } catch (error) {
                console.error("Error al cargar el post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    // ✅ Incrementar vistas automáticamente cuando se carga la página
    useEffect(() => {
        if (postId) {
            incrementView();
        }
    }, [postId, incrementView]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post?.title || 'Ruta interesante',
                text: post?.description || 'Mira esta ruta que encontré',
                url: window.location.href,
            });
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(window.location.href);
            // Aquí podrías mostrar un toast de confirmación
        }
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Evitar navegación si está dentro de un elemento clickeable

        console.log('🖱️ Botón de like clickeado en DetailsPage');

        if (canLike && !isLikeLoading) {
            await toggleLike();
        } else {
            console.log('🚫 No se puede dar like:', { canLike, isLikeLoading });
        }
    };

    if (loading) {
        return <p className="text-center translate-y-20 text-gray-700">Cargando publicación...</p>;
    }

    if (!isLoaded) {
        return <p className="text-center translate-y-20 text-gray-700">Cargando mapa...</p>;
    }
    if (!post) {
        return <p className="text-center translate-y-20 text-red-500">No se encontró la publicación.</p>;
    }

    return (
        <div>
            <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-[55%] h-[55dvh] lg:h-screen overflow-y-scroll snap-y snap-mandatory ">
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

                <div className="w-full lg:w-[45%] flex flex-col justify-center gap-7 px-5 lg:px-20 pt-10 lg:pt-0">
                    <div className="flex gap-x-2 mb-6 items-center justify-between">
                        <div className="flex gap-x-4">
                            <button
                                onClick={handleShare}
                                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 ease-in-out"
                                title="Compartir ruta"
                            >
                                <Share2 className="w-6 h-6" />
                            </button>

                            <SaveRouteButton postId={post.id} />

                            {!canSave && (
                                <span className="text-sm text-gray-500 self-center ml-2">
                                    Inicia sesión para guardar
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* ✅ Mostrar vistas */}
                            <div className="flex items-center gap-2 text-gray-600">
                                <Eye className="w-5 h-5" />
                                <span className="text-sm font-medium">{views}</span>
                            </div>

                            {/* Likes */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLike}
                                    disabled={!canLike || isLikeLoading}
                                    className={`p-2 rounded-full transition-all duration-200 ${canLike
                                        ? 'hover:bg-red-50 cursor-pointer'
                                        : 'cursor-not-allowed opacity-50'
                                        } ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
                                    title={canLike ? (isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión para dar like'}
                                >
                                    <Heart
                                        className={`w-6 h-6 transition-all duration-200 ${isLiked ? 'fill-current' : ''
                                            } ${isLikeLoading ? 'opacity-50' : ''}`}
                                    />
                                </button>
                                <span className="text-sm font-medium">{likes}</span>

                                {!canLike && (
                                    <span className="text-xs text-gray-500 ml-2">
                                        Inicia sesión para dar like
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold mb-4">{post.title}</h2>
                    {author && (
                        <p className="text-gray-600 mb-4">Publicado por: {author.username}</p>
                    )}
                    <p className="whitespace-pre-line">{post.description}</p>

                    <div className="flex shadow px-4 rounded gap-8 items-center justify-between py-2 mt-6">
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

                        {route && <MapBaseDirections waypoints={route.waypoints.map(wp => wp.geoPoint)} />}

                    </div>
                </div>
            </div>
            <RouteTimeline waypoints={route?.waypoints.map(wp => ({
                geoPoint: wp.geoPoint,
                address: wp.address,
                description: wp.description,
                images: wp.images
            })) || []} />

            <div className="mt-20 ml-5">
                <h2 className="mb-8 font-semibold text-3xl">Comentarios</h2>
                <div className="px-0 lg:px-20">
                    <Comments />
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