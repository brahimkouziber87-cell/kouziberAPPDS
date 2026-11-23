/**
 * جسر التكامل البيداغوجي الثنائي الاتجاه مع التطبيق الثاني (تطبيق التتبع البيداغوجي والتدبير ودفتر النصوص)
 * متوافق 100% مع:
 * 1) LessonLogEngine.buildCompanionAppPedagogicalBrief (استيراد البطاقة التشخيصية للقسم وتطبيق التوصية الآلية)
 * 2) LessonLogEngine.normalizeImportedCompanionDocument (تصدير الوثائق المنتجة لإدراجها في المكتبة الرقمية ودفتر النصوص)
 */

import {
  CURRICULUM_DB,
  DMSubType,
  LessonItem,
  ModuleType,
  SemesterType,
  TrackData,
} from "../data/curriculum";
import {
  decomposeQuestionIntoSubQuestions,
  SubQuestionDecompositionMode,
} from "./dsSupervisedExamEnhancements";

export const OFFICIAL_MOROCCAN_TRACK_COEFFICIENTS: Record<string, number> = {
  TCS: 4,
  TCT: 4,
  TCLSH: 2,
  "1BAC_SM": 9,
  "1BAC_SE": 7,
  "1BAC_STE_STM": 7,
  "1BAC_ECO": 4,
  "1BAC_LETTRES": 1,
  "2BAC_SM": 9,
  "2BAC_PC": 7,
  "2BAC_SVT_AGRO": 7,
  "2BAC_STE_STM": 7,
  "2BAC_ECO_TGC": 4,
  "2BAC_LETTRES": 1,
  "2NDE_FR": 4,
  "1ERE_SPE_FR": 8,
  TERM_SPE_FR: 16,
  TERM_EXP_FR: 16,
  TERM_COMPL_FR: 6,
};

export interface CompletedLessonBriefItem {
  order: number;
  lessonAr: string;
  lessonFr: string;
  axisAr: string;
  completedHours: number;
  completionRatePercent: number;
}

export type RecommendedPedagogicalActionCategory =
  | "REMEDIATION_AND_SUPPORT_SERIES"
  | "SYNTHESIS_SERIES_OR_DS"
  | "STANDARD_DS_AND_PREP_DM";

export interface CompanionAppPedagogicalBrief {
  schema: "lesson-log-companion-brief-v1";
  generatedAt: string;
  sourceApp: string;
  targetApp: string;
  classIdentity: {
    className: string;
    trackCode: string;
    trackLabelAr: string;
    trackLabelFr: string;
    coefficient: number;
    semester: SemesterType;
    targetExamKey: string;
    school: string;
    professor: string;
    academicYear: string;
  };
  cahierDeTexteProgress: {
    totalCompletedLessons: number;
    totalCompletedHours: number;
    completedLessons: CompletedLessonBriefItem[];
  };
  classDiagnosticMetrics: {
    totalStudents: number;
    classAverage: number;
    passCountGte10: number;
    passRatePercent: number;
    strugglingCountLt8: number;
    strugglingRatioPercent: number;
    excellenceCountGte16: number;
  };
  automatedPedagogicalRecommendation: {
    recommendationCategory: RecommendedPedagogicalActionCategory;
    recommendedModuleInStudio: ModuleType;
    recommendedDmSubType: DMSubType;
    recommendationTitleAr: string;
    recommendationRationaleAr: string;
    recommendedSkillDistribution: { n1: number; n2: number; n3: number };
    enableSubQuestionDecomposition: boolean;
    enableStepByStepHints: boolean;
  };
}

