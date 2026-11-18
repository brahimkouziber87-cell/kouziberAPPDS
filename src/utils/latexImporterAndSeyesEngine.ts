import { LessonItem } from "../data/curriculum";

/**
 * خيارات تباعد أسطر مسطرة السيري الفرنسية (Seyès Haute Précision)
 * مصممة لتناسب الكتابة العربية (الحروف الصاعدة والنازلة والكسور) والكتابة الفرنسية اللاتينية
 */
export type SeyesSpacingPreset =
  | "FR_STANDARD_8MM"      // قياسي فرنسي: مربعات 8mm وتسطير فرعي 2mm (4 تقسيمات لكل مربع)
  | "BILINGUAL_10MM"       // مزدوج عربي/فرنسي: مربعات 10mm وتسطير فرعي 2.5mm
  | "ARABIC_COMFORT_12MM"  // عربي مريح للكسور: مربعات 12mm وتسطير فرعي 3mm
  | "COMPACT_EXAM_6_4MM";  // مدمج للامتحانات: مربعات 6.4mm وتسطير فرعي 1.6mm

export interface SeyesSpacingOption {
  id: SeyesSpacingPreset;
  labelAr: string;
  labelFr: string;
  shortBadgeAr: string;
  majorStepMm: number;
  subStepMm: number;
  subdivisions: number;
  tileSizePx: number;
  lineHeightPx: number;
  descriptionAr: string;
  descriptionFr: string;
}

export const SEYES_SPACING_OPTIONS: SeyesSpacingOption[] = [
  {
    id: "FR_STANDARD_8MM",
    labelAr: "قياسي فرنسي (8mm / فرعي 2mm — للفرنسية والرموز)",
    labelFr: "Seyès Standard Français (8mm / interligne 2mm)",
    shortBadgeAr: "8mm / 2mm (فرنسي قياسي)",
    majorStepMm: 8,
    subStepMm: 2,
    subdivisions: 4,
    tileSizePx: 32,
    lineHeightPx: 32,
    descriptionAr:
      "المسطرة الفرنسية الرسمية (Grands Carreaux 8×8mm) مع 3 خطوط فرعية زرقاء دقيقة كل 2mm، مثالية للكتابة اللاتينية والرموز الجبرية.",
    descriptionFr:
      "Réglure Seyès officielle 8×8mm avec 3 interlignes azur tous les 2mm.",
  },
  {
    id: "BILINGUAL_10MM",
    labelAr: "مزدوج عربي/فرنسي متوازن (10mm / فرعي 2.5mm)",
    labelFr: "Seyès Bilingue Arabe/Français (10mm / interligne 2.5mm)",
    shortBadgeAr: "10mm / 2.5mm (مزدوج ع/ف)",
    majorStepMm: 10,
    subStepMm: 2.5,
    subdivisions: 4,
    tileSizePx: 40,
    lineHeightPx: 40,
    descriptionAr:
      "تباعد متوازن يمنح الحروف العربية (الألف، اللام، النقط، والشكل) والرموز الرياضية المزدوجة مساحة رأسية مريحة دون تداخل.",
    descriptionFr:
      "Espacement calibré de 10mm (interligne 2.5mm) adapté à l'écriture bilingue arabe et française.",
  },
  {
    id: "ARABIC_COMFORT_12MM",
    labelAr: "عربي متسع للتحرير والكسور (12mm / فرعي 3mm)",
    labelFr: "Seyès Large Arabe & Fractions (12mm / interligne 3mm)",
    shortBadgeAr: "12mm / 3mm (عربي متسع)",
    majorStepMm: 12,
    subStepMm: 3,
    subdivisions: 4,
    tileSizePx: 48,
    lineHeightPx: 48,
    descriptionAr:
      "مسطرة سيري موسعة (12mm) تناسب الخط العربي الواضح وكتابة الكسور المركبة والنهايات والتكاملات بارتياح تام.",
    descriptionFr:
      "Grands carreaux élargis 12mm (interligne 3mm) pour l'écriture arabe et les grandes formules.",
  },
  {
    id: "COMPACT_EXAM_6_4MM",
    labelAr: "مدمج للامتحانات المكثفة (6.4mm / فرعي 1.6mm)",
    labelFr: "Seyès Compact Examen (6.4mm / interligne 1.6mm)",
    shortBadgeAr: "6.4mm / 1.6mm (مدمج)",
    majorStepMm: 6.4,
    subStepMm: 1.6,
    subdivisions: 4,
    tileSizePx: 24,
    lineHeightPx: 24,
    descriptionAr:
      "مسطرة سيري دقيقة ومدمجة لاقتصاد المساحة الورقية في الفروض المحروسة الطويلة مع الحفاظ على التدرج الرباعي.",
    descriptionFr:
      "Réglure Seyès condensée 6.4mm pour optimiser l'espace sur les sujets denses.",
  },
];

