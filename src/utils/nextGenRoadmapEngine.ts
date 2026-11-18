/**
 * محرك المراحل المتقدمة لخارطة الطريق الاستراتيجية (المراحل 2 و 3 و 4):
 * - المرحلة 2: استوديو الامتحانات التجريبية الموحدة للبكالوريا (Examen Blanc National 3h / 4h) مع شريط السرية وشبكة التصحيح الوطنية (0.25 ن)
 * - المرحلة 3: المحرر التفاعلي المباشر للأسئلة الفرعية (أ، ب، ج / a, b, c) وإعادة موازنة سلم التنقيط بخطوة 0.25 نقطة
 * - المرحلة 4: مطويات المراجعة الجيبية (Folded A5 Duplex Booklet) وبطاقات الاستذكار السريع (A6 Recto/Verso Flashcards)
 */

import { CURRICULUM_DB, LessonItem, TrackData } from "../data/curriculum";
import {
  decomposeQuestionIntoSubQuestions,
  distributeParentPointsAcrossSubQuestions,
  SubQuestionItem,
} from "./dsSupervisedExamEnhancements";
import { generateStandaloneLessonSummary } from "./lessonSummaryEngine";

// ============================================================================
// المرحلة 2: استوديو الامتحانات التجريبية الموحدة للبكالوريا (Examen Blanc National)
// ============================================================================

export interface NationalBacExerciseBlueprint {
  exerciseNumber: number;
  titleAr: string;
  titleFr: string;
  domainCategory: "ANALYSE" | "ALGEBRE_COMPLEXES" | "GEOMETRIE_ESPACE" | "PROBABILITES" | "ARITHMETIQUE";
  allocatedPoints: number;
  recommendedMinutes: number;
  isMajorSynthesisProblem: boolean;
  subQuestions: Array<{
    codeAr: string;
    codeFr: string;
    statementAr: string;
    statementFr: string;
    points: number;
    skillLevel: "N1" | "N2" | "N3";
    nationalGradingStepsAr: string[];
    acceptedAlternativeMethodAr: string;
  }>;
}

export interface NationalExamenBlancDossier {
  dossierId: string;
  trackCode: string;
  trackLabelAr: string;
  trackLabelFr: string;
  officialCoefficient: number;
  officialDurationHours: number;
  officialDurationLabelAr: string;
  totalPoints: 20;
  totalPagesCount: 4;
  confidentialityHeaderBanner: {
    ministryHeaderAr: string;
    examSessionLabelAr: string;
    anonymityCodeBoxLabelAr: string;
    strictInstructionsAr: string[];
  };
  exercisesAndProblem: NationalBacExerciseBlueprint[];
  nationalGradingSummary: {
    totalQuarterPointSteps: number;
    n1PointsTotal: number;
    n2PointsTotal: number;
    n3PointsTotal: number;
    inspectorComplianceBadgeAr: string;
  };
  printableLatexPreview: string;
}

const OFFICIAL_BAC_COEFS: Record<string, { coef: number; hours: number }> = {
  "2BAC_SM": { coef: 9, hours: 4 },
  "2BAC_PC": { coef: 7, hours: 3 },
  "2BAC_SVT_AGRO": { coef: 7, hours: 3 },
  "2BAC_STE_STM": { coef: 7, hours: 3 },
  "2BAC_ECO_TGC": { coef: 4, hours: 2 },
  "2BAC_LETTRES": { coef: 2, hours: 2 },
  "1BAC_SM": { coef: 9, hours: 3 },
  "1BAC_SE": { coef: 7, hours: 2 },
  TERM_SPE_FR: { coef: 16, hours: 4 },
};