export interface NormalizedCompanionDocumentResult {
  isValid: boolean;
  normalizedSchema: "lesson-log-imported-document-v1";
  importedAt: string;
  documentId: string;
  digitalLibraryEntry: {
    id: string;
    kind:
      | "DEVOIR_SURVEILLE"
      | "SERIE_SOUTIEN_REMEDIATION"
      | "SERIE_EXERCICES_TD"
      | "DEVOIR_MAISON"
      | "FICHE_COURS_PEDAGOGIQUE"
      | "EVALUATION_DIAGNOSTIQUE"
      | "REPARTITION_SEMESTRIELLE"
      | "RESUME_COURS_SYNTHESE"
      | "DOSSIER_PEDAGOGIQUE_COMPLET";
    kindLabelAr: string;
    titleAr: string;
    titleFr: string;
    trackCode: string;
    trackLabelAr: string;
    coefficient: number;
    semester: SemesterType;
    examKey: string;
    targetAxisAr: string;
    targetAxisFr: string;
    allocatedHours: number;
    totalPoints: number;
    totalQuestions: number;
    totalSubQuestions: number;
    skillDistribution: { n1: number; n2: number; n3: number };
    coveredLessons: Array<{
      lessonAr: string;
      lessonFr: string;
      category: string;
      weight: number;
      capacitiesAr: string[];
    }>;
  };
  cahierDeTexteLogEntry: {
    entryId: string;
    dateIso: string;
    trackCode: string;
    semester: SemesterType;
    axisAr: string;
    axisFr: string;
    allocatedHours: string;
    sessionActivityTypeAr: string;
    summaryAr: string;
    summaryFr: string;
    targetedCapacitiesAr: string[];
  };
}

/**
 * 1. بناء البطاقة التشخيصية للقسم (LessonLogEngine.buildCompanionAppPedagogicalBrief)
 */
