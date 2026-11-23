import {
  CURRICULUM_DB,
  LessonItem,
  MoroccanDSStructureMode,
  TrackData,
  computeExactExerciseEffectiveWeights,
  getQuestionBaremesAndLevels,
  getVariantQuestions,
} from "../data/curriculum";
import { MoroccanDiagnosticPaper } from "./diagnosticGenerator";
import { renderQrSvgString } from "./qrCodeHelper";
import { InteractiveQuizData, QuizQuestionItem } from "./quizGenerator";

function computeExactExercisePointsOut20(
  lessons: Array<{ weight: number }>,
  exBudgetPoints: number = 20
): number[] {
  const effectiveWeightsPct = computeExactExerciseEffectiveWeights(
    lessons,
    exBudgetPoints
  );
  return effectiveWeightsPct.map((wPct) =>
    Number(((wPct / 100) * 20).toFixed(2))
  );
}

// ============================================================================
// PART A: PREREQUISITE-BASED DIAGNOSTIC TEST STUDIO & INTERACTIVE QR ENGINE
// ============================================================================

export interface PrerequisiteCatalogItem {
  index: number;
  id: string;
  titleAr: string;
  titleFr: string;
  domainAr: string;
  domainFr: string;
  priorLevelAr: string;
  priorLevelFr: string;
  targetPoints: number;
  qcmItem: {
    statementAr: string;
    statementFr: string;
    optionsAr: string[];
    optionsFr: string[];
    correctIndex: number;
    explanationAr: string;
    explanationFr: string;
    points: number;
  };
  openExercise: {
    titleAr: string;
    titleFr: string;
    questionsAr: string[];
    questionsFr: string[];
    solutionsAr: string[];
    solutionsFr: string[];
    questionPoints: number[];
    questionLevels: Array<"N1" | "N2" | "N3">;
    remediationAr: string;
    remediationFr: string;
  };
}

export interface PrerequisiteDiagnosticBlueprint {
  blueprintId: string;
  trackCode: string;
  trackLabelAr: string;
  trackLabelFr: string;
  cycle: string;
  priorGradeLabelAr: string;
  priorGradeLabelFr: string;
  examModel: "A" | "B";
  durationAr: string;
  durationFr: string;
  customTitleAr: string;
  customTitleFr: string;
  verificationCode: string;
  interactiveQrUrl: string;
  interactiveQrSvg: string;
  totalPoints: number;
  includeQcm: boolean;
  includeOpenExercises: boolean;
  includeSynthesisProblem: boolean;
  selectedPrerequisites: PrerequisiteCatalogItem[];
  diagnosticPaper: MoroccanDiagnosticPaper;
  asLessonItems: LessonItem[];
  interactiveQuizData: InteractiveQuizData;
}

export interface DiagnosticPrerequisiteMasteryRow {
  prereqId: string;
  titleAr: string;
  titleFr: string;
  domainAr: string;
  earnedPoints: number;
  maxPoints: number;
  masteryPercent: number;
  status: "MASTERED" | "PARTIAL" | "CRITICAL_REMEDIATION";
  statusLabelAr: string;
  remediationPlanAr: string;
}

export interface DiagnosticMasteryEvaluationReport {
  totalEarned: number;
  totalMax: number;
  overallPercent: number;
  overallStatusAr: string;
  rows: DiagnosticPrerequisiteMasteryRow[];
}

function resolvePriorGradeLabels(track: TrackData): { ar: string; fr: string } {
  const code = (track.code || "").toUpperCase();
  if (track.cycle === "TC" || code.includes("TC") || code === "2NDE") {
    return {
      ar: "مكتسبات السنة الثالثة إعدادي (3APIC — السلك الإعدادي)",
      fr: "Acquis de la 3ème Année Collège (3APIC / Brevet)",
    };
  }
  if (track.cycle === "1BAC" || code.includes("1BAC") || code === "1ERE_SPE") {
    return {
      ar: "مكتسبات الجذع المشترك العلمي والتكنولوجي (TCS)",
      fr: "Acquis du Tronc Commun Scientifique (TCS / Seconde)",
    };
  }
  return {
    ar: "مكتسبات السنة الأولى بكالوريا علوم (1BAC Sciences)",
    fr: "Acquis de la 1ère Année Baccalauréat Scientifique (1BAC / Première Spé)",
  };
}

/**
 * يبني كتالوج المكتسبات القبلية الرسمية لكل مستوى دراسي مع أسئلة QCM وتمارين تطبيقية وخطط دعم لكل مكتسب
 */