export function buildNationalExamenBlanc20PtsDossier(params: {
  track?: TrackData;
  sessionLabelAr?: string;
  examModel?: "A" | "B";
}): NationalExamenBlancDossier {
  const track = params.track || CURRICULUM_DB["2BAC_PC"];
  const spec = OFFICIAL_BAC_COEFS[track.code] || { coef: 7, hours: 3 };
  const isSm = track.code.includes("SM") || track.code === "TERM_SPE_FR";
  const modelTag = params.examModel || "A";
  const alpha = modelTag === "A" ? 2 : 3;

  const ex1Points = 3;
  const ex2Points = 3;
  const ex3Points = 3;
  const ex4Points = isSm ? 3 : 3;
  const probPoints = 8; // 3 + 3 + 3 + 3 + 8 = 20 pts exact

  const exercisesAndProblem: NationalBacExerciseBlueprint[] = [
    {
      exerciseNumber: 1,
      titleAr: "التمرين الأول: المتتاليات العددية والنهايات (3 نقط)",
      titleFr: "Exercice 1 : Suites numériques et limites (3 pts)",
      domainCategory: "ANALYSE",
      allocatedPoints: ex1Points,
      recommendedMinutes: isSm ? 30 : 25,
      isMajorSynthesisProblem: false,
      subQuestions: [
        {
          codeAr: "1. أ)",
          codeFr: "1. a)",
          statementAr: `نعتبر المتتالية $(u_n)$ المعرفة بـ $u_0 = ${alpha}$ و $u_{n+1} = \\frac{${alpha + 1}u_n + 2}{u_n + ${alpha}}$. بيّن بالترجع أن $(\\forall n \\in \\mathbb{N})\\; u_n > 1$.`,
          statementFr: `Soit $(u_n)$ définie par $u_0 = ${alpha}$ et $u_{n+1} = \\frac{${alpha + 1}u_n + 2}{u_n + ${alpha}}$. Montrer par récurrence que $(\\forall n \\in \\mathbb{N})\\; u_n > 1$.`,
          points: 0.75,
          skillLevel: "N1",
          nationalGradingStepsAr: [
            "0.25 ن: التحقق من صحة الخاصية من أجل n = 0.",
            "0.25 ن: افتراض صحة الخاصية إلى الرتبة n وتأطير الفرق u_{n+1} - 1.",
            "0.25 ن: الاستنتاج الصريح حسب مبدأ الترجع.",
          ],
          acceptedAlternativeMethodAr:
            "يُقبل أيضاً دراسة تغيرات الدالة المرفقة f على المجال [1, +∞[ واستنتاج التأطير.",
        },
        {
          codeAr: "1. ب)",
          codeFr: "1. b)",
          statementAr: "ادرس رتابة المتتالية $(u_n)$ واستنتج أنها متقاربة.",
          statementFr: "Étudier la monotonie de $(u_n)$ et en déduire qu'elle est convergente.",
          points: 1.0,
          skillLevel: "N2",
          nationalGradingStepsAr: [
            "0.50 ن: حساب الفرق u_{n+1} - u_n وتعميله وتحديد إشارته السالبة.",
            "0.50 ن: استنتاج التقارب لكونها تناقصية ومصغورة بالعدد 1.",
          ],
          acceptedAlternativeMethodAr:
            "تُقبل مقارنة النسبة u_{n+1}/u_n مع 1 شريطة تعليل كون الحدود موجبة قطعا.",
        },
        {
          codeAr: "2. أ)",
          codeFr: "2. a)",
          statementAr: `نضع $v_n = \\frac{u_n - 2}{u_n + 1}$. بيّن أن $(v_n)$ متتالية هندسية محدداً أساسها $q$ وحدها الأول $v_0$.`,
          statementFr: `On pose $v_n = \\frac{u_n - 2}{u_n + 1}$. Montrer que $(v_n)$ est géométrique et préciser sa raison $q$ et $v_0$.`,
          points: 0.75,
          skillLevel: "N2",
          nationalGradingStepsAr: [
            "0.50 ن: إثبات العلاقة v_{n+1} = q · v_n وتحديد الأساس.",
            "0.25 ن: حساب الحد الأول v_0 بدقة.",
          ],
          acceptedAlternativeMethodAr: "يُقبل حساب النسبة v_{n+1}/v_n بعد التأكد من كون v_n ≠ 0.",
        },
        {
          codeAr: "2. ب)",
          codeFr: "2. b)",
          statementAr: "استنتج $u_n$ بدلالة $n$ ثم احسب النهاية $\\lim_{n \\to +\\infty} u_n$.",
          statementFr: "Exprimer $u_n$ en fonction de $n$ puis calculer $\\lim_{n \\to +\\infty} u_n$.",
          points: 0.5,
          skillLevel: "N2",
          nationalGradingStepsAr: [
            "0.25 ن: كتابة الصيغة الصريحة لـ u_n بدلالة n.",
            "0.25 ن: حساب النهاية مع تعليل أن |q| < 1.",
          ],
          acceptedAlternativeMethodAr: "يُقبل تحديد النهاية بحل المعادلة f(L) = L على المجال المفتوح.",
        },
      ],
    },
    {
      exerciseNumber: 2,
      titleAr: "التمرين الثاني: الأعداد العقدية والتحويلات النقطية (3 نقط)",
      titleFr: "Exercice 2 : Nombres complexes et transformations (3 pts)",
      domainCategory: "ALGEBRE_COMPLEXES",
      allocatedPoints: ex2Points,
      recommendedMinutes: isSm ? 35 : 25,
      isMajorSynthesisProblem: false,
      subQuestions: [
        {
          codeAr: "1. أ)",
          codeFr: "1. a)",
          statementAr: `حل في مجموعة الأعداد العقدية $\\mathbb{C}$ المعادلة: $z^2 - ${2 * alpha}z + ${2 * alpha * alpha} = 0$.`,
          statementFr: `Résoudre dans $\\mathbb{C}$ l'équation : $z^2 - ${2 * alpha}z + ${2 * alpha * alpha} = 0$.`,
          points: 0.75,
          skillLevel: "N1",
          nationalGradingStepsAr: [
            "0.25 ن: حساب المميز Δ = -4α² < 0.",
            "0.50 ن: استنتاج الحلين المترافقين z₁ و z₂.",
          ],
          acceptedAlternativeMethodAr: "يُقبل استعمال الشكل القانوني (z - α)² + α² = 0 مباشرة.",
        },
        {
          codeAr: "1. ب)",
          codeFr: "1. b)",
          statementAr: "اكتب العددين $z_1$ و $z_2$ على الشكل المثلثي ثم الأسي.",
          statementFr: "Écrire $z_1$ et $z_2$ sous forme trigonométrique puis exponentielle.",
          points: 0.75,
          skillLevel: "N1",
          nationalGradingStepsAr: [
            "0.25 ن: حساب المعيار |z₁|.",
            "0.50 ن: تحديد العمدة والكتابة الأسية الصحيحة.",
          ],
          acceptedAlternativeMethodAr: "يُقبل استنتاج عمدة z₂ مباشرة باستعمال خاصية المرافق.",
        },
        {
          codeAr: "2. أ)",
          codeFr: "2. a)",
          statementAr: "في المستوى العقدي المنسوب إلى معلم متعامد ممنظم مباشر، حدد طبيعة المثلث $OAB$ حيث $A(z_1)$ و $B(z_2)$.",
          statementFr: "Dans le plan complexe rapporté à un repère orthonormé direct, déterminer la nature du triangle $OAB$.",
          points: 0.75,
          skillLevel: "N2",
          nationalGradingStepsAr: [
            "0.50 ن: حساب معيار وعمدة النسبة z₂ / z₁.",
            "0.25 ن: استنتاج أن المثلث OAB قائم الزاوية ومتساوي الساقين في O.",
          ],
          acceptedAlternativeMethodAr: "يُقبل حساب المسافات OA و OB و AB وتطبيق مبرهنة فيتاغورس العكسية.",
        },
        {
          codeAr: "2. ب)",
          codeFr: "2. b)",
          statementAr: "حدد الكتابة العقدية للدوران $R$ الذي مركزه $O$ وزاويته $\\frac{\\pi}{2}$ واستنتج صورة النقطة $A$.",
          statementFr: "Déterminer l'écriture complexe de la rotation $R(O, \\pi/2)$ et l'image de $A$.",
          points: 0.75,
          skillLevel: "N2",
          nationalGradingStepsAr: [
            "0.50 ن: كتابة الصيغة العقدية z' = i·z.",
            "0.25 ن: حساب لحق صورة A والتحقق الهندسي.",
          ],
          acceptedAlternativeMethodAr: "تُقبل الصيغة المثلثية للدوران مع التعويض المباشر.",
        },
      ],
    },
    {
      exerciseNumber: 3,
      titleAr: isSm
        ? "التمرين الثالث: الحسابيات في Z والموافقات (3 نقط)"
        : "التمرين الثالث: الهندسة الفضائية والجداء السلمي والمتجهي (3 نقط)",
      titleFr: isSm
        ? "Exercice 3 : Arithmétique dans Z et congruences (3 pts)"
        : "Exercice 3 : Géométrie dans l'espace (3 pts)",
      domainCategory: isSm ? "ARITHMETIQUE" : "GEOMETRIE_ESPACE",
      allocatedPoints: ex3Points,
      recommendedMinutes: 25,
      isMajorSynthesisProblem: false,
      subQuestions: [
        {
          codeAr: "1. أ)",
          codeFr: "1. a)",
          statementAr: isSm
            ? `بيّن أن العدد $p = 13$ أولي، وحل في $\\mathbb{Z}^2$ المعادلة الديوفانتية $13x - ${alpha + 5}y = 1$.`
            : `في الفضاء المنسوب إلى معلم متعامد ممنظم مباشر، نعتبر الفلكة $(S): x^2+y^2+z^2-${2 * alpha}x+2y-4z=0$. حدد مركز وشعاع $(S)$.`,
          statementFr: isSm
            ? `Résoudre dans $\\mathbb{Z}^2$ l'équation diophantienne $13x - ${alpha + 5}y = 1$.`
            : `Déterminer le centre $\\Omega$ et le rayon $R$ de la sphère $(S)$.`,
          points: 1.0,
          skillLevel: "N1",
          nationalGradingStepsAr: [
            "0.50 ن: تحديد الحل الخاص أو الشكل القانوني لمعادلة الفلكة.",
            "0.50 ن: استنتاج مجموعة الحلول أو إحداثيات المركز والشعاع.",
          ],
          acceptedAlternativeMethodAr: "تُقبل خوارزمية أقليدس الممددة أو صيغ المركز والشعاع المباشرة.",
        },
        {
          codeAr: "1. ب)",
          codeFr: "1. b)",
          statementAr: isSm
            ? "استنتج باستعمال مبرهنة بيزو وغاوس حلول منظومة الموافقات المرفقة."
            : "احسب مسافة المركز $\\Omega$ عن المستوى $(P): x - 2y + 2z - 3 = 0$ واستنتج الوضع النسبي.",
          statementFr: isSm
            ? "En déduire les solutions du système de congruences."
            : "Calculer $d(\\Omega, (P))$ et étudier la position relative de $(S)$ et $(P)$.",
          points: 1.0,
          skillLevel: "N2",
          nationalGradingStepsAr: [
            "0.50 ن: تطبيق الصيغة القانونية بدقة.",
            "0.50 ن: مقارنة المسافة مع الشعاع واستنتاج التقاطع وفق دائرة.",
          ],
          acceptedAlternativeMethodAr: "يُقبل تحديد التمثيل البارامتري للمستقيم العمودي وحل النظمة.",
        },
        {
          codeAr: "2)",
          codeFr: "2)",
          statementAr: isSm
            ? "حدد باقي القسمة الأقليدية للعدد $2026^{1447}$ على $13$ باستعمال مبرهنة فيرما الصغرى."
            : "حدد إحداثيات مركز وشعاع دائرة تقاطع الفلكة $(S)$ والمستوى $(P)$.",
          statementFr: isSm
            ? "Déterminer le reste de $2026^{1447}$ modulo 13."
            : "Déterminer le centre $H$ et le rayon $r$ du cercle d'intersection.",
          points: 1.0,
          skillLevel: "N3",
          nationalGradingStepsAr: [
            "0.50 ن: تحديد التمثيل البارامتري أو اختزال الأس بتطبيق فيرما.",
            "0.50 ن: استنتاج النتيجة النهائية المعللة.",
          ],
          acceptedAlternativeMethodAr: "تُقبل طريقة المسقط العمودي عبر الجداء السلمي.",
        },
      ],
    },
    {
      exerciseNumber: 4,
      titleAr: "التمرين الرابع: حساب الاحتمالات والمتغيرات العشوائية (3 نقط)",
      titleFr: "Exercice 4 : Calcul des probabilités et variables aléatoires (3 pts)",
      domainCategory: "PROBABILITES",
      allocatedPoints: ex4Points,
      recommendedMinutes: 25,
      isMajorSynthesisProblem: false,
      subQuestions: [
        {
          codeAr: "1. أ)",
          codeFr: "1. a)",
          statementAr: `يحتوي كيس على ${alpha + 3} كرات بيضاء و 4 كرات سوداء. نسحب عشوائياً وفي آن واحد 3 كرات. احسب احتمال الحدث $A$: «الحصول على ثلاث كرات من نفس اللون».`,
          statementFr: `Une urne contient ${alpha + 3} boules blanches et 4 noires. On tire simultanément 3 boules. Calculer $P(A)$.`,
          points: 1.0,
          skillLevel: "N1",
          nationalGradingStepsAr: [
            "0.25 ن: حساب عدد الإمكانيات الكلي card(Ω) باستعمال التأليفات.",
            "0.75 ن: حساب card(A) وكتابة P(A) على شكل كسر مختزل.",
          ],
          acceptedAlternativeMethodAr: "يُقبل استعمال شجرة الاحتمالات المكافئة.",
        },
        {
          codeAr: "1. ب)",
          codeFr: "1. b)",
          statementAr: "احسب احتمال الحدث $B$: «الحصول على كرة بيضاء واحدة على الأقل».",
          statementFr: "Calculer $P(B)$ : « Obtenir au moins une boule blanche ».",
          points: 0.75,
          skillLevel: "N2",
          nationalGradingStepsAr: [
            "0.50 ن: توظيف الحدث المضاد B̄ (سحب 3 كرات سوداء).",
            "0.25 ن: حساب P(B) = 1 - P(B̄).",
          ],
          acceptedAlternativeMethodAr: "يُقبل فصل الحالات (كرة بيضاء أو كرتين أو ثلاث كرات بيضاء).",
        },
        {
          codeAr: "2)",
          codeFr: "2)",
          statementAr: "ليكن $X$ المتغير العشوائي الذي يربط كل سحبة بعدد الكرات البيضاء المسحوبة. حدد قانون احتمال $X$ واحسب أمله الرياضي $E(X)$.",
          statementFr: "Déterminer la loi de probabilité de $X$ et calculer son espérance $E(X)$.",
          points: 1.25,
          skillLevel: "N2",
          nationalGradingStepsAr: [
            "0.25 ن: تحديد مجموعة قيم X(Ω) = {0, 1, 2, 3}.",
            "0.75 ن: حساب احتمالات القيم الأربع والتحقق من كون مجموعها يساوي 1.",
            "0.25 ن: حساب الأمل الرياضي E(X).",
          ],
          acceptedAlternativeMethodAr: "يُقبل تقديم قانون الاحتمال في جدول منظم.",
        },
      ],
    },
    {
      exerciseNumber: 5,
      titleAr: "المسألة التوليفية الكبرى: دراسة دالة لوغاريتمية/أسية وحساب التكامل (8 نقط)",
      titleFr: "Problème de synthèse : Étude de fonction et calcul intégral (8 pts)",
      domainCategory: "ANALYSE",
      allocatedPoints: probPoints,
      recommendedMinutes: isSm ? 120 : 80,
      isMajorSynthesisProblem: true,
      subQuestions: [
        {
          codeAr: "I. 1)",
          codeFr: "I. 1)",
          statementAr: `لتكن $g$ الدالة العددية المعرفة على $]0,+\\infty[$ بـ $g(x) = x^2 - ${alpha} + ${alpha}\\ln(x)$. ادرس تغيرات $g$ واحسب $g(1)$ ثم استنتج إشارة $g(x)$ على $]0,+\\infty[$.`,
          statementFr: `Soit $g(x) = x^2 - ${alpha} + ${alpha}\\ln(x)$ sur $]0,+\\infty[$. Étudier les variations de $g$, calculer $g(1)$ et en déduire le signe de $g(x)$.`,
          points: 1.5,
          skillLevel: "N1",
          nationalGradingStepsAr: [
            "0.50 ن: حساب g'(x) = (2x² + α)/x > 0 واستنتاج التزايد القطعي.",
            "0.25 ن: حساب g(1) = 1 - α + 0 أو تحديد الجذر الوحيد.",
            "0.75 ن: استنتاج جدول إشارة g(x) على المجالين ]0,1] و [1,+∞[.",
          ],
          acceptedAlternativeMethodAr: "يُقبل استنتاج الإشارة بمقارنة إشارة x² - α وإشارة ln(x) على كل مجال.",
        },
        {
          codeAr: "II. 1. أ)",
          codeFr: "II. 1. a)",
          statementAr: `نعتبر الدالة $f$ المعرفة على $]0,+\\infty[$ بـ $f(x) = x - ${alpha}\\frac{\\ln(x)}{x}$. احسب $\\lim_{x \\to 0^+} f(x)$ و $\\lim_{x \\to +\\infty} f(x)$ وأوّل النتيجتين هندسياً.`,
          statementFr: `Soit $f(x) = x - ${alpha}\\frac{\\ln(x)}{x}$. Calculer les limites aux bornes et interpréter géométriquement.`,
          points: 1.25,
          skillLevel: "N1",
          nationalGradingStepsAr: [
            "0.50 ن: حساب النهاية عند 0⁺ وتأويل المقارب العمودي x = 0.",
            "0.75 ن: حساب النهاية عند +∞ باستعمال النهاية الاعتيادية ln(x)/x → 0.",
          ],
          acceptedAlternativeMethodAr: "يُقبل تغيير المتغير t = 1/x لحساب النهاية على يمين 0.",
        },
        {
          codeAr: "II. 1. ب)",
          codeFr: "II. 1. b)",
          statementAr: "بيّن أن المستقيم $(\\Delta): y = x$ مقارب مائل للمنحنى $(C_f)$ بجوار $+\\infty$ وادرس الوضع النسبي لـ $(C_f)$ و $(\\Delta)$.",
          statementFr: "Montrer que $(\\Delta): y = x$ est asymptote oblique à $(C_f)$ et étudier la position relative.",
          points: 1.25,
          skillLevel: "N2",
          nationalGradingStepsAr: [
            "0.50 ن: إثبات أن lim [f(x) - x] = 0 عند +∞.",
            "0.75 ن: دراسة إشارة الفرق f(x) - x وتحديد نقطة التقاطع I(1,1).",
          ],
          acceptedAlternativeMethodAr: "يُقبل تلخيص الوضع النسبي في جدول مؤطر.",
        },
        {
          codeAr: "II. 2. أ)",
          codeFr: "II. 2. a)",
          statementAr: "بيّن أن $(\\forall x > 0)\\; f'(x) = \\frac{g(x)}{x^2}$ ثم ضع جدول تغيرات الدالة $f$.",
          statementFr: "Montrer que $(\\forall x > 0)\\; f'(x) = \\frac{g(x)}{x^2}$ et dresser le tableau de variations de $f$.",
          points: 1.5,
          skillLevel: "N2",
          nationalGradingStepsAr: [
            "0.75 ن: حساب مشتقة الكسر ln(x)/x وتوحيد المقام للوصول إلى g(x)/x².",
            "0.75 ن: استنتاج إشارة f'(x) من الجزء الأول وبناء جدول التغيرات الكامل.",
          ],
          acceptedAlternativeMethodAr: "تُقبل كتابة f(x) = x - α·x⁻¹·ln(x) واشتقاق الجداء.",
        },
        {
          codeAr: "II. 2. ب)",
          codeFr: "II. 2. b)",
          statementAr: "أنشئ المستقيم $(\\Delta)$ والمنحنى $(C_f)$ في معلم متعامد ممنظم $(O,\\vec{i},\\vec{j})$ (الوحدة $2\\text{ cm}$).",
          statementFr: "Construire $(\\Delta)$ et $(C_f)$ dans un repère orthonormé $(O,\\vec{i},\\vec{j})$.",
          points: 1.0,
          skillLevel: "N2",
          nationalGradingStepsAr: [
            "0.25 ن: رسم المقارب العمودي والمقارب المائل (Δ).",
            "0.25 ن: تمثيل المماس الأفقي ونقطة التقاطع.",
            "0.50 ن: دقة رسم فرعي المنحنى واحترام التقعر.",
          ],
          acceptedAlternativeMethodAr: "يُمنح التنقيط الكامل لكل رسم يحترم الفروع اللانهائية والرتابة.",
        },
        {
          codeAr: "III)",
          codeFr: "III)",
          statementAr: "احسب بـ $\\text{cm}^2$ مساحة حيز المستوى المحصور بين المنحنى $(C_f)$ والمستقيم $(\\Delta)$ والمستقيمين اللذين معادلتاهما $x = 1$ و $x = e$.",
          statementFr: "Calculer en $\\text{cm}^2$ l'aire du domaine délimité par $(C_f)$, $(\\Delta)$, $x = 1$ et $x = e$.",
          points: 1.5,
          skillLevel: "N3",
          nationalGradingStepsAr: [
            "0.50 ن: تحديد الدالة الأصلية لـ ln(x)/x وهي ½(ln x)².",
            "0.50 ن: حساب التكامل المحدد من 1 إلى e.",
            "0.50 ن: الضرب في وحدة المساحة 4 cm².",
          ],
          acceptedAlternativeMethodAr: "تُقبل المكاملة بالأجزاء لحساب تكامل ln(x)/x.",
        },
      ],
    },
  ];

  let n1Pts = 0;
  let n2Pts = 0;
  let n3Pts = 0;
  let quarterSteps = 0;

  exercisesAndProblem.forEach((ex) => {
    ex.subQuestions.forEach((sq) => {
      if (sq.skillLevel === "N1") n1Pts += sq.points;
      else if (sq.skillLevel === "N2") n2Pts += sq.points;
      else n3Pts += sq.points;
      quarterSteps += Math.round(sq.points / 0.25);
    });
  });

  const printableLatexPreview = `% ============================================================================
% المملكة المغربية - الامتحان التجريبي الموحد للبكالوريا (Examen Blanc National)
% المسلك: ${track.labelAr} (${track.code}) | المعامل: ${spec.coef} | المدة: ${spec.hours} ساعات
% ============================================================================
\\documentclass[11pt,a4paper]{article}
\\usepackage{amsmath,amssymb}
\\begin{document}
% شريط السرية والصفحة الإدارية (الصفحة 1 من 4)
\\begin{center}
  \\textbf{الامتحان التجريبي الوطني الموحد للبكالوريا — نموذج ${modelTag}}\\\\
  \\textbf{المسلك: ${track.labelFr} | المعامل: ${spec.coef} | المدة: ${spec.hours}h}
\\end{center}
\\end{document}`;

  return {
    dossierId: `EXAMEN-BLANC-${track.code}-${modelTag}`,
    trackCode: track.code,
    trackLabelAr: track.labelAr,
    trackLabelFr: track.labelFr,
    officialCoefficient: spec.coef,
    officialDurationHours: spec.hours,
    officialDurationLabelAr: `${spec.hours} ساعات`,
    totalPoints: 20,
    totalPagesCount: 4,
    confidentialityHeaderBanner: {
      ministryHeaderAr:
        "المملكة المغربية · وزارة التربية الوطنية والتعليم الأولي والرياضة · المركز الوطني للتقويم والامتحانات",
      examSessionLabelAr: params.sessionLabelAr || "الدورة العادية التجريبية — يونيو 2026",
      anonymityCodeBoxLabelAr:
        "إطار خاص بكتابة الاسم الكامل ورقم الامتحان (يُطوى ويُختم في شريط السرية أعلى الصفحة 1/4)",
      strictInstructionsAr: [
        "يُسمح باستعمال الآلة الحاسبة العلمية غير القابلة للبرمجة طبقاً للمذكرات الوزارية الجاري بها العمل.",
        "يتكون الموضوع من 4 تمارين مستقلة ومسألة توليفية كبرى موزعة على 4 صفحات (من 1/4 إلى 4/4).",
        "يُراعى في التصحيح وضوح الاستدلال الرياضي ودقة التعليل في كل فرع (أ، ب، ج).",
      ],
    },
    exercisesAndProblem,
    nationalGradingSummary: {
      totalQuarterPointSteps: quarterSteps,
      n1PointsTotal: Number(n1Pts.toFixed(2)),
      n2PointsTotal: Number(n2Pts.toFixed(2)),
      n3PointsTotal: Number(n3Pts.toFixed(2)),
      inspectorComplianceBadgeAr: `مطابق 100% للأطر المرجعية الوطنية (${quarterSteps} خطوة تصحيح معيارية من فئة 0.25 ن · المجموع 20/20)`,
    },
    printableLatexPreview,
  };
}