export function buildCompanionAppPedagogicalBrief(input: {
  className?: string;
  trackCode?: string;
  trackLabelAr?: string;
  trackLabelFr?: string;
  coefficient?: number;
  semester?: SemesterType | string;
  examKey?: string;
  targetExamKey?: string;
  school?: string;
  professor?: string;
  academicYear?: string;
  completedLessons?: Array<
    | string
    | {
        order?: number;
        lessonAr?: string;
        lessonFr?: string;
        axisAr?: string;
        category?: string;
        completedHours?: number;
        hoursCompleted?: number;
        hours?: string | number;
        completionRatePercent?: number;
      }
  >;
  lessons?: Array<
    | string
    | {
        order?: number;
        lessonAr?: string;
        lessonFr?: string;
        axisAr?: string;
        category?: string;
        completedHours?: number;
        hoursCompleted?: number;
        hours?: string | number;
        completionRatePercent?: number;
      }
  >;
  studentGrades?: number[];
  studentScores?: number[];
  totalStudents?: number;
  classAverage?: number;
  passRatePercent?: number;
  strugglingCount?: number;
  excellenceCount?: number;
}): CompanionAppPedagogicalBrief {
  const trackCode = (input.trackCode || "2BAC_PC").trim();
  const trackData = CURRICULUM_DB[trackCode] || CURRICULUM_DB["2BAC_PC"];
  const coefficient =
    Number(input.coefficient) ||
    OFFICIAL_MOROCCAN_TRACK_COEFFICIENTS[trackCode] ||
    7;
  const semester: SemesterType = input.semester === "S2" ? "S2" : "S1";
  const examKey = (input.examKey || input.targetExamKey || "DS1").trim();

  const rawGradesSource = Array.isArray(input.studentGrades)
    ? input.studentGrades
    : Array.isArray(input.studentScores)
    ? input.studentScores
    : [];
  const validGrades = rawGradesSource
    .map((g) => Number(g))
    .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 20);

  const totalStudents =
    validGrades.length > 0
      ? validGrades.length
      : Math.max(1, Number(input.totalStudents) || 32);

  let classAverage = 11.2;
  let passCount = 0;
  let strugglingCount = 0;
  let excellenceCount = 0;

  if (validGrades.length > 0) {
    const sum = validGrades.reduce((a, b) => a + b, 0);
    classAverage = Number((sum / validGrades.length).toFixed(2));
    passCount = validGrades.filter((g) => g >= 10).length;
    strugglingCount = validGrades.filter((g) => g < 8).length;
    excellenceCount = validGrades.filter((g) => g >= 16).length;
  } else {
    classAverage =
      input.classAverage !== undefined
        ? Number(Number(input.classAverage).toFixed(2))
        : 11.2;
    strugglingCount =
      input.strugglingCount !== undefined
        ? Math.max(0, Math.round(Number(input.strugglingCount)))
        : classAverage < 10
        ? Math.round(totalStudents * 0.42)
        : Math.round(totalStudents * 0.18);
    const passRateInput =
      input.passRatePercent !== undefined
        ? Number(input.passRatePercent)
        : classAverage >= 12
        ? 75
        : classAverage >= 10
        ? 58
        : 36;
    passCount = Math.round((passRateInput / 100) * totalStudents);
    excellenceCount =
      input.excellenceCount !== undefined
        ? Number(input.excellenceCount)
        : classAverage >= 13
        ? Math.round(totalStudents * 0.2)
        : Math.round(totalStudents * 0.08);
  }

  const passRatePercent = Number(((passCount / totalStudents) * 100).toFixed(1));
  const strugglingRatio = strugglingCount / totalStudents;

  const defaultLessonsSource =
    trackData?.semesters?.[semester]?.[examKey] ||
    trackData?.semesters?.[semester]?.DS1 ||
    [];

  const rawCompleted: Array<
    | string
    | {
        order?: number;
        lessonAr?: string;
        lessonFr?: string;
        axisAr?: string;
        category?: string;
        completedHours?: number;
        hoursCompleted?: number;
        hours?: string | number;
        completionRatePercent?: number;
      }
  > =
    Array.isArray(input.completedLessons) && input.completedLessons.length > 0
      ? input.completedLessons
      : Array.isArray(input.lessons) && input.lessons.length > 0
      ? input.lessons
      : defaultLessonsSource.map((l, idx) => ({
          order: idx + 1,
          lessonAr: l.lessonAr,
          lessonFr: l.lessonFr,
          axisAr: l.category,
          category: l.category,
          completedHours: parseInt(l.hours, 10) || 8,
          hours: l.hours,
          completionRatePercent: 100,
        }));

  const completedLessons: CompletedLessonBriefItem[] = rawCompleted.map((item, idx) => {
    if (typeof item === "string") {
      return {
        order: idx + 1,
        lessonAr: item,
        lessonFr: item,
        axisAr: "تحليل / جبر",
        completedHours: 8,
        completionRatePercent: 100,
      };
    }
    return {
      order: item.order || idx + 1,
      lessonAr: item.lessonAr || "درس منجز",
      lessonFr: item.lessonFr || item.lessonAr || "Chapitre réalisé",
      axisAr: item.axisAr || item.category || "التحليل والجبر",
      completedHours: Number(item.completedHours || item.hoursCompleted || item.hours) || 8,
      completionRatePercent:
        item.completionRatePercent !== undefined
          ? Number(item.completionRatePercent)
          : 100,
    };
  });

  let recommendationCategory: RecommendedPedagogicalActionCategory =
    "STANDARD_DS_AND_PREP_DM";
  let recommendedModuleInStudio: ModuleType = "DS_142_08";
  let recommendedDmSubType: DMSubType = "DEVOIR_MAISON";
  let recommendationTitleAr =
    "فرض محروس رسمي (مذكرة 142-08) مسبوق بفرض منزلي تحضيري للمحاور المنجزة";
  let recommendationRationaleAr = "";
  let recommendedSkillDistribution = { n1: 30, n2: 50, n3: 20 };

  if (classAverage < 10 || passRatePercent < 50 || strugglingRatio >= 0.3) {
    recommendationCategory = "REMEDIATION_AND_SUPPORT_SERIES";
    recommendedModuleInStudio = "DM_SERIE";
    recommendedDmSubType = "SERIE_TD";
    recommendationTitleAr =
      "سلسلة دعم ومعالجة مركزة لتجاوز التعثرات المرصودة قبل الفرض الموالي";
    recommendationRationaleAr = `نظراً لكون معدل القسم (${classAverage}/20) ونسبة الاستيفاء (${passRatePercent}%) وعدد المتعثرين أقل من 8 (${strugglingCount} تلميذاً)، يوصي المحرك بإنتاج سلسلة دعم ومعالجة مركزة تركز على القدرات الأساسية (N1/N2) مرفقة بتذكير القواعد وإرشادات الحل.`;
    recommendedSkillDistribution = { n1: 50, n2: 40, n3: 10 };
  } else if (classAverage >= 12.5 && passRatePercent >= 70) {
    recommendationCategory = "SYNTHESIS_SERIES_OR_DS";
    recommendedModuleInStudio = "DS_142_08";
    recommendedDmSubType = "SERIE_TD";
    recommendationTitleAr =
      "فرض محروس توليفي أو سلسلة تمارين التعمق والمسائل التوليفية (N2/N3)";
    recommendationRationaleAr = `سجل القسم مؤشرات تحصيل متميزة (المعدل ${classAverage}/20 ونسبة الاستيفاء ${passRatePercent}%)؛ يوصى بإنتاج فرض محروس بمكون توليفي أو سلسلة تمارين توليفية لتعزيز مهارات الاستدلال والتميّز.`;
    recommendedSkillDistribution = { n1: 20, n2: 50, n3: 30 };
  } else {
    recommendationCategory = "STANDARD_DS_AND_PREP_DM";
    recommendedModuleInStudio = "DS_142_08";
    recommendedDmSubType = "DEVOIR_MAISON";
    recommendationTitleAr =
      "فرض محروس رسمي (مذكرة 142-08) للمحاور المنجزة في دفتر النصوص";
    recommendationRationaleAr = `تحصيل القسم متوازن (المعدل ${classAverage}/20 ونسبة الاستيفاء ${passRatePercent}%) مع استكمال الدروس المقررة في دفتر النصوص؛ يوصى ببرمجة الفرض المحروس بتوزيع معياري متوازن (30% N1 · 50% N2 · 20% N3).`;
    recommendedSkillDistribution = { n1: 30, n2: 50, n3: 20 };
  }

  return {
    schema: "lesson-log-companion-brief-v1",
    generatedAt: new Date().toISOString(),
    sourceApp: "PedagogicalTrackingAndManagementApp",
    targetApp: "KouziberDocumentProductionStudio",
    classIdentity: {
      className: input.className || `${trackCode}-G1`,
      trackCode,
      trackLabelAr: input.trackLabelAr || trackData?.labelAr || trackCode,
      trackLabelFr: input.trackLabelFr || trackData?.labelFr || trackCode,
      coefficient,
      semester,
      targetExamKey: examKey,
      school: input.school || "",
      professor: input.professor || "",
      academicYear: input.academicYear || "2025/2026",
    },
    cahierDeTexteProgress: {
      totalCompletedLessons: completedLessons.length,
      totalCompletedHours: completedLessons.reduce(
        (acc, l) => acc + (Number(l.completedHours) || 0),
        0
      ),
      completedLessons,
    },
    classDiagnosticMetrics: {
      totalStudents,
      classAverage,
      passCountGte10: passCount,
      passRatePercent,
      strugglingCountLt8: strugglingCount,
      strugglingRatioPercent: Number((strugglingRatio * 100).toFixed(1)),
      excellenceCountGte16: excellenceCount,
    },
    automatedPedagogicalRecommendation: {
      recommendationCategory,
      recommendedModuleInStudio,
      recommendedDmSubType,
      recommendationTitleAr,
      recommendationRationaleAr,
      recommendedSkillDistribution,
      enableSubQuestionDecomposition: true,
      enableStepByStepHints: classAverage < 11.5,
    },
  };
}