export function getTrackPrerequisitesCatalog(
  trackCode: string,
  examModel: "A" | "B" = "A"
): PrerequisiteCatalogItem[] {
  const track = CURRICULUM_DB[trackCode] || CURRICULUM_DB["2BAC_PC"];
  const priorGrade = resolvePriorGradeLabels(track);
  const isModelA = examModel === "A";
  const k = isModelA ? 2 : 3;

  const basePrereqsAr =
    track.prereqsAr && track.prereqsAr.length > 0
      ? track.prereqsAr
      : [
          "الحساب الجبري والمعادلات والمتراجحات",
          "الدوال العددية والنهايات والاشتقاق",
          "المتتاليات العددية والحساب المثلثي",
          "الهندسة المستوية والفضائية والجداء السلمي",
        ];

  const rawPrereqsAr =
    basePrereqsAr.length === 1 && basePrereqsAr[0].includes("،")
      ? basePrereqsAr[0]
          .split("،")
          .map((s) => s.trim().replace(/^و(?=\S)/, "").trim())
          .filter(Boolean)
      : basePrereqsAr;

  const basePrereqsFr =
    track.prereqsFr && track.prereqsFr.length > 0
      ? track.prereqsFr
      : rawPrereqsAr.map((_, i) => `Prérequis fondamental n°${i + 1}`);

  const rawPrereqsFr =
    basePrereqsFr.length === 1 && (basePrereqsFr[0].includes(",") || /\bet\b/i.test(basePrereqsFr[0]))
      ? basePrereqsFr[0]
          .split(/,|\s+et\s+/i)
          .map((s) => s.trim())
          .filter(Boolean)
      : basePrereqsFr;

  const isTC = track.cycle === "TC" || track.code === "2NDE";
  const is1Bac = track.cycle === "1BAC" || track.code === "1ERE_SPE";

  return rawPrereqsAr.map((titleAr, idx) => {
    const titleFr = rawPrereqsFr[idx] || titleAr;
    const lower = `${titleAr} ${titleFr}`.toLowerCase();

    let domainAr = "التحليل والدوال";
    let domainFr = "Analyse & Fonctions";
    if (
      lower.includes("هندسة") ||
      lower.includes("متجه") ||
      lower.includes("طاليس") ||
      lower.includes("فيتاغورس") ||
      lower.includes("مرجح") ||
      lower.includes("سلمي") ||
      lower.includes("مثلث") ||
      lower.includes("géom") ||
      lower.includes("vect") ||
      lower.includes("scalaire") ||
      lower.includes("trigo")
    ) {
      domainAr = "الهندسة والحساب المثلثي";
      domainFr = "Géométrie & Trigonométrie";
    } else if (
      lower.includes("حساب") ||
      lower.includes("نشر") ||
      lower.includes("تعميل") ||
      lower.includes("معادلات") ||
      lower.includes("جبر") ||
      lower.includes("منطق") ||
      lower.includes("مجموعات") ||
      lower.includes("متتالي") ||
      lower.includes("algèbre") ||
      lower.includes("calcul") ||
      lower.includes("logique") ||
      lower.includes("suite")
    ) {
      domainAr = "الجبر والمنطق والمتتاليات";
      domainFr = "Algèbre, Logique & Suites";
    } else if (lower.includes("احتمال") || lower.includes("إحصاء") || lower.includes("probab")) {
      domainAr = "الاحتمالات والإحصاء";
      domainFr = "Probabilités & Statistiques";
    }

    // Template pool based on cycle + index
    if (isTC) {
      const tcTemplates = [
        {
          qcm: {
            statementAr: `في إطار «${titleAr}»، القيمة المبسطة للتعبير A = √(${k * 9}) + √(${k * 4}) - √(${k}) هي:`,
            statementFr: `Dans le cadre de « ${titleFr} », la forme simplifiée de A = √(${k * 9}) + √(${k * 4}) - √(${k}) est :`,
            optionsAr: [`4√${k}`, `3√${k}`, `5√${k}`, `2√${k}`],
            optionsFr: [`4√${k}`, `3√${k}`, `5√${k}`, `2√${k}`],
            correctIndex: 0,
            explanationAr: `لدينا √(${k * 9}) = 3√${k} و √(${k * 4}) = 2√${k}، إذن A = (3 + 2 - 1)√${k} = 4√${k}.`,
            explanationFr: `On a 3√${k} + 2√${k} - √${k} = 4√${k}.`,
          },
          open: {
            questionsAr: [
              `1. بسط العددين X = (2^3 × 2^{-5}) / 2^{-4} و Y = 3√${k * 4} - √${k * 9} مع حذف الجذر من المقام في Z = ${k}/(√${k + 1} - 1). [1.5 ن · N1]`,
              `2. قارن العددين a = 2√${k + 1} و b = √${4 * (k + 1) + 1} ثم استنتج إشارة الفرق a - b. [1.5 ن · N2]`,
            ],
            questionsFr: [
              `1. Simplifier X = (2^3 × 2^{-5}) / 2^{-4} et Y = 3√${k * 4} - √${k * 9} puis rendre rationnel le dénominateur de Z = ${k}/(√${k + 1} - 1). [1.5 pt · N1]`,
              `2. Comparer les réels a = 2√${k + 1} et b = √${4 * (k + 1) + 1} puis déterminer le signe de a - b. [1.5 pt · N2]`,
            ],
            solutionsAr: [
              `1. نجد X = 2^{3-5+4} = 2^2 = 4، و Y = 6√${k} - 3√${k} = 3√${k}، وبالضرب في المرافق نجد Z = √${k + 1} + 1.`,
              `2. بمقارنة المربعين: a² = ${4 * (k + 1)} و b² = ${4 * (k + 1) + 1}، إذن a < b ومنه a - b < 0.`,
            ],
            solutionsFr: [
              `1. X = 4, Y = 3√${k}, et par expression conjuguée Z = √${k + 1} + 1.`,
              `2. En comparant les carrés : a² < b² avec a,b > 0 donc a - b < 0.`,
            ],
            remediationAr: "مراجعة قواعد القوى a^n × a^m، تبسيط الجذور المربعة √(a²b) = |a|√b، والضرب في المرافق.",
            remediationFr: "Réviser les règles des puissances, la simplification des radicaux et l'expression conjuguée.",
          },
        },
        {
          qcm: {
            statementAr: `تعميل التعبير الجبري E(x) = x² - ${k * k} + (x - ${k})(2x + 1) يساوي:`,
            statementFr: `La factorisation de l'expression E(x) = x² - ${k * k} + (x - ${k})(2x + 1) est :`,
            optionsAr: [
              `(x - ${k})(3x + ${k + 1})`,
              `(x + ${k})(3x - ${k + 1})`,
              `(x - ${k})(x + ${k + 1})`,
              `(x - ${k})²`,
            ],
            optionsFr: [
              `(x - ${k})(3x + ${k + 1})`,
              `(x + ${k})(3x - ${k + 1})`,
              `(x - ${k})(x + ${k + 1})`,
              `(x - ${k})²`,
            ],
            correctIndex: 0,
            explanationAr: `نلاحظ أن x² - ${k * k} = (x - ${k})(x + ${k})، وبالتعميل بـ (x - ${k}) نحصل على (x - ${k})(x + ${k} + 2x + 1) = (x - ${k})(3x + ${k + 1}).`,
            explanationFr: `On factorise par (x - ${k}) après avoir reconnu l'identité remarquable x² - ${k}².`,
          },
          open: {
            questionsAr: [
              `1. انشر وبسط التعبير A(x) = (2x - ${k})² - (x + 1)(x - 1)، ثم عمّل B(x) = x² - ${k * k} + 2(x - ${k})(x + 1). [1.75 ن · N1]`,
              `2. حل في المجموعة ℝ المعادلة B(x) = 0 ثم المتراجحة 3x - ${2 * k} ≤ x + 4 ومثل حلولها على مستقيم مدرج. [1.75 ن · N2]`,
            ],
            questionsFr: [
              `1. Développer A(x) = (2x - ${k})² - (x + 1)(x - 1) puis factoriser B(x) = x² - ${k * k} + 2(x - ${k})(x + 1). [1.75 pt · N1]`,
              `2. Résoudre dans ℝ l'équation B(x) = 0 puis l'inéquation 3x - ${2 * k} ≤ x + 4. [1.75 pt · N2]`,
            ],
            solutionsAr: [
              `1. نجد A(x) = 3x² - ${4 * k}x + ${k * k + 1}، وبالتعميل B(x) = (x - ${k})(3x + ${k + 2}).`,
              `2. حلول المعادلة هي S = {${k}, -${k + 2}/3}، وحلول المتراجحة هي x ≤ ${k + 2} أي S = ]-∞, ${k + 2}].`,
            ],
            solutionsFr: [
              `1. A(x) = 3x² - ${4 * k}x + ${k * k + 1} et B(x) = (x - ${k})(3x + ${k + 2}).`,
              `2. S_éq = {${k}, -${k + 2}/3} et S_inéq = ]-∞, ${k + 2}].`,
            ],
            remediationAr: "تثبيت المتطابقات الهامة الثلاث وحل معادلة الجداء المنعدم A(x)×B(x) = 0.",
            remediationFr: "Consolider les 3 identités remarquables et la résolution d'équations-produits.",
          },
        },
        {
          qcm: {
            statementAr: `في مثلث ABC قائم الزاوية في A حيث AB = 3 و AC = 4، طول الوتر BC وجيب الزاوية sin(B̂) هما:`,
            statementFr: `Dans un triangle ABC rectangle en A avec AB = 3 et AC = 4, l'hypoténuse BC et sin(B̂) valent :`,
            optionsAr: [
              "BC = 5 و sin(B̂) = 4/5",
              "BC = 5 و sin(B̂) = 3/5",
              "BC = 7 و sin(B̂) = 4/7",
              "BC = √7 و sin(B̂) = 3/4",
            ],
            optionsFr: [
              "BC = 5 et sin(B̂) = 4/5",
              "BC = 5 et sin(B̂) = 3/5",
              "BC = 7 et sin(B̂) = 4/7",
              "BC = √7 et sin(B̂) = 3/4",
            ],
            correctIndex: 0,
            explanationAr: "حسب مبرهنة فيتاغورس المباشرة BC² = 3² + 4² = 25 إذن BC = 5، و sin(B̂) = المقابل/الوتر = AC/BC = 4/5.",
            explanationFr: "D'après Pythagore BC = 5 et sin(B̂) = côté opposé / hypoténuse = AC/BC = 4/5.",
          },
          open: {
            questionsAr: [
              `1. نعتبر مثلثاً ABC بحيث AB = 6 و AC = 8 و BC = 10. بين أن المثلث ABC قائم الزاوية في A وأحسب cos(B̂) و tan(B̂). [1.5 ن · N1]`,
              `2. لتكن M نقطة من [AB] حيث AM = 2، والمستقيم المار من M والموازي لـ (BC) يقطع [AC] في N. أحسب AN و MN بتطبيق مبرهنة طاليس. [1.75 ن · N2]`,
            ],
            questionsFr: [
              `1. Soit ABC un triangle tel que AB = 6, AC = 8 et BC = 10. Montrer que ABC est rectangle en A et calculer cos(B̂) et tan(B̂). [1.5 pt · N1]`,
              `2. Soit M ∈ [AB] avec AM = 2. La parallèle à (BC) passant par M coupe [AC] en N. Calculer AN et MN par le théorème de Thalès. [1.75 pt · N2]`,
            ],
            solutionsAr: [
              `1. لدينا AB² + AC² = 36 + 64 = 100 = BC²، فحسب فيتاغورس العكسية المثلث قائم في A، و cos(B̂) = 3/5 و tan(B̂) = 4/3.`,
              `2. حسب طاليس المباشرة AM/AB = AN/AC = MN/BC = 2/6 = 1/3، إذن AN = 8/3 و MN = 10/3.`,
            ],
            solutionsFr: [
              `1. Réciproque de Pythagore : 6² + 8² = 10² = 100. cos(B̂) = 0,6 et tan(B̂) = 4/3.`,
              `2. Par Thalès : AN = 8/3 et MN = 10/3.`,
            ],
            remediationAr: "تذكير بشروط تطبيق مبرهنتي طاليس وفيتاغورس المباشرة والعكسية والنسب المثلثية.",
            remediationFr: "Rappel sur les théorèmes de Thalès et Pythagore (direct et réciproque) et rapports trigonométriques.",
          },
        },
        {
          qcm: {
            statementAr: `في معلم متعامد ممنظم (O,I,J)، إذا كانت A(1, 2) و B(3, ${2 + 2 * k}) فإن إحداثيتي المتجهة AB⃗ ومنتصف القطعة M هما:`,
            statementFr: `Dans un repère orthonormé (O,I,J), pour A(1, 2) et B(3, ${2 + 2 * k}), les coordonnées de AB⃗ et du milieu M sont :`,
            optionsAr: [
              `AB⃗(2, ${2 * k}) و M(2, ${2 + k})`,
              `AB⃗(4, ${4 + 2 * k}) و M(2, ${2 + k})`,
              `AB⃗(2, ${2 * k}) و M(1, ${k})`,
              `AB⃗(-2, -${2 * k}) و M(2, ${k})`,
            ],
            optionsFr: [
              `AB⃗(2, ${2 * k}) et M(2, ${2 + k})`,
              `AB⃗(4, ${4 + 2 * k}) et M(2, ${2 + k})`,
              `AB⃗(2, ${2 * k}) et M(1, ${k})`,
              `AB⃗(-2, -${2 * k}) et M(2, ${k})`,
            ],
            correctIndex: 0,
            explanationAr: `إحداثيتا AB⃗ هما (x_B - x_A, y_B - y_A) = (2, ${2 * k}) ومنتصف القطعة M((1+3)/2, (2+${2 + 2 * k})/2) = (2, ${2 + k}).`,
            explanationFr: `AB⃗(x_B-x_A ; y_B-y_A) = (2 ; ${2 * k}) et M((x_A+x_B)/2 ; (y_A+y_B)/2) = (2 ; ${2 + k}).`,
          },
          open: {
            questionsAr: [
              `1. في معلم متعامد ممنظم (O,I,J)، نعتبر النقط A(1, 2) و B(3, ${2 + 2 * k}) و C(-1, 4). أحسب إحداثيات المتجهة AB⃗ والمسافة AB. [1.5 ن · N1]`,
              `2. حدد المعادلة المختصرة للمستقيم (AB) وتحقق ما إذا كانت النقطة C تنتمي إلى المستقيم (AB). [1.75 ن · N2]`,
            ],
            questionsFr: [
              `1. Dans un repère orthonormé (O,I,J), soient A(1, 2), B(3, ${2 + 2 * k}) et C(-1, 4). Calculer les coordonnées de AB⃗ et la distance AB. [1.5 pt · N1]`,
              `2. Déterminer l'équation réduite de la droite (AB) et vérifier si C appartient à (AB). [1.75 pt · N2]`,
            ],
            solutionsAr: [
              `1. نجد AB⃗(2, ${2 * k}) والمسافة AB = √(2² + (${2 * k})²) = √(${4 + 4 * k * k}).`,
              `2. ميل المستقيم (AB) هو m = ${k}، ومعادلته المختصرة y = ${k}x + ${2 - k}. تعويض x_C = -1 يعطي y = ${2 - 2 * k} ≠ 4 إذن C ∉ (AB).`,
            ],
            solutionsFr: [
              `1. AB⃗(2 ; ${2 * k}) et AB = √(${4 + 4 * k * k}).`,
              `2. Coefficient directeur m = ${k}, équation réduite y = ${k}x + ${2 - k}. C n'appartient pas à (AB).`,
            ],
            remediationAr: "مراجعة إحداثيات متجهة، المسافة بين نقطتين، وميل ومعادلة مستقيم في المستوى.",
            remediationFr: "Réviser les coordonnées d'un vecteur, la distance dans un repère orthonormé et l'équation réduite d'une droite.",
          },
        },
      ];
      const tpl = tcTemplates[idx % tcTemplates.length];
      return {
        index: idx,
        id: `prereq_${track.code}_${idx + 1}`,
        titleAr,
        titleFr,
        domainAr,
        domainFr,
        priorLevelAr: priorGrade.ar,
        priorLevelFr: priorGrade.fr,
        targetPoints: 5,
        qcmItem: {
          ...tpl.qcm,
          points: 1.5,
        },
        openExercise: {
          titleAr: `تشخيص المكتسب القبلي ${idx + 1}: ${titleAr}`,
          titleFr: `Diagnostic Prérequis ${idx + 1} : ${titleFr}`,
          questionsAr: tpl.open.questionsAr,
          questionsFr: tpl.open.questionsFr,
          solutionsAr: tpl.open.solutionsAr,
          solutionsFr: tpl.open.solutionsFr,
          questionPoints: [1.75, 1.75],
          questionLevels: ["N1", "N2"],
          remediationAr: tpl.open.remediationAr,
          remediationFr: tpl.open.remediationFr,
        },
      };
    }

    if (is1Bac) {
      const bac1Templates = [
        {
          qcm: {
            statementAr: `مجموعة حلول المتراجحة |x - ${k}| ≤ 3 في ℝ هي المجال:`,
            statementFr: `L'ensemble des solutions dans ℝ de l'inéquation |x - ${k}| ≤ 3 est l'intervalle :`,
            optionsAr: [
              `[${k - 3}, ${k + 3}]`,
              `]${k - 3}, ${k + 3}[`,
              `]-∞, ${k - 3}] ∪ [${k + 3}, +∞[`,
              `[0, ${k + 3}]`,
            ],
            optionsFr: [
              `[${k - 3}, ${k + 3}]`,
              `]${k - 3}, ${k + 3}[`,
              `]-∞, ${k - 3}] ∪ [${k + 3}, +∞[`,
              `[0, ${k + 3}]`,
            ],
            correctIndex: 0,
            explanationAr: `لدينا |x - ${k}| ≤ 3 تكافئ -3 ≤ x - ${k} ≤ 3 أي ${k - 3} ≤ x ≤ ${k + 3}.`,
            explanationFr: `|x - ${k}| ≤ 3 ⇔ -3 ≤ x - ${k} ≤ 3 ⇔ x ∈ [${k - 3}, ${k + 3}].`,
          },
          open: {
            questionsAr: [
              `1. حل في ℝ المعادلة x² - ${2 * k + 1}x + ${k * (k + 1)} = 0 باستعمال المميز Δ، ثم ضع جدول إشارة ثلاثية الحدود. [1.75 ن · N1]`,
              `2. استنتج في ℝ حلول المتراجحة x² - ${2 * k + 1}x + ${k * (k + 1)} < 0 وحلول المتراجحة |2x - ${k}| ≤ 4. [1.75 ن · N2]`,
            ],
            questionsFr: [
              `1. Résoudre dans ℝ l'équation x² - ${2 * k + 1}x + ${k * (k + 1)} = 0 via Δ et dresser le tableau de signes du trinôme. [1.75 pt · N1]`,
              `2. En déduire les solutions de x² - ${2 * k + 1}x + ${k * (k + 1)} < 0 ainsi que |2x - ${k}| ≤ 4. [1.75 pt · N2]`,
            ],
            solutionsAr: [
              `1. المميز Δ = (${2 * k + 1})² - 4(${k * (k + 1)}) = 1 > 0، والجذران هما x₁ = ${k} و x₂ = ${k + 1}.`,
              `2. إشارة ثلاثية الحدود سالبة قطعا بين الجذرين إذن S₁ = ]${k}, ${k + 1}[، وللمتراجحة الثانية S₂ = [${(k - 4) / 2}, ${(k + 4) / 2}].`,
            ],
            solutionsFr: [
              `1. Δ = 1 > 0, les racines sont x₁ = ${k} et x₂ = ${k + 1}.`,
              `2. S₁ = ]${k}, ${k + 1}[ et S₂ = [${(k - 4) / 2}, ${(k + 4) / 2}].`,
            ],
            remediationAr: "مراجعة مميز ثلاثية الحدود من الدرجة الثانية Δ = b² - 4ac، جدول إشارتها، وخاصيات القيمة المطلقة.",
            remediationFr: "Réviser le discriminant Δ, le signe du trinôme ax²+bx+c et les inéquations avec valeur absolue.",
          },
        },
        {
          qcm: {
            statementAr: `مجموعة تعريف الدالة العددية f(x) = √(x - ${k}) / (x - ${k + 2}) هي:`,
            statementFr: `L'ensemble de définition de la fonction f(x) = √(x - ${k}) / (x - ${k + 2}) est :`,
            optionsAr: [
              `[${k}, ${k + 2}[ ∪ ]${k + 2}, +∞[`,
              `[${k}, +∞[`,
              `]${k}, ${k + 2}[`,
              `ℝ \\ {${k + 2}}`,
            ],
            optionsFr: [
              `[${k}, ${k + 2}[ ∪ ]${k + 2}, +∞[`,
              `[${k}, +∞[`,
              `]${k}, ${k + 2}[`,
              `ℝ \\ {${k + 2}}`,
            ],
            correctIndex: 0,
            explanationAr: `يشترط ما تحت الجذر موجب (x ≥ ${k}) والمقام غير منعدم (x ≠ ${k + 2})، ومنه D_f = [${k}, ${k + 2}[ ∪ ]${k + 2}, +∞[.`,
            explanationFr: `Condition d'existence : x - ${k} ≥ 0 et x ≠ ${k + 2}, soit D_f = [${k}, ${k + 2}[ ∪ ]${k + 2}, +∞[.`,
          },
          open: {
            questionsAr: [
              `1. نعتبر الدالة العددية f(x) = x² - ${2 * k}x + ${k * k - 1}. تحقق أن f(x) = (x - ${k})² - 1 لكل x من ℝ. [1.5 ن · N1]`,
              `2. أدرس رتابة الدالة f على كل من المجالين ]-∞, ${k}] و [${k}, +∞[ وضع جدول تغيراتها محدداً مطرافها. [2.0 ن · N2]`,
            ],
            questionsFr: [
              `1. Soit f(x) = x² - ${2 * k}x + ${k * k - 1}. Vérifier la forme canonique f(x) = (x - ${k})² - 1 sur ℝ. [1.5 pt · N1]`,
              `2. Étudier la monotonie de f sur ]-∞, ${k}] et sur [${k}, +∞[ puis dresser son tableau de variations. [2.0 pts · N2]`,
            ],
            solutionsAr: [
              `1. بالنشر المباشر (x - ${k})² - 1 = x² - ${2 * k}x + ${k * k} - 1 = f(x).`,
              `2. الدالة تناقصية قطعا على ]-∞, ${k}] وتزايدية قطعا على [${k}, +∞[، وتقبل قيمة دنيا تساوي -1 عند x = ${k}.`,
            ],
            solutionsFr: [
              `1. Forme canonique vérifiée par développement direct.`,
              `2. Décroissante sur ]-∞, ${k}], croissante sur [${k}, +∞[, minimum égal à -1 atteint en x = ${k}.`,
            ],
            remediationAr: "تثبيت الشكل القانوني لثلاثية الحدود ومعدل التغير (f(a)-f(b))/(a-b) لدراسة الرتابة.",
            remediationFr: "Consolider la forme canonique, le taux de variation et la lecture graphique d'une parabole.",
          },
        },
        {
          qcm: {
            statementAr: `لكل عدد حقيقي x، التعبير المثلثي cos²(x) + sin²(x) + tan²(x) يساوي على مجال تعريفه:`,
            statementFr: `Pour tout réel x tel que cos(x) ≠ 0, l'expression cos²(x) + sin²(x) + tan²(x) est égale à :`,
            optionsAr: ["1 / cos²(x)", "1", "2", "1 / sin²(x)"],
            optionsFr: ["1 / cos²(x)", "1", "2", "1 / sin²(x)"],
            correctIndex: 0,
            explanationAr: "بما أن cos²(x) + sin²(x) = 1 فإن المقدار يساوي 1 + tan²(x) = 1 / cos²(x).",
            explanationFr: "Puisque cos²(x) + sin²(x) = 1, l'expression vaut 1 + tan²(x) = 1 / cos²(x).",
          },
          open: {
            questionsAr: [
              `1. أحسب القيمة المضبوطة لـ A = cos(π/3) + sin(5π/6) - cos(4π/3) باستعمال الدائرة المثلثية. [1.75 ن · N1]`,
              `2. حل في المجال [-π, π] المعادلة المثلثية 2cos(x) - √${k === 2 ? 2 : 3} = 0 ومثل الحلول على الدائرة المثلثية. [1.75 ن · N2]`,
            ],
            questionsFr: [
              `1. Calculer la valeur exacte de A = cos(π/3) + sin(5π/6) - cos(4π/3) à l'aide du cercle trigonométrique. [1.75 pt · N1]`,
              `2. Résoudre dans [-π, π] l'équation 2cos(x) - √${k === 2 ? 2 : 3} = 0 et placer les solutions sur le cercle. [1.75 pt · N2]`,
            ],
            solutionsAr: [
              `1. لدينا cos(π/3) = 1/2 و sin(5π/6) = 1/2 و cos(4π/3) = -1/2، ومنه A = 1/2 + 1/2 - (-1/2) = 3/2.`,
              `2. المعادلة تكافئ cos(x) = √${k === 2 ? 2 : 3}/2، ومنه الحلول في [-π, π] هي S = {-π/${k === 2 ? 4 : 6}, π/${k === 2 ? 4 : 6}}.`,
            ],
            solutionsFr: [
              `1. A = 1/2 + 1/2 + 1/2 = 3/2.`,
              `2. cos(x) = √${k === 2 ? 2 : 3}/2 donc S = {-π/${k === 2 ? 4 : 6}, π/${k === 2 ? 4 : 6}} dans [-π, π].`,
            ],
            remediationAr: "مراجعة الأفاصيل المنحنية الرئيسية، العلاقات بين الزوايا المرتبطة، والمعادلات cos(x) = cos(α).",
            remediationFr: "Réviser le cercle trigonométrique, les angles associés et les équations fondamentales.",
          },
        },
        {
          qcm: {
            statementAr: `في المستوى المنسوب لمعلم متعامد ممنظم، إذا كان u⃗(2, -1) و v⃗(1, 2) فإن الجداء السلمي u⃗ · v⃗ يساوي:`,
            statementFr: `Dans un repère orthonormé, si u⃗(2, -1) et v⃗(1, 2), alors le produit scalaire u⃗ · v⃗ vaut :`,
            optionsAr: ["0 (المتجهتان متعامدتان)", "4", "-4", "5"],
            optionsFr: ["0 (vecteurs orthogonaux)", "4", "-4", "5"],
            correctIndex: 0,
            explanationAr: "الصيغة التحليلية للجداء السلمي: u⃗ · v⃗ = xx' + yy' = 2(1) + (-1)(2) = 0.",
            explanationFr: "Expression analytique : u⃗ · v⃗ = 2×1 + (-1)×2 = 0, donc u⃗ ⊥ v⃗.",
          },
          open: {
            questionsAr: [
              `1. في معلم متعامد ممنظم، نعتبر النقط A(1, 1) و B(4, 5) و C(-3, 4). أحسب إحداثيات المتجهتين AB⃗ و AC⃗ والجداء السلمي AB⃗ · AC⃗. [1.75 ن · N1]`,
              `2. استنتج طبيعة المثلث ABC وحدد تمثيلاً بارامترياً للمستقيم (AB). [1.75 ن · N2]`,
            ],
            questionsFr: [
              `1. Dans un repère orthonormé, soient A(1, 1), B(4, 5) et C(-3, 4). Calculer les coordonnées de AB⃗, AC⃗ et le produit scalaire AB⃗ · AC⃗. [1.75 pt · N1]`,
              `2. En déduire la nature du triangle ABC et donner une représentation paramétrique de la droite (AB). [1.75 pt · N2]`,
            ],
            solutionsAr: [
              `1. لدينا AB⃗(3, 4) و AC⃗(-4, 3)، ومنه AB⃗ · AC⃗ = 3(-4) + 4(3) = 0، والمسافتان AB = AC = 5.`,
              `2. المثلث ABC قائم الزاوية ومتساوي الساقين في A، والتمثيل البارامتري لـ (AB) هو x = 1 + 3t و y = 1 + 4t (t ∈ ℝ).`,
            ],
            solutionsFr: [
              `1. AB⃗(3, 4), AC⃗(-4, 3), AB⃗ · AC⃗ = 0 et AB = AC = 5.`,
              `2. ABC est rectangle isocèle en A. Représentation paramétrique : x = 1 + 3t, y = 1 + 4t (t ∈ ℝ).`,
            ],
            remediationAr: "تثبيت الحساب المتجهي، الجداء السلمي في المستوى، والتمثيل البارامتري لمستقيم.",
            remediationFr: "Consolider le calcul vectoriel, le produit scalaire analytique et la droite dans le plan.",
          },
        },
      ];
      const tpl = bac1Templates[idx % bac1Templates.length];
      return {
        index: idx,
        id: `prereq_${track.code}_${idx + 1}`,
        titleAr,
        titleFr,
        domainAr,
        domainFr,
        priorLevelAr: priorGrade.ar,
        priorLevelFr: priorGrade.fr,
        targetPoints: 5,
        qcmItem: {
          ...tpl.qcm,
          points: 1.5,
        },
        openExercise: {
          titleAr: `تشخيص المكتسب القبلي ${idx + 1}: ${titleAr}`,
          titleFr: `Diagnostic Prérequis ${idx + 1} : ${titleFr}`,
          questionsAr: tpl.open.questionsAr,
          questionsFr: tpl.open.questionsFr,
          solutionsAr: tpl.open.solutionsAr,
          solutionsFr: tpl.open.solutionsFr,
          questionPoints: [1.75, 1.75],
          questionLevels: ["N1", "N2"],
          remediationAr: tpl.open.remediationAr,
          remediationFr: tpl.open.remediationFr,
        },
      };
    }

    // Default: 2BAC (PC / SVT / SM / ECO / Mission Terminale)
    const bac2Templates = [
      {
        qcm: {
          statementAr: `قيمة النهاية lim_{x → ${k}} (x² - ${k * k}) / (x - ${k}) تساوي:`,
          statementFr: `La valeur de la limite lim_{x → ${k}} (x² - ${k * k}) / (x - ${k}) est égale à :`,
          optionsAr: [`${2 * k}`, "0", "+∞", `${k * k}`],
          optionsFr: [`${2 * k}`, "0", "+∞", `${k * k}`],
          correctIndex: 0,
          explanationAr: `بالتعميل والاختزال بـ (x - ${k}) نجد lim_{x → ${k}} (x + ${k}) = ${2 * k}.`,
          explanationFr: `Après factorisation par (x - ${k}), la limite vaut ${k} + ${k} = ${2 * k}.`,
        },
        open: {
          questionsAr: [
            `1. أحسب النهايات التالية مع التعليل: lim_{x → +∞} (${k}x³ - 4x + 1)/(x³ + x²) و lim_{x → 1} (√(x + 3) - 2)/(x - 1). [1.75 ن · N1]`,
            `2. نعتبر الدالة f(x) = x³ - 3x + ${k}. أحسب المشتقة f'(x) على ℝ، وأدرس إشارتها ثم ضع جدول تغيرات الدالة f وحدد معادلة المماس عند x₀ = 0. [1.75 ن · N2]`,
          ],
          questionsFr: [
            `1. Calculer en justifiant : lim_{x → +∞} (${k}x³ - 4x + 1)/(x³ + x²) et lim_{x → 1} (√(x + 3) - 2)/(x - 1). [1.75 pt · N1]`,
            `2. Soit f(x) = x³ - 3x + ${k}. Calculer f'(x) sur ℝ, étudier son signe, dresser le tableau de variations de f et donner la tangente en x₀ = 0. [1.75 pt · N2]`,
          ],
          solutionsAr: [
            `1. النهاية الأولى عند +∞ تساوي خارج الحدين الأعلى درجة أي ${k}. والنهاية الثانية بالضرب في المرافق تساوي 1/(2×2) = 1/4.`,
            `2. المشتقة f'(x) = 3(x² - 1) = 3(x - 1)(x + 1)، تنعدم في -1 و 1، ومعادلة المماس عند 0 هي y = -3x + ${k}.`,
          ],
          solutionsFr: [
            `1. La première limite vaut ${k} (termes de plus haut degré) et la seconde vaut 1/4 par expression conjuguée.`,
            `2. f'(x) = 3(x - 1)(x + 1) et la tangente en 0 a pour équation y = -3x + ${k}.`,
          ],
          remediationAr: "مراجعة إزالة الأشكال غير المحددة (0/0 و ∞/∞) بالتعميل والمرافق، وقواعد الاشتقاق ومعادلة المماس.",
          remediationFr: "Réviser la levée des formes indéterminées, les formules de dérivation et l'équation de la tangente.",
        },
      },
      {
        qcm: {
          statementAr: `إذا كانت (u_n) متتالية هندسية أساسها q = 2 وحدها الأول u_0 = ${k}، فإن حدها العام u_n يساوي:`,
          statementFr: `Si (u_n) est une suite géométrique de raison q = 2 et de premier terme u_0 = ${k}, son terme général u_n est :`,
          optionsAr: [`u_n = ${k} × 2^n`, `u_n = ${k} + 2n`, `u_n = 2 × ${k}^n`, `u_n = ${k} × n²`],
          optionsFr: [`u_n = ${k} × 2^n`, `u_n = ${k} + 2n`, `u_n = 2 × ${k}^n`, `u_n = ${k} × n²`],
          correctIndex: 0,
          explanationAr: `الحد العام لمتتالية هندسية حدها الأول u_0 وأساسها q هو u_n = u_0 × q^n = ${k} × 2^n.`,
          explanationFr: `Terme général d'une suite géométrique : u_n = u_0 × q^n = ${k} × 2^n.`,
        },
        open: {
          questionsAr: [
            `1. نعتبر المتتالية (u_n) المعرفة بـ u_0 = ${k + 1} و u_{n+1} = (1/2)u_n + ${k} لكل n من ℕ. أحسب u_1 و u_2 وبين بالترجع أن u_n < ${2 * k} لكل n ∈ ℕ. [1.75 ن · N2]`,
            `2. نضع v_n = u_n - ${2 * k}. بين أن (v_n) متتالية هندسية أساسها q = 1/2 ثم اكتب v_n و u_n بدلالة n. [1.75 ن · N2]`,
          ],
          questionsFr: [
            `1. Soit (u_n) définie par u_0 = ${k + 1} et u_{n+1} = (1/2)u_n + ${k}. Calculer u_1 et u_2 puis montrer par récurrence que u_n < ${2 * k}. [1.75 pt · N2]`,
            `2. On pose v_n = u_n - ${2 * k}. Montrer que (v_n) est géométrique de raison q = 1/2 puis exprimer v_n et u_n en fonction de n. [1.75 pt · N2]`,
          ],
          solutionsAr: [
            `1. بالترجع: من أجل n=0 لدينا u_0 = ${k + 1} < ${2 * k}، وإذا كان u_n < ${2 * k} فإن (1/2)u_n + ${k} < ${2 * k}.`,
            `2. لدينا v_{n+1} = u_{n+1} - ${2 * k} = (1/2)(u_n - ${2 * k}) = (1/2)v_n، ومنه u_n = ${2 * k} + (${1 - k})×(1/2)^n.`,
          ],
          solutionsFr: [
            `1. Récurrence immédiate : initialisation u_0 = ${k + 1} < ${2 * k} et hérédité par combinaison linéaire.`,
            `2. v_{n+1} = (1/2)v_n, donc v_n = (${1 - k})(1/2)^n et u_n = ${2 * k} + (${1 - k})(1/2)^n.`,
          ],
          remediationAr: "تثبيت مبدأ البرهان بالترجع، المتتاليات الحسابية والهندسية، والمتتالية المساعدة v_n = u_n - α.",
          remediationFr: "Consolider le raisonnement par récurrence et les suites arithmético-géométriques.",
        },
      },
      {
        qcm: {
          statementAr: `في المستوى المنسوب لمعلم متعامد ممنظم، معادلة الدائرة (C) التي مركزها Ω(1, -2) وشعاعها R = ${k} هي:`,
          statementFr: `Dans un repère orthonormé, l'équation cartésienne du cercle (C) de centre Ω(1, -2) et de rayon R = ${k} est :`,
          optionsAr: [
            `(x - 1)² + (y + 2)² = ${k * k}`,
            `(x + 1)² + (y - 2)² = ${k * k}`,
            `(x - 1)² + (y + 2)² = ${k}`,
            `x² + y² - 2x + 4y = ${k * k}`,
          ],
          optionsFr: [
            `(x - 1)² + (y + 2)² = ${k * k}`,
            `(x + 1)² + (y - 2)² = ${k * k}`,
            `(x - 1)² + (y + 2)² = ${k}`,
            `x² + y² - 2x + 4y = ${k * k}`,
          ],
          correctIndex: 0,
          explanationAr: `المعادلة الديكارتية للدائرة التي مركزها Ω(a,b) وشعاعها R هي (x - a)² + (y - b)² = R² = ${k * k}.`,
          explanationFr: `Équation du cercle de centre Ω(a,b) et rayon R : (x - a)² + (y - b)² = R² = ${k * k}.`,
        },
        open: {
          questionsAr: [
            `1. في المستوى المنسوب لمعلم متعامد ممنظم، نعتبر النقط A(1, 2) و B(3, 0) والمستقيم (Δ): x + y - ${k + 3} = 0. أحسب المسافة d(A, (Δ)) والجداء السلمي OA⃗ · OB⃗. [1.75 ن · N1]`,
            `2. حدد معادلة ديكارتية للدائرة (C) التي أحد أقطارها القطعة [AB] مع تحديد مركزها Ω وشعاعها R. [1.75 ن · N2]`,
          ],
          questionsFr: [
            `1. Dans le plan muni d'un repère orthonormé, soient A(1, 2), B(3, 0) et la droite (Δ) : x + y - ${k + 3} = 0. Calculer d(A, (Δ)) et OA⃗ · OB⃗. [1.75 pt · N1]`,
            `2. Déterminer une équation cartésienne du cercle (C) de diamètre [AB], son centre Ω et son rayon R. [1.75 pt · N2]`,
          ],
          solutionsAr: [
            `1. المسافة d(A, (Δ)) = |1 + 2 - ${k + 3}| / √(1² + 1²) = ${k}/√2، والجداء السلمي OA⃗ · OB⃗ = 1(3) + 2(0) = 3.`,
            `2. المركز هو منتصف [AB] أي Ω(2, 1) والشعاع R = AB/2 = √2، والمعادلة هي (x - 2)² + (y - 1)² = 2.`,
          ],
          solutionsFr: [
            `1. d(A, (Δ)) = ${k}/√2 et OA⃗ · OB⃗ = 3.`,
            `2. Centre Ω(2, 1) (milieu de [AB]), rayon R = √2, équation (x - 2)² + (y - 1)² = 2.`,
          ],
          remediationAr: "مراجعة الصيغة التحليلية للجداء السلمي، مسافة نقطة عن مستقيم، ومعادلة الدائرة في المستوى والفضاء.",
          remediationFr: "Réviser le produit scalaire analytique, la distance point-droite et l'équation d'un cercle.",
        },
      },
      {
        qcm: {
          statementAr: `لكل عدد حقيقي x، الصيغة المثلثية sin(2x) وصيغة cos(2x) بدلالة cos(x) هما:`,
          statementFr: `Pour tout réel x, les formules de duplication sin(2x) et cos(2x) en fonction de cos(x) sont :`,
          optionsAr: [
            "sin(2x) = 2sin(x)cos(x) و cos(2x) = 2cos²(x) - 1",
            "sin(2x) = sin(x)cos(x) و cos(2x) = cos²(x) - 1",
            "sin(2x) = 2sin(x)cos(x) و cos(2x) = 1 - 2cos²(x)",
            "sin(2x) = 2sin²(x) و cos(2x) = 2cos²(x) + 1",
          ],
          optionsFr: [
            "sin(2x) = 2sin(x)cos(x) et cos(2x) = 2cos²(x) - 1",
            "sin(2x) = sin(x)cos(x) et cos(2x) = cos²(x) - 1",
            "sin(2x) = 2sin(x)cos(x) et cos(2x) = 1 - 2cos²(x)",
            "sin(2x) = 2sin²(x) et cos(2x) = 2cos²(x) + 1",
          ],
          correctIndex: 0,
          explanationAr: "حسب صيغ التحويل ومضاعف الزاوية: sin(2x) = 2sin(x)cos(x) و cos(2x) = cos²(x) - sin²(x) = 2cos²(x) - 1.",
          explanationFr: "Formules de duplication : sin(2x) = 2sin(x)cos(x) et cos(2x) = 2cos²(x) - 1.",
        },
        open: {
          questionsAr: [
            `1. بين لكل x من ℝ أن: cos(2x) + 2sin²(x) = 1 وأن sin(x) + cos(x) = √2 cos(x - π/4). [1.75 ن · N2]`,
            `2. استنتج في المجال [0, 2π[ حلول المعادلة المثلثية sin(x) + cos(x) = 1. [1.75 ن · N2]`,
          ],
          questionsFr: [
            `1. Montrer que pour tout x ∈ ℝ : cos(2x) + 2sin²(x) = 1 et sin(x) + cos(x) = √2 cos(x - π/4). [1.75 pt · N2]`,
            `2. En déduire dans [0, 2π[ les solutions de l'équation sin(x) + cos(x) = 1. [1.75 pt · N2]`,
          ],
          solutionsAr: [
            `1. لدينا cos(2x) = 1 - 2sin²(x) ومنه المجموع يساوي 1. وبالتحويل a cos x + b sin x نجد √2 cos(x - π/4).`,
            `2. المعادلة تكافئ cos(x - π/4) = √2/2 = cos(π/4)، ومنه x = π/2 أو x = 0 في المجال [0, 2π[.`,
          ],
          solutionsFr: [
            `1. cos(2x) = 1 - 2sin²(x) d'où l'égalité. Transformation de a·cos(x) + b·sin(x) en √2 cos(x - π/4).`,
            `2. cos(x - π/4) = cos(π/4) donne S = {0, π/2} dans [0, 2π[.`,
          ],
          remediationAr: "تثبيت صيغ التحويل المثلثي (cos(a±b), sin(a±b), cos(2x), sin(2x)) الضرورية للأعداد العقدية والتكامل.",
          remediationFr: "Consolider les formules d'addition et de duplication indispensables pour les nombres complexes et l'intégration.",
        },
      },
    ];

    const tpl = bac2Templates[idx % bac2Templates.length];
    return {
      index: idx,
      id: `prereq_${track.code}_${idx + 1}`,
      titleAr,
      titleFr,
      domainAr,
      domainFr,
      priorLevelAr: priorGrade.ar,
      priorLevelFr: priorGrade.fr,
      targetPoints: 5,
      qcmItem: {
        ...tpl.qcm,
        points: 1.5,
      },
      openExercise: {
        titleAr: `تشخيص المكتسب القبلي ${idx + 1}: ${titleAr}`,
        titleFr: `Diagnostic Prérequis ${idx + 1} : ${titleFr}`,
        questionsAr: tpl.open.questionsAr,
        questionsFr: tpl.open.questionsFr,
        solutionsAr: tpl.open.solutionsAr,
        solutionsFr: tpl.open.solutionsFr,
        questionPoints: [1.75, 1.75],
        questionLevels: ["N1", "N2"],
        remediationAr: tpl.open.remediationAr,
        remediationFr: tpl.open.remediationFr,
      },
    };
  });
}

