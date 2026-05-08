import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
  try {
    const snapshot = await req.json();

    // 1. OBTENER INGREDIENTES DE SUPABASE (solo los activos)
    const { data: dbIngredients, error: dbError } = await supabase
      .from('ingredients')
      .select('name, description, category, common_allergens')
      .eq('is_active', true);

    if (dbError) throw dbError;
    if (!dbIngredients || dbIngredients.length === 0) {
      throw new Error("No hay ingredientes disponibles en la base de datos.");
    }

    // 2. FILTRAR ALÉRGENOS del usuario antes de pasarlos a la IA
    const userAllergies: string[] = Array.isArray(snapshot.allergies)
      ? snapshot.allergies.map((a: string) => a.toLowerCase().trim())
      : [];

    const safeIngredients = dbIngredients.filter(ing => {
      if (!ing.common_allergens || ing.common_allergens.length === 0) return true;
      const ingAllergens = ing.common_allergens.map((a: string) => a.toLowerCase().trim());
      return !ingAllergens.some((allergen: string) => userAllergies.includes(allergen));
    });

    // 3. CONSTRUIR LA LISTA para el prompt con categoría incluida
    const ingredientsList = safeIngredients
      .map(ing => `- [${ing.category}] ${ing.name}: ${ing.description}`)
      .join('\n');

    // 4. MODELO
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 5. PROMPT — forzamos JSON puro sin markdown
    const prompt = `Eres el formulador experto de VitalBlend AI. Tu misión es elegir la mezcla de 3 ingredientes más eficaz y personalizada para este usuario concreto.

=== PERFIL DEL USUARIO ===
- Edad: ${snapshot.age} años | Sexo: ${snapshot.sex}
- Peso: ${snapshot.weight_kg} kg | Altura: ${snapshot.height_cm} cm
- Objetivo principal: ${snapshot.fitness_goal}
- Tipo de dieta: ${snapshot.diet_type}
- Días de entrenamiento por semana: ${snapshot.training_frequency}
- Alergias declaradas: ${userAllergies.length > 0 ? userAllergies.join(', ') : 'Ninguna'}

=== BIOMARCADORES ACTUALES (escala 1-10) ===
- Nivel de energía: ${snapshot.energy_level}/10 ${snapshot.energy_level <= 4 ? '(BAJO)' : snapshot.energy_level >= 8 ? '(ALTO)' : ''}
- Calidad de sueño: ${snapshot.sleep_quality}/10 ${snapshot.sleep_quality <= 4 ? '(DEFICIENTE)' : ''}
- Nivel de estrés: ${snapshot.stress_level}/10 ${snapshot.stress_level >= 7 ? '(ELEVADO)' : ''}
- Enfoque mental: ${snapshot.focus_level}/10 ${snapshot.focus_level <= 4 ? '(BAJO)' : ''}

=== INGREDIENTES DISPONIBLES (USA SOLO ESTOS) ===
${ingredientsList}

=== INSTRUCCIONES ===
1. Elige exactamente 3 ingredientes de la lista anterior.
2. Prioriza los que resuelvan los biomarcadores bajos y apoyen el objetivo principal.
3. Traduce el nombre al ESPAÑOL eliminando palabras como Powder, Extract, Root, Polvo, Suplemento. Ejemplo: "Maca Root Powder" se convierte en "Maca".
4. La razón debe ser científica y mencionar el biomarcador o necesidad concreta que resuelve.
5. La explicación debe describir la sinergia de los 3, no repetirlos.

=== RESPUESTA ===
Responde ÚNICAMENTE con el siguiente JSON. Sin texto antes, sin texto después, sin bloques de código markdown, sin comillas especiales. Solo el objeto JSON puro:
{"ingredients":["Nombre - Razón","Nombre - Razón","Nombre - Razón"],"explanation":"Sinergia en máx. 2 líneas."}`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    console.log("=== RESPUESTA CRUDA DE GEMINI ===");
    console.log(JSON.stringify(rawText));
    console.log("=================================");

    // 6. LIMPIAR markdown fences
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    // 7. EXTRAER el bloque JSON
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No se encontró JSON en:", cleaned);
      throw new Error("La IA no devolvió un formato JSON válido.");
    }

    // 8. SANITIZAR comillas tipográficas y caracteres de control
    const sanitized = jsonMatch[0]
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\u00AB\u00BB]/g, '"')
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
      .replace(/[\u0000-\u001F]/g, (char) => {
        if (char === '\n') return '\\n';
        if (char === '\r') return '\\r';
        if (char === '\t') return '\\t';
        return ' ';
      });

    // 9. PARSEAR
    let parsed: any;
    try {
      parsed = JSON.parse(sanitized);
    } catch (parseError: any) {
      console.error("JSON que falló el parse:", sanitized);
      throw new Error(`JSON inválido de la IA: ${parseError.message}`);
    }

    // 10. VALIDAR estructura
    if (!Array.isArray(parsed.ingredients) || parsed.ingredients.length !== 3) {
      throw new Error("La IA no devolvió exactamente 3 ingredientes.");
    }
    if (typeof parsed.explanation !== 'string') {
      throw new Error("La IA no devolvió una explicación válida.");
    }

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("Error en /api/recommend:", error.message);
    return NextResponse.json(
      {
        ingredients: ["Error al generar la recomendación"],
        explanation: `Error: ${error.message}. Por favor, inténtalo de nuevo.`
      },
      { status: 500 }
    );
  }
}