/**
 * توليد خلفية مسطرة السيري الفرنسية (Seyès) بدقة متجهة عالية جداً (Vector SVG Data URI)
 * تضمن وضوح الخطوط الرئيسية البنفسجية والخطوط الفرعية السماوية الثلاثة في الشاشة وعند الطباعة 300/600 DPI
 */
export function buildHighPrecisionSeyesCssStyle(
  spacingPreset: SeyesSpacingPreset = "BILINGUAL_10MM",
  isHighDefinitionPro: boolean = true
): {
  style: React.CSSProperties;
  option: SeyesSpacingOption;
} {
  const option =
    SEYES_SPACING_OPTIONS.find((o) => o.id === spacingPreset) ||
    SEYES_SPACING_OPTIONS[0];

  const S = option.tileSizePx;
  const sub1 = Number((S * 0.25).toFixed(2));
  const sub2 = Number((S * 0.5).toFixed(2));
  const sub3 = Number((S * 0.75).toFixed(2));

  // ألوان مسطرة السيري الفرنسية الأصيلة (Clairefontaine / Calligraphe Seyès)
  const majorColor = isHighDefinitionPro ? "%236d28d9" : "%237c3aed"; // بنفسجي أكاديمي واضح للخط الرئيسي والعمودي
  const majorOpacity = isHighDefinitionPro ? "0.42" : "0.30";
  const vertOpacity = isHighDefinitionPro ? "0.34" : "0.24";
  const subColor = isHighDefinitionPro ? "%230284c7" : "%2338bdf8"; // أزرق سماوي للخطوط الفرعية الثلاثة
  const subOpacity = isHighDefinitionPro ? "0.32" : "0.22";

  const svgMarkup = `<svg xmlns='http://www.w3.org/2000/svg' width='${S}' height='${S}' viewBox='0 0 ${S} ${S}' shape-rendering='crispEdges'><line x1='0' y1='${sub1}' x2='${S}' y2='${sub1}' stroke='${subColor}' stroke-opacity='${subOpacity}' stroke-width='0.75'/><line x1='0' y1='${sub2}' x2='${S}' y2='${sub2}' stroke='${subColor}' stroke-opacity='${subOpacity}' stroke-width='0.75'/><line x1='0' y1='${sub3}' x2='${S}' y2='${sub3}' stroke='${subColor}' stroke-opacity='${subOpacity}' stroke-width='0.75'/><line x1='0' y1='${S}' x2='${S}' y2='${S}' stroke='${majorColor}' stroke-opacity='${majorOpacity}' stroke-width='1.15'/><line x1='${S}' y1='0' x2='${S}' y2='${S}' stroke='${majorColor}' stroke-opacity='${vertOpacity}' stroke-width='1.0'/></svg>`;

  return {
    option,
    style: {
      backgroundImage: `url("data:image/svg+xml;utf8,${svgMarkup}")`,
      backgroundSize: `${S}px ${S}px`,
      backgroundPosition: "top right",
      backgroundColor: isHighDefinitionPro ? "#fdfdff" : "#fcfcff",
    },
  };
}

/**
 * توليد كود TikZ في LaTeX لمسطرة Seyès الفرنسية بالتباعد المختار
 */
export function buildLatexSeyesTikzSnippet(
  heightCm: string,
  spacingPreset: SeyesSpacingPreset = "BILINGUAL_10MM"
): string {
  const opt =
    SEYES_SPACING_OPTIONS.find((o) => o.id === spacingPreset) ||
    SEYES_SPACING_OPTIONS[0];
  return `% --- مسطرة السيري الفرنسية عالية الدقة (Seyès ${opt.majorStepMm}mm / فرعي ${opt.subStepMm}mm) ---
\\begin{center}
\\begin{tikzpicture}[x=1cm, y=1cm]
  \\draw[step=${opt.subStepMm}mm, cyan!30!white, very thin] (0,0) grid (\\linewidth-0.4cm, ${heightCm});
  \\draw[step=${opt.majorStepMm}mm, violet!55!blue, thin] (0,0) grid (\\linewidth-0.4cm, ${heightCm});
  \\draw[red!75!black, thick] (1.6cm, 0) -- (1.6cm, ${heightCm});
\\end{tikzpicture}
\\end{center}`;
}

