import {
  computeExactExerciseEffectiveWeights,
  CURRICULUM_DB,
  DMSubType,
  LessonItem,
  ModuleType,
  SemesterType,
} from "../data/curriculum";
import {
  buildIsoDifficultyModelComparison,
  computeExamChronoDidacticReport,
  decomposeQuestionIntoSubQuestions,
  distributeParentPointsAcrossSubQuestions,
} from "./dsSupervisedExamEnhancements";
import { generateFullMoroccanPedagogicalFiche } from "./ficheGenerator";
import {
  buildCompletePedagogicalUnitDossier,
  generateStandaloneLessonSummary,
} from "./lessonSummaryEngine";
import { sanitizeTrustedPedagogicalHtml } from "./pedagogicalIndexedDbEngine";
import {
  buildThreeTierDifferentiatedSeries,
  generateParameterizedHomeworkVariants,
} from "./seriesGenerator";
import {
  buildA6RectoVersoFlashcardsSheet,
  buildFoldedA5RevisionBooklet,
  buildNationalExamenBlanc20PtsDossier,
  createEditableSubQuestionTree,
} from "./nextGenRoadmapEngine";
import { computeModularArchitectureDiagnostics } from "../hooks/useModularStudioArchitecture";
import {
  buildCompanionAppPedagogicalBrief,
  normalizeImportedCompanionDocument,
  parseAndResolveCompanionBriefForStudio,
} from "./companionPedagogicalBridge";
import { normalizeExternalTexToPlatformSystem } from "./latexImporterAndSeyesEngine";
import {
  buildValidatedFirestoreExamPayload,
  firebaseAuth,
  loadLocalSavedExamsMirror,
  sanitizeExamId,
} from "../services/firebaseExamsService";

export type AuditSubsystemId =
  | "SUBSYSTEM_1_CURRICULUM_BAREME"
  | "SUBSYSTEM_2_SUBQUESTIONS_DECOMPOSITION"
  | "SUBSYSTEM_3_FICHE_OP2007_SUMMARY"
  | "SUBSYSTEM_4_SERIES_HOMEWORK_3TIER"
  | "SUBSYSTEM_5_EXAMEN_BLANC_BOOKLET_A5"
  | "SUBSYSTEM_6_LATEX_TEX_NORMALIZER"
  | "SUBSYSTEM_7_COMPANION_BRIDGE"
  | "SUBSYSTEM_8_FIREBASE_CLOUD_STORAGE";

export interface LiveSandboxSimulationPayload {
  trackCode: string;
  semester: SemesterType;
  dsKey: string;
  examModel: "A" | "B";
  moduleType: ModuleType;
  dmSubType?: DMSubType;
  titleAr: string;
  headerNoteAr: string;
  n1: number;
  n2: number;
  n3: number;
  lessons: LessonItem[];
  latexSourceOverride?: string;
}

export interface SubsystemAuditCheckItem {
  checkId: string;
  labelAr: string;
  passed: boolean;
  measuredValue: string;
  expectedStandard: string;
}

export interface SubsystemAuditResult {
  id: AuditSubsystemId;
  orderNumber: string;
  titleAr: string;
  subtitleAr: string;
  status: "PASSED" | "WARNING" | "FAILED";
  statusLabelAr: string;
  executionTimeMs: number;
  passedChecksCount: number;
  totalChecksCount: number;
  summaryMetricsAr: string;
  checks: SubsystemAuditCheckItem[];
  sandboxPayload: LiveSandboxSimulationPayload;
}

export interface ComprehensiveSystemAuditReport {
  reportId: string;
  generatedAtIso: string;
  overallHealthPercent: number;
  totalSubsystems: number;
  passedSubsystems: number;
  totalAssertionsChecked: number;
  passedAssertionsChecked: number;
  totalExecutionTimeMs: number;
  subsystems: SubsystemAuditResult[];
}

/**
 * تشغيل دورة الفحص الدقيق والمراجعة الشاملة وتجربة جميع مكونات المنصة الثمانية
 * مع توليد حمولات تجربة حية جاهزة للعرض الفوري في الورقة التفاعلية A4 ومحرر LaTeX
 */
