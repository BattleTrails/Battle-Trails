import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getPostById, getRouteByPostId, getUserById } from "@/services/db-service";
import { Post, Route } from "@/types";
import Comments from "@pages/details-page/comments/comments";
import Carouselcards from "@pages/details-page/carouselcards/carouselcards";
import { LocateFixed, Timer, ChevronDown } from "lucide-react";
import IconDistance from "@/assets/distance.svg";

import LeafletMapDirections from "@components/ui/leaflet-map/leaflet-map-directions";
import { getFormattedRouteMetaData } from "@/utils/route-data.ts";
import RouteTimeline from "@pages/route-timeline.tsx";
import LoginModal from "@/components/ui/login-modal/login-modal";
import SocialInteractions from "@/components/ui/social-interactions/social-interactions";
import { useAuthHandler } from "@/hooks/useAuthHandler";

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
    const imagesContainerRef = useRef<HTMLDivElement>(null);
    const { user: authUser, loading: authLoading } = useAuthHandler();

    useEffect(() => {
        if (!postId) return;
        setLoading(true);

        (async () => {
            try {
                // Cargar post y ruta en paralelo
                const [fetchedPost, fetchedRoute] = await Promise.all([
                    getPostById(postId),
                    getRouteByPostId(postId)
                ]);

                setPost(fetchedPost);
                setRoute(fetchedRoute);

                // UI disponible ya
                setLoading(false);

                // Autor en segundo plano
                (async () => {
                    try {
                        const fetchedAuthor = await getUserById(fetchedPost.userId);
                        setAuthor({ username: fetchedAuthor.username });
                    } catch (e) {
                        console.error("Error cargando autor:", e);
                    }
                })();

                // Métricas de ruta en segundo plano
                if (fetchedRoute && fetchedRoute.waypoints?.length >= 2) {
                    (async () => {
                        try {
                            const meta = await getFormattedRouteMetaData(
                                fetchedRoute.waypoints.map((p) => p.geoPoint)
                            );
                            setRouteInfo(meta);
                        } catch (e) {
                            console.error("Error calculando meta de ruta:", e);
                        }
                    })();
                }
            } catch (error) {
                console.error("Error al cargar el post:", error);
                setLoading(false);
            }
        })();
    }, [postId]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const chevron = container.querySelector('.scroll-chevron');
        if (chevron) {
            if (container.scrollTop > 0) {
                chevron.classList.add('opacity-0', 'pointer-events-none');
            } else {
                chevron.classList.remove('opacity-0', 'pointer-events-none');
            }
        }
    };

    const handleChevronClick = () => {
        if (imagesContainerRef.current) {
            const container = imagesContainerRef.current;
            const currentScroll = container.scrollTop;
            const windowHeight = container.clientHeight;
            
            const nextScrollPosition = currentScroll + windowHeight;
            
            if (nextScrollPosition < container.scrollHeight) {
                container.scrollTo({
                    top: nextScrollPosition,
                    behavior: 'smooth'
                });
            }
        }
    };

    if (loading || authLoading) {
        return <p className="text-center translate-y-20 text-gray-700">Cargando publicación...</p>;
    }

    if (!post) {
        return <p className="text-center translate-y-20 text-red-500">No se encontró la publicación.</p>;
    }

    return (
        <div>
            <div className="flex flex-col lg:flex-row">
                <div 
                    ref={imagesContainerRef}
                    className="w-full lg:w-[50%] h-[55dvh] lg:h-screen overflow-y-scroll snap-y snap-mandatory scroll-container relative"
                    onScroll={handleScroll}
                >
                    {post.images.map((src, index) => (
                        <div key={index} className="h-[55dvh] lg:h-screen w-full snap-start relative">
                            <img src={src} alt={`Imagen ${index + 1}`} className="h-full w-full object-cover" />
                        </div>
                    ))}
                    {post.images.length > 1 && (
                        <div 
                            className="scroll-chevron absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 cursor-pointer hover:scale-110"
                            onClick={handleChevronClick}
                        >
                            <ChevronDown className="w-8 h-8 text-white drop-shadow-lg animate-bounce" />
                        </div>
                    )}
                </div>

                <div className="w-full lg:w-[50%] flex flex-col justify-start gap-7 px-5 lg:px-20 pt-[75px] lg:pt-[75px] lg:h-screen">
                    <SocialInteractions 
                        postId={post.id}
                        initialLikes={post.likes}
                        initialViews={post.views}
                        onShowLoginModal={(title, message) => {
                            setLoginModalConfig({ title, message });
                            setShowLoginModal(true);
                        }}
                    />

                    <div className="flex flex-col gap-6">
                        <h2 className="text-4xl font-bold">{post.title}</h2>
                        {author && (
                            <p className="text-gray-600">
                                Publicado por:{" "}
                                <a
                                    href={authUser && authUser.uid === post.userId ? "/profile" : `/profile/${post.userId}`}
                                    className="text-secondary hover:underline cursor-pointer"
                                >
                                    {author.username}
                                </a>
                            </p>
                        )}
                        <p className="text-gray-700 whitespace-pre-line text-justify">{post.description}</p>

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

                    <div className="rounded-lg overflow-hidden mb-5 h-[250px] lg:h-screen">
                        {route ? (
                            <>
                                {console.log("DetailsPage - route:", route)}
                                {console.log("DetailsPage - waypoints:", route.waypoints.map(wp => wp.geoPoint))}
                                <LeafletMapDirections 
                                    waypoints={route.waypoints.map(wp => wp.geoPoint)} 
                                    addresses={route.waypoints.map(wp => wp.address)}
                                />
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100 rounded">
                                <p className="text-gray-500">Cargando mapa...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <RouteTimeline waypoints={route?.waypoints.map(wp => ({
                geoPoint: wp.geoPoint,
                address: wp.address,
                description: wp.description,
                images: wp.images
            })) || []} />

            <div className="mt-20 w-[90%] md:w-[80%] lg:w-[70%] mx-auto">
                <h2 className="mb-8  font-semibold text-3xl text-center">Comentarios</h2>
                <div className="px-0 lg:px-20">
                    <Comments postId={post.id} />
                </div>
            </div>

            <div className="mt-20 bg-[#1E1E1E] py-12">
                <h2 className=" font-semibold text-3xl text-white mb-10 text-center">Rutas relacionadas</h2>
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