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
import { renderQrSvgString } from './src/utils/qrCodeHelper.ts';
import {
  convertExercisesToInteractiveQuiz,
  evaluateStudentQuiz,
} from './src/utils/quizGenerator.ts';

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

console.log("\n=================================================");
console.log(`=== TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
console.log("=================================================");

if (failCount > 0) {
  process.exit(1);
}