// ============================================================================
// المرحلة 3: المحرر التفاعلي المباشر للأسئلة الفرعية (أ، ب، ج) وسلم التنقيط (0.25 ن)
// ============================================================================

export interface EditableExerciseSubQuestionTree {
  lessonTitleAr: string;
  lessonTitleFr: string;
  totalExercisePoints: number;
  questions: Array<{
    mainQuestionIndex: number;
    parentPoints: number;
    subQuestions: SubQuestionItem[];
  }>;
}

export function createEditableSubQuestionTree(
  lesson: LessonItem,
  totalExercisePoints: number = 6
): EditableExerciseSubQuestionTree {
  const sampleAr =
    lesson.sampleExerciseAr && lesson.sampleExerciseAr.length > 0
      ? lesson.sampleExerciseAr
      : [
          "1) أ) تحقق من الشرط الأساسي للمبرهنة. ب) استنتج النتيجة المباشرة.",
          "2) أ) بيّن بالترجع أو الاشتقاق العلاقة المطلوبة. ب) استنتج التأويل الهندسي.",
        ];
  const sampleFr =
    lesson.sampleExerciseFr && lesson.sampleExerciseFr.length > 0
      ? lesson.sampleExerciseFr
      : sampleAr;

  const perMainPoints = distributeParentPointsAcrossSubQuestions(
    totalExercisePoints,
    sampleAr.length
  );

  const questions = sampleAr.map((qAr, idx) => {
    const pPts = perMainPoints[idx] || 2;
    const decomp = decomposeQuestionIntoSubQuestions({
      questionAr: qAr,
      questionFr: sampleFr[idx] || qAr,
      parentPoints: pPts,
      parentLevel: idx === 0 ? "N1" : idx === sampleAr.length - 1 ? "N3" : "N2",
      mode: "STRUCTURED_ABC_ALL",
      questionIndex: idx,
    });
    return {
      mainQuestionIndex: idx,
      parentPoints: pPts,
      subQuestions: decomp.subQuestions,
    };
  });

  return {
    lessonTitleAr: lesson.lessonAr,
    lessonTitleFr: lesson.lessonFr,
    totalExercisePoints: Number(
      questions.reduce((acc, q) => acc + q.parentPoints, 0).toFixed(2)
    ),
    questions,
  };
}

