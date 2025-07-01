import { useEffect, useRef, useState } from "react";
import { Post } from "@/types";
import { getPosts } from "@/services/db-service.ts";
import Card from "@components/ui/card/card.tsx";

const getVisibleSlides = () => {
  if (window.innerWidth >= 1536) return 4;
  if (window.innerWidth >= 1280) return 3;
  if (window.innerWidth >= 1024) return 2.5;
  if (window.innerWidth >= 768) return 2;
  if (window.innerWidth >= 640) return 1.5;
  if (window.innerWidth >= 480) return 1;
  return 1;
};

const Carouselcards = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(getVisibleSlides());
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleResize = () => setVisibleSlides(getVisibleSlides());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcula el índice activo según el scroll
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const slideWidth = container.offsetWidth / visibleSlides;
    const idx = Math.round(scrollLeft / slideWidth);
    setActiveIndex(idx);
  };

  // Navegación con botones (desktop)
  const scrollToIndex = (idx: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const slideWidth = container.offsetWidth / visibleSlides;
    container.scrollTo({ left: idx * slideWidth, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full">
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-6 h-6 border-4 border-base border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex   overflow-x-auto pb-4 md:pb-8 snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] scrollbar-hide"
            onScroll={handleScroll}
          >
            {posts.map((post) => (
              <div
                key={post.id}
                className="shrink-0 snap-start flex justify-center"
                style={{ width: `calc(100%/${visibleSlides})` }}
              >
                <Card post={post} variant="large" />
              </div>
            ))}
          </div>

          {/* Bullets solo en mobile/tablet */}
          <div className="flex justify-center mt-6 md:hidden">
            {Array.from({ length: Math.max(1, posts.length - Math.floor(visibleSlides) + 1) }).map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full bg-secondary transition-all duration-200 mx-1 border-none outline-none ${idx === activeIndex ? 'opacity-100 scale-125' : 'opacity-40'}`}
                aria-label={`Ir a la tarjeta ${idx + 1}`}
                onClick={() => scrollToIndex(idx)}
              />
            ))}
          </div>

          {/* Botones de navegación solo en desktop */}
          {posts.length > visibleSlides && (
            <>
              <button
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-black/40 text-white p-2 rounded-full hover:bg-black/80 transition"
                aria-label="Anterior"
                onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
              >
                &#8592;
              </button>
              <button
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-black/40 text-white p-2 rounded-full hover:bg-black/80 transition"
                aria-label="Siguiente"
                onClick={() => scrollToIndex(Math.min(posts.length - Math.floor(visibleSlides), activeIndex + 1))}
              >
                &#8594;
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Carouselcards;
