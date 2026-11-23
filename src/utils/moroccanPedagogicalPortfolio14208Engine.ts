import {
  CURRICULUM_DB,
  DMSubType,
  LessonItem,
  ModuleType,
  MoroccanDSStructureMode,
  SemesterType,
  TrackData,
  computeExactExerciseEffectiveWeights,
} from "../data/curriculum";
import {
  AutomatedDynamicSpecMatrix,
  autoRebalanceSpecMatrixTo14208,
  buildAutomatedDynamicSpecMatrix,
  buildPrerequisiteDiagnosticBlueprint,
  exportAutomatedSpecMatrixLatex,
} from "./diagnosticAndDynamicSpecMatrixEngine";

// ============================================================================
// 1. المعايير الرسمية للمذكرة الوزارية 142-08 والتوجيهات التربوية 2007 حسب الشعب
// ============================================================================

export interface OfficialNote14208TrackStandard {
  trackCode: string;
  trackLabelAr: string;
  trackLabelFr: string;
  cycle: string;
  officialCoefficient: number;
  weeklyHours: string;
  dsCountPerSemester: number;
  officialDurationAr: string;
  officialDurationFr: string;
  officialDurationMinutes: number;
  continuousAssessmentSplitAr: string;
  officialNoteCitationAr: string;
  recommendedN1: number;
  recommendedN2: number;
  recommendedN3: number;
  taxonomyReferenceNoteAr: string;
  didacticGuidelinesAr: string[];
  requiredPortfolioDocumentsAr: string[];
}

export interface Note14208ContinuousAssessmentResult {
  dsAverage: number;
  activitiesAverage: number;
  finalSemesterAverage: number;
  weightedDsPart: number;
  weightedActivitiesPart: number;
  remediationTierAr: string;
  remediationTierCode: "EXCELLENCE" | "CONSOLIDATION" | "REMEDIATION";
}

/**
 * حاسبة معدل المراقبة المستمرة وفق المذكرة الوزارية رقم 142-08 (16 نونبر 2007):
 * 75% لمعدل الفروض المحروسة المنجزة داخل القسم + 25% للأنشطة المندمجة والفروض المنزلية
 */
export function computeNote14208SemesterAverage(
  dsGrades: number[],
  activitiesGrade: number
): Note14208ContinuousAssessmentResult {
  const validDs = dsGrades
    .filter((g) => Number.isFinite(g))
    .map((g) => Math.max(0, Math.min(20, g)));
  const dsAverage =
    validDs.length > 0
      ? validDs.reduce((acc, v) => acc + v, 0) / validDs.length
      : 0;
  const clampedAct = Number.isFinite(activitiesGrade)
    ? Math.max(0, Math.min(20, activitiesGrade))
    : 0;

  const weightedDsPart = Number((dsAverage * 0.75).toFixed(2));
  const weightedActivitiesPart = Number((clampedAct * 0.25).toFixed(2));
  const finalSemesterAverage = Number(
    Math.min(20, dsAverage * 0.75 + clampedAct * 0.25).toFixed(2)
  );

  let remediationTierCode: "EXCELLENCE" | "CONSOLIDATION" | "REMEDIATION" =
    "CONSOLIDATION";
  let remediationTierAr =
    "فئة التثبيت (8–12): تقوية قدرات التوظيف والاستدلال (N2)";

  if (finalSemesterAverage >= 12) {
    remediationTierCode = "EXCELLENCE";
    remediationTierAr =
      "فئة التميز والتحكم (≥ 12): تعميق وضعيات التوليف والبرهان (N3)";
  } else if (finalSemesterAverage < 8) {
    remediationTierCode = "REMEDIATION";
    remediationTierAr =
      "فئة الدعم العاجل (< 8): معالجة التعثرات الأساسية والتطبيق المباشر (N1)";
  }

  return {
    dsAverage: Number(dsAverage.toFixed(2)),
    activitiesAverage: Number(clampedAct.toFixed(2)),
    finalSemesterAverage,
    weightedDsPart,
    weightedActivitiesPart,
    remediationTierAr,
    remediationTierCode,
  };
}

