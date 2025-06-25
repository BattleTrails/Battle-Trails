import { useState, useEffect } from "react";
import { addCommentToPost, getUserById, deleteCommentById } from "@/services/db-service";
import { Comment } from "@/types/comment";
import { db } from "@/config/firebaseConfig";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuthHandler } from "@/hooks/useAuthHandler";
import { Trash2, MoreVertical ,Send} from "lucide-react";

interface CommentsProps {
    postId: string;
}

const Comments = ({ postId }: CommentsProps) => {
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const { user } = useAuthHandler();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Suscripción en tiempo real a los comentarios
    useEffect(() => {
        setLoading(true);
        const q = query(
            collection(db, "comments"),
            where("postId", "==", postId),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    id: doc.id,
                    userId: d.userId ?? "",
                    text: d.text ?? "",
                    createdAt: d.createdAt,
                    name: d.name ?? "",
                    image: d.image ?? ""
                };
            });
            setComments(data as Comment[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [postId]);

    const handleComment = async () => {
        if (!comment.trim() || !user) return;
        setSending(true);
        try {
            // Obtener el usuario desde la base de datos
            const dbUser = await getUserById(user.uid);
            await addCommentToPost(
                postId,
                user.uid,
                comment,
                dbUser.name || "Usuario",
                dbUser.profilePicture || "/public/avatars/avatar-1.webp"
            );
            setComment("");
        } catch (e) {
            // Aquí podrías mostrar un toast de error
            console.error("Error al enviar comentario:", e);
        } finally {
            setSending(false);
        }
    };

    // Función para eliminar comentario
    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteCommentById(commentId);
        } catch (e) {
            console.error("Error al eliminar comentario:", e);
        }
    };

    return (
        <div>
            {/* Input para añadir comentario solo si hay usuario */}
            {user ? (
                <div className="flex items-center gap-3 mb-8">
                    <img
                        src={user.photoURL || "/public/avatars/avatar-1.webp"}
                        alt="Tu avatar"
                        className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                    />
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Añade un comentario..."
                            className="w-full bg-accent text-neutral-200 placeholder:text-neutral-400 border border-neutral-400 rounded px-4 py-2 pr-16 focus:outline-none focus:border-primary transition-colors"
                            maxLength={400}
                            disabled={sending}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400 select-none pointer-events-none">
                            {comment.length}/400
                        </span>
                    </div>
                    <button
                        className="ml-2 px-4 py-2 bg-primary text-white rounded disabled:opacity-50 transition-colors"
                        disabled={!comment.trim() || sending}
                        onClick={handleComment}
                    >
                        {sending ? "..."  : <Send className="w-4 h-6" />}
                    </button>
                </div>
            ) : (
                <div className="text-neutral-400 text-center mb-6">Inicia sesión para dejar un comentario.</div>
            )}
            {/* Lista de comentarios */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div>Cargando comentarios...</div>
                ) : comments.length === 0 ? (
                    <div className="text-neutral-400 text-center">Sé el primero en comentar.</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-x-4 group relative">
                            <div className="w-15  lg:w-20  aspect-square overflow-hidden rounded-full">
                                <img
                                    src={comment.image}
                                    alt={`foto de perfil de ${comment.name}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-full flex flex-col pr-8">
                                <p className="font-light mt-1 text-sm">{comment.name}</p>
                                <h3 className="font-medium">{comment.text}</h3>
                            </div>
                            {/* Menú de opciones solo para el autor */}
                            {user && comment.userId === user.uid && (
                                <div className="absolute top-2 right-2">
                                    <button
                                        className="p-1 text-neutral-400 hover:text-neutral-600 rounded transition-colors"
                                        title="Opciones"
                                        aria-label="Opciones"
                                        onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    {openMenuId === comment.id && (
                                        <div className="absolute right-0 mt-2 bg-accent   rounded shadow-lg z-10 min-w-[100px]">
                                            <button
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-100/10 rounded"
                                                onClick={() => { setOpenMenuId(null); handleDeleteComment(comment.id); }}
                                            >
                                                <Trash2 className="w-4 h-4" /> Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comments;
