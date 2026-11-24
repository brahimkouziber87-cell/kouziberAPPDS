import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FilePlus2,
  FileSpreadsheet,
  HelpCircle,
  Layers,
  LineChart,
  MousePointerClick,
  QrCode,
  RefreshCw,
  Search,
  Sparkles,
  Scan,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  InsertedFigure,
  LessonItem,
  getVariantQuestions,
} from "../data/curriculum";
import { MathText } from "./MathRenderer";
import { LongitudinalCohortTrackerConfig } from "../utils/mathjsValidator";

export type InnovationProposalTabId =
  | "INTERACTIVE_CF_SPLINE"
  | "BIOF_ERRORS_CATALOG"
  | "QR_PROGRESSIVE_HINTS";

export interface FourProposalsInnovationStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: InnovationProposalTabId;
  lessons: LessonItem[];
  trackCode: string;
  trackLabelAr: string;
  trackLabelFr: string;
  school: string;
  prof: string;
  year: string;
  semester: string;
  dsKey: string;
  isFr: boolean;
  onInsertFigureToExam: (fig: InsertedFigure) => void;
  onUpdateCustomQuestions: (
    lessonKey: string,
    questionsAr: string[],
    questionsFr: string[]
  ) => void;
  longitudinalConfig: LongitudinalCohortTrackerConfig;
  onChangeLongitudinalConfig: (cfg: LongitudinalCohortTrackerConfig) => void;
  onNotify: (type: "success" | "info" | "error", text: string) => void;
}

// ============================================================================
// 1. بيانات القوالب الجاهزة لمحرر المنحنيات البيانية التفاعلي C_f
// ============================================================================
interface SplinePreset {
  id: string;
  labelAr: string;
  labelFr: string;
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  asymptoteSlope: number | null;
  asymptoteIntercept: number;
}

const CF_SPLINE_PRESETS: SplinePreset[] = [
  {
    id: "cubic_classic",
    labelAr: "دالة حدودية من الدرجة 3 بمطرافين (-1, 2) و (1, -2)",
    labelFr: "Polynôme cubique avec deux extremums (-1, 2) et (1, -2)",
    p1: { x: -1, y: 2 },
    p2: { x: 1, y: -2 },
    asymptoteSlope: null,
    asymptoteIntercept: 0,
  },
  {
    id: "cubic_shifted",
    labelAr: "منحنى تمرين قراءة مبيانية (قيمة قصوى عند x=0 ودنيا عند x=2)",
    labelFr: "Courbe de lecture graphique (Max en x=0, Min en x=2)",
    p1: { x: 0, y: 3 },
    p2: { x: 2, y: -1 },
    asymptoteSlope: null,
    asymptoteIntercept: 0,
  },
  {
    id: "oblique_asymptote",
    labelAr: "منحنى يقبل مطرافين مع مستقيم مقارب مائل (Δ): y = x - 1",
    labelFr: "Courbe avec extremums et asymptote oblique (Δ): y = x - 1",
    p1: { x: -1.5, y: 1.5 },
    p2: { x: 1.5, y: -1.5 },
    asymptoteSlope: 0.5,
    asymptoteIntercept: 0,
  },
];

// ============================================================================
// 3. بنك الأخطاء الشائعة للمتعلمين والعوائق الإبستيمولوجية (BIOF)
// ============================================================================
export interface DidacticErrorEntry {
  id: string;
  cycle: "TC" | "1BAC" | "2BAC" | "ALL";
  topicAr: string;
  topicFr: string;
  titleAr: string;
  titleFr: string;
  wrongMathLatex: string;
  correctMathLatex: string;
  epistemologicalCauseAr: string;
  remediationScenarioAr: string;
  diagnosticQuestionAr: string;
  diagnosticQuestionFr: string;
}