export function buildDiagnosticInteractiveQrUrl(params: {
  origin?: string;
  trackCode: string;
  examModel: "A" | "B";
  selectedPrereqIndices?: number[];
}): string {
  const baseOrigin =
    params.origin ||
    (typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://profmath.ma");
  const url = new URL(baseOrigin);
  url.searchParams.set("quiz", "1");
  url.searchParams.set("type", "DIAGNOSTIC");
  url.searchParams.set("track", params.trackCode || "2BAC_PC");
  url.searchParams.set("model", params.examModel || "A");
  if (params.selectedPrereqIndices && params.selectedPrereqIndices.length > 0) {
    url.searchParams.set("prereqs", params.selectedPrereqIndices.join(","));
  }
  return url.toString();
}

export function buildPrerequisiteDiagnosticBlueprint(params: {
  trackCode: string;
  duration?: string;
  examModel?: "A" | "B";
  selectedPrereqIndices?: number[];
  includeQcm?: boolean;
  includeOpenExercises?: boolean;
  includeSynthesisProblem?: boolean;
  customTitleAr?: string;
  origin?: string;
}): PrerequisiteDiagnosticBlueprint {
  const track = CURRICULUM_DB[params.trackCode] || CURRICULUM_DB["2BAC_PC"];
  const examModel: "A" | "B" = params.examModel === "B" ? "B" : "A";
  const priorGrade = resolvePriorGradeLabels(track);
  const fullCatalog = getTrackPrerequisitesCatalog(track.code, examModel);

  const validIndices =
    params.selectedPrereqIndices && params.selectedPrereqIndices.length > 0
      ? params.selectedPrereqIndices.filter((i) => i >= 0 && i < fullCatalog.length)
      : fullCatalog.map((item) => item.index);

  const selectedRaw =
    validIndices.length > 0
      ? validIndices.map((idx) => fullCatalog[idx])
      : fullCatalog;

  const includeQcm = params.includeQcm !== false;
  const includeOpenExercises = params.includeOpenExercises !== false;
  const includeSynthesisProblem = params.includeSynthesisProblem !== false;

  // Allocate exact 20.00/20 points across selected prerequisites
  const count = selectedRaw.length;
  const equalWeights = selectedRaw.map(() => Math.round(100 / count));
  const pointsPerPrereq = computeExactExercisePointsOut20(
    equalWeights.map((w) => ({ weight: w })),
    20
  );

  const selectedPrerequisites: PrerequisiteCatalogItem[] = selectedRaw.map((item, idx) => {
    const totalPts = pointsPerPrereq[idx] || 5;
    const qcmPts = includeQcm
      ? Math.max(0.5, Math.round(totalPts * 0.3 * 4) / 4)
      : 0;
    const openBudget = Math.max(0.5, Number((totalPts - qcmPts).toFixed(2)));
    const q1Pts = Math.round((openBudget / 2) * 4) / 4;
    const q2Pts = Number((openBudget - q1Pts).toFixed(2));

    return {
      ...item,
      targetPoints: totalPts,
      qcmItem: {
        ...item.qcmItem,
        points: qcmPts,
      },
      openExercise: {
        ...item.openExercise,
        questionPoints: [q1Pts, q2Pts],
      },
    };
  });

  const interactiveQrUrl = buildDiagnosticInteractiveQrUrl({
    origin: params.origin,
    trackCode: track.code,
    examModel,
    selectedPrereqIndices: selectedPrerequisites.map((p) => p.index),
  });

  const interactiveQrSvg = renderQrSvgString(
    interactiveQrUrl,
    136,
    "#0f172a",
    "#ffffff"
  );

  const verificationCode = `DIAG-${track.code}-${examModel}-${selectedPrerequisites.length}P`;
  const durationAr = params.duration || "ساعة واحدة (1h00)";
  const durationFr = "1 heure (60 min)";

  const customTitleAr =
    params.customTitleAr?.trim() ||
    `رائز التقويم التشخيصي للمكتسبات القبلية — ${track.labelAr}`;
  const customTitleFr = `Test d'Évaluation Diagnostique des Prérequis — ${track.labelFr}`;

  // Build MoroccanDiagnosticPaper compatible with PrintablePreview & diagnosticGenerator.ts
  const codes: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
  const diagnosticPaper: MoroccanDiagnosticPaper = {
    titleAr: customTitleAr,
    titleFr: customTitleFr,
    subtitleAr: `تشخيص المكتسبات القبلية الضرورية (${priorGrade.ar}) · النموذج (${examModel}) · مرفق بـ QR التفاعلي (${verificationCode})`,
    subtitleFr: `Évaluation diagnostique des acquis antérieurs (${priorGrade.fr}) · Sujet (${examModel}) · QR Interactif (${verificationCode})`,
    duration: durationAr,
    masteryThresholdPercent: 75,
    instructionsAr: [
      `يرتكز هذا الرائز التشخيصي على المكتسبات القبلية الرسمية لمسلك «${track.labelAr}» (${priorGrade.ar}).`,
      "أجب عن أسئلة الاختيار من متعدد (QCM) بوضع علامة (×) أمام الجواب الصحيح ثم أنجز التمارين التطبيقية بدقة.",
      `يمكن مسح رمز الاستجابة السريعة (QR Code: ${verificationCode}) لإنجاز الرائز تفاعلياً والحصول على تقرير التحكم الفردي وخطة الدعم.`,
    ],
    instructionsFr: [
      `Ce test diagnostique porte sur les prérequis officiels de la filière « ${track.labelFr} » (${priorGrade.fr}).`,
      "Cochez la bonne réponse pour chaque QCM puis rédigez les exercices d'application avec soin.",
      `Scannez le QR Code (${verificationCode}) pour passer le test interactif et obtenir votre bilan de remédiation.`,
    ],
    domains: selectedPrerequisites.map((p, idx) => ({
      code: `D${idx + 1}`,
      labelAr: `${p.domainAr} (${p.titleAr})`,
      labelFr: `${p.domainFr} (${p.titleFr})`,
      weightPercent: Math.round((p.targetPoints / 20) * 100),
    })),
    qcmItems: includeQcm
      ? selectedPrerequisites.map((p, idx) => ({
          id: `qcm_${idx + 1}`,
          questionAr: p.qcmItem.statementAr,
          questionFr: p.qcmItem.statementFr,
          domainAr: p.domainAr,
          domainFr: p.domainFr,
          points: p.qcmItem.points.toFixed(2).replace(/\.00$/, ""),
          optionsAr: p.qcmItem.optionsAr.map((opt, oIdx) => ({
            code: codes[oIdx] || "A",
            text: opt,
            isCorrect: oIdx === p.qcmItem.correctIndex,
          })),
          optionsFr: p.qcmItem.optionsFr.map((opt, oIdx) => ({
            code: codes[oIdx] || "A",
            text: opt,
            isCorrect: oIdx === p.qcmItem.correctIndex,
          })),
          correctCode: codes[p.qcmItem.correctIndex] || "A",
          justificationAr: p.qcmItem.explanationAr,
          justificationFr: p.qcmItem.explanationFr,
          commonErrorAr: "عدم استحضار الشرط القبلي أو الخطأ في التبسيط الجبري المباشر.",
          commonErrorFr: "Oubli de la condition préalable ou erreur de simplification algébrique.",
          didacticalOriginAr: p.priorLevelAr,
          didacticalOriginFr: p.priorLevelFr,
          remediationPlanAr: p.openExercise.remediationAr,
          remediationPlanFr: p.openExercise.remediationFr,
        }))
      : [],
    directExercises: includeOpenExercises
      ? selectedPrerequisites.map((p, idx) => {
          const openPts = includeQcm
            ? p.openExercise.questionPoints.reduce((a, b) => a + b, 0)
            : p.targetPoints;
          return {
            id: `diag_ex_${idx + 1}`,
            number: idx + 1,
            titleAr: `التمرين التشخيصي ${idx + 1}: ${p.titleAr}`,
            titleFr: `Exercice Diagnostique ${idx + 1} : ${p.titleFr}`,
            domainAr: p.domainAr,
            domainFr: p.domainFr,
            totalPoints: openPts.toFixed(2).replace(/\.00$/, ""),
            prerequisiteAr: `${p.priorLevelAr} — ${p.titleAr}`,
            prerequisiteFr: `${p.priorLevelFr} — ${p.titleFr}`,
            questionsAr: p.openExercise.questionsAr.map((qText, qIdx) => ({
              label: `${qIdx + 1}`,
              text: qText,
              points: (p.openExercise.questionPoints[qIdx] || 1.5)
                .toFixed(2)
                .replace(/\.00$/, ""),
            })),
            questionsFr: p.openExercise.questionsFr.map((qText, qIdx) => ({
              label: `${qIdx + 1}`,
              text: qText,
              points: (p.openExercise.questionPoints[qIdx] || 1.5)
                .toFixed(2)
                .replace(/\.00$/, ""),
            })),
            solutionsAr: p.openExercise.solutionsAr,
            solutionsFr: p.openExercise.solutionsFr,
            errorAnalysisAr: `تعثر محتمل في ${p.titleAr}`,
            errorAnalysisFr: `Difficulté potentielle sur ${p.titleFr}`,
            remediationAr: p.openExercise.remediationAr,
            remediationFr: p.openExercise.remediationFr,
          };
        })
      : [],
    synthesisProblem: {
      titleAr: `المسألة التشخيصية وخطة الدعم الوقائي المندمج (${track.labelAr})`,
      titleFr: `Synthèse Diagnostique & Plan de Remédiation Ciblée (${track.labelFr})`,
      contextAr: `يرتبط هذا الرائز التشخيصي بالمكتسبات القبلية الرسمية لمسلك «${track.labelAr}» (${priorGrade.ar}). يمكن للتلميذ مسح رمز QR المرفق (${verificationCode}) لإجراء الرائز تفاعلياً والحصول على بطاقة التشخيص الفردية وخطة الدعم الخاصة به.`,
      contextFr: `Ce test diagnostique évalue les prérequis officiels de la filière « ${track.labelFr} » (${priorGrade.fr}). L'élève peut scanner le QR Code (${verificationCode}) pour passer le test interactif et obtenir son bilan de maîtrise.`,
      totalPoints: "4",
      partsAr: [
        {
          partTitle: "توليف المكتسبات القبلية وخطة الدعم الاستدراكي",
          points: "4",
          questions: selectedPrerequisites.map(
            (p, idx) =>
              `${idx + 1}. نشاط توليفي لدعم المكتسب (${p.titleAr}): ${p.openExercise.questionsAr[0]}`
          ),
          solutions: selectedPrerequisites.map(
            (p, idx) =>
              `${idx + 1}. عناصر التصحيح والدعم: ${p.openExercise.solutionsAr[0]} — (${p.openExercise.remediationAr})`
          ),
        },
      ],
      partsFr: [
        {
          partTitle: "Synthèse des acquis antérieurs & Plan de soutien",
          points: "4",
          questions: selectedPrerequisites.map(
            (p, idx) =>
              `${idx + 1}. Activité de synthèse (${p.titleFr}) : ${p.openExercise.questionsFr[0]}`
          ),
          solutions: selectedPrerequisites.map(
            (p, idx) =>
              `${idx + 1}. Correction & Remédiation : ${p.openExercise.solutionsFr[0]} — (${p.openExercise.remediationFr})`
          ),
        },
      ],
      remediationAr: selectedPrerequisites
        .map((p) => p.openExercise.remediationAr)
        .join(" · "),
      remediationFr: selectedPrerequisites
        .map((p) => p.openExercise.remediationFr)
        .join(" · "),
    },
  };

  // Convert to LessonItem[] so it can also be rendered/edited in DS/Exam A4 & Spec Matrix
  const asLessonItems: LessonItem[] = selectedPrerequisites.map((p, idx) => {
    const weight = Math.round((p.targetPoints / 20) * 100);
    const qAr = includeQcm
      ? [
          `1. (سؤال QCM تشخيصي) ${p.qcmItem.statementAr} — الاختيارات: (${p.qcmItem.optionsAr.join(" | ")})`,
          ...p.openExercise.questionsAr.map((q, qIdx) =>
            q.replace(/^\d+\./, `${qIdx + 2}.`)
          ),
        ]
      : [...p.openExercise.questionsAr];
    const qFr = includeQcm
      ? [
          `1. (QCM Diagnostique) ${p.qcmItem.statementFr} — Choix : (${p.qcmItem.optionsFr.join(" | ")})`,
          ...p.openExercise.questionsFr.map((q, qIdx) =>
            q.replace(/^\d+\./, `${qIdx + 2}.`)
          ),
        ]
      : [...p.openExercise.questionsFr];
    const solAr = includeQcm
      ? [
          `1. الجواب الصحيح: ${p.qcmItem.optionsAr[p.qcmItem.correctIndex]} — ${p.qcmItem.explanationAr}`,
          ...p.openExercise.solutionsAr.map((s, sIdx) =>
            s.replace(/^\d+\./, `${sIdx + 2}.`)
          ),
        ]
      : [...p.openExercise.solutionsAr];
    const solFr = includeQcm
      ? [
          `1. Réponse exacte : ${p.qcmItem.optionsFr[p.qcmItem.correctIndex]} — ${p.qcmItem.explanationFr}`,
          ...p.openExercise.solutionsFr.map((s, sIdx) =>
            s.replace(/^\d+\./, `${sIdx + 2}.`)
          ),
        ]
      : [...p.openExercise.solutionsFr];

    const baremes = includeQcm
      ? [p.qcmItem.points, ...p.openExercise.questionPoints]
      : [
          Math.round((p.targetPoints / 2) * 4) / 4,
          Number((p.targetPoints - Math.round((p.targetPoints / 2) * 4) / 4).toFixed(2)),
        ];
    const levels: Array<"N1" | "N2" | "N3"> = includeQcm
      ? ["N1", "N1", "N2"]
      : ["N1", "N2"];

    return {
      lessonAr: `مكتسب قبلي ${idx + 1}: ${p.titleAr}`,
      lessonFr: `Prérequis ${idx + 1} : ${p.titleFr}`,
      weight,
      hours: "2h",
      category:
        p.domainAr.includes("هندسة")
          ? "Geometry"
          : p.domainAr.includes("جبر")
          ? "Algebra"
          : p.domainAr.includes("احتمال")
          ? "Probabilities"
          : "Calculus",
      subCategory: p.domainAr.includes("هندسة")
        ? "هندسة مستوية"
        : p.domainAr.includes("جبر")
        ? "جبر"
        : "تحليل",
      subCategoryFr: p.domainFr,
      capacitiesAr: [p.titleAr, p.openExercise.remediationAr],
      capacitiesFr: [p.titleFr, p.openExercise.remediationFr],
      sampleExerciseAr: qAr,
      sampleExerciseFr: qFr,
      sampleSolutionAr: solAr,
      sampleSolutionFr: solFr,
      customQuestionBaremes: baremes,
      customQuestionLevels: levels,
      hasCustomQuestions: true,
      isImportedSimulation: true,
      importedOriginLabel: `رائز تشخيصي (${track.code})`,
      ficheDidactique: {
        prerequisAr: [p.titleAr],
        prerequisFr: [p.titleFr],
        erreursFrequentesAr: [p.openExercise.remediationAr],
        erreursFrequentesFr: [p.openExercise.remediationFr],
      },
    };
  });

  // Build InteractiveQuizData for QR code & interactive student mode
  const choiceCodes: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
  const quizQuestions: QuizQuestionItem[] = [];
  selectedPrerequisites.forEach((p, idx) => {
    const qcmPts = includeOpenExercises ? p.qcmItem.points || 1.5 : p.targetPoints;
    // 1. QCM question per prerequisite
    quizQuestions.push({
      id: `${p.id}_qcm`,
      exerciseId: `ex_diag_${idx + 1}`,
      exerciseTitleAr: `المكتسب القبلي ${idx + 1}: ${p.titleAr}`,
      exerciseTitleFr: `Prérequis ${idx + 1} : ${p.titleFr}`,
      questionIndex: quizQuestions.length + 1,
      questionPromptAr: `[تشخيص ${p.domainAr}] ${p.qcmItem.statementAr}`,
      questionPromptFr: `[Diagnostic ${p.domainFr}] ${p.qcmItem.statementFr}`,
      choices: p.qcmItem.optionsAr.map((optAr, cIdx) => ({
        id: `${p.id}_qcm_opt_${choiceCodes[cIdx] || "A"}`,
        code: choiceCodes[cIdx] || "A",
        labelAr: optAr,
        labelFr: p.qcmItem.optionsFr[cIdx] || optAr,
        isCorrect: cIdx === p.qcmItem.correctIndex,
        explanationAr:
          cIdx === p.qcmItem.correctIndex
            ? p.qcmItem.explanationAr
            : `اختيار غير دقيق — التذكير: ${p.openExercise.remediationAr}`,
        explanationFr:
          cIdx === p.qcmItem.correctIndex
            ? p.qcmItem.explanationFr
            : `Réponse inexacte — Rappel : ${p.openExercise.remediationFr}`,
      })),
      points: qcmPts,
      level: "N1",
      category: p.domainAr,
      categoryFr: p.domainFr,
      hintAr: p.openExercise.remediationAr,
      hintFr: p.openExercise.remediationFr,
      fullSolutionAr: `${p.qcmItem.explanationAr} — خطة الدعم: ${p.openExercise.remediationAr}`,
      fullSolutionFr: `${p.qcmItem.explanationFr} — Remédiation : ${p.openExercise.remediationFr}`,
    });

    // 2. Application diagnostic question per prerequisite
    if (includeOpenExercises) {
      const appPts = p.openExercise.questionPoints.reduce((a, b) => a + b, 0);
      const correctSolAr = p.openExercise.solutionsAr[0] || "";
      const correctSolFr = p.openExercise.solutionsFr[0] || correctSolAr;
      const appOptionsAr = [
        correctSolAr,
        "النتيجة منعدمة (0) بسبب عدم تحقق شرط التعريف",
        "تتغير الإشارة عند قلب المتراجحة دون الضرب في عدد سالب",
        "لا يمكن الحسم دون معطيات إضافية حول الوسيط",
      ];
      const appOptionsFr = [
        correctSolFr,
        "Résultat nul (0) faute de condition d'existence",
        "Inversion du sens de l'inégalité sans facteur négatif",
        "Indéterminé sans hypothèse supplémentaire",
      ];

      quizQuestions.push({
        id: `${p.id}_app`,
        exerciseId: `ex_diag_${idx + 1}`,
        exerciseTitleAr: `تطبيق المكتسب ${idx + 1}: ${p.titleAr}`,
        exerciseTitleFr: `Application Prérequis ${idx + 1} : ${p.titleFr}`,
        questionIndex: quizQuestions.length + 1,
        questionPromptAr: `${p.openExercise.questionsAr[0]} — اختر الخلاصة الرياضية الصحيحة:`,
        questionPromptFr: `${p.openExercise.questionsFr[0]} — Choisir la conclusion mathématique exacte :`,
        choices: appOptionsAr.map((optAr, cIdx) => ({
          id: `${p.id}_app_opt_${choiceCodes[cIdx] || "A"}`,
          code: choiceCodes[cIdx] || "A",
          labelAr: optAr,
          labelFr: appOptionsFr[cIdx] || optAr,
          isCorrect: cIdx === 0,
          explanationAr:
            cIdx === 0
              ? `صحيح: ${p.openExercise.solutionsAr.join(" | ")}`
              : `خطأ شائع — خطة الدعم: ${p.openExercise.remediationAr}`,
          explanationFr:
            cIdx === 0
              ? `Exact : ${p.openExercise.solutionsFr.join(" | ")}`
              : `Erreur fréquente — Soutien : ${p.openExercise.remediationFr}`,
        })),
        points: appPts,
        level: "N2",
        category: p.domainAr,
        categoryFr: p.domainFr,
        hintAr: p.openExercise.remediationAr,
        hintFr: p.openExercise.remediationFr,
        fullSolutionAr: `التصحيح المفصل: ${p.openExercise.solutionsAr.join(" | ")} — خطة الدعم الموصى بها: ${p.openExercise.remediationAr}`,
        fullSolutionFr: `Correction détaillée : ${p.openExercise.solutionsFr.join(" | ")} — Plan de soutien : ${p.openExercise.remediationFr}`,
      });
    }
  });

  const interactiveQuizData: InteractiveQuizData = {
    id: `diag_quiz_${track.code}_${examModel}`,
    titleAr: customTitleAr,
    titleFr: customTitleFr,
    schoolAr: "ثانوية تأهيلية — التقويم التشخيصي للمكتسبات القبلية",
    schoolFr: "Lycée Qualifiant — Diagnostic des Prérequis",
    prof: "أستاذ(ة) مادة الرياضيات",
    trackCode: track.code,
    system: track.system || "MAROC_NATIONAL",
    totalQuestions: quizQuestions.length,
    totalPoints: Number(
      quizQuestions.reduce((acc, q) => acc + q.points, 0).toFixed(2)
    ),
    durationMinutes: 60,
    calculatorAllowed: true,
    questions: quizQuestions,
  };

  return {
    blueprintId: `diag_bp_${track.code}_${examModel}_${selectedPrerequisites.length}`,
    trackCode: track.code,
    trackLabelAr: track.labelAr,
    trackLabelFr: track.labelFr,
    cycle: track.cycle,
    priorGradeLabelAr: priorGrade.ar,
    priorGradeLabelFr: priorGrade.fr,
    examModel,
    durationAr,
    durationFr,
    customTitleAr,
    customTitleFr,
    verificationCode,
    interactiveQrUrl,
    interactiveQrSvg,
    totalPoints: 20,
    includeQcm,
    includeOpenExercises,
    includeSynthesisProblem,
    selectedPrerequisites,
    diagnosticPaper,
    asLessonItems,
    interactiveQuizData,
  };
}

/**
 * تقييم إجابات التلميذ في الرائز التشخيصي وتوليد تقرير التحكم الفردي وخطة الدعم لكل مكتسب قبلي
 */
export function evaluateDiagnosticMasteryReport(
  blueprint: PrerequisiteDiagnosticBlueprint,
  selectedOptionByQuestionId: Record<string, number>
): DiagnosticMasteryEvaluationReport {
  const rows: DiagnosticPrerequisiteMasteryRow[] = blueprint.selectedPrerequisites.map(
    (prereq) => {
      const relatedQuestions = blueprint.interactiveQuizData.questions.filter((q) =>
        q.id.startsWith(prereq.id)
      );
      let earned = 0;
      let max = 0;
      relatedQuestions.forEach((q) => {
        max += q.points;
        const chosenIdx = selectedOptionByQuestionId[q.id];
        const correctIdx = q.choices.findIndex((c) => c.isCorrect);
        if (typeof chosenIdx === "number" && chosenIdx === correctIdx) {
          earned += q.points;
        }
      });

      const masteryPercent = max > 0 ? Math.round((earned / max) * 100) : 0;
      const status: "MASTERED" | "PARTIAL" | "CRITICAL_REMEDIATION" =
        masteryPercent >= 75
          ? "MASTERED"
          : masteryPercent >= 45
          ? "PARTIAL"
          : "CRITICAL_REMEDIATION";

      const statusLabelAr =
        status === "MASTERED"
          ? "متحكم في المكتسب القبلي (≥ 75%)"
          : status === "PARTIAL"
          ? "تحكم جزئي — يحتاج تثبيتاً سريعاً"
          : "تعثر قبلي — يستوجب حصة دعم فورية";

      return {
        prereqId: prereq.id,
        titleAr: prereq.titleAr,
        titleFr: prereq.titleFr,
        domainAr: prereq.domainAr,
        earnedPoints: Number(earned.toFixed(2)),
        maxPoints: Number(max.toFixed(2)),
        masteryPercent,
        status,
        statusLabelAr,
        remediationPlanAr: prereq.openExercise.remediationAr,
      };
    }
  );

  const totalEarned = Number(
    rows.reduce((acc, r) => acc + r.earnedPoints, 0).toFixed(2)
  );
  const totalMax = Number(
    rows.reduce((acc, r) => acc + r.maxPoints, 0).toFixed(2)
  );
  const overallPercent =
    totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;

  const overallStatusAr =
    overallPercent >= 75
      ? "جاهزية عالية لانطلاق المقرر الجديد"
      : overallPercent >= 50
      ? "جاهزية متوسطة — ينصح ببرمجة أنشطة تذكير مدمجة"
      : "يستوجب أسبوع دعم استدراكي مركز في المكتسبات القبلية";

  return {
    totalEarned,
    totalMax,
    overallPercent,
    overallStatusAr,
    rows,
  };
}

/**
 * تصدير الرائز التشخيصي التفاعلي كملف HTML5 مستقل يعمل بدون أنترنت مع رمز QR المدمج وخطة الدعم
 */
export function exportStandaloneDiagnosticQuizHtml(
  blueprint: PrerequisiteDiagnosticBlueprint
): string {
  const questionsHtml = blueprint.interactiveQuizData.questions
    .map(
      (q, idx) => `
      <div class="q-card" data-points="${q.points}">
        <div class="q-head">
          <span>سؤال ${idx + 1}: ${q.exerciseTitleAr}</span>
          <span class="q-pts">${q.points} ن (${q.level})</span>
        </div>
        <p class="q-prompt">${q.questionPromptAr}</p>
        <div class="choices">
          ${q.choices
            .map(
              (c, cIdx) => `
            <label class="choice-item">
              <input type="radio" name="q_${idx}" value="${cIdx}" data-correct="${
                c.isCorrect ? "1" : "0"
              }" />
              <span>${c.code}) ${c.labelAr}</span>
            </label>`
            )
            .join("")}
        </div>
        <div class="rem-note" style="display:none;">💡 التصحيح والدعم: ${
          q.fullSolutionAr || q.hintAr || ""
        }</div>
      </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${blueprint.customTitleAr}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .container { max-width: 860px; margin: 0 auto; background: #fff; border: 2px solid #1e1b4b; border-radius: 16px; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
    .q-card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin-bottom: 14px; background: #f8fafc; }
    .q-head { display: flex; justify-content: space-between; font-weight: 800; font-size: 13px; color: #312e81; margin-bottom: 8px; }
    .q-prompt { font-weight: 700; font-size: 14px; margin: 8px 0 12px; }
    .choices { display: grid; gap: 8px; }
    .choice-item { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; }
    .rem-note { margin-top: 10px; padding: 8px 12px; border-radius: 8px; background: #fef3c7; color: #78350f; font-size: 12px; font-weight: 600; }
    .btn { background: #1e1b4b; color: #fff; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 14px; }
    #resultBox { margin-top: 16px; padding: 16px; border-radius: 12px; background: #ecfdf5; border: 2px solid #059669; font-weight: 800; display: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 style="margin:0 0 6px;font-size:20px;">${blueprint.customTitleAr}</h1>
        <p style="margin:0;font-size:13px;color:#475569;">${blueprint.priorGradeLabelAr} · الرمز: ${blueprint.verificationCode}</p>
      </div>
      <div>${blueprint.interactiveQrSvg}</div>
    </div>
    ${questionsHtml}
    <button class="btn" onclick="gradeDiagnostic()">✓ تصحيح الرائز التشخيصي وعرض خطة الدعم</button>
    <div id="resultBox"></div>
  </div>
  <script>
    function gradeDiagnostic() {
      var cards = document.querySelectorAll('.q-card');
      var earned = 0, total = 0;
      cards.forEach(function(card, idx) {
        var pts = parseFloat(card.getAttribute('data-points') || '1');
        total += pts;
        var checked = card.querySelector('input[type=radio]:checked');
        if (checked && checked.getAttribute('data-correct') === '1') {
          earned += pts;
        }
        var note = card.querySelector('.rem-note');
        if (note) note.style.display = 'block';
      });
      var pct = total > 0 ? Math.round((earned / total) * 100) : 0;
      var box = document.getElementById('resultBox');
      box.style.display = 'block';
      box.innerHTML = 'النتيجة التشخيصية: ' + earned.toFixed(2) + ' / ' + total.toFixed(2) + ' نقطة (' + pct + '%) — ' + (pct >= 75 ? 'متحكم في المكتسبات القبلية' : 'يوصى بمراجعة بطاقات الدعم الصفراء أعلاه');
    }
  </script>
</body>
</html>`;
}