export type LatexImportMergeMode =
  | "SMART_MERGE_BODY"   // استخلاص محتوى \begin{document}...\end{document} ودمجه داخل الوثيقة الحالية
  | "APPEND_TO_END"      // إلحاق المحتوى قبل نهاية الوثيقة
  | "REPLACE_ENTIRE_CODE"; // استبدال الكود المصدري بالكامل بالملف المستورد

export interface ProcessedLatexImportResult {
  fileName: string;
  detectedEncoding: string;
  normalizedCode: string;
  extractedBodyOnly: string;
  extractedPreamblePackages: string[];
  normalizedSymbolsCount: number;
  repairedEncodingCount: number;
  extractedExercises: Array<{
    title: string;
    content: string;
  }>;
  summaryAr: string;
}

/**
 * فك ترميز ملف .tex خارجي تلقائياً (UTF-8 / UTF-16 / Windows-1256 العربي / Windows-1252 الفرنسي)
 */
export function decodeTexArrayBufferWithAutoEncoding(buffer: ArrayBuffer): {
  text: string;
  detectedEncoding: string;
  repairedEncodingCount: number;
} {
  const bytes = new Uint8Array(buffer);

  // 1. فحص علامة ترتيب البايتات BOM
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    const decoder = new TextDecoder("utf-8");
    return {
      text: decoder.decode(bytes.subarray(3)),
      detectedEncoding: "UTF-8 (with BOM)",
      repairedEncodingCount: 1,
    };
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    const decoder = new TextDecoder("utf-16le");
    return {
      text: decoder.decode(bytes.subarray(2)),
      detectedEncoding: "UTF-16LE → UTF-8",
      repairedEncodingCount: 1,
    };
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    const decoder = new TextDecoder("utf-16be");
    return {
      text: decoder.decode(bytes.subarray(2)),
      detectedEncoding: "UTF-16BE → UTF-8",
      repairedEncodingCount: 1,
    };
  }

  // 2. محاولة القراءة الصارمة بترميز UTF-8 القياسي
  try {
    const strictUtf8 = new TextDecoder("utf-8", { fatal: true });
    const decoded = strictUtf8.decode(bytes);
    return {
      text: decoded,
      detectedEncoding: "UTF-8 القياسي",
      repairedEncodingCount: 0,
    };
  } catch {
    // في حال فشل UTF-8، نفحص هل الملف يحتوي على أوامر عربية أو حروف Windows-1256 أم فرنسية Windows-1252
    const asciiPreview = new TextDecoder("iso-8859-1").decode(bytes);
    const looksArabicLegacy =
      /cp1256|windows-1256|arabtex|polyglossia|arabic/i.test(asciiPreview);

    const fallbackEncoding = looksArabicLegacy ? "windows-1256" : "windows-1252";
    try {
      const legacyDecoder = new TextDecoder(fallbackEncoding);
      return {
        text: legacyDecoder.decode(bytes),
        detectedEncoding: `${fallbackEncoding.toUpperCase()} → تم تحويله تلقائياً إلى UTF-8`,
        repairedEncodingCount: 1,
      };
    } catch {
      const permissiveUtf8 = new TextDecoder("utf-8");
      return {
        text: permissiveUtf8.decode(bytes),
        detectedEncoding: "UTF-8 (تم إصلاح المحارف التالفة)",
        repairedEncodingCount: 1,
      };
    }
  }
}

/**
 * معالجة وتطبيع الرموز الرياضية والترميز في ملف LaTeX مستورد (.tex)
 */
