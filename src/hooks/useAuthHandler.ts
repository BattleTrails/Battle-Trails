import {useEffect, useState} from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  /*deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,*/
} from "firebase/auth";
import {auth, db} from "@config/firebaseConfig";
import { FirebaseError } from "firebase/app";
import { /*deleteDoc,*/ doc, getDoc,  setDoc, } from "firebase/firestore";
/*import {deletePostsByUserId} from "@/services/db-service.ts";*/

const defaultAvatars = [
  "/avatars/avatar-1.webp",
  "/avatars/avatar-2.webp",
  "/avatars/avatar-3.webp",
  "/avatars/avatar-4.webp",
  "/avatars/avatar-5.webp",
];

export const useAuthHandler = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 👈 lo mantenemos para header
  const [errorMessage, setErrorMessage] = useState("");
  const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe(); // limpieza
  }, []);

  const ERROR_MESSAGES: Record<string, string> = {
    "auth/user-not-found": "No hay ninguna cuenta registrada con ese correo.",
    "auth/invalid-credential": "La contraseña introducida no es correcta.",
    "auth/email-already-in-use": "Ese correo ya está registrado.",
    "auth/invalid-email": "El formato del correo no es válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/missing-password": "Entrada de contraseña vacía.",
    /*"auth/cancelled-popup-request": "Se ha cancelado la ventana de inicio de sesión.",*/
    /*"auth/popup-closed-by-user": "Has cerrado la ventana de inicio de sesión.",*/
  };

  const handleError = (error: unknown) => {
    if (error instanceof FirebaseError) {
      const code = error.code;
      console.warn(`⚠️ Firebase error code: ${code}`);
      const message = ERROR_MESSAGES[code] || "Ha ocurrido un error inesperado. Inténtalo de nuevo.";
      setErrorMessage(message);
    } else {
      console.error("Error inesperado:", error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setErrorMessage("");
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };


  const register = async (
    email: string,
    password: string,
    name: string,
    username: string
  ): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;

      /*const photo = firebaseUser.photoURL ;*/

      await setDoc(doc(db, "users", uid), {
        name,
        username,
        email,
        profilePicture: randomAvatar,
      });

      setErrorMessage("");
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const uid = firebaseUser.uid;
      const email = firebaseUser.email ?? "";
      const displayName = firebaseUser.displayName ?? "Usuario";
      const photo =  randomAvatar;

      const username = displayName.trim().toLowerCase().replace(/\s+/g, "_");

      // Creamos el documento en /users solo si no existe
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: displayName,
          username,
          email,
          profilePicture: photo,
        });
      }

      setErrorMessage("");
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      setErrorMessage(""); // limpia cualquier error previo
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };


  const logout = async (): Promise<boolean> => {
    try {
      await signOut(auth);
      setUser(null);
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  /*const deleteAccount = async (email?: string, password?: string): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No hay usuario autenticado");

    const uid = user.uid;

    try {

      // 1. Reautenticación del usuario
      await reauthenticateUser(email, password);
      // 2. Borrar datos del usuario en Firestore y Supabase
      await deletePostsByUserId(uid); // ⬅ incluye imágenes y rutas asociadas
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(user);
      console.log("✅ Cuenta eliminada correctamente");
      setUser(null);
      return true;
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        console.warn("⚠️ Se necesita una nueva autenticación");
        throw new Error("Reautenticación requerida");
      }
      console.error("❌ Error al eliminar cuenta:", error);
      throw error;
    }
  };

   const reauthenticateUser = async (email?: string, password?: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("No hay usuario autenticado");
     setErrorMessage(""); // Limpieza de estado previo

    const providerId = user.providerData[0]?.providerId;

    if (providerId === "google.com") {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
    } else if (providerId === "password") {
      if (!email || !password) {
        throw new Error("Email y contraseña requeridos para reautenticarse.");
      }
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);
    } else {
      throw new Error("Proveedor de autenticación no soportado para reautenticación.");
    }
  };*/


  const clearError = () => setErrorMessage("");

  return {
    user,
    loading,
    errorMessage,
    clearError,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    /*deleteAccount,
    reauthenticateUser,*/
  };
};