/**
 * 2. تحليل البطاقة التشخيصية المستوردة من تطبيق التدبير وتحويلها إلى إعدادات جاهزة للتطبيق المباشر في منصة إنتاج الوثائق
 */
export interface AppliedBriefStudioConfig {
  brief: CompanionAppPedagogicalBrief;
  resolvedTrackCode: string;
  resolvedSemester: SemesterType;
  resolvedDsKey: string;
  resolvedModule: ModuleType;
  resolvedDmSubType: DMSubType;
  matchedCurriculumLessons: LessonItem[];
  n1: number;
  n2: number;
  n3: number;
  includeHints: boolean;
  includeLessonMemo: boolean;
  customHeaderNoteAr: string;
}

export function parseAndResolveCompanionBriefForStudio(
  rawJsonOrObject: string | Record<string, any>
): AppliedBriefStudioConfig {
  const parsed =
    typeof rawJsonOrObject === "string"
      ? JSON.parse(rawJsonOrObject)
      : rawJsonOrObject;

  // إذا كان الكائن المستورد خاماً نمرره عبر buildCompanionAppPedagogicalBrief لتطبيعه
  const brief: CompanionAppPedagogicalBrief =
    parsed?.schema === "lesson-log-companion-brief-v1" &&
    parsed?.classIdentity &&
    parsed?.automatedPedagogicalRecommendation
      ? (parsed as CompanionAppPedagogicalBrief)
      : buildCompanionAppPedagogicalBrief(parsed || {});

  const resolvedTrackCode = CURRICULUM_DB[brief.classIdentity.trackCode]
    ? brief.classIdentity.trackCode
    : "2BAC_PC";
  const resolvedSemester: SemesterType =
    brief.classIdentity.semester === "S2" ? "S2" : "S1";
  const resolvedDsKey = ["DS1", "DS2", "DS3"].includes(
    brief.classIdentity.targetExamKey
  )
    ? brief.classIdentity.targetExamKey
    : "DS1";

  const trackData = CURRICULUM_DB[resolvedTrackCode];
  const allSemesterLessons: LessonItem[] = [
    ...(trackData.semesters[resolvedSemester].DS1 || []),
    ...(trackData.semesters[resolvedSemester].DS2 || []),
    ...(trackData.semesters[resolvedSemester].DS3 || []),
  ];

  // مطابقة الدروس المنجزة فعلياً في دفتر النصوص مع دروس المنهاج الرسمي
  const matched: LessonItem[] = [];
  for (const completed of brief.cahierDeTexteProgress.completedLessons) {
    const found = allSemesterLessons.find(
      (l) =>
        l.lessonAr.includes(completed.lessonAr) ||
        completed.lessonAr.includes(l.lessonAr) ||
        l.lessonFr.toLowerCase().includes(completed.lessonFr.toLowerCase()) ||
        completed.lessonFr.toLowerCase().includes(l.lessonFr.toLowerCase())
    );
    if (found && !matched.some((m) => m.lessonFr === found.lessonFr)) {
      matched.push({ ...found });
    }
  }

  const finalLessons =
    matched.length > 0
      ? matched
      : (trackData.semesters[resolvedSemester][resolvedDsKey] || []).map((l) => ({
          ...l,
        }));

  // موازنة أوزان الدروس المنجزة لتساوي 100%
  if (finalLessons.length > 0) {
    const baseWeight = Math.floor(100 / finalLessons.length);
    let rem = 100 - baseWeight * finalLessons.length;
    finalLessons.forEach((l, i) => {
      l.weight = baseWeight + (i === finalLessons.length - 1 ? rem : 0);
    });
  }

  const rec = brief.automatedPedagogicalRecommendation;
  const metrics = brief.classDiagnosticMetrics;

  const customHeaderNoteAr = `[بطاقة القسم ${brief.classIdentity.className} · المعامل ${brief.classIdentity.coefficient}] المعدل: ${metrics.classAverage}/20 · الاستيفاء (≥10): ${metrics.passRatePercent}% · المتعثرون (<8): ${metrics.strugglingCountLt8} — ${rec.recommendationTitleAr}`;

  return {
    brief,
    resolvedTrackCode,
    resolvedSemester,
    resolvedDsKey,
    resolvedModule: rec.recommendedModuleInStudio,
    resolvedDmSubType: rec.recommendedDmSubType,
    matchedCurriculumLessons: finalLessons,
    n1: rec.recommendedSkillDistribution.n1,
    n2: rec.recommendedSkillDistribution.n2,
    n3: rec.recommendedSkillDistribution.n3,
    includeHints: rec.enableStepByStepHints,
    includeLessonMemo:
      rec.recommendationCategory === "REMEDIATION_AND_SUPPORT_SERIES",
    customHeaderNoteAr,
  };
}