export function processImportedLatexFile(
  fileName: string,
  buffer: ArrayBuffer | string
): ProcessedLatexImportResult {
  const { text: rawText, detectedEncoding, repairedEncodingCount } =
    typeof buffer === "string"
      ? {
          text: buffer,
          detectedEncoding: "UTF-8 (نص مباشر)",
          repairedEncodingCount: 0,
        }
      : decodeTexArrayBufferWithAutoEncoding(buffer);

  let normalizedSymbolsCount = 0;
  let code = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 1. إزالة المحارف الخفية غير المرئية وعلامات الاتجاه المعطوبة
  const invisibleRegex = /[\u200B-\u200D\uFEFF]/g;
  const invMatches = code.match(invisibleRegex);
  if (invMatches) {
    normalizedSymbolsCount += invMatches.length;
    code = code.replace(invisibleRegex, "");
  }

  // 2. ترقية أوامر الترميز القديمة (latin1, cp1256, applemac, ansinew) إلى utf8
  const legacyInputEncRegex =
    /\\usepackage\s*\[\s*(latin1|cp1256|windows-1256|applemac|ansinew|iso-8859-1)\s*\]\s*\{\s*inputenc\s*\}/gi;
  if (legacyInputEncRegex.test(code)) {
    normalizedSymbolsCount += 1;
    code = code.replace(
      legacyInputEncRegex,
      "\\usepackage[utf8]{inputenc} % [تمت معالجة الترميز تلقائياً إلى UTF-8]"
    );
  }

  // 3. جدول تطبيع الرموز الرياضية اليونيكود المباشرة إلى أوامر LaTeX قياسية
  const symbolReplacements: Array<[RegExp, string]> = [
    [/ℝ/g, "\\mathbb{R}"],
    [/ℂ/g, "\\mathbb{C}"],
    [/ℕ/g, "\\mathbb{N}"],
    [/ℤ/g, "\\mathbb{Z}"],
    [/ℚ/g, "\\mathbb{Q}"],
    [/≤/g, "\\leq "],
    [/≥/g, "\\geq "],
    [/≠/g, "\\neq "],
    [/≈/g, "\\approx "],
    [/≡/g, "\\equiv "],
    [/⇔/g, "\\iff "],
    [/⇒/g, "\\implies "],
    [/→/g, "\\to "],
    [/↦/g, "\\mapsto "],
    [/∀/g, "\\forall "],
    [/∃/g, "\\exists "],
    [/∈/g, "\\in "],
    [/∉/g, "\\notin "],
    [/⊂/g, "\\subset "],
    [/⊆/g, "\\subseteq "],
    [/∪/g, "\\cup "],
    [/∩/g, "\\cap "],
    [/∅/g, "\\emptyset "],
    [/∞/g, "\\infty "],
    [/±/g, "\\pm "],
    [/×/g, "\\times "],
    [/÷/g, "\\div "],
    [/√/g, "\\sqrt"],
    [/∑/g, "\\sum "],
    [/∏/g, "\\prod "],
    [/∫/g, "\\int "],
    [/⊥/g, "\\perp "],
    [/∥/g, "\\parallel "],
    [/π/g, "\\pi "],
    [/α/g, "\\alpha "],
    [/β/g, "\\beta "],
    [/γ/g, "\\gamma "],
    [/θ/g, "\\theta "],
    [/λ/g, "\\lambda "],
    [/Δ/g, "\\Delta "],
    [/Ω/g, "\\Omega "],
  ];

  symbolReplacements.forEach(([regex, latexCmd]) => {
    const matches = code.match(regex);
    if (matches && matches.length > 0) {
      normalizedSymbolsCount += matches.length;
      code = code.replace(regex, latexCmd);
    }
  });

  // 4. توحيد محددات المعادلات المزدوجة القديمة $$ ... $$ إلى \[ ... \] القياسية في LaTeX الحديث
  code = code.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner) => {
    normalizedSymbolsCount += 1;
    return `\\[${inner}\\]`;
  });

  // 5. استخراج الحزم المعلنة في الترويسة (Preamble) واستخراج جسم الوثيقة بين \begin{document} و \end{document}
  const extractedPreamblePackages: string[] = [];
  const pkgRegex = /\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}/g;
  let pkgMatch: RegExpExecArray | null;
  while ((pkgMatch = pkgRegex.exec(code)) !== null) {
    extractedPreamblePackages.push(pkgMatch[0]);
  }

  let extractedBodyOnly = code.trim();
  const docStartIdx = code.indexOf("\\begin{document}");
  const docEndIdx = code.lastIndexOf("\\end{document}");
  if (docStartIdx !== -1) {
    const startOffset = docStartIdx + "\\begin{document}".length;
    extractedBodyOnly =
      docEndIdx !== -1 && docEndIdx > startOffset
        ? code.slice(startOffset, docEndIdx).trim()
        : code.slice(startOffset).trim();
  }

  // 6. استخراج التمارين من كود LaTeX المستورد لإمكانية إدراجها في الوثيقة التفاعلية
  const extractedExercises: Array<{ title: string; content: string }> = [];
  const exoBlockRegex =
    /\\begin\{(exercice|exoBox|exercise|problem)\}(?:\{([^}]*)\})?([\s\S]*?)\\end\{\1\}/gi;
  let exoMatch: RegExpExecArray | null;
  while ((exoMatch = exoBlockRegex.exec(extractedBodyOnly)) !== null) {
    extractedExercises.push({
      title:
        exoMatch[2]?.trim() ||
        `تمرين مستورد من ${fileName} (#${extractedExercises.length + 1})`,
      content: exoMatch[3].trim(),
    });
  }

  if (extractedExercises.length === 0) {
    // البحث عن عناوين التمارين بصيغة \section*{Exercice...} أو \textbf{Exercice...}
    const secSplits = extractedBodyOnly.split(
      /(?=\\(?:section|subsection)\*?\{[^}]*(?:Exercice|التمرين|Problème|المسألة)[^}]*\})/i
    );
    if (secSplits.length > 1) {
      secSplits.forEach((chunk, idx) => {
        const trimmed = chunk.trim();
        if (!trimmed) return;
        const titleMatch = trimmed.match(
          /\\(?:section|subsection)\*?\{([^}]+)\}/i
        );
        extractedExercises.push({
          title: titleMatch ? titleMatch[1] : `مقطع مستورد #${idx + 1}`,
          content: trimmed,
        });
      });
    }
  }

  const summaryAr = `تم استيراد «${fileName}» (${detectedEncoding}) · عُولج ${normalizedSymbolsCount} رمزاً رياضياً · استُخلص ${
    extractedExercises.length > 0
      ? `${extractedExercises.length} تمارين/مقاطع مهيكلة`
      : "محتوى الوثيقة بنجاح"
  }.`;

  return {
    fileName,
    detectedEncoding,
    normalizedCode: code,
    extractedBodyOnly,
    extractedPreamblePackages,
    normalizedSymbolsCount,
    repairedEncodingCount,
    extractedExercises,
    summaryAr,
  };
}

