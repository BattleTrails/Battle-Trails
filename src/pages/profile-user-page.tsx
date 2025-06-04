import Card from "@components/ui/card/card.tsx";

import { Share2, Bell, Ellipsis } from "lucide-react";
import { useEffect, useState } from "react";
import { Post } from "@/types";
import { getPosts } from "@/services/db-service.ts";

const ProfileUserPage = () => {

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);


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

  const user = {
    username: "Karen_García",
    fullName: "Karen García",
    image:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    numberRoutes: 45
  };

  return (
    <div className="px-4 sm:px-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between">
        <div className="flex flex-col lg:flex-row flex-wrap gap-6 items-center">
          <div className="w-28 aspect-square overflow-hidden rounded">
            <img src={user.image} alt={`foto de perfil de ${user.fullName}`} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-[150px] text-center lg:text-start">
            <h2 className="text-2xl sm:text-4xl mb-1">{user.username}</h2>
            <span className="text-lg sm:text-xl font-light">{user.fullName}</span>
            <div className="mt-2">
              <span className="text-xl font-light">{`${user.numberRoutes} rutas`}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-x-3 mt-3 items-start justify-center sm:justify-end">
          <button className="bg-blue-950 p-1.5 rounded-md">
            <Share2 color="white" strokeWidth={1} className="size-5" />
          </button>
          <button className="bg-blue-950 p-1.5 rounded-md">
            <Bell color="white" strokeWidth={1} className="size-5" />
          </button>
          <button
            className="border border-blue-950 p-1.5 rounded-md relative"
            onClick={() => setShowOptions(!showOptions)}
          >
            <Ellipsis color="black" strokeWidth={1} className="size-5" />
          </button>

          {showOptions && (
            <div className="absolute mt-10 bg-white border border-gray-100 rounded shadow-lg z-50 w-40 text-sm left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0">
              <button
                onClick={() => {
                  setShowOptions(false);
                  alert("Usuario bloqueado");
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
              >
                Bloquear usuario
              </button>
              <button
                onClick={() => {
                  setShowOptions(false);
                  alert("Usuario reportado");
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
              >
                Denunciar usuario
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center sm:text-left">
        <span className="text-xl font-light">Publicaciones</span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 pt-5 lg:pt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-20 justify-items-center lg:justify-items-start">
        {posts.map((post) => (
          <Card key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default ProfileUserPage;