export function adjustSubQuestionBaremeStep025(
  tree: EditableExerciseSubQuestionTree,
  mainQuestionIndex: number,
  subIndex: number,
  deltaStep: 0.25 | -0.25
): EditableExerciseSubQuestionTree {
  const cloned: EditableExerciseSubQuestionTree = JSON.parse(JSON.stringify(tree));
  const targetMain = cloned.questions[mainQuestionIndex];
  if (!targetMain || !targetMain.subQuestions[subIndex]) return cloned;

  const currentPts = targetMain.subQuestions[subIndex].points;
  const nextPts = Number((currentPts + deltaStep).toFixed(2));
  if (nextPts < 0.25 || nextPts > 10) return cloned;

  targetMain.subQuestions[subIndex].points = nextPts;
  targetMain.parentPoints = Number(
    targetMain.subQuestions.reduce((acc, s) => acc + s.points, 0).toFixed(2)
  );
  cloned.totalExercisePoints = Number(
    cloned.questions.reduce((acc, q) => acc + q.parentPoints, 0).toFixed(2)
  );
  return cloned;
}

export function moveSubQuestionOrder(
  tree: EditableExerciseSubQuestionTree,
  mainQuestionIndex: number,
  fromSubIndex: number,
  direction: "UP" | "DOWN"
): EditableExerciseSubQuestionTree {
  const cloned: EditableExerciseSubQuestionTree = JSON.parse(JSON.stringify(tree));
  const targetMain = cloned.questions[mainQuestionIndex];
  if (!targetMain) return cloned;

  const toSubIndex = direction === "UP" ? fromSubIndex - 1 : fromSubIndex + 1;
  if (toSubIndex < 0 || toSubIndex >= targetMain.subQuestions.length) return cloned;

  const temp = targetMain.subQuestions[fromSubIndex];
  targetMain.subQuestions[fromSubIndex] = targetMain.subQuestions[toSubIndex];
  targetMain.subQuestions[toSubIndex] = temp;

  const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];
  const latinLetters = ["a", "b", "c", "d", "e"];
  targetMain.subQuestions.forEach((sq, idx) => {
    sq.id = `subq_${mainQuestionIndex + 1}_${idx + 1}`;
    sq.labelAr = arabicLetters[idx] || `${idx + 1}`;
    sq.labelFr = latinLetters[idx] || `${idx + 1}`;
  });

  return cloned;
}