/**
 * دمج كود LaTeX المستورد والمعالج مباشرة داخل الكود المصدري الحالي للمحرر
 */
export function mergeImportedLatexIntoSource(
  currentSource: string,
  imported: ProcessedLatexImportResult,
  mergeMode: LatexImportMergeMode
): string {
  if (mergeMode === "REPLACE_ENTIRE_CODE" || !currentSource.trim()) {
    return imported.normalizedCode;
  }

  const annotatedBlock = `\n\n% =========================================================================\n% [ملف LaTeX خارجي مستورد ومدمج: ${imported.fileName}]\n% [الترميز المعالج: ${imported.detectedEncoding} | الرموز المطبعة: ${imported.normalizedSymbolsCount}]\n% =========================================================================\n${imported.extractedBodyOnly}\n% =========================================================================\n`;

  if (mergeMode === "SMART_MERGE_BODY") {
    const endDocIdx = currentSource.lastIndexOf("\\end{document}");
    if (endDocIdx !== -1) {
      // دمج أي حزم غير موجودة في الترويسة كملاحظات مرجعية أو حزم إضافية
      return (
        currentSource.slice(0, endDocIdx).trimEnd() +
        annotatedBlock +
        "\n\\end{document}\n"
      );
    }
  }

  return `${currentSource.trimEnd()}${annotatedBlock}`;
}

/**
 * تحويل التمارين المستخلصة من ملف .tex خارجي إلى عناصر دروس/تمارين قابلة للمعاينة في الورقة التفاعلية
 */
