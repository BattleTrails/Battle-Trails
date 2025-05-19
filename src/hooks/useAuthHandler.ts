import {useState, useEffect} from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    User, sendPasswordResetEmail,
} from "firebase/auth";
import {auth} from "@config/firebaseConfig"; // tu path original

export const useAuthHandler = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // 👈 lo mantenemos para header
    const [errorMessage, setErrorMessage] = useState("");

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
        "auth/missing-password": "La contraseña introducida no es correcta.",
        /*"auth/cancelled-popup-request": "Se ha cancelado la ventana de inicio de sesión.",*/
        /*"auth/popup-closed-by-user": "Has cerrado la ventana de inicio de sesión.",*/
    };

    const handleError = (error: unknown) => {
        const code = (error as any)?.code;
        console.warn(`⚠️ Firebase error code: ${code}`);

        const message = ERROR_MESSAGES[code] || "Ha ocurrido un error inesperado. Inténtalo de nuevo.";
        setErrorMessage(message);
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


    const register = async (email: string, password: string): Promise<boolean> => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
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
            await signInWithPopup(auth, provider);
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
