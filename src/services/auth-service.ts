// src/services/auth-service.ts
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User,
    sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@config/firebaseConfig.ts";

// Registro con email y password
export const registerWithEmail = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

// Login con email y password
export const loginWithEmail = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

// Login con Google
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
};

// Logout
export const logout = () => {
    return signOut(auth);
};

// Escuchar el cambio de usuario autenticado (para Zustand, etc.)
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
};
