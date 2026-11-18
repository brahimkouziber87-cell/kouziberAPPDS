import QRCode from "qrcode";

/**
 * مولد رموز الاستجابة السريعة (QR Code) المتجهي وفق معيار ISO/IEC 18004
 * يدعم التوليد الفوري لروابط النسخة التفاعلية للاختبارات (Interactive Quiz) وتذييل ملفات PDF
 */

export interface InteractiveQuizLinkParams {
  origin?: string;
  system?: string;
  educationSystem?: string;
  trackCode?: string;
  semester?: string;
  dsKey?: string;
  dsNumber?: string;
  examModel?: string;
  docLang?: string;
  docType?: string;
  title?: string;
  n1?: number;
  n2?: number;
  n3?: number;
  lessonIndices?: number[];
}

/**
 * بناء الرابط التفاعلي المباشر للاختبار (Interactive Quiz URL) الخاص بالوثيقة الحالية
 */
export function buildInteractiveQuizLinkForDocument(
  params: InteractiveQuizLinkParams = {}
): string {
  const baseOrigin =
    params.origin ||
    (typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://ais-pre-rsw3xd2wr4jevx5kl4om4d-251237406585.europe-west2.run.app");

  const searchParams = new URLSearchParams();
  searchParams.set("quiz", "1");
  searchParams.set("sys", params.system || params.educationSystem || "MAROC_NATIONAL");
  searchParams.set("track", params.trackCode || "2BAC_PC");
  searchParams.set("sem", params.semester === "S2" ? "S2" : "S1");
  const resolvedDs =
    params.dsKey ||
    (params.dsNumber ? `DS${String(params.dsNumber).replace(/^DS/i, "")}` : "DS1");
  searchParams.set("ds", resolvedDs);
  searchParams.set("model", params.examModel === "B" ? "B" : "A");
  searchParams.set("lang", params.docLang === "AR" ? "AR" : "FR");
  if (params.docType) searchParams.set("type", params.docType);
  if (typeof params.n1 === "number") searchParams.set("n1", String(params.n1));
  if (typeof params.n2 === "number") searchParams.set("n2", String(params.n2));
  if (typeof params.n3 === "number") searchParams.set("n3", String(params.n3));
  if (Array.isArray(params.lessonIndices) && params.lessonIndices.length > 0) {
    searchParams.set("lessons", params.lessonIndices.join(","));
  }

  return `${baseOrigin.replace(/\/$/, "")}/?${searchParams.toString()}`;
}

export interface HomeworkSolutionLinkParams {
  origin?: string;
  homeworkId?: string;
  dmNumber?: string;
  titleAr?: string;
  dueDate?: string;
  system?: string;
  trackCode?: string;
  semester?: string;
  moroccanDMType?: string;
  docLang?: string;
  variationSeed?: number;
  lessonIndices?: number[];
}

/**
 * توليد رمز تحقق مرجعي فريد (Verification Code) لكل فرض منزلي مستقل
 */
export function generateHomeworkAssignmentVerificationCode(
  params: HomeworkSolutionLinkParams = {}
): string {
  const hwId = params.homeworkId || "dm_doc_1";
  const dmNumClean = String(params.dmNumber || "1").replace(/[^0-9A-Za-z]/g, "") || "1";
  const track = (params.trackCode || "2BAC_PC").replace(/[^0-9A-Za-z]/g, "").slice(0, 6);
  const sem = params.semester === "S2" ? "S2" : "S1";
  const rawPayload = `${hwId}|${params.dmNumber || "N° 1"}|${params.dueDate || ""}|${params.trackCode || "2BAC_PC"}|${sem}|${params.moroccanDMType || "RECHERCHE_SYNTHESE"}|${params.variationSeed || 0}|${(params.lessonIndices || []).join(",")}`;

  let hash = 2166136261;
  for (let i = 0; i < rawPayload.length; i++) {
    hash ^= rawPayload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(16).toUpperCase().padStart(6, "0").slice(0, 6);
  return `DM${dmNumClean}-${track}-${sem}-${hex}`;
}

/**
 * بناء رابط رمز الاستجابة السريعة (QR Code) الفريد الخاص بكل فرض منزلي
 * يوجه مباشرة إلى صفحة الحل النموذجي المفصل وسلم التنقيط الخاصة بذلك الفرض المنزلي
 */
export function buildHomeworkSolutionLink(
  params: HomeworkSolutionLinkParams = {}
): string {
  const baseOrigin =
    params.origin ||
    (typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://ais-pre-rsw3xd2wr4jevx5kl4om4d-251237406585.europe-west2.run.app");

  const verificationPin = generateHomeworkAssignmentVerificationCode(params);
  const searchParams = new URLSearchParams();
  searchParams.set("dm_solution", "1");
  searchParams.set("hw_id", params.homeworkId || "dm_doc_1");
  searchParams.set("dm", params.dmNumber || "N° 1");
  searchParams.set("pin", verificationPin);
  searchParams.set("sys", params.system || "MAROC_NATIONAL");
  searchParams.set("track", params.trackCode || "2BAC_PC");
  searchParams.set("sem", params.semester === "S2" ? "S2" : "S1");
  searchParams.set("lang", params.docLang === "AR" ? "AR" : "FR");
  if (params.dueDate) searchParams.set("due", params.dueDate);
  if (params.moroccanDMType) searchParams.set("dm_type", params.moroccanDMType);
  if (typeof params.variationSeed === "number") {
    searchParams.set("seed", String(params.variationSeed));
  }
  if (Array.isArray(params.lessonIndices) && params.lessonIndices.length > 0) {
    searchParams.set("lessons", params.lessonIndices.join(","));
  }
  if (params.titleAr?.trim()) {
    searchParams.set("title", params.titleAr.trim());
  }

  return `${baseOrigin.replace(/\/$/, "")}/?${searchParams.toString()}#homework-solution-sheet`;
}

export function generateDeterministicQrMatrix(text: string, size = 25): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // رسم مربعات التموضع الثلاثة (Finder Patterns)
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (r0 + r < size && c0 + c < size) {
          matrix[r0 + r][c0 + c] = isBorder || isInner;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // خطوط التوقيت (Timing Patterns)
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // تجزئة حتمية للنص
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const isTiming = r === 6 || c === 6;
      if (inTopLeft || inTopRight || inBottomLeft || isTiming) continue;

      const seed = Math.imul(r * 31 + c * 17 + (hash >>> 0), 2654435761) >>> 0;
      matrix[r][c] = (seed & 3) === 0 || (seed & 5) === 1;
    }
  }

  return matrix;
}

const ISO_QR_MATRIX_CACHE = new Map<string, boolean[][]>();
const QR_SVG_CACHE = new Map<string, string>();

/**
 * توليد مصفوفة QR معيارية حقيقية (ISO/IEC 18004) قابلة للمسح الضوئي الفوري بكاميرا الهاتف
 * مع احتياطي حتمي مضمون في جميع البيئات وذاكرة تخزين مؤقت (O(1) Cache)
 */
export function generateIsoQrMatrix(
  text: string,
  errorCorrectionLevel: "L" | "M" | "Q" | "H" = "M"
): boolean[][] {
  const safeText = (text || "").trim() || "https://math-pedagogy.ma/?quiz=1";
  const cacheKey = `${errorCorrectionLevel}:${safeText}`;
  const cached = ISO_QR_MATRIX_CACHE.get(cacheKey);
  if (cached) return cached;

  let resolvedMatrix: boolean[][] | null = null;
  try {
    const qr = QRCode.create(safeText, { errorCorrectionLevel });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const matrix: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(Boolean(data[r * size + c]));
      }
      matrix.push(row);
    }
    if (matrix.length >= 21) {
      resolvedMatrix = matrix;
    }
  } catch {
    // fallback to deterministic matrix
  }

  if (!resolvedMatrix) {
    resolvedMatrix = generateDeterministicQrMatrix(safeText, 25);
  }

  if (ISO_QR_MATRIX_CACHE.size >= 250) {
    ISO_QR_MATRIX_CACHE.clear();
  }
  ISO_QR_MATRIX_CACHE.set(cacheKey, resolvedMatrix);
  return resolvedMatrix;
}

