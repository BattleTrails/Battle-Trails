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
    loadPostForEdit
  } = usePostStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const locationName = postDraft.routePoints[0]?.address || "Ubicación desconocida";

  const showError = (msg: string) => alert(msg);

  const uploadWaypointImages = async (waypoints: typeof postDraft.routePoints, userId: string) => {
    return Promise.all(
      waypoints.map(async (point, index) => {
        if (!point.images?.length) return [];
        try {
          return await uploadImagesToSupabase(point.images, userId);
        } catch (err) {
          console.error(`❌ Error al subir imágenes de la parada ${index}:`, err);
          return [];
        }
      })
    );
  };

  const mapRouteToPostDraft = (route: null | Route) => {
    return route?.waypoints?.map(wp => ({
      geoPoint: wp.geoPoint,
      address: wp.address,
      description: wp.description || "",
      images: [],
    })) || [];
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
    if (!user) return showError("Usuario no autenticado.");
    if (!postDraft.title.trim() || !postDraft.description.trim() || postDraft.routePoints.length < 2) {
      return showError("Por favor, completa todos los campos obligatorios y al menos dos ubicaciones.");
    }
    if (!isEditMode && !postDraft.images.length) {
      return showError("Por favor, añade al menos una imagen.");
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
    let imageUrls: string[] = [];
    if (postDraft.images.length > 0) {
      imageUrls = await uploadImagesToSupabase(postDraft.images, user!.uid);
    }
    const waypointImageUrls = await uploadWaypointImages(postDraft.routePoints, user!.uid);

    const updateData: Partial<Post> = {
      title: postDraft.title,
      description: postDraft.description,
      locationName,
    };
    if (imageUrls.length > 0) {
      updateData.images = imageUrls;
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
    <div className="max-w-6xl mx-auto p-3 rounded-xl bg-base-100 relative ">
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
                ? "Añade nuevas imágenes (las actuales se mantendrán)"
                : "Añade imágenes generales de la ruta"
              }
              mode="main"
            />
          </div>

          <div className="flex-1">
            <ForgeForm />
          </div>
        </div>
      </div>

      {currentStep === 2 && !isTransitioning && (
        <div className="absolute inset-0 transition-all duration-500 ease-in-out opacity-100 pointer-events-auto transform translate-y-0">
          <ForgeRouteEditor
            onBack={handleBackStep}
            onCreateRoute={handleCreateOrUpdatePost}
            isEditMode={isEditMode}
          />
        </div>
      )}
    </div>
  );
};

export default ForgePage;