export function splitSubQuestionInTwo(
  tree: EditableExerciseSubQuestionTree,
  mainQuestionIndex: number,
  subIndex: number
): EditableExerciseSubQuestionTree {
  const cloned: EditableExerciseSubQuestionTree = JSON.parse(JSON.stringify(tree));
  const targetMain = cloned.questions[mainQuestionIndex];
  if (!targetMain || !targetMain.subQuestions[subIndex]) return cloned;

  const targetSub = targetMain.subQuestions[subIndex];
  const halfPts = Math.max(0.25, Math.round((targetSub.points / 2) * 4) / 4);
  const secondPts = Math.max(0.25, Number((targetSub.points - halfPts).toFixed(2)));

  targetSub.points = halfPts;
  const newSub: SubQuestionItem = {
    id: `${targetSub.id}_split`,
    subIndex: subIndex + 1,
    labelAr: "ج",
    labelFr: "c",
    textAr: `استنتج النتيجة التكميلية المباشرة انطلاقاً من السؤال الفرعي السابق.`,
    textFr: `En déduire le résultat complémentaire direct de la sous-question précédente.`,
    points: secondPts,
    pointsFormatted: secondPts.toFixed(2).replace(/\.00$/, ""),
    level: targetSub.level,
    estimatedMinutes: Math.max(2, Math.round(secondPts * 6)),
  };

  targetMain.subQuestions.splice(subIndex + 1, 0, newSub);

  const arabicLetters = ["أ", "ب", "ج", "د", "هـ"];
  const latinLetters = ["a", "b", "c", "d", "e"];
  targetMain.subQuestions.forEach((sq, idx) => {
    sq.id = `subq_${mainQuestionIndex + 1}_${idx + 1}`;
    sq.subIndex = idx;
    sq.labelAr = arabicLetters[idx] || `${idx + 1}`;
    sq.labelFr = latinLetters[idx] || `${idx + 1}`;
    sq.pointsFormatted = sq.points.toFixed(2).replace(/\.00$/, "");
  });

  targetMain.parentPoints = Number(
    targetMain.subQuestions.reduce((acc, s) => acc + s.points, 0).toFixed(2)
  );
  cloned.totalExercisePoints = Number(
    cloned.questions.reduce((acc, q) => acc + q.parentPoints, 0).toFixed(2)
  );
  return cloned;
}

