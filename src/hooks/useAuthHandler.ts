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
} from "firebase/auth";
import {auth, db} from "@config/firebaseConfig"; // tu path original
import { FirebaseError } from "firebase/app";
import {doc, getDoc, setDoc} from "firebase/firestore";
import avatar1 from "@assets/avatars/avatar-1.webp"
import avatar2 from "@assets/avatars/avatar-2.webp"
import avatar3 from "@assets/avatars/avatar-3.webp"
import avatar4 from "@assets/avatars/avatar-4.webp"
import avatar5 from "@assets/avatars/avatar-5.webp"

export const useAuthHandler = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 👈 lo mantenemos para header
  const [errorMessage, setErrorMessage] = useState("");
  const defaultAvatars = [avatar1, avatar2, avatar3, avatar4, avatar5];
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
      const photo = firebaseUser.photoURL ?? randomAvatar;

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
  };
};
