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
    <div className="relative w-full min-h-[180px]">
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-6 h-6 border-4 border-base border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <Swiper
            modules={[Navigation]}
            navigation={{
              nextEl: ".custom-next",
              prevEl: ".custom-prev",
            }}
            simulateTouch={true}
            grabCursor={true}
            mousewheel={true}
            slidesPerView={3}
            spaceBetween={30}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="w-full touch-pan-x"
          >
            {posts.map((post) => (
              <SwiperSlide key={post.id}>
                <div className="p-5">
                  <Card post={post} variant="large" />
                </div>

              </SwiperSlide>
            ))}
          </Swiper>

          {/* Botones de navegación solo si hay posts */}
          {posts.length > 0 && (
            <>
              <button
                className="custom-prev absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-black/40 text-white p-2 rounded-full hover:bg-black/80 transition"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={30} />
              </button>
              <button
                className="custom-next absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-black/40 text-white p-2 rounded-full hover:bg-black/80 transition"
                aria-label="Next Slide"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Carouselcards;
