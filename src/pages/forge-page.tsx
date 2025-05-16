import ForgeImages from "@components/forge/forge-images/forge-images.tsx";
import ForgeForm from "@components/forge/forge-form/forge-form.tsx";
import ForgeButtonSave from "@components/forge/forge-button-save/forge-button-save.tsx";
import {useAuth} from "@context/auth-context.tsx";
import {usePostStore} from "@/store/usePostStore.ts";
import {useNavigate} from "react-router-dom";

import {createPost} from "@/services/db-service.ts";
import {uploadImagesToSupabase} from "@/services/supabase-storage-service.ts";


const ForgePage = () => {

    const { user } = useAuth();
    const navigate = useNavigate();
    const { postDraft, resetPostDraft } = usePostStore();

    const handleCreatePost = async () => {
        if (!user) {
            console.warn("Usuario no autenticado.");
            return;
        }

        // Validación simple
        if (
            !postDraft.title.trim() ||
            !postDraft.description.trim() ||
            !postDraft.images.length
        ) {
            alert("Por favor, completa todos los campos obligatorios.");
            return;
        }

        /*if (postDraft.images.length < 4) {
            alert("Debes subir al menos 4 imágenes.");
            return;
        }*/

        try {
            // 1. Subir imágenes a Firebase Storage
            const imageUrls = await uploadImagesToSupabase(postDraft.images, user.uid);

            // 2. Crear el post en Firestore
            /*esto para poder usar el id del post cuando lo creemos :const postId = await createPost({*/

            await createPost({
                userId: user.uid,
                title: postDraft.title,
                description: postDraft.description,
                images: imageUrls,
                /*location: postDraft.location|| null,*/ // Asegúrate de que location sea opcional en tu tipo Post
                likes: 0,
                likedBy: []
            });

            // 3. (Opcional) Crear la ruta asociada
            // Aquí puedes incluir los waypoints si ya los tienes:
            // await createRoute({ waypoints: [...] }, postId);

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
                    <ForgeImages />
                </div>

                {/* Columna derecha */}
                <div className="flex-1">
                    <ForgeForm />
                    <div className="flex justify-end mt-6">
                        <ForgeButtonSave onClick={handleCreatePost} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgePage;
