import Card from "@components/home/card/card.tsx";

import FilterBar from "@components/home/filter-bar/filter-bar.tsx";
import {useEffect, useState} from "react";
import {Post} from "@/types";
import {getPosts} from "@/services/db-service.ts";


const HomePage = () => {
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
        <div className="flex flex-col items-center gap-5 p-6">
            <FilterBar />

            {loading ? (
                <p className="text-neutral">Cargando publicaciones...</p>
            ) : (
                <div className="grid grid-cols-1 pt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-20">
                    {posts.map((post) => (
                        <Card key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomePage;
