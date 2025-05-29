import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Post } from "@/types";
import { getPosts } from "@/services/db-service.ts";
import Card from "@/components/ui/card/card";

const Carouselcards = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

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
    return (
        <div className='relative w-full'>
            <Swiper
                modules={[Navigation]}
                navigation={{
                    nextEl: ".custom-next",
                    prevEl: ".custom-prev",
                }}
                simulateTouch={true} 
                grabCursor={true}  
                mousewheel={true} 
                slidesPerView={3.3}
                spaceBetween={30}
                breakpoints={{
                    0: {
                        slidesPerView: 1.2, // Móvil
                    },
                    640: {
                        slidesPerView: 2.2, // Tablet
                    },
                    1024: {
                        slidesPerView: 3.3, // Escritorio
                    },
                }}
                className="w-full !pl-0 touch-pan-x"
            >
                {posts.map((post) => (
                    <SwiperSlide key={post.id}>
                        <Card post={post} variant="large" />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <button
                className="custom-prev absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-black/40 text-white p-2 rounded-full hover:bg-black/80 transition"
                aria-label="Previous Slide"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                className="custom-next absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-black/40 text-white p-2 rounded-full hover:bg-black/80 transition"
                aria-label="Next Slide"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
};

export default Carouselcards;