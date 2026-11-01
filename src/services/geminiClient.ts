/**
 * Client-Side Gemini AI Service for kouziberAPPDS
 * Enables direct in-browser AI generation without requiring a running Node.js backend.
 * Works seamlessly in PWAs, Android APKs, Electron desktop, and static web deployments.
 */

export interface ClientGeminiConfig {
  apiKey: string;
  preferredModel?: "gemini-1.5-flash" | "gemini-2.0-flash" | "gemini-1.5-pro";
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

const FALLBACK_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

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
  let lastErrorMsg = "";

  for (const model of FALLBACK_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      key
    )}`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "Bonjour, réponds OK pour valider la connexion." }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 20,
            temperature: 0.1,
          },
        }),
      });

      const elapsed = Math.round(performance.now() - t0);

      if (res.ok) {
        return {
          success: true,
          message: `تم التحقق من مفتاح Gemini بنجاح عبر نموذج (${model})! الاستجابة نشطة (${elapsed} ms).`,
          latencyMs: elapsed,
        };
      } else {
        const errData = await res.json().catch(() => ({}));
        lastErrorMsg = errData.error?.message || `HTTP ${res.status}`;
      }
    } catch (netErr: unknown) {
      lastErrorMsg = netErr instanceof Error ? netErr.message : "خطأ اتصال بالشبكة";
    }
  }

  const elapsed = Math.round(performance.now() - t0);
  return {
    success: false,
    message: `فشل التحقق من المفتاح: ${lastErrorMsg || "يرجى التأكد من صحة المفتاح واتصال الإنترنت."}`,
    latencyMs: elapsed,
  };
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

  const isPro = params.modelChoice === "gemini-4-argon" || params.modelChoice?.includes("pro");
  const modelsToTry = isPro
    ? ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"]
    : ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

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

  let lastErr = "";
  for (const modelName of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    try {
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
        lastErr = errObj.error?.message || `Erreur API Gemini (${response.status})`;
        continue; // try next model
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Extract code from fences
      const fenceRegex = isLatex
        ? /```(?:latex|tex)?\s*([\s\S]*?)```/i
        : /```(?:typst)?\s*([\s\S]*?)```/i;

      const match = rawText.match(fenceRegex);
      const code = (match ? match[1] : rawText).trim();

      if (code.length > 50) {
        return {
          code,
          modelUsed: `${modelName} (Google Gemini AI Direct)`,
        };
      }
    } catch (e: unknown) {
      lastErr = e instanceof Error ? e.message : "Erreur de connexion";
    }
  }

  throw new Error(lastErr || "استجابة غير مكتملة من الذكاء الاصطناعي.");
}
