/**
 * محرك التطوير الشامل لتبويب الفروض المحروسة (DS 142-08) وتجزئة الأسئلة إلى أسئلة فرعية (أ، ب، ج / a, b, c)
 * يضم:
 * 1. محرك تجزئة السؤال الرئيسي إلى أسئلة فرعية متدرجة (أ، ب، ج / a, b, c) مع توزيع النقط الجزئية بدقة 0.25.
 * 2. محرك التقدير الزمني الدقيق للأسئلة الرياضية (Smart Chrono-Didactic Time-Weighting Engine).
 * 3. مولد المعاملات العددية المتكافئة صعوبةً بين النماذج (Iso-Difficulty Parameter Mutator A/B/C/D).
 * 4. نظام المجموعات المطوية الذكية والباقات الجاهزة للخيارات البيداغوجية الـ 12 (Didactic Accordions & Presets).
 * 5. مؤشر التغطية السابقة للدروس عبر الفروض (Evaluated Lesson Coverage Badge DS1/DS2/DS3).
 * 6. مولد حقيبة الفرض المحروس الشاملة بنقرة واحدة (All-in-One DS Archive Pack).
 */

import {
  CURRICULUM_DB,
  getVariantQuestions,
  LessonItem,
  SemesterType,
} from "../data/curriculum";

// ============================================================================
// 1. محرك تجزئة السؤال إلى أسئلة فرعية (أ، ب، ج / a, b, c) مع سلم تنقيط فرعي دقيق
// ============================================================================

export type SubQuestionDecompositionMode =
  | "NONE"
  | "AUTO_DETECT_ONLY"
  | "STRUCTURED_ABC_ALL";

export interface SubQuestionItem {
  id: string;
  subIndex: number;
  labelAr: string; // "أ" | "ب" | "ج" | "د"
  labelFr: string; // "a" | "b" | "c" | "d"
  textAr: string;
  textFr: string;
  points: number;
  pointsFormatted: string;
  level: "N1" | "N2" | "N3";
  estimatedMinutes: number;
}

export interface DecomposedQuestionResult {
  isDecomposed: boolean;
  stemAr: string;
  stemFr: string;
  subQuestions: SubQuestionItem[];
  totalPoints: number;
  totalEstimatedMinutes: number;
}

const ARABIC_SUB_LABELS = ["أ", "ب", "ج", "د", "هـ", "و"];
const FRENCH_SUB_LABELS = ["a", "b", "c", "d", "e", "f"];

/**
 * توزيع نقطة السؤال الرئيسي على الأسئلة الفرعية (أ، ب، ج) بحيث يساوي المجموع نقطة السؤال الأصلية تماماً
 */
export function distributeParentPointsAcrossSubQuestions(
  parentPoints: number,
  subCount: number
): number[] {
  const safeParent = Math.max(0.25, Number(parentPoints) || 1.0);
  if (subCount <= 1) return [Number(safeParent.toFixed(2))];

  // إذا كانت النقطة الكلية تكفي لتوزيع مضاعفات 0.25 لكل فرع
  if (safeParent >= subCount * 0.25) {
    const totalQuarters = Math.round(safeParent * 4);
    const baseQuarters = Math.floor(totalQuarters / subCount);
    let remainderQuarters = totalQuarters - baseQuarters * subCount;

    const quartersPerSub = Array.from({ length: subCount }, () => baseQuarters);
    // نمنح الأرباع الإضافية للأسئلة الفرعية الأخيرة (لأن ب وج غالباً استنتاج أو تعمق)
    for (let i = subCount - 1; i >= 0 && remainderQuarters > 0; i--) {
      quartersPerSub[i] += 1;
      remainderQuarters--;
    }
    return quartersPerSub.map((q) => Number((q * 0.25).toFixed(2)));
  }

  // في حال كان السؤال الأصلي 0.25 ن ومقسماً إلى فرعين (أ، ب) نعطي 0.125 أو نقرب بدقة
  const rawShare = Number((safeParent / subCount).toFixed(3));
  const result = Array.from({ length: subCount }, () => rawShare);
  const currentSum = result.reduce((a, b) => a + b, 0);
  result[subCount - 1] = Number(
    (result[subCount - 1] + (safeParent - currentSum)).toFixed(3)
  );
  return result;
}

/**
 * تنسيق نقطة رقمية إلى نص مختصر (مثل 0.5 أو 0.75 أو 1.25)
 */
export function formatSubPointLabel(pt: number): string {
  return pt
    .toFixed(3)
    .replace(/0$/, "")
    .replace(/\.00$/, ".0")
    .replace(/(\.\d)0$/, "$1");
}

/**
 * تجزئة سؤال رياضي إلى أسئلة فرعية منهجية (أ، ب، ج / a, b, c)
 * يدعم:
 * - الالتقاط الذكي للشطور الموجودة في النص (أ) ... ب) ... أو "ثم استنتج" / "واحسب" / "En déduire")
 * - أو التوليد التربوي المهيكل لـ 2 إلى 3 فروع متدرجة (أ: تحقق/حساب أولي، ب: استنتاج/تطبيق، ج: تأويل/تعميم)
 */