/**
 * 3. استيراد وتطبيع الوثائق المنتجة لإدراجها في المكتبة التربوية الرقمية ودفتر النصوص
 * (LessonLogEngine.normalizeImportedCompanionDocument)
 */
export function normalizeImportedCompanionDocument(
  rawDoc: Record<string, any>
): NormalizedCompanionDocumentResult {
  if (!rawDoc || typeof rawDoc !== "object") {
    throw new Error("ملف الوثيقة المستوردة غير صالح أو فارغ.");
  }

  const trackCode = String(
    rawDoc.trackCode || rawDoc.classIdentity?.trackCode || "2BAC_PC"
  ).trim();
  const coefficient =
    Number(rawDoc.coefficient) ||
    OFFICIAL_MOROCCAN_TRACK_COEFFICIENTS[trackCode] ||
    7;
  const semester: SemesterType = rawDoc.semester === "S2" ? "S2" : "S1";
  const rawType = String(rawDoc.documentType || rawDoc.activeModule || "DS_142_08");
  const subType = String(rawDoc.subType || rawDoc.dmSubType || "");

  let normalizedDocKind: NormalizedCompanionDocumentResult["digitalLibraryEntry"]["kind"] =
    "DEVOIR_SURVEILLE";
  let normalizedKindLabelAr = "فرض محروس رسمي (مذكرة 142-08)";
  let defaultAllocatedHours = 2;

  if (rawType === "DM_SERIE" && subType === "SERIE_TD") {
    if (
      rawDoc.isRemediationSeries ||
      (rawDoc.skillDistribution && Number(rawDoc.skillDistribution.n1) >= 45)
    ) {
      normalizedDocKind = "SERIE_SOUTIEN_REMEDIATION";
      normalizedKindLabelAr = "سلسلة دعم ومعالجة مركزة";
      defaultAllocatedHours = 2;
    } else {
      normalizedDocKind = "SERIE_EXERCICES_TD";
      normalizedKindLabelAr = "سلسلة تمارين تطبيقية وتوليفية";
      defaultAllocatedHours = 3;
    }
  } else if (rawType === "DM_SERIE" && subType === "DEVOIR_MAISON") {
    normalizedDocKind = "DEVOIR_MAISON";
    normalizedKindLabelAr = "فرض منزلي بحثي أو تحضيري";
    defaultAllocatedHours = 1;
  } else if (rawType === "FICHE_OP2007") {
    normalizedDocKind = "FICHE_COURS_PEDAGOGIQUE";
    normalizedKindLabelAr = "جذاذة درس بيداغوجية كاملة (OP 2007)";
    defaultAllocatedHours = Number(rawDoc.allocatedHours) || 10;
  } else if (rawType === "DIAGNOSTIC") {
    normalizedDocKind = "EVALUATION_DIAGNOSTIQUE";
    normalizedKindLabelAr = "رائز تقويم تشخيصي للمستلزمات";
    defaultAllocatedHours = 1;
  } else if (rawType === "REPARTITION_CERTIF") {
    normalizedDocKind = "REPARTITION_SEMESTRIELLE";
    normalizedKindLabelAr = "توزيع دوري للمقرر وخطة الإشهاد";
    defaultAllocatedHours = 2;
  } else if (rawType === "STANDALONE_SUMMARY" || rawDoc.summaryId) {
    normalizedDocKind = "RESUME_COURS_SYNTHESE";
    normalizedKindLabelAr = "ملخص درس مركز وخريطة ذهنية";
    defaultAllocatedHours = 1;
  } else if (rawType === "COMPLETE_UNIT_DOSSIER" || rawDoc.dossierId) {
    normalizedDocKind = "DOSSIER_PEDAGOGIQUE_COMPLET";
    normalizedKindLabelAr = "حقيبة بيداغوجية متكاملة للوحدة (5 في 1)";
    defaultAllocatedHours = 12;
  }

  const rawLessons: any[] = Array.isArray(rawDoc.lessons) ? rawDoc.lessons : [];
  const primaryAxisAr =
    rawDoc.targetAxisAr ||
    rawLessons[0]?.category ||
    rawLessons[0]?.subCategory ||
    rawLessons[0]?.lessonAr ||
    "التحليل والجبر";
  const primaryAxisFr =
    rawDoc.targetAxisFr ||
    rawLessons[0]?.lessonFr ||
    rawLessons[0]?.category ||
    "Analyse & Algèbre";

  const totalAllocatedHours =
    Number(rawDoc.allocatedHours) ||
    rawLessons.reduce((acc, l) => acc + (parseInt(String(l.hours), 10) || 0), 0) ||
    defaultAllocatedHours;

  const lessonTitlesAr = rawLessons.map((l) => l.lessonAr || l.titleAr || "درس");
  const lessonTitlesFr = rawLessons.map((l) => l.lessonFr || l.titleFr || "Chapitre");

  const documentTitleAr =
    rawDoc.titleAr ||
    `${normalizedKindLabelAr} — ${rawDoc.trackLabelAr || trackCode} (${semester}${
      rawDoc.examKey ? ` · ${rawDoc.examKey}` : ""
    })`;

  const nowIso = new Date().toISOString();
  const docId =
    rawDoc.documentId ||
    `DOC-BRIDGE-${trackCode}-${semester}-${normalizedDocKind}`;

  return {
    isValid: true,
    normalizedSchema: "lesson-log-imported-document-v1",
    importedAt: nowIso,
    documentId: docId,
    digitalLibraryEntry: {
      id: docId,
      kind: normalizedDocKind,
      kindLabelAr: normalizedKindLabelAr,
      titleAr: documentTitleAr,
      titleFr: rawDoc.titleFr || `${normalizedDocKind} — ${trackCode}`,
      trackCode,
      trackLabelAr: rawDoc.trackLabelAr || trackCode,
      coefficient,
      semester,
      examKey: rawDoc.examKey || "DS1",
      targetAxisAr: primaryAxisAr,
      targetAxisFr: primaryAxisFr,
      allocatedHours: totalAllocatedHours,
      totalPoints: Number(rawDoc.totalPoints) || 20,
      totalQuestions: Number(rawDoc.totalQuestions) || rawLessons.length * 3,
      totalSubQuestions: Number(rawDoc.totalSubQuestions) || 0,
      skillDistribution: rawDoc.skillDistribution || { n1: 30, n2: 50, n3: 20 },
      coveredLessons: rawLessons.map((l) => ({
        lessonAr: l.lessonAr,
        lessonFr: l.lessonFr,
        category: l.category || primaryAxisAr,
        weight: Number(l.weight) || 25,
        capacitiesAr: Array.isArray(l.capacitiesAr) ? l.capacitiesAr : [],
      })),
    },
    cahierDeTexteLogEntry: {
      entryId: `CDT-${docId}`,
      dateIso: nowIso.slice(0, 10),
      trackCode,
      semester,
      axisAr: primaryAxisAr,
      axisFr: primaryAxisFr,
      allocatedHours: `${defaultAllocatedHours}h`,
      sessionActivityTypeAr: normalizedKindLabelAr,
      summaryAr: `إنجاز واستغلال « ${documentTitleAr} » حول المحاور: ${
        lessonTitlesAr.join("، ") || primaryAxisAr
      } (الغلاف الزمني: ${defaultAllocatedHours} س · المعامل: ${coefficient}).`,
      summaryFr: `Réalisation de « ${normalizedDocKind} » portant sur : ${
        lessonTitlesFr.join(", ") || primaryAxisFr
      } (Volume horaire : ${defaultAllocatedHours}h · Coeff : ${coefficient}).`,
      targetedCapacitiesAr: rawLessons.flatMap((l) =>
        Array.isArray(l.capacitiesAr) ? l.capacitiesAr.slice(0, 2) : []
      ),
    },
  };
}