export function convertExtractedLatexToLessonItem(
  imported: ProcessedLatexImportResult,
  baseLesson?: LessonItem
): LessonItem {
  const rawBody = imported.extractedBodyOnly;

  // تنظيف أوامر التشكيل الهيكلي مع الحفاظ على الصيغ الرياضية $...$
  const cleanLines = rawBody
    .replace(/\\begin\{(itemize|enumerate|exercice|exoBox|center|frame)\}(\{[^}]*\})?/g, "\n")
    .replace(/\\end\{(itemize|enumerate|exercice|exoBox|center|frame)\}/g, "\n")
    .replace(/\\item\b/g, "• ")
    .replace(/\\textbf\{([^}]*)\}/g, "$1")
    .replace(/\\textit\{([^}]*)\}/g, "$1")
    .replace(/\\(?:section|subsection)\*?\{([^}]*)\}/g, "■ $1 :")
    .replace(/\\(?:vspace|hspace)\*?\{[^}]*\}/g, "")
    .replace(/\\(?:noindent|bigskip|medskip|smallskip|newpage|clearpage|pause)\b/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2 && !l.startsWith("%"));

  const questionsSlice =
    cleanLines.length > 0
      ? cleanLines.slice(0, 8)
      : [
          `1) أدرس الوضع النسبي وحل المعادلة الواردة في ملف LaTeX المستورد (${imported.fileName}).`,
        ];

  return {
    ...(baseLesson || {
      lessonAr: `تمرين مستورد من LaTeX (${imported.fileName.replace(/\.tex$/i, "")})`,
      lessonFr: `Exercice importé LaTeX (${imported.fileName.replace(/\.tex$/i, "")})`,
      hours: "4h",
      weight: 25,
      capacitiesAr: [
        "استثمار التمارين والصيغ الرياضية المستوردة من ملفات LaTeX الخارجية (.tex)",
      ],
      capacitiesFr: [
        "Exploiter les exercices et formules importés depuis un fichier LaTeX (.tex)",
      ],
    }),
    lessonAr: `وثيقة LaTeX مدمجة: ${imported.fileName.replace(/\.tex$/i, "")}`,
    lessonFr: `Source LaTeX intégrée : ${imported.fileName.replace(/\.tex$/i, "")}`,
    sampleExerciseAr: questionsSlice,
    sampleExerciseFr: questionsSlice,
  };
}

export interface PlatformTexNormalizationOptions {
  targetTheme: "TCOLORBOX_ROYAL" | "MOROCCAN_142_08" | "FRENCH_BAC";
  subQuestionStyle: "ARABIC_ABJAD" | "LATIN_ABC" | "KEEP_ORIGINAL";
  autoInjectPlatformPreamble: boolean;
  normalizeBaremePoints: boolean;
  schoolName?: string;
  professorName?: string;
  trackLabelAr?: string;
  academicYear?: string;
}

export interface PlatformNormalizedTexBundle {
  processed: ProcessedLatexImportResult;
  platformFormattedTex: string;
  extractedLessonItems: LessonItem[];
  detectedSubQuestionsCount: number;
  detectedBaremePointsTotal: number;
  diagnosticsAr: string[];
}

/**
 * تحويل وتنسيق ملف .tex خارجي مستورد من جهاز المستخدم ليتوافق كلياً مع نظام LaTeX الخاص بالمنصة
 * (الترويسة الرسمية + صناديق tcolorbox/exoBox + تجزئة الأسئلة الفرعية أ/ب/ج + استخراج LessonItem[] للمعاينة الحية A4)
 */
