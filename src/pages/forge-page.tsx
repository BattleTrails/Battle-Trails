import ForgeImages from "@pages/forge/forge-images/forge-images.tsx";
import ForgeForm from "@pages/forge/forge-form/forge-form.tsx";
import ForgeButtonSave from "@pages/forge/forge-button-save/forge-button-save.tsx";
import {useAuth} from "@context/auth-context.tsx";
import {usePostStore} from "@/store/usePostStore.ts";
import {useNavigate} from "react-router-dom";

import {createPost, createRoute} from "@/services/db-service.ts";
import {uploadImagesToSupabase} from "@/services/supabase-storage-service.ts";
import {useEffect} from "react";
import {doc, updateDoc} from "firebase/firestore";
import {db} from "@config/firebaseConfig.ts";


const ForgePage = () => {

  const {user} = useAuth();
  const navigate = useNavigate();
  const {postDraft, resetPostDraft} = usePostStore();

  useEffect(() => {
    return () => {
      resetPostDraft(); // se limpia al salir de la página
    };
  }, []);
  const handleCreatePost = async () => {
    if (!user) {
      console.warn("Usuario no autenticado.");
      return;
    }

    if (
      !postDraft.title.trim() ||
      !postDraft.description.trim() ||
      !postDraft.images.length ||
      postDraft.routePoints.length < 2
    ) {
      alert("Por favor, completa todos los campos obligatorios y al menos dos ubicaciones.");
      return;
    }

    try {
      // 1. Subir imágenes a Supabase
      const imageUrls = await uploadImagesToSupabase(postDraft.images, user.uid);

      // 2. Crear el Post y obtener su ID
      const postId = await createPost({
        userId: user.uid,
        title: postDraft.title,
        description: postDraft.description,
        images: imageUrls,
        likes: 0,
        likedBy: [],
      });

      // 3. Crear la Route asociada
      await createRoute({
        postId,
        waypoints: postDraft.routePoints.map((p) => p.geoPoint),
        images: [], // si luego usas imágenes de Google Places
      }, postId);

      // 4. Guardar el ID de la ruta en el post
      await updateDoc(doc(db, "posts", postId), {
        routeId: postId,
      });

      // 4. Reset y redirección
      resetPostDraft();
      navigate(`/`);
    } catch (error) {
      console.error("Error al crear la publicación:", error);
      alert("Ha ocurrido un error al crear la ruta. Intenta de nuevo.");
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-6 rounded-xl bg-base-100 shadow-sm border border-neutral/10">
      <h1 className="text-2xl font-bold text-neutral mb-6">Crear ruta</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Columna izquierda */}
        <div className="flex-1">
          <ForgeImages/>
        </div>

        {/* Columna derecha */}
        <div className="flex-1">
          <ForgeForm/>
          <div className="flex justify-end mt-6">
            <ForgeButtonSave onClick={handleCreatePost}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgePage;
