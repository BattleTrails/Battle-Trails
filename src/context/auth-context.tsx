import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { auth, db } from '@config/firebaseConfig';
import { FirebaseError } from 'firebase/app';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  name?: string;
  username?: string;
  bio?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  errorMessage: string;
  refreshUserProfile: () => Promise<void>;
  // Funciones de autenticación
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name: string,
    username: string
  ) => Promise<{ success: boolean; user?: User }>;
  loginWithGoogle: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const defaultAvatars = [
    '/avatars/avatar-1.webp',
    '/avatars/avatar-2.webp',
    '/avatars/avatar-3.webp',
    '/avatars/avatar-4.webp',
    '/avatars/avatar-5.webp',
  ];

  const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

  // Función para manejar errores
  const handleError = (error: unknown) => {
    if (error instanceof FirebaseError) {
      const friendlyMessage = ERROR_MESSAGES[error.code] || error.message;
      setErrorMessage(friendlyMessage);
    } else {
      setErrorMessage('Ha ocurrido un error inesperado');
    }
  };

  const ERROR_MESSAGES: Record<string, string> = {
    'auth/user-not-found': 'No hay ninguna cuenta registrada con ese correo.',
    'auth/invalid-credential': 'La contraseña introducida no es correcta.',
    'auth/email-already-in-use': 'Ese correo ya está registrado.',
    'auth/invalid-email': 'El formato del correo no es válido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/missing-password': 'Entrada de contraseña vacía.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Inténtalo más tarde.',
  };

  // Función para iniciar sesión
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Verificar si el email está verificado
      if (!firebaseUser.emailVerified) {
        setErrorMessage('Por favor, verifica tu correo electrónico antes de iniciar sesión.');
        await signOut(auth);
        return false;
      }

      setErrorMessage('');
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  // Función para registrarse
  const register = async (
    email: string,
    password: string,
    name: string,
    username: string
  ): Promise<{ success: boolean; user?: User }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;

      await setDoc(doc(db, 'users', uid), {
        name,
        username,
        email,
        profilePicture: randomAvatar,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });

      // Enviar email de verificación
      await sendEmailVerification(firebaseUser);

      setErrorMessage('');
      return { success: true, user: firebaseUser };
    } catch (error) {
      handleError(error);
      return { success: false };
    }
  };

  // Función para iniciar sesión con Google
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const uid = firebaseUser.uid;

      // Crear documento del usuario si no existe
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const displayName = firebaseUser.displayName || '';
        const email = firebaseUser.email || '';
        const photo = firebaseUser.photoURL || randomAvatar;

        // Crear username a partir del email si no hay displayName
        const baseUsername = displayName || email.split('@')[0];
        const username = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');

        await setDoc(userRef, {
          name: displayName,
          username,
          email,
          profilePicture: photo,
        });
      }

      setErrorMessage('');
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  // Función para resetear contraseña
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      setErrorMessage('');
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  // Función para cerrar sesión
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

  // Función para limpiar errores
  const clearError = () => {
    setErrorMessage('');
  };

  // Función para cargar el perfil del usuario
  const loadUserProfile = async (uid: string) => {
    try {
      setProfileLoading(true);
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          name: data.name,
          username: data.username,
          bio: data.bio,
          profilePicture: data.profilePicture,
        });
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // Función para refrescar el perfil del usuario
  const refreshUserProfile = async () => {
    if (user?.uid) {
      await loadUserProfile(user.uid);
    }
  };

  // Escuchar cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cargar perfil cuando cambia el usuario
  useEffect(() => {
    if (user?.uid) {
      loadUserProfile(user.uid);

      // Escuchar cambios en tiempo real en el documento del usuario
      const unsubscribeFirestore = onSnapshot(doc(db, 'users', user.uid), doc => {
        if (doc.exists()) {
          const data = doc.data();
          setUserProfile({
            name: data.name,
            username: data.username,
            bio: data.bio,
            profilePicture: data.profilePicture,
          });
        }
      });

      // Escuchar evento personalizado para forzar actualización del perfil
      const handleProfileUpdate = () => {
        if (user?.uid) {
          loadUserProfile(user.uid);
        }
      };

      window.addEventListener('profileUpdated', handleProfileUpdate);

      return () => {
        unsubscribeFirestore();
        window.removeEventListener('profileUpdated', handleProfileUpdate);
      };
    } else {
      setUserProfile(null);
    }
  }, [user?.uid]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading: loading || profileLoading,
    errorMessage,
    refreshUserProfile,
    login,
    register,
    loginWithGoogle,
    resetPassword,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
};