/**
 * 4. بناء حزمة التصدير الكاملة للوثيقة المنتجة في استوديو الوثائق (شاملةً تطبيع المكتبة الرقمية ودفتر النصوص)
 */
export function buildCompanionDocumentExportPayload(params: {
  activeModule: ModuleType;
  dmSubType: DMSubType;
  track: TrackData;
  semester: SemesterType;
  dsKey: string;
  school: string;
  prof: string;
  year: string;
  totalPoints: number;
  totalQuestions: number;
  n1: number;
  n2: number;
  n3: number;
  lessons: LessonItem[];
  subQuestionDecompositionMode?: SubQuestionDecompositionMode;
}) {
  const {
    activeModule,
    dmSubType,
    track,
    semester,
    dsKey,
    school,
    prof,
    year,
    totalPoints,
    totalQuestions,
    n1,
    n2,
    n3,
    lessons,
    subQuestionDecompositionMode = "STRUCTURED_ABC_ALL",
  } = params;

  const coefficient = OFFICIAL_MOROCCAN_TRACK_COEFFICIENTS[track.code] || 7;
  const isRemediationSeries =
    activeModule === "DM_SERIE" && dmSubType === "SERIE_TD" && n1 >= 45;

  let totalSubQuestions = 0;
  lessons.forEach((l) => {
    const sampleQs = l.sampleExerciseAr || ["سؤال 1", "سؤال 2", "سؤال 3"];
    sampleQs.forEach((qAr, idx) => {
      const decomp = decomposeQuestionIntoSubQuestions({
        questionAr: qAr,
        questionFr: l.sampleExerciseFr?.[idx] || qAr,
        parentPoints: 1.5,
        parentLevel: "N2",
        mode: subQuestionDecompositionMode,
        questionIndex: idx,
      });
      totalSubQuestions += decomp.subQuestions.length || 1;
    });
  });

  const rawPayload = {
    schema: "doc2app-pedagogical-bridge-v2",
    exportedAt: new Date().toISOString(),
    documentType: activeModule,
    subType: activeModule === "DM_SERIE" ? dmSubType : undefined,
    isRemediationSeries,
    trackCode: track.code,
    trackLabelAr: track.labelAr,
    trackLabelFr: track.labelFr,
    coefficient,
    semester,
    examKey: dsKey,
    school,
    professor: prof,
    academicYear: year,
    totalPoints,
    totalQuestions,
    totalSubQuestions,
    subQuestionDecompositionMode,
    skillDistribution: { n1, n2, n3 },
    lessons: lessons.map((l) => ({
      lessonAr: l.lessonAr,
      lessonFr: l.lessonFr,
      category: l.category,
      subCategory: l.subCategory,
      hours: l.hours,
      weight: l.weight,
      capacitiesAr: l.capacitiesAr,
      capacitiesFr: l.capacitiesFr,
    })),
  };

  const normalizedForCompanionApp = normalizeImportedCompanionDocument(rawPayload);

  return {
    ...rawPayload,
    normalizedCompanionPreview: normalizedForCompanionApp,
  };
}
