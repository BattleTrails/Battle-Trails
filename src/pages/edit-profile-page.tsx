import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { getUserById } from '@/services/db-service';
import { updateUserProfile, validateUsername } from '@/services/user-service';
import { User } from '@/types';
import { Camera } from 'lucide-react';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser) {
        navigate('/');
        return;
      }

      try {
        const data = await getUserById(authUser.uid);
        setUserData(data);
        setFormData({
          name: data.name || '',
          username: data.username || '',
          bio: data.bio || '',
        });
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setError('Error al cargar los datos del usuario');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [authUser, navigate]);

  // Limpiar URLs de preview cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      // Limpiar el input
      if (e.target) e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      // Limpiar el input
      if (e.target) e.target.value = '';
      return;
    }

    // Limpiar errores previos
    setError('');

    // Limpiar preview anterior para evitar problemas de memoria
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    setNewProfilePicture(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !userData) return;

    setError('');
    setSaving(true);

    try {
      // Validaciones
      if (formData.name.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }

      if (formData.username !== userData.username) {
        const isValidUsername = await validateUsername(formData.username);
        if (!isValidUsername) {
          throw new Error('El nombre de usuario no es válido o ya está en uso');
        }
      }

      // Limpiar imagen de preview mientras se procesa
      setPreviewImage(null);

      // Actualizar perfil
      await updateUserProfile(authUser.uid, {
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        ...(newProfilePicture && { profilePicture: newProfilePicture }),
      });

      // Limpiar estado después de éxito
      setNewProfilePicture(null);
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error detallado:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el perfil');
      // Restaurar preview si hubo error
      if (newProfilePicture) {
        setPreviewImage(URL.createObjectURL(newProfilePicture));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-neutral border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Editar perfil</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto de perfil */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group"
            onClick={handleImageClick}
          >
            <img
              src={previewImage || userData?.profilePicture}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white w-6 h-6" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <p className="text-sm text-gray-500">Haz clic para cambiar tu foto de perfil</p>
        </div>

        {/* Campos del formulario */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral focus:border-transparent"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral focus:border-transparent"
              placeholder="@username"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Biografía
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral focus:border-transparent resize-none"
              placeholder="Cuéntanos sobre ti..."
            />
          </div>
        </div>

        {/* Mensajes de error/éxito */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">¡Perfil actualizado correctamente!</p>}

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-neutral text-white rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