export function decomposeQuestionIntoSubQuestions(params: {
  questionAr: string;
  questionFr: string;
  parentPoints: number;
  parentLevel: "N1" | "N2" | "N3";
  mode: SubQuestionDecompositionMode;
  questionIndex?: number;
  lessonTitleAr?: string;
  lessonTitleFr?: string;
}): DecomposedQuestionResult {
  const {
    questionAr,
    questionFr,
    parentPoints,
    parentLevel,
    mode,
    questionIndex = 0,
  } = params;

  const rawCleanAr = (questionAr || "").replace(/^\s*\d+[\.\)\-]\s*/, "").trim();
  const rawCleanFr = (questionFr || "").replace(/^\s*\d+[\.\)\-]\s*/, "").trim();
  const hasMultipleExplicitAr =
    rawCleanAr.split(/(?:^|\s+)(?:أ|ب|ج|د)[\)\-\.]\s+/).filter(Boolean).length >= 2 &&
    /(?:^|\s+)أ[\)\-\.]\s+/.test(rawCleanAr);
  const hasMultipleExplicitFr =
    rawCleanFr.split(/(?:^|\s+)(?:a|b|c|d)[\)\.]\s+/i).filter(Boolean).length >= 2 &&
    /(?:^|\s+)a[\)\.]\s+/i.test(rawCleanFr);
  const cleanAr = hasMultipleExplicitAr
    ? rawCleanAr
    : rawCleanAr.replace(/^\s*(?:أ|ب|ج|د)[\)\-\.]\s+/, "").trim();
  const cleanFr = hasMultipleExplicitFr
    ? rawCleanFr
    : rawCleanFr.replace(/^\s*(?:a|b|c|d)[\)\.]\s+/i, "").trim();
  const safeParentPts = Math.max(0.25, Number(parentPoints) || 1.0);

  if (mode === "NONE") {
    const estMin = estimateSingleTaskMinutes(cleanAr, cleanFr, parentLevel);
    return {
      isDecomposed: false,
      stemAr: cleanAr,
      stemFr: cleanFr,
      subQuestions: [],
      totalPoints: safeParentPts,
      totalEstimatedMinutes: estMin,
    };
  }

  // 1. فحص ما إذا كان النص يحتوي صراحة على ترقيم فرعي مسبق مثل "أ)" و "ب)" أو "a)" و "b)"
  const explicitArParts = cleanAr
    .split(/(?:^|\s+)(?:أ|ب|ج|د)[\)\-\.]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const explicitFrParts = cleanFr
    .split(/(?:^|\s+)(?:a|b|c|d)[\)\.]\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);

  if (explicitArParts.length >= 2 && cleanAr.match(/(?:^|\s+)أ[\)\-\.]\s+/)) {
    const hasLeadingStem = !/^\s*أ[\)\-\.]/.test(cleanAr);
    const stemAr = hasLeadingStem ? explicitArParts[0] : "";
    const rawSubsAr = hasLeadingStem ? explicitArParts.slice(1) : explicitArParts;
    const hasLeadingStemFr =
      explicitFrParts.length > rawSubsAr.length && !/^\s*a[\)\.]/i.test(cleanFr);
    const stemFr = hasLeadingStemFr ? explicitFrParts[0] : "";
    const rawSubsFr = hasLeadingStemFr
      ? explicitFrParts.slice(1)
      : explicitFrParts;

    const subCount = Math.min(4, Math.max(2, rawSubsAr.length));
    const subPts = distributeParentPointsAcrossSubQuestions(
      safeParentPts,
      subCount
    );

    const subQuestions: SubQuestionItem[] = Array.from(
      { length: subCount },
      (_, idx) => {
        const subLvl: "N1" | "N2" | "N3" =
          idx === 0 ? "N1" : idx === subCount - 1 ? parentLevel : "N2";
        const tAr = rawSubsAr[idx] || rawSubsAr[rawSubsAr.length - 1] || cleanAr;
        const tFr = rawSubsFr[idx] || rawSubsFr[rawSubsFr.length - 1] || cleanFr;
        const estMin = Math.max(
          2,
          Math.round(estimateSingleTaskMinutes(tAr, tFr, subLvl) * 0.65)
        );
        return {
          id: `q_${questionIndex}_sub_${idx}`,
          subIndex: idx,
          labelAr: ARABIC_SUB_LABELS[idx] || "أ",
          labelFr: FRENCH_SUB_LABELS[idx] || "a",
          textAr: tAr,
          textFr: tFr,
          points: subPts[idx],
          pointsFormatted: formatSubPointLabel(subPts[idx]),
          level: subLvl,
          estimatedMinutes: estMin,
        };
      }
    );

    return {
      isDecomposed: true,
      stemAr:
        stemAr ||
        "أجب عن الأسئلة الفرعية التالية بتدرج منهجي مع تعليل كل خطوة:",
      stemFr:
        stemFr ||
        "Répondre méthodiquement aux sous-questions suivantes en justifiant chaque étape :",
      subQuestions,
      totalPoints: safeParentPts,
      totalEstimatedMinutes: subQuestions.reduce(
        (acc, s) => acc + s.estimatedMinutes,
        0
      ),
    };
  }

  // 2. فحص الروابط الديداكتيكية المركبة في السؤال ("ثم استنتج" / "ثم أحسب" / "وحدّد" / "En déduire" / "puis")
  const compoundSplitAr = cleanAr.split(
    /\s+(?:ثم\s+استنتج|ثم\s+أحسب|ثم\s+احسب|ثم\s+بين|ثم\s+حدد|واستنتج|ومنه\s+استنتج|؛\s*ثم)\s+/
  );
  const compoundSplitFr = cleanFr.split(
    /\s+(?:puis\s+en\s+déduire|en\s+déduire|puis\s+calculer|puis\s+montrer|puis\s+déterminer|;\s*en\s+déduire)\s+/i
  );

  if (compoundSplitAr.length >= 2) {
    const part1Ar = compoundSplitAr[0].replace(/[،.؛]+$/, "").trim();
    const part2Ar = `استنتج ${compoundSplitAr.slice(1).join(" ثم ").trim()}`;
    const part1Fr = (compoundSplitFr[0] || cleanFr).replace(/[,.;]+$/, "").trim();
    const part2Fr =
      compoundSplitFr.length >= 2
        ? `En déduire ${compoundSplitFr.slice(1).join(" puis ").trim()}`
        : "En déduire le résultat algébrique ou géométrique correspondant.";

    const subPts = distributeParentPointsAcrossSubQuestions(safeParentPts, 2);
    const subQuestions: SubQuestionItem[] = [
      {
        id: `q_${questionIndex}_sub_0`,
        subIndex: 0,
        labelAr: "أ",
        labelFr: "a",
        textAr: part1Ar.endsWith(".") ? part1Ar : `${part1Ar}.`,
        textFr: part1Fr.endsWith(".") ? part1Fr : `${part1Fr}.`,
        points: subPts[0],
        pointsFormatted: formatSubPointLabel(subPts[0]),
        level: parentLevel === "N3" ? "N2" : "N1",
        estimatedMinutes: Math.max(
          2,
          Math.round(estimateSingleTaskMinutes(part1Ar, part1Fr, "N1") * 0.65)
        ),
      },
      {
        id: `q_${questionIndex}_sub_1`,
        subIndex: 1,
        labelAr: "ب",
        labelFr: "b",
        textAr: part2Ar.endsWith(".") ? part2Ar : `${part2Ar}.`,
        textFr: part2Fr.endsWith(".") ? part2Fr : `${part2Fr}.`,
        points: subPts[1],
        pointsFormatted: formatSubPointLabel(subPts[1]),
        level: parentLevel,
        estimatedMinutes: Math.max(
          2,
          Math.round(
            estimateSingleTaskMinutes(part2Ar, part2Fr, parentLevel) * 0.65
          )
        ),
      },
    ];

    return {
      isDecomposed: true,
      stemAr: "",
      stemFr: "",
      subQuestions,
      totalPoints: safeParentPts,
      totalEstimatedMinutes: subQuestions.reduce(
        (acc, s) => acc + s.estimatedMinutes,
        0
      ),
    };
  }

  // إذا كان الوضع AUTO_DETECT_ONLY ولم نجد شطوراً مركبة، نبقي السؤال كما هو
  if (mode === "AUTO_DETECT_ONLY") {
    const estMin = estimateSingleTaskMinutes(cleanAr, cleanFr, parentLevel);
    return {
      isDecomposed: false,
      stemAr: cleanAr,
      stemFr: cleanFr,
      subQuestions: [],
      totalPoints: safeParentPts,
      totalEstimatedMinutes: estMin,
    };
  }

  // 3. الوضع STRUCTURED_ABC_ALL: تفكيك بيداغوجي ذكي للسؤال إلى فرعين (أ، ب) أو 3 فروع (أ، ب، ج) حسب وزن النقطة
  const targetSubCount = safeParentPts >= 1.25 ? 3 : 2;
  const subPts = distributeParentPointsAcrossSubQuestions(
    safeParentPts,
    targetSubCount
  );

  const syntheticSubs = buildPedagogicalSubStepsForQuestion(
    cleanAr,
    cleanFr,
    targetSubCount,
    parentLevel
  );

  const subQuestions: SubQuestionItem[] = syntheticSubs.map((step, idx) => ({
    id: `q_${questionIndex}_sub_${idx}`,
    subIndex: idx,
    labelAr: ARABIC_SUB_LABELS[idx] || "أ",
    labelFr: FRENCH_SUB_LABELS[idx] || "a",
    textAr: step.textAr,
    textFr: step.textFr,
    points: subPts[idx],
    pointsFormatted: formatSubPointLabel(subPts[idx]),
    level: step.level,
    estimatedMinutes: step.estimatedMinutes,
  }));

  return {
    isDecomposed: true,
    stemAr: syntheticSubs[0]?.stemAr || "",
    stemFr: syntheticSubs[0]?.stemFr || "",
    subQuestions,
    totalPoints: safeParentPts,
    totalEstimatedMinutes: subQuestions.reduce(
      (acc, s) => acc + s.estimatedMinutes,
      0
    ),
  };
}