// ============================================================================
// PART B: AUTOMATED DYNAMIC SPECIFICATION MATRIX ENGINE (SPEC MATRIX 142-08)
// ============================================================================

export interface AutomatedSpecQuestionCell {
  questionIndex: number;
  textAr: string;
  textFr: string;
  points: number;
  level: "N1" | "N2" | "N3";
}

export interface AutomatedSpecMatrixRow {
  exerciseIndex: number;
  exerciseNumber: number;
  lessonAr: string;
  lessonFr: string;
  domainAr: string;
  domainFr: string;
  weightPercent: number;
  totalPoints: number;
  questionCount: number;
  n1Count: number;
  n2Count: number;
  n3Count: number;
  n1Points: number;
  n2Points: number;
  n3Points: number;
  estimatedMinutes: number;
  capacitiesAr: string[];
  questionsBreakdown: AutomatedSpecQuestionCell[];
}

export interface AutomatedSpecDomainSummary {
  domainAr: string;
  domainFr: string;
  exerciseCount: number;
  questionCount: number;
  totalPoints: number;
  percentage: number;
}

export interface AutomatedDynamicSpecMatrix {
  matrixId: string;
  lastUpdatedIso: string;
  dsStructureMode: MoroccanDSStructureMode;
  examDurationMinutes: number;
  rows: AutomatedSpecMatrixRow[];
  totals: {
    totalExercises: number;
    totalQuestions: number;
    totalWeightPercent: number;
    grandTotalPoints: number;
    n1Count: number;
    n2Count: number;
    n3Count: number;
    n1Points: number;
    n2Points: number;
    n3Points: number;
    n1Percent: number;
    n2Percent: number;
    n3Percent: number;
    totalEstimatedMinutes: number;
  };
  domainSummary: AutomatedSpecDomainSummary[];
  conformity14208: {
    score: number;
    isCompliant: boolean;
    statusAr: string;
    targetN1Percent: number;
    targetN2Percent: number;
    targetN3Percent: number;
    deltaN1Percent: number;
    deltaN2Percent: number;
    deltaN3Percent: number;
    recommendationsAr: string[];
  };
}

