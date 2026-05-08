

'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Moon, Brain, Zap, Activity, User, Target, Utensils } from "lucide-react";
 
export default function Questionnaire() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
 
  const [formData, setFormData] = useState({
    age: 25,
    sex: 'Masculino',
    weight_kg: 70,
    height_cm: 175,
    training_frequency: 3,
    fitness_goal: 'Ganar Masa Muscular',
    diet_type: 'Omnívora',
    allergies: '',
    energy_level: 5,
    sleep_quality: 5,
    stress_level: 5,
    focus_level: 5,   // ← Se usaba en UI pero NO se guardaba. Ahora sí.
  });
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
 
    try {
      const { data: { user } } = await supabase.auth.getUser();
 
      if (!user) {
        setErrorMsg("No hay sesión activa. Por favor inicia sesión.");
        setLoading(false);
        return;
      }
 
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
 
      if (!profile) {
        setErrorMsg("No se encontró el perfil de usuario. Inicia sesión de nuevo.");
        setLoading(false);
        return;
      }
 
      const allergiesArray = formData.allergies
        ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean)
        : [];
 
      const snapshotData = {
        user_profile_id: profile.id,
        age:                Number(formData.age),
        sex:                formData.sex,
        weight_kg:          Number(formData.weight_kg),
        height_cm:          Number(formData.height_cm),
        training_frequency: Number(formData.training_frequency),
        fitness_goal:       formData.fitness_goal,
        diet_type:          formData.diet_type,
        allergies:          allergiesArray,
        energy_level:       Number(formData.energy_level),
        sleep_quality:      Number(formData.sleep_quality),
        stress_level:       Number(formData.stress_level),
        focus_level:        Number(formData.focus_level),  // ← FIX: ahora se guarda
        // Campos requeridos por el schema con valores neutros
        // (el usuario no los introduce en este formulario)
        recovery_quality:   5,
        inflammation_level: 5,
        muscle_soreness:    3,
        digestion_quality:  7,
        hydration_level:    7,
      };
 
      const { error: insertError } = await supabase
        .from('health_snapshots')
        .insert(snapshotData);
 
      if (insertError) {
        // Error claro y legible en lugar de un alert() genérico
        setErrorMsg(`Error al guardar datos: ${insertError.message}`);
        setLoading(false);
        return;
      }
 
      // Solo redirigimos si el insert fue OK
      router.push('/result');
 
    } catch (error: any) {
      setErrorMsg(`Error inesperado: ${error.message}`);
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
 
        {/* Cabecera */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-bold text-foreground mb-3">Perfil VitalBlend</h1>
          <p className="text-muted-foreground text-lg">
            Completa tus datos para que nuestra IA genere tu fórmula exacta.
          </p>
        </div>
 
        <form onSubmit={handleSubmit} className="space-y-8">
 
          {/* Alerta de Info */}
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 flex gap-4 shadow-sm">
            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Privacidad y Precisión</h3>
              <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                Tus datos biométricos están encriptados. Necesitamos esta información para que el modelo de
                Inteligencia Artificial cruce tus variables y elimine cualquier ingrediente que no sea óptimo
                para tu metabolismo.
              </p>
            </div>
          </div>
 
          {/* Error visible (reemplaza alert()) */}
          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5 flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive text-sm leading-relaxed">{errorMsg}</p>
            </div>
          )}
 
          {/* Tarjeta 1: Biometría */}
          <div className="bg-secondary rounded-3xl p-6 md:p-8 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-primary w-6 h-6" />
              <h3 className="text-xl font-semibold text-foreground">Biometría Base</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Edad</label>
                <input type="number" min="10" max="100" className="w-full bg-input text-foreground border border-border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value === '' ? 0 : parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Sexo</label>
                <select className="w-full bg-input text-foreground border border-border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.sex}
                  onChange={e => setFormData({...formData, sex: e.target.value})}>
                  <option className="bg-secondary" value="Masculino">Masculino</option>
                  <option className="bg-secondary" value="Femenino">Femenino</option>
                  <option className="bg-secondary" value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Peso (kg)</label>
                <input type="number" min="30" max="300" className="w-full bg-input text-foreground border border-border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.weight_kg}
                  onChange={e => setFormData({...formData, weight_kg: e.target.value === '' ? 0 : parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Altura (cm)</label>
                <input type="number" min="100" max="250" className="w-full bg-input text-foreground border border-border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.height_cm}
                  onChange={e => setFormData({...formData, height_cm: e.target.value === '' ? 0 : parseInt(e.target.value)})} />
              </div>
            </div>
          </div>
 
          {/* Tarjeta 2: Objetivos y Dieta */}
          <div className="bg-secondary rounded-3xl p-6 md:p-8 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-primary w-6 h-6" />
              <h3 className="text-xl font-semibold text-foreground">Objetivos y Dieta</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Objetivo Principal</label>
                <select className="w-full bg-input text-foreground border border-border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.fitness_goal}
                  onChange={e => setFormData({...formData, fitness_goal: e.target.value})}>
                  <option className="bg-secondary" value="Ganar Masa Muscular">Ganar Masa Muscular</option>
                  <option className="bg-secondary" value="Pérdida de Grasa">Pérdida de Grasa</option>
                  <option className="bg-secondary" value="Rendimiento Deportivo">Rendimiento Deportivo</option>
                  <option className="bg-secondary" value="Salud y Longevidad">Salud y Longevidad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Días de entreno/semana</label>
                <input type="number" min="0" max="7" className="w-full bg-input text-foreground border border-border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.training_frequency}
                  onChange={e => setFormData({...formData, training_frequency: e.target.value === '' ? 0 : parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Tipo de Dieta</label>
                <select className="w-full bg-input text-foreground border border-border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={formData.diet_type}
                  onChange={e => setFormData({...formData, diet_type: e.target.value})}>
                  <option className="bg-secondary" value="Omnívora">Omnívora</option>
                  <option className="bg-secondary" value="Vegana">Vegana</option>
                  <option className="bg-secondary" value="Vegetariana">Vegetariana</option>
                  <option className="bg-secondary" value="Keto">Keto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Alergias (separadas por coma)</label>
                <input type="text" className="w-full bg-input text-foreground border border-border p-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Ej: Gluten, Cafeína..."
                  value={formData.allergies}
                  onChange={e => setFormData({...formData, allergies: e.target.value})} />
              </div>
            </div>
          </div>
 
          {/* Tarjeta 3: Biomarcadores */}
          <div className="bg-secondary rounded-3xl p-6 md:p-8 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <Activity className="text-primary w-6 h-6" />
              <h3 className="text-xl font-semibold text-foreground">Biomarcadores Actuales</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
 
              {/* Energía */}
              <div className="bg-background rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-foreground font-semibold">Nivel de Energía</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{formData.energy_level}/10</span>
                </div>
                <input type="range" min="1" max="10"
                  value={formData.energy_level}
                  onChange={e => setFormData({...formData, energy_level: parseInt(e.target.value)})}
                  className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
 
              {/* Sueño */}
              <div className="bg-background rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Moon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-foreground font-semibold">Calidad de Sueño</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{formData.sleep_quality}/10</span>
                </div>
                <input type="range" min="1" max="10"
                  value={formData.sleep_quality}
                  onChange={e => setFormData({...formData, sleep_quality: parseInt(e.target.value)})}
                  className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
 
              {/* Estrés */}
              <div className="bg-background rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-foreground font-semibold">Nivel de Estrés</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{formData.stress_level}/10</span>
                </div>
                <input type="range" min="1" max="10"
                  value={formData.stress_level}
                  onChange={e => setFormData({...formData, stress_level: parseInt(e.target.value)})}
                  className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
 
              {/* Enfoque — antes se mostraba pero NO se guardaba, ahora sí */}
              <div className="bg-background rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-foreground font-semibold">Enfoque Mental</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{formData.focus_level}/10</span>
                </div>
                <input type="range" min="1" max="10"
                  value={formData.focus_level}
                  onChange={e => setFormData({...formData, focus_level: parseInt(e.target.value)})}
                  className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
 
            </div>
          </div>
 
          {/* Botón */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto h-16 px-12 bg-primary hover:brightness-110 text-primary-foreground font-bold text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {loading ? "Sincronizando IA..." : "Generar mi Mezcla Personalizada"}
            </button>
          </div>
 
        </form>
      </div>
    </div>
  );
}