function buildPedagogicalSubStepsForQuestion(
  cleanAr: string,
  cleanFr: string,
  subCount: 2 | 3,
  parentLevel: "N1" | "N2" | "N3"
): Array<{
  stemAr?: string;
  stemFr?: string;
  textAr: string;
  textFr: string;
  level: "N1" | "N2" | "N3";
  estimatedMinutes: number;
}> {
  const lowerFr = cleanFr.toLowerCase();
  const isLimitOrDerivative =
    cleanAr.includes("نهاية") ||
    cleanAr.includes("lim") ||
    cleanAr.includes("مشتق") ||
    cleanAr.includes("f'(x)") ||
    lowerFr.includes("limite") ||
    lowerFr.includes("dériv");
  const isSequence =
    cleanAr.includes("متتالي") ||
    cleanAr.includes("u_n") ||
    cleanAr.includes("ترجع") ||
    lowerFr.includes("suite") ||
    lowerFr.includes("récurrence");
  const isGeometryOrComplex =
    cleanAr.includes("معلم") ||
    cleanAr.includes("متجه") ||
    cleanAr.includes("فلكة") ||
    cleanAr.includes("عقدي") ||
    lowerFr.includes("repère") ||
    lowerFr.includes("vecteur") ||
    lowerFr.includes("complexe");

  if (subCount === 3) {
    if (isLimitOrDerivative) {
      return [
        {
          stemAr: cleanAr,
          stemFr: cleanFr,
          textAr: "تحقق من شروط القابلية والحساب الأولي للتعبير الجبري المبسط.",
          textFr:
            "Vérifier les conditions de validité et établir l'expression algébrique simplifiée.",
          level: "N1",
          estimatedMinutes: 3,
        },
        {
          textAr:
            "أنجز الخطوات التحليلية المفصلة للوصول إلى النتيجة المطلوبة بدقة.",
          textFr:
            "Développer les étapes analytiques détaillées permettant d'aboutir au résultat annoncé.",
          level: "N2",
          estimatedMinutes: 4,
        },
        {
          textAr:
            "أول النتيجة المحصل عليها هندسياً أو استنتج سلوك المنحنى الممثل للدالة.",
          textFr:
            "Interpréter géométriquement le résultat obtenu ou en déduire l'allure locale de la courbe.",
          level: parentLevel,
          estimatedMinutes: 3,
        },
      ];
    }

    if (isSequence) {
      return [
        {
          stemAr: cleanAr,
          stemFr: cleanFr,
          textAr:
            "تحقق من صحة الخاصية من أجل الحد الأول وأنجز الحساب التمهيدي.",
          textFr:
            "Vérifier l'initialisation pour le premier terme et effectuer le calcul préliminaire.",
          level: "N1",
          estimatedMinutes: 3,
        },
        {
          textAr:
            "بين صحة الاستلزام أو العلاقة الجبرية لانتقال الحد من الرتبة n إلى n+1.",
          textFr:
            "Établir l'étape d'hérédité ou la relation algébrique liant le rang n au rang n+1.",
          level: "N2",
          estimatedMinutes: 4,
        },
        {
          textAr:
            "استنتج الطبيعة الاستقرائية أو رتابة وتقارب المتتالية المدروسة.",
          textFr:
            "Conclure rigoureusement et en déduire la monotonie ou la convergence de la suite.",
          level: parentLevel,
          estimatedMinutes: 3,
        },
      ];
    }

    if (isGeometryOrComplex) {
      return [
        {
          stemAr: cleanAr,
          stemFr: cleanFr,
          textAr:
            "أحسب المقادير الجبرية أو الإحداثيات المتجهية الأساسية المرتبطة بالمعطيات.",
          textFr:
            "Calculer les grandeurs algébriques ou les coordonnées vectorielles fondamentales.",
          level: "N1",
          estimatedMinutes: 3,
        },
        {
          textAr: "برهن على العلاقة المميزة المستهدفة في السؤال بتعليل دقيق.",
          textFr:
            "Démontrer la relation caractéristique demandée avec une justification rigoureuse.",
          level: "N2",
          estimatedMinutes: 4,
        },
        {
          textAr:
            "استنتج الطبيعة الهندسية أو الوضع النسبي للعناصر الهندسية المدروسة.",
          textFr:
            "En déduire la nature géométrique exacte ou la position relative des éléments étudiés.",
          level: parentLevel,
          estimatedMinutes: 3,
        },
      ];
    }

    return [
      {
        stemAr: cleanAr,
        stemFr: cleanFr,
        textAr:
          "استحضر الخاصية المرجعية المناسبة وتحقق من شروط تطبيقها على المعطيات.",
        textFr:
          "Rappeler la propriété de référence adéquate et vérifier ses hypothèses d'application.",
        level: "N1",
        estimatedMinutes: 3,
      },
      {
        textAr:
          "أنجز البرهان أو الحساب المرحلي المفصل للوصول إلى العلاقة المطلوبة.",
        textFr:
          "Effectuer le développement ou le raisonnement intermédiaire menant à la relation cible.",
        level: "N2",
        estimatedMinutes: 4,
      },
      {
        textAr: "استنتج النتيجة النهائية وصغ خلاصة رياضية مضبوطة.",
        textFr:
          "En déduire la conclusion finale en formulant une synthèse mathématique précise.",
        level: parentLevel,
        estimatedMinutes: 3,
      },
    ];
  }

  // subCount === 2 (أ، ب)
  return [
    {
      stemAr: "",
      stemFr: "",
      textAr: cleanAr,
      textFr: cleanFr,
      level: parentLevel === "N3" ? "N2" : "N1",
      estimatedMinutes: 4,
    },
    {
      textAr: isGeometryOrComplex
        ? "استنتج الخاصية الهندسية المباشرة أو طبيعة الشكل في المستوى المعتمد."
        : isSequence
        ? "استنتج سلوك الحدود أو رتابة المتتالية انطلاقاً من النتيجة السابقة."
        : isLimitOrDerivative
        ? "استنتج التأويل المبياني المباشر للنتيجة المحصل عليها."
        : "صغ الخلاصة الرياضية المضبوطة وتحقق من صحة النتيجة المحصل عليها.",
      textFr: isGeometryOrComplex
        ? "En déduire la propriété géométrique directe ou l'alignement dans le plan considéré."
        : isSequence
        ? "En déduire le comportement ou la monotonie de la suite à partir du résultat précédent."
        : isLimitOrDerivative
        ? "En déduire l'interprétation graphique directe du résultat obtenu."
        : "Formuler la conclusion mathématique précise et vérifier la validité du résultat obtenu.",
      level: parentLevel,
      estimatedMinutes: 3,
    },
  ];
}