export interface DynamicExerciseInput {
  lessonAr: string;
  lessonFr?: string;
  domainAr?: string;
  targetPoints?: number;
  weight?: number;
  questionsAr?: string[];
  questionsFr?: string[];
  questionBaremes?: number[];
  questionLevels?: Array<"N1" | "N2" | "N3">;
  capacitiesAr?: string[];
}

export interface DynamicExercisePatch {
  lessonAr?: string;
  lessonFr?: string;
  domainAr?: string;
  targetPoints?: number;
  weight?: number;
  questionsAr?: string[];
  questionsFr?: string[];
  questionBaremes?: number[];
  questionLevels?: Array<"N1" | "N2" | "N3">;
}

export interface DynamicSpecMutationResult {
  lessons: LessonItem[];
  specMatrix: AutomatedDynamicSpecMatrix;
  effectiveN1: number;
  effectiveN2: number;
  effectiveN3: number;
  changeSummaryAr: string;
}

function normalizeLessonWeightsTo100(lessons: LessonItem[]): LessonItem[] {
  if (!lessons || lessons.length === 0) return [];
  const exactPts = computeExactExercisePointsOut20(lessons, 20);
  return lessons.map((lesson, idx) => {
    const pts = exactPts[idx] ?? Number((20 / lessons.length).toFixed(2));
    const weight = Math.round((pts / 20) * 100);
    return {
      ...lesson,
      weight: Math.max(5, weight),
    };
  });
}

