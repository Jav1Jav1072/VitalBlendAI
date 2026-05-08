'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Mail, Lock, User, Leaf } from "lucide-react";

export default function SignUpScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false); // Alternar entre Login y Registro
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    general: "",
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ general: "", name: "", email: "", password: "" });
    
    // Validación básica visual
    let hasError = false;
    const newErrors = { general: "", name: "", email: "", password: "" };

    if (!isLogin && !formData.name) {
      newErrors.name = "El nombre es obligatorio";
      hasError = true;
    }
    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Introduce un email válido";
      hasError = true;
    }
    if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // --- MOTOR DE LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
      } else {
        // --- MOTOR DE REGISTRO ---
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        // Si se registra bien, creamos su perfil en la base de datos
        if (data.user) {
          const { error: profileError } = await supabase.from('user_profiles').insert({
            auth_user_id: data.user.id,
            display_name: formData.name,
          });
          if (profileError) throw profileError;
        }
      }

      // Si todo va bien, los mandamos al cuestionario
      router.push("/questionnaire");

    } catch (error: any) {
      setErrors({ ...newErrors, general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center text-foreground hover:text-primary transition-colors -ml-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver
          </Link>

          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-primary/30 bg-white">
                <Leaf className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">VitalBlend AI</h1>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isLogin ? "Bienvenido de nuevo" : "Crea tu Cuenta"}
              </h2>
              <p className="text-muted-foreground mt-2">
                {isLogin ? "Introduce tus datos para acceder a tu fórmula" : "Inicia tu viaje de bienestar personalizado"}
              </p>
            </div>
          </div>

          {/* Error General de Supabase */}
          {errors.general && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Input (Solo en Registro) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Introduce tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full h-12 pl-12 bg-secondary border border-border text-foreground placeholder:text-muted-foreground rounded-xl outline-none focus:ring-2 focus:ring-primary ${
                      errors.name ? "border-destructive" : ""
                    }`}
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full h-12 pl-12 bg-secondary border border-border text-foreground placeholder:text-muted-foreground rounded-xl outline-none focus:ring-2 focus:ring-primary ${
                    errors.email ? "border-destructive" : ""
                  }`}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder={isLogin ? "Tu contraseña" : "Crea una contraseña (mín 6 car.)"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full h-12 pl-12 bg-secondary border border-border text-foreground placeholder:text-muted-foreground rounded-xl outline-none focus:ring-2 focus:ring-primary ${
                    errors.password ? "border-destructive" : ""
                  }`}
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:brightness-110 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {loading ? "Procesando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </button>

            {/* Toggle Login/Registro */}
            <p className="text-center text-muted-foreground text-sm mt-6">
              {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes una cuenta? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({ general: "", name: "", email: "", password: "" });
                }}
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? "Regístrate aquí" : "Inicia Sesión"}
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1758875569612-94d5e0f1a35f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHBlcnNvbiUyMGd5bSUyMGZpdG5lc3N8ZW58MXx8fHwxNzc0MDA4MTczfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Fitness Motivation"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/80" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center space-y-6 max-w-lg">
            <h3 className="text-4xl font-bold text-white drop-shadow-lg">
              Únete al futuro de la suplementación natural
            </h3>
            <p className="text-xl text-white/90 drop-shadow-md">
              Fórmulas personalizadas por IA, basadas 100% en extractos frutales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}