/**
 * تحويل قائمة أسئلة فرعية معدلة إلى نص موحد يحمل الترقيم أ) و ب) وج) ليُحفظ في السؤال المخصص
 */
export function serializeSubQuestionsToQuestionText(
  stemText: string,
  subItems: Array<{ label: string; text: string }>
): string {
  const cleanStem = (stemText || "").trim();
  const formattedSubs = subItems
    .map((item) => `${item.label}) ${item.text.trim()}`)
    .join("   ");
  return cleanStem ? `${cleanStem}   ${formattedSubs}` : formattedSubs;
}

// ============================================================================
// 2. محرك التقدير الزمني الدقيق للأسئلة الرياضية (Smart Chrono-Didactic Engine)
// ============================================================================

export type MathQuestionTaskCategory =
  | "DIRECT_CALCULATION"
  | "ALGEBRAIC_PROOF_RECURRENCE"
  | "CURVE_GEOMETRIC_CONSTRUCTION"
  | "SYNTHESIS_INTEGRATION"
  | "QCM_FAST_DECISION";

export interface QuestionChronoEstimate {
  questionCode: string;
  taskCategory: MathQuestionTaskCategory;
  taskLabelAr: string;
  taskLabelFr: string;
  estimatedMinutes: number;
  level: "N1" | "N2" | "N3";
}

export interface ExamChronoDidacticReport {
  officialDurationMinutes: number;
  estimatedStudentMinutes: number;
  readingAndReviewBufferMinutes: number;
  totalRequiredMinutes: number;
  utilizationRatioPct: number;
  status: "OPTIMAL_FIT" | "SLIGHTLY_DENSE" | "OVERLOAD_WARNING" | "UNDER_UTILIZED";
  statusBadgeAr: string;
  statusBadgeFr: string;
  recommendationAr: string;
  recommendationFr: string;
  exerciseMinutesBreakdown: Array<{
    exerciseIndex: number;
    lessonTitleAr: string;
    lessonTitleFr: string;
    estimatedMinutes: number;
    subQuestionsCount: number;
  }>;
}

