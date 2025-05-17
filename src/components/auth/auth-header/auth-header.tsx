interface AuthHeaderProps {
  mode: "login" | "register";
}

const AuthHeader = ({ mode }: AuthHeaderProps) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-neutral">
        {mode === "login" ? "Bienvenido a Battle Trails" : "Únete a Battle Trails"}
      </h1>
      <p className="mt-2 text-base text-neutral/80 font-medium">
        {mode === "login"
          ? "Hola de nuevo, inicia sesión y explora la historia."
          : "Regístrate y empieza a compartir tus rutas históricas."}
      </p>
    </div>
  );
};

export default AuthHeader;
