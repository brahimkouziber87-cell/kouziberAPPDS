import QRCode from "qrcode";
import { LessonItem } from "../data/curriculum";

/**
 * محرك توليد وتخصيص رموز الاستجابة السريعة (QR Codes) لحلول التمارين الفردية
 * Exercise Solution Custom QR Code Engine
 * 
 * يتيح للأستاذ توليد وتخصيص رموز QR لكل تمرين بعينه في الفرض أو السلسلة،
 * ودمجها مباشرة في الورقة المطبوعة بجانب عنوان التمرين أو في شريط سفلي،
 * لتمكين التلميذ من مسح الرمز والوصول فوراً للحل النموذجي، فيديو الشرح، أو مجسم GeoGebra.
 */

export type ExerciseQrTargetType =
  | "BUILTIN_INTERACTIVE"   // الحل النموذجي التفاعلي المباشر بالتطبيق
  | "EXTERNAL_URL"          // رابط خارجي مخصص (Google Drive / YouTube / منصة مدرسية)
  | "CUSTOM_TEXT_SOLUTION"  // نص الحل السريع أو ملاحظات توجيهية خاصة بالأستاذ
  | "GEOGEBRA_3D";          // مجسم GeoGebra 3D / 2D تفاعلي مرتبط بالتمرين

export type ExerciseQrBadgePosition =
  | "HEADER_RIGHT"          // بجانب عنوان التمرين
  | "BOTTOM_BANNER"         // شريط أفقي أنيق في أسفل التمرين
  | "INLINE_CALLOUT";       // مربع نداء مميز جانبي

export type ExerciseQrBadgeSize = "COMPACT_16MM" | "STANDARD_22MM" | "PROMINENT_28MM";

export interface ExerciseSolutionQrConfig {
  exerciseId: string;       // e.g. "ex_0", "ex_1", "serie_ex_0", "dm_0"
  exerciseIndex: number;    // 0, 1, 2...
  exerciseNumber: number;   // 1, 2, 3...
  exerciseTitleAr: string;  // e.g. "التمرين 1 : دراسة الدوال العددية"
  exerciseTitleFr: string;  // e.g. "Exercice 1 : Étude de Fonctions"
  enabled: boolean;
  targetType: ExerciseQrTargetType;
  customUrl?: string;
  customSolutionText?: string;
  badgePosition: ExerciseQrBadgePosition;
  badgeSize: ExerciseQrBadgeSize;
  customLabelAr?: string;
  customLabelFr?: string;
  showScanInstruction: boolean;
  points?: string;
}

export type ExerciseSolutionQrMap = Record<string, ExerciseSolutionQrConfig>;

const EXERCISE_QR_SVG_CACHE = new Map<string, string>();

/**
 * بناء الرابط الفعلي الذي يوجه إليه رمز الـ QR
 */
export function buildExerciseSolutionUrl(
  config: ExerciseSolutionQrConfig,
  baseOrigin?: string
): string {
  if (config.targetType === "EXTERNAL_URL" && config.customUrl?.trim()) {
    return config.customUrl.trim();
  }

  if (config.targetType === "GEOGEBRA_3D" && config.customUrl?.trim()) {
    return config.customUrl.trim();
  }

  const origin =
    baseOrigin ||
    (typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://ais-pre-rsw3xd2wr4jevx5kl4om4d-251237406585.europe-west2.run.app");

  const searchParams = new URLSearchParams();
  searchParams.set("solution_mode", "1");
  searchParams.set("ex_num", String(config.exerciseNumber));
  searchParams.set("ex_id", config.exerciseId);
  searchParams.set("title", config.exerciseTitleAr);

  if (config.targetType === "CUSTOM_TEXT_SOLUTION" && config.customSolutionText?.trim()) {
    searchParams.set("custom_note", encodeURIComponent(config.customSolutionText.trim().slice(0, 500)));
  }

  return `${origin.replace(/\/$/, "")}/?${searchParams.toString()}`;
}

/**
 * توليد مصفوفة QR متجهة حقيقية وفق معيار ISO/IEC 18004
 */
export function generateExerciseQrMatrix(text: string): { size: number; cells: { x: number; y: number }[] } {
  try {
    const qr = QRCode.create(text || "https://men.gov.ma", {
      errorCorrectionLevel: "M",
    });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const cells: { x: number; y: number }[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (data[y * size + x]) {
          cells.push({ x, y });
        }
      }
    }
    return { size, cells };
  } catch {
    return { size: 21, cells: [] };
  }
}

/**
 * إنتاج نص SVG نقي عالي الدقة (300+ DPI Vector) للطباعة الورقية
 */
export function renderExerciseQrSvg(
  urlOrText: string,
  pixelSize = 80,
  darkColor = "#0f172a"
): string {
  const cacheKey = `${urlOrText}|${pixelSize}|${darkColor}`;
  const cached = EXERCISE_QR_SVG_CACHE.get(cacheKey);
  if (cached) return cached;

  const { size, cells } = generateExerciseQrMatrix(urlOrText);
  const margin = 2;
  const viewBoxSize = size + margin * 2;

  const pathData = cells
    .map((c) => `M${c.x + margin},${c.y + margin}h1v1h-1z`)
    .join(" ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${pixelSize}" height="${pixelSize}" shape-rendering="crispEdges">
    <rect width="${viewBoxSize}" height="${viewBoxSize}" fill="#ffffff" rx="1.5" />
    <path d="${pathData}" fill="${darkColor}" />
  </svg>`;

  if (EXERCISE_QR_SVG_CACHE.size >= 200) {
    EXERCISE_QR_SVG_CACHE.clear();
  }
  EXERCISE_QR_SVG_CACHE.set(cacheKey, svg);
  return svg;
}

/**
 * بناء خريطة أولية لرموز QR لكافة تمارين الوثيقة الحالية
 */
export function initializeExerciseSolutionQrs(
  lessons: LessonItem[],
  isFr: boolean = false
): ExerciseSolutionQrMap {
  const map: ExerciseSolutionQrMap = {};

  lessons.forEach((lesson, idx) => {
    const exId = `ex_${idx}`;
    const exNum = idx + 1;
    map[exId] = {
      exerciseId: exId,
      exerciseIndex: idx,
      exerciseNumber: exNum,
      exerciseTitleAr: `التمرين ${exNum} : ${lesson.lessonAr}`,
      exerciseTitleFr: `Exercice ${exNum} : ${lesson.lessonFr}`,
      enabled: false, // معطل افتراضياً حتى يفعله الأستاذ بضغطة زر
      targetType: "BUILTIN_INTERACTIVE",
      badgePosition: "BOTTOM_BANNER",
      badgeSize: "STANDARD_22MM",
      customLabelAr: "امسح للاطلاع على التصحيح النموذجي المفصل",
      customLabelFr: "Scanner pour la solution détaillée",
      showScanInstruction: true,
      points: `${lesson.weight || 4}`,
    };
  });

  return map;
}

/**
 * تحويل حجم الشارة من كود الحجم إلى بكسل و ملم
 */
export function getQrPixelSizeFromPreset(size: ExerciseQrBadgeSize): number {
  switch (size) {
    case "COMPACT_16MM":
      return 56;
    case "STANDARD_22MM":
      return 72;
    case "PROMINENT_28MM":
      return 92;
    default:
      return 72;
  }
}