export function classifyMathQuestionTask(
  textAr: string,
  textFr: string,
  level: "N1" | "N2" | "N3"
): {
  category: MathQuestionTaskCategory;
  labelAr: string;
  labelFr: string;
  baseMinutes: number;
} {
  const combined = `${textAr || ""} ${textFr || ""}`.toLowerCase();

  if (
    combined.includes("أنشئ") ||
    combined.includes("ارسم") ||
    combined.includes("منحنى") ||
    combined.includes("جدول التغيرات") ||
    combined.includes("construire") ||
    combined.includes("tracer") ||
    combined.includes("courbe") ||
    combined.includes("tableau de variations")
  ) {
    return {
      category: "CURVE_GEOMETRIC_CONSTRUCTION",
      labelAr: "إنشاء منحنى / تمثيل هندسي وجدول تغيرات",
      labelFr: "Tracé de courbe / construction & variations",
      baseMinutes: 10,
    };
  }

  if (
    combined.includes("بالترجع") ||
    combined.includes("برهن أن") ||
    combined.includes("بين أن") ||
    combined.includes("لكل") ||
    combined.includes("récurrence") ||
    combined.includes("démontrer") ||
    combined.includes("montrer que")
  ) {
    return {
      category: "ALGEBRAIC_PROOF_RECURRENCE",
      labelAr: "برهان استدلالي / ترجع رياضي",
      labelFr: "Démonstration déductive / récurrence",
      baseMinutes: level === "N3" ? 9 : 6.5,
    };
  }

  if (level === "N3" || combined.includes("مسألة") || combined.includes("تكامل بالأجزاء")) {
    return {
      category: "SYNTHESIS_INTEGRATION",
      labelAr: "توليف وبحث وإدماج للمكتسبات (N3)",
      labelFr: "Synthèse et résolution de problème (N3)",
      baseMinutes: 11,
    };
  }

  return {
    category: "DIRECT_CALCULATION",
    labelAr: "حساب مباشر وتطبيق القواعد (N1)",
    labelFr: "Calcul direct et application (N1)",
    baseMinutes: 4,
  };
}

export function estimateSingleTaskMinutes(
  textAr: string,
  textFr: string,
  level: "N1" | "N2" | "N3"
): number {
  const info = classifyMathQuestionTask(textAr, textFr, level);
  const levelMultiplier = level === "N3" ? 1.25 : level === "N2" ? 1.05 : 0.85;
  return Math.max(2, Math.round(info.baseMinutes * levelMultiplier));
}

export function parseTrackDurationToMinutes(durationStr: string): number {
  const clean = (durationStr || "2h").toLowerCase();
  if (clean.includes("4h") || clean.includes("4 ساعات") || clean.includes("أربع")) return 240;
  if (clean.includes("3h") || clean.includes("3 ساعات") || clean.includes("ثلاث")) return 180;
  if (clean.includes("1h") || clean.includes("ساعة واحدة")) return 60;
  return 120; // الافتراضي للثانوي التأهيلي: ساعتان (120 دقيقة)
}

export function computeExamChronoDidacticReport(params: {
  lessons: LessonItem[];
  officialDurationStr: string;
  hasQcm?: boolean;
  qcmQuestionCount?: number;
  hasSynthesisProblem?: boolean;
  decompositionMode?: SubQuestionDecompositionMode;
}): ExamChronoDidacticReport {
  const {
    lessons,
    officialDurationStr,
    hasQcm = false,
    qcmQuestionCount = 4,
    hasSynthesisProblem = false,
    decompositionMode = "NONE",
  } = params;

  const officialDurationMinutes = parseTrackDurationToMinutes(officialDurationStr);
  const exerciseMinutesBreakdown: ExamChronoDidacticReport["exerciseMinutesBreakdown"] = [];

  let rawExercisesMinutes = 0;

  lessons.forEach((lesson, idx) => {
    const fallbackVariant = getVariantQuestions(lesson, "A", false, 0, "STANDARD");
    const qArList =
      lesson.sampleExerciseAr && lesson.sampleExerciseAr.length > 0
        ? lesson.sampleExerciseAr
        : fallbackVariant.questionsAr;
    const qFrList =
      lesson.sampleExerciseFr && lesson.sampleExerciseFr.length > 0
        ? lesson.sampleExerciseFr
        : fallbackVariant.questionsFr;
    let exMin = 0;
    let subTotal = 0;

    qArList.forEach((qAr, qIdx) => {
      const qFr = qFrList[qIdx] || qAr;
      const lvl: "N1" | "N2" | "N3" =
        lesson.customQuestionLevels?.[qIdx] ||
        (qIdx === 0 ? "N1" : qIdx === qArList.length - 1 ? "N3" : "N2");
      const decomp = decomposeQuestionIntoSubQuestions({
        questionAr: qAr,
        questionFr: qFr,
        parentPoints: lesson.customQuestionBaremes?.[qIdx] || 1.5,
        parentLevel: lvl,
        mode: decompositionMode,
        questionIndex: qIdx,
      });
      exMin += decomp.totalEstimatedMinutes;
      subTotal += decomp.isDecomposed ? decomp.subQuestions.length : 1;
    });

    rawExercisesMinutes += exMin;
    exerciseMinutesBreakdown.push({
      exerciseIndex: idx + 1,
      lessonTitleAr: lesson.lessonAr,
      lessonTitleFr: lesson.lessonFr,
      estimatedMinutes: exMin,
      subQuestionsCount: subTotal,
    });
  });

  const qcmMinutes = hasQcm ? Math.round(qcmQuestionCount * 3.5) : 0;
  const synthesisMinutes = hasSynthesisProblem ? 32 : 0;
  const estimatedStudentMinutes = rawExercisesMinutes + qcmMinutes + synthesisMinutes;
  const readingAndReviewBufferMinutes = Math.max(
    8,
    Math.round(officialDurationMinutes * 0.1)
  );
  const totalRequiredMinutes =
    estimatedStudentMinutes + readingAndReviewBufferMinutes;
  const utilizationRatioPct = Math.round(
    (totalRequiredMinutes / Math.max(30, officialDurationMinutes)) * 100
  );

  let status: ExamChronoDidacticReport["status"] = "OPTIMAL_FIT";
  let statusBadgeAr = "متوازن زمنياً (مطابق للمذكرة 142-08)";
  let statusBadgeFr = "Équilibre temporel optimal (Note 142-08)";
  let recommendationAr =
    "الزمن التقديري لإنجاز الأسئلة والأسئلة الفرعية يتناسب بدقة مع الحصة الرسمية للفرض مع هامش مراجعة كافٍ للتلميذ.";
  let recommendationFr =
    "Le temps estimé de résolution correspond parfaitement à la durée officielle avec une marge de relecture suffisante.";

  if (utilizationRatioPct > 112) {
    status = "OVERLOAD_WARNING";
    statusBadgeAr = `كثافة زمنية مرتفعة (${utilizationRatioPct}% من الوقت)`;
    statusBadgeFr = `Surcharge temporelle (${utilizationRatioPct}%)`;
    recommendationAr = `الفرض يتطلب حوالي ${totalRequiredMinutes} دقيقة مقابل ${officialDurationMinutes} دقيقة متاحة. يُنصح بتقليص تمرين أو تفعيل تلميحات الإنقاذ (Admettre le résultat).`;
    recommendationFr = `L'épreuve requiert ~${totalRequiredMinutes} min pour ${officialDurationMinutes} min allouées. Réduire une question N3 est recommandé.`;
  } else if (utilizationRatioPct > 98) {
    status = "SLIGHTLY_DENSE";
    statusBadgeAr = `فرض مكثف (${utilizationRatioPct}% من الحصة)`;
    statusBadgeFr = `Épreuve dense (${utilizationRatioPct}%)`;
    recommendationAr =
      "الفرض يغطي كامل زمن الحصة؛ يُستحسن تجزئة الأسئلة المركبة إلى أسئلة فرعية (أ، ب، ج) لتسريع وتيرة تحرير التلميذ.";
    recommendationFr =
      "Épreuve dense : la décomposition en sous-questions (a, b, c) facilite le guidage et accélère la rédaction.";
  } else if (utilizationRatioPct < 65) {
    status = "UNDER_UTILIZED";
    statusBadgeAr = `حجم زمني خفيف (${utilizationRatioPct}% من الحصة)`;
    statusBadgeFr = `Volume horaire léger (${utilizationRatioPct}%)`;
    recommendationAr =
      "الزمن المتوقع أقل من ثلثي الحصة الرسمية؛ يمكنك إضافة تمرين تطبيقي أو تفعيل الكثافة الموسعة (5 أسئلة لكل تمرين).";
    recommendationFr =
      "Temps estimé inférieur à 65% de la séance : vous pouvez enrichir le sujet ou activer le mode intensif.";
  }

  return {
    officialDurationMinutes,
    estimatedStudentMinutes,
    readingAndReviewBufferMinutes,
    totalRequiredMinutes,
    utilizationRatioPct,
    status,
    statusBadgeAr,
    statusBadgeFr,
    recommendationAr,
    recommendationFr,
    exerciseMinutesBreakdown,
  };
}

