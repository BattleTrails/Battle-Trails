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
import LoginModal from "@/components/ui/login-modal/login-modal";

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
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginModalConfig, setLoginModalConfig] = useState<{
        title: string;
        message: string;
    }>({
        title: "Inicia sesión para continuar",
        message: "Necesitas iniciar sesión para continuar con esta acción."
    });
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

    // ✅ Incrementar vistas solo una vez cuando se carga la página
    useEffect(() => {
        const incrementViewsOnce = async () => {
            if (postId && !loading) {
                await incrementView();
            }
        };
        
        incrementViewsOnce();
    }, [postId, loading, incrementView]);

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
        e.stopPropagation();

        console.log('🖱️ Botón de like clickeado en DetailsPage');

        if (canLike && !isLikeLoading) {
            await toggleLike();
        } else {
            setLoginModalConfig({
                title: "Inicia sesión para dar like",
                message: "Necesitas iniciar sesión para poder dar like a esta ruta."
            });
            setShowLoginModal(true);
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

                <div className="w-full lg:w-[45%] flex flex-col justify-start gap-7 px-5 lg:px-20 pt-[75px] lg:pt-[75px]">
                    <div className="flex gap-x-2 mb-6 items-center justify-between">
                        <div className="flex gap-x-4">
                            <button
                                onClick={handleShare}
                                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 ease-in-out"
                                title="Compartir ruta"
                            >
                                <Share2 className="w-6 h-6" />
                            </button>

                            <SaveRouteButton 
                                postId={post.id} 
                                onShowLoginModal={() => {
                                    setLoginModalConfig({
                                        title: "Inicia sesión para guardar",
                                        message: "Necesitas iniciar sesión para guardar esta ruta en tus favoritos."
                                    });
                                    setShowLoginModal(true);
                                }}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Eye className="w-5 h-5" />
                                <span className="text-sm font-medium">{views}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLike}
                                    disabled={isLikeLoading}
                                    className={`p-2 rounded-full transition-all duration-200 ${
                                        canLike ? 'hover:bg-red-50 cursor-pointer' : 'cursor-pointer'
                                    } ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
                                    title={canLike ? (isLiked ? 'Quitar like' : 'Dar like') : 'Inicia sesión para dar like'}
                                >
                                    <Heart
                                        className={`w-6 h-6 transition-all duration-200 ${isLiked ? 'fill-current' : ''
                                            } ${isLikeLoading ? 'opacity-50' : ''}`}
                                    />
                                </button>
                                <span className="text-sm font-medium">{likes}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h2 className="text-4xl font-bold">{post.title}</h2>
                        {author && (
                            <p className="text-gray-600">Publicado por: {author.username}</p>
                        )}
                        <p className="text-gray-700 whitespace-pre-line">{post.description}</p>

                        <div className="flex shadow px-4 rounded gap-8 items-center justify-between py-2">
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
                    </div>

                    <div className="rounded overflow-auto">
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

            <LoginModal 
                showModal={showLoginModal} 
                setShowModal={setShowLoginModal}
                title={loginModalConfig.title}
                message={loginModalConfig.message}
            />
        </div>
    );
};

export default DetailsPage;