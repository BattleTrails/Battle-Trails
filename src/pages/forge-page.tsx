import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ForgeImages from "@pages/forge/forge-images/forge-images.tsx";
import ForgeForm from "@pages/forge/forge-form/forge-form.tsx";
import ForgeButtonSave from "@pages/forge/forge-button-save/forge-button-save.tsx";
import { useAuth } from "@context/auth-context.tsx";
import { usePostStore } from "@/store/usePostStore.ts";
import { createPost, createRoute, getPostById, getRouteByPostId, updatePost, updateRoute } from "@/services/db-service.ts";
import { uploadImagesToSupabase } from "@/services/supabase-storage-service.ts";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@config/firebaseConfig.ts";
import ForgeRouteEditor from "@pages/forge/ForgeRouteDescription.tsx";
import clsx from "clsx";
import {Post, Route} from "@/types";
import { deleteImagesFromSupabase } from "@/services/supabase-storage-service";
import {extractSupabasePaths} from "@/utils/extract-supabase-paths.ts";
import Alert from "@components/ui/alert/alert.tsx";

const ForgePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { postId } = useParams();
  const {
    postDraft,
    resetPostDraft,
    setImages,
    isEditMode,
    setEditMode,
    loadPostForEdit,
    setPostField,
  } = usePostStore();
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingWaypointImages, setExistingWaypointImages] = useState<string[][]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);
  const [deletedWaypointImageUrls, setDeletedWaypointImageUrls] = useState<string[][]>([]);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertType, setAlertType] = useState<"error" | "success" | "info">("error");

  const locationName = postDraft.routePoints[0]?.address || "Ubicación desconocida";

  const showError = (msg: string) => {
    setAlertMessage(msg);
    setAlertType("error");
  };

  const uploadWaypointImages = async (waypoints: typeof postDraft.routePoints, userId: string) => {
    return Promise.all(
      waypoints.map(async (point, index) => {
        // En modo edición, empezar con las imágenes existentes
        const existingImages = existingWaypointImages[index] || [];
        const deletedImages = deletedWaypointImageUrls[index] || [];
        const existingForThisWaypoint = existingImages.filter(img => !deletedImages.includes(img));


        if (!point.images?.length) {
          // Si no hay imágenes nuevas, mantener solo las existentes
          return existingForThisWaypoint;
        }

        try {
          const newImageUrls = await uploadImagesToSupabase(point.images, userId);
          // Combinar imágenes existentes con las nuevas
          return [...existingForThisWaypoint, ...newImageUrls];
        } catch (err) {
          console.error(`❌ Error al subir imágenes de la parada ${index}:`, err);
          return existingForThisWaypoint;
        }
      })
    );
  };

  const mapRouteToPostDraft = (route: null | Route) => {
    if (!route?.waypoints) return [];

    // Guardar las imágenes existentes de waypoints
    const waypointImageUrls = route.waypoints.map(wp => wp.images || []);
    setExistingWaypointImages(waypointImageUrls);

    // INICIALIZA borrado vacío para cada parada
    setDeletedWaypointImageUrls(route.waypoints.map(() => []));

    return route.waypoints.map(wp => ({
      geoPoint: wp.geoPoint,
      address: wp.address,
      description: wp.description || "",
      images: [],
    }));
  };


  useEffect(() => {
    const loadPostData = async () => {
      if (postId && !isEditMode) {
        setIsLoading(true);
        try {
          const post = await getPostById(postId);
          if (post.userId !== user?.uid) {
            showError("No tienes permisos para editar este post");
            navigate("/");
            return;
          }

          const route = await getRouteByPostId(postId);
          // Guardar las imágenes existentes del post
          setExistingImages(post.images || []);

          const postData = {
            title: post.title,
            description: post.description,
            images: [],
            address: "",
            routePoints: mapRouteToPostDraft(route),
            distance: "",
          };

          setEditMode(true, postId);
          loadPostForEdit(postData);
        } catch (error) {
          console.error("Error al cargar el post para editar:", error);
          showError("Error al cargar los datos del post");
          navigate("/");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPostData();
  }, [postId, user?.uid, isEditMode, setEditMode, loadPostForEdit, navigate]);

  useEffect(() => {
    return () => resetPostDraft();
  }, [resetPostDraft]);

  const validateStep1 = () => {
    if (!user) {
      showError("Usuario no autenticado.");
      return false;
    }
    if (!postDraft.title.trim() || !postDraft.description.trim() || postDraft.routePoints.length < 2) {
      showError("Por favor, completa todos los campos obligatorios y al menos dos ubicaciones.");
      return false;
    }
    const totalMainImages = [
      ...existingImages.filter(img => !deletedImageUrls.includes(img)),
      ...postDraft.images
    ];

    if (totalMainImages.length === 0) {
      showError("Debes mantener al menos una imagen principal.");
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateStep1()) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(2);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleUpdatePost = async (postId: string) => {
    // 1. Eliminar físicamente las imágenes borradas por el usuario
    if (deletedImageUrls.length > 0) {
      const imagePathsToDelete = extractSupabasePaths(deletedImageUrls);
      await deleteImagesFromSupabase(imagePathsToDelete);
    }

    // 2. Filtrar imágenes existentes que no han sido eliminadas
    let finalImageUrls = existingImages.filter(img => !deletedImageUrls.includes(img));

    // 3. Subir imágenes nuevas (si hay)
    if (postDraft.images.length > 0) {
      const newImageUrls = await uploadImagesToSupabase(postDraft.images, user!.uid);
      finalImageUrls = [...finalImageUrls, ...newImageUrls];
    }

    // 4. Subir imágenes de waypoints (sin borrado aún)
    const waypointImageUrls = await uploadWaypointImages(postDraft.routePoints, user!.uid);

    // 5. Guardar en Firestore
    const updateData: Partial<Post> = {
      title: postDraft.title,
      description: postDraft.description,
      locationName,
      images: finalImageUrls,
    };
    if (deletedWaypointImageUrls.length > 0) {
      const allWaypointUrls = deletedWaypointImageUrls.flat();
      const waypointPaths = extractSupabasePaths(allWaypointUrls);
      await deleteImagesFromSupabase(waypointPaths);
    }
    await updatePost(postId, updateData);
    await updateRoute(postId, {
      waypoints: postDraft.routePoints.map((p, i) => ({
        geoPoint: p.geoPoint,
        address: p.address,
        description: p.description || "",
        images: waypointImageUrls[i] || [],
      })),
    });
  };

  const handleRemoveWaypoint = (index: number) => {
    // 1. Marcar imágenes existentes para borrado
    const imagesToDelete = existingWaypointImages[index] || [];
    setDeletedWaypointImageUrls((prev) => {
      const copy = [...prev];
      copy.splice(index, 1, imagesToDelete);
      return copy;
    });

    // 2. Eliminar parada del draft usando setPostField
    const newRoutePoints = [
      ...postDraft.routePoints.slice(0, index),
      ...postDraft.routePoints.slice(index + 1)
    ];
    setPostField("routePoints", newRoutePoints);

    // 3. Eliminar imágenes existentes asociadas a esa parada
    setExistingWaypointImages((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };




  const handleCreateNewPost = async () => {
    const imageUrls = await uploadImagesToSupabase(postDraft.images, user!.uid);
    const postId = await createPost({
      userId: user!.uid,
      title: postDraft.title,
      description: postDraft.description,
      images: imageUrls,
      locationName,
      likes: 0,
      likedBy: [],
    });
    const waypointImageUrls = await uploadWaypointImages(postDraft.routePoints, user!.uid);
    await createRoute({
      postId,
      waypoints: postDraft.routePoints.map((p, i) => ({
        geoPoint: p.geoPoint,
        address: p.address,
        description: p.description || "",
        images: waypointImageUrls[i] || [],
      })),
    }, postId);
    await updateDoc(doc(db, "posts", postId), { routeId: postId });
  };

  const handleCreateOrUpdatePost = async () => {
    if (!user) return console.warn("Usuario no autenticado.");
    if (isSubmitting) return;
    if (postDraft.routePoints.some(p => !p.description?.trim())) {
      return showError("Por favor, añade una descripción a todas las paradas antes de crear la ruta.");
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && postId) {
        await handleUpdatePost(postId);
      } else {
        await handleCreateNewPost();
      }
      resetPostDraft();
      navigate("/");
    } catch (error) {
      console.error("Error al crear/actualizar la publicación:", error);
      showError("Ha ocurrido un error. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const step1Visible = currentStep === 1 && !isTransitioning;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-3 rounded-xl bg-base-100 relative">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 text-gray-500">Cargando datos del post...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 rounded-xl bg-base-100 relative">
      {alertMessage && (
        <Alert 
          message={alertMessage} 
          onClose={() => setAlertMessage("")} 
          type={alertType}
        />
      )}
      
      <div
        className={clsx("transition-all duration-500 ease-in-out", {
          "opacity-100 pointer-events-auto translate-y-0": step1Visible,
          "opacity-0 pointer-events-none -translate-y-4": !step1Visible
        })}
      >
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-bold text-neutral mb-6">
            {isEditMode ? 'Editar tu ruta' : 'Crea tu ruta!'}
          </h1>
          <ForgeButtonSave
            onClick={handleNextStep}
            text={isEditMode ? "Continuar editando" : "Describe tu ruta"}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <ForgeImages
              images={postDraft.images}
              setImages={setImages}
              label={isEditMode
                ? "Edita las imágenes principales de la ruta"
                : "Añade imágenes generales de la ruta"
              }
              mode="main"
              existingImages={isEditMode ? existingImages : []}
              deletedImageUrls={deletedImageUrls}
              setDeletedImageUrls={setDeletedImageUrls}
            />
          </div>

          <div className="flex-1">
            <ForgeForm onRemoveWaypoint={handleRemoveWaypoint} />
          </div>
        </div>
      </div>

      {currentStep === 2 && !isTransitioning && (
        <div className="absolute inset-0 transition-all duration-500 ease-in-out opacity-100 pointer-events-auto transform translate-y-0">
          <ForgeRouteEditor
            onBack={handleBackStep}
            onCreateRoute={handleCreateOrUpdatePost}
            isEditMode={isEditMode}
            existingWaypointImages={existingWaypointImages}
            deletedWaypointImageUrls={deletedWaypointImageUrls}
            setDeletedWaypointImageUrls={setDeletedWaypointImageUrls}
          />
        </div>
      )}
    </div>
  );
};

export default ForgePage;