const BIOF_FREQUENT_ERRORS_CATALOG: DidacticErrorEntry[] = [
  {
    id: "err_tvi_continuity",
    cycle: "2BAC",
    topicAr: "الاتصال ومبرهنة القيم الوسيطية (TVI)",
    topicFr: "Continuité et Théorème des Valeurs Intermédiaires (TVI)",
    titleAr: "تطبيق مبرهنة القيم الوسيطية دون التحقق من شرط الاتصال على المجال",
    titleFr: "Application du TVI sans vérifier la continuité sur l'intervalle",
    wrongMathLatex: "f(a)\\times f(b) < 0 \\implies \\exists c\\in ]a,b[,\\ f(c)=0",
    correctMathLatex:
      "\\begin{cases} f \\text{ continue sur } [a,b] \\\\ f(a)\\times f(b) < 0 \\end{cases} \\implies \\exists c\\in ]a,b[,\\ f(c)=0",
    epistemologicalCauseAr:
      "يركز المتعلم على الحساب العددي لجداء الصورتين $f(a)\\times f(b)<0$ ويغفل الشرط البنيوي (اتصال الدالة على القطعة $[a,b]$ ورتابتها قطعا عند طلب الوحدانية).",
    remediationScenarioAr:
      "تقديم مثال مضاد لدالة غير متصلة على $[-1,1]$ مثل $f(x)=\\frac{1}{x}$ حيث $f(-1)\\times f(1)=-1<0$ ورغم ذلك المعادلة $f(x)=0$ لا تقبل أي حل.",
    diagnosticQuestionAr:
      "بيّن أن المعادلة $x^3 + 2x - 1 = 0$ تقبل حلاً وحيداً $\\alpha$ في المجال $]0, 1[$ مع ذكر جميع شروط مبرهنة القيم الوسيطية (TVI).",
    diagnosticQuestionFr:
      "Montrer que l'équation $x^3 + 2x - 1 = 0$ admet une unique solution $\\alpha$ dans $]0, 1[$ en précisant toutes les hypothèses du TVI.",
  },
  {
    id: "err_chain_rule",
    cycle: "2BAC",
    topicAr: "الاشتقاق ودراسة الدوال",
    topicFr: "Dérivation et étude des fonctions",
    titleAr: "نسيان ضرب مشتقة الدالة الداخلية في قاعدة اشتقاق مركب دالتين",
    titleFr: "Oubli de la dérivée intérieure u'(x) lors de la dérivation d'une composée",
    wrongMathLatex: "\\left(\\ln(x^2+1)\\right)' = \\frac{1}{x^2+1} \\quad ; \\quad \\left(e^{-2x}\\right)' = e^{-2x}",
    correctMathLatex:
      "\\left(\\ln(u(x))\\right)' = \\frac{u'(x)}{u(x)} = \\frac{2x}{x^2+1} \\quad ; \\quad \\left(e^{u(x)}\\right)' = u'(x)e^{u(x)} = -2e^{-2x}",
    epistemologicalCauseAr:
      "التعميم الخطي الخاطئ لقواعد اشتقاق الدوال الاعتيادية $\\ln(x)$ و $e^x$ دون التمييز بين المتغير البسيط $x$ والمركب $u(x)$.",
    remediationScenarioAr:
      "تفكيك العبارة دائماً في المسودة بوضع $u(x)$ وحساب $u'(x)$ أولاً قبل تعويضها في علاقة اشتقاق مركب دالتين.",
    diagnosticQuestionAr:
      "احسب الدالة المشتقة $f'(x)$ للدالة $f(x) = \\ln(x^2 - 4x + 5) + e^{1 - 3x}$ مع تفصيل قاعدة اشتقاق مركب دالتين.",
    diagnosticQuestionFr:
      "Calculer la fonction dérivée $f'(x)$ de $f(x) = \\ln(x^2 - 4x + 5) + e^{1 - 3x}$ en détaillant la dérivation des fonctions composées.",
  },
  {
    id: "err_seq_monotony_vs_recurrence",
    cycle: "2BAC",
    topicAr: "المتتاليات العددية",
    topicFr: "Suites numériques",
    titleAr: "الخلط بين رتابة الدالة المرفقة $f$ ورتابة المتتالية الترجعية $u_{n+1}=f(u_n)$",
    titleFr: "Confusion entre la monotonie de f et la monotonie de la suite récurrente u_{n+1}=f(u_n)",
    wrongMathLatex: "f \\text{ croissante sur } I \\implies (u_n) \\text{ est croissante}",
    correctMathLatex:
      "\\text{Le sens de variation de } (u_n) \\text{ dépend du signe de } u_{n+1} - u_n = f(u_n) - u_n",
    epistemologicalCauseAr:
      "يخلط التلميذ بين تزايد الدالة $f$ (الذي يحافظ على الترتيب عند البرهان بالترجع) وبين إشارة الفرق $f(x)-x$ التي تحدد الوضع النسبي للمنحنى $(\\mathcal{C}_f)$ والمستقيم $(\\Delta): y=x$.",
    remediationScenarioAr:
      "توظيف التمثيل المبياني السلمي (Cobweb) لإبراز أن تزايد الدالة $f$ مع وجود $(\\mathcal{C}_f)$ تحت المستقيم $y=x$ يعطي متتالية تناقصية.",
    diagnosticQuestionAr:
      "ندرس المتتالية $(u_n)$ المعرفة بـ $u_0 = 3$ و $u_{n+1} = \\sqrt{u_n + 2}$. أدرس إشارة $f(x)-x$ على $[0,3]$ ثم استنتج رتابة المتتالية $(u_n)$.",
    diagnosticQuestionFr:
      "Soit $(u_n)$ définie par $u_0 = 3$ et $u_{n+1} = \\sqrt{u_n + 2}$. Étudier le signe de $f(x)-x$ sur $[0,3]$ puis en déduire la monotonie de $(u_n)$.",
  },
  {
    id: "err_ln_linearity",
    cycle: "2BAC",
    topicAr: "الدوال اللوغاريتمية والأسية",
    topicFr: "Fonctions logarithmiques et exponentielles",
    titleAr: "وهم الخطية في اللوغاريتم النيبيري وتجاهل مجموعة تعريف المعادلة",
    titleFr: "Illusion de linéarité du logarithme et oubli du domaine de validité",
    wrongMathLatex: "\\ln(x+y) = \\ln(x) + \\ln(y) \\quad ; \\quad \\ln(x^2) = 2\\ln(x) \\text{ sur } \\mathbb{R}^*",
    correctMathLatex:
      "\\ln(a\\times b) = \\ln(a) + \\ln(b) \\quad (a>0, b>0) \\quad ; \\quad \\ln(x^2) = 2\\ln|x|",
    epistemologicalCauseAr:
      "سحب خاصية التوزيعية الجبرية $k(a+b)=ka+kb$ على الدوال غير الخطية مثل $\\ln$ و $\\exp$ و $\\sqrt{\\cdot}$.",
    remediationScenarioAr:
      "إلزام المتعلم بتحديد حيز صحة المعادلة $D_E$ كخطوة أولى منقطة في سلم التنقيط قبل أي تحويل لوغاريتمي.",
    diagnosticQuestionAr:
      "حدد حيز تعريف المعادلة $D_E$ ثم حل في $\\mathbb{R}$ المعادلة: $\\ln(x - 1) + \\ln(x + 2) = \\ln(4)$.",
    diagnosticQuestionFr:
      "Déterminer le domaine de validité $D_E$ puis résoudre dans $\\mathbb{R}$ l'équation : $\\ln(x - 1) + \\ln(x + 2) = \\ln(4)$.",
  },
  {
    id: "err_complex_trig",
    cycle: "2BAC",
    topicAr: "الأعداد العقدية",
    topicFr: "Nombres complexes",
    titleAr: "اعتبار عدد سالب معياراً في الكتابة المثلثية $z = -r(\\cos\\theta + i\\sin\\theta)$",
    titleFr: "Confusion sur le signe du module dans la forme trigonométrique",
    wrongMathLatex: "z = -2(\\cos\\frac{\\pi}{3} + i\\sin\\frac{\\pi}{3}) \\implies |z| = -2,\\ \\arg(z)\\equiv \\frac{\\pi}{3}",
    correctMathLatex:
      "z = 2\\left(\\cos(\\frac{\\pi}{3}+\\pi) + i\\sin(\\frac{\\pi}{3}+\\pi)\\right) = [2,\\ \\frac{4\\pi}{3}]",
    epistemologicalCauseAr:
      "الاكتفاء بالمظهر الشكلي للعبارة $r(\\cos\\theta + i\\sin\\theta)$ دون التحقق من الشرط الأساسي للمعيار $r = |z| > 0$.",
    remediationScenarioAr:
      "التذكير دائماً بقواعد التحويل المثلثي: $-\\cos\\theta - i\\sin\\theta = \\cos(\\theta+\\pi) + i\\sin(\\theta+\\pi)$.",
    diagnosticQuestionAr:
      "اكتب على الشكل المثلثي والجبري العدد العقدي $z = -2\\left(\\cos\\frac{\\pi}{6} - i\\sin\\frac{\\pi}{6}\\right)$ ثم استنتج معياره وعمدته.",
    diagnosticQuestionFr:
      "Écrire sous forme trigonométrique le nombre complexe $z = -2\\left(\\cos\\frac{\\pi}{6} - i\\sin\\frac{\\pi}{6}\\right)$ et préciser son module et un argument.",
  },
  {
    id: "err_integral_area_abs",
    cycle: "2BAC",
    topicAr: "الحساب التكاملي والمساحات",
    topicFr: "Calcul intégral et calcul d'aires",
    titleAr: "حساب مساحة حيز مستوٍ دون القيمة المطلقة $|f(x)-g(x)|$ ودون وحدة المساحة u.a",
    titleFr: "Calcul d'aire sans valeur absolue |f(x)-g(x)| et sans unité d'aire (u.a)",
    wrongMathLatex: "\\mathcal{A} = \\int_a^b (f(x)-g(x))\\,dx",
    correctMathLatex:
      "\\mathcal{A} = \\left(\\int_a^b |f(x)-g(x)|\\,dx\\right) \\times \\|\\vec{i}\\|\\cdot\\|\\vec{j}\\|\\text{ cm}^2",
    epistemologicalCauseAr:
      "عدم ربط إشارة الفرق $f(x)-g(x)$ بالوضع النسبي للمنحنيين $(\\mathcal{C}_f)$ و $(\\mathcal{C}_g)$ على مجال المكاملة، وإغفال سلم المعلم.",
    remediationScenarioAr:
      "ربط سؤال المساحة دائماً بسؤال سابق حول الوضع النسبي وتجزئة التكامل عند نقط التقاطع وفق علاقة شال (Chasles).",
    diagnosticQuestionAr:
      "ادرس الوضع النسبي للمنحنى $(\\mathcal{C}_f)$ والمستقيم $(\\Delta): y=x$ على $[1, e]$ ثم احسب بـ $\\text{cm}^2$ مساحة الحيز المحصور بينهما علماً أن $\\|\\vec{i}\\|=\\|\\vec{j}\\|=2\\text{ cm}$.",
    diagnosticQuestionFr:
      "Étudier la position relative de $(\\mathcal{C}_f)$ et $(\\Delta): y=x$ sur $[1, e]$, puis calculer en $\\text{cm}^2$ l'aire du domaine délimité sachant que $\\|\\vec{i}\\|=\\|\\vec{j}\\|=2\\text{ cm}$.",
  },
  {
    id: "err_trigo_1bac",
    cycle: "1BAC",
    topicAr: "الحساب المثلثي والمرجح في المستوى",
    topicFr: "Calcul trigonométrique et Barycentre",
    titleAr: "إغفال مجموعة الحلول الثانية $\\pi - \\alpha + 2k\\pi$ في المعادلات $\\sin(x) = \\sin(\\alpha)$",
    titleFr: "Oubli de la seconde famille de solutions dans sin(x) = sin(α)",
    wrongMathLatex: "\\sin(x) = \\sin(\\alpha) \\iff x = \\alpha + 2k\\pi",
    correctMathLatex:
      "\\sin(x) = \\sin(\\alpha) \\iff x = \\alpha + 2k\\pi \\text{ أو } x = \\pi - \\alpha + 2k\\pi \\quad (k\\in\\mathbb{Z})",
    epistemologicalCauseAr:
      "عدم تمثل الدائرة المثلثية هندسياً والاقتصار على الحفظ الآلي بدون قراءة الأراتيب المتماثلة بالنسبة لمحور الأراتيب.",
    remediationScenarioAr:
      "فرض رسم دائرة مثلثية مصغرة بجانب كل معادلة مثلثية لتعيين القوسين المتناظرين قبل كتابة مجموعة الحلول.",
    diagnosticQuestionAr:
      "حل في $\\mathbb{R}$ ثم في المجال $]-\\pi, \\pi]$ المعادلة المثلثية: $\\sin(2x) = \\frac{\\sqrt{3}}{2}$ مع تمثيل الحلول على الدائرة المثلثية.",
    diagnosticQuestionFr:
      "Résoudre dans $\\mathbb{R}$ puis dans $]-\\pi, \\pi]$ l'équation $\\sin(2x) = \\frac{\\sqrt{3}}{2}$ et représenter les images des solutions sur le cercle trigonométrique.",
  },
  {
    id: "err_tcs_abs_inequality",
    cycle: "TC",
    topicAr: "الترتيب في ℝ والقيمة المطلقة",
    topicFr: "Ordre dans ℝ et Valeur absolue",
    titleAr: "الخلط بين حصر $|x - a| \\le r$ ومتراجحة $|x - a| \\ge r$",
    titleFr: "Confusion entre les inéquations |x - a| ≤ r et |x - a| ≥ r",
    wrongMathLatex: "|x - 2| \\ge 3 \\iff -3 \\le x - 2 \\le 3",
    correctMathLatex:
      "|x - 2| \\ge 3 \\iff x - 2 \\ge 3 \\text{ أو } x - 2 \\le -3 \\iff x \\in ]-\\infty, -1] \\cup [5, +\\infty[",
    epistemologicalCauseAr:
      "غياب التأويل الهندسي للقيمة المطلقة كمسافة على المستقيم المدرج $d(x, a) = |x - a|$.",
    remediationScenarioAr:
      "ترجمة كل متراجحة بالقيمة المطلقة إلى مسافة على مستقيم مدرج مركزه $a$ وشعاعه $r$ قبل الحل الجبري.",
    diagnosticQuestionAr:
      "أوّل هندسياً باستعمال المسافة ثم حل في $\\mathbb{R}$ المتراجحتين: $|x - 3| \\le 2$ و $|x + 1| > 4$.",
    diagnosticQuestionFr:
      "Interpréter géométriquement en termes de distance puis résoudre dans $\\mathbb{R}$ : $|x - 3| \\le 2$ et $|x + 1| > 4$.",
  },
];