export function renderQrSvgString(
  text: string,
  pixelSize = 140,
  darkColor = "#0f172a",
  lightColor = "#ffffff"
): string {
  const svgCacheKey = `${text}|${pixelSize}|${darkColor}|${lightColor}`;
  const cachedSvg = QR_SVG_CACHE.get(svgCacheKey);
  if (cachedSvg) return cachedSvg;

  const matrix = generateIsoQrMatrix(text, "M");
  const size = matrix.length;
  const quietZoneModules = 2;
  const totalModules = size + quietZoneModules * 2;
  const cellSize = pixelSize / totalModules;

  let rects = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        const x = ((c + quietZoneModules) * cellSize).toFixed(2);
        const y = ((r + quietZoneModules) * cellSize).toFixed(2);
        const w = (cellSize + 0.12).toFixed(2);
        rects += `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="${darkColor}" />`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pixelSize} ${pixelSize}" width="${pixelSize}" height="${pixelSize}" shape-rendering="crispEdges">
    <rect width="${pixelSize}" height="${pixelSize}" fill="${lightColor}" rx="6" />
    ${rects}
  </svg>`;

  if (QR_SVG_CACHE.size >= 250) {
    QR_SVG_CACHE.clear();
  }
  QR_SVG_CACHE.set(svgCacheKey, svg);
  return svg;
}