function distributePointsToQuestions(
  totalPoints: number,
  qCount: number,
  existingBaremes?: number[]
): number[] {
  const count = Math.max(1, qCount);
  const target = Math.max(0.5, Math.round(totalPoints * 4) / 4);

  if (existingBaremes && existingBaremes.length === count) {
    const currentSum = existingBaremes.reduce((a, b) => a + (Number(b) || 0), 0);
    if (Math.abs(currentSum - target) < 0.01) {
      return existingBaremes.map((b) => Number(b.toFixed(2)));
    }
    if (currentSum > 0) {
      const scaled = existingBaremes.map(
        (b) => Math.max(0.25, Math.round(((b / currentSum) * target) * 4) / 4)
      );
      const scaledSum = scaled.reduce((a, b) => a + b, 0);
      const diff = Number((target - scaledSum).toFixed(2));
      scaled[scaled.length - 1] = Math.max(
        0.25,
        Number((scaled[scaled.length - 1] + diff).toFixed(2))
      );
      return scaled;
    }
  }

  const baseQuarter = Math.max(0.25, Math.floor((target / count) * 4) / 4);
  const arr = Array.from({ length: count }, () => baseQuarter);
  let rem = Number((target - baseQuarter * count).toFixed(2));
  let idx = count - 1;
  while (rem >= 0.24 && idx >= 0) {
    arr[idx] = Number((arr[idx] + 0.25).toFixed(2));
    rem = Number((rem - 0.25).toFixed(2));
    idx = (idx - 1 + count) % count;
  }
  if (Math.abs(rem) >= 0.01) {
    arr[count - 1] = Number((arr[count - 1] + rem).toFixed(2));
  }
  return arr;
}

/**
 * يبني جدول المواصفات الديناميكي المؤتمت (Spec Matrix) مباشرة من تمارين الفرض المحروس وأسئلتها الفعلية
 */