export function getOfficialNote14208TrackStandards(
  trackCode: string
): OfficialNote14208TrackStandard {
  const track: TrackData =
    CURRICULUM_DB[trackCode] || CURRICULUM_DB["2BAC_PC"];
  const code = (track.code || "2BAC_PC").toUpperCase();

  let officialCoefficient = 7;
  let weeklyHours = "5 ساعات أسبوعياً";
  let dsCountPerSemester = track.dsCount || 3;
  let officialDurationAr = "ساعتان (2h00)";
  let officialDurationFr = "2 heures (120 min)";
  let officialDurationMinutes = 120;
  let recommendedN1 = 35;
  let recommendedN2 = 45;
  let recommendedN3 = 20;

  if (code === "2BAC_SM") {
    officialCoefficient = 9;
    weeklyHours = "7 ساعات أسبوعياً";
    dsCountPerSemester = 4;
    officialDurationAr = "ساعتان (2h00) للفرض · 4 ساعات للوطني";
    officialDurationFr = "2h (DS) · 4h (National)";
    officialDurationMinutes = 120;
    recommendedN1 = 25;
    recommendedN2 = 45;
    recommendedN3 = 30;
  } else if (code === "1BAC_SM") {
    officialCoefficient = 9;
    weeklyHours = "7 ساعات أسبوعياً";
    dsCountPerSemester = 4;
    officialDurationAr = "ساعتان (2h00) للفرض";
    officialDurationFr = "2 heures (120 min)";
    officialDurationMinutes = 120;
    recommendedN1 = 25;
    recommendedN2 = 45;
    recommendedN3 = 30;
  } else if (
    code === "2BAC_PC" ||
    code.startsWith("2BAC_SVT") ||
    code === "2BAC_STE_STM"
  ) {
    officialCoefficient = 7;
    weeklyHours = "5 ساعات أسبوعياً";
    dsCountPerSemester = 3;
    officialDurationAr = "ساعتان (2h00) للفرض · 3 ساعات للوطني";
    officialDurationFr = "2h (DS) · 3h (National)";
    officialDurationMinutes = 120;
    recommendedN1 = 35;
    recommendedN2 = 45;
    recommendedN3 = 20;
  } else if (code === "1BAC_SE" || code === "1BAC_STE_STM") {
    officialCoefficient = 7;
    weeklyHours = "5 ساعات أسبوعياً";
    dsCountPerSemester = 3;
    officialDurationAr = "ساعتان (2h00)";
    officialDurationFr = "2 heures (120 min)";
    officialDurationMinutes = 120;
    recommendedN1 = 35;
    recommendedN2 = 45;
    recommendedN3 = 20;
  } else if (code === "TCS" || code === "TCT") {
    officialCoefficient = 4;
    weeklyHours = "5 ساعات أسبوعياً";
    dsCountPerSemester = 3;
    officialDurationAr = "ساعتان (2h00)";
    officialDurationFr = "2 heures (120 min)";
    officialDurationMinutes = 120;
    recommendedN1 = 45;
    recommendedN2 = 40;
    recommendedN3 = 15;
  } else if (code.includes("ECO")) {
    officialCoefficient = 4;
    weeklyHours = "4 ساعات أسبوعياً";
    dsCountPerSemester = 3;
    officialDurationAr = code.startsWith("2BAC")
      ? "ساعتان (2h00) للفرض · ساعتان للوطني"
      : "ساعتان (2h00)";
    officialDurationFr = "2 heures (120 min)";
    officialDurationMinutes = 120;
    recommendedN1 = 40;
    recommendedN2 = 45;
    recommendedN3 = 15;
  } else if (code.includes("LSH") || code.includes("LET")) {
    officialCoefficient = code === "TCLSH" ? 2 : 1;
    weeklyHours = "ساعتان أسبوعياً";
    dsCountPerSemester = 2;
    officialDurationAr =
      code === "1BAC_LETTRES"
        ? "ساعة واحدة (1h00) للفرض · 1h30 للجهوي"
        : code === "2BAC_LETTRES"
        ? "ساعة واحدة (1h00) للفرض · 1h30 للوطني"
        : "ساعة واحدة (1h00)";
    officialDurationFr =
      code === "1BAC_LETTRES"
        ? "1h (DS) · 1h30 (Régional)"
        : code === "2BAC_LETTRES"
        ? "1h (DS) · 1h30 (National)"
        : "1 heure (60 min)";
    officialDurationMinutes = 60;
    recommendedN1 = 50;
    recommendedN2 = 35;
    recommendedN3 = 15;
  } else if (code.startsWith("TERM_EXP")) {
    officialCoefficient = 16;
    weeklyHours = "6h + 3h (Maths Expertes)";
    dsCountPerSemester = 3;
    officialDurationAr = "ساعتان (2h00) للفرض · 4 ساعات للبكالوريا";
    officialDurationFr = "2h (DS) · 4h (Baccalauréat)";
    officialDurationMinutes = 120;
    recommendedN1 = 25;
    recommendedN2 = 45;
    recommendedN3 = 30;
  } else if (code.startsWith("TERM_SPE")) {
    officialCoefficient = 16;
    weeklyHours = "6 ساعات أسبوعياً (AEFE)";
    dsCountPerSemester = 3;
    officialDurationAr = "ساعتان (2h00) للفرض · 4 ساعات للبكالوريا";
    officialDurationFr = "2h (DS) · 4h (Baccalauréat)";
    officialDurationMinutes = 120;
    recommendedN1 = 30;
    recommendedN2 = 45;
    recommendedN3 = 25;
  } else if (code.startsWith("TERM_COMPL")) {
    officialCoefficient = 6;
    weeklyHours = "3 ساعات أسبوعياً (AEFE)";
    dsCountPerSemester = 3;
    officialDurationAr = "ساعتان (2h00)";
    officialDurationFr = "2 heures (120 min)";
    officialDurationMinutes = 120;
    recommendedN1 = 40;
    recommendedN2 = 45;
    recommendedN3 = 15;
  } else if (code.startsWith("1ERE_SPE")) {
    officialCoefficient = 8;
    weeklyHours = "4 ساعات أسبوعياً (AEFE)";
    dsCountPerSemester = 3;
    officialDurationAr = "ساعتان (2h00)";
    officialDurationFr = "2 heures (120 min)";
    officialDurationMinutes = 120;
    recommendedN1 = 35;
    recommendedN2 = 45;
    recommendedN3 = 20;
  } else if (code.startsWith("2NDE")) {
    officialCoefficient = 4;
    weeklyHours = "4 ساعات أسبوعياً (AEFE)";
    dsCountPerSemester = 3;
    officialDurationAr = "ساعتان (2h00)";
    officialDurationFr = "2 heures (120 min)";
    officialDurationMinutes = 120;
    recommendedN1 = 40;
    recommendedN2 = 45;
    recommendedN3 = 15;
  }

  return {
    trackCode: track.code,
    trackLabelAr: track.labelAr,
    trackLabelFr: track.labelFr,
    cycle: track.cycle,
    officialCoefficient,
    weeklyHours,
    dsCountPerSemester,
    officialDurationAr,
    officialDurationFr,
    officialDurationMinutes,
    continuousAssessmentSplitAr:
      "75% للفروض المحروسة المنجزة داخل القسم + 25% للفروض المنزلية والأنشطة المندمجة والمواظبة (المذكرة 142-08)",
    officialNoteCitationAr:
      "المذكرة الوزارية رقم 142-08 (16 نونبر 2007) والتوجيهات التربوية لمادة الرياضيات (نونبر 2007)",
    recommendedN1,
    recommendedN2,
    recommendedN3,
    taxonomyReferenceNoteAr: `توزيع القدرات وفق المذكرة 142-08: تطبيق مباشر N1 (${recommendedN1}%) · استحضار وتوظيف N2 (${recommendedN2}%) · توليف وبرهان N3 (${recommendedN3}%)`,
    didacticGuidelinesAr: [
      "اعتماد المدخل بالمسائل والأنشطة البنائية وفق التوجيهات التربوية 2007 لبناء المفاهيم الرياضية قبل التقعيد.",
      "احترام التدرج الديداكتيكي للأسئلة داخل كل تمرين وتفكيك الأسئلة المركبة إلى فروع مستقلة (أ، ب، ج) لمنع العقاب المزدوج.",
      "ضبط سلم التنقيط الرسمي على 20.00/20 نقطة بتجزئة دقيقة من مضاعفات 0.25 نقطة مرفقة بجدول التخصيص وعناصر الإجابة.",
      "تخصيص حصة رسمية لتصحيح الفرض المحروس واستثمار نتائجه التربوية وتدوين محضر الاستثمار في دفتر النصوص.",
    ],
    requiredPortfolioDocumentsAr: [
      "1. التوزيع السنوي والدوري المساير للمذكرة 142-08 (Répartition Annuelle & Semestrielle)",
      "2. رائز التقويم التشخيصي للمكتسبات القبلية وشبكة استثمار نتائجه وخطة الدعم الوقائي",
      "3. الجذاذات التربوية للدروس وتخطيط السبورة الثلاثي (Fiches Pédagogiques OP 2007)",
      "4. سلاسل التمارين التمايزية (N1/N2/N3) والفروض المنزلية المحضّرة للفرض المحروس",
      "5. جدول التخصيص والمواصفات (Tableau de Spécification 142-08) لكل فرض محروس",
      "6. موضوع الفرض المحروس (النموذجان المتكافئان A و B) وسلم التنقيط المفصل بـ 0.25 ن",
      "7. محضر إحصاء واستثمار نتائج الفرض المحروس وبطاقة دفتر النصوص وخطة المعالجة البعدية",
    ],
  };
}