// ============================================================================
// دالة مساعدة لتوليد رمز QR فيكتوري حتمي (Deterministic SVG QR Matrix)
// ============================================================================
function generateDeterministicQrCells(payload: string, size = 17): boolean[][] {
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  const placeFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
        const isCenter = r === 2 && c === 2;
        grid[r0 + r][c0 + c] = isBorder || isCenter;
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 5);
  placeFinder(size - 5, 0);

  let seed = Math.abs(hash) || 1234567;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 6 && c < 6;
      const inTopRight = r < 6 && c >= size - 6;
      const inBottomLeft = r >= size - 6 && c < 6;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      grid[r][c] = seed % 100 < 48;
    }
  }
  return grid;
}

export const FourProposalsInnovationStudioModal: React.FC<
  FourProposalsInnovationStudioModalProps
> = ({
  isOpen,
  onClose,
  initialTab = "INTERACTIVE_CF_SPLINE",
  lessons,
  trackCode,
  trackLabelAr,
  school,
  prof,
  year,
  semester,
  dsKey,
  onInsertFigureToExam,
  onUpdateCustomQuestions,
  longitudinalConfig,
  onChangeLongitudinalConfig,
  onNotify,
}) => {
  const [activeTab, setActiveTab] =
    useState<InnovationProposalTabId>(initialTab);

  // ==========================================================================
  // State for Tab 1: محرر المنحنيات البيانية التفاعلي باللمس والماوس (C_f Spline)
  // ==========================================================================
  const [p1, setP1] = useState<{ x: number; y: number }>({ x: -1, y: 2 });
  const [p2, setP2] = useState<{ x: number; y: number }>({ x: 1, y: -2 });
  const [draggingHandle, setDraggingHandle] = useState<"P1" | "P2" | null>(
    null
  );
  const [showHorizontalTangents, setShowHorizontalTangents] = useState(true);
  const [showInflectionPoint, setShowInflectionPoint] = useState(true);
  const [asymptoteSlope, setAsymptoteSlope] = useState<number | null>(null);
  const [copiedLatexSpline, setCopiedLatexSpline] = useState(false);
  const svgCanvasRef = useRef<SVGSVGElement | null>(null);

  // استنتاج الدالة الحدودية من الدرجة 3 التي تقبل مطرافين في P1(x1,y1) و P2(x2,y2)
  const cubicModel = useMemo(() => {
    const x1 = p1.x;
    let x2 = p2.x;
    if (Math.abs(x2 - x1) < 0.25) {
      x2 = x1 + 0.5;
    }
    const y1 = p1.y;
    const y2 = p2.y;

    // لكي تكون f'(x1)=0 و f'(x2)=0 نضع:
    // f(x) = a x^3 + b x^2 + c x + d
    // الفرق بين y1 و y2 في كثيرة الحدود التكعيبية التي تنعدم مشتقتها في x1 و x2:
    // f(x1) - f(x2) = -a/2 * (x1 - x2)^3  ==> a = -2*(y1 - y2) / (x1 - x2)^3
    const dx = x1 - x2;
    const a = (-2 * (y1 - y2)) / (dx * dx * dx);
    const b = (-3 * a * (x1 + x2)) / 2;
    const c = 3 * a * x1 * x2;
    const d = y1 - (a * x1 * x1 * x1 + b * x1 * x1 + c * x1);

    const evalF = (x: number) => a * x * x * x + b * x * x + c * x + d;
    const evalDf = (x: number) => 3 * a * x * x + 2 * b * x + c;

    const xInflection = (x1 + x2) / 2;
    const yInflection = evalF(xInflection);
    const slopeInflection = evalDf(xInflection);

    const fmtCoef = (val: number) => {
      const r = Math.round(val * 100) / 100;
      return r;
    };

    const formulaLatex = `f(x) = ${fmtCoef(a)}x^3 ${
      b >= 0 ? `+ ${fmtCoef(b)}` : `- ${fmtCoef(Math.abs(b))}`
    }x^2 ${c >= 0 ? `+ ${fmtCoef(c)}` : `- ${fmtCoef(Math.abs(c))}`}x ${
      d >= 0 ? `+ ${fmtCoef(d)}` : `- ${fmtCoef(Math.abs(d))}`
    }`;

    const tikzExpression = `${a.toFixed(3)}*(\\x)^3 + (${b.toFixed(
      3
    )})*(\\x)^2 + (${c.toFixed(3)})*(\\x) + (${d.toFixed(3)})`;

    return {
      a,
      b,
      c,
      d,
      x1: Math.min(x1, x2),
      x2: Math.max(x1, x2),
      yAtMinX: x1 < x2 ? y1 : y2,
      yAtMaxX: x1 < x2 ? y2 : y1,
      xInflection,
      yInflection,
      slopeInflection,
      evalF,
      evalDf,
      formulaLatex,
      tikzExpression,
    };
  }, [p1, p2]);

  // تحويل إحداثيات الماوس/اللمس على لوحة SVG
  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingHandle || !svgCanvasRef.current) return;
    const rect = svgCanvasRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    // المجال الرياضي: x in [-4, 4], y in [-4, 4]
    const mathX = Math.max(-3.5, Math.min(3.5, (relX - 0.5) * 8));
    const mathY = Math.max(-3.5, Math.min(3.5, (0.5 - relY) * 8));

    // تقريب إلى أقرب 0.25 لسهولة القراءة المبيانية للتلميذ
    const snappedX = Math.round(mathX * 4) / 4;
    const snappedY = Math.round(mathY * 4) / 4;

    if (draggingHandle === "P1") {
      if (Math.abs(snappedX - p2.x) >= 0.5) {
        setP1({ x: snappedX, y: snappedY });
      }
    } else if (draggingHandle === "P2") {
      if (Math.abs(snappedX - p1.x) >= 0.5) {
        setP2({ x: snappedX, y: snappedY });
      }
    }
  };

  // بناء مسار SVG للمنحنى C_f
  const curveSvgPath = useMemo(() => {
    const pts: string[] = [];
    for (let x = -4; x <= 4; x += 0.08) {
      const y = cubicModel.evalF(x);
      if (y < -4.5 || y > 4.5) continue;
      const svgX = 240 + x * 52;
      const svgY = 190 - y * 42;
      pts.push(`${pts.length === 0 ? "M" : "L"} ${svgX.toFixed(1)} ${svgY.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [cubicModel]);

  const generatedSplineTikzCode = useMemo(() => {
    return `% =========================================================
% منحنى الدالة (C_f) وجدول تغيراتها المستنتج آلياً (TikZ + tkz-tab)
% الصيغة الجبرية المستنتجة: ${cubicModel.formulaLatex}
% =========================================================
\\begin{center}
\\begin{tikzpicture}[scale=0.85, >=stealth]
  \\draw[very thin, color=gray!30, step=1] (-4,-4) grid (4,4);
  \\draw[->, thick] (-4.2,0) -- (4.3,0) node[right] {$x$};
  \\draw[->, thick] (0,-4.2) -- (0,4.3) node[above] {$y$};
  \\node[below left] at (0,0) {$O$};
  \\draw[->, very thick] (0,0) -- (1,0) node[midway, below] {$\\vec{i}$};
  \\draw[->, very thick] (0,0) -- (0,1) node[midway, left] {$\\vec{j}$};
  \\clip (-4,-4) rectangle (4,4);
  \\draw[domain=-3.8:3.8, smooth, variable=\\x, blue!80!black, very thick] plot ({\\x}, {${
    cubicModel.tikzExpression
  }});
  \\filldraw[red!80!black] (${p1.x},${p1.y}) circle (2.2pt) node[above] {$A(${
      p1.x
    };${p1.y})$};
  \\filldraw[red!80!black] (${p2.x},${p2.y}) circle (2.2pt) node[below] {$B(${
      p2.x
    };${p2.y})$};
  \\draw[<->, thick, teal!80!black] (${p1.x - 0.65},${p1.y}) -- (${
      p1.x + 0.65
    },${p1.y});
  \\draw[<->, thick, teal!80!black] (${p2.x - 0.65},${p2.y}) -- (${
      p2.x + 0.65
    },${p2.y});
  \\filldraw[amber!90!black] (${cubicModel.xInflection.toFixed(
    2
  )},${cubicModel.yInflection.toFixed(2)}) circle (2pt) node[right] {$I$};
\\end{tikzpicture}
\\end{center}

\\begin{center}
\\begin{tikzpicture}
  \\tkzTabInit[lgt=2.2, espcl=2.6]
    {$x$ / 0.8, $f'(x)$ / 0.8, $f(x)$ / 2.0}
    {$-\\infty$, $${cubicModel.x1}$, $${cubicModel.x2}$, $+\\infty$}
  \\tkzTabLine{, ${cubicModel.a >= 0 ? "+" : "-"}, z, ${
      cubicModel.a >= 0 ? "-" : "+"
    }, z, ${cubicModel.a >= 0 ? "+" : "-"}, }
  \\tkzTabVar{${cubicModel.a >= 0 ? "-/ $-\\infty$" : "+/ $+\\infty$"}, ${
      cubicModel.a >= 0
        ? `+/ $${cubicModel.yAtMinX}$`
        : `-/ $${cubicModel.yAtMinX}$`
    }, ${
      cubicModel.a >= 0
        ? `-/ $${cubicModel.yAtMaxX}$`
        : `+/ $${cubicModel.yAtMaxX}$`
    }, ${cubicModel.a >= 0 ? "+/ $+\\infty$" : "-/ $-\\infty$"}}
\\end{tikzpicture}
\\end{center}`;
  }, [cubicModel, p1, p2]);

  const handleInsertSplineFigureToExam = () => {
    const standaloneSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 380" width="480" height="380">
      <rect width="480" height="380" fill="#ffffff"/>
      ${[-3, -2, -1, 0, 1, 2, 3]
        .map((g) => {
          const gx = 240 + g * 52;
          const gy = 190 - g * 42;
          return `<line x1="${gx}" y1="0" x2="${gx}" y2="380" stroke="#e2e8f0" stroke-width="1"/><line x1="0" y1="${gy}" x2="480" y2="${gy}" stroke="#e2e8f0" stroke-width="1"/>`;
        })
        .join("")}
      <line x1="12" y1="190" x2="468" y2="190" stroke="#0f172a" stroke-width="1.6"/>
      <line x1="240" y1="12" x2="240" y2="368" stroke="#0f172a" stroke-width="1.6"/>
      <path d="${curveSvgPath}" fill="none" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>
      <line x1="${240 + (p1.x - 0.85) * 52}" y1="${190 - p1.y * 42}" x2="${
      240 + (p1.x + 0.85) * 52
    }" y2="${190 - p1.y * 42}" stroke="#059669" stroke-width="2.2"/>
      <line x1="${240 + (p2.x - 0.85) * 52}" y1="${190 - p2.y * 42}" x2="${
      240 + (p2.x + 0.85) * 52
    }" y2="${190 - p2.y * 42}" stroke="#059669" stroke-width="2.2"/>
      <circle cx="${240 + p1.x * 52}" cy="${
      190 - p1.y * 42
    }" r="5" fill="#e11d48"/>
      <text x="${240 + p1.x * 52}" y="${
      190 - p1.y * 42 - 10
    }" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle" fill="#0f172a">A(${
      p1.x
    }; ${p1.y})</text>
      <circle cx="${240 + p2.x * 52}" cy="${
      190 - p2.y * 42
    }" r="5" fill="#059669"/>
      <text x="${240 + p2.x * 52}" y="${
      190 - p2.y * 42 + 18
    }" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle" fill="#0f172a">B(${
      p2.x
    }; ${p2.y})</text>
    </svg>`;

    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      standaloneSvg
    )}`;

    const newFig: InsertedFigure = {
      id: `fig_spline_cf_${Date.now()}`,
      titleAr: `التمثيل المبياني للدالة (C_f) في معلم متعامد ممنظم — ${cubicModel.formulaLatex}`,
      titleFr: `Représentation graphique de (C_f) dans un repère orthonormé — ${cubicModel.formulaLatex}`,
      dataUrl: svgDataUrl,
      caption: `المنحنى (C_f) يقبل مماسين أفقيين في A(${p1.x}; ${p1.y}) و B(${p2.x}; ${p2.y}) ونقطة انعطاف I(${cubicModel.xInflection.toFixed(1)}; ${cubicModel.yInflection.toFixed(1)})`,
      showCaption: true,
      borderStyle: "academic",
      exerciseId: "ex_0",
      widthPercent: 80,
      alignment: "center",
    };
    onInsertFigureToExam(newFig);
    onNotify(
      "success",
      "تم إدراج المنحنى التفاعلي (C_f) في معاينة الورقة A4 بنجاح."
    );
  };

  const handleInsertGraphicalReadingExercise = () => {
    const targetLesson = lessons[0];
    if (!targetLesson) return;

    const lessonKey = `${trackCode}_${targetLesson.lessonFr}`;
    const current = getVariantQuestions(targetLesson, "A", false, 0);

    const nextNum = current.questionsAr.length + 1;
    const newQAr = `${nextNum}. [قراءة مبيانية واستنتاج صيغة الدالة] باعتماد المنحنى الممثل للدالة $f$ القابلة للاشتقاق على $\\mathbb{R}$ والذي يقبل مماسين أفقيين في النقطتين $A(${p1.x}; ${p1.y})$ و $B(${p2.x}; ${p2.y})$ ونقطة انعطاف $I(${cubicModel.xInflection}; ${cubicModel.yInflection.toFixed(2)})$: (أ) حدد مبيانياً $f(${p1.x})$ و $f'(${p1.x})$ و $f'(${p2.x})$. (ب) ضع جدول تغيرات الدالة $f$ على $\\mathbb{R}$. (ج) علماً أن $f(x)=ax^3+bx^2+cx+d$، تحقق أن: $${cubicModel.formulaLatex}$`;
    const newQFr = `${nextNum}. [Lecture graphique et identification] Par lecture graphique de la courbe $(\\mathcal{C}_f)$ admettant deux tangentes horizontales en $A(${p1.x}; ${p1.y})$ et $B(${p2.x}; ${p2.y})$ et un point d'inflexion $I(${cubicModel.xInflection}; ${cubicModel.yInflection.toFixed(2)})$ : a) Déterminer graphiquement $f(${p1.x})$, $f'(${p1.x})$ et $f'(${p2.x})$. b) Dresser le tableau de variations de $f$. c) Vérifier que $${cubicModel.formulaLatex}$.`;

    onUpdateCustomQuestions(
      lessonKey,
      [...current.questionsAr, newQAr],
      [...current.questionsFr, newQFr]
    );
    handleInsertSplineFigureToExam();
    onNotify(
      "success",
      "تم إدراج سؤال القراءة المبيانية المتكامل مع المنحنى (C_f) في التمرين الأول."
    );
  };

  const handleGenerateSplineQcmForOmr = () => {
    const targetLesson = lessons[0];
    if (!targetLesson) return;

    const lessonKey = `${trackCode}_${targetLesson.lessonFr}`;
    const current = getVariantQuestions(targetLesson, "A", false, 0);

    const isMaxAtP1 = p1.y > p2.y;
    const q1Ar = `[QCM-OMR] قيمة العدد المشتق $f'(${p1.x})$ عند نقطة المماس الأفقي $A(${p1.x}; ${p1.y})$ هي:
(A) $0$  |  (B) $1$  |  (C) $-1$  |  (D) غير معرف`;
    const q1Fr = `[QCM-OMR] La valeur du nombre dérivé $f'(${p1.x})$ au point de tangente horizontale $A(${p1.x}; ${p1.y})$ est :
(A) $0$  |  (B) $1$  |  (C) $-1$  |  (D) Indéterminé`;

    const q2Ar = `[QCM-OMR] طبيعة النقطة $A(${p1.x}; ${p1.y})$ بالنسبة لمنحنى الدالة $f$:
(A) ${isMaxAtP1 ? "قيمة قصوية محلية" : "قيمة دنوية محلية"}  |  (B) ${isMaxAtP1 ? "قيمة دنوية محلية" : "قيمة قصوية محلية"}  |  (C) نقطة انعطاف  |  (D) مقارب عمودي`;
    const q2Fr = `[QCM-OMR] La nature du point $A(${p1.x}; ${p1.y})$ pour la courbe $(\\mathcal{C}_f)$ :
(A) ${isMaxAtP1 ? "Maximum local" : "Minimum local"}  |  (B) ${isMaxAtP1 ? "Minimum local" : "Maximum local"}  |  (C) Point d'inflexion  |  (D) Asymptote`;

    const signOnIntervalAr = isMaxAtP1 ? "تناقصية قطعا ($f'(x) \\le 0$)" : "تزايدية قطعا ($f'(x) \\ge 0$)";
    const signAltAr = isMaxAtP1 ? "تزايدية قطعا ($f'(x) \\ge 0$)" : "تناقصية قطعا ($f'(x) \\le 0$)";
    const q3Ar = `[QCM-OMR] على المجال $]${Math.min(p1.x, p2.x)}; ${Math.max(p1.x, p2.x)}[$، إشارة $f'(x)$ ورتابة $f$:
(A) ${signOnIntervalAr}  |  (B) ${signAltAr}  |  (C) ثابتة  |  (D) غير رتيبة`;
    const q3Fr = `[QCM-OMR] Sur l'intervalle $]${Math.min(p1.x, p2.x)}; ${Math.max(p1.x, p2.x)}[$, le signe de $f'(x)$ et monotonie :
(A) ${isMaxAtP1 ? "f est strictement décroissante" : "f est strictement croissante"}  |  (B) ${isMaxAtP1 ? "f est strictement croissante" : "f est strictement décroissante"}  |  (C) Constante  |  (D) Non monotone`;

    const q4Ar = `[QCM-OMR] إحداثيات نقطة انعطاف المنحنى $(\\mathcal{C}_f)$ حيث تنعدم المشتقة الثانية وتغير إشارتها:
(A) $I(${cubicModel.xInflection}; ${cubicModel.yInflection.toFixed(1)})$  |  (B) $I(0; 0)$  |  (C) $I(${p2.x}; ${p2.y})$  |  (D) لا توجد`;
    const q4Fr = `[QCM-OMR] Les coordonnées du point d'inflexion $I$ où $f''(x)$ s'annule et change de signe :
(A) $I(${cubicModel.xInflection}; ${cubicModel.yInflection.toFixed(1)})$  |  (B) $I(0; 0)$  |  (C) $I(${p2.x}; ${p2.y})$  |  (D) Aucune`;

    onUpdateCustomQuestions(
      lessonKey,
      [...current.questionsAr, q1Ar, q2Ar, q3Ar, q4Ar],
      [...current.questionsFr, q1Fr, q2Fr, q3Fr, q4Fr]
    );
    handleInsertSplineFigureToExam();
    onNotify(
      "success",
      "تم توليد 4 أسئلة QCM بيانية متوافقة مع مصحح الكاميرا OMR وإدراجها مع المنحنى في الفرض بنجاح."
    );
  };

  // ==========================================================================
  // State for Tab 3: بنك الأخطاء الشائعة للمتعلمين (Catalogue des Erreurs BIOF)
  // ==========================================================================
  const [selectedErrorCycle, setSelectedErrorCycle] = useState<
    "ALL" | "TC" | "1BAC" | "2BAC"
  >("ALL");
  const [errorSearchQuery, setErrorSearchQuery] = useState("");

  const filteredErrors = useMemo(() => {
    return BIOF_FREQUENT_ERRORS_CATALOG.filter((item) => {
      const matchCycle =
        selectedErrorCycle === "ALL" ||
        item.cycle === selectedErrorCycle ||
        item.cycle === "ALL";
      const q = errorSearchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.titleAr.toLowerCase().includes(q) ||
        item.topicAr.toLowerCase().includes(q) ||
        item.epistemologicalCauseAr.toLowerCase().includes(q);
      return matchCycle && matchQuery;
    });
  }, [selectedErrorCycle, errorSearchQuery]);

  const handleInsertDiagnosticQuestionFromError = (
    errItem: DidacticErrorEntry
  ) => {
    const targetLesson = lessons[0];
    if (!targetLesson) return;

    const lessonKey = `${trackCode}_${targetLesson.lessonFr}`;
    const current = getVariantQuestions(targetLesson, "A", false, 0);
    const nextNum = current.questionsAr.length + 1;

    onUpdateCustomQuestions(
      lessonKey,
      [
        ...current.questionsAr,
        `${nextNum}. [سؤال اليقظة الديداكتيكية ومعالجة الخطأ الشائع — ${errItem.topicAr}] ${errItem.diagnosticQuestionAr}`,
      ],
      [
        ...current.questionsFr,
        `${nextNum}. [Vigilance didactique — ${errItem.topicFr}] ${errItem.diagnosticQuestionFr}`,
      ]
    );
    onNotify(
      "success",
      `تم إدراج سؤال معالجة الخطأ الشائع (${errItem.titleAr}) في الوثيقة الجارية.`
    );
  };

  // ==========================================================================
  // State for Tab 4: مولد أوراق التصحيح الذاتي والتلميحات التدريجية بالرمز المربع (QR)
  // ==========================================================================
  const [activeHintPreviewExerciseIdx, setActiveHintPreviewExerciseIdx] =
    useState(0);
  const [unlockedHintLevel, setUnlockedHintLevel] = useState<1 | 2 | 3>(1);

  const exercisesProgressiveHints = useMemo(() => {
    return lessons.map((lesson, idx) => {
      const lessonKey = `${trackCode}_${lesson.lessonFr}`;
      const { questionsAr } = getVariantQuestions(lesson, "A", false, 0);

      const hint1Ar = `استحضر التعريف والخاصية المرجعية في درس «${lesson.lessonAr}» وحدد مجموعة التعريف أو الشروط البدئية قبل الشروع في الحساب الجبري.`;
      const hint2Ar = `انتبه للإشارات وتوحيد المقامات أو التعميل بالحد المهيمن؛ يمكنك التحقق من اتساق خطوتك بتعويض قيمة عددية بسيطة في المتغير.`;
      const hint3Ar = `معيار التحقق الذاتي: تأكد من أن النتيجة النهائية تنتمي إلى المجال المطلوب وتوافق اتجاه تغير الدالة أو المتتالية في التمرين ${
        idx + 1
      } (${questionsAr.length} أسئلة).`;

      const qrPayload = `DOC2APP-HINT|${trackCode}|${dsKey}|EX${
        idx + 1
      }|${lessonKey}`;
      const qrMatrix = generateDeterministicQrCells(qrPayload, 17);

      return {
        exerciseNumber: idx + 1,
        lessonKey,
        lessonTitleAr: lesson.lessonAr,
        lessonTitleFr: lesson.lessonFr,
        questionCount: questionsAr.length,
        hint1Ar,
        hint2Ar,
        hint3Ar,
        qrPayload,
        qrMatrix,
      };
    });
  }, [lessons, trackCode, dsKey]);

  const handleAppendProgressiveHintsToExercises = () => {
    lessons.forEach((lesson, idx) => {
      const lessonKey = `${trackCode}_${lesson.lessonFr}`;
      const current = getVariantQuestions(lesson, "A", false, 0);

      const hintData = exercisesProgressiveHints[idx];
      if (!hintData) return;

      const nextNum = current.questionsAr.length + 1;
      const hintTagAr = `${nextNum}. [تلميح تدريجي للتصحيح الذاتي QR — التمرين ${
        idx + 1
      }] (1) مفتاح الانطلاق: ${hintData.hint1Ar} | (2) التحقق الذاتي: ${
        hintData.hint3Ar
      }`;
      const hintTagFr = `${nextNum}. [Indice progressif d'auto-évaluation QR — Exercice ${
        idx + 1
      }] Mobiliser les propriétés de « ${
        lesson.lessonFr
      } » et vérifier la cohérence du résultat final.`;

      onUpdateCustomQuestions(
        lessonKey,
        [...current.questionsAr, hintTagAr],
        [...current.questionsFr, hintTagFr]
      );
    });

    onNotify(
      "success",
      "تم إرفاق التلميحات التدريجية ومعايير التصحيح الذاتي المرمّزة (QR) بجميع تمارين الوثيقة."
    );
  };

  if (!isOpen) return null;

  const selectedHintExercise =
    exercisesProgressiveHints[activeHintPreviewExerciseIdx] ||
    exercisesProgressiveHints[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-6xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* ترويسة الاستوديو التكاملي للمقترحات العملية الأربعة */}
        <div className="bg-slate-950 text-white px-5 py-4 border-b border-cyan-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono font-black text-sm shrink-0">
              4×LAB
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white truncate">
                  استوديو الابتكارات التطبيقية الأربعة (منحنى C_f التفاعلي · مسار Excel · بنك أخطاء BIOF · تلميحات QR)
                </h2>
                <span className="text-[10.5px] font-mono font-bold text-cyan-300">
                  · {trackLabelAr} ({trackCode})
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                تفعيل مباشر للمقترحات الأربعة: سحب النقط الحرجة بالماوس، استيراد/تصدير نقط مسار، معالجة الأخطاء الشائعة، والتصحيح الذاتي بالرمز المربع
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center cursor-pointer shrink-0"
            title="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* شريط التبويبات الأربعة */}
        <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("INTERACTIVE_CF_SPLINE")}
            className={`h-9 px-3.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "INTERACTIVE_CF_SPLINE"
                ? "bg-slate-900 text-cyan-300 shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <MousePointerClick className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>1. محرر المنحنى C_f التفاعلي بالماوس</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("BIOF_ERRORS_CATALOG")}
            className={`h-9 px-3.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "BIOF_ERRORS_CATALOG"
                ? "bg-slate-900 text-cyan-300 shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>2. بنك الأخطاء الشائعة للمتعلمين (BIOF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("QR_PROGRESSIVE_HINTS")}
            className={`h-9 px-3.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "QR_PROGRESSIVE_HINTS"
                ? "bg-slate-900 text-cyan-300 shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <QrCode className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>3. مولد التلميحات التدريجية والتصحيح الذاتي (QR)</span>
          </button>
        </div>

        {/* المحتوى الرئيسي للتبويب النشط */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/60">
          {/* =================================================================
              التبويب الأول: محرر المنحنيات البيانية التفاعلي باللمس والماوس (C_f)
             ================================================================= */}
          {activeTab === "INTERACTIVE_CF_SPLINE" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* اللوحة الهندسية التفاعلية (7 أعمدة) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                      <LineChart className="w-4 h-4 text-cyan-700" />
                      <span>
                        معلم متعامد ممنظم تفاعلي $(O, \vec&#123;i&#125;, \vec&#123;j&#125;)$ — اسحب النقطتين $A$ و $B$ بالماوس
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      يقوم المحرك الجبري بحل نظمة المعادلات آلياً لاستنتاج صيغة الدالة $f(x)$ التي تنعدم مشتقتها في $A$ و $B$
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {CF_SPLINE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setP1(preset.p1);
                          setP2(preset.p2);
                          setAsymptoteSlope(preset.asymptoteSlope);
                        }}
                        className="px-2 py-1 rounded-lg text-[10.5px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer transition"
                        title={preset.labelAr}
                      >
                        {preset.id === "cubic_classic"
                          ? "قالب قياسي"
                          : preset.id === "cubic_shifted"
                          ? "قراءة مبيانية"
                          : "مقارب مائل"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* رقعة الرسم التفاعلية SVG */}
                <div className="relative rounded-xl border border-slate-300 bg-slate-950 overflow-hidden select-none">
                  <svg
                    ref={svgCanvasRef}
                    viewBox="0 0 480 380"
                    className="w-full h-[320px] sm:h-[350px] touch-none cursor-crosshair"
                    onPointerMove={handleSvgPointerMove}
                    onPointerUp={() => setDraggingHandle(null)}
                    onPointerLeave={() => setDraggingHandle(null)}
                  >
                    {/* شبكة التدريجات */}
                    {[-3, -2, -1, 0, 1, 2, 3].map((g) => {
                      const gx = 240 + g * 52;
                      const gy = 190 - g * 42;
                      return (
                        <React.Fragment key={g}>
                          <line
                            x1={gx}
                            y1={0}
                            x2={gx}
                            y2={380}
                            stroke="#1e293b"
                            strokeWidth={g === 0 ? 1.8 : 1}
                          />
                          <line
                            x1={0}
                            y1={gy}
                            x2={480}
                            y2={gy}
                            stroke="#1e293b"
                            strokeWidth={g === 0 ? 1.8 : 1}
                          />
                          {g !== 0 && (
                            <>
                              <text
                                x={gx}
                                y={204}
                                fill="#94a3b8"
                                fontSize="10"
                                textAnchor="middle"
                                fontFamily="monospace"
                              >
                                {g}
                              </text>
                              <text
                                x={228}
                                y={gy + 3}
                                fill="#94a3b8"
                                fontSize="10"
                                textAnchor="end"
                                fontFamily="monospace"
                              >
                                {g}
                              </text>
                            </>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* المحوران O, i, j */}
                    <line
                      x1={12}
                      y1={190}
                      x2={468}
                      y2={190}
                      stroke="#cbd5e1"
                      strokeWidth="1.6"
                    />
                    <line
                      x1={240}
                      y1={12}
                      x2={240}
                      y2={368}
                      stroke="#cbd5e1"
                      strokeWidth="1.6"
                    />
                    <text x={460} y={182} fill="#38bdf8" fontSize="12" fontWeight="bold">
                      x
                    </text>
                    <text x={248} y={22} fill="#38bdf8" fontSize="12" fontWeight="bold">
                      y
                    </text>

                    {/* المستقيم المقارب الاختياري */}
                    {asymptoteSlope !== null && (
                      <line
                        x1={240 - 4 * 52}
                        y1={190 - (-4 * asymptoteSlope) * 42}
                        x2={240 + 4 * 52}
                        y2={190 - 4 * asymptoteSlope * 42}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                      />
                    )}

                    {/* منحنى الدالة C_f */}
                    <path
                      d={curveSvgPath}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />

                    {/* المماسان الأفقيان في A و B */}
                    {showHorizontalTangents && (
                      <>
                        <line
                          x1={240 + (p1.x - 0.85) * 52}
                          y1={190 - p1.y * 42}
                          x2={240 + (p1.x + 0.85) * 52}
                          y2={190 - p1.y * 42}
                          stroke="#34d399"
                          strokeWidth="2.2"
                        />
                        <line
                          x1={240 + (p2.x - 0.85) * 52}
                          y1={190 - p2.y * 42}
                          x2={240 + (p2.x + 0.85) * 52}
                          y2={190 - p2.y * 42}
                          stroke="#34d399"
                          strokeWidth="2.2"
                        />
                      </>
                    )}

                    {/* نقطة الانعطاف I */}
                    {showInflectionPoint && (
                      <g>
                        <circle
                          cx={240 + cubicModel.xInflection * 52}
                          cy={190 - cubicModel.yInflection * 42}
                          r={5}
                          fill="#fbbf24"
                          stroke="#0f172a"
                          strokeWidth="1.5"
                        />
                        <text
                          x={240 + cubicModel.xInflection * 52 + 10}
                          y={190 - cubicModel.yInflection * 42 - 6}
                          fill="#fbbf24"
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          I({cubicModel.xInflection.toFixed(1)};
                          {cubicModel.yInflection.toFixed(1)})
                        </text>
                      </g>
                    )}

                    {/* النقطة الحرجة القابلة للسحب A (P1) */}
                    <g
                      className="cursor-grab active:cursor-grabbing"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDraggingHandle("P1");
                      }}
                    >
                      <circle
                        cx={240 + p1.x * 52}
                        cy={190 - p1.y * 42}
                        r={9}
                        fill="#f43f5e"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                      <text
                        x={240 + p1.x * 52}
                        y={190 - p1.y * 42 - 14}
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        A({p1.x}; {p1.y})
                      </text>
                    </g>

                    {/* النقطة الحرجة القابلة للسحب B (P2) */}
                    <g
                      className="cursor-grab active:cursor-grabbing"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDraggingHandle("P2");
                      }}
                    >
                      <circle
                        cx={240 + p2.x * 52}
                        cy={190 - p2.y * 42}
                        r={9}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                      <text
                        x={240 + p2.x * 52}
                        y={190 - p2.y * 42 + 22}
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        B({p2.x}; {p2.y})
                      </text>
                    </g>
                  </svg>

                  <div className="bg-slate-900/95 border-t border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showHorizontalTangents}
                          onChange={(e) =>
                            setShowHorizontalTangents(e.target.checked)
                          }
                          className="rounded accent-cyan-400"
                        />
                        <span>إظهار المماسات الأفقية $f'(x)=0$</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showInflectionPoint}
                          onChange={(e) =>
                            setShowInflectionPoint(e.target.checked)
                          }
                          className="rounded accent-amber-400"
                        />
                        <span>إظهار مركز التماثل / نقطة الانعطاف $I$</span>
                      </label>
                    </div>
                    <span className="font-mono text-cyan-300 font-bold" dir="ltr">
                      {cubicModel.formulaLatex}
                    </span>
                  </div>
                </div>
              </div>

              {/* العمود الأيسر: الصيغة الجبرية المستنتجة + جدول التغيرات + أزرار الإدراج (5 أعمدة) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                  <h4 className="text-xs font-black text-slate-950 border-b border-slate-100 pb-2">
                    الصيغة الجبرية المستنتجة وجدول التغيرات الآلي ($tkz\text&#123;-&#125;tab$)
                  </h4>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500">
                      تعبير الدالة $f(x)$ الموافق للمطرافين $A$ و $B$:
                    </div>
                    <div
                      className="text-sm font-black text-slate-950 font-mono"
                      dir="ltr"
                    >
                      <MathText text={`$${cubicModel.formulaLatex}$`} />
                    </div>
                    <div className="text-[11px] text-teal-800 font-semibold">
                      المشتقة تنعدم في $x_1 = {cubicModel.x1}$ وفي $x_2 ={" "}
                      {cubicModel.x2}$ ونقطة الانعطاف هي $I(
                      {cubicModel.xInflection.toFixed(2)};{" "}
                      {cubicModel.yInflection.toFixed(2)})$.
                    </div>
                  </div>

                  {/* معاينة جدول التغيرات */}
                  <div
                    className="border border-slate-300 rounded-xl overflow-hidden text-xs font-mono bg-white"
                    dir="ltr"
                  >
                    <div className="grid grid-cols-5 border-b border-slate-300 bg-slate-100 font-bold py-1.5 text-center">
                      <span className="border-r border-slate-300">x</span>
                      <span>-∞</span>
                      <span>{cubicModel.x1}</span>
                      <span>{cubicModel.x2}</span>
                      <span>+∞</span>
                    </div>
                    <div className="grid grid-cols-5 border-b border-slate-300 py-1.5 text-center">
                      <span className="border-r border-slate-300 font-bold bg-slate-50">
                        f'(x)
                      </span>
                      <span className="text-teal-700 font-black">
                        {cubicModel.a >= 0 ? "+" : "-"}
                      </span>
                      <span className="text-rose-600 font-black">0</span>
                      <span className="text-amber-700 font-black">
                        {cubicModel.a >= 0 ? "-" : "+"}
                      </span>
                      <span className="text-teal-700 font-black">
                        0 &nbsp; {cubicModel.a >= 0 ? "+" : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 py-2.5 text-center items-center">
                      <span className="border-r border-slate-300 font-bold bg-slate-50 h-full flex items-center justify-center">
                        f(x)
                      </span>
                      <span>{cubicModel.a >= 0 ? "↗" : "↘"}</span>
                      <span className="font-black text-rose-700">
                        {cubicModel.yAtMinX}
                      </span>
                      <span>{cubicModel.a >= 0 ? "↘" : "↗"}</span>
                      <span className="font-black text-emerald-700">
                        {cubicModel.yAtMaxX} &nbsp; {cubicModel.a >= 0 ? "↗" : "↘"}
                      </span>
                    </div>
                  </div>

                  {/* أزرار الإدراج المباشر في الورقة */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleInsertSplineFigureToExam}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                    >
                      <FilePlus2 className="w-4 h-4" />
                      <span>
                        إدراج المنحنى (C_f) وجدول التغيرات في الورقة A4
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInsertGraphicalReadingExercise}
                      className="w-full py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        توليد وإدراج تمرين قراءة مبيانية متكامل (BIOF) في الفرض
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateSplineQcmForOmr}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
                    >
                      <Scan className="w-4 h-4 text-amber-300" />
                      <span>
                        توليد أسئلة QCM بيانية موجهة للمصحح الآلي OMR (بالكاميرا)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedSplineTikzCode);
                        setCopiedLatexSpline(true);
                        setTimeout(() => setCopiedLatexSpline(false), 2000);
                        onNotify(
                          "info",
                          "تم نسخ كود TikZ + tkz-tab إلى الحافظة."
                        );
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      {copiedLatexSpline ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                      <span>
                        {copiedLatexSpline
                          ? "تم نسخ كود TikZ و tkz-tab"
                          : "نسخ كود LaTeX (TikZ + tkz-tab) الجاهز لـ Overleaf"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              التبويب الثالث: بنك الأخطاء الشائعة للمتعلمين والعوائق الإبستيمولوجية (BIOF)
             ================================================================= */}
          {activeTab === "BIOF_ERRORS_CATALOG" && (
            <div className="space-y-4">
              {/* شريط الفلترة والبحث */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(
                    [
                      { id: "ALL", label: "جميع المستويات" },
                      { id: "TC", label: "الجذع المشترك (TC)" },
                      { id: "1BAC", label: "الأولى بكالوريا (1BAC)" },
                      { id: "2BAC", label: "الثانية بكالوريا (2BAC)" },
                    ] as const
                  ).map((cyc) => (
                    <button
                      key={cyc.id}
                      type="button"
                      onClick={() => setSelectedErrorCycle(cyc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                        selectedErrorCycle === cyc.id
                          ? "bg-slate-900 text-cyan-300 shadow-2xs"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      {cyc.label}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={errorSearchQuery}
                    onChange={(e) => setErrorSearchQuery(e.target.value)}
                    placeholder="ابحث عن خطأ شائع (TVI، اشتقاق المركب، لوغاريتم، تكامل...)"
                    className="w-full border border-slate-300 rounded-xl pr-8 pl-3 py-1.5 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-600"
                  />
                </div>
              </div>

              {/* قائمة بطاقات الأخطاء الشائعة وسيناريوهات المعالجة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredErrors.map((errItem) => (
                  <div
                    key={errItem.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-black text-teal-800">
                          {errItem.topicAr}
                        </span>
                        <span className="font-mono text-[10.5px] font-bold text-slate-500">
                          {errItem.cycle}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-black text-slate-950">
                        {errItem.titleAr}
                      </h4>

                      {/* مقارنة التمثيل الخاطئ بالصياغة الرياضية الصحيحة */}
                      <div className="grid grid-cols-1 gap-2">
                        <div className="bg-rose-50/70 border border-rose-200/90 rounded-xl p-2.5">
                          <div className="text-[10px] font-black text-rose-800 mb-1">
                            ✗ التمثيل الخاطئ الشائع لدى المتعلم:
                          </div>
                          <div className="text-xs font-mono text-rose-950" dir="ltr">
                            <MathText text={`$${errItem.wrongMathLatex}$`} />
                          </div>
                        </div>

                        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-2.5">
                          <div className="text-[10px] font-black text-emerald-800 mb-1">
                            ✓ الصياغة الرياضية السليمة والشرط المرجعي:
                          </div>
                          <div
                            className="text-xs font-mono text-emerald-950"
                            dir="ltr"
                          >
                            <MathText text={`$${errItem.correctMathLatex}$`} />
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-700 leading-relaxed space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                        <div>
                          <strong className="text-slate-950">
                            التشخيص الإبستيمولوجي:{" "}
                          </strong>
                          <MathText text={errItem.epistemologicalCauseAr} />
                        </div>
                        <div>
                          <strong className="text-teal-900">
                            التدخل العلاجي الفوري:{" "}
                          </strong>
                          <MathText text={errItem.remediationScenarioAr} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleInsertDiagnosticQuestionFromError(errItem)
                        }
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition"
                      >
                        <FilePlus2 className="w-3.5 h-3.5" />
                        <span>
                          إدراج سؤال كاشف ومعالج لهذا الخطأ في الوثيقة A4
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              التبويب الرابع: مولد التلميحات التدريجية والتصحيح الذاتي بالرمز المربع (QR)
             ================================================================= */}
          {activeTab === "QR_PROGRESSIVE_HINTS" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* قائمة تمارين الوثيقة وبطاقات QR (7 أعمدة) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-indigo-700" />
                      <span>
                        بطاقات التلميحات التدريجية المرمّزة (Indices Progressifs par QR Code)
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      تمنح التلميذ 3 مستويات متدرجة من التوجيه المنهجي دون كشف الحل الكامل، مما يعزز التعلم الذاتي في الفروض المنزلية والسلاسل
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAppendProgressiveHintsToExercises}
                    className="h-8 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-black flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>إرفاق التلميحات التدريجية بتمارين الوثيقة A4</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {exercisesProgressiveHints.map((item, idx) => {
                    const isSelected = activeHintPreviewExerciseIdx === idx;
                    return (
                      <div
                        key={item.lessonKey + idx}
                        onClick={() => setActiveHintPreviewExerciseIdx(idx)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-slate-50/80 hover:bg-white text-slate-900 border-slate-200"
                        }`}
                      >
                        {/* رمز QR الفيكتوري */}
                        <div className="p-1.5 bg-white rounded-xl border border-slate-200 shrink-0">
                          <svg
                            viewBox="0 0 17 17"
                            className="w-14 h-14"
                            shapeRendering="crispEdges"
                          >
                            {item.qrMatrix.map((row, rIdx) =>
                              row.map((cell, cIdx) =>
                                cell ? (
                                  <rect
                                    key={`${rIdx}_${cIdx}`}
                                    x={cIdx}
                                    y={rIdx}
                                    width={1}
                                    height={1}
                                    fill="#0f172a"
                                  />
                                ) : null
                              )
                            )}
                          </svg>
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`font-mono text-[10.5px] font-black ${
                                isSelected ? "text-cyan-300" : "text-teal-800"
                              }`}
                            >
                              التمرين {item.exerciseNumber} · {item.questionCount}{" "}
                              أسئلة
                            </span>
                            <span
                              className={`text-[10px] font-mono ${
                                isSelected ? "text-amber-300" : "text-slate-400"
                              }`}
                            >
                              3 تلميحات
                            </span>
                          </div>
                          <div className="text-xs font-black truncate">
                            {item.lessonTitleAr}
                          </div>
                          <div
                            className={`text-[10.5px] line-clamp-2 ${
                              isSelected ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            {item.hint1Ar}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* محاكي شاشة التلميذ عند مسح رمز QR (5 أعمدة) */}
              {selectedHintExercise && (
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                  <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-teal-700" />
                        <span>
                          محاكي واجهة التلميذ عند مسح رمز QR — التمرين{" "}
                          {selectedHintExercise.exerciseNumber}
                        </span>
                      </h4>
                      <p className="text-[10.5px] text-slate-500 font-semibold">
                        جرّب فتح التلميحات الثلاثة بالتدريج كما تظهر للمتعلم أثناء الإنجاز الذاتي
                      </p>
                    </div>
                  </div>

                  {/* أزرار المستويات الثلاثة للتلميح */}
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {(
                      [
                        { level: 1, label: "التلميح 1 (الانطلاق)" },
                        { level: 2, label: "التلميح 2 (الطريقة)" },
                        { level: 3, label: "التلميح 3 (التحقق)" },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.level}
                        type="button"
                        onClick={() => setUnlockedHintLevel(st.level)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-black transition cursor-pointer ${
                          unlockedHintLevel === st.level
                            ? "bg-slate-900 text-cyan-300 shadow-2xs"
                            : "text-slate-600 hover:text-slate-950"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* بطاقة التلميح المفتوح */}
                  <div className="space-y-2.5 pt-1">
                    <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-1">
                      <div className="text-[10.5px] font-black text-cyan-900">
                        المستوى 1 — مفتاح الانطلاق والخاصية المرجعية:
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                        {selectedHintExercise.hint1Ar}
                      </p>
                    </div>

                    {unlockedHintLevel >= 2 && (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                        <div className="text-[10.5px] font-black text-amber-900">
                          المستوى 2 — التوجيه الإجرائي والتحويل الجبري:
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                          {selectedHintExercise.hint2Ar}
                        </p>
                      </div>
                    )}

                    {unlockedHintLevel >= 3 && (
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <div className="text-[10.5px] font-black text-emerald-900">
                          المستوى 3 — معيار التحقق الذاتي دون كشف الحل الكامل:
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                          {selectedHintExercise.hint3Ar}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