export function updateSubQuestionText(
  tree: EditableExerciseSubQuestionTree,
  mainQuestionIndex: number,
  subIndex: number,
  newTextAr: string,
  newTextFr?: string
): EditableExerciseSubQuestionTree {
  const cloned: EditableExerciseSubQuestionTree = JSON.parse(JSON.stringify(tree));
  const targetMain = cloned.questions[mainQuestionIndex];
  if (!targetMain || !targetMain.subQuestions[subIndex]) return cloned;

  targetMain.subQuestions[subIndex].textAr = newTextAr;
  if (newTextFr !== undefined) {
    targetMain.subQuestions[subIndex].textFr = newTextFr;
  }
  return cloned;
}

// ============================================================================
// المرحلة 4: بطاقات الاستذكار المطوية وخرائط المراجعة الجيبية (Folded A5 & Flashcards A6)
// ============================================================================

export interface FoldedA5BookletPage {
  pageNumber: 1 | 2 | 3 | 4;
  impositionSlot: "OUTER_FRONT_RIGHT" | "OUTER_BACK_LEFT" | "INNER_LEFT" | "INNER_RIGHT";
  titleAr: string;
  subtitleFr: string;
  contentItemsAr: string[];
}

export interface FoldedA5RevisionBooklet {
  bookletId: string;
  lessonTitleAr: string;
  lessonTitleFr: string;
  trackCode: string;
  foldingInstructionsAr: string;
  outerSheetPages: [FoldedA5BookletPage, FoldedA5BookletPage]; // [Page 4, Page 1]
  innerSheetPages: [FoldedA5BookletPage, FoldedA5BookletPage]; // [Page 2, Page 3]
}