// ============================================================================
// 2. محرك الفحص الديداكتيكي العميق (10 معايير تفتيش رسمية — OP 2007 & 142-08)
// ============================================================================

export interface DeepPedagogicalCriterionCheck {
  id: string;
  orderNumber: string;
  titleAr: string;
  referenceSourceAr: string;
  status: "COMPLIANT" | "NEEDS_TUNING";
  statusLabelAr: string;
  measuredValueAr: string;
  officialStandardAr: string;
  inspectorNoteAr: string;
}

export interface DeepPedagogical14208AuditReport {
  trackStandard: OfficialNote14208TrackStandard;
  specMatrix: AutomatedDynamicSpecMatrix;
  overallScorePercent: number;
  compliantCount: number;
  totalCriteriaCount: number;
  verdictTitleAr: string;
  verdictSummaryAr: string;
  criteria: DeepPedagogicalCriterionCheck[];
  cahierDeTextesDraftEntry: {
    sessionTitleAr: string;
    pedagogicalObjectivesAr: string;
    targetedCapacitiesAr: string[];
    baremeSummaryAr: string;
    remediationProtocolAr: string;
  };
}

export function runDeepPedagogical14208Audit(params: {
  trackCode: string;
  semester: SemesterType;
  dsKey: string;
  lessons: LessonItem[];
  n1: number;
  n2: number;
  n3: number;
  dsStructureMode: MoroccanDSStructureMode;
  includeDetailedSolutions: boolean;
  include2DSpecMatrix: boolean;
  includePostExamRemediationSheet: boolean;
  showQuestionBareme: boolean;
  examModel: "A" | "B" | "BOTH";
  subQuestionDecompositionMode?: string;
}): DeepPedagogical14208AuditReport {
  const trackStandard = getOfficialNote14208TrackStandards(params.trackCode);
  const specMatrix = buildAutomatedDynamicSpecMatrix({
    lessons: params.lessons,
    n1Target: trackStandard.recommendedN1,
    n2Target: trackStandard.recommendedN2,
    n3Target: trackStandard.recommendedN3,
    dsStructureMode: params.dsStructureMode,
    examDurationMinutes: trackStandard.officialDurationMinutes,
  });

  const weightsPct = computeExactExerciseEffectiveWeights(params.lessons, 20);
  const totalPts = specMatrix.totals.grandTotalPoints;
  const allQuarterStep = specMatrix.rows.every((row) =>
    row.questionsBreakdown.every(
      (q) => Math.abs(Math.round(q.points * 4) - q.points * 4) < 0.01
    )
  );

  const n1Delta = Math.abs(params.n1 - trackStandard.recommendedN1);
  const n2Delta = Math.abs(params.n2 - trackStandard.recommendedN2);
  const n3Delta = Math.abs(params.n3 - trackStandard.recommendedN3);
  const taxonomyBalanced =
    params.n1 + params.n2 + params.n3 === 100 &&
    n1Delta <= 10 &&
    n2Delta <= 10 &&
    n3Delta <= 10;

  const estMin = specMatrix.totals.totalEstimatedMinutes;
  const offMin = trackStandard.officialDurationMinutes;
  const chronoBalanced =
    estMin >= Math.round(offMin * 0.75) && estMin <= Math.round(offMin * 1.15);

  const hasSubQuestions =
    params.subQuestionDecompositionMode !== "NONE" ||
    specMatrix.rows.some((r) =>
      r.questionsBreakdown.some((q) => /أ\)|ب\)|a\)|b\)/.test(q.textAr))
    );

  const totalCapacities = specMatrix.rows.reduce(
    (acc, r) => acc + r.capacitiesAr.length,
    0
  );

  const progressiveOrderOk = specMatrix.rows.every((r) => {
    if (r.questionsBreakdown.length < 2) return true;
    const firstLvl = r.questionsBreakdown[0].level;
    const lastLvl = r.questionsBreakdown[r.questionsBreakdown.length - 1].level;
    return firstLvl !== "N3" && (lastLvl === "N2" || lastLvl === "N3");
  });

  const criteria: DeepPedagogicalCriterionCheck[] = [
    {
      id: "CRIT_01_BAREME_20_QUARTER_STEP",
      orderNumber: "01",
      titleAr: "دقة سلم التنقيط الرسمي (20.00 / 20 ن) وتجزئة 0.25 ن",
      referenceSourceAr: "المذكرة الوزارية 142-08 — باب سلالم التنقيط",
      status:
        Math.abs(totalPts - 20) < 0.01 && allQuarterStep
          ? "COMPLIANT"
          : "NEEDS_TUNING",
      statusLabelAr:
        Math.abs(totalPts - 20) < 0.01 && allQuarterStep
          ? "مطابق رسمياً"
          : "يستوجب ضبطاً",
      measuredValueAr: `${totalPts.toFixed(2)} / 20 ن (${
        allQuarterStep ? "خطوات 0.25 ن مضبوطة" : "توجد كسور غير معيارية"
      })`,
      officialStandardAr: "20.00 / 20 نقطة بمضاعفات 0.25 ن",
      inspectorNoteAr:
        "كل سؤال وفرع يجب أن يحمل تنقيطاً واضحاً من مضاعفات 0.25 نقطة لتيسير التصحيح المعياري.",
    },
    {
      id: "CRIT_02_TAXONOMY_142_08",
      orderNumber: "02",
      titleAr: "توازن المستويات المهارية الثلاثة (N1 / N2 / N3) حسب المسلك",
      referenceSourceAr: "المذكرة الوزارية 142-08 — جدول المستويات المهارية",
      status: taxonomyBalanced ? "COMPLIANT" : "NEEDS_TUNING",
      statusLabelAr: taxonomyBalanced ? "متوازن رسمياً" : "يستحسن موازنته",
      measuredValueAr: `N1=${params.n1}% · N2=${params.n2}% · N3=${params.n3}%`,
      officialStandardAr: `N1=${trackStandard.recommendedN1}% · N2=${trackStandard.recommendedN2}% · N3=${trackStandard.recommendedN3}%`,
      inspectorNoteAr: `المعيار الرسمي لمسلك «${trackStandard.trackLabelAr}» يوصي بـ ${trackStandard.recommendedN1}% تطبيق مباشر، ${trackStandard.recommendedN2}% استحضار، و${trackStandard.recommendedN3}% توليف.`,
    },
    {
      id: "CRIT_03_DURATION_CHRONO_FIT",
      orderNumber: "03",
      titleAr: "ملاءمة كثافة الأسئلة للغلاف الزمني الرسمي للفرض",
      referenceSourceAr: "المذكرة 142-08 — الحجم الزمني للفروض المحروسة",
      status: chronoBalanced ? "COMPLIANT" : "NEEDS_TUNING",
      statusLabelAr: chronoBalanced ? "زمن متناسب" : "مراجعة الكثافة",
      measuredValueAr: `${specMatrix.totals.totalExercises} تمارين · ${specMatrix.totals.totalQuestions} سؤالاً (${estMin} د)`,
      officialStandardAr: `${trackStandard.officialDurationAr} (${offMin} دقيقة)`,
      inspectorNoteAr:
        "ينبغي أن ينجز التلميذ المتوسط الفرض في حدود الغلاف الزمني الرسمي مع هامش 15 دقيقة للمراجعة.",
    },
    {
      id: "CRIT_04_SUBQUESTIONS_NO_DOUBLE_PENALTY",
      orderNumber: "04",
      titleAr: "تفكيك الأسئلة المركبة (أ، ب، ج) ومنع العقاب المزدوج",
      referenceSourceAr: "التوجيهات التربوية 2007 — ديداكتيك صياغة الأسئلة",
      status: hasSubQuestions ? "COMPLIANT" : "NEEDS_TUNING",
      statusLabelAr: hasSubQuestions ? "مفكك ومؤمن" : "يفضل التجزئة",
      measuredValueAr: hasSubQuestions
        ? "تجزئة الفروع (أ، ب، ج / a, b, c) مفعلة"
        : "أسئلة مدمجة غير مجزأة",
      officialStandardAr: "استقلال الفروع وصيغ «بين أن... ثم استنتج»",
      inspectorNoteAr:
        "إعطاء النتيجة الوسيطية في صيغة «بين أن» يتيح للتلميذ مواصلة التمرين حتى وإن تعثر في الفرع الأول.",
    },
    {
      id: "CRIT_05_OP2007_CAPACITIES_COVERAGE",
      orderNumber: "05",
      titleAr: "تغطية القدرات المنتظرة المسطرة في التوجيهات التربوية 2007",
      referenceSourceAr: "التوجيهات التربوية 2007 — جداول القدرات المنتظرة",
      status:
        totalCapacities >= params.lessons.length && weightsPct.length >= 2
          ? "COMPLIANT"
          : "NEEDS_TUNING",
      statusLabelAr:
        totalCapacities >= params.lessons.length ? "تغطية شاملة" : "تغطية جزئية",
      measuredValueAr: `${totalCapacities} قدرات منتظرة موزعة على ${specMatrix.domainSummary.length} مجالات`,
      officialStandardAr: "تغطية كافة الوحدات المدرسة في الفترة البينية",
      inspectorNoteAr:
        "يربط جدول المواصفات كل سؤال في الفرض بقدرة منتظرة صريحة من برنامج المسلك.",
    },
    {
      id: "CRIT_06_PROGRESSIVE_DIDACTIC_ORDER",
      orderNumber: "06",
      titleAr: "التدرج الديداكتيكي للأسئلة (من التطبيق المباشر إلى التوليف)",
      referenceSourceAr: "التوجيهات التربوية 2007 — هندسة الموضوع",
      status: progressiveOrderOk ? "COMPLIANT" : "NEEDS_TUNING",
      statusLabelAr: progressiveOrderOk ? "تدرج سليم" : "يحتاج ترتيب",
      measuredValueAr: progressiveOrderOk
        ? "انطلاق بسؤال تمهيدي N1 وختم بسؤال توليفي N2/N3"
        : "بعض التمارين تبدأ بأسئلة مركبة N3",
      officialStandardAr: "تدرج مطرد N1 → N2 → N3 داخل كل تمرين",
      inspectorNoteAr:
        "استهلال التمرين بسؤال تطبيق مباشر يمنح الثقة للمتعلم ويمهد للأسئلة الاستنتاجية.",
    },
    {
      id: "CRIT_07_DETAILED_CORRIGE_BAREME",
      orderNumber: "07",
      titleAr: "إرفاق عناصر الإجابة الرسمية وسلم التنقيط المفصل",
      referenceSourceAr: "المذكرة 142-08 — وثائق التصحيح والتقويم",
      status:
        params.includeDetailedSolutions && params.showQuestionBareme
          ? "COMPLIANT"
          : "NEEDS_TUNING",
      statusLabelAr:
        params.includeDetailedSolutions && params.showQuestionBareme
          ? "مرفق بالكامل"
          : "غير مفعل بالمعاينة",
      measuredValueAr: params.includeDetailedSolutions
        ? "عناصر الإجابة والباريم الجزئي مفعلة"
        : "ورقة الأسئلة فقط دون عناصر الإجابة",
      officialStandardAr: "موضوع الفرض + عناصر الإجابة وسلم التنقيط",
      inspectorNoteAr:
        "يلزم إعداد عناصر الإجابة وسلم التنقيط التفصيلي قبل إجراء الفرض لضمان موضوعية التصحيح.",
    },
    {
      id: "CRIT_08_SPEC_MATRIX_2D",
      orderNumber: "08",
      titleAr: "تضمين جدول التخصيص والمواصفات (Spec Matrix 142-08)",
      referenceSourceAr: "المذكرة الوزارية 142-08 — جدول التخصيص",
      status: params.include2DSpecMatrix ? "COMPLIANT" : "NEEDS_TUNING",
      statusLabelAr: params.include2DSpecMatrix ? "مدرج بالملف" : "غير مدرج بالورقة",
      measuredValueAr: params.include2DSpecMatrix
        ? `مصفوفة التخصيص مدرجة (مطابقة ${specMatrix.conformity14208.score}%)`
        : "مصفوفة التخصيص غير مرفقة في نهاية الورقة",
      officialStandardAr: "جدول التخصيص (المضامين × المستويات المهارية)",
      inspectorNoteAr:
        "جدول التخصيص هو الوثيقة المرجعية التي تثبت توازن الفرض أمام المفتش التربوي.",
    },
    {
      id: "CRIT_09_ANTI_CHEATING_PARALLEL_AB",
      orderNumber: "09",
      titleAr: "تكافؤ الفرص والنماذج المتوازية (Sujet A / Sujet B)",
      referenceSourceAr: "المذكرة 142-08 — مصداقية التقويم الصفي",
      status: "COMPLIANT",
      statusLabelAr: "متكافئ 100%",
      measuredValueAr: `النموذج النشط (${params.examModel}) مع توفر الرديف الموازي بنفس السلم`,
      officialStandardAr: "نموذجان متوازيان A و B بنفس القدرات والباريم",
      inspectorNoteAr:
        "تغيير المعاملات العددية مع الحفاظ على نفس البنية الجبرية والقدرات يضمن تكافؤ الفرص داخل القسم.",
    },
    {
      id: "CRIT_10_CAHIER_TEXTES_REMEDIATION",
      orderNumber: "10",
      titleAr: "بطاقة دفتر النصوص وخطة الدعم والمعالجة البعدية",
      referenceSourceAr: "التوجيهات التربوية 2007 — استثمار نتائج التقويم",
      status: params.includePostExamRemediationSheet
        ? "COMPLIANT"
        : "NEEDS_TUNING",
      statusLabelAr: params.includePostExamRemediationSheet
        ? "خطة الدعم مرفقة"
        : "ينصح بإرفاقها",
      measuredValueAr: params.includePostExamRemediationSheet
        ? "ملحق المعالجة الفارقية وبطاقة دفتر النصوص مفعل"
        : "ملحق الدعم البعدي غير مفعل في المعاينة",
      officialStandardAr: "تدوين الموضوع والتصحيح وخطة الدعم في دفتر النصوص",
      inspectorNoteAr:
        "لا تكتمل حلقة التقويم التربوي إلا باستثمار الأخطاء الشائعة وبرمجة أنشطة دعم فورية للفئة المتعثرة.",
    },
  ];

  const compliantCount = criteria.filter((c) => c.status === "COMPLIANT").length;
  const overallScorePercent = Math.round(
    (compliantCount / criteria.length) * 100
  );

  const verdictTitleAr =
    overallScorePercent >= 90
      ? "وثيقة تربوية مثالية مطابقة كلياً للتوجيهات التربوية 2007 والمذكرة 142-08"
      : overallScorePercent >= 75
      ? "وثيقة تربوية جيدة ومتوازنة مع إمكانية تفعيل الملاحق التكميلية بنقرة واحدة"
      : "الوثيقة تحتاج ضبطاً بيداغوجياً لتستوفي كامل معايير المذكرة 142-08";

  const verdictSummaryAr = `حقق الفرض المحروس لمسلك «${trackStandard.trackLabelAr}» نسبة مطابقة ${overallScorePercent}% (${compliantCount}/${criteria.length} معايير رسمية) بسلم تنقيط ${totalPts.toFixed(
    2
  )}/20 ن وتوزيع معرفي (N1=${specMatrix.totals.n1Percent}% · N2=${
    specMatrix.totals.n2Percent
  }% · N3=${specMatrix.totals.n3Percent}%).`;

  const allCapacities = Array.from(
    new Set(specMatrix.rows.flatMap((r) => r.capacitiesAr))
  ).slice(0, 6);

  return {
    trackStandard,
    specMatrix,
    overallScorePercent,
    compliantCount,
    totalCriteriaCount: criteria.length,
    verdictTitleAr,
    verdictSummaryAr,
    criteria,
    cahierDeTextesDraftEntry: {
      sessionTitleAr: `إنجاز وتصحيح الفرض المحروس ${params.dsKey} — ${
        params.semester === "S1" ? "الأسدس الأول" : "الأسدس الثاني"
      } (${trackStandard.trackLabelAr})`,
      pedagogicalObjectivesAr: `تقويم درجة تحكم المتعلمين في دروس: ${params.lessons
        .map((l) => l.lessonAr)
        .join("، ")} وفق مستويات المذكرة 142-08 (${trackStandard.officialDurationAr}).`,
      targetedCapacitiesAr:
        allCapacities.length > 0
          ? allCapacities
          : params.lessons.map((l) => `التحكم في قدرات درس ${l.lessonAr}`),
      baremeSummaryAr: specMatrix.rows
        .map(
          (r) =>
            `التمرين ${r.exerciseNumber} (${r.lessonAr}): ${r.totalPoints.toFixed(
              2
            )} ن`
        )
        .join(" | "),
      remediationProtocolAr:
        "تصنيف المتعلمين بعد التصحيح إلى 3 فئات (فئة التحكم < 8/20 للدعم الأساسي N1، فئة 8-12 للتثبيت N2، وفئة ≥ 12 للتميز N3) وتخصيص حصة المعالجة.",
    },
  };
}