export function buildAutomatedDynamicSpecMatrix(params: {
  lessons: LessonItem[];
  n1Target?: number;
  n2Target?: number;
  n3Target?: number;
  dsStructureMode?: MoroccanDSStructureMode;
  examDurationMinutes?: number;
}): AutomatedDynamicSpecMatrix {
  const lessons = params.lessons || [];
  const n1Target = params.n1Target ?? 35;
  const n2Target = params.n2Target ?? 45;
  const n3Target = params.n3Target ?? 20;
  const dsStructureMode = params.dsStructureMode || "STANDARD_142_08";
  const examDurationMinutes = params.examDurationMinutes || 120;

  const exactExercisePoints = computeExactExercisePointsOut20(lessons, 20);

  let totalQuestions = 0;
  let n1Count = 0;
  let n2Count = 0;
  let n3Count = 0;
  let n1Points = 0;
  let n2Points = 0;
  let n3Points = 0;

  const rows: AutomatedSpecMatrixRow[] = lessons.map((lesson, idx) => {
    const exPoints = exactExercisePoints[idx] ?? 5;
    const weightPercent = Number(((exPoints / 20) * 100).toFixed(1));

    const variant = getVariantQuestions(lesson, "A", false, 0, "STANDARD");
    const questionsAr =
      lesson.sampleExerciseAr && lesson.sampleExerciseAr.length > 0
        ? lesson.sampleExerciseAr
        : variant.questionsAr;
    const questionsFr =
      lesson.sampleExerciseFr && lesson.sampleExerciseFr.length > 0
        ? lesson.sampleExerciseFr
        : variant.questionsFr;

    const qCount = Math.max(1, questionsAr.length);
    const defaultMeta = getQuestionBaremesAndLevels(
      weightPercent,
      qCount,
      n1Target,
      n2Target,
      n3Target
    );

    const seedBaremes =
      lesson.customQuestionBaremes &&
      lesson.customQuestionBaremes.length === qCount
        ? lesson.customQuestionBaremes
        : defaultMeta.map((m) => Number(m.points) || 1);

    const questionBaremes = distributePointsToQuestions(
      exPoints,
      qCount,
      seedBaremes
    );

    const questionLevels: Array<"N1" | "N2" | "N3"> = Array.from(
      { length: qCount },
      (_, qIdx) =>
        lesson.customQuestionLevels?.[qIdx] ||
        defaultMeta[qIdx]?.level ||
        (qIdx === 0 ? "N1" : qIdx === qCount - 1 && qCount >= 3 ? "N3" : "N2")
    );

    let rowN1Count = 0;
    let rowN2Count = 0;
    let rowN3Count = 0;
    let rowN1Pts = 0;
    let rowN2Pts = 0;
    let rowN3Pts = 0;

    const questionsBreakdown: AutomatedSpecQuestionCell[] = Array.from(
      { length: qCount },
      (_, qIdx) => {
        const pts = questionBaremes[qIdx] ?? 1;
        const lvl = questionLevels[qIdx] ?? "N2";
        if (lvl === "N1") {
          rowN1Count += 1;
          rowN1Pts = Number((rowN1Pts + pts).toFixed(2));
        } else if (lvl === "N2") {
          rowN2Count += 1;
          rowN2Pts = Number((rowN2Pts + pts).toFixed(2));
        } else {
          rowN3Count += 1;
          rowN3Pts = Number((rowN3Pts + pts).toFixed(2));
        }
        return {
          questionIndex: qIdx + 1,
          textAr: questionsAr[qIdx] || `سؤال ${qIdx + 1}`,
          textFr: questionsFr[qIdx] || questionsAr[qIdx] || `Question ${qIdx + 1}`,
          points: pts,
          level: lvl,
        };
      }
    );

    totalQuestions += qCount;
    n1Count += rowN1Count;
    n2Count += rowN2Count;
    n3Count += rowN3Count;
    n1Points = Number((n1Points + rowN1Pts).toFixed(2));
    n2Points = Number((n2Points + rowN2Pts).toFixed(2));
    n3Points = Number((n3Points + rowN3Pts).toFixed(2));

    const domainAr = lesson.subCategory || "تحليل";
    const domainFr = lesson.subCategoryFr || lesson.category || "Analyse";
    const estimatedMinutes = Math.max(
      10,
      Math.round((exPoints / 20) * examDurationMinutes)
    );

    return {
      exerciseIndex: idx,
      exerciseNumber: idx + 1,
      lessonAr: lesson.lessonAr,
      lessonFr: lesson.lessonFr || lesson.lessonAr,
      domainAr,
      domainFr,
      weightPercent,
      totalPoints: Number(exPoints.toFixed(2)),
      questionCount: qCount,
      n1Count: rowN1Count,
      n2Count: rowN2Count,
      n3Count: rowN3Count,
      n1Points: rowN1Pts,
      n2Points: rowN2Pts,
      n3Points: rowN3Pts,
      estimatedMinutes,
      capacitiesAr:
        lesson.capacitiesAr && lesson.capacitiesAr.length > 0
          ? lesson.capacitiesAr
          : [lesson.lessonAr],
      questionsBreakdown,
    };
  });

  const grandTotalPoints = Number(
    rows.reduce((acc, r) => acc + r.totalPoints, 0).toFixed(2)
  );
  const safeTotal = grandTotalPoints > 0 ? grandTotalPoints : 20;

  const n1Percent = Math.round((n1Points / safeTotal) * 100);
  const n2Percent = Math.round((n2Points / safeTotal) * 100);
  const n3Percent = Math.max(0, 100 - n1Percent - n2Percent);

  // Domain summary
  const domainMap = new Map<string, AutomatedSpecDomainSummary>();
  rows.forEach((row) => {
    const key = row.domainAr;
    const existing = domainMap.get(key) || {
      domainAr: row.domainAr,
      domainFr: row.domainFr,
      exerciseCount: 0,
      questionCount: 0,
      totalPoints: 0,
      percentage: 0,
    };
    existing.exerciseCount += 1;
    existing.questionCount += row.questionCount;
    existing.totalPoints = Number((existing.totalPoints + row.totalPoints).toFixed(2));
    existing.percentage = Number(((existing.totalPoints / safeTotal) * 100).toFixed(1));
    domainMap.set(key, existing);
  });

  const deltaN1 = n1Percent - n1Target;
  const deltaN2 = n2Percent - n2Target;
  const deltaN3 = n3Percent - n3Target;

  const absDeviation =
    (Math.abs(deltaN1) + Math.abs(deltaN2) + Math.abs(deltaN3)) / 2;
  const pointsDeviationPenalty = Math.abs(grandTotalPoints - 20) * 15;
  const conformityScore = Math.max(
    40,
    Math.min(100, Math.round(100 - absDeviation - pointsDeviationPenalty))
  );

  const recommendationsAr: string[] = [];
  if (Math.abs(grandTotalPoints - 20) > 0.01) {
    recommendationsAr.push(
      `مجموع النقط الحالي (${grandTotalPoints}/20) يحتاج ضبطاً ليطابق 20.00/20 ن.`
    );
  }
  if (Math.abs(deltaN1) > 12) {
    recommendationsAr.push(
      deltaN1 > 0
        ? `نسبة التطبيق المباشر N1 (${n1Percent}%) مرتفعة عن الهدف (${n1Target}%)؛ ينصح بترقية سؤال إلى المستوى N2.`
        : `نسبة التطبيق المباشر N1 (${n1Percent}%) منخفضة عن الهدف (${n1Target}%)؛ ينصح بإضافة سؤال تمهيدي N1.`
    );
  }
  if (Math.abs(deltaN3) > 12) {
    recommendationsAr.push(
      deltaN3 > 0
        ? `نسبة أسئلة التوليف N3 (${n3Percent}%) مرتفعة؛ راعِ زمن الإنجاز المتاح للتلميذ.`
        : `نسبة أسئلة التوليف والبرهان N3 (${n3Percent}%) أقل من الهدف (${n3Target}%).`
    );
  }
  if (recommendationsAr.length === 0) {
    recommendationsAr.push(
      "جدول المواصفات متوازن ومطابق تماماً لمقتضيات المذكرة الوزارية 142-08 (20/20 ن)."
    );
  }

  return {
    matrixId: `spec_matrix_${rows.length}ex_${totalQuestions}q`,
    lastUpdatedIso: new Date().toISOString(),
    dsStructureMode,
    examDurationMinutes,
    rows,
    totals: {
      totalExercises: rows.length,
      totalQuestions,
      totalWeightPercent: 100,
      grandTotalPoints: rows.length > 0 ? grandTotalPoints : 0,
      n1Count,
      n2Count,
      n3Count,
      n1Points,
      n2Points,
      n3Points,
      n1Percent,
      n2Percent,
      n3Percent,
      totalEstimatedMinutes: rows.reduce((acc, r) => acc + r.estimatedMinutes, 0),
    },
    domainSummary: Array.from(domainMap.values()),
    conformity14208: {
      score: conformityScore,
      isCompliant: conformityScore >= 82 && Math.abs(grandTotalPoints - 20) < 0.01,
      statusAr:
        conformityScore >= 90
          ? "مطابقة ممتازة للمذكرة 142-08"
          : conformityScore >= 80
          ? "مطابقة جيدة ومتوازنة"
          : "يستحسن موازنة نسب المستويات المعرفية",
      targetN1Percent: n1Target,
      targetN2Percent: n2Target,
      targetN3Percent: n3Target,
      deltaN1Percent: deltaN1,
      deltaN2Percent: deltaN2,
      deltaN3Percent: deltaN3,
      recommendationsAr,
    },
  };
}

/**
 * إضافة تمرين جديد إلى الفرض المحروس مع تحديث جدول المواصفات وإعادة ضبط سلم 20/20 ن ديناميكياً
 */
export function addExerciseAndSyncSpecMatrix(
  currentLessons: LessonItem[],
  newInput: DynamicExerciseInput,
  config?: {
    n1Target?: number;
    n2Target?: number;
    n3Target?: number;
    dsStructureMode?: MoroccanDSStructureMode;
    examDurationMinutes?: number;
  }
): DynamicSpecMutationResult {
  const requestedPoints = Math.max(
    1,
    Math.min(14, Number(newInput.targetPoints) || 5)
  );
  const newWeightRatio = Math.round((requestedPoints / 20) * 100);
  const remainingWeight = Math.max(10, 100 - newWeightRatio);

  const oldSum =
    currentLessons.reduce((acc, l) => acc + (Number(l.weight) || 0), 0) || 100;
  const scaledExisting = currentLessons.map((l) => ({
    ...l,
    weight: Math.max(
      5,
      Math.round(((Number(l.weight) || 25) / oldSum) * remainingWeight)
    ),
  }));

  const defaultQuestionsAr =
    newInput.questionsAr && newInput.questionsAr.length > 0
      ? newInput.questionsAr
      : [
          `1. تطبيق مباشر للقواعد الأساسية في «${newInput.lessonAr}».`,
          `2. استثمار الخاصيات لحل معادلة أو إثبات علاقة في «${newInput.lessonAr}».`,
          `3. سؤال توليفي استنتاجي يربط معطيات التمرين.`,
        ];
  const defaultQuestionsFr =
    newInput.questionsFr && newInput.questionsFr.length > 0
      ? newInput.questionsFr
      : defaultQuestionsAr.map((q) => q);

  const qCount = defaultQuestionsAr.length;
  const questionBaremes = distributePointsToQuestions(
    requestedPoints,
    qCount,
    newInput.questionBaremes
  );
  const questionLevels: Array<"N1" | "N2" | "N3"> =
    newInput.questionLevels && newInput.questionLevels.length === qCount
      ? newInput.questionLevels
      : defaultQuestionsAr.map((_, idx) =>
          idx === 0 ? "N1" : idx === qCount - 1 && qCount >= 3 ? "N3" : "N2"
        );

  const domainAr = newInput.domainAr || "تحليل";
  const createdLesson: LessonItem = {
    lessonAr: newInput.lessonAr.trim() || `تمرين إضافي ${currentLessons.length + 1}`,
    lessonFr:
      newInput.lessonFr?.trim() ||
      newInput.lessonAr.trim() ||
      `Exercice ${currentLessons.length + 1}`,
    weight: newWeightRatio,
    hours: "4h",
    category:
      domainAr.includes("هندسة")
        ? "Geometry"
        : domainAr.includes("جبر") || domainAr.includes("عقدية")
        ? "Algebra"
        : domainAr.includes("احتمال")
        ? "Probabilities"
        : "Calculus",
    subCategory: domainAr as LessonItem["subCategory"],
    subCategoryFr:
      domainAr.includes("هندسة")
        ? "Géométrie"
        : domainAr.includes("جبر")
        ? "Algèbre"
        : domainAr.includes("احتمال")
        ? "Probabilités"
        : "Analyse",
    capacitiesAr:
      newInput.capacitiesAr && newInput.capacitiesAr.length > 0
        ? newInput.capacitiesAr
        : [`التحكم في مهارات ${newInput.lessonAr}`],
    capacitiesFr: [`Maîtriser les compétences de ${newInput.lessonFr || newInput.lessonAr}`],
    sampleExerciseAr: defaultQuestionsAr,
    sampleExerciseFr: defaultQuestionsFr,
    sampleSolutionAr: defaultQuestionsAr.map(
      (q, i) => `عناصر الإجابة للسؤال ${i + 1}: تطبيق منهجي للخاصية المقررة (${questionBaremes[i]} ن).`
    ),
    sampleSolutionFr: defaultQuestionsFr.map(
      (q, i) => `Éléments de réponse Q${i + 1} (${questionBaremes[i]} pt).`
    ),
    customQuestionBaremes: questionBaremes,
    customQuestionLevels: questionLevels,
    hasCustomQuestions: true,
  };

  const combined = normalizeLessonWeightsTo100([...scaledExisting, createdLesson]);
  const exactPts = computeExactExercisePointsOut20(combined, 20);
  const syncedLessons = combined.map((lesson, idx) => ({
    ...lesson,
    customQuestionBaremes: distributePointsToQuestions(
      exactPts[idx] || 5,
      (lesson.sampleExerciseAr || getVariantQuestions(lesson, "A", false).questionsAr)
        .length,
      lesson.customQuestionBaremes
    ),
  }));

  const specMatrix = buildAutomatedDynamicSpecMatrix({
    lessons: syncedLessons,
    ...config,
  });

  return {
    lessons: syncedLessons,
    specMatrix,
    effectiveN1: specMatrix.totals.n1Percent,
    effectiveN2: specMatrix.totals.n2Percent,
    effectiveN3: specMatrix.totals.n3Percent,
    changeSummaryAr: `تمت إضافة «${createdLesson.lessonAr}» (${exactPts[exactPts.length - 1]} ن) وتحديث جدول المواصفات تلقائياً (${specMatrix.totals.totalExercises} تمارين · 20/20 ن).`,
  };
}

/**
 * تعديل أي تمرين في الفرض المحروس (النقط، الأسئلة، المستويات المعرفية N1/N2/N3، أو المحور) مع تحديث جدول المواصفات فورياً
 */