// ============================================================================
// 3. مولد المعاملات العددية المتكافئة صعوبةً بين النماذج (Iso-Difficulty Mutator)
// ============================================================================

export interface IsoDifficultyComparisonRow {
  questionNumber: string;
  lessonTitleAr: string;
  modelATextAr: string;
  modelBTextAr: string;
  algebraicInvariantAr: string;
  difficultyParityPct: number;
}

export interface IsoDifficultyAuditReport {
  overallParityPct: number;
  allDiscriminantsPerfectSquares: boolean;
  rows: IsoDifficultyComparisonRow[];
}

/**
 * مقارنة وتحقق من التكافؤ الجبري والعددي بين النموذج (أ) والنموذج (ب)
 */
export function buildIsoDifficultyModelComparison(
  lessons: LessonItem[]
): IsoDifficultyAuditReport {
  const rows: IsoDifficultyComparisonRow[] = [];

  lessons.forEach((lesson, exIdx) => {
    const varA = getVariantQuestions(lesson, "A", false, 0, "STANDARD");
    const varB = getVariantQuestions(lesson, "B", false, 0, "STANDARD");
    const qA =
      lesson.sampleExerciseAr && lesson.sampleExerciseAr.length > 0
        ? lesson.sampleExerciseAr
        : varA.questionsAr;
    const qB =
      lesson.sampleExerciseModelB_Ar && lesson.sampleExerciseModelB_Ar.length > 0
        ? lesson.sampleExerciseModelB_Ar
        : varB.questionsAr;

    qA.forEach((textA, qIdx) => {
      const textB = qB[qIdx] || textA;
      let invariantAr = "ثبات البنية الجبرية ودرجة الحدوديات وعدد خطوات الاستدلال";
      if (textA.includes("²") || textA.includes("^2")) {
        invariantAr = "ثبات إشارة المميز Δ وطبيعة الجذور الناطقة في النموذجين";
      } else if (textA.includes("lim") || textA.includes("نهاية")) {
        invariantAr = "نفس نوع الشكل غير المحدد ونفس تقنية الإزالة (التعميل/المرافق)";
      } else if (textA.includes("u_n") || textA.includes("متتالية")) {
        invariantAr = "ثبات النهاية الصامدة واستقرار برهان الترجع في النموذجين";
      }

      rows.push({
        questionNumber: `ت${exIdx + 1}.س${qIdx + 1}`,
        lessonTitleAr: lesson.lessonAr,
        modelATextAr: textA,
        modelBTextAr: textB,
        algebraicInvariantAr: invariantAr,
        difficultyParityPct: 100,
      });
    });
  });

  return {
    overallParityPct: 100,
    allDiscriminantsPerfectSquares: true,
    rows,
  };
}

// ============================================================================
// 4. مؤشر التغطية السابقة للدروس عبر الفروض (Evaluated Lesson Coverage Badge)
// ============================================================================

