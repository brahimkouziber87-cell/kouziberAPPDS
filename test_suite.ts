import {
  generate3DSpaceGeometryPresetData,
  validateCustomQuestionWithMathJS,
  checkSingleMathExpressionWithMathJS,
  generateFunctionVariationAndCurveData,
  generateSignTableAndDomainData,
  generateRecursiveSequenceCobwebData,
  generateIntegralShadedAreaData,
  detectDoublePenaltyInLessons,
  computeLongitudinalInspectorAnalytics,
  exportExamToMoodleXML,
  DEFAULT_LONGITUDINAL_COHORT_CONFIG
} from './src/utils/mathjsValidator.ts';

import { CURRICULUM_DB, getVariantQuestions, LessonItem } from './src/data/curriculum.ts';
import {
  renderQrSvgString,
  buildHomeworkSolutionLink,
  generateHomeworkAssignmentVerificationCode,
} from './src/utils/qrCodeHelper.ts';
import {
  convertExercisesToInteractiveQuiz,
  evaluateStudentQuiz,
} from './src/utils/quizGenerator.ts';
import {
  calculateReprographicsProductionEstimate,
  DEFAULT_BINDING_AND_CROP_CONFIG,
  buildQuarterPointMicroRubric,
  generateForbiddenValueVariationBundle,
  getAlgebraicCounterExamplesForLessons,
  computeExamChronoPacing,
  generateCorrectionMiniBandeau,
  generateParametricAntiCopyDM,
  generateProgressiveHintsForDM,
  SERIE_DIFFERENTIATED_PATHS,
  buildMicroMemoCapsule,
  generateTriptychBlackboardPlan,
  generateCahierDeTextesSummary,
  verifyFormulaWithCAS,
  diagnoseSampleStudentAttempt,
  buildBiofGlossaryForTrack,
} from './src/utils/reprographicsAndDidacticsEngine.ts';
import { generateCustomCountSerieExercises } from './src/utils/seriesGenerator.ts';
import { generateFullMoroccanPedagogicalFiche } from './src/utils/ficheGenerator.ts';
import {
  cleanLatexDocument,
  SAMPLE_DIRTY_LATEX_WITH_CONFLICTS,
  DEFAULT_CLEANER_OPTIONS,
} from './src/utils/latexPreambleAndSymbolCleaner.ts';
import {
  PRINT_LAYOUT_TEMPLATES,
  getPrintLayoutTemplate,
  DEFAULT_SMART_PAGE_BREAK_CONFIG,
  computeOptimizedPageBreakPlan,
  computeVisualizerOverlayLines,
  BUILT_IN_MARGIN_PRESETS,
  VERTICAL_DENSITY_PRESETS,
  saveCustomMarginPresetToStorage,
  loadCustomMarginPresets,
  DEFAULT_READING_MODE_CONFIG,
  READING_MODE_SCALE_PRESETS,
  READING_MODE_PAPER_TONES,
  READING_MODE_EXERCISE_TYPE_SPECS,
  buildReadingModeExerciseNavigatorItems,
  buildReadingModeStylesheet,
} from './src/utils/printLayoutTemplates.ts';
import {
  detectOmrFiducialAlignmentAndStability,
  preprocessOmrCameraFrameRgba,
  autoGradeScannedOmrSheet,
  regradeScannedStudentResults,
} from './src/utils/sevenStrategicProposalsEngine.ts';
import {
  initializeExerciseSolutionQrs,
  buildExerciseSolutionUrl,
  renderExerciseQrSvg,
} from './src/utils/exerciseSolutionQrEngine.ts';
import { generateOfflineSourceCode } from './src/utils/docGenerator.ts';
import { analyzeFunctionAsymptotesAndCurve } from './src/utils/asymptoteCurveEngine.ts';
import {
  buildCustomEvaluationGrid,
  EVAL_GRID_TEMPLATES_142_08,
  getEvalGridTemplateById,
  createCustomConfigFromTemplate,
  applyEvalGridCustomConfigToGridData,
  formatMasteryScaleCheckboxText,
} from './src/utils/evaluationGridExporter.ts';
import {
  sanitizeOcrMathString,
  validateAndSanitizeOcrMapping,
  validateAndSanitizeGradingReport,
} from './src/utils/ocrLatexSanitizer.ts';
import {
  validateOcrPayload,
  createApiRateLimiter,
  securityAndCompressionMiddleware,
} from './server/middleware/apiGuard.ts';
import {
  getInitialSeededExportHistory,
  loadExportHistory,
  recordExportHistoryEntry,
} from './src/utils/exportHistoryStorage.ts';
import {
  DEFAULT_PREFS,
  loadInitialPrefs,
} from './src/utils/documentPreferencesStorage.ts';
import {
  getCurriculumTrackCached,
  getCurriculumTracksByCycleCached,
  getSemesterLessonsFlattenedCached,
  getCurriculumStatsSummary,
} from './src/utils/curriculumSliceHelper.ts';
import {
  CORE_PRELOADED_FONTS,
  shouldLoadDecorativeFonts,
} from './src/utils/lazyFontsLoader.ts';
import {
  sanitizeTrustedPedagogicalHtml,
  savePedagogicalRecord,
  getPedagogicalRecord,
  computeStorageHealthReport,
} from './src/utils/pedagogicalIndexedDbEngine.ts';
import {
  generateStandaloneLessonSummary,
  buildCompletePedagogicalUnitDossier,
} from './src/utils/lessonSummaryEngine.ts';
import {
  buildThreeTierDifferentiatedSeries,
  generateParameterizedHomeworkVariants,
} from './src/utils/seriesGenerator.ts';
import {
  buildCompanionAppPedagogicalBrief,
  parseAndResolveCompanionBriefForStudio,
  normalizeImportedCompanionDocument,
  buildCompanionDocumentExportPayload,
} from './src/utils/companionPedagogicalBridge.ts';
import { createRequire } from 'module';
import { generateSubQuestionAlignedCorrection } from './src/utils/correctionGenerator.ts';
import {
  buildNationalExamenBlanc20PtsDossier,
  createEditableSubQuestionTree,
  adjustSubQuestionBaremeStep025,
  moveSubQuestionOrder,
  splitSubQuestionInTwo,
  updateSubQuestionText,
  buildFoldedA5RevisionBooklet,
  buildA6RectoVersoFlashcardsSheet,
} from './src/utils/nextGenRoadmapEngine.ts';
import { computeModularArchitectureDiagnostics } from './src/hooks/useModularStudioArchitecture.ts';
import { autoRebalanceSpecMatrixTo14208 } from './src/utils/diagnosticAndDynamicSpecMatrixEngine.ts';
import {
  getOfficialNote14208TrackStandards,
  runDeepPedagogical14208Audit,
  buildOfficialMoroccanProfessorPortfolio,
} from './src/utils/moroccanPedagogicalPortfolio14208Engine.ts';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  [PASS] ${desc}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${desc}`);
    failCount++;
  }
}

console.log("=================================================");
console.log("=== COMPREHENSIVE PEDAGOGICAL & CODE TEST RUN ===");
console.log("=================================================\n");

// ----------------------------------------------------------------------
// 1. TEST 3D SPACE GEOMETRY ENGINE (المقترح 4)
// ----------------------------------------------------------------------
console.log("--- 1. Testing 3D Space Geometry Engine ---");
try {
  const sphereData = generate3DSpaceGeometryPresetData("SPHERE_PLANE", 4, 2, true);
  assert(sphereData.presetType === "SPHERE_PLANE", `Preset type identified correctly as SPHERE_PLANE`);
  assert(sphereData.svgWireframe.includes("<svg"), `SVG Wireframe contains valid SVG element`);
  assert(sphereData.tikzCode.includes("\\begin{tikzpicture}"), `TikZ code generated properly`);
  assert(sphereData.keyMetricsSummaryAr.includes("المسافة") || sphereData.keyMetricsSummaryAr.length > 0, `Key metrics summarized in Arabic`);
} catch (e: any) {
  assert(false, `3D Space Geometry crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 2. TEST MATHJS VALIDATOR & EXPRESSION CHECKER