export interface FlashcardA6RectoVerso {
  cardNumber: number;
  categoryBadgeAr: string;
  rectoQuestionAr: string;
  rectoQuestionFr: string;
  versoStepsAr: string[];
  versoFormulaLatex: string;
}

export function buildFoldedA5RevisionBooklet(
  lesson: LessonItem,
  track: TrackData
): FoldedA5RevisionBooklet {
  const summary = generateStandaloneLessonSummary(lesson, track, "CHEAT_SHEET_1PAGE");

  const page1: FoldedA5BookletPage = {
    pageNumber: 1,
    impositionSlot: "OUTER_FRONT_RIGHT",
    titleAr: `ص 1: الغلاف والمفاهيم الأساسية — ${lesson.lessonAr}`,
    subtitleFr: `Page 1 : Couverture & Axiomes — ${lesson.lessonFr}`,
    contentItemsAr: summary.coreDefinitions.map(
      (r) => `${r.titleAr}: ${r.statementAr} (${r.formulaLatex})`
    ),
  };

  const page2: FoldedA5BookletPage = {
    pageNumber: 2,
    impositionSlot: "INNER_RIGHT",
    titleAr: "ص 2: بطاقات الطرائق المنهجية (كيف أبرهن على...؟)",
    subtitleFr: "Page 2 : Fiches Méthodes & Raisonnement",
    contentItemsAr: summary.methodHowToCards.map(
      (m) => `${m.examQuestionPromptAr} ← ${m.methodStepsAr.join(" | ")}`
    ),
  };

  const page3: FoldedA5BookletPage = {
    pageNumber: 3,
    impositionSlot: "INNER_LEFT",
    titleAr: "ص 3: الأخطاء الـ 5 الشائعة في الامتحان الوطني",
    subtitleFr: "Page 3 : Les 5 erreurs fréquentes à éviter",
    contentItemsAr: summary.topFivePitfallsAr,
  };

  const page4: FoldedA5BookletPage = {
    pageNumber: 4,
    impositionSlot: "OUTER_BACK_LEFT",
    titleAr: "ص 4: معجم التناوب اللغوي الرسمي (BIOF AR ↔ FR)",
    subtitleFr: "Page 4 : Lexique Mathématique Bilingue BIOF",
    contentItemsAr: summary.biofLexicon.map(
      (lex) => `${lex.termAr} ↔ ${lex.termFr} (${lex.mathSymbolLatex})`
    ),
  };

  return {
    bookletId: `A5-BOOKLET-${track.code}-${lesson.lessonFr.replace(/[^a-zA-Z0-9]/g, "_")}`,
    lessonTitleAr: lesson.lessonAr,
    lessonTitleFr: lesson.lessonFr,
    trackCode: track.code,
    foldingInstructionsAr:
      "تُطبع الورقة A4 بالوضع الأفقي (Landscape Recto-Verso) وتُطوى من المنتصف للحصول على كتيب جيبي A5 من 4 صفحات مرتبة منطقياً (1 → 2 → 3 → 4).",
    outerSheetPages: [page4, page1],
    innerSheetPages: [page2, page3],
  };
}