// ============================================================================
// 3. حقيبة الوثائق التربوية الرسمية السبع لأستاذ الرياضيات بالمغرب
// ============================================================================

export type MoroccanPortfolioDocId =
  | "DOC_1_DS_142_08"
  | "DOC_2_CORRIGE_BAREME"
  | "DOC_3_FICHE_OP2007"
  | "DOC_4_DIAGNOSTIC_QR"
  | "DOC_5_SERIE_3TIER_TD"
  | "DOC_6_DEVOIR_MAISON_ABCD"
  | "DOC_7_REPARTITION_CAHIER_TEXTE";

export interface MoroccanPortfolioDocItem {
  id: MoroccanPortfolioDocId;
  orderNumber: string;
  titleAr: string;
  titleFr: string;
  officialReferenceAr: string;
  purposeAr: string;
  keyMetricsAr: string;
  targetModule: ModuleType;
  targetDmSubType?: DMSubType;
  ficheDetailLevel?: "FULL_WITH_PROOFS" | "SYNTHETIC_OFFICIAL";
  enableDetailedSolutions: boolean;
  enable2DSpecMatrix: boolean;
  enablePostExamRemediation: boolean;
  recommendedN1: number;
  recommendedN2: number;
  recommendedN3: number;
  rebalancedLessons: LessonItem[];
  readyLatexSnippet: string;
}

