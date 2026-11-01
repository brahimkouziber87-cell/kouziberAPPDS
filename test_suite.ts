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

console.log("\n=================================================");
console.log(`=== TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED ===`);
console.log("=================================================");

if (failCount > 0) {
  process.exit(1);
}