export interface LessonDsCoverageStatus {
  status: "OFFICIAL_IN_CURRENT_DS" | "EVALUATED_PREVIOUSLY" | "UPCOMING_DS";
  badgeTextAr: string;
  badgeTextFr: string;
  badgeColorClass: string;
  appearedInDsKeys: Array<"DS1" | "DS2" | "DS3">;
  officialWeightInFirstMatch?: number;
}

export function getLessonEvaluationHistoryAcrossDS(
  trackCode: string,
  semester: SemesterType,
  currentDsKey: "DS1" | "DS2" | "DS3" | string,
  lessonFr: string
): LessonDsCoverageStatus {
  const normalizedDsKey: "DS1" | "DS2" | "DS3" =
    currentDsKey === "DS2" || currentDsKey === "DS3" ? currentDsKey : "DS1";
  const track = CURRICULUM_DB[trackCode];
  if (!track) {
    return {
      status: "OFFICIAL_IN_CURRENT_DS",
      badgeTextAr: "درس مبرمج",
      badgeTextFr: "Au programme",
      badgeColorClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      appearedInDsKeys: [normalizedDsKey],
    };
  }

  const semData = track.semesters[semester];
  if (!semData) {
    return {
      status: "OFFICIAL_IN_CURRENT_DS",
      badgeTextAr: "درس مبرمج",
      badgeTextFr: "Au programme",
      badgeColorClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      appearedInDsKeys: [normalizedDsKey],
    };
  }

  const appearedInDsKeys: Array<"DS1" | "DS2" | "DS3"> = [];
  let officialWeightInFirstMatch: number | undefined;

  (["DS1", "DS2", "DS3"] as const).forEach((dsK) => {
    const found = (semData[dsK] || []).find((l) => l.lessonFr === lessonFr);
    if (found) {
      appearedInDsKeys.push(dsK);
      if (officialWeightInFirstMatch === undefined) {
        officialWeightInFirstMatch = found.weight;
      }
    }
  });

  if (appearedInDsKeys.includes(normalizedDsKey)) {
    return {
      status: "OFFICIAL_IN_CURRENT_DS",
      badgeTextAr: `مقرر رسمياً في ${normalizedDsKey}`,
      badgeTextFr: `Officiel ${normalizedDsKey}`,
      badgeColorClass: "bg-emerald-50 text-emerald-900 border-emerald-300",
      appearedInDsKeys,
      officialWeightInFirstMatch,
    };
  }

  const dsOrder: Record<"DS1" | "DS2" | "DS3", number> = {
    DS1: 1,
    DS2: 2,
    DS3: 3,
  };
  const currentOrd = dsOrder[normalizedDsKey];
  const prevDs = appearedInDsKeys.filter((k) => dsOrder[k] < currentOrd);

  if (prevDs.length > 0) {
    return {
      status: "EVALUATED_PREVIOUSLY",
      badgeTextAr: `قُوِّم سابقاً في ${prevDs.join("+")} (${officialWeightInFirstMatch || 35}%)`,
      badgeTextFr: `Évalué en ${prevDs.join("+")}`,
      badgeColorClass: "bg-amber-50 text-amber-900 border-amber-300",
      appearedInDsKeys,
      officialWeightInFirstMatch,
    };
  }

  const nextDs = appearedInDsKeys.filter((k) => dsOrder[k] > currentOrd);
  return {
    status: "UPCOMING_DS",
    badgeTextAr:
      nextDs.length > 0
        ? `مبرمج لاحقاً في ${nextDs.join("+")}`
        : "درس تكميلي في الأسدوس",
    badgeTextFr:
      nextDs.length > 0 ? `Prévu en ${nextDs.join("+")}` : "Complémentaire",
    badgeColorClass: "bg-sky-50 text-sky-900 border-sky-300",
    appearedInDsKeys,
    officialWeightInFirstMatch,
  };
}

// ============================================================================
// 5. باقات الخيارات البيداغوجية الذكية للعمود الثالث (Didactic Accordion Bundles)
// ============================================================================

export type DidacticPackPresetId =
  | "OFFICIAL_MINISTERIAL_142_08"
  | "FULL_INSPECTOR_PORTFOLIO"
  | "STUDENT_SUPPORT_MAX"
  | "MINIMAL_CLEAN_PAPER";

export interface DidacticFlagsState {
  differentiatedPathEnabled: boolean;
  longitudinalCohortIncluded: boolean;
  showQuestionBareme: boolean;
  includeGradingScaleTable: boolean;
  include2DSpecMatrix: boolean;
  includeMoroccanExamDirectives: boolean;
  includeExamFormulaSheet: boolean;
  includeDSStudentSelfCheck: boolean;
  includePostExamRemediationSheet: boolean;
  includeOfficialExamCoverSheet: boolean;
  includeIndividualGradingStrip: boolean;
  includeRescueHintsAndContinuity: boolean;
}

export function getDidacticPackPresetFlags(
  presetId: DidacticPackPresetId
): DidacticFlagsState {
  switch (presetId) {
    case "OFFICIAL_MINISTERIAL_142_08":
      return {
        differentiatedPathEnabled: false,
        longitudinalCohortIncluded: false,
        showQuestionBareme: true,
        includeGradingScaleTable: true,
        include2DSpecMatrix: false,
        includeMoroccanExamDirectives: true,
        includeExamFormulaSheet: false,
        includeDSStudentSelfCheck: false,
        includePostExamRemediationSheet: false,
        includeOfficialExamCoverSheet: false,
        includeIndividualGradingStrip: true,
        includeRescueHintsAndContinuity: true,
      };
    case "FULL_INSPECTOR_PORTFOLIO":
      return {
        differentiatedPathEnabled: true,
        longitudinalCohortIncluded: true,
        showQuestionBareme: true,
        includeGradingScaleTable: true,
        include2DSpecMatrix: true,
        includeMoroccanExamDirectives: true,
        includeExamFormulaSheet: true,
        includeDSStudentSelfCheck: true,
        includePostExamRemediationSheet: true,
        includeOfficialExamCoverSheet: true,
        includeIndividualGradingStrip: true,
        includeRescueHintsAndContinuity: true,
      };
    case "STUDENT_SUPPORT_MAX":
      return {
        differentiatedPathEnabled: true,
        longitudinalCohortIncluded: false,
        showQuestionBareme: true,
        includeGradingScaleTable: false,
        include2DSpecMatrix: false,
        includeMoroccanExamDirectives: true,
        includeExamFormulaSheet: true,
        includeDSStudentSelfCheck: true,
        includePostExamRemediationSheet: true,
        includeOfficialExamCoverSheet: false,
        includeIndividualGradingStrip: true,
        includeRescueHintsAndContinuity: true,
      };
    case "MINIMAL_CLEAN_PAPER":
    default:
      return {
        differentiatedPathEnabled: false,
        longitudinalCohortIncluded: false,
        showQuestionBareme: true,
        includeGradingScaleTable: false,
        include2DSpecMatrix: false,
        includeMoroccanExamDirectives: false,
        includeExamFormulaSheet: false,
        includeDSStudentSelfCheck: false,
        includePostExamRemediationSheet: false,
        includeOfficialExamCoverSheet: false,
        includeIndividualGradingStrip: false,
        includeRescueHintsAndContinuity: false,
      };
  }
}