export function normalizeExternalTexToPlatformSystem(
  fileName: string,
  rawTextOrProcessed: string | ProcessedLatexImportResult,
  options: PlatformTexNormalizationOptions
): PlatformNormalizedTexBundle {
  const processed: ProcessedLatexImportResult =
    typeof rawTextOrProcessed === "string"
      ? processImportedLatexFile(fileName, rawTextOrProcessed)
      : rawTextOrProcessed;

  const diagnosticsAr: string[] = [];
  let body = processed.extractedBodyOnly || processed.normalizedCode;

  // 1. توحيد بيئات التمارين المختلفة إلى بيئة exoBox القياسية في المنصة
  let convertedEnvsCount = 0;
  body = body.replace(
    /\\begin\{(exercise|exercice|problem|probleme|question|thbox)\}(?:\[([^\]]*)\])?(?:\{([^}]*)\})?([\s\S]*?)\\end\{\1\}/gi,
    (_m, _env, optTitle, argTitle, inner) => {
      convertedEnvsCount++;
      const title =
        (argTitle || optTitle || "").trim() ||
        `التمرين ${convertedEnvsCount} (مستورد من ${fileName.replace(/\.tex$/i, "")})`;
      return `\\begin{exoBox}{${title}}\n${inner.trim()}\n\\end{exoBox}`;
    }
  );
  if (convertedEnvsCount > 0) {
    diagnosticsAr.push(
      `تم تحويل ${convertedEnvsCount} بيئة تمرين خارجية إلى صناديق exoBox/tcolorbox المعتمدة في المنصة.`
    );
  }

  // 2. تنسيق الأسئلة الفرعية (أ، ب، ج / a, b, c) داخل بيئات enumerate/itemize أو السطور المرقمة
  const arabicLetters = ["أ", "ب", "ج", "د", "هـ", "و"];
  const latinLetters = ["a", "b", "c", "d", "e", "f"];
  let detectedSubQuestionsCount = 0;

  body = body.replace(
    /\\item\s*\[\s*([a-fA-Fأبجدهو])\s*[\)\.\-]?\s*\]/g,
    (_m, rawLetter: string) => {
      detectedSubQuestionsCount++;
      if (options.subQuestionStyle === "KEEP_ORIGINAL") {
        return `\\item[\\textbf{${rawLetter})}]`;
      }
      const lower = rawLetter.toLowerCase();
      const latinIdx = latinLetters.indexOf(lower);
      const arabIdx = arabicLetters.indexOf(rawLetter);
      const idx = latinIdx !== -1 ? latinIdx : arabIdx !== -1 ? arabIdx : 0;
      const mapped =
        options.subQuestionStyle === "ARABIC_ABJAD"
          ? arabicLetters[idx % arabicLetters.length]
          : latinLetters[idx % latinLetters.length];
      return `\\item[\\textbf{${mapped})}]`;
    }
  );

  // تحويل السطور التي تبدأ بـ a) أو ب) خارج \item إلى صيغة مهيكلة
  body = body.replace(
    /(^|\n)\s*([a-d]|أ|ب|ج|د)\)\s+(?=[A-Za-z\u0600-\u06FF\\\$])/g,
    (_m, prefix, rawLetter) => {
      detectedSubQuestionsCount++;
      const idx =
        latinLetters.indexOf(rawLetter) !== -1
          ? latinLetters.indexOf(rawLetter)
          : arabicLetters.indexOf(rawLetter) !== -1
            ? arabicLetters.indexOf(rawLetter)
            : 0;
      const mapped =
        options.subQuestionStyle === "ARABIC_ABJAD"
          ? arabicLetters[idx]
          : options.subQuestionStyle === "LATIN_ABC"
            ? latinLetters[idx]
            : rawLetter;
      return `${prefix}\\noindent\\textbf{${mapped})} `;
    }
  );

  if (detectedSubQuestionsCount > 0) {
    diagnosticsAr.push(
      `تم رصد وتنسيق ${detectedSubQuestionsCount} سؤالاً فرعياً وفق النمط البيداغوجي (${
        options.subQuestionStyle === "ARABIC_ABJAD"
          ? "أ، ب، ج"
          : options.subQuestionStyle === "LATIN_ABC"
            ? "a, b, c"
            : "الأصلي"
      }).`
    );
  }

  // 3. رصد وتوحيد سلم التنقيط (Barème) مثل (1.5 pt) أو (0.75 ن)
  let detectedBaremePointsTotal = 0;
  body = body.replace(
    /\(\s*(\d+(?:[\.,]\d+)?)\s*(?:pts?|points?|نقطة|نقط|ن)\s*\)/gi,
    (match, numStr) => {
      const val = parseFloat(String(numStr).replace(",", "."));
      if (!isNaN(val) && val > 0 && val <= 20) {
        detectedBaremePointsTotal += val;
      }
      if (!options.normalizeBaremePoints) return match;
      return `\\hfill{\\small\\textbf{(${String(numStr).replace(",", ".")} ن)}}`;
    }
  );

  // 4. استخراج قائمة التمارين وتحويلها إلى LessonItem[] للمعاينة الحية في الورقة A4
  const extractedLessonItems = convertExtractedLatexToMultiLessonItems(
    processed,
    body
  );

  if (detectedBaremePointsTotal === 0) {
    detectedBaremePointsTotal = 20;
  } else {
    detectedBaremePointsTotal = Math.round(detectedBaremePointsTotal * 100) / 100;
  }

  // 5. بناء الكود الكامل المتوافق مع نظام LaTeX بالمنصة
  const school = options.schoolName || "الثانوية التأهيلية";
  const prof = options.professorName || "أستاذ المادة";
  const track = options.trackLabelAr || "التعليم الثانوي التأهيلي";
  const year = options.academicYear || "2025/2026";
  const frameColor =
    options.targetTheme === "TCOLORBOX_ROYAL"
      ? "1E3A8A"
      : options.targetTheme === "MOROCCAN_142_08"
        ? "0F766E"
        : "334155";

  let platformFormattedTex = processed.normalizedCode;
  if (options.autoInjectPlatformPreamble) {
    platformFormattedTex = `% ============================================================================
% [منصة الهندسة البيداغوجية - وثيقة LaTeX مستوردة ومنسقة تلقائياً]
% الملف الأصلي: ${fileName} | الترميز المكتشف: ${processed.detectedEncoding}
% عدد التمارين المستخلصة: ${extractedLessonItems.length} | الأسئلة الفرعية: ${detectedSubQuestionsCount}
% ============================================================================
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb,amsfonts,amsthm,mathtools}
\\usepackage{tikz,pgfplots,tkz-tab}
\\pgfplotsset{compat=1.18}
\\usepackage[most]{tcolorbox}
\\usepackage[margin=1.5cm]{geometry}
\\usepackage{enumitem}
\\usepackage{fancyhdr}

\\definecolor{platformPrimary}{HTML}{${frameColor}}
\\definecolor{platformBg}{HTML}{F8FAFC}

\\newtcolorbox{exoBox}[2][]{
  enhanced,
  breakable,
  colback=platformBg,
  colframe=platformPrimary,
  fonttitle=\\bfseries,
  title={#2},
  arc=2mm,
  boxrule=0.8pt,
  #1
}

\\pagestyle{fancy}
\\fancyhf{}
\\lhead{\\small ${school} — ${prof}}
\\rhead{\\small ${track} (${year})}
\\cfoot{\\thepage}

\\begin{document}

${body.trim()}

\\end{document}
`;
  }

  diagnosticsAr.push(
    `استُخلصت ${extractedLessonItems.length} تمارين كاملة جاهزة للعرض الفوري في المعاينة التفاعلية A4.`
  );

  return {
    processed,
    platformFormattedTex,
    extractedLessonItems,
    detectedSubQuestionsCount,
    detectedBaremePointsTotal,
    diagnosticsAr,
  };
}