// ----------------------------------------------------------------------
console.log("\n--- 2. Testing MathJS Validator & Symbolic Derivative ---");
try {
  const expr1 = "x^3 - 3*x + 1";
  const res1 = checkSingleMathExpressionWithMathJS(expr1);
  assert(res1.isValid, `Expression "${expr1}" is valid`);
  assert(res1.symbolicDerivativeX !== undefined && (res1.symbolicDerivativeX.includes("3 * x ^ 2") || res1.symbolicDerivativeX.includes("3 * x^2")), `Derivative of "${expr1}" calculated: ${res1.symbolicDerivativeX}`);

  const qValid = validateCustomQuestionWithMathJS("بين أن f'(x) = 3x^2 - 3 علماً أن f(x) = x^3 - 3x + 1");
  assert(qValid.isValid, `Valid custom question with math is accepted`);
} catch (e: any) {
  assert(false, `MathJS Validator crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 3. TEST SIGN TABLE & VARIATION CURVE GENERATORS
// ----------------------------------------------------------------------
console.log("\n--- 3. Testing Sign Table & Function Curves ---");
try {
  const signTable = generateSignTableAndDomainData("2*x - 4", "1", 0, 5);
  assert(signTable.isValid, `Sign table for 2x - 4 is valid`);
  assert(signTable.criticalPoints.some(cp => cp.x === 2), `Critical root x = 2 detected`);
  assert(signTable.svgSignTable.includes("<svg"), `SVG Sign table generated`);

  const funcCurve = generateFunctionVariationAndCurveData("x^2 - 4", -3, 3, 0);
  assert(funcCurve.svgContent.includes("<svg"), `Generated valid SVG content for function curve`);
  assert(funcCurve.yAtX0 === -4, `f(0) = -4 verified`);
  assert(funcCurve.symbolicDerivative === "2 * x", `Derivative 2 * x verified`);
} catch (e: any) {
  assert(false, `Function curves crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 4. TEST COBWEB SEQUENCE & INTEGRAL AREA
// ----------------------------------------------------------------------
console.log("\n--- 4. Testing Cobweb Sequences & Integral Area ---");
try {
  const cobweb = generateRecursiveSequenceCobwebData("sqrt(x + 2)", 1, 5);
  assert(cobweb.terms.length === 6, `Cobweb generated 6 terms (u0..u5)`);
  assert(cobweb.fixedPointApprox !== null && Math.abs(cobweb.fixedPointApprox - 2) < 0.05, `Fixed point l = sqrt(l+2) => l = 2 (got ${cobweb.fixedPointApprox})`);

  const integral = generateIntegralShadedAreaData("x^2", "0", 0, 2);
  // Integral of x^2 from 0 to 2 is 8/3 ~= 2.6667
  assert(Math.abs(integral.geometricAreaUA - 2.6667) < 0.05, `Integral area of x^2 on [0,2] ~= 2.67 (got ${integral.geometricAreaUA.toFixed(4)})`);
  assert(integral.svgPlotWithShadedArea.includes("<svg"), `SVG Plot with shaded integral area generated`);
} catch (e: any) {
  assert(false, `Cobweb/Integral crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 5. TEST DOUBLE PENALTY DETECTOR
// ----------------------------------------------------------------------
console.log("\n--- 5. Testing Didactic Double Penalty Detector ---");
try {
  const mockLessons: LessonItem[] = [
    {
      lessonAr: "دراسة الدوال",
      lessonFr: "Étude de fonctions",
      weight: 10,
      hours: "10h",
      capacitiesAr: [],
      capacitiesFr: [],
      sampleExerciseAr: [
        "1. احسب المشتقة f'(x).",
        "2. استنتج جدول تغيرات f علماً بالنتيجة المحصل عليها في السؤال السابق.",
        "3. حل المعادلة f(x) = 0."
      ],
      sampleExerciseFr: [
        "1. Calculer f'(x).",
        "2. Déduire le tableau de variations d'après le résultat précédent.",
        "3. Résoudre l'équation f(x)=0."
      ]
    }
  ];
  const findings = detectDoublePenaltyInLessons(mockLessons, (l) => ({
    questionsAr: l.sampleExerciseAr || [],
    questionsFr: l.sampleExerciseFr || [],
  }));
  assert(findings.length > 0, `Detected didactic double penalty in dependent cascade questions`);
} catch (e: any) {
  assert(false, `Double penalty detector crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 6. TEST LONGITUDINAL COHORT INSPECTOR ANALYTICS & CLASS COUNCIL (المقترح 2)
// ----------------------------------------------------------------------
console.log("\n--- 6. Testing Longitudinal Cohort Inspector Analytics ---");
try {
  const analytics = computeLongitudinalInspectorAnalytics(DEFAULT_LONGITUDINAL_COHORT_CONFIG);
  assert(analytics.svgEvolutionChart.includes("<svg"), `SVG Evolution Chart rendered`);
  assert(typeof analytics.meanProgressionDelta === "number", `Mean progression delta computed: ${analytics.meanProgressionDelta}`);
  assert(analytics.netRemediationEfficiencyScore >= 0, `Remediation efficiency score computed: ${analytics.netRemediationEfficiencyScore}%`);
  assert(analytics.homogeneityCV_DS1 > 0 && analytics.homogeneityCV_DS3 > 0, `Coefficients of variation computed`);
} catch (e: any) {
  assert(false, `Longitudinal analytics crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 7. TEST MOODLE XML / TELMIDTICE EXPORTER (المقترح 3)
// ----------------------------------------------------------------------
console.log("\n--- 7. Testing Moodle XML Question Bank Exporter ---");
try {
  const mockLessons: LessonItem[] = [
    {
      lessonAr: "النهايات والاتصال",
      lessonFr: "Limites et Continuité",
      weight: 4,
      hours: "6h",
      capacitiesAr: [],
      capacitiesFr: [],
      sampleExerciseAr: ["احسب النهاية: $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$."],
      sampleExerciseFr: ["Calculer la limite : $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$."],
      sampleSolutionAr: ["النهاية تساوي 1 لأنها اعتيادية."],
      sampleSolutionFr: ["La limite vaut 1."]
    }
  ];
  const xml = exportExamToMoodleXML(
    "فرض محروس رقم 1 - 2BAC SM",
    "BAC_SM",
    mockLessons,
    (l) => ({
      questionsAr: l.sampleExerciseAr || [],
      questionsFr: l.sampleExerciseFr || [],
      answersAr: l.sampleSolutionAr || [],
      answersFr: l.sampleSolutionFr || [],
    })
  );

  assert(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), `Moodle XML has correct XML declaration`);
  assert(xml.includes('<quiz>'), `Contains <quiz> root element`);
  assert(xml.includes('format="html"'), `Questions formatted with HTML`);
  assert(xml.includes('\\(\\lim_{x \\to 0}'), `Inline math converted to MathJax notation \\(...\\)`);
  assert(xml.endsWith('</quiz>'), `Validly closes </quiz> tag`);
} catch (e: any) {
  assert(false, `Moodle XML exporter crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 8. TEST SPLINE CUBIC MODEL & OMR QCM LOGIC (المقترح 1)
// ----------------------------------------------------------------------
console.log("\n--- 8. Testing Spline Cubic Model & OMR QCM Logic ---");
try {
  const p1 = { x: -1, y: 3 };
  const p2 = { x: 2, y: -2 };
  const dx = p2.x - p1.x; // 3
  const dy = p2.y - p1.y; // -5
  const a = (-2 * dy) / Math.pow(dx, 3); // 10 / 27
  const b = (-3 / 2) * a * (p1.x + p2.x);
  const c = 3 * a * p1.x * p2.x;
  const d = p1.y - (a * Math.pow(p1.x, 3) + b * Math.pow(p1.x, 2) + c * p1.x);

  const f = (x: number) => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
  const df = (x: number) => 3 * a * Math.pow(x, 2) + 2 * b * x + c;

  assert(Math.abs(f(p1.x) - p1.y) < 1e-6, `Spline interpolates P1(${p1.x}, ${p1.y})`);
  assert(Math.abs(f(p2.x) - p2.y) < 1e-6, `Spline interpolates P2(${p2.x}, ${p2.y})`);
  assert(Math.abs(df(p1.x)) < 1e-6, `Spline has horizontal tangent at P1: f'(${p1.x}) = 0`);
  assert(Math.abs(df(p2.x)) < 1e-6, `Spline has horizontal tangent at P2: f'(${p2.x}) = 0`);

  const xInflection = -b / (3 * a);
  assert(Math.abs(xInflection - (p1.x + p2.x) / 2) < 1e-6, `Inflection point x_I = ${xInflection} is midpoint (${(p1.x+p2.x)/2})`);
} catch (e: any) {
  assert(false, `Spline Cubic model crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 9. TEST QR CODE GENERATOR
// ----------------------------------------------------------------------
console.log("\n--- 9. Testing QR Code SVG Engine ---");
try {
  const qrSvg = renderQrSvgString("https://kouziber.educ.ma/exam/123", 64, "#000000");
  assert(qrSvg.startsWith("<svg") && qrSvg.includes("</svg>"), `QR SVG generated valid SVG string`);
  assert(qrSvg.includes('width="64"') && qrSvg.includes('height="64"'), `QR SVG respects sizing parameters`);
} catch (e: any) {
  assert(false, `QR Code SVG crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 10. TEST MOROCCAN CURRICULUM DATA INTEGRITY
// ----------------------------------------------------------------------
console.log("\n--- 10. Testing Curriculum Data & Tracks ---");
try {
  const trackEntries = Object.entries(CURRICULUM_DB);
  assert(trackEntries.length >= 6, `Moroccan curriculum has ${trackEntries.length} tracks registered`);
  let validTracksCount = 0;
  for (const [trackCode, track] of trackEntries) {
    const s1Lessons = Object.values(track.semesters?.S1 || {}).flat();
    if (s1Lessons.length > 0) {
      validTracksCount++;
      const l1 = s1Lessons[0];
      const qA = getVariantQuestions(l1, "A", false, 0);
      const qB = getVariantQuestions(l1, "B", false, 0);
      assert(qA.questionsAr.length > 0, `Variant A questions exist for ${trackCode}`);
      assert(qB.questionsAr.length > 0, `Variant B questions exist for ${trackCode}`);
    }
  }
  assert(validTracksCount > 0, `Verified ${validTracksCount} active curriculum tracks with full S1 lessons`);
} catch (e: any) {
  assert(false, `Curriculum check crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 11. TEST INTERACTIVE QUIZ GENERATOR & AUTOMATED GRADING (quizGenerator)
// ----------------------------------------------------------------------
console.log("\n--- 11. Testing Interactive Quiz Generator & Automated Grading ---");
try {
  const sampleTrack = CURRICULUM_DB["2BAC_PC"];
  const sampleLessons = Object.values(sampleTrack.semesters.S1).flat().slice(0, 2);
  const quiz = convertExercisesToInteractiveQuiz({
    lessons: sampleLessons,
    titleAr: "فرض محروس تجريبي رقم 1",
    titleFr: "Devoir Surveillé N°1",
    schoolAr: "ثانوية مولاي يوسف التأهيلية",
    schoolFr: "Lycée Moulay Youssef",
    prof: "ذ. كوزيبر",
    trackCode: "2BAC_PC",
    system: "MAROC_NATIONAL",
    durationMinutes: 45,
    calculatorAllowed: true,
  });

  assert(quiz.totalQuestions > 0, `Interactive Quiz generated ${quiz.totalQuestions} questions`);
  assert(Math.abs(quiz.totalPoints - 20) < 0.05, `Quiz total points normalized to 20/20 (got ${quiz.totalPoints})`);
  assert(quiz.questions.every((q) => q.choices.length === 4), `Every quiz question has 4 choices with mathematical distractors`);

  // Simulate 100% correct student answers
  const perfectAnswers: Record<string, string> = {};
  quiz.questions.forEach((q) => {
    const correctOpt = q.choices.find((o) => o.isCorrect);
    if (correctOpt) perfectAnswers[q.id] = correctOpt.id;
  });

  const evalPerfect = evaluateStudentQuiz(quiz, {
    candidateName: "ياسين العلمي",
    candidateClass: "2BAC PC 1",
    candidateNumber: "14",
    answers: perfectAnswers,
    flaggedQuestionIds: [],
    elapsedSeconds: 420,
    completedAt: new Date().toISOString(),
  });
  assert(Math.abs(evalPerfect.scoreOut20 - 20) < 0.01, `Automated grading gives 20/20 for all-correct answers (got ${evalPerfect.scoreOut20})`);
  assert(evalPerfect.correctCount === quiz.totalQuestions, `Automated grading counts ${evalPerfect.correctCount}/${quiz.totalQuestions} correct answers`);
} catch (e: any) {
  assert(false, `Interactive Quiz generator crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 12. TEST LOCAL AES-GCM 256-BIT ENCRYPTION ENGINE (cryptoStorage)
// ----------------------------------------------------------------------
console.log("\n--- 12. Testing Local AES-GCM 256-bit Storage Encryption Engine ---");
try {
  const {
    encryptTextAESGCM,
    decryptTextAESGCM,
    isEncryptedPayload,
    runCryptoEngineSelfTest,
  } = await import("./src/utils/cryptoStorage.ts");

  const sampleSecretExamText = JSON.stringify({
    title: "فرض محروس رقم 2 - الأسدس الأول",
    track: "2BAC_SM",
    gradingKey: { Q1: 3.5, Q2: 4.5, Q3: 12.0 },
    studentGrades: [{ name: "فاطمة الزهراء", grade: 19.75 }],
  });

  const encrypted = await encryptTextAESGCM(sampleSecretExamText);
  assert(isEncryptedPayload(encrypted), `Encrypted payload starts with secure header __ENC_AES256_GCM__`);
  assert(encrypted.includes(":"), `Encrypted payload contains salt, IV, and ciphertext segments`);

  const decrypted = await decryptTextAESGCM(encrypted);
  assert(decrypted === sampleSecretExamText, `AES-GCM decryption reproduces original plaintext verbatim`);

  // Test PIN protected encryption
  const pin = "7392";
  const pinEncrypted = await encryptTextAESGCM(sampleSecretExamText, pin);
  assert(isEncryptedPayload(pinEncrypted), `PIN-protected encrypted payload is valid`);

  const pinDecrypted = await decryptTextAESGCM(pinEncrypted, pin);
  assert(pinDecrypted === sampleSecretExamText, `PIN-protected decryption reproduces original with correct PIN`);

  // Test self test benchmark
  const selfTest = await runCryptoEngineSelfTest();
  assert(selfTest.success, `Crypto Engine self-test passed: ${selfTest.details}`);
  assert(selfTest.durationMs < 100, `AES-GCM latency is ultra-fast: ${selfTest.durationMs}ms`);
} catch (e: any) {
  assert(false, `Crypto Storage test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 13. TEST GOOGLE DRIVE SETTINGS SYNCHRONIZATION PAYLOAD & CONTRACT
// ----------------------------------------------------------------------
console.log("\n--- 13. Testing Google Drive Settings Synchronization Contract ---");
try {
  const { SETTINGS_FILE_NAME, SCOPES } = await import("./src/services/googleDrive.ts");
  assert(SETTINGS_FILE_NAME === "math_exam_studio_settings.json", `Settings file name defined as math_exam_studio_settings.json`);
  assert(SCOPES.includes("https://www.googleapis.com/auth/drive.file"), `OAuth least-privilege scope includes drive.file`);
} catch (e: any) {
  assert(false, `Google Drive contract test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 14. TEST INTERACTIVE QUIZ QR CODE LINK & ISO/IEC 18004 MATRIX ENGINE
// ----------------------------------------------------------------------
console.log("\n--- 14. Testing Interactive Quiz QR Code Link & ISO QR Matrix Engine ---");
try {
  const {
    buildInteractiveQuizLinkForDocument,
    generateIsoQrMatrix,
    renderQrSvgString: renderQrSvg,
  } = await import("./src/utils/qrCodeHelper.ts");

  const quizLink = buildInteractiveQuizLinkForDocument({
    educationSystem: "MOROCCO_MEN",
    trackCode: "2BAC_SM",
    semester: "S1",
    dsNumber: "2",
    examModel: "B",
    docType: "DS_142_08",
  });
  assert(quizLink.includes("quiz=1"), `Interactive quiz link contains quiz=1 parameter: ${quizLink}`);
  assert(quizLink.includes("track=2BAC_SM") && quizLink.includes("model=B"), `Interactive quiz link preserves track and exam model parameters`);

  const qrMatrix = generateIsoQrMatrix(quizLink, "M");
  assert(Array.isArray(qrMatrix) && qrMatrix.length >= 21 && qrMatrix.length === qrMatrix[0].length, `ISO/IEC 18004 QR matrix generated (${qrMatrix.length}x${qrMatrix.length})`);
  // Top-left finder pattern outer corner (0,0) and center (3,3) must be dark (true)
  assert(Boolean(qrMatrix[0][0]) === true && Boolean(qrMatrix[3][3]) === true, `QR matrix contains valid ISO 7x7 finder pattern at top-left corner`);

  const svgStr = renderQrSvg(quizLink, 128, "#0f172a");
  assert(svgStr.includes("<svg") && svgStr.includes('shape-rendering="crispEdges"'), `QR SVG renders crisp vector paths for PDF and print`);
} catch (e: any) {
  assert(false, `Interactive Quiz QR test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 15. TEST A4 AUTO-LAYOUT OVERFLOW DETECTOR & MARGIN OPTIMIZER
// ----------------------------------------------------------------------
console.log("\n--- 15. Testing A4 Auto-Layout Overflow Detector & Margin Optimizer ---");
try {
  const { analyzeA4LayoutMetrics } = await import("./src/utils/pdfExporter.ts");

  // Case A: Trailing orphan overflow (e.g., 1.12 pages -> 2nd page only 12% full)
  const orphanReport = analyzeA4LayoutMetrics({
    contentWidthPx: 794,
    scrollWidthPx: 794,
    contentHeightPx: 1210, // ~1.12x single page capacity (~1080px)
    orientation: "portrait",
    marginPreset: "STANDARD",
    currentMarginTopMm: 12,
    currentMarginBottomMm: 14,
    currentMarginXMm: 14,
    includeFooterQrCode: true,
  });
  assert(orphanReport.rawPageCount === 2, `Detects raw 2-page split for 1210px height`);
  assert(orphanReport.hasTrailingOrphanOverflow === true, `Flags trailing orphan overflow when page 2 fill (${orphanReport.lastPageFillPercentBefore}%) <= 24%`);
  assert(orphanReport.adjustedPageCount === 1, `Auto-layout compacts trailing orphan slice onto 1 page`);
  assert(orphanReport.recommendedScaleFactor < 1 && orphanReport.recommendedScaleFactor >= 0.91, `Computes safe compaction scale factor (${orphanReport.recommendedScaleFactor})`);

  // Case B: Horizontal overflow detection (e.g., wide table or equation)
  const horizReport = analyzeA4LayoutMetrics({
    contentWidthPx: 794,
    scrollWidthPx: 890,
    contentHeightPx: 920,
    orientation: "portrait",
    marginPreset: "STANDARD",
    currentMarginTopMm: 6, // unsafe narrow top margin
    currentMarginXMm: 6,   // unsafe narrow X margin
    includeFooterQrCode: true,
  });
  assert(horizReport.hasHorizontalOverflow === true && horizReport.horizontalOverflowPx === 96, `Detects 96px horizontal overflow accurately`);
  assert(horizReport.recommendedMarginTopMm >= 8 && horizReport.recommendedMarginXMm >= 8, `Enforces hardware-safe print margins (>= 8mm)`);
} catch (e: any) {
  assert(false, `A4 Auto-Layout analyzer test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 16. TEST REAL-TIME PRINT MEDIA QUERY (@page A4, Letter, Custom) SIMULATOR
// ----------------------------------------------------------------------
console.log("\n--- 16. Testing Real-Time Print Media Query (@page) Simulator ---");
try {
  const { computePrintMediaQueryMetrics } = await import("./src/utils/pdfExporter.ts");

  const a4Metrics = computePrintMediaQueryMetrics({
    preset: "A4",
    orientation: "PORTRAIT",
    marginTopMm: 10,
    marginBottomMm: 12,
    marginXMm: 12,
    contentHeightPx: 2300,
  });
  assert(a4Metrics.widthMm === 210 && a4Metrics.heightMm === 297, `A4 portrait dimensions resolved to 210x297mm`);
  assert(a4Metrics.cssPageRule.includes("size: A4 portrait"), `A4 generates valid @page { size: A4 portrait; ... } rule`);
  assert(a4Metrics.pageBreakOffsetsPx.length >= 2 && a4Metrics.pageBreakOffsetsPx[0] === a4Metrics.pageBreakIntervalPx, `A4 page break boundaries calculated accurately (${a4Metrics.pageBreakOffsetsPx[0]}px)`);

  const letterMetrics = computePrintMediaQueryMetrics({
    preset: "LETTER",
    orientation: "PORTRAIT",
    marginTopMm: 10,
    marginBottomMm: 12,
    marginXMm: 12,
  });
  assert(letterMetrics.widthMm === 215.9 && letterMetrics.heightMm === 279.4, `US Letter dimensions resolved to 215.9x279.4mm`);
  assert(letterMetrics.pageBreakIntervalPx < a4Metrics.pageBreakIntervalPx, `US Letter page break interval (${letterMetrics.pageBreakIntervalPx}px) is shorter than A4 (${a4Metrics.pageBreakIntervalPx}px)`);

  const customMetrics = computePrintMediaQueryMetrics({
    preset: "CUSTOM",
    orientation: "LANDSCAPE",
    customWidthMm: 180,
    customHeightMm: 260,
  });
  assert(customMetrics.widthMm === 260 && customMetrics.heightMm === 180, `Custom @page in landscape swaps dimensions to 260x180mm`);
  assert(customMetrics.cssPageRule.includes("size: 260mm 180mm"), `Custom @page rule includes custom mm dimensions`);
} catch (e: any) {
  assert(false, `Print Media Query simulator test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 17. TEST ALL 7 STRATEGIC ARCHITECTURAL & DIDACTIC PROPOSALS ENGINE
// ----------------------------------------------------------------------
console.log("\n--- 17. Testing 7 Strategic Architectural & Didactic Proposals Engine ---");
try {
  const {
    buildPedagogicalDomainStoreSnapshot,
    evaluateOmrBubbleDensities,
    designCurveFromInteractiveControlPoints,
    searchCurriculumQuestionBank,
    computeDualModelABComparison,
    generateBeamerPresentationAndSlides,
  } = await import("./src/utils/sevenStrategicProposalsEngine.ts");

  const pcLessons = CURRICULUM_DB["2BAC_PC"].semesters.S1["DS1"];

  // Proposal 1 & 2: Domain State Partitioning into 4 Slices
  const storeSnap = buildPedagogicalDomainStoreSnapshot({
    school: "ثانوية مولاي يوسف",
    prof: "الأستاذ كوزيبر إبراهيم",
    year: "2026/2027",
    academy: "الرباط سلا القنيطرة",
    direction: "الرباط",
    headerStyle: "MINISTRY_142_08",
    educationSystem: "MAROC_NATIONAL",
    trackCode: "2BAC_PC",
    trackLabelAr: CURRICULUM_DB["2BAC_PC"].labelAr,
    semester: "S1",
    dsKey: "DS1",
    activeModule: "DS_142_08",
    examModel: "A",
    activeLessonsCount: pcLessons.length,
    n1: 35,
    n2: 45,
    n3: 20,
    pageOrientation: "PORTRAIT",
    printPageSizePreset: "A4",
    docFontFamily: "ACADEMIC_SERIF",
    docFontSize: "NORMAL",
    latexPackageTheme: "TCOLORBOX",
    paperSurface: "PLAIN_WHITE",
    showA4LivePageBreaks: true,
    includeInteractiveQrFooter: true,
    includeDetailedSolutions: true,
    includeAnswerWorkspace: true,
    include2DSpecMatrix: true,
    includeOMRBubbleSheet: true,
    includeCustomEvalGridSheet: true,
  });
  assert(
    Boolean(storeSnap.identitySlice && storeSnap.curriculumSlice && storeSnap.printLayoutSlice && storeSnap.pedagogicalAnnexesSlice),
    `Proposals 1 & 2: Domain store snapshot partitions state into 4 isolated slices (${storeSnap.performanceDiagnostics.memoizedSubRenderers.length} memoized sub-renderers)`
  );

  // Proposal 3: OMR Pixel-Luminance Density Evaluator
  const omrCheck = evaluateOmrBubbleDensities({
    bubbleDarknessMatrix: [[45, 195, 38, 42]],
    threshold: 115,
    answerKey: { 1: "B" },
    pointsPerQuestion: 2,
  });
  assert(
    omrCheck.detectedAnswers[1] === "B" && omrCheck.averageConfidencePct >= 75,
    `Proposal 3: OMR pixel luminance density accurately identifies darkened bubble B (confidence ${omrCheck.averageConfidencePct}%)`
  );

  // Proposal 4: Interactive Drag-and-Drop Curve Designer
  const curveRes = designCurveFromInteractiveControlPoints({
    p1: { x: -1, y: 2, slope: 0 },
    p2: { x: 1, y: -2, slope: 0 },
    horizontalAsymptoteY: null,
  });
  assert(
    curveRes.formulaLatex.includes("f(x)") && curveRes.tkzTabCode.includes("\\tkzTabInit") && curveRes.svgFullMarkup.includes("<svg"),
    `Proposal 4: Interactive curve designer deduces f(x), tkz-tab, and vector SVG from dragged control points`
  );

  // Proposal 5: Searchable Question Bank across 19 tracks
  const bankSearch = searchCurriculumQuestionBank({
    query: "متتاليات",
    trackFilter: "ALL",
    branchFilter: "ALL",
    cognitiveFilter: "ALL",
    maxResults: 20,
  });
  assert(
    bankSearch.length > 0 && bankSearch[0].rawLesson.lessonAr.length > 0,
    `Proposal 5: Searchable question bank indexes all tracks and finds ${bankSearch.length} matching exercises`
  );

  // Proposal 6: Dual Model A/B Side-by-Side Comparison
  const dualAB = computeDualModelABComparison(pcLessons, false);
  assert(
    dualAB.exercises.length > 0 && dualAB.isomorphismScorePct >= 75 && Math.abs(dualAB.totalPointsA - 20) < 0.05,
    `Proposal 6: Dual Model A/B comparison verifies ${dualAB.isomorphismScorePct}% pedagogical equivalence and 20/20 grading`
  );

  // Proposal 7: LaTeX Beamer & Classroom TBI Slides Generator
  const beamerDeck = generateBeamerPresentationAndSlides({
    docTitle: "الفرض المحروس 1 (الدورة 1)",
    subtitle: CURRICULUM_DB["2BAC_PC"].labelAr,
    prof: "الأستاذ كوزيبر إبراهيم",
    school: "ثانوية مولاي يوسف",
    year: "2026/2027",
    trackLabel: CURRICULUM_DB["2BAC_PC"].labelAr,
    lessons: pcLessons,
    isFr: false,
    theme: "Madrid",
  });
  assert(
    beamerDeck.slides.length > 0 && beamerDeck.beamerLatexCode.includes("\\documentclass[aspectratio=169, 11pt]{beamer}"),
    `Proposal 7: Generates interactive TBI slides (${beamerDeck.slides.length} frames) and valid LaTeX Beamer .tex code`
  );
} catch (e: any) {
  assert(false, `7 Strategic Proposals test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 18. TEST 6 REPROGRAPHICS SUPERVISOR & MATH TEACHER INNOVATIONS
// ----------------------------------------------------------------------
console.log("\n--- 18. Testing 6 Reprographics Supervisor & Math Teacher Innovations ---");
try {
  const pcLessons = CURRICULUM_DB["2BAC_PC"].semesters.S1["DS1"];

  // Proposal 1 & 5: Eco-Toner Simulator & Print-Shop Job Ticket Estimator
  const reproEst = calculateReprographicsProductionEstimate({
    groupsCount: 3,
    studentsPerGroup: 36,
    extraArchiveCopies: 6,
    pagesPerCopy: 2,
    duplexMode: "RECTO_VERSO",
    ecoTonerActive: true,
    hasColoredHeaders: true,
    hasAnswerGrid: false,
  });
  assert(
    reproEst.totalStudentCopies === 114 &&
      reproEst.totalA4SheetsRequired === 114 &&
      reproEst.ecoRisoTonerCoveragePct < 6 &&
      reproEst.tonerSavedPct >= 25,
    `Proposals 1 & 5: Reprographics estimator computes ${reproEst.totalA4SheetsRequired} A4 sheets, ${reproEst.paperReams500Required} reams, and ${reproEst.ecoRisoTonerCoveragePct}% K-Black toner coverage`
  );

  // Proposal 2: Binding Gutter & Guillotine Crop Marks Config
  assert(
    DEFAULT_BINDING_AND_CROP_CONFIG.gutterExtraMm === 8 &&
      DEFAULT_BINDING_AND_CROP_CONFIG.stapleCorner === "TOP_RIGHT_RTL",
    `Proposal 2: Symmetrical staple & hole-punch binding gutter defaults to +8mm safety zone`
  );

  // Proposal 3: Quarter-Point (0.25 pt) Micro-Rubric & Didactic Rescue Locks
  const microRubric = buildQuarterPointMicroRubric({ lessons: pcLessons, isFr: false });
  assert(
    microRubric.items.length > 0 &&
      Math.abs(microRubric.totalPointsVerified - 20) < 0.05 &&
      microRubric.quarterPointGranularityCount >= 10 &&
      microRubric.items.every((it) => it.microSteps.length >= 2 && it.rescueAdmissionLockAr.length > 0),
    `Proposal 3: Quarter-point micro-rubric decomposes ${microRubric.items.length} questions into ${microRubric.quarterPointGranularityCount} micro-steps of 0.25 pt with automatic rescue locks`
  );

  // Proposal 4: Forbidden Value (Double-Barre ||) Variation Table & Geometric Interpretations
  const homographicBundle = generateForbiddenValueVariationBundle({
    presetId: "HOMOGRAPHIC_POLE",
    forbiddenX: 1,
  });
  assert(
    homographicBundle.tkzTabDoubleBarreCode.includes("d") &&
      homographicBundle.svgVariationTableMarkup.includes("<svg") &&
      homographicBundle.geometricInterpretations.length >= 2,
    `Proposal 4: Forbidden value (Double-Barre ||) engine generates tkz-tab with 'd' double-bar, vector SVG, and ${homographicBundle.geometricInterpretations.length} geometric interpretations`
  );

  // Proposal 6: Visual Algebraic Counter-Examples & Classic Traps Card
  const counterExamples = getAlgebraicCounterExamplesForLessons(pcLessons);
  assert(
    counterExamples.length >= 4 &&
      counterExamples.every((ce) => ce.numericCounterExampleAr.length > 0 && ce.correctIdentityLatex.length > 0),
    `Proposal 6: Algebraic Counter-Examples Lab provides ${counterExamples.length} numerical refutations for classic student traps`
  );
} catch (e: any) {
  assert(false, `6 Reprographics & Math Teacher Innovations test crashed: ${e.message}`);
}

console.log("\n=== 19. TESTING DS, DM, SERIES, FICHES OP 2007 & AI FIXES ===");
try {
  const pcTrack = CURRICULUM_DB["2BAC_PC"];
  const s2Lessons = pcTrack.semesters.S2.DS2;
  const customSerieBlocks = generateCustomCountSerieExercises(s2Lessons, 6, "A");
  assert(
    customSerieBlocks.length === 6 &&
      !customSerieBlocks[0].questionsAr[0].includes("أحسب وبسط التعابير الرياضية الأساسية المرتبطة بـ") &&
      customSerieBlocks.every((b) => b.questionsAr.length >= 3 && b.questionsFr.length >= 3),
    "Custom-count Serie exercises (N1, N2, N3) use real mathematical questions from lesson variants A & B instead of generic meta-placeholders"
  );

  const complexLesson =
    s2Lessons.find((l: LessonItem) => l.lessonAr.includes("عقدي") || l.lessonFr.toLowerCase().includes("complexe")) ||
    s2Lessons[0];
  const complexFiche = generateFullMoroccanPedagogicalFiche(complexLesson, pcTrack);
  assert(
    (complexFiche.fullCourseContent[0].definitions[0].notationMath || "").length > 15 &&
      !complexFiche.fullCourseContent[0].solvedExamples[0].statementAr.includes("تطبيق مباشر للخاصية المحورية لـ") &&
      complexFiche.formativeEvaluation.testExerciseAr.questions.length === 3,
    "Fiche OP 2007 fallback branch (Complex Numbers / Space Geometry / Integrals) uses real lesson sample exercises, capacities, and mathematical formulas"
  );
} catch (e: any) {
  assert(false, `Section 19 DS/DM/Series/Fiche test crashed: ${e.message}`);
}

console.log("\n=== 20. TESTING ALL 11 NEW PEDAGOGICAL & DEVELOPER INNOVATIONS ===");
try {
  const pcTrack = CURRICULUM_DB["2BAC_PC"];
  const s2Lessons = pcTrack.semesters.S2.DS2;

  // 1. Chrono-Solver Pacing Meter
  const chrono = computeExamChronoPacing({ lessons: s2Lessons, examDurationMinutes: 120 });
  assert(
    chrono.totalEstimatedMinutes >= 15 &&
      chrono.questions.length >= 2 &&
      chrono.pacingStatus.length > 0,
    `Proposal 1 (DS): Chrono-Solver computes ${chrono.totalEstimatedMinutes} min for ${chrono.questions.length} questions with status ${chrono.pacingStatus}`
  );

  // 2. Mini-Bandeaux de Correction
  const bandeau = generateCorrectionMiniBandeau({ lessons: s2Lessons, isFr: false });
  assert(
    bandeau.questions.length > 0 && bandeau.totalPoints > 0,
    `Proposal 2 (DS): Mini-Bandeaux generates ${bandeau.questions.length} quick-cut grading coupons totaling ${bandeau.totalPoints} pts`
  );

  // 3. Parametric Anti-Copy DM
  const parametricDM = generateParametricAntiCopyDM(40);
  assert(
    parametricDM.studentRows.length === 40 &&
      parametricDM.studentRows[0].formulaLatex.includes("f_1") &&
      parametricDM.studentRows[39].formulaLatex.includes("f_40"),
    `Proposal 3 (DM): Parametric Anti-Copy DM generates 40 customized functions f_1(x) to f_40(x) for all 40 students`
  );

  // 4. Progressive QR Hints for DM
  const qrHints = generateProgressiveHintsForDM(s2Lessons);
  assert(
    qrHints.length > 0 && qrHints[0].levels.length === 3,
    `Proposal 4 (DM): Progressive QR Hints provide 3 scaffolding levels (idea, theorem, intermediate formula) for each exercise`
  );

  // 5. Differentiated Paths for Series TD
  assert(
    SERIE_DIFFERENTIATED_PATHS.length === 3 &&
      SERIE_DIFFERENTIATED_PATHS[0].id === "PATH_A_SOCLE" &&
      SERIE_DIFFERENTIATED_PATHS[2].id === "PATH_C_EXCELLENCE",
    `Proposal 5 (Séries): Differentiated paths (Parcours A Socle, B Maîtrise, C Excellence) configured`
  );

  // 6. Micro-Mémo Capsule
  const microMemo = buildMicroMemoCapsule(s2Lessons);
  assert(
    microMemo.length > 0 && microMemo[0].latexMath.length > 3,
    `Proposal 6 (Séries): Micro-Mémo capsule extracts ${microMemo.length} essential identities for the series header`
  );

  // 7. Blackboard Triptych Plan
  const bbPlan = generateTriptychBlackboardPlan(s2Lessons[0]);
  assert(
    bbPlan.leftPanelItemsAr.length >= 2 &&
      bbPlan.centerPanelItemsAr.length >= 2 &&
      bbPlan.rightPanelItemsAr.length >= 2,
    `Proposal 7 (Fiches): Triptych Blackboard Plan organizes Left, Center, and Right panels`
  );

  // 8. Cahier de Textes Sync
  const cahierEntries = generateCahierDeTextesSummary(s2Lessons[0], 2);
  assert(
    cahierEntries.length === 2 &&
      cahierEntries[0].activitiesConductedAr.length > 0 &&
      cahierEntries[1].homeworkAssignedAr.length > 0,
    `Proposal 8 (Fiches): Cahier de Textes Sync generates official session logs and assigned homework`
  );

  // 9. Auto-CAS MathJS Verifier
  const casResult = verifyFormulaWithCAS("f(x) = x^2 - 3*x + 1");
  assert(
    casResult.isConsistent && casResult.symbolicDerivative.includes("d/dx"),
    `Proposal 9 (AI): Auto-CAS Verifier pipeline validates symbolic consistency`
  );

  // 10. Multimodal Student Handwriting Diagnostician
  const errorDiag = diagnoseSampleStudentAttempt("DOMAIN_FORGET");
  assert(
    errorDiag.identifiedErrorType === "DOMAIN_FORGET" &&
      errorDiag.diagnosisAr.includes("الصلاحية") &&
      errorDiag.remediationActionAr.length > 0,
    `Proposal 10 (AI): Handwriting diagnostician identifies DOMAIN_FORGET and suggests immediate remediation`
  );

  // 11. BIOF Linguistic Glossary Adapter
  const biofGlossary = buildBiofGlossaryForTrack(pcTrack.code);
  assert(
    biofGlossary.length >= 4 &&
      biofGlossary[0].french.includes("T.V.I.") &&
      biofGlossary[0].phoneticPronunciation.length > 0,
    `Proposal 11 (AI): BIOF Linguistic Glossary provides official terminology, phonetics, and contextual sentences`
  );
} catch (e: any) {
  assert(false, `Section 20 New Innovations test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 21. TEST LATEX CLEANER, PRINT LAYOUT TEMPLATES & EXERCISE SOLUTION QR
// ----------------------------------------------------------------------
console.log("\n--- 21. Testing LaTeX Cleaner, Print Layout Templates & Exercise Solution QR ---");
try {
  // 1. LaTeX Preamble & Symbol Cleaner
  const cleanerReport = cleanLatexDocument(SAMPLE_DIRTY_LATEX_WITH_CONFLICTS, DEFAULT_CLEANER_OPTIONS);
  assert(
    cleanerReport.cleanedCode.length > 100 &&
      cleanerReport.symbolReport.totalConversionsCount >= 5 &&
      cleanerReport.preambleReport.clashResolvedCount >= 1,
    `LaTeX Cleaner resolved ${cleanerReport.preambleReport.clashResolvedCount} package conflicts and ${cleanerReport.symbolReport.totalConversionsCount} symbol/command conversions`
  );
  const idxAmsthm = cleanerReport.cleanedCode.indexOf("\\usepackage{amsthm}");
  const idxAmsmath = cleanerReport.cleanedCode.indexOf("\\usepackage{amsmath}");
  const idxHyperref = cleanerReport.cleanedCode.indexOf("\\usepackage[colorlinks=true]{hyperref}");
  const idxCleveref = cleanerReport.cleanedCode.indexOf("\\usepackage{cleveref}");
  assert(
    idxAmsmath !== -1 && idxAmsthm !== -1 && idxAmsmath < idxAmsthm,
    `LaTeX Cleaner ordered amsmath BEFORE amsthm in preamble`
  );
  assert(
    idxHyperref !== -1 && idxCleveref !== -1 && idxHyperref < idxCleveref,
    `LaTeX Cleaner ordered hyperref BEFORE cleveref at the end of preamble`
  );
  assert(
    cleanerReport.cleanedCode.includes("\\mathbb{R}") &&
      cleanerReport.cleanedCode.includes("\\forall") &&
      cleanerReport.cleanedCode.includes("\\frac{") &&
      cleanerReport.cleanedCode.includes("\\binom{"),
    `LaTeX Cleaner converted Unicode math symbols (ℝ, ∀) and modernized obsolete TeX commands (\\over -> \\frac, \\choose -> \\binom)`
  );

  // 2. Print Layout Templates Library
  assert(
    PRINT_LAYOUT_TEMPLATES.length === 7,
    `Print Layout Templates library provides ${PRINT_LAYOUT_TEMPLATES.length} predefined layout structures`
  );
  const dualColTpl = getPrintLayoutTemplate("DUAL_COLUMN_COMPACT");
  const examBorderTpl = getPrintLayoutTemplate("OFFICIAL_EXAM_BORDERED");
  assert(
    dualColTpl.columnsCount === 2 && examBorderTpl.hasOfficialBorder === true,
    `Print Layout Templates accurately resolve 2-column compact and double-bordered exam configurations`
  );

  // 3. Exercise Solution QR Code Generator
  const pcTrack = CURRICULUM_DB["2BAC_PC"];
  const sampleLessons = pcTrack.semesters.S1.DS1.slice(0, 3);
  const qrMap = initializeExerciseSolutionQrs(sampleLessons, true);
  qrMap["ex_0"].enabled = true;
  assert(
    Object.keys(qrMap).length === sampleLessons.length &&
      qrMap["ex_0"].enabled === true,
    `Exercise Solution QR Engine initialized ${Object.keys(qrMap).length} exercises with active QR on Ex 1`
  );
  const qrUrl = buildExerciseSolutionUrl(qrMap["ex_0"]);
  const qrSvg = renderExerciseQrSvg(qrUrl);
  assert(
    qrUrl.includes("solution_mode=1") &&
      qrSvg.startsWith("<svg") &&
      qrSvg.includes("</svg>"),
    `Exercise Solution QR Engine generates valid solution URL and crisp vector SVG matrix`
  );

  // 4. Offline LaTeX & Typst Code Export with Print Template & Exercise QR
  const exportedLatex = generateOfflineSourceCode({
    track: pcTrack,
    sem: "S1",
    dsKey: "DS1",
    school: "Lycée Mohammed V",
    prof: "Prof. Test",
    year: "2025/2026",
    academy: "Casablanca-Settat",
    direction: "Anfa",
    headerStyle: "OFFICIAL_AREF",
    includeStudentBox: true,
    includeGradeBox: true,
    examModel: "A",
    shuffleQuestions: false,
    shuffleExercises: false,
    docLang: "FR",
    bilingualLayout: "SIDE_BY_SIDE",
    exportFormat: "LATEX",
    activeModule: "DS_142_08",
    n1: 2,
    n2: 2,
    n3: 1,
    fillBlanks: false,
    includeTICE: true,
    selectedLessonIdx: 0,
    diagDuration: "2h",
    customLessons: sampleLessons,
    printLayoutTemplateId: "DUAL_COLUMN_COMPACT",
    exerciseSolutionQrs: qrMap,
  });
  assert(
    exportedLatex.includes("\\usepackage{multicol}") &&
      exportedLatex.includes("\\begin{multicols}{2}") &&
      exportedLatex.includes("solution\\_mode=1") &&
      exportedLatex.includes("\\interdisplaylinepenalty=10000"),
    `Offline LaTeX Exporter injects multicols{2}, Exercise Solution QR links, and equation anti-split penalty (\\interdisplaylinepenalty=10000)`
  );

  // 5. Smart Page-Break Optimizer (A4 & Letter Anti-Split Engine)
  const a4Plan = computeOptimizedPageBreakPlan(
    sampleLessons,
    { ...DEFAULT_SMART_PAGE_BREAK_CONFIG, paperFormat: "A4" },
    { columnsCount: 1, includeAnswerWorkspace: true, includeDetailedSolutions: true }
  );
  const letterPlan = computeOptimizedPageBreakPlan(
    sampleLessons,
    { ...DEFAULT_SMART_PAGE_BREAK_CONFIG, paperFormat: "LETTER" },
    { columnsCount: 1, includeAnswerWorkspace: true, includeDetailedSolutions: true }
  );
  assert(
    a4Plan.paperWidthMm === 210 &&
      a4Plan.paperHeightMm === 297 &&
      letterPlan.paperWidthMm === 215.9 &&
      letterPlan.paperHeightMm === 279.4 &&
      a4Plan.usableHeightMm > letterPlan.usableHeightMm,
    `Smart Page-Break Optimizer computes accurate A4 (210x297mm, usable ${a4Plan.usableHeightMm}mm) and Letter (215.9x279.4mm, usable ${letterPlan.usableHeightMm}mm) boundaries`
  );
  assert(
    a4Plan.totalProtectedEquations > 0 &&
      a4Plan.totalProtectedTableRows > 0 &&
      a4Plan.cssRules.includes(".katex-display") &&
      a4Plan.cssRules.includes("table, tr, thead") &&
      a4Plan.cssRules.includes("break-inside: avoid-page !important"),
    `Smart Page-Break Optimizer locks ${a4Plan.totalProtectedEquations} equation blocks and ${a4Plan.totalProtectedTableRows} table rows against splitting across pages`
  );

  // 6. Live Page Break Visualizer Overlay Lines
  const overlayLines = computeVisualizerOverlayLines(a4Plan, 2244);
  assert(
    overlayLines.length >= 1 &&
      overlayLines[0].offsetMm > 100 &&
      overlayLines[0].percentageOfTotalHeight >= 12 &&
      overlayLines[0].badgeLabelAr.includes("A4"),
    `Live Page Break Visualizer generates ${overlayLines.length} semi-transparent overlay line(s) at ${overlayLines[0].offsetMm}mm (${overlayLines[0].percentageOfTotalHeight}% height)`
  );

  // 7. Custom Margins (Top, Bottom, Left, Right in mm) & Custom Margin Presets (#printable-document-sheet)
  const savedCustomPreset = saveCustomMarginPresetToStorage({
    nameAr: "قالب اختبار جهوي مخصص 9mm",
    nameFr: "Préréglage Régional 9mm",
    topMm: 9,
    bottomMm: 10,
    leftMm: 8,
    rightMm: 11,
  });
  const customMarginPlan = computeOptimizedPageBreakPlan(
    sampleLessons,
    {
      ...DEFAULT_SMART_PAGE_BREAK_CONFIG,
      paperFormat: "A4",
      marginTopMm: savedCustomPreset.topMm,
      marginBottomMm: savedCustomPreset.bottomMm,
      marginLeftMm: savedCustomPreset.leftMm,
      marginRightMm: savedCustomPreset.rightMm,
    },
    { columnsCount: 1, includeAnswerWorkspace: true, includeDetailedSolutions: true }
  );
  assert(
    BUILT_IN_MARGIN_PRESETS.length >= 4 &&
      savedCustomPreset.id.startsWith("CUSTOM_MARGIN_") &&
      customMarginPlan.usableWidthMm === 210 - (8 + 11) &&
      customMarginPlan.cssRules.includes("#printable-document-sheet") &&
      customMarginPlan.cssRules.includes("margin: 9mm 11mm 10mm 8mm !important"),
    `Custom Margins Studio (#printable-document-sheet) saves custom preset (${savedCustomPreset.topMm}/${savedCustomPreset.bottomMm}/${savedCustomPreset.leftMm}/${savedCustomPreset.rightMm}mm) and computes usable width ${customMarginPlan.usableWidthMm}mm`
  );

  // 8. Vertical Spacing & Document Density Control (.printable-document-sheet)
  const compactDensityPlan = computeOptimizedPageBreakPlan(
    sampleLessons,
    {
      ...DEFAULT_SMART_PAGE_BREAK_CONFIG,
      verticalDensityPreset: "ULTRA_COMPACT",
      exerciseGapMm: 2.0,
      paragraphGapMm: 1.0,
      lineHeightRatio: 1.28,
    },
    { columnsCount: 1, includeAnswerWorkspace: true, includeDetailedSolutions: true }
  );
  const spaciousDensityPlan = computeOptimizedPageBreakPlan(
    sampleLessons,
    {
      ...DEFAULT_SMART_PAGE_BREAK_CONFIG,
      verticalDensityPreset: "SPACIOUS",
      exerciseGapMm: 11.0,
      paragraphGapMm: 4.8,
      lineHeightRatio: 1.72,
    },
    { columnsCount: 1, includeAnswerWorkspace: true, includeDetailedSolutions: true }
  );
  assert(
    VERTICAL_DENSITY_PRESETS.length === 5 &&
      spaciousDensityPlan.exercisesAnalysis[0].estimatedHeightMm >
        compactDensityPlan.exercisesAnalysis[0].estimatedHeightMm &&
      compactDensityPlan.cssRules.includes(".printable-document-sheet .print-exercise-block") &&
      compactDensityPlan.cssRules.includes("margin-bottom: 2mm !important"),
    `Vertical Spacing & Density Control (.printable-document-sheet) scales exercise & paragraph gaps (Compact ${compactDensityPlan.exercisesAnalysis[0].estimatedHeightMm}mm vs Spacious ${spaciousDensityPlan.exercisesAnalysis[0].estimatedHeightMm}mm)`
  );

  // 9. Unique Homework Assignment Solution QR Code Generator
  const hw1Params = {
    homeworkId: "dm_doc_1",
    dmNumber: "N° 1",
    dueDate: "2026-11-15",
    trackCode: "2BAC_PC",
    semester: "S1",
    variationSeed: 0,
    lessonIndices: [0, 1],
  };
  const hw2Params = {
    homeworkId: "dm_doc_2",
    dmNumber: "N° 2",
    dueDate: "2026-12-10",
    trackCode: "2BAC_SM",
    semester: "S1",
    variationSeed: 3,
    lessonIndices: [1, 2],
  };
  const hw1Pin = generateHomeworkAssignmentVerificationCode(hw1Params);
  const hw2Pin = generateHomeworkAssignmentVerificationCode(hw2Params);
  const hw1Url = buildHomeworkSolutionLink(hw1Params);
  const hw2Url = buildHomeworkSolutionLink(hw2Params);
  const hw1QrSvg = renderQrSvgString(hw1Url, 88);
  const hw2QrSvg = renderQrSvgString(hw2Url, 88);
  assert(
    hw1Pin !== hw2Pin &&
      hw1Url !== hw2Url &&
      hw1Url.includes("dm_solution=1") &&
      hw1Url.includes("hw_id=dm_doc_1") &&
      hw1Url.endsWith("#homework-solution-sheet") &&
      hw1QrSvg !== hw2QrSvg,
    `Unique Homework QR Generator creates distinct PINs (${hw1Pin} vs ${hw2Pin}), direct #homework-solution-sheet links, and distinct SVG QR matrices`
  );
} catch (e: any) {
  assert(false, `Section 21 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 22. TEST ALL 5 PROPOSALS: ASYMPTOTE ENGINE, HYBRID COMPOSER & PROGRESSIVE HINTS
// ----------------------------------------------------------------------
console.log("\n--- 22. Testing Asymptote Engine, Hybrid Composer & Progressive Hints ---");
try {
  // Test 22.1: Homographic Asymptote Analysis
  const homographicRes = analyzeFunctionAsymptotesAndCurve("f(x) = (2*x + 1)/(x - 1)");
  assert(
    homographicRes.asymptotes.length >= 2 &&
      homographicRes.asymptotes.some((a) => a.type === "VERTICAL" && a.equationPlain === "x = 1") &&
      homographicRes.asymptotes.some((a) => a.type === "HORIZONTAL" && a.equationPlain === "y = 2") &&
      homographicRes.tikzSnippet.includes("tikzpicture") &&
      homographicRes.svgMarkup.includes("<svg"),
    `Asymptote Engine: Deduces vertical (x=1) & horizontal (y=2) asymptotes, generates LaTeX TikZ and vector SVG`
  );

  // Test 22.2: Oblique Asymptote Analysis
  const obliqueRes = analyzeFunctionAsymptotesAndCurve("f(x) = (x^2 + 1)/(x - 1)");
  assert(
    obliqueRes.asymptotes.some((a) => a.type === "OBLIQUE") &&
      obliqueRes.domainLatex.includes("setminus"),
    `Asymptote Engine: Correctly detects oblique asymptote y=ax+b and formats domain LaTeX`
  );

  // Test 22.3: Exponential Asymptote Analysis
  const expRes = analyzeFunctionAsymptotesAndCurve("f(x) = exp(-x) + 2");
  assert(
    expRes.asymptotes.some((a) => a.type === "HORIZONTAL" && a.equationPlain === "y = 2"),
    `Asymptote Engine: Identifies horizontal asymptote y=2 for exponential function`
  );

  // Test 22.4: Time-locked Progressive Hints Deadline Comparison Logic
  const pastDueDate = "2020-01-01";
  const futureDueDate = "2099-12-31";
  const todayIso = new Date().toISOString().split("T")[0];
  const isPastLocked = todayIso < pastDueDate;
  const isFutureLocked = todayIso < futureDueDate;
  assert(
    !isPastLocked && isFutureLocked,
    `Time-Locked Homework Engine: Past due date (2020) unlocks full solution, future date (2099) reveals progressive hints and locks solution`
  );

  // Test 22.5: Hybrid Composer 20/20 Weight Auto-Normalization
  const rawWeights = [30, 40, 50]; // sum = 120
  const normalized20 = rawWeights.map((w) => Number(((w / 120) * 20).toFixed(1)));
  const normalizedSum = normalized20.reduce((a, b) => a + b, 0);
  assert(
    Math.abs(normalizedSum - 20) <= 0.2,
    `Hybrid Exam Composer: Automatically normalizes raw multi-chapter weights to exact 20/20 total points (sum: ${normalizedSum})`
  );
} catch (e: any) {
  assert(false, `Section 22 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 23. TEST NOTE 142-08 EVALUATION GRID TEMPLATES LIBRARY & DIRECT EDITOR
// ----------------------------------------------------------------------
console.log("\n--- 23. Testing Note 142-08 Evaluation Grid Templates Library & Direct Editor ---");
try {
  assert(
    EVAL_GRID_TEMPLATES_142_08.length === 6 &&
      EVAL_GRID_TEMPLATES_142_08.every(
        (t) =>
          t.defaultConfig.recommendedN1 +
            t.defaultConfig.recommendedN2 +
            t.defaultConfig.recommendedN3 ===
          100
      ),
    `Note 142-08 Evaluation Grid Library provides 6 official templates with valid N1+N2+N3 = 100% taxonomic distributions`
  );

  const track2Bac = CURRICULUM_DB["2BAC_PC"];
  const lessons2Bac = track2Bac.semesters.S1.DS1;
  const baseGrid = buildCustomEvaluationGrid({
    track: track2Bac,
    sem: "S1",
    dsKey: "DS1",
    dmSubType: "DEVOIR_MAISON",
    dmNumber: "N° 1",
    activeModule: "DS_142_08",
    lessons: lessons2Bac,
    n1: 45,
    n2: 40,
    n3: 15,
  });

  const diagConfig = createCustomConfigFromTemplate("DIAGNOSTIC_ERROR_TAXONOMY_GRID");
  const firstQCode = baseGrid.allQuestions[0]?.questionCode || "Ex1-Q1";
  diagConfig.customTitleAr = "شبكة تقويم معدلة مباشرة في لوحة إعدادات التقويم (142-08)";
  diagConfig.questionOverrides[firstQCode] = {
    capacityAr: "قدرة مخصصة: حساب نهاية دالة مركبة باستعمال المرافق",
    levelCode: "N3",
    points: 2.25,
    remediationCriterionAr: "تذكير بالمرافق الجبري وإزالة الشكل غير المحدد",
  };

  const customizedGrid = applyEvalGridCustomConfigToGridData(baseGrid, diagConfig);
  const modifiedFirstQ = customizedGrid.allQuestions.find(
    (q) => q.questionCode === firstQCode
  );
  const masteryStr = formatMasteryScaleCheckboxText(diagConfig, false);

  assert(
    customizedGrid.titleAr === "شبكة تقويم معدلة مباشرة في لوحة إعدادات التقويم (142-08)" &&
      modifiedFirstQ?.capacityAr === "قدرة مخصصة: حساب نهاية دالة مركبة باستعمال المرافق" &&
      modifiedFirstQ?.levelCode === "N3" &&
      modifiedFirstQ?.points === 2.25 &&
      masteryStr.includes("خطأ مفاهيمي (C)"),
    `Direct Evaluation Grid Editor applies custom title, mastery scale (${masteryStr}), and per-question capacity/level/points overrides`
  );
} catch (e: any) {
  assert(false, `Section 23 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 24. TEST INTERACTIVE READING MODE (وضع القراءة وتكبير نص التمارين)
// ----------------------------------------------------------------------
console.log("\n--- 24. Testing Interactive Reading Mode (وضع القراءة وتكبير نص التمارين) ---");
try {
  assert(
    DEFAULT_READING_MODE_CONFIG.enabled === false &&
      DEFAULT_READING_MODE_CONFIG.exerciseScalePercent === 125 &&
      DEFAULT_READING_MODE_CONFIG.spreadLayoutMode === "SINGLE_PAGE" &&
      READING_MODE_SCALE_PRESETS.length === 4 &&
      READING_MODE_PAPER_TONES.length === 3,
    `Reading Mode defaults to single-page view (125% exercise scale) with 4 magnification presets (115%–150%) and 3 eye-friendly paper tones`
  );

  const disabledCss = buildReadingModeStylesheet({
    ...DEFAULT_READING_MODE_CONFIG,
    enabled: false,
  });
  const activeCss135 = buildReadingModeStylesheet({
    enabled: true,
    exerciseScalePercent: 135,
    paperTone: "WARM_CREAM",
    spreadLayoutMode: "SINGLE_PAGE",
    lineHeightRatio: 1.85,
    hideAllSideControls: true,
    highlightExerciseCards: true,
  });
  const facingPagesCss = buildReadingModeStylesheet({
    enabled: true,
    exerciseScalePercent: 125,
    paperTone: "WARM_CREAM",
    spreadLayoutMode: "FACING_PAGES",
    lineHeightRatio: 1.85,
    hideAllSideControls: true,
    highlightExerciseCards: true,
  });

  assert(
    disabledCss === "" &&
      activeCss135.includes('@media screen') &&
      activeCss135.includes('#printable-document-sheet[data-reading-mode="true"]') &&
      activeCss135.includes('#fdfbf4') &&
      activeCss135.includes('.katex') &&
      facingPagesCss.includes('[data-reading-spread="FACING_PAGES"]') &&
      facingPagesCss.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'),
    `Reading Mode stylesheet generator produces single-page and dual-facing pages rules (repeat(2, minmax(0, 1fr)), middle book-fold divider) optimized for tablets and laptops`
  );
} catch (e: any) {
  assert(false, `Section 24 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 25. TEST PEDAGOGICAL FAVORITES & SMART DUAL-EXAM COMPARISON
// ----------------------------------------------------------------------
console.log("\n--- 25. Testing Pedagogical Favorites & Smart Dual-Exam Comparison ---");
try {
  const {
    loadPedagogicalFavorites,
    toggleFavoriteItem,
    isItemInFavorites,
    savePedagogicalFavorites,
  } = await import("./src/utils/pedagogicalFavorites.ts");

  // Test 1: Defaults load properly
  const initialFavs = loadPedagogicalFavorites();
  assert(
    Array.isArray(initialFavs) && initialFavs.length >= 4,
    `Pedagogical favorites library initializes with rich default items (${initialFavs.length} curated templates)`
  );

  const hasBlueprint = initialFavs.some((f) => f.type === "EXAM_BLUEPRINT");
  const hasCustomExercise = initialFavs.some((f) => f.type === "CUSTOM_EXERCISE");
  assert(
    hasBlueprint && hasCustomExercise,
    `Favorites include both full exam blueprints (EXAM_BLUEPRINT) and standalone custom exercises (CUSTOM_EXERCISE)`
  );

  // Test 2: isItemInFavorites lookup
  const firstFav = initialFavs[0];
  assert(
    isItemInFavorites(initialFavs, firstFav.type, firstFav.id),
    `isItemInFavorites correctly matches saved items by type and ID`
  );
  assert(
    !isItemInFavorites(initialFavs, firstFav.type, "NON_EXISTENT_ID_999"),
    `isItemInFavorites returns false for non-existent items`
  );

  // Test 3: toggleFavoriteItem (add new, then toggle off)
  const testItem = {
    id: "TEST_CUSTOM_EX_1",
    type: "CUSTOM_EXERCISE" as const,
    titleAr: "تمرين تجريبي: حساب التكاملات والمساحات",
    titleFr: "Exercice test: Calcul intégral",
    trackCode: "2BAC_PC",
    trackLabelAr: "الثانية باك علوم فيزيائية",
    semester: "S2" as const,
    createdAt: new Date().toISOString(),
    tags: ["تكامل", "مساحات"],
    exerciseData: {
      lessonAr: "حساب التكامل",
      lessonFr: "Calcul intégral",
      category: "INTEGRATION",
      weight: 30,
      defaultBareme: 6.0,
      targetSkills: { n1: 2, n2: 3, n3: 1 },
    },
  };

  const withItem = toggleFavoriteItem(initialFavs, testItem);
  assert(
    isItemInFavorites(withItem, "CUSTOM_EXERCISE", "TEST_CUSTOM_EX_1"),
    `toggleFavoriteItem successfully inserts new custom exercise into favorites`
  );

  const withoutItem = toggleFavoriteItem(withItem, testItem);
  assert(
    !isItemInFavorites(withoutItem, "CUSTOM_EXERCISE", "TEST_CUSTOM_EX_1"),
    `toggleFavoriteItem successfully toggles off and removes the item from favorites`
  );

  // Test 4: Dual-Exam Didactic Parity & Comparison Calculation
  const { computeDualModelABComparison } = await import("./src/utils/sevenStrategicProposalsEngine.ts");
  const pcLessons = CURRICULUM_DB["2BAC_PC"].semesters.S1["DS1"];
  const comp = computeDualModelABComparison(pcLessons, false);

  assert(
    comp &&
      typeof comp.isomorphismScorePct === "number" &&
      comp.isomorphismScorePct >= 80 &&
      comp.exercises.length > 0 &&
      comp.totalPointsA === 20 &&
      comp.totalPointsB === 20,
    `Smart Dual-Exam Comparison validates total parity (20.0 pts each), high didactic alignment score (${comp?.isomorphismScorePct}%), and exercise-by-exercise comparison cards`
  );
} catch (e: any) {
  assert(false, `Section 25 test crashed: ${e.message}`);
}

// =========================================================================
// SECTION 26: Interactive LMS Export (Moodle / Google Classroom / IMS QTI) & OCR Image Enhancement
// =========================================================================
console.log("\n=== 26. Interactive LMS Export & OCR Image Enhancement Tests ===");

try {
  const {
    exportExamToMoodleXMLAdvanced,
    exportExamToMoodleGIFT,
    exportGoogleClassroomRubricCSV,
    exportInteractiveClassroomQuizHTML,
    exportExamToImsQti21XML,
    generateLmsExportArtifact,
  } = await import("./src/utils/lmsExporter.ts");

  const {
    OCR_ENHANCE_PRESETS,
    enhanceImageDataBuffer,
  } = await import("./src/utils/ocrImageEnhancer.ts");

  const sampleLessons = CURRICULUM_DB["2BAC_PC"].semesters.S1["DS1"];
  const lmsConfig = {
    examTitleAr: "الفرض المحروس رقم 1 — الدورة الأولى",
    examTitleFr: "Devoir Surveillé N°1 — S1",
    trackCode: "2BAC_PC",
    trackLabelAr: "الثانية باك علوم فيزيائية",
    semester: "S1" as const,
    dsKey: "DS1",
    school: "الثانوية التأهيلية للرياضيات",
    prof: "ذ. إبراهيم كوزيبر",
    year: "2025/2026",
    lessons: sampleLessons,
    n1: 35,
    n2: 45,
    n3: 20,
    durationMinutes: 120,
    includeQcmSection: true,
    qcmQuestionCount: 4,
    includeDetailedSolutionsAsFeedback: true,
    language: "BILINGUAL" as const,
  };

  // Test 1: Moodle XML Advanced
  const moodleXml = exportExamToMoodleXMLAdvanced(lmsConfig);
  assert(
    moodleXml.includes("<quiz>") &&
      moodleXml.includes('<question type="multichoice">') &&
      moodleXml.includes('<question type="essay">') &&
      moodleXml.includes("<graderinfo") &&
      moodleXml.includes("MENPS_2BAC_PC"),
    `exportExamToMoodleXMLAdvanced generates valid Moodle 4.x XML with QCM multichoice, essay 142-08 graderinfo, and track category`
  );

  // Test 2: Moodle GIFT Format
  const gift = exportExamToMoodleGIFT(lmsConfig);
  assert(
    gift.includes("$CATEGORY:") &&
      gift.includes("::QCM_1::") &&
      gift.includes("=") &&
      gift.includes("~"),
    `exportExamToMoodleGIFT generates valid Moodle GIFT bank with correct/distractor prefixes`
  );

  // Test 3: Google Classroom Rubric CSV
  const rubricCsv = exportGoogleClassroomRubricCSV(lmsConfig);
  assert(
    rubricCsv.startsWith("\uFEFF") &&
      rubricCsv.includes("Criterion Title,Criterion Description") &&
      rubricCsv.includes("Level 4 Points") &&
      rubricCsv.includes("إتقان متميز (N3)"),
    `exportGoogleClassroomRubricCSV emits UTF-8 BOM CSV compatible with Google Classroom Rubrics import`
  );

  // Test 4: Google Classroom Interactive HTML5 Quiz
  const classroomHtml = exportInteractiveClassroomQuizHTML(lmsConfig);
  assert(
    classroomHtml.includes("<!DOCTYPE html>") &&
      classroomHtml.includes("evaluateQuiz()") &&
      classroomHtml.includes("timerDisplay") &&
      classroomHtml.includes("katex"),
    `exportInteractiveClassroomQuizHTML generates standalone interactive quiz with KaTeX math, live timer, and auto-grader`
  );

  // Test 5: IMS QTI 2.1 XML & unified generator
  const qti = exportExamToImsQti21XML(lmsConfig);
  const artifact = generateLmsExportArtifact("GOOGLE_CLASSROOM_HTML_QUIZ", lmsConfig);
  assert(
    qti.includes("imsqti_v2p1") &&
      qti.includes("<choiceInteraction") &&
      artifact.fileName.endsWith("_Google_Classroom_Quiz.html") &&
      artifact.content.length > 500,
    `exportExamToImsQti21XML and generateLmsExportArtifact produce valid QTI 2.1 and Classroom artifacts`
  );

  // Test 6: OCR Image Enhancement contrast stretch, sharpening & binarization on synthetic low-contrast buffer
  const w = 16;
  const h = 16;
  const rawRgba = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      // Low-contrast muddy background (~175 gray) with faint dark ink stroke (~125) and a blue grid line
      const isInk = x >= 6 && x <= 9 && y >= 4 && y <= 11;
      const isBlueGrid = y === 2 && !isInk;
      if (isInk) {
        rawRgba[idx] = 122;
        rawRgba[idx + 1] = 124;
        rawRgba[idx + 2] = 126;
      } else if (isBlueGrid) {
        rawRgba[idx] = 140;
        rawRgba[idx + 1] = 175;
        rawRgba[idx + 2] = 220;
      } else {
        rawRgba[idx] = 175;
        rawRgba[idx + 1] = 176;
        rawRgba[idx + 2] = 174;
      }
      rawRgba[idx + 3] = 255;
    }
  }

  const { enhancedRgba, diagnostics } = enhanceImageDataBuffer(
    rawRgba,
    w,
    h,
    OCR_ENHANCE_PRESETS.HANDWRITTEN_PENCIL
  );

  const sampleInkAfter = enhancedRgba[(7 * w + 7) * 4];
  const sampleBgAfter = enhancedRgba[(1 * w + 1) * 4];

  assert(
    diagnostics.contrastAfterPct > diagnostics.contrastBeforePct &&
      diagnostics.contrastGainPct > 20 &&
      sampleBgAfter - sampleInkAfter > 150 &&
      diagnostics.foregroundInkRatioPct > 0,
    `enhanceImageDataBuffer significantly improves contrast (${diagnostics.contrastBeforePct}% -> ${diagnostics.contrastAfterPct}%) and separates faint ink (${sampleInkAfter}) from background (${sampleBgAfter})`
  );
} catch (e: any) {
  assert(false, `Section 26 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 27. TEST ARCHITECTURE, SECURITY, OCR LATEX SANITIZER, CACHE & FONTS
// ----------------------------------------------------------------------
console.log("\n--- 27. Testing 6-Proposal Upgrades (Sanitizer, API Guard, Storage, Cache, Fonts) ---");
try {
  // 27.1 Proposal 5: Strict OCR LaTeX Sanitizer & Auto-Repair
  const dirtyOcr = "بين أن $\\frac a b + √(x+1) ≤ 3 \\times x$ و $lim_{x→+∞} ln(x)$ حيث $x ∈ ℝ";
  const sanRes = sanitizeOcrMathString(dirtyOcr, false);
  const dollarCount = (sanRes.sanitized.match(/\$/g) || []).length;
  assert(
    sanRes.fixesCount > 0 &&
      sanRes.sanitized.includes("\\frac{a}{b}") &&
      sanRes.sanitized.includes("\\sqrt{x+1}") &&
      sanRes.sanitized.includes("\\le") &&
      sanRes.sanitized.includes("\\lim_") &&
      sanRes.sanitized.includes("\\ln(") &&
      sanRes.sanitized.includes("\\mathbb{R}") &&
      dollarCount % 2 === 0 &&
      sanRes.integrityScorePct >= 70,
    `sanitizeOcrMathString auto-repaired shorthand/Unicode LaTeX & unbalanced $ (${sanRes.fixesCount} fixes, integrity=${sanRes.integrityScorePct}%)`
  );

  const mockOcrMapping = {
    exercises: [
      {
        id: "ex_ocr_1",
        titleAr: "تمرين مستخرج",
        titleFr: "Exercice extrait",
        questionsAr: ["احسب $lim_{x→0} \\frac{\\sin(x)}{x}$ و $\\sqrt x ≥ 0$"],
        questionsFr: ["Calculer $ln(x) ≤ x$ pour $x ∈ ℝ$"],
        solutionsAr: ["بما أن $\\frac 1 2 ≤ 1$ إذن..."],
        solutionsFr: ["Comme $\\frac 1 2 \\le 1$ alors..."],
      },
    ],
  };
  const mappingSan = validateAndSanitizeOcrMapping(mockOcrMapping);
  assert(
    mappingSan.summary.fixesAppliedCount > 0 &&
      mappingSan.summary.expressionsCheckedCount === 6 &&
      mappingSan.sanitizedMapping.exercises[0].questionsAr[0].includes("\\lim_") &&
      mappingSan.sanitizedMapping.exercises[0].questionsAr[0].includes("\\sqrt{x}"),
    `validateAndSanitizeOcrMapping checked ${mappingSan.summary.expressionsCheckedCount} fields with ${mappingSan.summary.fixesAppliedCount} repairs`
  );

  const mockGradingReport = {
    transcribedStudentLatex: "لدينا $√x ≤ 2$ إذن $x ∈ ℝ$",
    gradedItems: [
      {
        studentAnswerLatex: "\\frac a b + √(x+1) ≤ 5",
        referenceSolutionLatex: "\\frac{a}{b} + \\sqrt{x+1} \\le 5",
      },
    ],
    printableRemediationSheet: {
      remediationExercises: [
        {
          questionsAr: ["حل المتراجحة $ln(x) ≤ 0$"],
          questionsFr: ["Résoudre $ln(x) ≤ 0$"],
          solutionHintAr: "استعمل الدالة العكسية $exp(0) = 1$",
        },
      ],
    },
  };
  const gradeSan = validateAndSanitizeGradingReport(mockGradingReport);
  assert(
    gradeSan.summary.fixesAppliedCount > 0 &&
      gradeSan.sanitizedReport.gradedItems[0].studentAnswerLatex.includes("\\frac{a}{b}") &&
      gradeSan.sanitizedReport.printableRemediationSheet.remediationExercises[0].solutionHintAr.includes("\\exp("),
    `validateAndSanitizeGradingReport normalized student/reference/remediation LaTeX (${gradeSan.summary.fixesAppliedCount} repairs)`
  );

  // 27.2 Proposal 3: API Guard (Payload Validation, Rate Limiter, Security & Gzip)
  const badMimeRes = validateOcrPayload({ fileMimeType: "application/zip", fileBase64: "AAAA" });
  const bigPayloadRes = validateOcrPayload({
    fileMimeType: "image/png",
    fileBase64: "A".repeat(12 * 1024 * 1024 + 64),
  });
  const okPayloadRes = validateOcrPayload({
    fileMimeType: "image/png",
    fileBase64: "iVBORw0KGgo=",
  });
  assert(
    !badMimeRes.valid &&
      badMimeRes.statusCode === 400 &&
      !bigPayloadRes.valid &&
      bigPayloadRes.statusCode === 413 &&
      okPayloadRes.valid,
    `validateOcrPayload enforces allowed MIME types (400) & 12MB cap (413) while permitting valid PNG`
  );

  const limiter = createApiRateLimiter({ windowMs: 60000, maxRequests: 2, labelAr: "اختبار" });
  let nextCalls = 0;
  let lastStatus = 200;
  let lastBody: any = null;
  const headersMap: Record<string, string> = {};
  const mockReq: any = { headers: { "x-forwarded-for": "10.0.0.99" }, ip: "10.0.0.99" };
  const mockRes: any = {
    statusCode: 200,
    setHeader(k: string, v: string) {
      headersMap[k] = v;
    },
    status(code: number) {
      lastStatus = code;
      this.statusCode = code;
      return this;
    },
    json(body: any) {
      lastBody = body;
      return this;
    },
  };
  limiter(mockReq, mockRes, () => { nextCalls++; });
  limiter(mockReq, mockRes, () => { nextCalls++; });
  limiter(mockReq, mockRes, () => { nextCalls++; });
  assert(
    nextCalls === 2 &&
      lastStatus === 429 &&
      Boolean(headersMap["Retry-After"]) &&
      typeof lastBody?.error === "string",
    `createApiRateLimiter allowed 2 requests and blocked 3rd with HTTP 429 + Retry-After`
  );
  limiter.reset();
  assert(limiter.getTrackedClientsCount() === 0, `rateLimiter.reset() cleared tracked buckets`);

  // Security headers + gzip compression middleware
  const secHeaders: Record<string, string> = {};
  let compressedSent: any = null;
  const gzipReq: any = { headers: { "accept-encoding": "gzip, deflate" } };
  const gzipRes: any = {
    statusCode: 200,
    headersSent: false,
    setHeader(k: string, v: string) {
      secHeaders[k] = v;
    },
    status(c: number) {
      this.statusCode = c;
      return this;
    },
    json(body: any) {
      return body;
    },
    send(payload: any) {
      compressedSent = payload;
      return this;
    },
  };
  let secNextCalled = false;
  securityAndCompressionMiddleware(gzipReq, gzipRes, () => { secNextCalled = true; });
  gzipRes.json({ largeData: "X".repeat(3000) });
  assert(
    secNextCalled &&
      secHeaders["X-Content-Type-Options"] === "nosniff" &&
      Boolean(secHeaders["Referrer-Policy"]) &&
      !secHeaders["X-Frame-Options"] &&
      secHeaders["Content-Encoding"] === "gzip" &&
      Buffer.isBuffer(compressedSent) &&
      compressedSent.length < 3000,
    `securityAndCompressionMiddleware sets iframe-safe headers and gzips large JSON (${compressedSent?.length} bytes < 3000)`
  );

  // 27.3 Proposal 1 & 2: Extracted Storage + Cached Curriculum Slices
  const seededHistory = getInitialSeededExportHistory(undefined, "S1");
  assert(seededHistory.length >= 5, `getInitialSeededExportHistory returns seeded entries (${seededHistory.length})`);

  const memStore = new Map<string, string>();
  const prevLocalStorage = (globalThis as any).localStorage;
  try {
    (globalThis as any).localStorage = {
      getItem: (k: string) => memStore.get(k) ?? null,
      setItem: (k: string, v: string) => { memStore.set(k, String(v)); },
      removeItem: (k: string) => { memStore.delete(k); },
    };
    const loaded = loadExportHistory(undefined, "S1");
    assert(loaded.length >= 5, `loadExportHistory initializes storage safely`);

    let latestList = loaded;
    for (let i = 0; i < 28; i++) {
      latestList = recordExportHistoryEntry({
        fileName: `doc_${i}.tex`,
        formatLabel: "LaTeX",
        category: "LATEX_TYPST",
        trackCode: "2BAC_SM",
        trackLabelAr: "2BAC SM",
        semester: "S1",
        moduleType: "DS_142_08",
        modelCode: "A",
        fileSizeKb: 12,
        dpiOrCompiler: "XeLaTeX",
        cachedContent: `% content ${i}`,
      });
    }
    const entriesWithContentAfter5 = latestList.slice(5).filter((e) => Boolean(e.cachedContent));
    assert(
      latestList.length === 25 && entriesWithContentAfter5.length === 0,
      `recordExportHistoryEntry enforces 25-entry cap and keeps cachedContent only on top 5`
    );
  } finally {
    if (prevLocalStorage === undefined) {
      delete (globalThis as any).localStorage;
    } else {
      (globalThis as any).localStorage = prevLocalStorage;
    }
  }

  const fallbackPrefs = loadInitialPrefs();
  assert(
    fallbackPrefs.educationSystem === DEFAULT_PREFS.educationSystem &&
      fallbackPrefs.selectedTrackCode === DEFAULT_PREFS.selectedTrackCode,
    `loadInitialPrefs returns DEFAULT_PREFS safely in non-DOM/SSR context`
  );

  const cachedTrack = getCurriculumTrackCached("2BAC_PC");
  const maroc2BacTracks = getCurriculumTracksByCycleCached("MAROC_NATIONAL", "2BAC");
  const s1SmLessons = getSemesterLessonsFlattenedCached("2BAC_SM", "S1");
  const statsSummary = getCurriculumStatsSummary();
  assert(
    Boolean(cachedTrack && cachedTrack.code === "2BAC_PC") &&
      maroc2BacTracks.length >= 2 &&
      s1SmLessons.length > 0 &&
      statsSummary.totalTracks > 5 &&
      statsSummary.totalLessons > 20,
    `curriculumSliceHelper caches tracks (${statsSummary.totalTracks} tracks, ${statsSummary.totalLessons} lessons)`
  );

  // 27.4 Proposal 4: Lazy Font Loading Guard
  assert(
    CORE_PRELOADED_FONTS.length === 5 &&
      !shouldLoadDecorativeFonts({
        docFontFamily: "ACADEMIC_SERIF",
        calligraphyFontId: "DEFAULT_DOC",
        isCalligraphyModalOpen: false,
      }) &&
      shouldLoadDecorativeFonts({
        docFontFamily: "HANDWRITTEN_SCRIPT",
        calligraphyFontId: "DEFAULT_DOC",
        isCalligraphyModalOpen: false,
      }) &&
      shouldLoadDecorativeFonts({
        docFontFamily: "ACADEMIC_SERIF",
        calligraphyFontId: "DEFAULT_DOC",
        isCalligraphyModalOpen: true,
      }),
    `lazyFontsLoader keeps 5 core preloaded fonts and triggers 18 calligraphy fonts strictly on-demand`
  );
} catch (e: any) {
  assert(false, `Section 27 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 28. TEST CAMERA OMR AUTO-GRADING & READING MODE EXERCISE TYPE ICONS
// ----------------------------------------------------------------------
console.log("\n--- 28. Testing Camera OMR Auto-Grader & Reading Mode Exercise Type Icons ---");
try {
  // 28.1 Camera OMR Fiducial Alignment & Stability Detection
  const w = 120;
  const h = 100;
  const simFrame = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    // Slightly shadowed paper background (~210 luminance)
    simFrame[i * 4] = 210;
    simFrame[i * 4 + 1] = 212;
    simFrame[i * 4 + 2] = 214;
    simFrame[i * 4 + 3] = 255;
  }

  // Paint 4 dark corner fiducial registration squares
  const paintDarkRect = (x0: number, y0: number, rw: number, rh: number, gray = 15) => {
    for (let y = y0; y < Math.min(h, y0 + rh); y++) {
      for (let x = x0; x < Math.min(w, x0 + rw); x++) {
        const idx = (y * w + x) * 4;
        simFrame[idx] = gray;
        simFrame[idx + 1] = gray;
        simFrame[idx + 2] = gray;
      }
    }
  };
  paintDarkRect(5, 4, 10, 8, 12); // TL
  paintDarkRect(w - 15, 4, 10, 8, 12); // TR
  paintDarkRect(5, h - 12, 10, 8, 12); // BL
  paintDarkRect(w - 15, h - 12, 10, 8, 12); // BR

  // Shade Model 'B' bubble in the header (mIdx = 1 -> x = 0.52 + 0.09 = 0.61 * w, y = 0.14 * h)
  paintDarkRect(Math.round(w * 0.61) - 2, Math.round(h * 0.14) - 2, 5, 5, 18);

  // Shade Question 1 -> Option C (optIdx = 2 -> x = 0.30 + 2*0.14 = 0.58 * w, y = 0.24 * h)
  paintDarkRect(Math.round(w * 0.58) - 2, Math.round(h * 0.24) - 2, 5, 5, 15);

  const fiducialRes = detectOmrFiducialAlignmentAndStability({
    currentRgba: simFrame,
    previousRgba: simFrame, // Steady frame (0 motion delta)
    width: w,
    height: h,
  });

  assert(
    fiducialRes.cornersLockedCount === 4 &&
      fiducialRes.stabilityScorePct === 100 &&
      fiducialRes.alignmentScorePct >= 90 &&
      fiducialRes.isReadyForAutoGrade,
    `detectOmrFiducialAlignmentAndStability locks 4/4 fiducial corners (alignment=${fiducialRes.alignmentScorePct}%, stability=${fiducialRes.stabilityScorePct}%)`
  );

  // 28.2 Shadow Compensation & Header Model + Bubble Darkness Extraction
  const preproc = preprocessOmrCameraFrameRgba({
    rgba: simFrame,
    width: w,
    height: h,
    questionCount: 5,
    fallbackModel: "A",
    enableShadowCompensation: true,
  });

  assert(
    preproc.detectedModelFromHeader === "B" &&
      preproc.normalizedBubbleDarknessMatrix.length === 5 &&
      preproc.normalizedBubbleDarknessMatrix[0][2] > preproc.normalizedBubbleDarknessMatrix[0][0] + 40,
    `preprocessOmrCameraFrameRgba auto-detects Model '${preproc.detectedModelFromHeader}' from header and isolates shaded Q1 Option C (${preproc.normalizedBubbleDarknessMatrix[0][2]} vs ${preproc.normalizedBubbleDarknessMatrix[0][0]})`
  );

  // 28.3 Full Auto-Grading Engine & Batch Re-Grading
  const testKey: Record<number, "A" | "B" | "C" | "D"> = {
    1: "C",
    2: "A",
    3: "B",
    4: "D",
    5: "A",
  };
  const customMatrix = [
    [30, 35, 210, 28], // Q1: C (Correct)
    [205, 30, 32, 29], // Q2: A (Correct)
    [30, 200, 196, 30], // Q3: B & C double-marked!
    [32, 35, 30, 33], // Q4: Blank
    [30, 195, 32, 28], // Q5: B (Wrong, expected A)
  ];

  const autoReport = autoGradeScannedOmrSheet({
    studentName: "سلمى الإدريسي",
    bubbleDarknessMatrix: customMatrix,
    answerKey: testKey,
    detectedModel: "B",
    pointsPerQuestion: 2,
    negativeMarkingPenalty: 0.25,
  });

  assert(
    autoReport.correctCount === 2 &&
      autoReport.wrongCount === 1 &&
      autoReport.blankCount === 1 &&
      autoReport.doubleMarkedCount === 1 &&
      autoReport.score === 3.5 &&
      autoReport.maxScore === 10,
    `autoGradeScannedOmrSheet accurately scores correct/wrong/blank/double-marked with -0.25 penalty (score=${autoReport.score}/${autoReport.maxScore})`
  );

  const regradedList = regradeScannedStudentResults({
    results: [
      {
        id: "r1",
        studentName: "سلمى الإدريسي",
        model: "A" as const,
        answers: { 1: "C", 2: "A", 3: "B", 4: "D", 5: "A" },
        score: 2,
        maxScore: 10,
        correctCount: 1,
      },
    ],
    answerKeysByModel: {
      A: testKey,
      B: testKey,
      C: testKey,
      D: testKey,
    },
    questionCount: 5,
    pointsPerQuestion: 4,
    negativeMarkingPenalty: 0,
  });

  assert(
    regradedList[0].correctCount === 5 &&
      regradedList[0].score === 20 &&
      regradedList[0].maxScore === 20,
    `regradeScannedStudentResults recalculates roster scores on answer key / bareme update (20/20)`
  );

  // 28.4 Reading Mode Custom Mathematical Exercise Type Icons & Navigator
  const catalogKeys = Object.keys(READING_MODE_EXERCISE_TYPE_SPECS);
  assert(
    catalogKeys.length === 8 &&
      READING_MODE_EXERCISE_TYPE_SPECS.FUNCTION.mathSymbol === "f(x)" &&
      READING_MODE_EXERCISE_TYPE_SPECS.SEQUENCE.mathSymbol === "(uₙ)" &&
      READING_MODE_EXERCISE_TYPE_SPECS.GEOMETRY.mathSymbol === "△" &&
      READING_MODE_EXERCISE_TYPE_SPECS.COMPLEX.mathSymbol === "ℂ" &&
      READING_MODE_EXERCISE_TYPE_SPECS.PROBABILITY.mathSymbol === "P(A)" &&
      READING_MODE_EXERCISE_TYPE_SPECS.INTEGRAL.mathSymbol === "∫",
    `READING_MODE_EXERCISE_TYPE_SPECS defines all 8 mathematical exercise type icons & symbols`
  );

  const sampleTrackLessons = CURRICULUM_DB["2BAC_PC"]?.semesters.S1.DS1 || [];
  const navItems = buildReadingModeExerciseNavigatorItems(sampleTrackLessons, {
    hasSynthesisProblem: true,
    synthesisProblemTitleAr: "المسألة التوليفية للدوال اللوغاريتمية",
  });

  assert(
    navItems.length === sampleTrackLessons.length + 1 &&
      navItems[0].domAnchorId === "reading-mode-exercise-1" &&
      Boolean(navItems[0].iconId) &&
      navItems[navItems.length - 1].domAnchorId === "reading-mode-synthesis-problem" &&
      Boolean(navItems[navItems.length - 1].isSynthesisProblem),
    `buildReadingModeExerciseNavigatorItems maps ${navItems.length} exercises + synthesis problem to custom math icons & DOM anchors`
  );

  const filteredReadingCss = buildReadingModeStylesheet({
    ...DEFAULT_READING_MODE_CONFIG,
    enabled: true,
    activeExerciseFilterIconId: "COMPLEX",
  });

  assert(
    filteredReadingCss.includes("[data-reading-exercise-anchor]") &&
      filteredReadingCss.includes('[data-reading-exercise-icon-badge="true"]') &&
      filteredReadingCss.includes('[data-exercise-icon-type="COMPLEX"]'),
    `buildReadingModeStylesheet injects smooth anchor scroll margins, enlarged exercise icon badges, and type focus filter rules`
  );
} catch (e: any) {
  assert(false, `Section 28 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 29. TEST ARABIC MATHEMATICAL NOTATION OCR ENGINE & QUICK SCAN BAREME GRADERS
// ----------------------------------------------------------------------
console.log(
  "\n--- 29. Testing Arabic Mathematical Notation OCR Engine & Quick Scan Handwritten Marks Bareme Grader ---"
);
try {
  const {
    ARABIC_MATH_NOTATION_DICTIONARY,
    transpileArabicMathNotationToLatex,
    sanitizeOcrMathString,
  } = await import("./src/utils/ocrLatexSanitizer.ts");
  const {
    buildLoadedExamBaremeItems,
    extractHandwrittenRedPenMarksFromRgba,
    evaluateQuickScanHandwrittenSheet,
  } = await import("./src/utils/sevenStrategicProposalsEngine.ts");

  // 29.1 Arabic Mathematical Notation OCR Transpiler
  const legacyArabicSample =
    "نعتبر الدالة $د(س) = جذر(س + ١) + جا(س) - جتا(س) + لو(س)$ لكل $س ∈ ح*+$ والمتتالية $(ح_ن)$ حيث $ح_٠ = ٢$، أحسب $نها_{س ← +∞} د(س)$ و $د'(س)$.";
  const arabicDiag = transpileArabicMathNotationToLatex(
    legacyArabicSample,
    "CONVERT_TO_STANDARD_LATEX"
  );

  assert(
    ARABIC_MATH_NOTATION_DICTIONARY.length >= 10 &&
      arabicDiag.detectedArabicMathTokensCount >= 8 &&
      arabicDiag.legacyScriptType === "ARABIC_MATH_LEGACY" &&
      arabicDiag.transpiledText.includes("f(x)") &&
      arabicDiag.transpiledText.includes("f'(x)") &&
      arabicDiag.transpiledText.includes("\\sqrt{x + 1}") &&
      arabicDiag.transpiledText.includes("\\sin(x)") &&
      arabicDiag.transpiledText.includes("\\cos(x)") &&
      arabicDiag.transpiledText.includes("\\ln(x)") &&
      arabicDiag.transpiledText.includes("\\in \\mathbb{R}^{*+}") &&
      arabicDiag.transpiledText.includes("(u_n)") &&
      arabicDiag.transpiledText.includes("u_0 = 2") &&
      arabicDiag.transpiledText.includes("\\lim_{x \\to +\\infty}"),
    `Arabic Math OCR Engine transpiles legacy Arabic notation (د(س), نها, جا, جتا, لو, جذر, (ح_ن), ∈ ح*+, ٠-٩) into standard LaTeX (${arabicDiag.detectedArabicMathTokensCount} tokens converted, +${arabicDiag.notationConfidenceBoostPct}% boost)`
  );

  const sanitizedLegacy = sanitizeOcrMathString(
    legacyArabicSample,
    false,
    "CONVERT_TO_STANDARD_LATEX"
  );
  assert(
    sanitizedLegacy.sanitized.includes("\\lim_{x \\to +\\infty}") &&
      sanitizedLegacy.sanitized.includes("\\sin(x)") &&
      sanitizedLegacy.fixesCount >= 5,
    `sanitizeOcrMathString integrates Arabic math transpilation and AST verification seamlessly (${sanitizedLegacy.fixesCount} fixes applied, integrity=${sanitizedLegacy.integrityScorePct}%)`
  );

  // 29.2 Quick Scan Loaded Bareme Builder
  const sampleLessonsForBareme = CURRICULUM_DB["2BAC_PC"]?.semesters.S1.DS1 || [];
  const baremeFromLessons = buildLoadedExamBaremeItems(sampleLessonsForBareme);
  const totalBaremePts = baremeFromLessons.reduce((s, it) => s + it.maxPoints, 0);
  assert(
    baremeFromLessons.length >= 3 && Math.abs(totalBaremePts - 20) <= 0.5,
    `buildLoadedExamBaremeItems constructs question-level bareme from loaded exam lessons (${baremeFromLessons.length} questions, total=${totalBaremePts}/20)`
  );

  // 29.3 Quick Scan RGBA Red-Pen Mark Extractor & Bareme Auto-Calculator
  const defaultBareme = buildLoadedExamBaremeItems();
  const qLen = defaultBareme.length;
  const w = 400;
  const h = 360;
  const syntheticRedPenRgba = new Uint8ClampedArray(w * h * 4);
  syntheticRedPenRgba.fill(250);

  // Paint a dense red FULL tick on Q1 (i=0), HALF mark on Q2 (i=1), and ZERO on Q3 (i=2)
  const paintRedBox = (qIdx: number, pixelTarget: number) => {
    const centerY = Math.round(h * 0.22 + (qIdx / Math.max(1, qLen)) * (h * 0.68));
    const startX = Math.floor(w * 0.72);
    let painted = 0;
    for (let y = centerY - 6; y <= centerY + 6; y++) {
      for (let x = startX; x < startX + 35; x++) {
        if (painted >= pixelTarget) break;
        const idx = (y * w + x) * 4;
        syntheticRedPenRgba[idx] = 220; // R
        syntheticRedPenRgba[idx + 1] = 30; // G
        syntheticRedPenRgba[idx + 2] = 30; // B
        painted++;
      }
    }
  };
  paintRedBox(0, 130); // FULL (>= 95 red pixels)
  paintRedBox(1, 52);  // HALF (42..67 red pixels)
  paintRedBox(2, 0);   // ZERO (< 20 red pixels)

  const extractedMarks = extractHandwrittenRedPenMarksFromRgba({
    rgba: syntheticRedPenRgba,
    width: w,
    height: h,
    questionCount: qLen,
  });

  assert(
    extractedMarks.length === qLen &&
      extractedMarks[0].inferredMark === "FULL" &&
      extractedMarks[1].inferredMark === "HALF" &&
      extractedMarks[2].inferredMark === "ZERO",
    `extractHandwrittenRedPenMarksFromRgba detects teacher red-pen marks (Q1=${extractedMarks[0].inferredMark}, Q2=${extractedMarks[1].inferredMark}, Q3=${extractedMarks[2].inferredMark})`
  );

  const evalSheet = evaluateQuickScanHandwrittenSheet({
    studentName: "ياسين العلمي",
    model: "A",
    baremeItems: defaultBareme,
    detectedMarksByQuestionId: {
      bareme_q_1: "FULL",           // 2.0 * 1.0 = 2.0
      bareme_q_2: "HALF",           // 2.5 * 0.5 = 1.25
      bareme_q_3: "ZERO",           // 2.0 * 0.0 = 0.0
      bareme_q_4: "FULL",           // 2.5 * 1.0 = 2.5
      bareme_q_5: "THREE_QUARTERS", // 2.5 * 0.75 = 1.875 -> 1.75 (nearest 0.25) or 2.0
      bareme_q_6: "FULL",           // 3.0
      bareme_q_7: "FULL",           // 3.0
      bareme_q_8: "HALF",           // 2.5 * 0.5 = 1.25
    },
  });

  assert(
    evalSheet.totalMaxScore === 20 &&
      evalSheet.totalScore > 14 &&
      evalSheet.exerciseTotals.length === 3 &&
      evalSheet.pedagogicalAppreciationAr.length > 5,
    `evaluateQuickScanHandwrittenSheet computes final grade (${evalSheet.totalScore}/${evalSheet.totalMaxScore}) and exercise sub-totals based on loaded bareme`
  );
} catch (e: any) {
  assert(false, `Section 29 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 30. TEST STRATEGIC ROADMAP PHASES 1–4 (CTT PSYCHOMETRICS, CAS STEP VERIFIER, LONGITUDINAL COVERAGE, DIGITAL SIGNATURE)
// ----------------------------------------------------------------------
console.log(
  "\n--- 30. Testing Strategic Roadmap Phases 1–4 (Psychometrics CTT, CAS Step Verifier, Longitudinal Tracker, Digital Signature) ---"
);
try {
  const {
    areTwoMathExpressionsEquivalent,
    verifyAlgebraicStepEquivalenceChain,
  } = await import("./src/utils/mathjsValidator.ts");
  const {
    computePsychometricItemAnalysisCTT,
    computeLongitudinalCompetencyCoverageReport,
    computePedagogicalDocumentDigitalSignature,
    verifyPedagogicalDocumentSignature,
  } = await import("./src/utils/sevenStrategicProposalsEngine.ts");

  // Phase 1: Psychometric Item Analysis (CTT)
  const keyA = { 1: "A" as const, 2: "B" as const, 3: "C" as const, 4: "D" as const, 5: "A" as const };
  const cttReport = computePsychometricItemAnalysisCTT({
    questionCount: 5,
    answerKeysByModel: { A: keyA, B: keyA, C: keyA, D: keyA },
    scannedResults: [],
  });
  assert(
    cttReport.items.length === 5 &&
      cttReport.cronbachAlpha >= 0.45 &&
      cttReport.cronbachAlpha <= 0.99 &&
      cttReport.meanDifficultyP > 0 &&
      cttReport.meanDifficultyP <= 1,
    `Phase 1 (CTT Psychometrics): computes Cronbach's Alpha (α=${cttReport.cronbachAlpha}), mean difficulty (P=${cttReport.meanDifficultyP}), and discrimination (D=${cttReport.meanDiscriminationD})`
  );

  // Phase 2: Symbolic CAS Step-Equivalence Verifier & Follow-Through Credit
  const eqCheck = areTwoMathExpressionsEquivalent(
    "f'(x) = (x + 1)^2 - 1",
    "f'(x) = x*(x + 2)"
  );
  assert(
    eqCheck.equivalent === true,
    `Phase 2 (CAS Equivalence): proves algebraic equivalence between (x+1)^2 - 1 and x*(x+2) via ${eqCheck.methodUsed}`
  );

  const chainRes = verifyAlgebraicStepEquivalenceChain({
    referenceLatex: "f'(x) = 2*(x^2 + 2*x + 1)",
    studentStepsLatex: [
      "f'(x) = 2*(x + 1)^2",
      "f'(x) = 2*(x^2 + 2*x + 2)", // Arithmetic slip (+2 instead of +1)
      "f'(x) = 2*x^2 + 4*x + 4",   // Valid follow-through from step 2!
    ],
    maxPoints: 2.0,
  });
  assert(
    chainRes.steps.length === 3 &&
      chainRes.steps[0].status === "EQUIVALENT_TO_REF" &&
      chainRes.steps[1].status === "ALGEBRAIC_SLIP" &&
      chainRes.steps[2].status === "FOLLOW_THROUGH_VALID" &&
      chainRes.recommendedAwardedPoints >= 1.0 &&
      chainRes.recommendedAwardedPoints < 2.0,
    `Phase 2 (CAS Follow-Through Grader): detects valid step 1, slip at step 2, and follow-through coherence at step 3 (awarded ${chainRes.recommendedAwardedPoints}/2.0)`
  );

  // Phase 3: Longitudinal Competency & Reference Framework Coverage Tracker
  const longReport = computeLongitudinalCompetencyCoverageReport("2BAC_SM");
  assert(
    longReport.domains.length === 5 &&
      longReport.totalAnnualLessons >= 8 &&
      longReport.nationalExamReadinessPct >= 80,
    `Phase 3 (Longitudinal Coverage): maps ${longReport.totalAnnualLessons} annual lessons across 5 national domains with ${longReport.nationalExamReadinessPct}% readiness`
  );

  // Phase 4: Pedagogical Document Digital Signature & Tamper Verification
  const sig = computePedagogicalDocumentDigitalSignature({
    trackCode: "2BAC_SM",
    semester: "S1",
    dsKey: "DS1",
    examModel: "A",
    school: "ثانوية مولاي إدريس",
    prof: "ذ. إبراهيم قزيبر",
    year: "2025/2026",
    lessonTitles: ["الاتصال والاشتقاق", "المتتاليات العددية"],
    totalPoints: 20,
  });
  const isValidAuthentic = verifyPedagogicalDocumentSignature(sig);
  const tamperedSig = {
    ...sig,
    canonicalPayload: sig.canonicalPayload.replace("PTS=20", "PTS=15"),
  };
  const isValidTampered = verifyPedagogicalDocumentSignature(tamperedSig);
  assert(
    sig.signatureId.startsWith("MENPS-SIG-") &&
      sig.hexDigest64.length === 64 &&
      isValidAuthentic === true &&
      isValidTampered === false,
    `Phase 4 (Digital Signature): generates 64-hex digest (${sig.signatureId}), verifies authentic payload, and rejects tampered bareme`
  );
} catch (e: any) {
  assert(false, `Section 30 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 31. TEST CUSTOM UPLOADED FONTS (.TTF / .OTF) & LOCAL STORAGE ENGINE
// ----------------------------------------------------------------------
console.log("\n--- 31. Testing Custom Uploaded Fonts (.ttf / .otf) & Local Storage Engine ---");
try {
  const {
    validateCustomFontFile,
    loadCustomUploadedFonts,
    saveCustomUploadedFonts,
    deleteCustomUploadedFont,
    buildCustomFontsStylesheetCss,
  } = await import("./src/utils/customFontsStorage.ts");
  const { TRADITIONAL_TITLE_FONT_OPTIONS } = await import("./src/data/curriculum.ts");

  // TrueType magic header: 00 01 00 00
  const validTtfHeader = new Uint8Array([0x00, 0x01, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x80, 0x00, 0x03, 0x00, 0x20]);
  // OpenType CFF magic header: 'O', 'T', 'T', 'O' (0x4F, 0x54, 0x54, 0x4F)
  const validOtfHeader = new Uint8Array([0x4f, 0x54, 0x54, 0x4f, 0x00, 0x08, 0x00, 0x80, 0x00, 0x03, 0x00, 0x10]);
  // Invalid random bytes
  const invalidHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);

  const ttfValidation = validateCustomFontFile({
    fileName: "MaghribiHeader.ttf",
    sizeBytes: 24500,
    headerBytes: validTtfHeader,
  });
  const otfValidation = validateCustomFontFile({
    fileName: "AndalusiTitle.otf",
    sizeBytes: 38200,
    headerBytes: validOtfHeader,
  });
  const badExtValidation = validateCustomFontFile({
    fileName: "MaliciousScript.exe",
    sizeBytes: 1024,
    headerBytes: validTtfHeader,
  });
  const badMagicValidation = validateCustomFontFile({
    fileName: "FakeFont.ttf",
    sizeBytes: 2048,
    headerBytes: invalidHeader,
  });

  assert(
    ttfValidation.valid === true &&
      ttfValidation.format === "truetype" &&
      otfValidation.valid === true &&
      otfValidation.format === "opentype" &&
      badExtValidation.valid === false &&
      badMagicValidation.valid === false,
    `Binary font validator accepts authentic .ttf (00 01 00 00) and .otf (OTTO) headers and rejects invalid extensions or fake headers`
  );

  const sampleStoredFont = {
    id: "custom_font_test_1",
    name: "خط القرويين المخصص",
    fileName: "AlQarawiyyin.ttf",
    fontFamilyCssName: "CustomExamTitleFont_test_1",
    format: "truetype" as const,
    mimeType: "font/ttf",
    dataUrl: "data:font/ttf;base64,AAEAAA==",
    sizeBytes: 18432,
    uploadedAt: new Date().toISOString(),
  };

  saveCustomUploadedFonts([sampleStoredFont]);
  const loadedFonts = loadCustomUploadedFonts();
  const generatedCss = buildCustomFontsStylesheetCss(loadedFonts, "custom_font_test_1");

  assert(
    loadedFonts.length === 1 &&
      loadedFonts[0].name === "خط القرويين المخصص" &&
      generatedCss.includes("@font-face") &&
      generatedCss.includes("CustomExamTitleFont_test_1") &&
      generatedCss.includes("--custom-uploaded-title-font"),
    `Local storage persistence and @font-face stylesheet builder register custom font family and bind --custom-uploaded-title-font`
  );

  const afterDelete = deleteCustomUploadedFont("custom_font_test_1");
  assert(
    afterDelete.length === 0 &&
      TRADITIONAL_TITLE_FONT_OPTIONS.some((opt) => opt.id === "CUSTOM_UPLOADED_FONT"),
    `Custom font deletion cleans local storage and TRADITIONAL_TITLE_FONT_OPTIONS includes CUSTOM_UPLOADED_FONT option`
  );
} catch (e: any) {
  assert(false, `Section 31 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 32. TEST SUB-QUESTION DECOMPOSITION (أ، ب، ج / a, b, c) & 6 DS_142_08 ENHANCEMENTS
// ----------------------------------------------------------------------
console.log("\n--- 32. Testing Sub-Question Decomposition (أ، ب، ج) & 6 DS_142_08 Enhancements ---");
try {
  const {
    distributeParentPointsAcrossSubQuestions,
    decomposeQuestionIntoSubQuestions,
    serializeSubQuestionsToQuestionText,
    computeExamChronoDidacticReport,
    buildIsoDifficultyModelComparison,
    getLessonEvaluationHistoryAcrossDS,
    getDidacticPackPresetFlags,
    buildAllInOneDsArchivePackManifest,
  } = await import("./src/utils/dsSupervisedExamEnhancements.ts");
  const { CURRICULUM_DB } = await import("./src/data/curriculum.ts");

  // 1. Test exact 0.25 bareme distribution across sub-questions (أ، ب، ج)
  const pts150 = distributeParentPointsAcrossSubQuestions(1.5, 3);
  const pts125 = distributeParentPointsAcrossSubQuestions(1.25, 3);
  const sum150 = pts150.reduce((a, b) => a + b, 0);
  const sum125 = pts125.reduce((a, b) => a + b, 0);

  assert(
    pts150.length === 3 &&
      Math.abs(sum150 - 1.5) < 0.001 &&
      Math.abs(sum125 - 1.25) < 0.001 &&
      pts125[0] === 0.25 &&
      pts125[1] === 0.5 &&
      pts125[2] === 0.5,
    `distributeParentPointsAcrossSubQuestions conserves exact parent bareme in 0.25 steps (1.5 -> [${pts150.join(", ")}], 1.25 -> [${pts125.join(", ")}])`
  );

  // 2. Test compound & structured sub-question decomposition (أ، ب، ج / a, b, c)
  const decompCompound = decomposeQuestionIntoSubQuestions({
    questionAr: "1. أحسب النهاية lim_{x→+∞} f(x) ثم استنتج معادلة المستقيم المقارب بجوار +∞.",
    questionFr: "1. Calculer la limite lim_{x→+∞} f(x) puis en déduire l'équation de l'asymptote au voisinage de +∞.",
    parentPoints: 1.5,
    parentLevel: "N2",
    mode: "AUTO_DETECT_ONLY",
    questionIndex: 0,
  });

  const decompStructured3 = decomposeQuestionIntoSubQuestions({
    questionAr: "2. ادرس اشتقاق الدالة f على المجال ]0, +∞[ وأنجز جدول تغيراتها.",
    questionFr: "2. Étudier la dérivabilité de f sur ]0, +∞[ et dresser son tableau de variations.",
    parentPoints: 1.75,
    parentLevel: "N3",
    mode: "STRUCTURED_ABC_ALL",
    questionIndex: 1,
  });

  const serializedAr = serializeSubQuestionsToQuestionText(
    decompStructured3.stemAr,
    decompStructured3.subQuestions.map((s) => ({ label: s.labelAr, text: s.textAr }))
  );

  assert(
    decompCompound.isDecomposed === true &&
      decompCompound.subQuestions.length === 2 &&
      decompCompound.subQuestions[0].labelAr === "أ" &&
      decompCompound.subQuestions[1].labelAr === "ب" &&
      decompStructured3.isDecomposed === true &&
      decompStructured3.subQuestions.length === 3 &&
      decompStructured3.subQuestions[2].labelAr === "ج" &&
      decompStructured3.subQuestions[2].labelFr === "c" &&
      serializedAr.includes("أ)") &&
      serializedAr.includes("ب)") &&
      serializedAr.includes("ج)"),
    `decomposeQuestionIntoSubQuestions splits compound questions into (أ، ب) and structured questions into (أ، ب، ج / a, b, c) with serialized round-trip`
  );

  // 3. Test Chrono-Didactic Time-Weighting Engine, Iso-Difficulty Parity, Coverage Badge, & All-in-One DS Pack
  const sampleLessons = CURRICULUM_DB["2BAC_SM"].semesters.S1.DS1;
  const chrono = computeExamChronoDidacticReport({
    lessons: sampleLessons,
    officialDurationStr: "2h (ساعتان)",
    hasQcm: true,
    qcmQuestionCount: 4,
    hasSynthesisProblem: false,
    decompositionMode: "STRUCTURED_ABC_ALL",
  });
  const isoReport = buildIsoDifficultyModelComparison(sampleLessons);
  const covStatus = getLessonEvaluationHistoryAcrossDS(
    "2BAC_SM",
    "S1",
    "DS2",
    sampleLessons[0].lessonFr
  );
  const presetOfficial = getDidacticPackPresetFlags("OFFICIAL_MINISTERIAL_142_08");
  const packManifest = buildAllInOneDsArchivePackManifest({
    trackCode: "2BAC_SM",
    trackLabelAr: "الثانية بكالوريا علوم رياضية",
    semester: "S1",
    dsKey: "DS1",
    schoolName: "ثانوية مولاي إدريس",
    professorName: "ذ. إبراهيم قزيبر",
    academicYear: "2025/2026",
    officialDurationStr: "2h",
    lessons: sampleLessons,
    decompositionMode: "STRUCTURED_ABC_ALL",
    hasQcm: true,
    qcmQuestionCount: 4,
  });

  assert(
    chrono.officialDurationMinutes === 120 &&
      chrono.totalRequiredMinutes > 30 &&
      isoReport.overallParityPct === 100 &&
      covStatus.appearedInDsKeys.includes("DS1") &&
      presetOfficial.showQuestionBareme === true &&
      presetOfficial.includeGradingScaleTable === true &&
      packManifest.totalPoints === 20 &&
      packManifest.totalSubQuestions > packManifest.totalMainQuestions,
    `All 6 DS_142_08 enhancements (Chrono=${chrono.totalRequiredMinutes}/${chrono.officialDurationMinutes}min, IsoParity=100%, Coverage=${covStatus.status}, AllInOnePack=${packManifest.totalMainQuestions}Q->${packManifest.totalSubQuestions}SubQ) verified`
  );
} catch (e: any) {
  assert(false, `Section 32 test crashed: ${e.message}`);
}

console.log("\n--- 33. Testing 5-Phase Strategic Master Roadmap (Sanitizer, IndexedDB, Fiche v2 Domains, Summary Studio, 3-Tier Series, Parameterized DM & 5-in-1 Unit Dossier) ---");
try {
  // Phase 1: HTML/SVG Security Sanitizer & IndexedDB Engine
  const dirtyHtml = `<div onclick="evil()"><svg viewBox="0 0 100 100"><script>alert(1)</script><circle cx="50" cy="50" r="40" onload="hack()"/></svg><a href="javascript:steal()">Link</a></div>`;
  const cleanResult = sanitizeTrustedPedagogicalHtml(dirtyHtml);
  assert(
    !cleanResult.sanitizedHtml.includes("<script>") &&
      !cleanResult.sanitizedHtml.includes("onclick") &&
      !cleanResult.sanitizedHtml.includes("onload") &&
      !cleanResult.sanitizedHtml.includes("javascript:") &&
      cleanResult.sanitizedHtml.includes("<circle") &&
      cleanResult.removedThreatsCount >= 4,
    `Phase 1 (HTML/SVG Security Sanitizer): stripped ${cleanResult.removedThreatsCount} XSS vectors while preserving valid mathematical SVG`
  );

  // Phase 2: Complete Pedagogical Fiche v2 across all newly expanded domains (Complexes, Integrals, Space, Probabilities, Arithmetic) + STEM + Blackboard
  const track2BacSm = CURRICULUM_DB["2BAC_SM"];
  const s2Lessons = [
    ...track2BacSm.semesters.S2.DS1,
    ...track2BacSm.semesters.S2.DS2,
    ...track2BacSm.semesters.S2.DS3,
  ];
  const complexLesson =
    s2Lessons.find((l) => l.lessonAr.includes("عقدي") || l.lessonFr.toLowerCase().includes("complexe")) ||
    s2Lessons[0];
  const ficheV2 = generateFullMoroccanPedagogicalFiche(complexLesson, track2BacSm, "BLACKBOARD_CAHIER");
  assert(
    ficheV2.fullCourseContent.length > 0 &&
      (ficheV2.stemExtensions?.length || 0) >= 2 &&
      (ficheV2.blackboardPlansPerSession?.length || 0) >= 4 &&
      ficheV2.ficheFormat === "BLACKBOARD_CAHIER",
    `Phase 2 (Fiche OP 2007 v2): generated domain-specific proofs, ${ficheV2.stemExtensions?.length} STEM extensions, and ${ficheV2.blackboardPlansPerSession?.length} 3-wing Blackboard + Cahier de Texte session plans`
  );

  // Phase 3: Standalone Lesson Summary Studio (Cheat Sheet, Method Cards, Mind Map SVG, BIOF Lexicon)
  const standaloneSummary = generateStandaloneLessonSummary(
    complexLesson,
    track2BacSm,
    "MIND_MAP_BIOF_LEXICON"
  );
  assert(
    standaloneSummary.methodHowToCards.length === 3 &&
      standaloneSummary.topFivePitfallsAr.length === 5 &&
      standaloneSummary.biofLexicon.length >= 5 &&
      standaloneSummary.mindMapSvgMarkup.includes("<svg") &&
      standaloneSummary.mindMapSvgMarkup.includes("1. البناء المفاهيمي"),
    `Phase 3 (Standalone Lesson Summary Studio): generated 3 Method How-To cards, 5 exam pitfalls, BIOF lexicon (${standaloneSummary.biofLexicon.length} terms), and vector SVG Mind Map`
  );

  // Phase 4: 3-Tier Differentiated Series & 4-Group Anti-Plagiarism Parameterized Homework
  const threeTier = buildThreeTierDifferentiatedSeries([complexLesson], "A");
  const paramDm = generateParameterizedHomeworkVariants([complexLesson], "PREPARATOIRE_DS");
  const totalRubricPts = paramDm.inspectorRubric20Pts.reduce((acc, r) => acc + r.points, 0);
  assert(
    threeTier.length === 3 &&
      threeTier[0].tierCode === "TIER_1_APPLICATION" &&
      threeTier[2].tierCode === "TIER_3_EXCELLENCE" &&
      paramDm.groups.length === 4 &&
      paramDm.groups[0].parameters.alpha !== paramDm.groups[1].parameters.alpha &&
      totalRubricPts === 20,
    `Phase 4 (Pro Series & Homework): built 3-Tier Differentiated Series (N1/N2/N3) and 4 Anti-Plagiarism Homework Groups (A/B/C/D) with 20/20 Inspector Rubric`
  );

  // Phase 5: Global Sub-Question Propagation (LaTeX/Typst + Correction) & 5-in-1 Complete Unit Dossier
  const alignedCorr = generateSubQuestionAlignedCorrection({
    lesson: complexLesson,
    exerciseIndex: 0,
    model: "A",
    decompositionMode: "STRUCTURED_ABC_ALL",
  });
  const exportedLatexWithSubQ = generateOfflineSourceCode({
    track: track2BacSm,
    sem: "S2",
    dsKey: "DS1",
    school: "ثانوية التميز",
    prof: "ذ. إبراهيم قزيبر",
    year: "2025/2026",
    academy: "الرباط سلا القنيطرة",
    direction: "الرباط",
    headerStyle: "OFFICIAL_AREF",
    includeStudentBox: true,
    includeGradeBox: true,
    examModel: "A",
    shuffleQuestions: false,
    shuffleExercises: false,
    docLang: "AR",
    bilingualLayout: "SIDE_BY_SIDE",
    exportFormat: "LATEX",
    activeModule: "DS_142_08",
    n1: 30,
    n2: 50,
    n3: 20,
    fillBlanks: false,
    includeTICE: false,
    selectedLessonIdx: 0,
    diagDuration: "1h",
    customLessons: [complexLesson],
    subQuestionDecompositionMode: "STRUCTURED_ABC_ALL",
  });
  const unitDossier = buildCompletePedagogicalUnitDossier({
    lesson: complexLesson,
    track: track2BacSm,
  });

  assert(
    alignedCorr.solutions.length > 0 &&
      alignedCorr.solutions[0].baremeBreakdownAr[0].includes("أ)") &&
      exportedLatexWithSubQ.includes("\\item[\\textbf{أ)}]") &&
      unitDossier.components["5_supervisedExamSectionDS"].decomposedSubQuestionsCount >
        unitDossier.components["5_supervisedExamSectionDS"].mainQuestionsCount &&
      unitDossier.components["4_parameterizedHomeworkDM"].groupsCount === 4,
    `Phase 5 (Sub-Question Propagation & 5-in-1 Unit Dossier): propagated (أ، ب، ج) to LaTeX/Typst & Correction breakdown and bundled 5-in-1 Unit Dossier (${unitDossier.dossierId})`
  );
} catch (e: any) {
  assert(false, `Section 33 test crashed: ${e.message}`);
}

console.log("\n--- 34. Testing Companion Pedagogical Bridge (/public/core/lesson-log-engine.js & companionPedagogicalBridge.ts) ---");
try {
  // 1. Test buildCompanionAppPedagogicalBrief for struggling class (<10 average, high struggling <8)
  const strugglingBrief = buildCompanionAppPedagogicalBrief({
    trackCode: "2BAC_PC",
    semester: "S1",
    examKey: "DS1",
    className: "2BAC-PC-1",
    completedLessons: [
      { lessonAr: "الاتصال والاشتقاق ودراسة الدوال", lessonFr: "Continuité, dérivabilité et étude des fonctions", category: "ANALYSE", completedHours: 14 },
      { lessonAr: "المتتاليات العددية", lessonFr: "Suites numériques", category: "ANALYSE", completedHours: 10 },
    ],
    studentGrades: [5.5, 6.0, 6.5, 7.0, 7.25, 7.5, 7.75, 8.5, 9.0, 10.5, 11.0, 12.5],
  });

  assert(
    strugglingBrief.classIdentity.coefficient === 7 &&
      strugglingBrief.classDiagnosticMetrics.classAverage < 10 &&
      strugglingBrief.classDiagnosticMetrics.strugglingCountLt8 === 7 &&
      strugglingBrief.automatedPedagogicalRecommendation.recommendationCategory === "REMEDIATION_AND_SUPPORT_SERIES",
    `Mechanism 1A (LessonLogEngine.buildCompanionAppPedagogicalBrief - Remediation): coef=${strugglingBrief.classIdentity.coefficient}, avg=${strugglingBrief.classDiagnosticMetrics.classAverage}/20, struggling(<8)=${strugglingBrief.classDiagnosticMetrics.strugglingCountLt8} -> ${strugglingBrief.automatedPedagogicalRecommendation.recommendationTitleAr}`
  );

  // 2. Test parseAndResolveCompanionBriefForStudio mapping into Studio parameters
  const resolvedStudio = parseAndResolveCompanionBriefForStudio(strugglingBrief);
  assert(
    resolvedStudio.resolvedTrackCode === "2BAC_PC" &&
      resolvedStudio.resolvedModule === "DM_SERIE" &&
      resolvedStudio.resolvedDmSubType === "SERIE_TD" &&
      resolvedStudio.n1 === 50 &&
      resolvedStudio.matchedCurriculumLessons.length >= 2,
    `Mechanism 1B (parseAndResolveCompanionBriefForStudio): mapped brief to ${resolvedStudio.resolvedTrackCode} (${resolvedStudio.resolvedModule}/${resolvedStudio.resolvedDmSubType}) with N1=${resolvedStudio.n1}% and ${resolvedStudio.matchedCurriculumLessons.length} matched curriculum lessons`
  );

  // 3. Test normalizeImportedCompanionDocument & buildCompanionDocumentExportPayload
  const track2BacPc = CURRICULUM_DB["2BAC_PC"];
  const exportedBridgeDoc = buildCompanionDocumentExportPayload({
    track: track2BacPc,
    semester: "S1",
    dsKey: "DS1",
    activeModule: "DS_142_08",
    dmSubType: "SERIE_TD",
    school: "ثانوية مولاي يوسف التأهيلية",
    prof: "ذ. إبراهيم قزيبر",
    year: "2025/2026",
    n1: 30,
    n2: 50,
    n3: 20,
    totalPoints: 20,
    totalQuestions: 14,
    lessons: track2BacPc.semesters.S1.DS1,
  });

  const normPreview = exportedBridgeDoc.normalizedCompanionPreview;
  assert(
    normPreview.isValid === true &&
      normPreview.digitalLibraryEntry.kind === "DEVOIR_SURVEILLE" &&
      normPreview.digitalLibraryEntry.coefficient === 7 &&
      normPreview.cahierDeTexteLogEntry.allocatedHours === "2h" &&
      normPreview.digitalLibraryEntry.allocatedHours > 0,
    `Mechanism 2 (LessonLogEngine.normalizeImportedCompanionDocument): normalized ${normPreview.digitalLibraryEntry.kindLabelAr} into Digital Library (${normPreview.digitalLibraryEntry.id}) & Cahier de Texte (${normPreview.cahierDeTexteLogEntry.allocatedHours})`
  );

  // 4. Verify standalone /public/core/lesson-log-engine.js CommonJS execution
  const requireCjs = createRequire(import.meta.url);
  const cjsEngine = requireCjs("./public/core/lesson-log-engine.js");
  const cjsBrief = cjsEngine.buildCompanionAppPedagogicalBrief({
    trackCode: "2BAC_SM",
    semester: "S2",
    classAverage: 14.2,
    passRatePercent: 85,
    strugglingCount: 1,
    totalStudents: 28,
  });
  const cjsNormalized = cjsEngine.normalizeImportedCompanionDocument(exportedBridgeDoc);

  assert(
    typeof cjsEngine.buildCompanionAppPedagogicalBrief === "function" &&
      typeof cjsEngine.normalizeImportedCompanionDocument === "function" &&
      cjsBrief.classIdentity.coefficient === 9 &&
      cjsBrief.automatedPedagogicalRecommendation.recommendationCategory === "SYNTHESIS_SERIES_OR_DS" &&
      cjsNormalized.isValid === true &&
      cjsNormalized.cahierDeTexteLogEntry.allocatedHours === "2h",
    `Standalone /public/core/lesson-log-engine.js verified: 2BAC_SM coef=${cjsBrief.classIdentity.coefficient}, recommendation=${cjsBrief.automatedPedagogicalRecommendation.recommendationCategory}, cahierDeTexteLogEntry ready`
  );

  // 5. Verify all 7 document kinds (including COMPLETE_UNIT_DOSSIER, STANDALONE_SUMMARY, REPARTITION_CERTIF) & round-trip alias compatibility
  const normDossier = normalizeImportedCompanionDocument({
    documentType: "COMPLETE_UNIT_DOSSIER",
    trackCode: "2BAC_SM",
    semester: "S2",
    lessons: track2BacPc.semesters.S1.DS1,
  });
  const normSummary = cjsEngine.normalizeImportedCompanionDocument({
    documentType: "STANDALONE_SUMMARY",
    trackCode: "TERM_SPE_FR",
    semester: "S1",
  });
  assert(
    normDossier.digitalLibraryEntry.kind === "DOSSIER_PEDAGOGIQUE_COMPLET" &&
      normSummary.digitalLibraryEntry.kind === "RESUME_COURS_SYNTHESE" &&
      normSummary.digitalLibraryEntry.coefficient === 16,
    `All 7 document kinds & French Mission coefficients verified in both TS & JS engines (${normDossier.digitalLibraryEntry.kind}, ${normSummary.digitalLibraryEntry.kind} coef=16)`
  );
} catch (e: any) {
  assert(false, `Section 34 test crashed: ${e.message}`);
}

console.log("\n--- 35. Testing Next-Gen Roadmap Phases 2 to 5 (Examen Blanc National, Inline Sub-Question Editor, Folded A5 Booklet & A6 Flashcards, Modular Architecture Diagnostics) ---");
try {
  const trackPc = CURRICULUM_DB["2BAC_PC"];
  const trackSm = CURRICULUM_DB["2BAC_SM"];
  const lessonPc = trackPc.semesters.S1.DS1[0];

  // Phase 2: National Examen Blanc (3h / 4h, 20/20 points, 80 quarter-point steps)
  const blancPcA = buildNationalExamenBlanc20PtsDossier({ track: trackPc, examModel: "A" });
  const blancSmB = buildNationalExamenBlanc20PtsDossier({ track: trackSm, examModel: "B" });
  assert(
    blancPcA.totalPoints === 20 &&
      blancPcA.officialCoefficient === 7 &&
      blancPcA.officialDurationHours === 3 &&
      blancPcA.exercisesAndProblem.length === 5 &&
      blancPcA.nationalGradingSummary.totalQuarterPointSteps === 80 &&
      blancSmB.officialCoefficient === 9 &&
      blancSmB.officialDurationHours === 4 &&
      blancSmB.exercisesAndProblem[2].domainCategory === "ARITHMETIQUE",
    `Phase 2 (National Examen Blanc 3h/4h): verified 2BAC_PC (3h, coef 7) & 2BAC_SM (4h, coef 9, Arithmétique) with 80 steps of 0.25 pt = 20/20`
  );

  // Phase 3: Inline Sub-Question Editor (0.25 pt adjustments, reordering, splitting, text edit)
  let tree = createEditableSubQuestionTree(lessonPc, 6);
  const initialTotal = tree.totalExercisePoints;
  tree = adjustSubQuestionBaremeStep025(tree, 0, 0, 0.25);
  const afterPlus025 = tree.totalExercisePoints;
  const subCountBeforeSplit = tree.questions[0].subQuestions.length;
  tree = splitSubQuestionInTwo(tree, 0, 0);
  const subCountAfterSplit = tree.questions[0].subQuestions.length;
  tree = moveSubQuestionOrder(tree, 0, 1, "UP");
  tree = updateSubQuestionText(tree, 0, 0, "تحقق أن النهاية تساوي 0 على اليمين.");
  assert(
    afterPlus025 === Number((initialTotal + 0.25).toFixed(2)) &&
      subCountAfterSplit === subCountBeforeSplit + 1 &&
      tree.questions[0].subQuestions[0].labelAr === "أ" &&
      tree.questions[0].subQuestions[0].textAr.includes("النهاية تساوي 0"),
    `Phase 3 (Inline Sub-Question Editor): verified +0.25 pt bareme step (${initialTotal} -> ${afterPlus025}), branch split (${subCountBeforeSplit} -> ${subCountAfterSplit}), reorder, and text edit`
  );

  // Phase 4: Pocket Folded A5 Revision Booklet & A6 Recto/Verso Flashcards
  const bookletA5 = buildFoldedA5RevisionBooklet(lessonPc, trackPc);
  const flashcardsA6 = buildA6RectoVersoFlashcardsSheet(lessonPc, trackPc);
  assert(
    bookletA5.outerSheetPages[0].pageNumber === 4 &&
      bookletA5.outerSheetPages[1].pageNumber === 1 &&
      bookletA5.innerSheetPages[0].pageNumber === 2 &&
      bookletA5.innerSheetPages[1].pageNumber === 3 &&
      flashcardsA6.length === 8 &&
      flashcardsA6[0].versoStepsAr.length > 0,
    `Phase 4 (Pocket Folded A5 Booklet & A6 Flashcards): verified Duplex Imposition [Page 4 | Page 1] + [Page 2 | Page 3] and ${flashcardsA6.length} recto/verso A6 flashcards`
  );

  // Phase 5: Modular Domain Architecture & Full System Health Diagnostics
  const sysHealth = computeModularArchitectureDiagnostics(trackPc, lessonPc);
  assert(
    sysHealth.readinessScorePercent === 100 &&
      sysHealth.healthyComponentsCount === sysHealth.totalComponentsInspected &&
      sysHealth.totalComponentsInspected === 6,
    `Phase 5 (Modular Architecture & System Health): verified ${sysHealth.healthyComponentsCount}/${sysHealth.totalComponentsInspected} components healthy (${sysHealth.readinessScorePercent}% readiness)`
  );
} catch (e: any) {
  assert(false, `Section 35 test crashed: ${e.message}`);
}

console.log("\n--- 36. Testing Direct .tex File Platform Normalization & Firebase Firestore Central Dashboard Engine ---");
try {
  const {
    normalizeExternalTexToPlatformSystem,
    convertExtractedLatexToMultiLessonItems,
  } = await import("./src/utils/latexImporterAndSeyesEngine.ts");
  const {
    buildValidatedFirestoreExamPayload,
    sanitizeExamId,
  } = await import("./src/services/firebaseExamsService.ts");

  const sampleRawTex = `\\documentclass[12pt]{article}
\\usepackage{amsmath,amssymb}
\\begin{document}
\\begin{exercise}{دراسة دالة لوغاريتمية (12 نقطة)}
نعتبر الدالة $f(x) = x - \\ln(x)$ على $]0,+\\infty[$.
\\begin{enumerate}
\\item[a)] أحسب النهايات عند محدات مجموعة التعريف. (2 pts)
\\item[b)] أدرس تغيرات الدالة $f$ وضع جدول تغيراتها. (2.5 pts)
\\end{enumerate}
\\end{exercise}
\\begin{problem}{المتتاليات العددية (8 نقط)}
لتكن $(u_n)$ متتالية معرفة بـ $u_0=2$ و $u_{n+1}=f(u_n)$.
\\begin{enumerate}
\\item[a)] بين بالترجع أن $u_n > 1$. (2 pts)
\\item[b)] استنتج أن $(u_n)$ متقاربة. (2 pts)
\\end{enumerate}
\\end{problem}
\\end{document}`;

  const normBundle = normalizeExternalTexToPlatformSystem(
    "ds_externe_2bac.tex",
    sampleRawTex,
    {
      targetTheme: "TCOLORBOX_ROYAL",
      subQuestionStyle: "ARABIC_ABJAD",
      autoInjectPlatformPreamble: true,
      normalizeBaremePoints: true,
      schoolName: "ثانوية محمد الخامس",
      professorName: "ذ. إبراهيم كوزيبر",
      trackLabelAr: "الثانية باكالوريا علوم فيزيائية",
      academicYear: "2025/2026",
    }
  );

  assert(
    normBundle.platformFormattedTex.includes("\\begin{exoBox}") &&
      normBundle.platformFormattedTex.includes("\\item[\\textbf{أ)}]") &&
      normBundle.platformFormattedTex.includes("\\item[\\textbf{ب)}]") &&
      normBundle.platformFormattedTex.includes("\\hfill{\\small\\textbf{(2.5 ن)}}") &&
      normBundle.extractedLessonItems.length === 2 &&
      normBundle.detectedSubQuestionsCount === 4,
    `normalizeExternalTexToPlatformSystem converted external environments to exoBox, normalized ${normBundle.detectedSubQuestionsCount} sub-questions to (أ، ب), and extracted ${normBundle.extractedLessonItems.length} LessonItems for A4 preview`
  );

  const multiLessons = convertExtractedLatexToMultiLessonItems(normBundle.processed);
  const keepOriginalPreambleBundle = normalizeExternalTexToPlatformSystem(
    "ds_externe_keep_preamble.tex",
    sampleRawTex,
    {
      targetTheme: "MOROCCAN_142_08",
      subQuestionStyle: "ARABIC_ABJAD",
      autoInjectPlatformPreamble: false,
      normalizeBaremePoints: true,
    }
  );
  assert(
    multiLessons.length === 2 &&
      (multiLessons[0]?.sampleExerciseAr?.length || 0) >= 2 &&
      (multiLessons[1]?.sampleExerciseAr?.length || 0) >= 2 &&
      Boolean(multiLessons[0]?.sampleExerciseAr?.some((q) => q.includes("أ)"))) &&
      Boolean(multiLessons[0]?.sampleExerciseAr?.some((q) => q.includes("2.5 ن"))) &&
      keepOriginalPreambleBundle.platformFormattedTex.includes("\\begin{exoBox}") &&
      keepOriginalPreambleBundle.platformFormattedTex.includes("\\item[\\textbf{أ)}]"),
    `convertExtractedLatexToMultiLessonItems & keepOriginalPreamble preserved normalized (أ، ب، 2.5 ن) across A4 preview and LaTeX source`
  );

  const safeId = sanitizeExamId("فرض محروس 2BAC/S1#1");
  const validated = buildValidatedFirestoreExamPayload(
    {
      id: safeId,
      titleAr: "الفرض المحروس رقم 1 - الدورة الأولى",
      titleFr: "Devoir Surveillé N°1 - S1",
      documentType: "IMPORTED_TEX",
      trackCode: "2BAC_PC",
      trackLabelAr: "الثانية باكالوريا علوم فيزيائية",
      semester: 1,
      examKey: "S1_F1",
      examModel: "A",
      duration: "2h",
      totalPoints: 20,
      totalQuestions: 4,
      totalSubQuestions: 8,
      n1: 30,
      n2: 50,
      n3: 20,
      school: "ثانوية محمد الخامس",
      professor: "ذ. إبراهيم كوزيبر",
      academicYear: "2025/2026",
      latexSource: normBundle.platformFormattedTex,
      lessons: normBundle.extractedLessonItems,
      isFavorite: true,
      sourceOrigin: "IMPORTED_TEX",
    },
    "uid_teacher_123",
    "brahim.kouziber87@gmail.com"
  );

  assert(
    /^[a-zA-Z0-9_-]+$/.test(validated.id) &&
      validated.record.ownerId === "uid_teacher_123" &&
      validated.record.documentType === "IMPORTED_TEX" &&
      validated.record.totalPoints === 20 &&
      validated.record.lessonsJson.length > 10 &&
      validated.record.latexSource.includes("\\begin{exoBox}"),
    `buildValidatedFirestoreExamPayload verified strict schema & security rules compliance for SavedExamDocument (${validated.id})`
  );
} catch (e: any) {
  assert(false, `Section 36 test crashed: ${e.message}`);
}

console.log("\n--- 37. Testing Comprehensive System Audit & 8-Subsystem Live Interactive Sandbox Engine ---");
try {
  const { runComprehensiveApplicationAudit } = await import(
    "./src/utils/comprehensiveSystemAuditEngine.ts"
  );

  const auditReport = runComprehensiveApplicationAudit("2BAC_PC", "S1");

  assert(
    auditReport.totalSubsystems === 8 &&
      auditReport.passedSubsystems === 8 &&
      auditReport.totalAssertionsChecked === 24 &&
      auditReport.passedAssertionsChecked === 24 &&
      auditReport.overallHealthPercent === 100,
    `runComprehensiveApplicationAudit verified 8/8 core subsystems and 24/24 assertions at 100% health (${auditReport.reportId})`
  );

  const allSandboxesValid = auditReport.subsystems.every(
    (s) =>
      s.status === "PASSED" &&
      s.checks.length === 3 &&
      s.checks.every((a) => a.passed) &&
      s.sandboxPayload.lessons.length >= 1 &&
      s.sandboxPayload.n1 + s.sandboxPayload.n2 + s.sandboxPayload.n3 === 100 &&
      s.sandboxPayload.titleAr.trim().length > 3
  );

  assert(
    allSandboxesValid,
    `All 8 subsystem live sandbox payloads contain valid LessonItems, 100% cognitive distribution (N1+N2+N3=100), and document titles ready for 1-click A4 preview`
  );
} catch (e: any) {
  assert(false, `Section 37 test crashed: ${e.message}`);
}

console.log("\n--- 38. Testing Prerequisite-Based Diagnostic Tests (PDF + Interactive QR Code) & Automated Dynamic Spec Matrix Engine ---");
try {
  const { CURRICULUM_DB } = await import("./src/data/curriculum.ts");
  const {
    getTrackPrerequisitesCatalog,
    buildPrerequisiteDiagnosticBlueprint,
    evaluateDiagnosticMasteryReport,
    exportStandaloneDiagnosticQuizHtml,
    buildAutomatedDynamicSpecMatrix,
    addExerciseAndSyncSpecMatrix,
    updateExerciseAndSyncSpecMatrix,
    removeExerciseAndSyncSpecMatrix,
    autoRebalanceSpecMatrixTo14208,
    exportAutomatedSpecMatrixLatex,
  } = await import("./src/utils/diagnosticAndDynamicSpecMatrixEngine.ts");

  // 38.1 Prerequisite-Based Diagnostic Test Studio across grade levels (TCS, 1BAC_SE, 2BAC_PC, 2BAC_SM)
  for (const trackCode of ["TCS", "1BAC_SE", "2BAC_PC", "2BAC_SM"]) {
    const catalog = getTrackPrerequisitesCatalog(trackCode, "A");
    assert(
      catalog.length >= 3 &&
        catalog.every(
          (item) =>
            item.qcmItem.optionsAr.length === 4 &&
            item.openExercise.questionsAr.length >= 2 &&
            item.openExercise.remediationAr.length > 10
        ),
      `getTrackPrerequisitesCatalog(${trackCode}) loaded ${catalog.length} prior-level prerequisites with QCM + Open Exercise + Remediation`
    );

    const blueprint = buildPrerequisiteDiagnosticBlueprint({
      trackCode,
      examModel: "A",
      selectedPrereqIndices: catalog.map((c) => c.index),
      includeQcm: true,
      includeOpenExercises: true,
      includeSynthesisProblem: true,
      origin: "https://ais-pre-rsw3xd2wr4jevx5kl4om4d-251237406585.europe-west2.run.app",
    });

    assert(
      blueprint.totalPoints === 20 &&
        blueprint.interactiveQrSvg.includes("<svg") &&
        blueprint.interactiveQrUrl.includes("?quiz=1&type=DIAGNOSTIC") &&
        blueprint.interactiveQrUrl.includes(`track=${trackCode}`) &&
        blueprint.diagnosticPaper.qcmItems.length === catalog.length &&
        blueprint.diagnosticPaper.directExercises.length >= 1 &&
        blueprint.interactiveQuizData.questions.length >= catalog.length &&
        blueprint.asLessonItems.length === catalog.length,
      `buildPrerequisiteDiagnosticBlueprint(${trackCode}) produced 20/20 pt A4 paper, ISO QR SVG (${blueprint.verificationCode}), and ${blueprint.interactiveQuizData.questions.length} interactive QR quiz items`
    );
  }

  // Test Diagnostic Mastery Evaluation & Standalone HTML Export
  const pcBlueprint = buildPrerequisiteDiagnosticBlueprint({
    trackCode: "2BAC_PC",
    examModel: "A",
  });
  const simulatedAnswers: Record<string, number> = {};
  pcBlueprint.interactiveQuizData.questions.forEach((q, idx) => {
    const correctIdx = q.choices.findIndex((c) => c.isCorrect);
    simulatedAnswers[q.id] = idx % 2 === 0 ? correctIdx : (correctIdx + 1) % 4;
  });
  const masteryReport = evaluateDiagnosticMasteryReport(pcBlueprint, simulatedAnswers);
  const standaloneHtml = exportStandaloneDiagnosticQuizHtml(pcBlueprint);

  assert(
    masteryReport.totalEarned >= 0 &&
      masteryReport.totalMax === 20 &&
      masteryReport.rows.length === pcBlueprint.selectedPrerequisites.length &&
      standaloneHtml.includes("<!DOCTYPE html>") &&
      standaloneHtml.includes(pcBlueprint.verificationCode),
    `evaluateDiagnosticMasteryReport (${masteryReport.totalEarned}/${masteryReport.totalMax} - ${masteryReport.overallStatusAr}) & exportStandaloneDiagnosticQuizHtml verified`
  );

  // 38.2 Automated Dynamic Specification Matrix Engine (add / update / remove / auto-rebalance / LaTeX export)
  const baseLessons = CURRICULUM_DB["2BAC_PC"].semesters.S1.DS1;
  const initialMatrix = buildAutomatedDynamicSpecMatrix({
    lessons: baseLessons,
    n1Target: 35,
    n2Target: 45,
    n3Target: 20,
  });

  assert(
    Math.abs(initialMatrix.totals.grandTotalPoints - 20) < 0.01 &&
      initialMatrix.totals.n1Percent +
        initialMatrix.totals.n2Percent +
        initialMatrix.totals.n3Percent ===
        100 &&
      initialMatrix.rows.length === baseLessons.length,
    `buildAutomatedDynamicSpecMatrix computed initial 2D Spec Matrix (${initialMatrix.rows.length} exercises, ${initialMatrix.totals.grandTotalPoints}/20 pts, N1=${initialMatrix.totals.n1Percent}%/N2=${initialMatrix.totals.n2Percent}%/N3=${initialMatrix.totals.n3Percent}%)`
  );

  // Add an exercise dynamically and verify Spec Matrix updates automatically to 20/20
  const afterAdd = addExerciseAndSyncSpecMatrix(
    baseLessons,
    {
      lessonAr: "تمرين إضافي: مبرهنة القيم الوسطية والتفرع الثنائي",
      lessonFr: "Exercice supplémentaire: TVI et dichotomie",
      domainAr: "تحليل",
      targetPoints: 5,
      questionsAr: [
        "1. تحقق من اتصال الدالة f على المجال [1,2].",
        "2. بين أن المعادلة f(x)=0 تقبل حلاً وحيداً α في ]1,2[.",
        "3. حدد تأطيراً للعدد α سعته 0.25 باستعمال التفرع الثنائي.",
      ],
      questionLevels: ["N1", "N2", "N3"],
    },
    { n1Target: 35, n2Target: 45, n3Target: 20 }
  );

  assert(
    afterAdd.lessons.length === baseLessons.length + 1 &&
      Math.abs(afterAdd.specMatrix.totals.grandTotalPoints - 20) < 0.01 &&
      afterAdd.specMatrix.rows.length === baseLessons.length + 1 &&
      afterAdd.specMatrix.totals.n1Percent +
        afterAdd.specMatrix.totals.n2Percent +
        afterAdd.specMatrix.totals.n3Percent ===
        100,
    `addExerciseAndSyncSpecMatrix dynamically updated Spec Matrix (${afterAdd.specMatrix.rows.length} exercises, ${afterAdd.specMatrix.totals.grandTotalPoints}/20 pts)`
  );

  // Modify an exercise dynamically (change points, questions, and cognitive levels)
  const afterUpdate = updateExerciseAndSyncSpecMatrix(
    afterAdd.lessons,
    0,
    {
      lessonAr: "تمرين معدل: اتصال واشتقاق دالة مركبة",
      targetPoints: 7,
      questionsAr: [
        "1. أحسب نهاية الدالة عند +∞.",
        "2. أدرس اتصال الدالة في النقطة x_0 = 1.",
        "3. استنتج قابلية الاشتقاق ومعادلة المماس.",
        "4. أنشئ المنحنى البياني (C_f).",
      ],
      questionBaremes: [1.5, 1.75, 2, 1.75],
      questionLevels: ["N1", "N2", "N2", "N3"],
    },
    { n1Target: 35, n2Target: 45, n3Target: 20 }
  );

  assert(
    Math.abs(afterUpdate.specMatrix.totals.grandTotalPoints - 20) < 0.01 &&
      afterUpdate.specMatrix.rows[0].questionCount === 4 &&
      afterUpdate.specMatrix.rows[0].lessonAr.includes("تمرين معدل"),
    `updateExerciseAndSyncSpecMatrix dynamically updated exercise #1 (4 questions, ${afterUpdate.specMatrix.rows[0].totalPoints} pts) and resynced total to ${afterUpdate.specMatrix.totals.grandTotalPoints}/20 pts`
  );

  // Remove an exercise dynamically
  const afterRemove = removeExerciseAndSyncSpecMatrix(
    afterUpdate.lessons,
    afterUpdate.lessons.length - 1,
    { n1Target: 35, n2Target: 45, n3Target: 20 }
  );

  assert(
    afterRemove.lessons.length === baseLessons.length &&
      Math.abs(afterRemove.specMatrix.totals.grandTotalPoints - 20) < 0.01,
    `removeExerciseAndSyncSpecMatrix removed exercise and rebalanced remaining ${afterRemove.lessons.length} exercises to ${afterRemove.specMatrix.totals.grandTotalPoints}/20 pts`
  );

  // Auto-rebalance to 142-08
  const afterRebalance = autoRebalanceSpecMatrixTo14208(
    afterRemove.lessons,
    35,
    45,
    20
  );
  const specLatex = exportAutomatedSpecMatrixLatex(
    afterRebalance.specMatrix,
    CURRICULUM_DB["2BAC_PC"].labelAr,
    "الفرض المحروس رقم 1"
  );

  assert(
    Math.abs(afterRebalance.specMatrix.totals.grandTotalPoints - 20) < 0.01 &&
      afterRebalance.specMatrix.conformity14208.score >= 90 &&
      specLatex.includes("\\begin{tabular}") &&
      specLatex.includes("20.00 / 20"),
    `autoRebalanceSpecMatrixTo14208 & exportAutomatedSpecMatrixLatex produced valid 20.00/20 LaTeX specification matrix (score ${afterRebalance.specMatrix.conformity14208.score}%)`
  );
} catch (e: any) {
  assert(false, `Section 38 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 39. TEST MOROCCAN PEDAGOGICAL PORTFOLIO & NOTE 142-08 / OP 2007 AUDIT
// ----------------------------------------------------------------------
console.log("\n--- 39. Testing Moroccan Note 142-08 & OP 2007 Inspector Audit & 7-Doc Portfolio ---");
try {
  const smStandard = getOfficialNote14208TrackStandards("2BAC_SM");
  const sm1Standard = getOfficialNote14208TrackStandards("1BAC_SM");
  const se1Standard = getOfficialNote14208TrackStandards("1BAC_SE");
  const pcStandard = getOfficialNote14208TrackStandards("2BAC_PC");
  const tcsStandard = getOfficialNote14208TrackStandards("TCS");
  const tctStandard = getOfficialNote14208TrackStandards("TCT");
  const lsh1Standard = getOfficialNote14208TrackStandards("1BAC_LETTRES");
  const tclshStandard = getOfficialNote14208TrackStandards("TCLSH");
  const termSpeFrStandard = getOfficialNote14208TrackStandards("TERM_SPE_FR");
  const { computeNote14208SemesterAverage } = await import(
    "./src/utils/moroccanPedagogicalPortfolio14208Engine.ts"
  );
  const caCalc = computeNote14208SemesterAverage([14, 16, 12], 18);

  assert(
    smStandard.officialCoefficient === 9 &&
      smStandard.dsCountPerSemester === 4 &&
      sm1Standard.officialCoefficient === 9 &&
      sm1Standard.dsCountPerSemester === 4 &&
      se1Standard.officialCoefficient === 7 &&
      se1Standard.dsCountPerSemester === 3 &&
      pcStandard.officialCoefficient === 7 &&
      tcsStandard.officialCoefficient === 4 &&
      tctStandard.officialCoefficient === 4 &&
      tclshStandard.officialCoefficient === 2 &&
      lsh1Standard.officialCoefficient === 1 &&
      lsh1Standard.officialDurationMinutes === 60 &&
      termSpeFrStandard.officialCoefficient === 16 &&
      Math.abs(caCalc.finalSemesterAverage - 14) < 0.01 &&
      caCalc.remediationTierCode === "EXCELLENCE" &&
      smStandard.recommendedN1 + smStandard.recommendedN2 + smStandard.recommendedN3 === 100 &&
      pcStandard.requiredPortfolioDocumentsAr.length === 7,
    `getOfficialNote14208TrackStandards & 75/25 calculator verified across all tracks (SM=9/4DS, 1BAC_SE=7/3DS, PC=7, TCS/TCT=4, TCLSH=2, 1BAC_LETTRES=1/60min, TERM_SPE_FR=16, CA=14.00/20)`
  );

  const pcLessons = CURRICULUM_DB["2BAC_PC"].semesters.S1.DS1;
  const rebalancedPc = autoRebalanceSpecMatrixTo14208(
    pcLessons,
    pcStandard.recommendedN1,
    pcStandard.recommendedN2,
    pcStandard.recommendedN3
  );

  const deepAudit = runDeepPedagogical14208Audit({
    trackCode: "2BAC_PC",
    semester: "S1",
    dsKey: "DS1",
    lessons: rebalancedPc.lessons,
    n1: pcStandard.recommendedN1,
    n2: pcStandard.recommendedN2,
    n3: pcStandard.recommendedN3,
    dsStructureMode: "EXERCICES_ET_PROBLEME",
    includeDetailedSolutions: true,
    include2DSpecMatrix: true,
    includePostExamRemediationSheet: true,
    showQuestionBareme: true,
    examModel: "A",
    subQuestionDecompositionMode: "STRUCTURED_ABC_ALL",
  });

  assert(
    deepAudit.totalCriteriaCount === 10 &&
      deepAudit.compliantCount === 10 &&
      deepAudit.overallScorePercent === 100 &&
      deepAudit.cahierDeTextesDraftEntry.targetedCapacitiesAr.length > 0,
    `runDeepPedagogical14208Audit verifies 10/10 official Note 142-08 & OP 2007 criteria (${deepAudit.overallScorePercent}%) and builds Cahier de Textes entry`
  );

  const portfolio7Docs = buildOfficialMoroccanProfessorPortfolio({
    trackCode: "2BAC_PC",
    semester: "S1",
    dsKey: "DS1",
    lessons: pcLessons,
    school: "ثانوية محمد الخامس التأهيلية",
    prof: "الأستاذ كوزيبر ابراهيم",
    year: "2025/2026",
  });

  assert(
    portfolio7Docs.length === 7 &&
      portfolio7Docs.every(
        (d) =>
          d.rebalancedLessons.length > 0 &&
          d.readyLatexSnippet.length > 10 &&
          d.recommendedN1 + d.recommendedN2 + d.recommendedN3 === 100
      ),
    `buildOfficialMoroccanProfessorPortfolio generates all 7 interconnected Moroccan mathematics teacher portfolio documents`
  );
} catch (e: any) {
  assert(false, `Section 39 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 40. TEST WEB SPEECH API LESSON NAVIGATION & QUICK NOTE VOICE PARSER
// ----------------------------------------------------------------------
console.log("\n--- 40. Testing Web Speech API Lesson Navigation & Quick Note Voice Commands ---");
try {
  const {
    parseSpokenLessonAndNoteVoiceCommand,
    convertSpokenMathAndPedagogyTerms,
  } = await import("./src/components/VoiceDictationControl.tsx");

  const sampleNavLessons = [
    { index: 0, lessonAr: "الاتصال ومبرهنة القيم الوسطية", lessonFr: "Continuité et TVI" },
    { index: 1, lessonAr: "الاشتقاق ودراسة الدوال", lessonFr: "Dérivation et étude des fonctions" },
    { index: 2, lessonAr: "المتتاليات العددية", lessonFr: "Suites numériques" },
    { index: 3, lessonAr: "الدوال اللوغاريتمية", lessonFr: "Fonctions logarithmiques" },
  ];

  const nextCmd = parseSpokenLessonAndNoteVoiceCommand("الدرس التالي", sampleNavLessons, 0);
  const prevCmd = parseSpokenLessonAndNoteVoiceCommand("leçon précédente", sampleNavLessons, 2);
  const byTitleCmd = parseSpokenLessonAndNoteVoiceCommand(
    "انتقل إلى درس المتتاليات",
    sampleNavLessons,
    0
  );
  const byIndexCmd = parseSpokenLessonAndNoteVoiceCommand(
    "الدرس الرابع",
    sampleNavLessons,
    0
  );

  assert(
    nextCmd.matched &&
      nextCmd.actionType === "NEXT_LESSON" &&
      nextCmd.lessonIndex === 1 &&
      prevCmd.matched &&
      prevCmd.actionType === "PREV_LESSON" &&
      prevCmd.lessonIndex === 1 &&
      byTitleCmd.matched &&
      byTitleCmd.actionType === "SELECT_LESSON_BY_TITLE" &&
      byTitleCmd.lessonIndex === 2 &&
      byIndexCmd.matched &&
      byIndexCmd.actionType === "SELECT_LESSON_BY_INDEX" &&
      byIndexCmd.lessonIndex === 3,
    `parseSpokenLessonAndNoteVoiceCommand handles Arabic & French lesson navigation (NEXT=1, PREV=1, BY_TITLE=2, BY_INDEX=3)`
  );

  const quickNoteCmd = parseSpokenLessonAndNoteVoiceCommand(
    "ملاحظة سريعة: التركيز على الاتصال في زائد ما لا نهاية ومجموعة الأعداد الحقيقية",
    sampleNavLessons,
    0
  );
  const headerInstrCmd = parseSpokenLessonAndNoteVoiceCommand(
    "تعليمة الفرض: يسمح باستعمال الآلة الحاسبة غير القابلة للبرمجة",
    sampleNavLessons,
    0
  );

  assert(
    Boolean(
      quickNoteCmd.matched &&
        quickNoteCmd.actionType === "INSERT_QUICK_NOTE" &&
        quickNoteCmd.extractedText?.includes("+∞") &&
        quickNoteCmd.extractedText?.includes("ℝ") &&
        headerInstrCmd.matched &&
        headerInstrCmd.actionType === "INSERT_HEADER_INSTRUCTION" &&
        headerInstrCmd.extractedText?.includes("الآلة الحاسبة") &&
        convertSpokenMathAndPedagogyTerms(
          "جذر مربع إكس ينتمي إلى مجموعة الأعداد الحقيقية"
        ).includes("√")
    ),
    `parseSpokenLessonAndNoteVoiceCommand parses spoken quick notes & header instructions with automatic math symbol conversion (+∞, ℝ, √)`
  );
} catch (e: any) {
  assert(false, `Section 40 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 41. TEST REAL-TIME PRINT LAYOUT PAGE BREAKS & MARGINS BY PDF SIZE PRESET
// ----------------------------------------------------------------------
console.log("\n--- 41. Testing Real-Time Print Layout Page Breaks & Margins by PDF Size Preset ---");
try {
  const { computePrintMediaQueryMetrics } = await import("./src/utils/pdfExporter.ts");

  const a4Metrics = computePrintMediaQueryMetrics({
    preset: "A4",
    orientation: "PORTRAIT",
    marginTopMm: 12,
    marginBottomMm: 14,
    marginLeftMm: 15,
    marginRightMm: 18,
    contentWidthPx: 840, // 4 px/mm for 210mm width
    contentHeightPx: 2500,
  });

  const letterMetrics = computePrintMediaQueryMetrics({
    preset: "LETTER",
    orientation: "PORTRAIT",
    marginTopMm: 10,
    marginBottomMm: 10,
    marginLeftMm: 12,
    marginRightMm: 12,
    contentWidthPx: 863.6, // 4 px/mm for 215.9mm width
    contentHeightPx: 2300,
  });

  const customLandscapeMetrics = computePrintMediaQueryMetrics({
    preset: "CUSTOM",
    orientation: "LANDSCAPE",
    customWidthMm: 200,
    customHeightMm: 300,
    marginTopMm: 15,
    marginBottomMm: 15,
    marginLeftMm: 20,
    marginRightMm: 10,
    contentWidthPx: 900, // 3 px/mm for 300mm landscape width
    contentHeightPx: 1400,
  });

  assert(
    a4Metrics.widthMm === 210 &&
      a4Metrics.heightMm === 297 &&
      a4Metrics.effectivePxPerMm === 4 &&
      a4Metrics.marginTopPx === 48 &&
      a4Metrics.marginBottomPx === 56 &&
      a4Metrics.marginLeftPx === 60 &&
      a4Metrics.marginRightPx === 72 &&
      a4Metrics.pageBreakIntervalPx === 1188 &&
      a4Metrics.pageBreakOffsetsPx[0] === 1188 &&
      a4Metrics.pageBreakOffsetsPx[1] === 2376 &&
      a4Metrics.printableWidthMm === 177 &&
      a4Metrics.printableHeightMm === 271 &&
      a4Metrics.cssPageRule.includes("margin: 12mm 18mm 14mm 15mm"),
    `Print Layout A4 Portrait: computes exact 4px/mm real-time margin insets (Top=48px, Bottom=56px, Left=60px, Right=72px) and page break interval (1188px)`
  );

  assert(
    letterMetrics.widthMm === 215.9 &&
      letterMetrics.heightMm === 279.4 &&
      letterMetrics.pageBreakIntervalPx === 1118 &&
      letterMetrics.marginTopPx === 40 &&
      letterMetrics.marginLeftPx === 48 &&
      letterMetrics.printableAreaPercent > 80 &&
      letterMetrics.cssPageRule.includes("size: letter portrait"),
    `Print Layout US Letter Portrait: shifts page break interval from 1188px (A4) to ${letterMetrics.pageBreakIntervalPx}px (279.4mm height) and updates @page rule`
  );

  assert(
    customLandscapeMetrics.widthMm === 300 &&
      customLandscapeMetrics.heightMm === 200 &&
      customLandscapeMetrics.effectivePxPerMm === 3 &&
      customLandscapeMetrics.marginTopPx === 45 &&
      customLandscapeMetrics.marginLeftPx === 60 &&
      customLandscapeMetrics.marginRightPx === 30 &&
      customLandscapeMetrics.pageBreakIntervalPx === 600 &&
      customLandscapeMetrics.estimatedPageCount === 3,
    `Print Layout Custom Landscape (300×200mm): computes asymmetric margin insets (Left=60px, Right=30px) and 600px page break intervals across ${customLandscapeMetrics.estimatedPageCount} pages`
  );
} catch (e: any) {
  assert(false, `Section 41 test crashed: ${e.message}`);
}

// ----------------------------------------------------------------------
// 42. TEST ANTIGRAVITY ADDITIONS: OFFICIAL 142-08 22-TRACK CATALOG & MATHRENDERER LRU / MACROS
// ----------------------------------------------------------------------
console.log("\n--- 42. Testing Official Note 142-08 22-Track Catalog & MathRenderer Moroccan Macros ---");
try {
  const {
    MOROCCAN_NOTE_14208_OFFICIAL_CATALOG,
    NOTE_14208_MANDATORY_REGULATORY_RULES,
    getOfficialNote14208TrackStandards: getStandards,
  } = await import("./src/utils/moroccanPedagogicalPortfolio14208Engine.ts");
  const {
    parseMixedMathText,
    renderMathHtml,
  } = await import("./src/components/MathRenderer.tsx");

  const allCatalogConsistent = MOROCCAN_NOTE_14208_OFFICIAL_CATALOG.every(
    (r) =>
      r.annualDsCount === r.dsCountS1 + r.dsCountS2 &&
      r.annualDsHours === r.annualDsCount * r.examDurationHours &&
      r.coefficient >= 1 &&
      r.weeklyHours >= 2
  );
  const lettres2BacStd = getStandards("2BAC_LETTRES");

  assert(
    MOROCCAN_NOTE_14208_OFFICIAL_CATALOG.length === 22 &&
      allCatalogConsistent &&
      NOTE_14208_MANDATORY_REGULATORY_RULES.length === 4 &&
      lettres2BacStd.officialDurationAr.includes("مراقبة مستمرة فقط"),
    `MOROCCAN_NOTE_14208_OFFICIAL_CATALOG validates all 22 official Moroccan high school tracks (annualDsCount = S1+S2, annualDsHours = count×duration, 4 mandatory rules, 2BAC_LETTRES continuous assessment only)`
  );

  const mixedBilingualSegments = parseMixedMathText(
    "Montrer que la courbe $(\\Cf)$ dans le repère $\\Oij$ admet une tangente en $x_0 = 1$ et calculer $\\pgcd(540, 378)$."
  );
  const renderedHtml = renderMathHtml(
    "نعتبر المنحنى $(\\Cf)$ في المعلم المتعامد الممنظم $\\Oijk$ حيث $\\Df = ]0, +\\infty[$."
  );

  assert(
    mixedBilingualSegments.some((s) => s.type === "inline-math" && s.content.includes("\\Cf")) &&
      renderedHtml.includes("katex") &&
      renderedHtml.includes("mathcal"),
    `MathRenderer parses and renders Moroccan LaTeX macros (\\Cf, \\Df, \\Oij, \\Oijk, \\pgcd) with KaTeX LRU cache`
  );

  // Verify TCT, 2BAC_SVT_AGRO, and 2BAC_STE_STM provide distinct multi-exercise lessons summing to 100% per DS
  const tctTrack = CURRICULUM_DB["TCT"];
  const svtTrack = CURRICULUM_DB["2BAC_SVT_AGRO"];
  const steTrack = CURRICULUM_DB["2BAC_STE_STM"];
  const checkMultiLessonDsWeights = (trackObj: typeof tctTrack) =>
    (["S1", "S2"] as const).every((sem) =>
      (Object.values(trackObj.semesters[sem]) as LessonItem[][]).every(
        (dsList: LessonItem[]) =>
          dsList.length >= 2 &&
          dsList.reduce((acc: number, item: LessonItem) => acc + item.weight, 0) === 100 &&
          dsList.every((item: LessonItem) => (item.capacitiesAr?.length ?? 0) >= 1)
      )
    );

  assert(
    checkMultiLessonDsWeights(tctTrack) &&
      checkMultiLessonDsWeights(svtTrack) &&
      checkMultiLessonDsWeights(steTrack) &&
      CURRICULUM_DB["2BAC_ECO_TGC"].semesters.S1.DS2.length >= 2 &&
      CURRICULUM_DB["1BAC_STE_STM"].semesters.S1.DS1.length >= 2 &&
      CURRICULUM_DB["1BAC_STE_STM"].semesters.S1.DS2.length >= 2 &&
      CURRICULUM_DB["1BAC_STE_STM"].semesters.S1.DS3.length >= 2 &&
      CURRICULUM_DB["1BAC_STE_STM"].semesters.S2.DS1.length >= 2 &&
      CURRICULUM_DB["1BAC_ECO"].semesters.S2.DS1.length >= 2 &&
      CURRICULUM_DB["1BAC_ECO"].semesters.S2.DS2.length >= 2 &&
      CURRICULUM_DB["1BAC_LETTRES"].semesters.S1.DS1.length >= 2 &&
      CURRICULUM_DB["1BAC_LETTRES"].semesters.S2.DS2.length >= 2 &&
      CURRICULUM_DB["TCLSH"].semesters.S1.DS1.length >= 2,
    `CURRICULUM_DB splits TCT, 2BAC_SVT_AGRO, 2BAC_STE_STM, 2BAC_ECO_TGC, 1BAC_STE_STM, 1BAC_ECO, 1BAC_LETTRES, and TCLSH into distinct OP 2007 chapters with weights summing to 100%`
  );

  // Verify convertArabicMathToLatex, formatMoroccanMathTypography, and diagnoseMathEquationSyntax
  const {
    convertArabicMathToLatex,
    formatMoroccanMathTypography,
    diagnoseMathEquationSyntax,
  } = await import("./src/components/MathRenderer.tsx");

  const convertedArabicLatex = convertArabicMathToLatex(
    "نهـا جذر(x+١) + تكامل جا(x) عندما x -> ما لا نهاية"
  );
  assert(
    convertedArabicLatex.includes("\\lim") &&
      convertedArabicLatex.includes("\\sqrt{x+1}") &&
      convertedArabicLatex.includes("\\int") &&
      convertedArabicLatex.includes("\\sin") &&
      convertedArabicLatex.includes("\\infty"),
    `convertArabicMathToLatex accurately converts Arabic math shorthand and Eastern digits into standard LaTeX`
  );

  const formattedTypo = formatMoroccanMathTypography("(\\frac{2x+1}{x-1}) + \\int_{0}^{1} f(x) dx");
  assert(
    formattedTypo.includes("\\left(\\frac{2x+1}{x-1}\\right)") &&
      formattedTypo.includes("\\displaystyle") &&
      formattedTypo.includes("\\,\\mathrm{d}x"),
    `formatMoroccanMathTypography auto-upgrades fraction delimiters to \\left(\\right), adds \\displaystyle, and formats differential dx`
  );

  const validDiag = diagnoseMathEquationSyntax("$\\forall x \\in \\Rstarplus, \\vect{AB} \\cdot \\vect{AC} = \\frac{1}{2}$");
  const invalidDiag = diagnoseMathEquationSyntax("$\\frac{x+1}{x-1$");
  assert(
    validDiag.isValid === true &&
      validDiag.unbalancedBraces === 0 &&
      invalidDiag.isValid === false &&
      invalidDiag.unbalancedBraces > 0,
    `diagnoseMathEquationSyntax detects valid Moroccan macro equations and catches unbalanced LaTeX braces`
  );

  // Verify runDeepPedagogical14208Audit reaches 10/10 (100%) on official 1-chapter DS assessments (e.g., 2BAC_SM S1.DS3 Complex Numbers 20h)
  const { runDeepPedagogical14208Audit } = await import(
    "./src/utils/moroccanPedagogicalPortfolio14208Engine.ts"
  );
  const smStd = getStandards("2BAC_SM");
  const singleChapterLessons = CURRICULUM_DB["2BAC_SM"].semesters.S1.DS3;
  const singleChapterAudit = runDeepPedagogical14208Audit({
    trackCode: "2BAC_SM",
    semester: "S1",
    dsKey: "DS3",
    lessons: singleChapterLessons,
    n1: smStd.recommendedN1,
    n2: smStd.recommendedN2,
    n3: smStd.recommendedN3,
    dsStructureMode: "EXERCICES_ET_PROBLEME",
    includeDetailedSolutions: true,
    include2DSpecMatrix: true,
    includePostExamRemediationSheet: true,
    showQuestionBareme: true,
    examModel: "BOTH",
    subQuestionDecompositionMode: "SHOW_THAT_CHAIN",
  });

  assert(
    singleChapterLessons.length === 1 &&
      singleChapterAudit.compliantCount === 10 &&
      singleChapterAudit.overallScorePercent === 100,
    `runDeepPedagogical14208Audit achieves 10/10 (100%) compliance on single-chapter 20h DS assessments (2BAC_SM S1.DS3)`
  );

  // Verify normalizeMathSyntax handles radical fractions, nested trig denominators, and ln(x)/x cleanly
  const { normalizeMathSyntax } = await import("./src/components/MathRenderer.tsx");
  const normSqrtFrac = normalizeMathSyntax("f(x) = (√(x + 3) - 2)/(x - 1)");
  const normInsideSqrt = normalizeMathSyntax("√(a/b)");
  const normLnFrac = normalizeMathSyntax("ln(x)/x");
  const normTrigNested = normalizeMathSyntax("sin(2x)/(1 + cos(2x))");
  assert(
    normSqrtFrac === "f(x) = \\frac{\\sqrt{x + 3} - 2}{x - 1}" &&
      normInsideSqrt === "\\sqrt{\\frac{a}{b}}" &&
      normLnFrac === "\\frac{\\ln(x)}{x}" &&
      normTrigNested === "\\frac{\\sin(2x)}{1 + \\cos(2x)}",
    `normalizeMathSyntax accurately converts radical fractions, sqrt(a/b), ln(x)/x, and nested trigonometric denominators`
  );

  // Verify 2BAC_ECO_TGC resolves official Note 142-08 coefficient 4 & 4h/week
  const eco2Std = getStandards("2BAC_ECO_TGC");
  assert(
    eco2Std.officialCoefficient === 4 && eco2Std.weeklyHours.includes("4"),
    `getOfficialNote14208TrackStandards resolves 2BAC_ECO_TGC to official coefficient 4 and 4h/week`
  );

  // Verify buildCustomEvaluationGrid & build2DSpecificationMatrix honor track.cycle and exclude intro lines from Prob-Q items
  const { buildCustomEvaluationGrid } = await import("./src/utils/evaluationGridExporter.ts");
  const { build2DSpecificationMatrix } = await import("./src/utils/advancedPedagogicalTools.ts");
  const tcsGrid = buildCustomEvaluationGrid({
    track: CURRICULUM_DB["TCS"],
    sem: "S1",
    dsKey: "DS1",
    dmSubType: "DEVOIR_MAISON",
    dmNumber: "1",
    activeModule: "DS_142_08",
    lessons: CURRICULUM_DB["TCS"].semesters.S1.DS1,
    n1: 45,
    n2: 40,
    n3: 15,
    dsStructureMode: "EXERCICES_ET_PROBLEME",
  });
  const tcsProbRow = tcsGrid.exercises[tcsGrid.exercises.length - 1];
  const tcsSpec = build2DSpecificationMatrix(
    CURRICULUM_DB["TCS"].semesters.S1.DS1,
    45,
    40,
    15,
    "EXERCICES_ET_PROBLEME",
    false,
    "STANDARD",
    4,
    120,
    "TC"
  );
  assert(
    tcsGrid.totalPoints === 20 &&
      tcsProbRow.questions.every((q) => !q.questionSnippetFr.includes("ln(x)")) &&
      tcsProbRow.totalPoints === 8.5 &&
      tcsSpec.totals.grandTotalPoints === 20,
    `buildCustomEvaluationGrid and build2DSpecificationMatrix align synthesis problem with TC cycle (no 2BAC ln(x)) and sum to 20.00/20`
  );
} catch (e: any) {
  assert(false, `Section 42 test crashed: ${e.message}`);
}

console.log("\n=================================================");
console.log(`=== TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
console.log("=================================================");

if (failCount > 0) {
  process.exit(1);
}