export function updateExerciseAndSyncSpecMatrix(
  currentLessons: LessonItem[],
  exerciseIndex: number,
  patch: DynamicExercisePatch,
  config?: {
    n1Target?: number;
    n2Target?: number;
    n3Target?: number;
    dsStructureMode?: MoroccanDSStructureMode;
    examDurationMinutes?: number;
  }
): DynamicSpecMutationResult {
  if (
    !currentLessons ||
    currentLessons.length === 0 ||
    exerciseIndex < 0 ||
    exerciseIndex >= currentLessons.length
  ) {
    const fallbackMatrix = buildAutomatedDynamicSpecMatrix({
      lessons: currentLessons || [],
      ...config,
    });
    return {
      lessons: currentLessons || [],
      specMatrix: fallbackMatrix,
      effectiveN1: fallbackMatrix.totals.n1Percent,
      effectiveN2: fallbackMatrix.totals.n2Percent,
      effectiveN3: fallbackMatrix.totals.n3Percent,
      changeSummaryAr: "لم يتم تغيير التمارين.",
    };
  }

  const targetLesson = currentLessons[exerciseIndex];
  const existingVariant = getVariantQuestions(targetLesson, "A", false, 0, "STANDARD");
  const updatedQuestionsAr =
    patch.questionsAr && patch.questionsAr.length > 0
      ? patch.questionsAr
      : targetLesson.sampleExerciseAr && targetLesson.sampleExerciseAr.length > 0
      ? targetLesson.sampleExerciseAr
      : existingVariant.questionsAr;

  const updatedQuestionsFr =
    patch.questionsFr && patch.questionsFr.length > 0
      ? patch.questionsFr
      : targetLesson.sampleExerciseFr && targetLesson.sampleExerciseFr.length > 0
      ? targetLesson.sampleExerciseFr
      : existingVariant.questionsFr;

  const qCount = Math.max(1, updatedQuestionsAr.length);

  // Determine updated weights across lessons if targetPoints or weight changed
  let updatedLessons = [...currentLessons];
  if (typeof patch.targetPoints === "number" || typeof patch.weight === "number") {
    const desiredPts =
      typeof patch.targetPoints === "number"
        ? Math.max(1, Math.min(17, patch.targetPoints))
        : Math.max(1, Math.min(17, ((patch.weight || 25) / 100) * 20));
    const desiredWeight = Math.round((desiredPts / 20) * 100);

    if (updatedLessons.length === 1) {
      updatedLessons[0] = { ...targetLesson, weight: 100 };
    } else {
      const otherWeightBudget = Math.max(10, 100 - desiredWeight);
      const otherOldSum =
        updatedLessons.reduce(
          (acc, l, idx) => (idx === exerciseIndex ? acc : acc + (Number(l.weight) || 20)),
          0
        ) || 100;

      updatedLessons = updatedLessons.map((l, idx) => {
        if (idx === exerciseIndex) {
          return { ...l, weight: desiredWeight };
        }
        return {
          ...l,
          weight: Math.max(
            5,
            Math.round(((Number(l.weight) || 20) / otherOldSum) * otherWeightBudget)
          ),
        };
      });
    }
  }

  const exactPts = computeExactExercisePointsOut20(updatedLessons, 20);
  const targetExPoints = exactPts[exerciseIndex] || 5;

  const rawBaremes =
    patch.questionBaremes && patch.questionBaremes.length > 0
      ? patch.questionBaremes.slice(0, qCount)
      : targetLesson.customQuestionBaremes?.slice(0, qCount);

  const normalizedBaremes = distributePointsToQuestions(
    targetExPoints,
    qCount,
    rawBaremes
  );

  const existingLevels =
    patch.questionLevels || targetLesson.customQuestionLevels || [];
  const normalizedLevels: Array<"N1" | "N2" | "N3"> = Array.from(
    { length: qCount },
    (_, qIdx) =>
      existingLevels[qIdx] ||
      (qIdx === 0 ? "N1" : qIdx === qCount - 1 && qCount >= 3 ? "N3" : "N2")
  );

  const domainAr = patch.domainAr || targetLesson.subCategory || "تحليل";

  updatedLessons[exerciseIndex] = {
    ...updatedLessons[exerciseIndex],
    lessonAr: patch.lessonAr?.trim() || targetLesson.lessonAr,
    lessonFr: patch.lessonFr?.trim() || targetLesson.lessonFr,
    subCategory: domainAr as LessonItem["subCategory"],
    sampleExerciseAr: updatedQuestionsAr,
    sampleExerciseFr: updatedQuestionsFr,
    customQuestionBaremes: normalizedBaremes,
    customQuestionLevels: normalizedLevels,
    hasCustomQuestions: true,
  };

  // Resync all other exercises' question baremes so total = 20.00/20
  const finalLessons = updatedLessons.map((lesson, idx) => {
    if (idx === exerciseIndex) return lesson;
    const pts = exactPts[idx] || 5;
    const qArr =
      lesson.sampleExerciseAr && lesson.sampleExerciseAr.length > 0
        ? lesson.sampleExerciseAr
        : getVariantQuestions(lesson, "A", false).questionsAr;
    return {
      ...lesson,
      weight: Math.round((pts / 20) * 100),
      customQuestionBaremes: distributePointsToQuestions(
        pts,
        qArr.length,
        lesson.customQuestionBaremes
      ),
    };
  });

  const specMatrix = buildAutomatedDynamicSpecMatrix({
    lessons: finalLessons,
    ...config,
  });

  return {
    lessons: finalLessons,
    specMatrix,
    effectiveN1: specMatrix.totals.n1Percent,
    effectiveN2: specMatrix.totals.n2Percent,
    effectiveN3: specMatrix.totals.n3Percent,
    changeSummaryAr: `تم تحديث التمرين رقم ${exerciseIndex + 1} («${finalLessons[exerciseIndex].lessonAr}») وإعادة حساب جدول المواصفات فورياً (20/20 ن).`,
  };
}

/**
 * حذف تمرين من الفرض المحروس مع إعادة توزيع النقط (20/20) وتحديث جدول المواصفات ديناميكياً
 */
export function removeExerciseAndSyncSpecMatrix(
  currentLessons: LessonItem[],
  exerciseIndex: number,
  config?: {
    n1Target?: number;
    n2Target?: number;
    n3Target?: number;
    dsStructureMode?: MoroccanDSStructureMode;
    examDurationMinutes?: number;
  }
): DynamicSpecMutationResult {
  if (!currentLessons || currentLessons.length <= 1) {
    const specMatrix = buildAutomatedDynamicSpecMatrix({
      lessons: currentLessons || [],
      ...config,
    });
    return {
      lessons: currentLessons || [],
      specMatrix,
      effectiveN1: specMatrix.totals.n1Percent,
      effectiveN2: specMatrix.totals.n2Percent,
      effectiveN3: specMatrix.totals.n3Percent,
      changeSummaryAr: "يجب الإبقاء على تمرين واحد على الأقل في الفرض المحروس.",
    };
  }

  const removedTitle = currentLessons[exerciseIndex]?.lessonAr || "";
  const remaining = currentLessons.filter((_, idx) => idx !== exerciseIndex);
  const normalized = normalizeLessonWeightsTo100(remaining);
  const exactPts = computeExactExercisePointsOut20(normalized, 20);

  const syncedLessons = normalized.map((lesson, idx) => {
    const qArr =
      lesson.sampleExerciseAr && lesson.sampleExerciseAr.length > 0
        ? lesson.sampleExerciseAr
        : getVariantQuestions(lesson, "A", false).questionsAr;
    return {
      ...lesson,
      customQuestionBaremes: distributePointsToQuestions(
        exactPts[idx] || 5,
        qArr.length,
        lesson.customQuestionBaremes
      ),
    };
  });

  const specMatrix = buildAutomatedDynamicSpecMatrix({
    lessons: syncedLessons,
    ...config,
  });

  return {
    lessons: syncedLessons,
    specMatrix,
    effectiveN1: specMatrix.totals.n1Percent,
    effectiveN2: specMatrix.totals.n2Percent,
    effectiveN3: specMatrix.totals.n3Percent,
    changeSummaryAr: `تم حذف «${removedTitle}» وإعادة توزيع سلم التنقيط 20/20 ن على ${syncedLessons.length} تمارين تلقائياً.`,
  };
}

/**
 * موازنة آلية شاملة لجدول المواصفات ليطابق نسب المذكرة 142-08 (N1 / N2 / N3) وسلم 20.00/20 نقطة
 */
export function autoRebalanceSpecMatrixTo14208(
  currentLessons: LessonItem[],
  targetN1: number = 35,
  targetN2: number = 45,
  targetN3: number = 20,
  dsStructureMode: MoroccanDSStructureMode = "STANDARD_142_08"
): DynamicSpecMutationResult {
  const normalized = normalizeLessonWeightsTo100(currentLessons);
  const exactPts = computeExactExercisePointsOut20(normalized, 20);

  const rebalancedLessons = normalized.map((lesson, idx) => {
    const exPoints = exactPts[idx] || 5;
    const weightPercent = Math.round((exPoints / 20) * 100);
    const variant = getVariantQuestions(lesson, "A", false, 0, "STANDARD");
    const questionsAr =
      lesson.sampleExerciseAr && lesson.sampleExerciseAr.length > 0
        ? lesson.sampleExerciseAr
        : variant.questionsAr;
    const questionsFr =
      lesson.sampleExerciseFr && lesson.sampleExerciseFr.length > 0
        ? lesson.sampleExerciseFr
        : variant.questionsFr;

    const qCount = Math.max(1, questionsAr.length);
    const meta = getQuestionBaremesAndLevels(
      weightPercent,
      qCount,
      targetN1,
      targetN2,
      targetN3
    );

    const levels: Array<"N1" | "N2" | "N3"> = meta.map((m) => m.level);
    const levelCounts = { N1: 0, N2: 0, N3: 0 };
    levels.forEach((lvl) => {
      levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
    });

    const targetSharesPerQuestion = levels.map((lvl) => {
      const freq = Math.max(1, levelCounts[lvl]);
      const rawTarget =
        lvl === "N1" ? targetN1 : lvl === "N3" ? targetN3 : targetN2;
      return Math.max(0.25, rawTarget / freq);
    });

    const baremes = distributePointsToQuestions(
      exPoints,
      qCount,
      targetSharesPerQuestion
    );

    return {
      ...lesson,
      weight: weightPercent,
      sampleExerciseAr: questionsAr,
      sampleExerciseFr: questionsFr,
      customQuestionBaremes: baremes,
      customQuestionLevels: levels,
      hasCustomQuestions: true,
    };
  });

  const specMatrix = buildAutomatedDynamicSpecMatrix({
    lessons: rebalancedLessons,
    n1Target: targetN1,
    n2Target: targetN2,
    n3Target: targetN3,
    dsStructureMode,
  });

  return {
    lessons: rebalancedLessons,
    specMatrix,
    effectiveN1: specMatrix.totals.n1Percent,
    effectiveN2: specMatrix.totals.n2Percent,
    effectiveN3: specMatrix.totals.n3Percent,
    changeSummaryAr: `تمت الموازنة الآلية لجدول المواصفات وفق المذكرة 142-08 (N1=${specMatrix.totals.n1Percent}% · N2=${specMatrix.totals.n2Percent}% · N3=${specMatrix.totals.n3Percent}% · المجموع 20/20 ن).`,
  };
}

/**
 * تصدير جدول المواصفات الديناميكي بصيغة LaTeX جاهزة للإدراج في مذكرة الأستاذ أو ملف الفرض
 */
export function exportAutomatedSpecMatrixLatex(
  matrix: AutomatedDynamicSpecMatrix,
  trackLabelAr: string,
  examTitleAr: string
): string {
  const rowsLatex = matrix.rows
    .map(
      (r) =>
        `التمرين ${r.exerciseNumber}: ${r.lessonAr} & ${r.domainAr} & ${r.questionCount} & ${r.n1Points.toFixed(
          2
        )} ن (${r.n1Count} س) & ${r.n2Points.toFixed(2)} ن (${r.n2Count} س) & ${r.n3Points.toFixed(
          2
        )} ن (${r.n3Count} س) & \\textbf{${r.totalPoints.toFixed(2)} ن} & ${r.weightPercent}\\% & ${
          r.estimatedMinutes
        } د \\\\ \\hline`
    )
    .join("\n");

  return `% ============================================================================
% جدول المواصفات الديناميكي المؤتمت (Specification Matrix — المذكرة 142-08)
% المسلك: ${trackLabelAr} | الفرض: ${examTitleAr}
% ============================================================================
\\begin{center}
\\textbf{\\large جدول المواصفات البيداغوجي للفرض المحروس (المذكرة الوزارية 142-08)}\\\\[4pt]
{\\small المسلك: ${trackLabelAr} \\quad|\\quad مؤشر المطابقة: ${matrix.conformity14208.score}\\% (${matrix.conformity14208.statusAr})}
\\end{center}
\\vspace{4pt}
\\renewcommand{\\arraystretch}{1.35}
\\begin{tabular}{|p{4.4cm}|c|c|c|c|c|c|c|c|}
\\hline
\\textbf{التمرين والدرس المقرر} & \\textbf{المجال} & \\textbf{الأسئلة} & \\textbf{تطبيق N1} & \\textbf{استحضار N2} & \\textbf{توليف N3} & \\textbf{النقط /20} & \\textbf{الوزن \\%} & \\textbf{الزمن} \\\\ \\hline
${rowsLatex}
\\textbf{المجموع العام للفرض} & \\textbf{${matrix.domainSummary.length} مجالات} & \\textbf{${matrix.totals.totalQuestions}} & \\textbf{${matrix.totals.n1Points.toFixed(
    2
  )} ن (${matrix.totals.n1Percent}\\%)} & \\textbf{${matrix.totals.n2Points.toFixed(
    2
  )} ن (${matrix.totals.n2Percent}\\%)} & \\textbf{${matrix.totals.n3Points.toFixed(
    2
  )} ن (${matrix.totals.n3Percent}\\%)} & \\textbf{${matrix.totals.grandTotalPoints.toFixed(
    2
  )} / 20} & \\textbf{100\\%} & \\textbf{${matrix.totals.totalEstimatedMinutes} د} \\\\ \\hline
\\end{tabular}
`;
}