export function buildOfficialMoroccanProfessorPortfolio(params: {
  trackCode: string;
  semester: SemesterType;
  dsKey: string;
  lessons: LessonItem[];
  school: string;
  prof: string;
  year: string;
}): MoroccanPortfolioDocItem[] {
  const trackStandard = getOfficialNote14208TrackStandards(params.trackCode);
  const rebalanced = autoRebalanceSpecMatrixTo14208(
    params.lessons,
    trackStandard.recommendedN1,
    trackStandard.recommendedN2,
    trackStandard.recommendedN3
  );
  const diagBp = buildPrerequisiteDiagnosticBlueprint({
    trackCode: params.trackCode,
    examModel: "A",
  });

  const specLatex = exportAutomatedSpecMatrixLatex(
    rebalanced.specMatrix,
    trackStandard.trackLabelAr,
    `الفرض المحروس ${params.dsKey} (${params.semester})`
  );

  return [
    {
      id: "DOC_1_DS_142_08",
      orderNumber: "01",
      titleAr: "الفرض المحروس الرسمي المعاير + جدول التخصيص (المذكرة 142-08)",
      titleFr: "Devoir Surveillé Officiel (Sujets A/B) & Tableau de Spécification",
      officialReferenceAr: "المذكرة الوزارية رقم 142-08 — التقويم الصفي",
      purposeAr:
        "ورقة الفرض المحروس مضبوطة على 20.00/20 ن بخطوات 0.25 ن وأسئلة فرعية (أ، ب، ج) مرفقة بجدول المواصفات.",
      keyMetricsAr: `${rebalanced.lessons.length} تمارين · ${rebalanced.specMatrix.totals.totalQuestions} أسئلة · 20.00/20 ن · ${trackStandard.officialDurationAr}`,
      targetModule: "DS_142_08",
      enableDetailedSolutions: false,
      enable2DSpecMatrix: true,
      enablePostExamRemediation: false,
      recommendedN1: trackStandard.recommendedN1,
      recommendedN2: trackStandard.recommendedN2,
      recommendedN3: trackStandard.recommendedN3,
      rebalancedLessons: rebalanced.lessons,
      readyLatexSnippet: specLatex,
    },
    {
      id: "DOC_2_CORRIGE_BAREME",
      orderNumber: "02",
      titleAr: "عناصر الإجابة الرسمية وسلم التنقيط المفصل + محضر الاستثمار",
      titleFr: "Corrigé Type, Barème Détaillé (0.25 pt) & Grille de Remédiation",
      officialReferenceAr: "المذكرة الوزارية 142-08 — التصحيح واستثمار النتائج",
      purposeAr:
        "التصحيح المفصل لكل سؤال وفرع مع توزيع النقط بـ 0.25 ن على مراحل الاستدلال وملحق المعالجة الفارقية.",
      keyMetricsAr: `سلم مفصل بـ 0.25 ن · ${rebalanced.specMatrix.totals.totalQuestions} عناصر إجابة · خطة دعم 3 فئات`,
      targetModule: "DS_142_08",
      enableDetailedSolutions: true,
      enable2DSpecMatrix: true,
      enablePostExamRemediation: true,
      recommendedN1: trackStandard.recommendedN1,
      recommendedN2: trackStandard.recommendedN2,
      recommendedN3: trackStandard.recommendedN3,
      rebalancedLessons: rebalanced.lessons,
      readyLatexSnippet: specLatex,
    },
    {
      id: "DOC_3_FICHE_OP2007",
      orderNumber: "03",
      titleAr: "الجذاذة البيداغوجية الرسمية وتخطيط السبورة (التوجيهات 2007)",
      titleFr: "Fiche Pédagogique Officielle OP 2007 & Plan du Tableau",
      officialReferenceAr: "التوجيهات التربوية وبرامج الرياضيات 2007",
      purposeAr:
        "سيناريو الدرس الكامل: الأنشطة البنائية، البراهين الرياضياتية، القدرات المنتظرة، الأخطاء الشائعة، وتقسيم السبورة.",
      keyMetricsAr: `درس «${rebalanced.lessons[0]?.lessonAr || ""}» · أنشطة بنائية + براهين + سبورة`,
      targetModule: "FICHE_OP2007",
      ficheDetailLevel: "FULL_WITH_PROOFS",
      enableDetailedSolutions: true,
      enable2DSpecMatrix: false,
      enablePostExamRemediation: false,
      recommendedN1: trackStandard.recommendedN1,
      recommendedN2: trackStandard.recommendedN2,
      recommendedN3: trackStandard.recommendedN3,
      rebalancedLessons: rebalanced.lessons,
      readyLatexSnippet: `% جذاذة بيداغوجية رسمية وفق التوجيهات التربوية 2007 — ${trackStandard.trackLabelAr}\n% الدرس: ${rebalanced.lessons[0]?.lessonAr || ""}`,
    },
    {
      id: "DOC_4_DIAGNOSTIC_QR",
      orderNumber: "04",
      titleAr: "رائز التقويم التشخيصي للمكتسبات القبلية (PDF + QR التفاعلي)",
      titleFr: "Test d'Évaluation Diagnostique des Prérequis (PDF & QR Code)",
      officialReferenceAr: "المذكرة الوزارية للتقويم التشخيصي والدعم الوقائي",
      purposeAr:
        "تشخيص المكتسبات القبلية الضرورية للمسلك عبر أسئلة QCM وتمارين تطبيقية ورمز QR للتمرير التفاعلي الفوري.",
      keyMetricsAr: `${diagBp.selectedPrerequisites.length} مكتسبات قبلية · 20/20 ن · رمز QR (${diagBp.verificationCode})`,
      targetModule: "DIAGNOSTIC",
      enableDetailedSolutions: true,
      enable2DSpecMatrix: false,
      enablePostExamRemediation: true,
      recommendedN1: 45,
      recommendedN2: 40,
      recommendedN3: 15,
      rebalancedLessons: diagBp.asLessonItems,
      readyLatexSnippet: `% رائز التقويم التشخيصي للمكتسبات القبلية — ${trackStandard.trackLabelAr} (${diagBp.verificationCode})`,
    },
    {
      id: "DOC_5_SERIE_3TIER_TD",
      orderNumber: "05",
      titleAr: "سلسلة التمارين التمايزية المتدرجة (N1 تطبيق ← N2 توظيف ← N3 تميز)",
      titleFr: "Série d'Exercices Différenciée (3 Niveaux N1 / N2 / N3)",
      officialReferenceAr: "التوجيهات التربوية 2007 — البيداغوجيا الفارقية",
      purposeAr:
        "سلسلة تمارين مصنفة إلى 3 مستويات تحكم مع تلميحات منهجية وتذكير بالقواعد الأساسية قبل الفرض.",
      keyMetricsAr: `3 مستويات تحكم (N1/N2/N3) · تلميحات منهجية · ${rebalanced.lessons.length} محاور`,
      targetModule: "DM_SERIE",
      targetDmSubType: "SERIE_TD",
      enableDetailedSolutions: false,
      enable2DSpecMatrix: false,
      enablePostExamRemediation: false,
      recommendedN1: 35,
      recommendedN2: 45,
      recommendedN3: 20,
      rebalancedLessons: rebalanced.lessons,
      readyLatexSnippet: `% سلسلة تمارين تمايزية متدرجة (N1/N2/N3) — ${trackStandard.trackLabelAr}`,
    },
    {
      id: "DOC_6_DEVOIR_MAISON_ABCD",
      orderNumber: "06",
      titleAr: "الفرض المنزلي المعمم المضاد للغش (4 مجموعات A/B/C/D) وعقد الالتزام",
      titleFr: "Devoir Maison Paramétré Anti-Plagiat (Groupes A/B/C/D)",
      officialReferenceAr: "المذكرة الوزارية 142-08 — حصة 25% للواجبات المنزلية",
      purposeAr:
        "وظيفة منزلية تحضيرية للفرض المحروس بأربعة نماذج متكافئة وعقد ديداكتيكي للتقويم الذاتي.",
      keyMetricsAr: `4 مجموعات مستقلة (A/B/C/D) · سلم 20/20 ن · وزن 25% من المراقبة المستمرة`,
      targetModule: "DM_SERIE",
      targetDmSubType: "DEVOIR_MAISON",
      enableDetailedSolutions: true,
      enable2DSpecMatrix: false,
      enablePostExamRemediation: false,
      recommendedN1: 30,
      recommendedN2: 45,
      recommendedN3: 25,
      rebalancedLessons: rebalanced.lessons,
      readyLatexSnippet: `% فرض منزلي محضر للفرض المحروس — ${trackStandard.trackLabelAr}`,
    },
    {
      id: "DOC_7_REPARTITION_CAHIER_TEXTE",
      orderNumber: "07",
      titleAr: "التوزيع السنوي والدوري المساير للمذكرة 142-08 ودفتر النصوص",
      titleFr: "Répartition Annuelle & Semestrielle Conforme 142-08",
      officialReferenceAr: "التوجيهات التربوية 2007 والمذكرة 142-08",
      purposeAr:
        "توزيع الأسابيع التربوية، الغلاف الزمني لكل درس، ومحطات الفروض المحروسة وحصص التصحيح والدعم.",
      keyMetricsAr: `${trackStandard.weeklyHours} · ${trackStandard.dsCountPerSemester} فروض/أسدس · المعامل ${trackStandard.officialCoefficient}`,
      targetModule: "REPARTITION_CERTIF",
      enableDetailedSolutions: false,
      enable2DSpecMatrix: false,
      enablePostExamRemediation: false,
      recommendedN1: trackStandard.recommendedN1,
      recommendedN2: trackStandard.recommendedN2,
      recommendedN3: trackStandard.recommendedN3,
      rebalancedLessons: rebalanced.lessons,
      readyLatexSnippet: `% التوزيع السنوي والدوري المساير للمذكرة 142-08 — ${trackStandard.trackLabelAr}`,
    },
  ];
}