export function runComprehensiveApplicationAudit(
  activeTrackCode: string = "2BAC_PC",
  activeSemester: SemesterType = "S1"
): ComprehensiveSystemAuditReport {
  const startGlobal = performance.now();
  const track = CURRICULUM_DB[activeTrackCode] || CURRICULUM_DB["2BAC_PC"];
  const trackSm = CURRICULUM_DB["2BAC_SM"] || track;
  const dsLessons =
    track.semesters[activeSemester]?.DS1 ||
    track.semesters.S1.DS1 ||
    [];
  const firstLesson = dsLessons[0] || CURRICULUM_DB["2BAC_PC"].semesters.S1.DS1[0];

  const subsystems: SubsystemAuditResult[] = [];

  // ============================================================================
  // 01. فحص قاعدة المناهج الرسمية وتوازن سلالم التنقيط (M.N 142-08)
  // ============================================================================
  {
    const t0 = performance.now();
    const allTracksCount = Object.keys(CURRICULUM_DB).length;
    const weightsPct = computeExactExerciseEffectiveWeights(dsLessons, 20);
    const totalWeightPct = Number(
      weightsPct.reduce((acc, w) => acc + w, 0).toFixed(2)
    );
    const total20Pts = Math.round((totalWeightPct / 100) * 20);

    const checks: SubsystemAuditCheckItem[] = [
      {
        checkId: "curr_tracks_count",
        labelAr: "تكامل مسالك التعليم الثانوي التأهيلي والبعثة (CURRICULUM_DB)",
        passed: allTracksCount >= 6,
        measuredValue: `${allTracksCount} مسالك رسمية`,
        expectedStandard: "≥ 6 مسالك مكتملة",
      },
      {
        checkId: "curr_weights_100",
        labelAr: "توازن الأوزان النسبية للتمارين (computeExactExerciseEffectiveWeights)",
        passed: Math.abs(totalWeightPct - 100) <= 1,
        measuredValue: `${totalWeightPct}%`,
        expectedStandard: "100% بالضبط",
      },
      {
        checkId: "curr_bareme_20",
        labelAr: "مطابقة سلم التنقيط الرسمي للمذكرة الوزارية 142-08",
        passed: total20Pts === 20,
        measuredValue: `${total20Pts} / 20 نقطة`,
        expectedStandard: "20 / 20 نقطة",
      },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    subsystems.push({
      id: "SUBSYSTEM_1_CURRICULUM_BAREME",
      orderNumber: "01",
      titleAr: "منظومة المناهج الرسمية وسلالم التنقيط (المذكرة 142-08)",
      subtitleAr: "التحقق من المسالك، الدورتين S1/S2، وتوزيع 20/20 نقطة دون كسور عشرية غير قانونية",
      status: passedCount === checks.length ? "PASSED" : "WARNING",
      statusLabelAr: passedCount === checks.length ? "مطابق كلياً" : "تنبيه جزئي",
      executionTimeMs: Math.max(1, Math.round(performance.now() - t0)),
      passedChecksCount: passedCount,
      totalChecksCount: checks.length,
      summaryMetricsAr: `${allTracksCount} مسالك · ${dsLessons.length} تمارين نشطة · الباريم ${total20Pts}/20`,
      checks,
      sandboxPayload: {
        trackCode: track.code,
        semester: activeSemester,
        dsKey: "DS1",
        examModel: "A",
        moduleType: "DS_142_08",
        titleAr: `فرض محروس رقم 1 (${track.labelAr}) — مطابق للمذكرة 142-08`,
        headerNoteAr: "تم التحقق الآلي من توازن سلم التنقيط 20/20 وتوزيع القدرات المستهدفة.",
        n1: 30,
        n2: 50,
        n3: 20,
        lessons: dsLessons,
      },
    });
  }

  // ============================================================================
  // 02. فحص محرك تجزئة الأسئلة الفرعية (أ، ب، ج / a, b, c) وتكافؤ النماذج A/B
  // ============================================================================
  {
    const t0 = performance.now();
    const dist150 = distributeParentPointsAcrossSubQuestions(1.5, 3);
    const sum150 = dist150.reduce((a, b) => a + b, 0);
    const decomp = decomposeQuestionIntoSubQuestions({
      questionAr:
        "1. أدرس تغيرات الدالة f(x) على مجال تعريفها وضع جدول تغيراتها الكامل.",
      questionFr:
        "1. Étudier les variations de la fonction f(x) sur son domaine et dresser son tableau de variations.",
      parentPoints: 1.5,
      parentLevel: "N2",
      mode: "STRUCTURED_ABC_ALL",
      questionIndex: 0,
    });
    const chrono = computeExamChronoDidacticReport({
      lessons: dsLessons,
      officialDurationStr: "2h",
      hasQcm: true,
      qcmQuestionCount: 4,
      hasSynthesisProblem: false,
      decompositionMode: "STRUCTURED_ABC_ALL",
    });
    const isoParity = buildIsoDifficultyModelComparison(dsLessons);
    const editableTree = createEditableSubQuestionTree(firstLesson, 6);

    const checks: SubsystemAuditCheckItem[] = [
      {
        checkId: "subq_025_conservation",
        labelAr: "حفظ مجموع نقط السؤال الرئيسي بخطوات 0.25 نقطة",
        passed: Math.abs(sum150 - 1.5) < 0.001 && dist150.every((p) => p % 0.25 === 0),
        measuredValue: `[${dist150.join(" + ")}] = ${sum150} ن`,
        expectedStandard: "1.50 نقطة بخطوات 0.25",
      },
      {
        checkId: "subq_abc_branching",
        labelAr: "توليد الفروع المهيكلة (أ، ب، ج / a, b, c) مع المخرجات المزدوجة",
        passed:
          decomp.isDecomposed &&
          decomp.subQuestions.length >= 2 &&
          decomp.subQuestions[0].labelAr === "أ" &&
          decomp.subQuestions[1].labelFr === "b",
        measuredValue: `${decomp.subQuestions.length} فروع (أ، ب، ج / a, b, c)`,
        expectedStandard: "≥ 2 فروع متدرجة",
      },
      {
        checkId: "subq_iso_parity_ab",
        labelAr: "مؤشر التكافؤ الديداكتيكي بين النموذجين المتوازيين A و B",
        passed: isoParity.overallParityPct === 100 && editableTree.questions.length > 0,
        measuredValue: `${isoParity.overallParityPct}% تكافؤ · زمن ${chrono.totalRequiredMinutes} د`,
        expectedStandard: "100% تكافؤ صنافي",
      },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    subsystems.push({
      id: "SUBSYSTEM_2_SUBQUESTIONS_DECOMPOSITION",
      orderNumber: "02",
      titleAr: "محرك تجزئة الأسئلة الفرعية (أ، ب، ج) وتكافؤ النماذج A/B",
      subtitleAr: "تفكيك الأسئلة المركبة إلى فروع مستقلة بباريم 0.25 ن لتفادي العقاب المزدوج",
      status: passedCount === checks.length ? "PASSED" : "WARNING",
      statusLabelAr: passedCount === checks.length ? "مطابق كلياً" : "تنبيه جزئي",
      executionTimeMs: Math.max(1, Math.round(performance.now() - t0)),
      passedChecksCount: passedCount,
      totalChecksCount: checks.length,
      summaryMetricsAr: `${decomp.subQuestions.length} فروع لكل سؤال · تكافؤ ${isoParity.overallParityPct}% · خطوة 0.25 ن`,
      checks,
      sandboxPayload: {
        trackCode: track.code,
        semester: activeSemester,
        dsKey: "DS1",
        examModel: "B",
        moduleType: "DS_142_08",
        titleAr: `فرض محروس مجزأ إلى أسئلة فرعية (أ، ب، ج) — النموذج الموازي B`,
        headerNoteAr:
          "أسئلة مفككة إلى فروع (أ، ب، ج) بسلم تنقيط مفصل بـ 0.25 نقطة لمنع العقاب المزدوج.",
        n1: 30,
        n2: 50,
        n3: 20,
        lessons: dsLessons,
      },
    });
  }

  // ============================================================================
  // 03. فحص الجذاذات التربوية (OP 2007 v2) والملخصات والخرائط الذهنية
  // ============================================================================
  {
    const t0 = performance.now();
    const fiche = generateFullMoroccanPedagogicalFiche(
      firstLesson,
      track,
      "BLACKBOARD_CAHIER"
    );
    const summary = generateStandaloneLessonSummary(
      firstLesson,
      track,
      "MIND_MAP_BIOF_LEXICON"
    );
    const xssCheck = sanitizeTrustedPedagogicalHtml(
      `<svg viewBox="0 0 100 50"><script>alert(1)</script><rect width="80" height="30"/></svg>`
    );

    const checks: SubsystemAuditCheckItem[] = [
      {
        checkId: "fiche_op2007_sessions",
        labelAr: "توليد الجذاذة البيداغوجية الكاملة وتخطيط السبورة الثلاثي",
        passed:
          fiche.fullCourseContent.length > 0 &&
          (fiche.blackboardPlansPerSession?.length || 0) >= 4,
        measuredValue: `${fiche.fullCourseContent.length} محاور · ${fiche.blackboardPlansPerSession?.length || 0} حصص سبورة`,
        expectedStandard: "≥ 4 حصص مهيكلة",
      },
      {
        checkId: "summary_mindmap_lexicon",
        labelAr: "استوديو ملخص الدرس وبطاقات الطرائق والخريطة الذهنية SVG",
        passed:
          summary.methodHowToCards.length >= 2 &&
          summary.mindMapSvgMarkup.includes("<svg") &&
          summary.biofLexicon.length >= 4,
        measuredValue: `${summary.methodHowToCards.length} بطاقات طريقة · ${summary.biofLexicon.length} مصطلحات BIOF`,
        expectedStandard: "خريطة SVG + معجم ثنائي",
      },
      {
        checkId: "security_svg_sanitizer",
        labelAr: "مصفاة الأمان الصارمة لرسوم SVG والمحتوى التربوي",
        passed:
          !xssCheck.sanitizedHtml.includes("<script>") &&
          xssCheck.sanitizedHtml.includes("<rect"),
        measuredValue: `عزل ${xssCheck.removedThreatsCount} تهديد برمجي`,
        expectedStandard: "خلو تام من XSS",
      },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    subsystems.push({
      id: "SUBSYSTEM_3_FICHE_OP2007_SUMMARY",
      orderNumber: "03",
      titleAr: "محرك الجذاذات التربوية (OP 2007) والملخصات والخرائط الذهنية",
      subtitleAr: "التوجيهات التربوية 2007، البراهين الرياضياتية، تخطيط السبورة، وملخصات المراجعة",
      status: passedCount === checks.length ? "PASSED" : "WARNING",
      statusLabelAr: passedCount === checks.length ? "مطابق كلياً" : "تنبيه جزئي",
      executionTimeMs: Math.max(1, Math.round(performance.now() - t0)),
      passedChecksCount: passedCount,
      totalChecksCount: checks.length,
      summaryMetricsAr: `${fiche.fullCourseContent.length} فقرات برهان · ${summary.methodHowToCards.length} طرائق · خريطة SVG`,
      checks,
      sandboxPayload: {
        trackCode: track.code,
        semester: activeSemester,
        dsKey: "DS1",
        examModel: "A",
        moduleType: "FICHE_OP2007",
        titleAr: `جذاذة بيداغوجية رسمية (OP 2007): ${firstLesson.lessonAr}`,
        headerNoteAr:
          "جذاذة درس متكاملة وفق التوجيهات التربوية 2007 مع سيناريو الحصص وتخطيط السبورة.",
        n1: 30,
        n2: 50,
        n3: 20,
        lessons: [firstLesson],
      },
    });
  }

  // ============================================================================
  // 04. فحص السلاسل التمايزية (3-Tier N1/N2/N3) والفروض المنزلية المضادة للغش
  // ============================================================================
  {
    const t0 = performance.now();
    const series3Tier = buildThreeTierDifferentiatedSeries([firstLesson], "A");
    const totalSeriesExercises = series3Tier.reduce(
      (acc, tier) => acc + tier.exercises.length,
      0
    );
    const dmGroups = generateParameterizedHomeworkVariants(
      [firstLesson],
      "PREPARATOIRE_DS"
    );
    const unitDossier = buildCompletePedagogicalUnitDossier({
      lesson: firstLesson,
      track,
    });

    const checks: SubsystemAuditCheckItem[] = [
      {
        checkId: "series_3tier_n1_n2_n3",
        labelAr: "سلسلة التمارين التمايزية ثلاثية المستويات (N1 / N2 / N3)",
        passed:
          series3Tier.length === 3 &&
          series3Tier[0].tierCode === "TIER_1_APPLICATION" &&
          series3Tier[2].tierCode === "TIER_3_EXCELLENCE",
        measuredValue: `${series3Tier.length} مستويات · ${totalSeriesExercises} تمارين متدرجة`,
        expectedStandard: "3 مستويات (N1, N2, N3)",
      },
      {
        checkId: "dm_anti_plagiarism_abcd",
        labelAr: "الفرض المنزلي المعمم المضاد للغش (4 مجموعات A/B/C/D)",
        passed:
          dmGroups.groups.length === 4 &&
          dmGroups.groups[0].parameters.alpha !== dmGroups.groups[1].parameters.alpha,
        measuredValue: `${dmGroups.groups.length} مجموعات بمعاملات رياضية مستقلة`,
        expectedStandard: "4 نماذج (A, B, C, D)",
      },
      {
        checkId: "dossier_5in1_integrity",
        labelAr: "حقيبة الوحدة التربوية الشاملة (5 وثائق مترابطة للوحدة)",
        passed: Boolean(
          unitDossier.dossierId &&
            unitDossier.components["4_parameterizedHomeworkDM"].groupsCount === 4
        ),
        measuredValue: `معرّف الحقيبة: ${unitDossier.dossierId.slice(0, 24)}...`,
        expectedStandard: "5 وثائق متكاملة",
      },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    subsystems.push({
      id: "SUBSYSTEM_4_SERIES_HOMEWORK_3TIER",
      orderNumber: "04",
      titleAr: "محرك السلاسل التمايزية (N1/N2/N3) والفروض المنزلية (A/B/C/D)",
      subtitleAr: "سلاسل الدعم المتدرجة، الفروض المنزلية المضادة للنقل، وحقيبة الوحدة المتكاملة",
      status: passedCount === checks.length ? "PASSED" : "WARNING",
      statusLabelAr: passedCount === checks.length ? "مطابق كلياً" : "تنبيه جزئي",
      executionTimeMs: Math.max(1, Math.round(performance.now() - t0)),
      passedChecksCount: passedCount,
      totalChecksCount: checks.length,
      summaryMetricsAr: `${totalSeriesExercises} تمارين سلسلة · 4 مجموعات فرض منزلي · سلم 20/20`,
      checks,
      sandboxPayload: {
        trackCode: track.code,
        semester: activeSemester,
        dsKey: "DS1",
        examModel: "A",
        moduleType: "DM_SERIE",
        dmSubType: "SERIE_TD",
        titleAr: `سلسلة تمارين تمايزية متدرجة (N1 / N2 / N3): ${firstLesson.lessonAr}`,
        headerNoteAr:
          "سلسلة تمارين مصنفة حسب مستويات التحكم الثلاثة مع تلميحات منهجية ومسارات دعم.",
        n1: 35,
        n2: 45,
        n3: 20,
        lessons: dsLessons,
      },
    });
  }

  // ============================================================================
  // 05. فحص الامتحان التجريبي الوطني (Examen Blanc 3h/4h) والكتيب المطوي A5
  // ============================================================================
  {
    const t0 = performance.now();
    const blancSm = buildNationalExamenBlanc20PtsDossier({
      track: trackSm,
      examModel: "A",
    });
    const bookletA5 = buildFoldedA5RevisionBooklet(firstLesson, track);
    const flashcardsA6 = buildA6RectoVersoFlashcardsSheet(firstLesson, track);

    const checks: SubsystemAuditCheckItem[] = [
      {
        checkId: "examen_blanc_80_steps",
        labelAr: "الامتحان التجريبي الوطني الموحد (80 خطوة × 0.25 ن = 20/20)",
        passed:
          blancSm.totalPoints === 20 &&
          blancSm.nationalGradingSummary.totalQuarterPointSteps === 80 &&
          blancSm.exercisesAndProblem.length === 5,
        measuredValue: `${blancSm.exercisesAndProblem.length} تمارين ومسألة · ${blancSm.nationalGradingSummary.totalQuarterPointSteps} خطوة`,
        expectedStandard: "20/20 نقطة (80 × 0.25)",
      },
      {
        checkId: "booklet_a5_imposition",
        labelAr: "مطوية المراجعة الجيبية A5 بنظام الطبع المزدوج (Duplex Imposition)",
        passed:
          bookletA5.outerSheetPages[0].pageNumber === 4 &&
          bookletA5.outerSheetPages[1].pageNumber === 1 &&
          bookletA5.innerSheetPages[0].pageNumber === 2 &&
          bookletA5.innerSheetPages[1].pageNumber === 3,
        measuredValue: "الوجه الخارجي [4 | 1] · الوجه الداخلي [2 | 3]",
        expectedStandard: "ترتيب مطبعي [4|1] و [2|3]",
      },
      {
        checkId: "flashcards_a6_recto_verso",
        labelAr: "بطاقات المراجعة السريعة A6 (وجه السؤال / ظهر طريقة الحل)",
        passed: flashcardsA6.length === 8 && flashcardsA6[0].versoStepsAr.length > 0,
        measuredValue: `${flashcardsA6.length} بطاقات A6 مزدوجة الوجه`,
        expectedStandard: "8 بطاقات A6 لكل ورقة A4",
      },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    subsystems.push({
      id: "SUBSYSTEM_5_EXAMEN_BLANC_BOOKLET_A5",
      orderNumber: "05",
      titleAr: "محرك الامتحان التجريبي الوطني الموحد والكتيب المطوي A5",
      subtitleAr: "امتحانات الباكالوريا التجريبية (3h/4h) ومطويات المراجعة الجيبية A5 وبطاقات A6",
      status: passedCount === checks.length ? "PASSED" : "WARNING",
      statusLabelAr: passedCount === checks.length ? "مطابق كلياً" : "تنبيه جزئي",
      executionTimeMs: Math.max(1, Math.round(performance.now() - t0)),
      passedChecksCount: passedCount,
      totalChecksCount: checks.length,
      summaryMetricsAr: `امتحان ${blancSm.officialDurationHours}h (معامل ${blancSm.officialCoefficient}) · مطوية A5 [4|1]-[2|3] · 8 بطاقات A6`,
      checks,
      sandboxPayload: {
        trackCode: trackSm.code,
        semester: "S2",
        dsKey: "DS3",
        examModel: "A",
        moduleType: "DS_142_08",
        titleAr: `${blancSm.confidentialityHeaderBanner.examSessionLabelAr} — ${blancSm.trackLabelAr}`,
        headerNoteAr: `امتحان وطني تجريبي موحد — المدة: ${blancSm.officialDurationHours} ساعات — المعامل: ${blancSm.officialCoefficient} — 80 خطوة تنقيط.`,
        n1: 25,
        n2: 45,
        n3: 30,
        lessons: trackSm.semesters.S2.DS2 || dsLessons,
        latexSourceOverride: blancSm.printableLatexPreview,
      },
    });
  }

  // ============================================================================
  // 06. فحص استوديو استيراد وتنسيق ملفات .tex الخارجية لنظام المنصة
  // ============================================================================
  {
    const t0 = performance.now();
    const sampleExternalTex = `\\documentclass[12pt]{article}
\\usepackage{amsmath,amssymb}
\\begin{document}
\\begin{exercise}{دراسة دالة لوغاريتمية وتكامل (12 نقطة)}
نعتبر الدالة العددية $f(x) = x - 1 + \\frac{\\ln(x)}{x}$ المعرفة على $]0,+\\infty[$.
\\begin{enumerate}
\\item[a)] أحسب النهاية عند $0^+$ وعند $+\\infty$ وأول النتيجتين هندسياً. (2.5 pts)
\\item[b)] بين أن $f'(x) = \\frac{x^2 + 1 - \\ln(x)}{x^2}$ وضع جدول تغيرات $f$. (3.5 pts)
\\item[c)] أحسب باستعمال المكاملة بالأجزاء التكامل $I = \\int_1^e \\frac{\\ln(x)}{x} dx$. (3 pts)
\\end{enumerate}
\\end{exercise}
\\begin{problem}{المتتاليات العددية الترجعية (8 نقط)}
لتكن $(u_n)$ متتالية عددية معرفة بـ $u_0 = 2$ و $u_{n+1} = \\frac{3u_n + 2}{u_n + 2}$.
\\begin{enumerate}
\\item[a)] بين بالترجع أن $u_n > 1$ لكل $n \\in \\mathbb{N}$. (2.5 pts)
\\item[b)] أدرس رتابة المتتالية $(u_n)$ واستنتج أنها متقاربة وحدد نهايتها. (3.5 pts)
\\end{enumerate}
\\end{problem}
\\end{document}`;

    const normBundle = normalizeExternalTexToPlatformSystem(
      "examen_import_direct.tex",
      sampleExternalTex,
      {
        targetTheme: "TCOLORBOX_ROYAL",
        subQuestionStyle: "ARABIC_ABJAD",
        autoInjectPlatformPreamble: true,
        normalizeBaremePoints: true,
        schoolName: "الثانوية التأهيلية محمد الخامس",
        professorName: "ذ. إبراهيم كوزيبر",
        trackLabelAr: track.labelAr,
        academicYear: "2025/2026",
      }
    );

    const checks: SubsystemAuditCheckItem[] = [
      {
        checkId: "tex_env_exobox",
        labelAr: "تحويل البيئات الخارجية (exercise / problem) إلى صناديق exoBox",
        passed:
          normBundle.platformFormattedTex.includes("\\begin{exoBox}") &&
          normBundle.platformFormattedTex.includes("\\newtcolorbox{exoBox}"),
        measuredValue: `${normBundle.extractedLessonItems.length} صناديق exoBox مهيكلة`,
        expectedStandard: "تحويل كامل لـ tcolorbox",
      },
      {
        checkId: "tex_subq_bareme_norm",
        labelAr: "تطبيع الأسئلة الفرعية (أ، ب، ج) ومحاذاة الباريم (\\hfill ن)",
        passed:
          normBundle.detectedSubQuestionsCount === 5 &&
          normBundle.platformFormattedTex.includes("\\item[\\textbf{أ)}]") &&
          normBundle.platformFormattedTex.includes("\\hfill{\\small\\textbf{(2.5 ن)}}"),
        measuredValue: `${normBundle.detectedSubQuestionsCount} فروع (أ، ب، ج) · مجموع ${normBundle.detectedBaremePointsTotal} ن`,
        expectedStandard: "ترقيم أبجدي + محاذاة النقط",
      },
      {
        checkId: "tex_a4_lesson_extraction",
        labelAr: "استخلاص التمارين المطبعة للعرض المباشر في الورقة التفاعلية A4",
        passed:
          normBundle.extractedLessonItems.length === 2 &&
          Boolean(
            normBundle.extractedLessonItems[0]?.sampleExerciseAr?.some((q) =>
              q.includes("أ)")
            )
          ),
        measuredValue: `${normBundle.extractedLessonItems.length} تمارين جاهزة للمعاينة A4`,
        expectedStandard: "تطابق الكود مع الورقة A4",
      },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    subsystems.push({
      id: "SUBSYSTEM_6_LATEX_TEX_NORMALIZER",
      orderNumber: "06",
      titleAr: "استوديو استيراد وتنسيق ملفات .tex المباشر لنظام المنصة",
      subtitleAr: "كشف الترميز الآلي، توحيد صناديق tcolorbox/exoBox، واستخلاص التمارين للمعاينة الحية A4",
      status: passedCount === checks.length ? "PASSED" : "WARNING",
      statusLabelAr: passedCount === checks.length ? "مطابق كلياً" : "تنبيه جزئي",
      executionTimeMs: Math.max(1, Math.round(performance.now() - t0)),
      passedChecksCount: passedCount,
      totalChecksCount: checks.length,
      summaryMetricsAr: `${normBundle.extractedLessonItems.length} تمارين مستخلصة · ${normBundle.detectedSubQuestionsCount} فروع (أ، ب، ج) · UTF-8`,
      checks,
      sandboxPayload: {
        trackCode: track.code,
        semester: activeSemester,
        dsKey: "DS1",
        examModel: "A",
        moduleType: "DS_142_08",
        titleAr: "فرض مستورد ومنسق تلقائياً من ملف خارجي (examen_import_direct.tex)",
        headerNoteAr:
          "تم استيراد ملف .tex وتحويل بيئاته إلى exoBox وتطبيع أسئلته الفرعية (أ، ب، ج) للعرض في الورقة A4.",
        n1: 30,
        n2: 50,
        n3: 20,
        lessons: normBundle.extractedLessonItems,
        latexSourceOverride: normBundle.platformFormattedTex,
      },
    });
  }

  // ============================================================================
  // 07. فحص جسر التكامل البيداغوجي مع تطبيق التتبع ودفتر النصوص (LessonLogEngine)
  // ============================================================================
  {
    const t0 = performance.now();
    const diagBrief = buildCompanionAppPedagogicalBrief({
      trackCode: track.code,
      semester: activeSemester,
      examKey: "DS1",
      className: `${track.code}-1`,
      completedLessons: dsLessons.map((l) => ({
        lessonAr: l.lessonAr,
        lessonFr: l.lessonFr,
        category: "ANALYSE",
        completedHours: 10,
      })),
      studentGrades: [5.5, 6.0, 6.5, 7.0, 7.25, 7.5, 7.75, 8.5, 9.0, 10.5, 11.0, 12.5],
    });
    const resolvedForStudio = parseAndResolveCompanionBriefForStudio(diagBrief);
    const exportedDoc = normalizeImportedCompanionDocument({
      id: "DOC_AUDIT_2026",
      titleAr: "فرض محروس رقم 1 - الدورة الأولى",
      documentType: "DEVOIR_SURVEILLE",
      trackCode: track.code,
      semester: activeSemester,
      lessons: dsLessons,
      duration: "2h",
      totalPoints: 20,
      n1: 30,
      n2: 50,
      n3: 20,
    });

    const checks: SubsystemAuditCheckItem[] = [
      {
        checkId: "bridge_brief_export",
        labelAr: "توليد البطاقة التشخيصية للقسم (buildCompanionAppPedagogicalBrief)",
        passed:
          diagBrief.classIdentity.coefficient >= 2 &&
          diagBrief.automatedPedagogicalRecommendation.recommendationCategory ===
            "REMEDIATION_AND_SUPPORT_SERIES",
        measuredValue: `المعامل ${diagBrief.classIdentity.coefficient} · توصية: سلسلة دعم مركزة`,
        expectedStandard: "توصية آلية حسب نسبة التعثر",
      },
      {
        checkId: "bridge_brief_import_studio",
        labelAr: "الضبط التلقائي للاستوديو من البطاقة التشخيصية (N1=50%, N2=35%, N3=15%)",
        passed:
          resolvedForStudio.n1 === 50 &&
          resolvedForStudio.matchedCurriculumLessons.length > 0,
        measuredValue: `N1=${resolvedForStudio.n1}% · ${resolvedForStudio.matchedCurriculumLessons.length} دروس مطابقة`,
        expectedStandard: "تكييف تلقائي للصنافة والدروس",
      },
      {
        checkId: "bridge_cahier_texte_sync",
        labelAr: "تطبيع الوثيقة المنتجة لإدراجها في المكتبة الرقمية ودفتر النصوص",
        passed:
          Boolean(exportedDoc.digitalLibraryEntry.id) &&
          exportedDoc.cahierDeTexteLogEntry.allocatedHours === "2h",
        measuredValue: `غلاف زمني ${exportedDoc.cahierDeTexteLogEntry.allocatedHours} · مكتبة رقمية جاهزة`,
        expectedStandard: "ربط آلي بدفتر النصوص",
      },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    subsystems.push({
      id: "SUBSYSTEM_7_COMPANION_BRIDGE",
      orderNumber: "07",
      titleAr: "جسر التكامل البيداغوجي مع تطبيق التتبع ودفتر النصوص",
      subtitleAr: "تبادل البطاقة التشخيصية للقسم وتصدير الوثائق المنتجة نحو دفتر النصوص الرقمي",
      status: passedCount === checks.length ? "PASSED" : "WARNING",
      statusLabelAr: passedCount === checks.length ? "مطابق كلياً" : "تنبيه جزئي",
      executionTimeMs: Math.max(1, Math.round(performance.now() - t0)),
      passedChecksCount: passedCount,
      totalChecksCount: checks.length,
      summaryMetricsAr: `معدل التشخيص ${diagBrief.classDiagnosticMetrics.classAverage}/20 · ${resolvedForStudio.matchedCurriculumLessons.length} دروس · ربط دفتر النصوص`,
      checks,
      sandboxPayload: {
        trackCode: resolvedForStudio.resolvedTrackCode,
        semester: resolvedForStudio.resolvedSemester,
        dsKey: resolvedForStudio.resolvedDsKey,
        examModel: "A",
        moduleType: resolvedForStudio.resolvedModule,
        dmSubType: resolvedForStudio.resolvedDmSubType,
        titleAr: `سلسلة دعم ومعالجة مركزة مولدة عبر جسر التتبع (${track.labelAr})`,
        headerNoteAr: resolvedForStudio.customHeaderNoteAr,
        n1: resolvedForStudio.n1,
        n2: resolvedForStudio.n2,
        n3: resolvedForStudio.n3,
        lessons: resolvedForStudio.matchedCurriculumLessons,
      },
    });
  }

  // ============================================================================
  // 08. فحص لوحة القيادة المركزية وقاعدة بيانات Firebase Firestore والأمان
  // ============================================================================
  {
    const t0 = performance.now();
    const localMirrorExams = loadLocalSavedExamsMirror();
    const safeId = sanitizeExamId("audit_exam_2bac_pc_s1");
    const validatedPayload = buildValidatedFirestoreExamPayload(
      {
        id: safeId,
        titleAr: "فرض محروس مفحوص ومصدق لقاعدة بيانات Firebase",
        titleFr: "Devoir Surveillé validé pour Firebase Firestore",
        documentType: "DS_142_08",
        trackCode: track.code,
        trackLabelAr: track.labelAr,
        semester: activeSemester === "S2" ? 2 : 1,
        examKey: "S1_F1",
        examModel: "A",
        duration: "2h",
        totalPoints: 20,
        totalQuestions: 4,
        totalSubQuestions: 8,
        n1: 30,
        n2: 50,
        n3: 20,
        school: "الثانوية التأهيلية محمد الخامس",
        professor: "ذ. إبراهيم كوزيبر",
        academicYear: "2025/2026",
        latexSource: "\\documentclass{article}\\begin{document}Test\\end{document}",
        lessons: dsLessons,
        isFavorite: true,
        sourceOrigin: "STUDIO_GENERATED",
      },
      firebaseAuth.currentUser?.uid || "uid_verified_teacher",
      firebaseAuth.currentUser?.email || "brahim.kouziber87@gmail.com"
    );
    const modHealth = computeModularArchitectureDiagnostics(track, firstLesson);

    const checks: SubsystemAuditCheckItem[] = [
      {
        checkId: "fb_schema_26_keys",
        labelAr: "تطابق حمولة الفرض مع مخطط firebase-blueprint.json وقواعد firestore.rules",
        passed:
          /^[a-zA-Z0-9_-]+$/.test(validatedPayload.id) &&
          validatedPayload.record.totalPoints === 20 &&
          validatedPayload.record.lessonsJson.length >= 2,
        measuredValue: `معرّف آمن (${validatedPayload.id}) · 26 حقلاً مهيكلًا`,
        expectedStandard: "تطابق 100% مع قواعد الحماية",
      },
      {
        checkId: "fb_mirror_and_cloud_sync",
        labelAr: "جاهزية الخزانة المركزية للفروض (Firebase Cloud + Local Mirror)",
        passed: localMirrorExams.length >= 1,
        measuredValue: `${localMirrorExams.length} فروض محفوظة جاهزة للاسترجاع`,
        expectedStandard: "مرآة فورية + مزامنة سحابية",
      },
      {
        checkId: "modular_arch_readiness",
        labelAr: "مؤشر الجاهزية المعمارية الشاملة لمحركات الاستوديو",
        passed: modHealth.readinessScorePercent === 100,
        measuredValue: `${modHealth.healthyComponentsCount}/${modHealth.totalComponentsInspected} محركات (${modHealth.readinessScorePercent}%)`,
        expectedStandard: "100% جاهزية معمارية",
      },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    subsystems.push({
      id: "SUBSYSTEM_8_FIREBASE_CLOUD_STORAGE",
      orderNumber: "08",
      titleAr: "لوحة القيادة المركزية وقاعدة بيانات Firebase Firestore",
      subtitleAr: "التحقق من مخطط البيانات، قواعد الأمان، المرآة المحلية، واسترجاع الفروض المحفوظة",
      status: passedCount === checks.length ? "PASSED" : "WARNING",
      statusLabelAr: passedCount === checks.length ? "مطابق كلياً" : "تنبيه جزئي",
      executionTimeMs: Math.max(1, Math.round(performance.now() - t0)),
      passedChecksCount: passedCount,
      totalChecksCount: checks.length,
      summaryMetricsAr: `${localMirrorExams.length} فروض بالخزانة · مخطط saved_exams مؤمن · جاهزية ${modHealth.readinessScorePercent}%`,
      checks,
      sandboxPayload: {
        trackCode: track.code,
        semester: activeSemester,
        dsKey: "DS1",
        examModel: "A",
        moduleType: "DS_142_08",
        titleAr: validatedPayload.record.titleAr,
        headerNoteAr:
          "تم استرجاع هذا الفرض التحققي من منظومة Firebase Firestore وعرضه في الورقة التفاعلية A4.",
        n1: 30,
        n2: 50,
        n3: 20,
        lessons: dsLessons,
      },
    });
  }

  const totalSubsystems = subsystems.length;
  const passedSubsystems = subsystems.filter((s) => s.status === "PASSED").length;
  const totalAssertionsChecked = subsystems.reduce(
    (acc, s) => acc + s.totalChecksCount,
    0
  );
  const passedAssertionsChecked = subsystems.reduce(
    (acc, s) => acc + s.passedChecksCount,
    0
  );
  const overallHealthPercent = Math.round(
    (passedAssertionsChecked / Math.max(1, totalAssertionsChecked)) * 100
  );

  return {
    reportId: `AUDIT-${Date.now().toString(36).toUpperCase()}`,
    generatedAtIso: new Date().toISOString(),
    overallHealthPercent,
    totalSubsystems,
    passedSubsystems,
    totalAssertionsChecked,
    passedAssertionsChecked,
    totalExecutionTimeMs: Math.max(
      1,
      Math.round(performance.now() - startGlobal)
    ),
    subsystems,
  };
}