export function buildA6RectoVersoFlashcardsSheet(
  lesson: LessonItem,
  track: TrackData
): FlashcardA6RectoVerso[] {
  const summary = generateStandaloneLessonSummary(lesson, track, "METHOD_SHEETS_HOWTO");

  const cards: FlashcardA6RectoVerso[] = [];

  summary.methodHowToCards.forEach((m, idx) => {
    cards.push({
      cardNumber: idx + 1,
      categoryBadgeAr: `طريقة منهجية (${m.difficultyBadge})`,
      rectoQuestionAr: m.examQuestionPromptAr,
      rectoQuestionFr: m.examQuestionPromptFr,
      versoStepsAr: m.methodStepsAr,
      versoFormulaLatex: m.keyFormulaLatex,
    });
  });

  summary.coreDefinitions.forEach((r, idx) => {
    if (cards.length < 6) {
      cards.push({
        cardNumber: cards.length + 1,
        categoryBadgeAr: `خاصية أساسية #${idx + 1}`,
        rectoQuestionAr: `ما هو نص وصيغة « ${r.titleAr} »؟`,
        rectoQuestionFr: `Énoncer la propriété : « ${r.titleFr} »`,
        versoStepsAr: [r.statementAr, r.statementFr],
        versoFormulaLatex: r.formulaLatex,
      });
    }
  });

  while (cards.length < 8) {
    const pitIdx = cards.length - 5;
    const pitfall =
      summary.topFivePitfallsAr[pitIdx - 1] || summary.topFivePitfallsAr[0];
    cards.push({
      cardNumber: cards.length + 1,
      categoryBadgeAr: "تنبيه ديداكتيكي ومغالطة شائعة",
      rectoQuestionAr: `كيف نتفادى الخطأ الشائع رقم ${cards.length - 5} في ${lesson.lessonAr}؟`,
      rectoQuestionFr: "Comment éviter ce piège classique du Bac ?",
      versoStepsAr: [pitfall],
      versoFormulaLatex: "\\checkmark \\text{ التحقق من شروط المبرهنة قبل التطبيق}",
    });
  }

  return cards.slice(0, 8);
}