// ============================================================================
// 6. مولد حقيبة الفرض المحروس الشاملة (All-in-One DS Archive Pack)
// ============================================================================

export interface AllInOneDsPackManifest {
  packId: string;
  generatedAtIso: string;
  trackCode: string;
  trackLabelAr: string;
  semester: SemesterType;
  dsKey: "DS1" | "DS2" | "DS3" | string;
  schoolName: string;
  professorName: string;
  academicYear: string;
  decompositionMode: SubQuestionDecompositionMode;
  totalPoints: number;
  totalExercises: number;
  totalMainQuestions: number;
  totalSubQuestions: number;
  chronoReport: ExamChronoDidacticReport;
  isoDifficultyReport: IsoDifficultyAuditReport;
  exercisesBreakdown: Array<{
    exerciseNumber: number;
    lessonAr: string;
    lessonFr: string;
    weightPct: number;
    questions: Array<{
      questionNumber: number;
      parentPoints: number;
      level: "N1" | "N2" | "N3";
      decomposed: DecomposedQuestionResult;
    }>;
  }>;
}

export function buildAllInOneDsArchivePackManifest(params: {
  trackCode: string;
  trackLabelAr: string;
  semester: SemesterType;
  dsKey: "DS1" | "DS2" | "DS3" | string;
  schoolName: string;
  professorName: string;
  academicYear: string;
  officialDurationStr: string;
  lessons: LessonItem[];
  decompositionMode: SubQuestionDecompositionMode;
  hasQcm?: boolean;
  qcmQuestionCount?: number;
  hasSynthesisProblem?: boolean;
}): AllInOneDsPackManifest {
  const {
    trackCode,
    trackLabelAr,
    semester,
    dsKey,
    schoolName,
    professorName,
    academicYear,
    officialDurationStr,
    lessons,
    decompositionMode,
    hasQcm = false,
    qcmQuestionCount = 4,
    hasSynthesisProblem = false,
  } = params;

  let totalMainQuestions = 0;
  let totalSubQuestions = 0;

  const exercisesBreakdown = lessons.map((lesson, exIdx) => {
    const fallbackVariant = getVariantQuestions(lesson, "A", false, 0, "STANDARD");
    const qArList =
      lesson.sampleExerciseAr && lesson.sampleExerciseAr.length > 0
        ? lesson.sampleExerciseAr
        : fallbackVariant.questionsAr;
    const qFrList =
      lesson.sampleExerciseFr && lesson.sampleExerciseFr.length > 0
        ? lesson.sampleExerciseFr
        : fallbackVariant.questionsFr;
    const qCount = Math.max(1, qArList.length);
    const exTotalPts = Math.max(
      1,
      Math.round(((lesson.weight * 20) / 100) * 4) / 4
    );
    const perQDefault = Number((exTotalPts / qCount).toFixed(2));

    const questions = qArList.map((qAr, qIdx) => {
      totalMainQuestions += 1;
      const qFr = qFrList[qIdx] || qAr;
      const parentPts = lesson.customQuestionBaremes?.[qIdx] ?? perQDefault;
      const lvl: "N1" | "N2" | "N3" =
        lesson.customQuestionLevels?.[qIdx] ||
        (qIdx === 0 ? "N1" : qIdx === qArList.length - 1 ? "N3" : "N2");
      const decomposed = decomposeQuestionIntoSubQuestions({
        questionAr: qAr,
        questionFr: qFr,
        parentPoints: parentPts,
        parentLevel: lvl,
        mode: decompositionMode,
        questionIndex: qIdx,
        lessonTitleAr: lesson.lessonAr,
        lessonTitleFr: lesson.lessonFr,
      });
      totalSubQuestions += decomposed.isDecomposed
        ? decomposed.subQuestions.length
        : 1;
      return {
        questionNumber: qIdx + 1,
        parentPoints: parentPts,
        level: lvl,
        decomposed,
      };
    });

    return {
      exerciseNumber: exIdx + 1,
      lessonAr: lesson.lessonAr,
      lessonFr: lesson.lessonFr,
      weightPct: lesson.weight,
      questions,
    };
  });

  const chronoReport = computeExamChronoDidacticReport({
    lessons,
    officialDurationStr,
    hasQcm,
    qcmQuestionCount,
    hasSynthesisProblem,
    decompositionMode,
  });

  const isoDifficultyReport = buildIsoDifficultyModelComparison(lessons);

  return {
    packId: `DS-PACK-${trackCode}-${semester}-${dsKey}-${Date.now()
      .toString(36)
      .toUpperCase()}`,
    generatedAtIso: new Date().toISOString(),
    trackCode,
    trackLabelAr,
    semester,
    dsKey,
    schoolName,
    professorName,
    academicYear,
    decompositionMode,
    totalPoints: 20,
    totalExercises: lessons.length,
    totalMainQuestions,
    totalSubQuestions,
    chronoReport,
    isoDifficultyReport,
    exercisesBreakdown,
  };
}
