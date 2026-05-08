'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plus, Sparkles, RefreshCw, Leaf, TrendingUp } from "lucide-react";
// Importamos los componentes del gráfico
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function DashboardScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [currentFormula, setCurrentFormula] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]); // Aquí guardamos el historial

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, display_name')
        .eq('auth_user_id', user.id)
        .single();
      
      if (profile?.display_name) setUserName(profile.display_name.split(' ')[0]);

      // Pedimos TODAS las filas del usuario, ordenadas de más antigua a más nueva
      const { data: snapshots } = await supabase
        .from('health_snapshots')
        .select('created_at, fitness_goal, ai_explanation, ai_ingredients, energy_level, sleep_quality, stress_level')
        .eq('user_profile_id', profile?.id)
        .order('created_at', { ascending: true }); // Ascendente para el gráfico

      if (snapshots && snapshots.length > 0) {
        // 1. Preparamos los datos para el gráfico
        const formattedHistory = snapshots.map((snap, index) => ({
          name: `Test ${index + 1}`,
          Energía: snap.energy_level,
          Sueño: snap.sleep_quality,
          Estrés: snap.stress_level
        }));
        setHistoryData(formattedHistory);

        // 2. Cogemos la ÚLTIMA fila (la más reciente) para la Fórmula Viva
        const latestSnapshot = snapshots[snapshots.length - 1];
        
        if (latestSnapshot.ai_ingredients && latestSnapshot.ai_ingredients.length > 0) {
          setCurrentFormula({
            goal: latestSnapshot.fitness_goal,
            explanation: latestSnapshot.ai_explanation,
            ingredients: latestSnapshot.ai_ingredients.map((ing: string) => {
              const [name, reason] = ing.includes('-') ? ing.split('-') : [ing, ''];
              return { name: name.trim(), reason: reason?.trim() || '' };
            })
          });
        }
      }

      setLoading(false);
    }
    fetchDashboardData();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-bold">Cargando VitalBlend...</div>;

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Hola, {userName} 👋</h1>
          <p className="text-muted-foreground text-lg">Tu centro de optimización personal.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          
          {/* BLOQUE 1: Acción */}
          <div className="bg-secondary rounded-[32px] p-8 border border-border shadow-lg flex flex-col items-center text-center justify-center min-h-[400px]">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
              {currentFormula ? <RefreshCw className="w-10 h-10 text-primary" /> : <Plus className="w-10 h-10 text-primary" />}
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {currentFormula ? "Actualizar mi Fórmula" : "Crear mi Primera Fórmula"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              ¿Han cambiado tus objetivos o te sientes diferente? Vuelve a evaluar tu estado.
            </p>
            <button
              onClick={() => router.push("/questionnaire")}
              className="w-full max-w-xs h-14 bg-primary hover:brightness-110 text-primary-foreground font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {currentFormula ? "Re-evaluar Estado" : "Comenzar Evaluación"}
            </button>
          </div>

          {/* BLOQUE 2: Fórmula Actual */}
          <div className="bg-gradient-to-br from-secondary to-background rounded-[32px] p-8 border border-border shadow-xl min-h-[400px] flex flex-col">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Leaf className="w-6 h-6 text-primary" />
              Tu Fórmula Activa
            </h3>

            {currentFormula ? (
              <div className="space-y-6 flex-1">
                <div className="inline-block px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-primary font-bold text-sm tracking-widest uppercase">
                  Objetivo: {currentFormula.goal}
                </div>
                <div className="space-y-4 mt-6">
                  {currentFormula.ingredients.map((ing: any, i: number) => (
                    <div key={i} className="bg-background/50 p-4 rounded-2xl border border-border">
                      <p className="font-bold text-white mb-1">{ing.name}</p>
                      <p className="text-sm text-muted-foreground">{ing.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Leaf className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-xl font-bold text-foreground">Aún no tienes una fórmula</p>
              </div>
            )}
          </div>
        </div>

        {/* BLOQUE NUEVO: GRÁFICO DE PROGRESIÓN */}
        {historyData.length > 0 && (
          <div className="bg-secondary rounded-[32px] p-8 border border-border shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Evolución de tus Biomarcadores
            </h3>
            <p className="text-muted-foreground mb-8">Mira cómo han cambiado tus niveles de energía, sueño y estrés a lo largo del tiempo.</p>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis domain={[0, 10]} stroke="#888888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Energía" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Sueño" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Estrés" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}