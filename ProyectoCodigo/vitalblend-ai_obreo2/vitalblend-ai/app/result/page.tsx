'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Result() {
  const [recommendation, setRecommendation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function getRecommendation() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No hay usuario autenticado")

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()

        
        // 1. Obtenemos los datos médicos del usuario 
        // (Ordenamos por fecha y cogemos solo 1 para que no dé error si tienes pruebas antiguas guardadas)
        const { data: snapshot } = await supabase
          .from('health_snapshots')
          .select('*')
          .eq('user_profile_id', profile?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!snapshot) throw new Error("No hay datos para analizar")

        // 2. Pedimos la receta a la IA
        const res = await fetch('/api/recommend', {
          method: 'POST',
          body: JSON.stringify(snapshot),
          headers: { 'Content-Type': 'application/json' }
        })

        if (!res.ok) throw new Error("Error en la IA")
        
        const iaData = await res.json()
        setRecommendation(iaData)

        // 3. ¡NUEVO PASO! GUARDAMOS LA FÓRMULA EN SUPABASE
        // Actualizamos la fila del snapshot para añadirle la receta
        // (Asegúrate de que en Supabase la tabla 'health_snapshots' tiene 
        // columnas llamadas 'ai_explanation' y 'ai_ingredients' tipo JSONB o Texto)
        await supabase
          .from('health_snapshots')
          .update({
            ai_explanation: iaData.explanation,
            ai_ingredients: iaData.ingredients // Guardamos el Array tal cual
          })
          .eq('id', snapshot.id)

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getRecommendation()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="animate-pulse text-xl font-bold text-primary">Sincronizando IA y generando tu fórmula...</div>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="bg-destructive/10 text-destructive p-6 rounded-2xl border border-destructive/20 text-center max-w-md">
        <p className="font-bold mb-4">Ups, algo salió mal:</p>
        <p>{error}</p>
        <Link href="/questionnaire" className="block mt-6 underline">Volver al test</Link>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Tu Fórmula VitalBlend</h1>
          <p className="text-muted-foreground text-lg">Basado en tus biomarcadores y objetivos.</p>
        </div>

        <div className="bg-card text-card-foreground p-8 md:p-10 rounded-3xl border border-border shadow-2xl mb-8">
          <div className="mb-8 p-6 bg-muted/20 rounded-2xl border border-border">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">🧠</span> Análisis de la IA
            </h2>
            <p className="text-foreground/80 leading-relaxed text-lg">
              {recommendation?.explanation}
            </p>
          </div>

          <h3 className="text-xl font-bold mb-6 text-primary border-b border-border pb-4">Ingredientes Clave</h3>
          
          <ul className="space-y-4">
            {recommendation?.ingredients?.map((ing: string, i: number) => {
              const [name, reason] = ing.includes('-') ? ing.split('-') : [ing, ''];
              return (
                <li key={i} className="flex flex-col md:flex-row md:items-center gap-2 p-4 bg-background rounded-xl border border-border">
                  <span className="font-bold text-primary text-lg md:w-1/3">{name.trim()}</span>
                  {reason && <span className="text-muted-foreground md:w-2/3">{reason.trim()}</span>}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="inline-block bg-secondary text-secondary-foreground px-8 py-4 rounded-xl font-bold hover:brightness-110 transition-all border border-border">
            Ir a mi Panel de Control
          </Link>
        </div>
      </div>
    </main>
  )
}