import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Share2, Bell, Ellipsis } from "lucide-react";
import Card from "@components/ui/card/card.tsx";
import { Post } from "@/types";
import { getPostsByUserId, getUserById } from "@/services/db-service.ts";

const ProfileUserPage = () => {
  const { userId } = useParams();

  const [profile, setProfile] = useState<null | {
    name: string;
    username: string;
    profilePicture: string;
  }>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const [userData, userPosts] = await Promise.all([
          getUserById(userId),
          getPostsByUserId(userId),
        ]);

        setProfile({
          name: userData.name,
          username: userData.username,
          profilePicture: userData.profilePicture!,
        });
        setPosts(userPosts);
      } catch (error) {
        console.error("Error al cargar perfil del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-500">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="px-4 pt-25 sm:px-10 mb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between">
        <div className="flex flex-col lg:flex-row flex-wrap gap-6 items-center">
          <div className="w-28 aspect-square overflow-hidden rounded">
            <img
              src={profile.profilePicture}
              alt={`foto de perfil de ${profile.name}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-[150px] text-center lg:text-start">
            <h2 className="text-2xl sm:text-4xl mb-1">{profile.name}</h2>
            <span className="text-lg sm:text-xl font-light">@{profile.username}</span>
            <div className="mt-2">
              <span className="text-xl font-light">{`${posts.length} rutas`}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-x-3 mt-3 items-start justify-center sm:justify-end">
          <button className="bg-neutral p-1.5 rounded-md">
            <Share2 color="white" strokeWidth={1} className="size-5" />
          </button>
          <button className="bg-neutral p-1.5 rounded-md">
            <Bell color="white" strokeWidth={1} className="size-5" />
          </button>
          <button
            className="border border-neutral p-1.5 rounded-md relative"
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

      <div className="grid grid-cols-1 pt-5 lg:pt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-20 justify-items-center">
        {posts.map((post) => (
          <Card key={post.id} post={post} isEditable={false} />
        ))}
      </div>
    </div>
  );
};

export default ProfileUserPage;