/**
 * تحويل محتوى ملف .tex المستورد إلى مصفوفة دروس/تمارين متعددة (LessonItem[])
 * بحيث يظهر كل تمرين من ملف الـ .tex في صندوق مستقل داخل ورقة المعاينة الحية A4
 */
export function convertExtractedLatexToMultiLessonItems(
  imported: ProcessedLatexImportResult,
  normalizedBodyOverride?: string
): LessonItem[] {
  const sourceBlocks =
    imported.extractedExercises.length > 0
      ? imported.extractedExercises
      : [
          {
            title: `تمرين مستورد (${imported.fileName.replace(/\.tex$/i, "")})`,
            content: normalizedBodyOverride || imported.extractedBodyOnly,
          },
        ];

  const equalWeight = Math.max(
    10,
    Math.round(100 / Math.max(1, sourceBlocks.length))
  );

  return sourceBlocks.map((block, idx) => {
    const cleanedQuestions = block.content
      .replace(
        /\\begin\{(itemize|enumerate|exercice|exoBox|exercise|problem|center|frame)\}(\[[^\]]*\])?(\{[^}]*\})?/gi,
        "\n"
      )
      .replace(
        /\\end\{(itemize|enumerate|exercice|exoBox|exercise|problem|center|frame)\}/gi,
        "\n"
      )
      .replace(/\\item\s*\[([^\]]+)\]/g, "$1 ")
      .replace(/\\item\b/g, `${idx + 1}. `)
      .replace(/\\textbf\{([^}]*)\}/g, "$1")
      .replace(/\\textit\{([^}]*)\}/g, "$1")
      .replace(/\\hfill\{\\small\\textbf\{([^}]*)\}\}/g, " $1")
      .replace(/\\(?:section|subsection)\*?\{([^}]*)\}/g, "")
      .replace(/\\(?:vspace|hspace)\*?\{[^}]*\}/g, "")
      .replace(
        /\\(?:noindent|bigskip|medskip|smallskip|newpage|clearpage|pause)\b/g,
        ""
      )
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 2 && !line.startsWith("%"));

    const finalQuestions =
      cleanedQuestions.length > 0
        ? cleanedQuestions.slice(0, 10)
        : [
            `1) حلل المعطيات الرياضية وأجب عن أسئلة ${block.title} (${imported.fileName}).`,
          ];

    return {
      lessonAr: block.title || `التمرين المستورد ${idx + 1}`,
      lessonFr: block.title || `Exercice importé ${idx + 1}`,
      hours: "4h",
      weight: equalWeight,
      capacitiesAr: [
        `تمرين مستورد ومنسق من ملف LaTeX (${imported.fileName})`,
        "توظيف المكتسبات الرياضية وحل الأسئلة الفرعية المتدرجة",
      ],
      capacitiesFr: [
        `Exercice importé et normalisé depuis LaTeX (${imported.fileName})`,
        "Mobiliser les acquis mathématiques et résoudre les sous-questions",
      ],
      sampleExerciseAr: finalQuestions,
      sampleExerciseFr: finalQuestions,
    };
  });
}

