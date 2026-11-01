/**
 * Client-Side Gemini AI Service for kouziberAPPDS
 * Enables direct in-browser AI generation without requiring a running Node.js backend.
 * Works seamlessly in PWAs, Android APKs, Electron desktop, and static web deployments.
 */

export interface ClientGeminiConfig {
  apiKey: string;
  preferredModel?: "gemini-2.5-flash" | "gemini-2.5-pro" | "gemini-2.0-flash" | "gemini-1.5-flash";
}

const STORAGE_KEY = "GEMINI_API_KEY";

export function getClientGeminiApiKey(): string | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim().length > 10 && !saved.startsWith("YOUR_") && saved !== "MY_GEMINI_API_KEY") {
      return saved.trim();
    }
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && typeof envKey === "string" && envKey.trim().length > 10) {
      return envKey.trim();
    }
  } catch {
    // Ignore localStorage access errors in restricted iframe sandbox
  }
  return null;
}

export function setClientGeminiApiKey(key: string): void {
  try {
    if (!key || !key.trim()) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  } catch (err) {
    console.warn("Could not save GEMINI_API_KEY to localStorage:", err);
  }
}

export function removeClientGeminiApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function testGeminiApiKey(
  apiKeyToTest?: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const key = apiKeyToTest || getClientGeminiApiKey();
  if (!key) {
    return {
      success: false,
      message: "لم يتم العثور على مفتاح API. يرجى إدخال مفتاح Google Gemini API صالح.",
    };
  }

  const t0 = performance.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
    key
  )}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: "Bonjour, réponds brièvement par OK pour valider la connexion." }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 20,
          temperature: 0.1,
        },
      }),
    });

    const elapsed = Math.round(performance.now() - t0);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${res.status} ${res.statusText}`;
      return {
        success: false,
        message: `فشل التحقق من المفتاح: ${errMsg}`,
        latencyMs: elapsed,
      };
    }

    return {
      success: true,
      message: `تم التحقق من مفتاح Gemini بنجاح! الاستجابة نشطة (${elapsed} ms).`,
      latencyMs: elapsed,
    };
  } catch (err) {
    const elapsed = Math.round(performance.now() - t0);
    const msg = err instanceof Error ? err.message : "خطأ غير متوقع في الشبكة";
    return {
      success: false,
      message: `تعذر الاتصال بخوادم Google Gemini (${msg}). يرجى التأكد من اتصال الإنترنت.`,
      latencyMs: elapsed,
    };
  }
}

export interface ClientDocumentGenerationParams {
  school: string;
  prof: string;
  year: string;
  academy?: string;
  direction?: string;
  trackLabelAr: string;
  trackLabelFr: string;
  durationAr: string;
  durationFr: string;
  exportFormat: "LATEX" | "TYPST";
  examModel: "A" | "B" | "BOTH";
  activeModule: string;
  semester: string;
  dsKey: string;
  lessons: Array<{
    lessonAr: string;
    lessonFr: string;
    weight: number;
    hours: string;
    capacitiesAr?: string[];
    capacitiesFr?: string[];
    sampleExerciseAr?: string[];
    sampleExerciseFr?: string[];
  }>;
  customTopicNote?: string;
  modelChoice?: string;
}

/**
 * Generates exam source code (LaTeX or Typst) directly from the client using Google Gemini API.
 */
export async function generateDocumentWithClientGemini(
  params: ClientDocumentGenerationParams
): Promise<{ code: string; modelUsed: string }> {
  const apiKey = getClientGeminiApiKey();
  if (!apiKey) {
    throw new Error("لا يوجد مفتاح GEMINI_API_KEY مسجل في المتصفح.");
  }

  const modelName =
    params.modelChoice === "gemini-4-argon" || params.modelChoice?.includes("pro")
      ? "gemini-2.5-pro"
      : "gemini-2.5-flash";

  const isLatex = params.exportFormat === "LATEX";
  const formatName = isLatex ? "LaTeX / XeLaTeX" : "Typst";

  const lessonsDesc = params.lessons
    .map(
      (l, idx) =>
        `Exercice ${idx + 1}: ${l.lessonFr} / ${l.lessonAr} (${l.weight}% du devoir). Capacités: ${(
          l.capacitiesFr || []
        ).join(", ")}`
    )
    .join("\n");

  const prompt = `Tu es un professeur agrégé et inspecteur de mathématiques au Maroc (Lycée d'Excellence).
Génère le code source complet prêt à compiler en ${formatName} pour un devoir surveillé officiel (${params.dsKey} - Semestre ${params.semester}).
Informations administratives:
- Établissement: ${params.school}
- Professeur: ${params.prof}
- Année scolaire: ${params.year}
- Filière: ${params.trackLabelFr} (${params.trackLabelAr})
- Durée: ${params.durationFr} (${params.durationAr})
- Modèle: Sujet ${params.examModel}

Contenu pédagogique et exercices requis:
${lessonsDesc}

Directives de rédaction:
1. Document complet avec en-tête officiel, tableau de barème sur 20 points, et consignes ministérielles.
2. Tous les exercices doivent être rigoureusement formulés en français (option BIOF) avec notation mathématique standard.
3. Inclure à la fin les éléments de corrigé détaillé (Solutions pas à pas).
4. Code propre, compilable immédiatement sans erreurs.
Sortie: Retourne UNIQUEMENT le bloc de code source entre \`\`\`${isLatex ? "latex" : "typst"} et \`\`\`.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const errObj = await response.json().catch(() => ({}));
    throw new Error(errObj.error?.message || `Erreur API Gemini (${response.status})`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Extract code from fences
  const fenceRegex = isLatex
    ? /```(?:latex|tex)?\s*([\s\S]*?)```/i
    : /```(?:typst)?\s*([\s\S]*?)```/i;

  const match = rawText.match(fenceRegex);
  const code = (match ? match[1] : rawText).trim();

  if (code.length < 50) {
    throw new Error("استجابة غير مكتملة من الذكاء الاصطناعي.");
  }

  return {
    code,
    modelUsed: `${modelName} (Direct Client-Side)`,
  };
}
