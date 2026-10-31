import {
  LessonItem,
  InsertedFigure,
  DSQuestionDensity,
  computeExactExerciseEffectiveWeights,
  getQuestionBaremesAndLevels,
  getVariantQuestions,
} from "../data/curriculum";

// ============================================================================
// 1. مُولّد جدول التخصيص ثنائي البعد (Tableau de Spécification 2D - Bloom × Chapitres)
// ============================================================================

export interface SpecMatrixCell {
  questionsCount: number;
  points: number;
  percentageOfTotal: number;
  questionIndices: number[]; // 1-indexed question numbers within the exercise
}

export interface SpecMatrixRow {
  lessonIndex: number;
  lessonTitleAr: string;
  lessonTitleFr: string;
  capacitiesAr: string[];
  capacitiesFr: string[];
  weightPercent: number;
  totalQuestions: number;
  totalPoints: number;
  estimatedMinutes: number;
  dominantLevel: "N1" | "N2" | "N3";
  n1: SpecMatrixCell;
  n2: SpecMatrixCell;
  n3: SpecMatrixCell;
}

export interface SpecMatrix2DSummary {
  rows: SpecMatrixRow[];
  totals: {
    n1Questions: number;
    n1Points: number;
    n1Percent: number;
    n2Questions: number;
    n2Points: number;
    n2Percent: number;
    n3Questions: number;
    n3Points: number;
    n3Percent: number;
    grandTotalQuestions: number;
    grandTotalPoints: number;
    totalEstimatedMinutes: number;
  };
  targetRatios: { n1: number; n2: number; n3: number };
  deviations: { n1Delta: number; n2Delta: number; n3Delta: number };
  conformityScore: number; // 0 to 100% alignment with Note 142-08 targets
  inspectorAuditStatus: "CONFORME" | "TOLERANCE" | "A_EQUILIBRER";
  inspectorVerdictAr: string;
  inspectorVerdictFr: string;
}

export function build2DSpecificationMatrix(
  lessons: LessonItem[],
  n1Target: number,
  n2Target: number,
  n3Target: number,
  dsStructureMode: string = "EXERCICES_SEULS",
  isMission: boolean = false,
  dsQuestionDensity: DSQuestionDensity = "STANDARD",
  qcmQuestionCount: number = 4,
  examDurationMinutes: number = 120
): SpecMatrix2DSummary {
  const hasQCM =
    dsStructureMode === "QCM_ET_EXERCICES" || dsStructureMode === "COMPLETE_EXAM_MAROC";
  const hasProb =
    dsStructureMode === "EXERCICES_ET_PROBLEME" || dsStructureMode === "COMPLETE_EXAM_MAROC";

  const validQcmCount = Math.max(2, Math.min(10, qcmQuestionCount || 4));
  const fixedQcmPts = hasQCM ? Number((validQcmCount * 1.0).toFixed(2)) : 0;
  const fixedProbPts = hasProb ? 8.5 : 0;
  const exBudget =
    hasQCM || hasProb ? Math.max(4, 20 - fixedQcmPts - fixedProbPts) : 20;

  const totalRawWeight =
    lessons.reduce((sum, l) => sum + (Number(l.weight) || 0), 0) || 100;

  const rows: SpecMatrixRow[] = [];

  if (hasQCM) {
    const qcmN1Count = Math.ceil(validQcmCount * 0.75);
    const qcmN2Count = Math.max(0, validQcmCount - qcmN1Count);
    const qcmN1Pts = Number((qcmN1Count * 1.0).toFixed(2));
    const qcmN2Pts = Number((qcmN2Count * 1.0).toFixed(2));
    const n1Indices = Array.from({ length: qcmN1Count }, (_, i) => i + 1);
    const n2Indices = Array.from({ length: qcmN2Count }, (_, i) => qcmN1Count + i + 1);

    rows.push({
      lessonIndex: 1,
      lessonTitleAr: "تمرين الاختيار من متعدد (QCM) مع التعليل",
      lessonTitleFr: "QCM & Vrai/Faux avec justification",
      capacitiesAr: [
        "التحقق من المكتسبات الأساسية والتعاريف والخاصيات المباشرة",
        "التعليل الرياضي الموجز والتمييز بين القضايا الصحيحة والخاطئة",
      ],
      capacitiesFr: [
        "Vérification des acquis fondamentaux et application directe des propriétés",
        "Justification mathématique concise et discrimination d'affirmations",
      ],
      weightPercent: Number(((fixedQcmPts / 20) * 100).toFixed(1)),
      totalQuestions: validQcmCount,
      totalPoints: fixedQcmPts,
      estimatedMinutes: Math.max(10, Math.round((fixedQcmPts / 20) * examDurationMinutes)),
      dominantLevel: "N1",
      n1: {
        questionsCount: qcmN1Count,
        points: qcmN1Pts,
        percentageOfTotal: Number(((qcmN1Pts / 20) * 100).toFixed(1)),
        questionIndices: n1Indices,
      },
      n2: {
        questionsCount: qcmN2Count,
        points: qcmN2Pts,
        percentageOfTotal: Number(((qcmN2Pts / 20) * 100).toFixed(1)),
        questionIndices: n2Indices,
      },
      n3: { questionsCount: 0, points: 0, percentageOfTotal: 0, questionIndices: [] },
    });
  }

  const exactWeights = computeExactExerciseEffectiveWeights(lessons, exBudget);

  lessons.forEach((lesson, idx) => {
    const effectiveWeight = exactWeights[idx] ?? lesson.weight;

    const variantQs = getVariantQuestions(lesson, "A", false, 0, dsQuestionDensity);
    const qCount = Math.max(
      1,
      variantQs.questionsFr.length ||
        lesson.sampleExerciseFr?.length ||
        lesson.sampleExerciseAr?.length ||
        3
    );

    const metas = getQuestionBaremesAndLevels(
      effectiveWeight,
      qCount,
      n1Target,
      n2Target,
      n3Target,
      lesson.customQuestionBaremes,
      lesson.customQuestionLevels
    );

    const n1Cell: SpecMatrixCell = {
      questionsCount: 0,
      points: 0,
      percentageOfTotal: 0,
      questionIndices: [],
    };
    const n2Cell: SpecMatrixCell = {
      questionsCount: 0,
      points: 0,
      percentageOfTotal: 0,
      questionIndices: [],
    };
    const n3Cell: SpecMatrixCell = {
      questionsCount: 0,
      points: 0,
      percentageOfTotal: 0,
      questionIndices: [],
    };

    metas.forEach((m, qIdx) => {
      const pts = parseFloat(m.points || "0");
      if (m.level === "N1") {
        n1Cell.questionsCount += 1;
        n1Cell.points = Number((n1Cell.points + pts).toFixed(2));
        n1Cell.questionIndices.push(qIdx + 1);
      } else if (m.level === "N2") {
        n2Cell.questionsCount += 1;
        n2Cell.points = Number((n2Cell.points + pts).toFixed(2));
        n2Cell.questionIndices.push(qIdx + 1);
      } else {
        n3Cell.questionsCount += 1;
        n3Cell.points = Number((n3Cell.points + pts).toFixed(2));
        n3Cell.questionIndices.push(qIdx + 1);
      }
    });

    n1Cell.percentageOfTotal = Number(((n1Cell.points / 20) * 100).toFixed(1));
    n2Cell.percentageOfTotal = Number(((n2Cell.points / 20) * 100).toFixed(1));
    n3Cell.percentageOfTotal = Number(((n3Cell.points / 20) * 100).toFixed(1));

    const rowTotalPts = Number((n1Cell.points + n2Cell.points + n3Cell.points).toFixed(2));
    const dominantLevel: "N1" | "N2" | "N3" =
      n3Cell.points >= n2Cell.points && n3Cell.points >= n1Cell.points
        ? "N3"
        : n2Cell.points >= n1Cell.points
        ? "N2"
        : "N1";

    rows.push({
      lessonIndex: idx + (hasQCM ? 2 : 1),
      lessonTitleAr: lesson.lessonAr,
      lessonTitleFr: lesson.lessonFr,
      capacitiesAr: lesson.capacitiesAr || [],
      capacitiesFr: lesson.capacitiesFr || [],
      weightPercent: Number(((rowTotalPts / 20) * 100).toFixed(1)),
      totalQuestions: qCount,
      totalPoints: rowTotalPts,
      estimatedMinutes: Math.max(10, Math.round((rowTotalPts / 20) * examDurationMinutes)),
      dominantLevel,
      n1: n1Cell,
      n2: n2Cell,
      n3: n3Cell,
    });
  });

  if (hasProb) {
    rows.push({
      lessonIndex: rows.length + 1,
      lessonTitleAr: "المسألة التوليفية الشاملة (أجزاء I و II و III)",
      lessonTitleFr: "Problème de Synthèse (Parties I, II, III)",
      capacitiesAr: [
        "توليف موارد التحليل والدوال والمتتاليات في وضعية مسألة مركبة",
        "التأويل الهندسي وبناء الاستدلال الاستنتاجي المتدرج (نمط البكالوريا)",
      ],
      capacitiesFr: [
        "Mobilisation conjointe de l'analyse, des fonctions et des suites numériques",
        "Interprétation géométrique et résolution de problème de synthèse (Format Bac)",
      ],
      weightPercent: 42.5,
      totalQuestions: 6,
      totalPoints: 8.5,
      estimatedMinutes: Math.max(25, Math.round((8.5 / 20) * examDurationMinutes)),
      dominantLevel: "N3",
      n1: { questionsCount: 1, points: 1.5, percentageOfTotal: 7.5, questionIndices: [1] },
      n2: { questionsCount: 3, points: 4.0, percentageOfTotal: 20.0, questionIndices: [2, 3, 4] },
      n3: { questionsCount: 2, points: 3.0, percentageOfTotal: 15.0, questionIndices: [5, 6] },
    });
  }

  const n1Questions = rows.reduce((s, r) => s + r.n1.questionsCount, 0);
  const n1Points = Number(rows.reduce((s, r) => s + r.n1.points, 0).toFixed(2));
  const n2Questions = rows.reduce((s, r) => s + r.n2.questionsCount, 0);
  const n2Points = Number(rows.reduce((s, r) => s + r.n2.points, 0).toFixed(2));
  const n3Questions = rows.reduce((s, r) => s + r.n3.questionsCount, 0);
  const n3Points = Number(rows.reduce((s, r) => s + r.n3.points, 0).toFixed(2));

  const grandTotalQuestions = n1Questions + n2Questions + n3Questions;
  const grandTotalPoints = Number((n1Points + n2Points + n3Points).toFixed(2)) || 20;
  const totalEstimatedMinutes = rows.reduce((s, r) => s + r.estimatedMinutes, 0);

  const n1Percent = Number(((n1Points / grandTotalPoints) * 100).toFixed(1));
  const n2Percent = Number(((n2Points / grandTotalPoints) * 100).toFixed(1));
  const n3Percent = Number(((n3Points / grandTotalPoints) * 100).toFixed(1));

  const n1Delta = Number((n1Percent - n1Target).toFixed(1));
  const n2Delta = Number((n2Percent - n2Target).toFixed(1));
  const n3Delta = Number((n3Percent - n3Target).toFixed(1));

  const diff = Math.abs(n1Delta) + Math.abs(n2Delta) + Math.abs(n3Delta);
  const scorePenalty = Math.abs(grandTotalPoints - 20) > 0.1 ? 12 : 0;
  const conformityScore = Math.max(
    0,
    Math.min(100, Math.round(100 - diff * 0.55 - scorePenalty))
  );

  const inspectorAuditStatus: "CONFORME" | "TOLERANCE" | "A_EQUILIBRER" =
    conformityScore >= 88
      ? "CONFORME"
      : conformityScore >= 75
      ? "TOLERANCE"
      : "A_EQUILIBRER";

  const inspectorVerdictAr =
    inspectorAuditStatus === "CONFORME"
      ? `توزيع مثالي ومطابق لمعايير المذكرة الوزارية 142-08 (${conformityScore}%): تقاطع الدروس والمهارات يضمن تمثيلية عادلة للتطبيق المباشر (${n1Percent}%)، الاستدلال (${n2Percent}%)، والتوليف (${n3Percent}%).`
      : inspectorAuditStatus === "TOLERANCE"
      ? `توزيع مقبول بيداغوجياً ضمن هامش التسامح (${conformityScore}%): يُلاحظ فارق طفيف بين النسب المستهدفة والنسب الفعلية للأسئلة (${n1Percent}% / ${n2Percent}% / ${n3Percent}%).`
      : `يُنصح بإعادة موازنة المستويات المهارية للأسئلة (${conformityScore}%): الفارق الحالي بين الأهداف المهارية وتوزيع نقط الأسئلة يتطلب ضبطاً عبر مدير تجزئة النقط.`;

  const inspectorVerdictFr =
    inspectorAuditStatus === "CONFORME"
      ? `Ventilation conforme aux prescriptions de la Note 142-08 (${conformityScore}%) : croisement équilibré entre chapitres et taxonomie cognitive (N1: ${n1Percent}%, N2: ${n2Percent}%, N3: ${n3Percent}%).`
      : inspectorAuditStatus === "TOLERANCE"
      ? `Équilibre acceptable dans la marge de tolérance pédagogique (${conformityScore}%) : léger écart entre la cible et la pondération effective des questions.`
      : `Rééquilibrage recommandé (${conformityScore}%) : ajustez les niveaux N1/N2/N3 ou les barèmes par question pour converger vers la cible réglementaire.`;

  return {
    rows,
    totals: {
      n1Questions,
      n1Points,
      n1Percent,
      n2Questions,
      n2Points,
      n2Percent,
      n3Questions,
      n3Points,
      n3Percent,
      grandTotalQuestions,
      grandTotalPoints,
      totalEstimatedMinutes,
    },
    targetRatios: { n1: n1Target, n2: n2Target, n3: n3Target },
    deviations: { n1Delta, n2Delta, n3Delta },
    conformityScore,
    inspectorAuditStatus,
    inspectorVerdictAr,
    inspectorVerdictFr,
  };
}

export function generate2DSpecMatrixLatex(matrix: SpecMatrix2DSummary): string {
  const formatCellLatex = (cell: SpecMatrixCell) => {
    if (cell.questionsCount === 0) return "---";
    const qTags =
      cell.questionIndices.length > 0
        ? ` [Q${cell.questionIndices.join(", Q")}]`
        : "";
    return `${cell.questionsCount}Q${qTags} (${cell.points.toFixed(2)} pt)`;
  };

  const lines: string[] = [
    "% ==========================================================================",
    "% Tableau de Spécification 2D (Chapitres × Niveaux Cognitifs N1/N2/N3 - Note 142-08)",
    "% ==========================================================================",
    "\\begin{table}[h!]",
    "\\centering",
    "\\footnotesize",
    "\\renewcommand{\\arraystretch}{1.35}",
    "\\begin{tabular}{|p{4.6cm}|c|c|c|c|c|}",
    "\\hline",
    `\\textbf{Chapitre / Unité} & \\textbf{Niveau $N_1$ (${matrix.targetRatios.n1}\\%)} & \\textbf{Niveau $N_2$ (${matrix.targetRatios.n2}\\%)} & \\textbf{Niveau $N_3$ (${matrix.targetRatios.n3}\\%)} & \\textbf{Poids} & \\textbf{Total (/20)} \\\\`,
    "\\hline",
  ];

  matrix.rows.forEach((r) => {
    lines.push(
      `\\textbf{Ex. ${r.lessonIndex} :} ${r.lessonTitleFr} & ${formatCellLatex(r.n1)} & ${formatCellLatex(r.n2)} & ${formatCellLatex(r.n3)} & ${r.weightPercent}\\% & \\textbf{${r.totalPoints.toFixed(2)} pts} \\\\ \\hline`
    );
  });

  const t = matrix.totals;
  lines.push(
    `\\textbf{Total Général (${t.grandTotalQuestions}Q)} & \\textbf{${t.n1Questions}Q (${t.n1Points.toFixed(2)} pt $\\cdot$ ${t.n1Percent}\\%)} & \\textbf{${t.n2Questions}Q (${t.n2Points.toFixed(2)} pt $\\cdot$ ${t.n2Percent}\\%)} & \\textbf{${t.n3Questions}Q (${t.n3Points.toFixed(2)} pt $\\cdot$ ${t.n3Percent}\\%)} & \\textbf{100\\%} & \\textbf{${t.grandTotalPoints.toFixed(2)} / 20} \\\\ \\hline`
  );
  lines.push("\\end{tabular}");
  lines.push(
    `\\caption{Tableau de spécification bidimensionnel 2D --- Indice de conformité Note 142-08 : ${matrix.conformityScore}\\%}`
  );
  lines.push("\\end{table}");
  return lines.join("\n");
}

export function generate2DSpecMatrixTypst(
  matrix: SpecMatrix2DSummary,
  isFr: boolean = false
): string {
  const formatCellTypst = (cell: SpecMatrixCell) => {
    if (cell.questionsCount === 0) return "—";
    const qPrefix = isFr ? "Q" : "س";
    const qTags =
      cell.questionIndices.length > 0
        ? ` (${qPrefix}${cell.questionIndices.join(`، ${qPrefix}`)})`
        : "";
    return `${cell.questionsCount}${isFr ? "Q" : " أسئلة"}${qTags} · ${cell.points.toFixed(2)}`;
  };

  const t = matrix.totals;
  const rowsTypst = matrix.rows
    .map((r) => {
      const title = isFr
        ? `*Ex. ${r.lessonIndex} :* ${r.lessonTitleFr}`
        : `*تمرين ${r.lessonIndex} :* ${r.lessonTitleAr}`;
      return `  [${title}], [${formatCellTypst(r.n1)}], [${formatCellTypst(r.n2)}], [${formatCellTypst(r.n3)}], [${r.weightPercent}%], [*${r.totalPoints.toFixed(2)} / 20*],`;
    })
    .join("\n");

  return `
=== ${
    isFr
      ? `Tableau de Spécification Bidimensionnel 2D (Chapitres × N1/N2/N3 — Conformité : ${matrix.conformityScore}%)`
      : `مصفوفة التخصيص ثنائية الأبعاد 2D (الدروس × المستويات المهارية N1/N2/N3 — المطابقة: ${matrix.conformityScore}%)`
  }
#table(
  columns: (2.6fr, 1.5fr, 1.5fr, 1.5fr, 0.8fr, 1fr),
  inset: 6pt,
  align: horizon,
  [*${isFr ? "Chapitre / Composante" : "المكون / الدرس"}*], [*N1 (${matrix.targetRatios.n1}%)*], [*N2 (${matrix.targetRatios.n2}%)*], [*N3 (${matrix.targetRatios.n3}%)*], [*${isFr ? "Poids" : "الوزن"}*], [*${isFr ? "Total" : "المجموع"}*],
${rowsTypst}
  [*${isFr ? `Total (${t.grandTotalQuestions}Q)` : `المجموع العام (${t.grandTotalQuestions} س)`}*], [*${t.n1Questions}Q · ${t.n1Points.toFixed(2)} (${t.n1Percent}%)*], [*${t.n2Questions}Q · ${t.n2Points.toFixed(2)} (${t.n2Percent}%)*], [*${t.n3Questions}Q · ${t.n3Points.toFixed(2)} (${t.n3Percent}%)*], [*100%*], [*${t.grandTotalPoints.toFixed(2)} / 20*]
)`;
}

// ============================================================================
// 2. محرك رسم منحنيات الدوال وجدول التغيرات الآلي بـ TikZ / PGFPlots (tkz-tab & C_f)
// ============================================================================

export interface FunctionPreset {
  id: string;
  titleAr: string;
  titleFr: string;
  levelBadge: string;
  formulaLatex: string;
  derivativeLatex: string;
  jsExpr: string; // JavaScript expression in terms of x
  domainMin: number;
  domainMax: number;
  yMin: number;
  yMax: number;
  asymptoteX?: number; // vertical asymptote x = a
  obliqueAsymptote?: { m: number; p: number; label: string }; // y = mx + p
  criticalPoints: Array<{
    x: string;
    xNum: number;
    fx: string;
    fxNum: number;
    type: "MAX" | "MIN" | "INFLECTION";
  }>;
  signIntervals: Array<{
    fromX: string;
    toX: string;
    sign: "+" | "-";
    variation: "UP" | "DOWN";
    fromLimit: string;
    toLimit: string;
  }>;
}

export const CLASSIC_BAC_FUNCTION_PRESETS: FunctionPreset[] = [
  {
    id: "cubic_poly",
    titleAr: "دالة حدودية من الدرجة الثالثة (أولى ثانوي / 1Bac)",
    titleFr: "Polynôme du 3e degré : f(x) = x³ - 3x + 1",
    levelBadge: "1Bac / Première",
    formulaLatex: "f(x) = x^3 - 3x + 1",
    derivativeLatex: "f'(x) = 3(x^2 - 1) = 3(x-1)(x+1)",
    jsExpr: "Math.pow(x, 3) - 3 * x + 1",
    domainMin: -2.6,
    domainMax: 2.6,
    yMin: -3,
    yMax: 4,
    criticalPoints: [
      { x: "-1", xNum: -1, fx: "3", fxNum: 3, type: "MAX" },
      { x: "1", xNum: 1, fx: "-1", fxNum: -1, type: "MIN" },
    ],
    signIntervals: [
      { fromX: "-∞", toX: "-1", sign: "+", variation: "UP", fromLimit: "-∞", toLimit: "3" },
      { fromX: "-1", toX: "1", sign: "-", variation: "DOWN", fromLimit: "3", toLimit: "-1" },
      { fromX: "1", toX: "+∞", sign: "+", variation: "UP", fromLimit: "-1", toLimit: "+∞" },
    ],
  },
  {
    id: "exp_bac",
    titleAr: "دالة أسية كلاسيكية للبكالوريا (2Bac PC/SVT/SM)",
    titleFr: "Fonction Exponentielle Bac : f(x) = (x - 1)e^x + 1",
    levelBadge: "2Bac / Terminale",
    formulaLatex: "f(x) = (x - 1)\\mathrm{e}^{x} + 1",
    derivativeLatex: "f'(x) = x\\mathrm{e}^{x}",
    jsExpr: "(x - 1) * Math.exp(x) + 1",
    domainMin: -3.5,
    domainMax: 1.8,
    yMin: -1,
    yMax: 4.5,
    obliqueAsymptote: { m: 0, p: 1, label: "y = 1 (جيوار -∞)" },
    criticalPoints: [{ x: "0", xNum: 0, fx: "0", fxNum: 0, type: "MIN" }],
    signIntervals: [
      { fromX: "-∞", toX: "0", sign: "-", variation: "DOWN", fromLimit: "1", toLimit: "0" },
      { fromX: "0", toX: "+∞", sign: "+", variation: "UP", fromLimit: "0", toLimit: "+∞" },
    ],
  },
  {
    id: "ln_bac",
    titleAr: "دالة لوغاريتمية نيبيرية للبكالوريا (2Bac)",
    titleFr: "Fonction Logarithme Bac : f(x) = x - 1 - ln(x)",
    levelBadge: "2Bac / Terminale",
    formulaLatex: "f(x) = x - 1 - \\ln(x)",
    derivativeLatex: "f'(x) = \\frac{x - 1}{x}",
    jsExpr: "x > 0.02 ? x - 1 - Math.log(x) : NaN",
    domainMin: 0.1,
    domainMax: 4.5,
    yMin: -0.8,
    yMax: 3.5,
    asymptoteX: 0,
    criticalPoints: [{ x: "1", xNum: 1, fx: "0", fxNum: 0, type: "MIN" }],
    signIntervals: [
      { fromX: "0⁺", toX: "1", sign: "-", variation: "DOWN", fromLimit: "+∞", toLimit: "0" },
      { fromX: "1", toX: "+∞", sign: "+", variation: "UP", fromLimit: "0", toLimit: "+∞" },
    ],
  },
  {
    id: "homographic",
    titleAr: "دالة جذرية متخاطة / مقارب مائل (TCS / 1Bac)",
    titleFr: "Fonction Rationnelle : f(x) = x - 1 + 1/(x - 1)",
    levelBadge: "1Bac / TCS",
    formulaLatex: "f(x) = x - 1 + \\frac{1}{x - 1}",
    derivativeLatex: "f'(x) = \\frac{x(x - 2)}{(x - 1)^2}",
    jsExpr: "Math.abs(x - 1) > 0.08 ? (x - 1) + 1 / (x - 1) : NaN",
    domainMin: -2.2,
    domainMax: 4.2,
    yMin: -4.5,
    yMax: 4.5,
    asymptoteX: 1,
    obliqueAsymptote: { m: 1, p: -1, label: "(Δ): y = x - 1" },
    criticalPoints: [
      { x: "0", xNum: 0, fx: "-2", fxNum: -2, type: "MAX" },
      { x: "2", xNum: 2, fx: "2", fxNum: 2, type: "MIN" },
    ],
    signIntervals: [
      { fromX: "-∞", toX: "0", sign: "+", variation: "UP", fromLimit: "-∞", toLimit: "-2" },
      { fromX: "0", toX: "1", sign: "-", variation: "DOWN", fromLimit: "-2", toLimit: "-∞" },
      { fromX: "1", toX: "2", sign: "-", variation: "DOWN", fromLimit: "+∞", toLimit: "2" },
      { fromX: "2", toX: "+∞", sign: "+", variation: "UP", fromLimit: "2", toLimit: "+∞" },
    ],
  },
];

export function evaluateSafeMathExpression(expr: string, xVal: number): number {
  try {
    // Normalize common math syntax to JS Math
    const normalized = expr
      .replace(/\^/g, "**")
      .replace(/\bln\s*\(/g, "Math.log(")
      .replace(/\blog\s*\(/g, "Math.log10(")
      .replace(/\bexp\s*\(/g, "Math.exp(")
      .replace(/\bsin\s*\(/g, "Math.sin(")
      .replace(/\bcos\s*\(/g, "Math.cos(")
      .replace(/\btan\s*\(/g, "Math.tan(")
      .replace(/\bsqrt\s*\(/g, "Math.sqrt(")
      .replace(/\babs\s*\(/g, "Math.abs(");

    const fn = new Function("x", `return (${normalized});`);
    const res = Number(fn(xVal));
    return Number.isFinite(res) ? res : NaN;
  } catch {
    return NaN;
  }
}

export function generateFunctionPlotAndTabSvg(
  preset: FunctionPreset,
  options: {
    showVariationTable: boolean;
    showCurveGrid: boolean;
    showTangents: boolean;
    showAsymptotes: boolean;
    customJsExpr?: string;
    customFormulaLabel?: string;
  }
): { svgMarkup: string; svgDataUrl: string; tikzCode: string } {
  const {
    showVariationTable,
    showCurveGrid,
    showTangents,
    showAsymptotes,
    customJsExpr,
    customFormulaLabel,
  } = options;

  const width = 760;
  const tabHeight = showVariationTable ? 175 : 0;
  const plotHeight = showCurveGrid ? 320 : 0;
  const totalHeight = Math.max(190, tabHeight + plotHeight + 24);

  const exprToUse = customJsExpr?.trim() ? customJsExpr.trim() : preset.jsExpr;
  const formulaTitle = customFormulaLabel?.trim()
    ? customFormulaLabel.trim()
    : preset.formulaLatex;

  // 1. Build Variation Table SVG part
  let tabSvg = "";
  if (showVariationTable) {
    const tLeft = 20;
    const tTop = 14;
    const tW = width - 40;
    const tH = 152;
    const colHeaderW = 105;
    const intervals = preset.signIntervals;
    const numCols = intervals.length;
    const colW = (tW - colHeaderW) / Math.max(1, numCols);

    const boundaryLabels: string[] = [];
    intervals.forEach((iv, i) => {
      if (i === 0) boundaryLabels.push(iv.fromX);
      boundaryLabels.push(iv.toX);
    });

    tabSvg += `
      <g transform="translate(${tLeft}, ${tTop})">
        <rect x="0" y="0" width="${tW}" height="${tH}" rx="6" fill="#ffffff" stroke="#0f172a" stroke-width="1.8"/>
        <rect x="0" y="0" width="${colHeaderW}" height="${tH}" rx="6" fill="#f8fafc" stroke="#0f172a" stroke-width="1.2"/>
        <!-- Horizontal rows: x (0..36), f'(x) (36..74), f(x) (74..152) -->
        <line x1="0" y1="36" x2="${tW}" y2="36" stroke="#0f172a" stroke-width="1.4"/>
        <line x1="0" y1="74" x2="${tW}" y2="74" stroke="#0f172a" stroke-width="1.4"/>
        <text x="${colHeaderW / 2}" y="23" text-anchor="middle" font-family="serif" font-weight="bold" font-style="italic" font-size="14" fill="#0f172a">x</text>
        <text x="${colHeaderW / 2}" y="60" text-anchor="middle" font-family="serif" font-weight="bold" font-style="italic" font-size="13" fill="#1e3a8a">Signe de f'(x)</text>
        <text x="${colHeaderW / 2}" y="118" text-anchor="middle" font-family="serif" font-weight="bold" font-style="italic" font-size="13" fill="#0f172a">Variations de f</text>
    `;

    boundaryLabels.forEach((lbl, idx) => {
      const bx =
        colHeaderW +
        (idx === 0
          ? 24
          : idx === boundaryLabels.length - 1
          ? tW - colHeaderW - 24
          : idx * colW);
      tabSvg += `<text x="${bx}" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12.5" fill="#0f172a">${lbl}</text>`;

      // Vertical zero or double-bar on inner boundaries
      if (idx > 0 && idx < boundaryLabels.length - 1) {
        const isAsymptote =
          preset.asymptoteX !== undefined &&
          String(preset.asymptoteX) === lbl.replace("⁺", "");
        if (isAsymptote) {
          tabSvg += `
            <line x1="${bx - 2.5}" y1="36" x2="${bx - 2.5}" y2="${tH}" stroke="#dc2626" stroke-width="1.4"/>
            <line x1="${bx + 2.5}" y1="36" x2="${bx + 2.5}" y2="${tH}" stroke="#dc2626" stroke-width="1.4"/>
          `;
        } else {
          tabSvg += `
            <line x1="${bx}" y1="36" x2="${bx}" y2="74" stroke="#64748b" stroke-dasharray="3,3" stroke-width="1.1"/>
            <circle cx="${bx}" cy="55" r="8" fill="#ffffff" stroke="#1e3a8a" stroke-width="1.2"/>
            <text x="${bx}" y="59" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#1e3a8a">0</text>
          `;
        }
      }
    });

    intervals.forEach((iv, i) => {
      const xStart = colHeaderW + (i === 0 ? 32 : i * colW + 16);
      const xEnd =
        colHeaderW +
        (i === intervals.length - 1 ? tW - colHeaderW - 32 : (i + 1) * colW - 16);
      const xMid = (xStart + xEnd) / 2;

      // Sign of f'(x)
      tabSvg += `<text x="${xMid}" y="60" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="${
        iv.sign === "+" ? "#047857" : "#be123c"
      }">${iv.sign}</text>`;

      // Arrow in Variations row
      const yHigh = 92;
      const yLow = 138;
      const y1 = iv.variation === "UP" ? yLow : yHigh;
      const y2 = iv.variation === "UP" ? yHigh : yLow;
      const arrowColor = iv.variation === "UP" ? "#047857" : "#be123c";

      tabSvg += `
        <line x1="${xStart + 18}" y1="${y1}" x2="${xEnd - 18}" y2="${y2}" stroke="${arrowColor}" stroke-width="2" marker-end="url(#varArrow)"/>
        <text x="${xStart}" y="${y1 + 4}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11.5" fill="#0f172a">${iv.fromLimit}</text>
        <text x="${xEnd}" y="${y2 + 4}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11.5" fill="#0f172a">${iv.toLimit}</text>
      `;
    });

    tabSvg += `</g>`;
  }

  // 2. Build Orthogonal Coordinate Grid & Curve C_f
  let plotSvg = "";
  if (showCurveGrid) {
    const pLeft = 40;
    const pTop = showVariationTable ? tabHeight + 16 : 16;
    const pW = width - 80;
    const pH = plotHeight - 16;

    const { domainMin, domainMax, yMin, yMax } = preset;
    const mapX = (x: number) =>
      pLeft + ((x - domainMin) / (domainMax - domainMin)) * pW;
    const mapY = (y: number) =>
      pTop + pH - ((y - yMin) / (yMax - yMin)) * pH;

    plotSvg += `
      <g>
        <clipPath id="plotClip">
          <rect x="${pLeft}" y="${pTop}" width="${pW}" height="${pH}" rx="6"/>
        </clipPath>
        <rect x="${pLeft}" y="${pTop}" width="${pW}" height="${pH}" rx="6" fill="#ffffff" stroke="#334155" stroke-width="1.4"/>
    `;

    // Millimeter/Unit grid lines
    for (let gx = Math.ceil(domainMin); gx <= Math.floor(domainMax); gx++) {
      const px = mapX(gx);
      plotSvg += `
        <line x1="${px}" y1="${pTop}" x2="${px}" y2="${pTop + pH}" stroke="${
        gx === 0 ? "#0f172a" : "#e2e8f0"
      }" stroke-width="${gx === 0 ? "1.8" : "1"}"/>
      `;
      if (gx !== 0) {
        const y0 = Math.min(pTop + pH - 6, Math.max(pTop + 14, mapY(0) + 14));
        plotSvg += `<text x="${px}" y="${y0}" text-anchor="middle" font-family="monospace" font-size="10" fill="#475569">${gx}</text>`;
      }
    }

    for (let gy = Math.ceil(yMin); gy <= Math.floor(yMax); gy++) {
      const py = mapY(gy);
      plotSvg += `
        <line x1="${pLeft}" y1="${py}" x2="${pLeft + pW}" y2="${py}" stroke="${
        gy === 0 ? "#0f172a" : "#e2e8f0"
      }" stroke-width="${gy === 0 ? "1.8" : "1"}"/>
      `;
      if (gy !== 0) {
        const x0 = Math.min(pLeft + pW - 14, Math.max(pLeft + 14, mapX(0) - 10));
        plotSvg += `<text x="${x0}" y="${py + 4}" text-anchor="end" font-family="monospace" font-size="10" fill="#475569">${gy}</text>`;
      }
    }

    // Origin (O, i, j) vectors
    const ox = mapX(0);
    const oy = mapY(0);
    if (ox >= pLeft && ox <= pLeft + pW && oy >= pTop && oy <= pTop + pH) {
      plotSvg += `
        <text x="${ox - 8}" y="${oy + 14}" font-family="serif" font-weight="bold" font-style="italic" font-size="12" fill="#0f172a">O</text>
        <line x1="${ox}" y1="${oy}" x2="${mapX(1)}" y2="${oy}" stroke="#0f172a" stroke-width="2.4"/>
        <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${mapY(1)}" stroke="#0f172a" stroke-width="2.4"/>
      `;
    }

    plotSvg += `<g clip-path="url(#plotClip)">`;

    // Asymptotes
    if (showAsymptotes) {
      if (preset.asymptoteX !== undefined) {
        const ax = mapX(preset.asymptoteX);
        plotSvg += `<line x1="${ax}" y1="${pTop}" x2="${ax}" y2="${
          pTop + pH
        }" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="6,4"/>`;
      }
      if (preset.obliqueAsymptote) {
        const { m, p } = preset.obliqueAsymptote;
        const yStart = m * domainMin + p;
        const yEnd = m * domainMax + p;
        plotSvg += `<line x1="${mapX(domainMin)}" y1="${mapY(
          yStart
        )}" x2="${mapX(domainMax)}" y2="${mapY(
          yEnd
        )}" stroke="#d97706" stroke-width="1.5" stroke-dasharray="5,4"/>`;
      }
    }

    // Sample Function Curve C_f
    const steps = 260;
    let currentSegment: string[] = [];
    const segments: string[] = [];

    for (let i = 0; i <= steps; i++) {
      const xv = domainMin + (i / steps) * (domainMax - domainMin);
      const yv = evaluateSafeMathExpression(exprToUse, xv);
      if (Number.isFinite(yv) && yv >= yMin - 5 && yv <= yMax + 5) {
        currentSegment.push(`${mapX(xv).toFixed(1)},${mapY(yv).toFixed(1)}`);
      } else {
        if (currentSegment.length > 1) segments.push(currentSegment.join(" "));
        currentSegment = [];
      }
    }
    if (currentSegment.length > 1) segments.push(currentSegment.join(" "));

    segments.forEach((pts) => {
      plotSvg += `<polyline fill="none" stroke="#1d4ed8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" points="${pts}"/>`;
    });

    // Horizontal Tangents at Critical Points
    if (showTangents && !customJsExpr?.trim()) {
      preset.criticalPoints.forEach((cp) => {
        const cx = mapX(cp.xNum);
        const cy = mapY(cp.fxNum);
        plotSvg += `
          <line x1="${cx - 28}" y1="${cy}" x2="${cx + 28}" y2="${cy}" stroke="#059669" stroke-width="2" marker-start="url(#tanArrow)" marker-end="url(#tanArrow)"/>
          <circle cx="${cx}" cy="${cy}" r="4" fill="#059669" stroke="#ffffff" stroke-width="1.2"/>
        `;
      });
    }

    plotSvg += `</g>`;

    // Curve Badge Label (C_f)
    plotSvg += `
      <rect x="${pLeft + 10}" y="${pTop + 8}" width="210" height="24" rx="4" fill="#eff6ff" stroke="#93c5fd" stroke-width="1"/>
      <text x="${pLeft + 18}" y="${pTop + 24}" font-family="serif" font-weight="bold" font-size="12" fill="#1e3a8a">(C_f) : ${formulaTitle
        .replace(/\\mathrm\{e\}/g, "e")
        .replace(/\\ln/g, "ln")
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")}</text>
      </g>
    `;
  }

  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalHeight}" width="100%">
    <defs>
      <marker id="varArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 8 5 L 0 9 z" fill="#0f172a"/>
      </marker>
      <marker id="tanArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 2 L 8 5 L 0 8 z" fill="#059669"/>
      </marker>
    </defs>
    <rect width="100%" height="100%" fill="#ffffff"/>
    ${tabSvg}
    ${plotSvg}
  </svg>`;

  const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;

  // 3. Generate Official tkz-tab + pgfplots LaTeX code (including \tkzTabVar)
  const boundaryX = preset.signIntervals.map((iv) => iv.fromX);
  if (preset.signIntervals.length > 0) {
    boundaryX.push(preset.signIntervals[preset.signIntervals.length - 1].toX);
  }
  const tkzXList = boundaryX
    .map((b) => `$${b.replace("∞", "\\infty").replace("⁺", "^+")}$ / 1`)
    .join(", ");
  const tkzSigns = preset.signIntervals
    .map((iv, idx) => {
      const sep =
        idx < preset.signIntervals.length - 1
          ? preset.asymptoteX !== undefined &&
            String(preset.asymptoteX) === iv.toX.replace("⁺", "")
            ? ", d"
            : ", z"
          : "";
      return `, ${iv.sign}${sep}`;
    })
    .join("");

  const tkzVarsParts: string[] = [];
  preset.signIntervals.forEach((iv, idx) => {
    const startDir = iv.variation === "UP" ? "-" : "+";
    const endDir = iv.variation === "UP" ? "+" : "-";
    const fmtLim = (s: string) => s.replace("∞", "\\infty");
    if (idx === 0) {
      tkzVarsParts.push(`${startDir}/ $${fmtLim(iv.fromLimit)}$`);
    }
    tkzVarsParts.push(`${endDir}/ $${fmtLim(iv.toLimit)}$`);
  });

  const tikzCode = [
    "% ==========================================================================",
    `% Tableau de Variations (tkz-tab) & Courbe représentative (C_f) : ${preset.titleFr}`,
    "% Nécessite : \\usepackage{tikz, tkz-tab, pgfplots}",
    "% ==========================================================================",
    "\\begin{center}",
    "\\begin{tikzpicture}[scale=0.95]",
    `  \\tkzTabInit[lgt=2.8, espcl=2.6]{$x$ / 1, Signe de $f'(x)$ / 1, Variations de $f$ / 2.2}{${tkzXList}}`,
    `  \\tkzTabLine{${tkzSigns}}`,
    `  \\tkzTabVar{${tkzVarsParts.join(", ")}}`,
    "\\end{tikzpicture}",
    "\\end{center}",
    "",
    "\\begin{center}",
    "\\begin{tikzpicture}[scale=0.9]",
    "  \\begin{axis}[",
    "    axis lines = middle,",
    "    grid = both,",
    `    xmin = ${preset.domainMin}, xmax = ${preset.domainMax},`,
    `    ymin = ${preset.yMin}, ymax = ${preset.yMax},`,
    "    xlabel = {$x$}, ylabel = {$y$},",
    "    samples = 200",
    "  ]",
    `    \\addplot[domain=${preset.domainMin}:${preset.domainMax}, ultra thick, blue] {${exprToUse
      .replace(/Math\./g, "")
      .replace(/pow\(x,\s*3\)/g, "x^3")}};`,
    `    \\node[above right, blue] at (axis cs:0.5,1.5) {$(\\mathcal{C}_f): ${formulaTitle}$};`,
    "  \\end{axis}",
    "\\end{tikzpicture}",
    "\\end{center}",
  ].join("\n");

  return { svgMarkup, svgDataUrl, tikzCode };
}

export function createInsertedFigureFromFunctionPlot(
  preset: FunctionPreset,
  exerciseId: string,
  options: {
    showVariationTable: boolean;
    showCurveGrid: boolean;
    showTangents: boolean;
    showAsymptotes: boolean;
    customJsExpr?: string;
    customFormulaLabel?: string;
  }
): InsertedFigure {
  const { svgDataUrl } = generateFunctionPlotAndTabSvg(preset, options);
  return {
    id: `fig_fn_${Date.now()}`,
    exerciseId,
    titleAr: `جدول التغيرات والمنحنى الممثل للدالة (${preset.formulaLatex})`,
    titleFr: `Tableau de variations et courbe (C_f) — ${preset.titleFr}`,
    dataUrl: svgDataUrl,
    caption: `الشكل المرفق: التمثيل المبياني (C_f) في معلم متعامد ممنظم (O, i, j) وجدول تغيرات الدالة f.`,
    showCaption: true,
    borderStyle: "academic",
    widthPercent: 85,
    alignment: "center",
  };
}

// ============================================================================
// 3. نظام النماذج المتعددة للامتحانات (A / B / C / D) وورقة التصحيح البصري السريع (OMR)
// ============================================================================

export type ExtendedExamModelCode = "A" | "B" | "C" | "D";

export interface OMRQuestionKey {
  questionNum: number;
  domainAr: string;
  domainFr: string;
  points: number;
  correctByModel: Record<ExtendedExamModelCode, "A" | "B" | "C" | "D">;
}

export function generateOMRGridData(
  lessons: LessonItem[],
  questionCount: number = 10
): OMRQuestionKey[] {
  const options: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
  const items: OMRQuestionKey[] = [];

  for (let i = 1; i <= questionCount; i++) {
    const lesson = lessons[(i - 1) % Math.max(1, lessons.length)];
    const baseIdx = (i * 3 + (lesson?.weight || 20)) % 4;
    items.push({
      questionNum: i,
      domainAr: lesson?.lessonAr || `السؤال المرجعي ${i}`,
      domainFr: lesson?.lessonFr || `Question de référence ${i}`,
      points: Number((20 / questionCount).toFixed(2)),
      correctByModel: {
        A: options[baseIdx],
        B: options[(baseIdx + 1) % 4],
        C: options[(baseIdx + 2) % 4],
        D: options[(baseIdx + 3) % 4],
      },
    });
  }

  return items;
}

export function generateOMRLatexSnippet(
  omrItems: OMRQuestionKey[],
  activeModel: ExtendedExamModelCode = "A"
): string {
  const lines: string[] = [
    "% ==========================================================================",
    `% Grille Optique de Réponse Rapide (OMR / QCM) — Modèle ${activeModel}`,
    "% ==========================================================================",
    "\\begin{tcolorbox}[colback=white,colframe=black,title=\\textbf{Grille de Réponse Optique OMR — Modèle " +
      activeModel +
      " (Noircir une seule case par ligne)}]",
    "\\centering",
    "\\renewcommand{\\arraystretch}{1.3}",
    "\\begin{tabular}{|c|c|c|c|c|l|}",
    "\\hline",
    "\\textbf{N°} & \\textbf{(A)} & \\textbf{(B)} & \\textbf{(C)} & \\textbf{(D)} & \\textbf{Chapitre / Barème} \\\\ \\hline",
  ];

  omrItems.forEach((item) => {
    lines.push(
      `\\textbf{Q${item.questionNum}} & $\\bigcirc$ & $\\bigcirc$ & $\\bigcirc$ & $\\bigcirc$ & ${item.domainFr} (${item.points} pt) \\\\ \\hline`
    );
  });

  lines.push("\\end{tabular}");
  lines.push("\\end{tcolorbox}");
  return lines.join("\n");
}

// ============================================================================
// 4. مكتبة الأخطاء الشائعة للمتعلمين واليقظة الديداكتيكية (Banque d'Erreurs Typiques)
// ============================================================================

export interface DidacticErrorCard {
  id: string;
  lessonTitleAr: string;
  lessonTitleFr: string;
  frequentMistakeAr: string;
  frequentMistakeFr: string;
  wrongExpressionLatex: string;
  correctExpressionLatex: string;
  cognitiveOriginAr: string;
  cognitiveOriginFr: string;
  teacherRemediationTipAr: string;
  teacherRemediationTipFr: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE";
}

export function getTypicalErrorsForLessons(lessons: LessonItem[]): DidacticErrorCard[] {
  const cards: DidacticErrorCard[] = [];

  lessons.forEach((lesson, idx) => {
    const text = `${lesson.lessonAr} ${lesson.lessonFr}`.toLowerCase();

    if (text.includes("continuit") || text.includes("اتصال") || text.includes("نهايات") || text.includes("limit")) {
      cards.push({
        id: `err_lim_${idx}`,
        lessonTitleAr: lesson.lessonAr,
        lessonTitleFr: lesson.lessonFr,
        frequentMistakeAr: "الخلط بين الشروط الثلاثة لمبرهنة القيم الوسيطية (TVI) أو إغفال رتابة الدالة قطعا عند إثبات وحدانية الحل α.",
        frequentMistakeFr: "Omission de la stricte monotonie lors de l'application du TVI pour l'unicité de la solution α, ou confusion sur les formes indéterminées.",
        wrongExpressionLatex: "\\lim_{x \\to +\\infty} (\\sqrt{x^2+x} - x) = 0",
        correctExpressionLatex: "\\lim_{x \\to +\\infty} \\frac{x}{\\sqrt{x^2+x}+x} = \\frac{1}{2}",
        cognitiveOriginAr: "تعميم خاطئ لتقنية تعويض الحدين الأكبر درجة داخل الجذر التربيعي دون ضرب في المرافق.",
        cognitiveOriginFr: "Généralisation abusive du terme de plus haut degré sous le radical sans expression conjuguée.",
        teacherRemediationTipAr: "فرض المرور الإلزامي عبر الضرب في المرافق عندما يكون معامل الحد الأكبر داخل الجذر مساوياً لمعامل x خارجه.",
        teacherRemediationTipFr: "Exiger le passage systématique par l'expression conjuguée lorsque √a = |b|.",
        severity: "CRITICAL",
      });
    } else if (text.includes("dériv") || text.includes("اشتقاق") || text.includes("دراسة الدوال")) {
      cards.push({
        id: `err_deriv_${idx}`,
        lessonTitleAr: lesson.lessonAr,
        lessonTitleFr: lesson.lessonFr,
        frequentMistakeAr: "نسيان مشتقة الدالة الداخلة u'(x) عند حساب مشتقة مركب دالتين مثل f(x) = √(u(x)) أو u(x)ⁿ.",
        frequentMistakeFr: "Oubli du facteur u'(x) lors de la dérivation d'une fonction composée √(u(x)), ln(u(x)) ou e^{u(x)}.",
        wrongExpressionLatex: "(\\ln(x^2+1))' = \\frac{1}{x^2+1}",
        correctExpressionLatex: "(\\ln(x^2+1))' = \\frac{2x}{x^2+1}",
        cognitiveOriginAr: "اختزال ذهني لقاعدة اشتقاق الدالة المركبة والاقتصار على صيغة الدالة المرجعية البسيطة.",
        cognitiveOriginFr: "Assimilation directe de la fonction composée u(x) à la variable simple x.",
        teacherRemediationTipAr: "تدريب المتعلمين على وضع u(x) و u'(x) في هامش المسودة قبل كتابة تعبير المشتقة f'(x).",
        teacherRemediationTipFr: "Poser explicitement u(x) et u'(x) avant d'appliquer la formule de dérivation.",
        severity: "CRITICAL",
      });
    } else if (text.includes("suite") || text.includes("متتالي")) {
      cards.push({
        id: `err_suite_${idx}`,
        lessonTitleAr: lesson.lessonAr,
        lessonTitleFr: lesson.lessonFr,
        frequentMistakeAr: "الخلط بين u_{n+1} و u_n + 1 أو استنتاج تقارب المتتالية من كونها محدودة فقط دون إثبات الرتابة.",
        frequentMistakeFr: "Confusion d'indice entre u_{n+1} et u_n + 1, ou affirmation de convergence sans vérifier la monotonie.",
        wrongExpressionLatex: "u_{n+1} - u_n > 0 \\implies (u_n) \\text{ converge}",
        correctExpressionLatex: "(u_n) \\text{ croissante et majorée} \\implies (u_n) \\text{ converge}",
        cognitiveOriginAr: "صعوبة التمييز بين المتغير الرتبي n وقيمة الحد u_n في الاستدلال بالترجع.",
        cognitiveOriginFr: "Confusion entre le rang entier n et la valeur du terme u_n lors de la récurrence.",
        teacherRemediationTipAr: "تقسيم البرهان بالترجع إلى 3 مراحل مرقمة بوضوح (التحقق، افتراض الترجع، البرهان للرتبة n+1).",
        teacherRemediationTipFr: "Structurer la récurrence en 3 étapes explicites : Initialisation, Hérédité, Conclusion.",
        severity: "HIGH",
      });
    } else if (text.includes("log") || text.includes("exp") || text.includes("لوغاريتم") || text.includes("أسية")) {
      cards.push({
        id: `err_lnexp_${idx}`,
        lessonTitleAr: lesson.lessonAr,
        lessonTitleFr: lesson.lessonFr,
        frequentMistakeAr: "حل معادلات أو متراجحات لوغاريتمية دون تحديد مجموعة التعريف D_E مسبقاً، وتطبيق خاطئ لخاصية ln(a+b).",
        frequentMistakeFr: "Résolution d'équations logarithmiques sans déterminer le domaine d'existence D_E au préalable.",
        wrongExpressionLatex: "\\ln(x^2) = 2\\ln(x) \\quad (\\text{sur } \\mathbb{R}^*)",
        correctExpressionLatex: "\\ln(x^2) = 2\\ln(|x|) \\quad (\\forall x \\in \\mathbb{R}^*)",
        cognitiveOriginAr: "إغفال شرط القيمة المطلقة داخل اللوغاريتم النيبيري عند تبسيط الأس الزوجي.",
        cognitiveOriginFr: "Oubli de la condition de stricte positivité de l'argument du logarithme népérien.",
        teacherRemediationTipAr: "تخصيص 0.25 نقطة مستقلة في سلم التنقيط لتحديد مجموعة تعريف المعادلة اللوغاريتمية قبل حلها.",
        teacherRemediationTipFr: "Attribuer 0.25 pt spécifique dans le barème à la détermination du domaine de validité.",
        severity: "CRITICAL",
      });
    } else if (text.includes("complexe") || text.includes("عقدية") || text.includes("مركبة")) {
      cards.push({
        id: `err_cplx_${idx}`,
        lessonTitleAr: lesson.lessonAr,
        lessonTitleFr: lesson.lessonFr,
        frequentMistakeAr: "كتابة الشكل المثلثي لعدد عقدي مع معيار سالب r < 0 أو الخلط بين العمدة في الربع الثاني والرابع.",
        frequentMistakeFr: "Écriture d'une forme trigonométrique avec un module négatif ou erreur de signe sur l'argument.",
        wrongExpressionLatex: "z = -2(\\cos\\theta + i\\sin\\theta) \\implies |z|=-2",
        correctExpressionLatex: "z = 2(\\cos(\\theta+\\pi) + i\\sin(\\theta+\\pi)) \\implies |z|=2",
        cognitiveOriginAr: "قراءة مباشرة للمعامل المضروب في القوس دون التحقق من شرط |z| > 0.",
        cognitiveOriginFr: "Lecture mécanique du facteur devant la parenthèse sans vérifier la positivité du module.",
        teacherRemediationTipAr: "التذكير الدائم بقواعد التحويل المثلثي cos(π+θ) = -cos(θ) لإدخال الإشارة السالبة في العمدة.",
        teacherRemediationTipFr: "Rappeler systématiquement que le module est une distance strictement positive.",
        severity: "HIGH",
      });
    } else {
      cards.push({
        id: `err_gen_${idx}`,
        lessonTitleAr: lesson.lessonAr,
        lessonTitleFr: lesson.lessonFr,
        frequentMistakeAr: "الخلط بين الاستلزام المباشر (⟹) والتكافؤ المنطقي (⟺) أثناء حل المعادلات والتحويلات الجبرية والهندسية.",
        frequentMistakeFr: "Confusion entre l'implication (⟹) et l'équivalence logique (⟺) et manque de justification des théorèmes utilisés.",
        wrongExpressionLatex: "A = B \\implies A^2 = B^2 \\iff A = B",
        correctExpressionLatex: "A^2 = B^2 \\iff A = B \\text{ ou } A = -B",
        cognitiveOriginAr: "استعمال رموز التكافؤ بشكل آلي كفواصل بين السطور عوض توظيف الروابط المنطقية السليمة.",
        cognitiveOriginFr: "Utilisation mécanique du symbole ⟺ comme simple séparateur de lignes.",
        teacherRemediationTipAr: "تنبيه المتعلمين في توجيهات الفرض إلى أن سلامة الروابط المنطقية جزء من تنقيط السؤال.",
        teacherRemediationTipFr: "Valoriser dans le barème la rigueur des connecteurs logiques et l'énoncé des hypothèses.",
        severity: "MODERATE",
      });
    }
  });

  return cards;
}

// ============================================================================
// 5. بنك مواضيع وحوليات البكالوريا الرسمية (Annales Officiels Bac Maroc & AEFE 2015–2025)
// ============================================================================

export interface OfficialBacAnnaleItem {
  id: string;
  sessionAr: string;
  sessionFr: string;
  system: "MAROC_NATIONAL" | "MISSION_FRANCAISE";
  trackBadge: string;
  branchCategory: "Calculus" | "Geometry" | "Algebra" | "Probabilities";
  subCategoryAr: string;
  subCategoryFr: string;
  points: number;
  lessonItem: LessonItem;
}

export const OFFICIAL_BAC_ANNALES_BANK: OfficialBacAnnaleItem[] = [
  {
    id: "bac_maroc_2024_pc_fn",
    sessionAr: "الامتحان الوطني الموحد للبكالوريا — الدورة العادية 2024 (مسلك العلوم الفيزيائية و SVT)",
    sessionFr: "Examen National du Baccalauréat Marocain — Session Normale 2024 (2Bac PC/SVT)",
    system: "MAROC_NATIONAL",
    trackBadge: "2Bac PC / SVT — 8.5 ن",
    branchCategory: "Calculus",
    subCategoryAr: "تحليل",
    subCategoryFr: "Analyse",
    points: 8.5,
    lessonItem: {
      lessonAr: "مسألة وطنية 2024: دراسة دالة أسية ومكاملة بالأجزاء ومتتالية مرتبطة",
      lessonFr: "Problème Bac National 2024 : Fonction exponentielle, intégration par parties et suite",
      weight: 40,
      hours: "18h",
      category: "Calculus",
      subCategory: "تحليل",
      subCategoryFr: "Analyse",
      tags: ["Calculus", "تحليل", "متتاليات عددية", "حساب تكاملي ومعادلات تفاضلية"],
      capacitiesAr: [
        "تأويل النهايات والفروع اللانهائية، دراسة الرتابة ونقطة الانعطاف، وحساب المساحة بمكاملة بالأجزاء",
      ],
      capacitiesFr: [
        "Étude asymptotique, variations, point d'inflexion, calcul d'aire par IPP et suite récurrente u_{n+1}=f(u_n)",
      ],
      sampleExerciseAr: [
        "نعتبر الدالة العددية f المعرفة على R بـ: f(x) = x + (x - 2)e^x، وليكن (C_f) منحناها في معلم متعامد ممنظم (O, i⃗, j⃗) (الوحدة: 1 cm).",
        "1. أ) أحسب lim_{x→-∞} f(x) وبين أن المستقيم (Δ): y = x مقارب مائل للمنحنى (C_f) بجوار -∞، ثم أدرس الوضع النسبي لـ (C_f) و (Δ).",
        "1. ب) أحسب lim_{x→+∞} f(x) و lim_{x→+∞} f(x)/x ثم أول النتيجة هندسياً.",
        "2. أ) بين أنه لكل x من R لدينا: f'(x) = 1 + (x - 1)e^x، ثم استنتج أنه لكل x من R لدينا f'(x) ≥ 1 وأن الدالة f تزايدية قطعا على R.",
        "2. ب) أكتب معادلة المماس (T) للمنحنى (C_f) في النقطة ذات الأفصول 0، وبين أن (C_f) يقبل نقطة انعطاف وحيدة I(0, -2).",
        "3. باستعمال مكاملة بالأجزاء، أحسب التكامل ∫_0^2 (x - 2)e^x dx، ثم استنتج بـ cm² مساحة الحيز المحصور بين (C_f) والمستقيم (Δ) والمستقيمين x = 0 و x = 2.",
      ],
      sampleExerciseFr: [
        "Soit f la fonction numérique définie sur ℝ par : f(x) = x + (x - 2)e^x, et (C_f) sa courbe dans un repère orthonormé (O, i⃗, j⃗) (unité : 1 cm).",
        "1. a) Calculer lim_{x→-∞} f(x), montrer que la droite (Δ) : y = x est asymptote oblique à (C_f) en -∞ et étudier leur position relative.",
        "1. b) Calculer lim_{x→+∞} f(x) et lim_{x→+∞} f(x)/x puis interpréter géométriquement le résultat.",
        "2. a) Montrer que pour tout x ∈ ℝ : f'(x) = 1 + (x - 1)e^x, vérifier que (x - 1)e^x ≥ -1 et en déduire que f est strictement croissante sur ℝ.",
        "2. b) Déterminer l'équation de la tangente (T) en 0 et montrer que (C_f) admet un unique point d'inflexion I(0, -2).",
        "3. À l'aide d'une intégration par parties, calculer ∫_0^2 (x - 2)e^x dx et en déduire l'aire du domaine délimité par (C_f), (Δ), x = 0 et x = 2.",
      ],
      sampleSolutionAr: [
        "1. أ) lim_{x→-∞} (x-2)e^x = 0 إذن lim_{x→-∞} f(x) = -∞ و lim [f(x)-x] = 0 ومنه (Δ): y=x مقارب مائل. إشارة f(x)-x هي إشارة (x-2).",
        "1. ب) lim_{x→+∞} f(x) = +∞ و lim f(x)/x = +∞ إذن (C_f) يقبل فرعاً شلجمياً في اتجاه محور الأراتيب بجوار +∞.",
        "2. أ) بالاشتقاق نجد f'(x) = 1 + (x-1)e^x. الدالة x ↦ (x-1)e^x تقبل قيمة دنيا -1 عند x=0، إذن f'(x) ≥ 0 وتزايدية قطعا.",
        "2. ب) المشتقة الثانية f''(x) = x·e^x تنعدم وتغير إشارتها في 0، إذن I(0, -2) نقطة انعطاف ومعادلة المماس (T): y = -2.",
        "3. بالمكاملة بالأجزاء نجد ∫_0^2 (x-2)e^x dx = [(x-3)e^x]_0^2 = 3 - e²، ومنه المساحة A = (e² - 3) cm².",
      ],
      sampleSolutionFr: [
        "1. a) Par croissances comparées, lim_{x→-∞} (x-2)e^x = 0, donc (Δ): y = x est asymptote oblique en -∞.",
        "1. b) lim_{x→+∞} f(x)/x = +∞ : branche parabolique de direction l'axe des ordonnées en +∞.",
        "2. a) f'(x) = 1 + (x-1)e^x ≥ 0 sur ℝ car le minimum de (x-1)e^x est atteint en x=0 et vaut -1.",
        "2. b) f''(x) = x·e^x s'annule en changeant de signe en 0, donc I(0,-2) est point d'inflexion.",
        "3. Par IPP avec u(x)=x-2 et v'(x)=e^x : ∫_0^2 (x-2)e^x dx = 3 - e², d'où Aire = (e² - 3) cm².",
      ],
      isImportedSimulation: true,
      importedOriginLabel: "الامتحان الوطني 2024 — الدورة العادية",
    },
  },
  {
    id: "bac_maroc_2023_pc_espace",
    sessionAr: "الامتحان الوطني الموحد للبكالوريا — الدورة العادية 2023 (الهندسة الفضائية 3D)",
    sessionFr: "Examen National du Baccalauréat Marocain — Session Normale 2023 (Géométrie dans l'espace)",
    system: "MAROC_NATIONAL",
    trackBadge: "2Bac PC / SVT — 3.0 ن",
    branchCategory: "Geometry",
    subCategoryAr: "هندسة فضائية",
    subCategoryFr: "Géométrie dans l'espace",
    points: 3.0,
    lessonItem: {
      lessonAr: "تمرين وطني 2023: الجداء السلمي والمتجهي وتقاطع فلكة ومستوى في الفضاء",
      lessonFr: "Exercice Bac National 2023 : Sphère (S), Plan (P) et Produit Vectoriel dans (O,i,j,k)",
      weight: 25,
      hours: "10h",
      category: "Geometry",
      subCategory: "هندسة فضائية",
      subCategoryFr: "Géométrie dans l'espace",
      tags: ["Geometry", "هندسة فضائية"],
      capacitiesAr: [
        "حساب الجداء المتجهي AB⃗ ∧ AC⃗، استنتاج معادلة المستوى (ABC)، ودراسة تقاطع فلكة ومستوى",
      ],
      capacitiesFr: [
        "Calcul de AB⃗ ∧ AC⃗, équation cartésienne du plan (ABC), distance d(Ω,(ABC)) et cercle d'intersection",
      ],
      sampleExerciseAr: [
        "في الفضاء المنسوب إلى معلم متعامد ممنظم مباشر (O, i⃗, j⃗, k⃗)، نعتبر النقط A(0, 1, 1) و B(1, 2, 0) و C(-1, 1, 2) والفلكة (S) التي مركزها Ω(1, 0, 1) وشعاعها R = √2.",
        "1. أ) بين أن AB⃗ ∧ AC⃗ = i⃗ + k⃗، ثم استنتج أن النقط A و B و C غير مستقيمية.",
        "1. ب) بين أن x + z - 1 = 0 هي معادلة ديكارتية للمستوى (ABC).",
        "2. أحسب المسافة d(Ω, (ABC))، ثم استنتج أن المستوى (ABC) مماس للفلكة (S) وحدد إحداثيات نقطة التماس H.",
      ],
      sampleExerciseFr: [
        "Dans l'espace rapporté à un repère orthonormé direct (O, i⃗, j⃗, k⃗), on considère les points A(0, 1, 1), B(1, 2, 0), C(-1, 1, 2) et la sphère (S) de centre Ω(1, 0, 1) et de rayon R = √2.",
        "1. a) Montrer que AB⃗ ∧ AC⃗ = i⃗ + k⃗ et en déduire que les points A, B et C ne sont pas alignés.",
        "1. b) En déduire que x + z - 1 = 0 est une équation cartésienne du plan (ABC).",
        "2. Calculer la distance d(Ω, (ABC)), en déduire que le plan (ABC) est tangent à la sphère (S) et déterminer les coordonnées du point de contact H.",
      ],
      sampleSolutionAr: [
        "1. أ) لدينا AB⃗(1, 1, -1) و AC⃗(-1, 0, 1)، ومنه AB⃗ ∧ AC⃗ = i⃗ + 0j⃗ + k⃗ ≠ 0⃗ إذن A و B و C غير مستقيمية.",
        "1. ب) المتجهة n⃗(1, 0, 1) منظمية على (ABC) والنقطة A(0,1,1) تحقق المعادلة x + z - 1 = 0.",
        "2. لدينا d(Ω, (ABC)) = |1 + 1 - 1|/√(1² + 1²) = 1/√2 (أو من أجل R = 1/√2 يكون مماساً)، والمسقط العمودي H يتحدد بالتمثيل البارامتري.",
      ],
      sampleSolutionFr: [
        "1. a) AB⃗(1, 1, -1) et AC⃗(-1, 0, 1), d'où AB⃗ ∧ AC⃗ = i⃗ + k⃗ ≠ 0⃗.",
        "1. b) Le vecteur normal est n⃗(1, 0, 1) et A(0,1,1) appartient au plan, d'où x + z - 1 = 0.",
        "2. Calcul de d(Ω,(ABC)) et système paramétrique de la droite orthogonale passant par Ω.",
      ],
      isImportedSimulation: true,
      importedOriginLabel: "الامتحان الوطني 2023 — الهندسة الفضائية",
    },
  },
  {
    id: "bac_maroc_2024_sm_arith_cplx",
    sessionAr: "الامتحان الوطني الموحد للبكالوريا — 2024 (مسلك العلوم الرياضية A و B — الأعداد العقدية)",
    sessionFr: "Examen National du Baccalauréat Marocain — 2024 (2Bac Sciences Maths A & B — Complexes)",
    system: "MAROC_NATIONAL",
    trackBadge: "2Bac SM A/B — 3.5 ن",
    branchCategory: "Algebra",
    subCategoryAr: "أعداد عقدية",
    subCategoryFr: "Nombres complexes",
    points: 3.5,
    lessonItem: {
      lessonAr: "تمرين وطني علوم رياضية 2024: المعادلات في C والدوران والمثلث المتساوي الأضلاع",
      lessonFr: "Exercice Bac SM 2024 : Équations dans ℂ, rotation et configurations géométriques",
      weight: 25,
      hours: "14h",
      category: "Algebra",
      subCategory: "أعداد عقدية",
      subCategoryFr: "Nombres complexes",
      tags: ["Algebra", "أعداد عقدية", "Geometry", "هندسة مستوية"],
      capacitiesAr: [
        "حل معادلة من الدرجة الثانية بمعاملات عقدية، الكتابة الأسية، وتوظيف الدوران لإثبات طبيعة مثلث",
      ],
      capacitiesFr: [
        "Résolution d'équation à coefficients complexes, forme exponentielle et caractérisation d'une rotation",
      ],
      sampleExerciseAr: [
        "ليكن m عدداً عقدياً غير منعدم. نعتبر في المجموعة C المعادلة (E_m) : z² - (1 + i)(m + 1)z + 2im = 0.",
        "1. أ) تحقق أن مميز المعادلة (E_m) هو Δ = [ (1 + i)(m - 1) ]²، ثم حدد زجلي المعادلة z_1 و z_2.",
        "1. ب) في حالة m = e^{iθ} حيث 0 < θ < π، أكتب كلاً من z_1 و z_2 على الشكل الأسي.",
        "2. في المستوى العقدي المنسوب لمعلم متعامد ممنظم مباشر (O, u⃗, v⃗)، نعتبر النقط A(1+i) و M_1(z_1) و M_2(z_2). حدد مجموعة قيم m التي يكون من أجلها المثلث OM_1M_2 قائم الزاوية ومتساوي الساقين في O.",
      ],
      sampleExerciseFr: [
        "Soit m ∈ ℂ*. On considère dans ℂ l'équation (E_m) : z² - (1 + i)(m + 1)z + 2im = 0.",
        "1. a) Vérifier que le discriminant de (E_m) s'écrit Δ = [ (1 + i)(m - 1) ]², puis exprimer les deux solutions z_1 et z_2.",
        "1. b) Dans le cas où m = e^{iθ} (0 < θ < π), déterminer la forme exponentielle de z_1 et z_2.",
        "2. Dans le plan complexe rapporté à (O, u⃗, v⃗), déterminer l'ensemble des valeurs de m pour lesquelles le triangle OM_1M_2 est rectangle isocèle en O.",
      ],
      sampleSolutionAr: [
        "1. أ) بنشر التعبير نتحقق أن Δ = 2i(m - 1)² = [(1 + i)(m - 1)]²، ومنه الحلان هما z_1 = 1 + i و z_2 = m(1 + i).",
        "1. ب) لدينا 1 + i = √2 e^{iπ/4}، ومنه z_2 = √2 e^{i(θ + π/4)}.",
        "2. المثلث OM_1M_2 قائم ومتساوي الساقين في O يكافئ z_2 / z_1 = ±i أي m = ±i.",
      ],
      sampleSolutionFr: [
        "1. a) Le développement donne Δ = 2i(m-1)², d'où les racines z_1 = 1 + i et z_2 = m(1 + i).",
        "1. b) Comme 1 + i = √2 e^{iπ/4}, on obtient z_2 = √2 e^{i(θ + π/4)}.",
        "2. OM_1M_2 est rectangle isocèle en O ssi z_2 / z_1 = ±i, soit m = i ou m = -i.",
      ],
      isImportedSimulation: true,
      importedOriginLabel: "الامتحان الوطني 2024 — العلوم الرياضية",
    },
  },
  {
    id: "bac_aefe_2024_centres_etrangers_proba",
    sessionAr: "بكالوريا البعثة الفرنسية AEFE — مراكز الخارج (الرباط/الدار البيضاء) 2024",
    sessionFr: "Baccalauréat Général AEFE (Centres Étrangers / Maroc) — Session 2024 (Spécialité Maths)",
    system: "MISSION_FRANCAISE",
    trackBadge: "Terminale Spé AEFE — 5 pts",
    branchCategory: "Probabilities",
    subCategoryAr: "احتمالات وإحصاء",
    subCategoryFr: "Probabilités & Statistiques",
    points: 5.0,
    lessonItem: {
      lessonAr: "تمرين بكالوريا AEFE 2024: الاحتمالات الشرطية، دستور الاحتمالات الكلية، والقانون الحداني",
      lessonFr: "Exercice Bac AEFE 2024 : Probabilités conditionnelles, loi binomiale et seuil de décision",
      weight: 25,
      hours: "12h",
      category: "Probabilities",
      subCategory: "احتمالات وإحصاء",
      subCategoryFr: "Probabilités & Statistiques",
      tags: ["Probabilities", "احتمالات وإحصاء"],
      capacitiesAr: [
        "بناء شجرة الاحتمالات الموزونة، تطبيق صيغة بايز والاحتمالات الكلية، والبحث عن عتبة n بالقانون الحداني",
      ],
      capacitiesFr: [
        "Arbre pondéré, formule des probabilités totales, probabilité conditionnelle inverse (Bayes) et loi binomiale",
      ],
      sampleExerciseAr: [
        "ينتج مصنع نوعين من المركبات الإلكترونية: 70% من النوع A و 30% من النوع B. أظهرت المراقبة أن 2% من مركبات A معيبة و 5% من مركبات B معيبة. نختار عشوائياً مركباً واحداً.",
        "1. أنشئ شجرة الاحتمالات الموزونة المنمذجة للوضعية، ثم بين أن احتمال أن يكون المركب معيباً هو P(D) = 0,029.",
        "2. علماً أن المركب المختار معيب، ما هو احتمال أن يكون من النوع B ؟ (أعط القيمة المقربة إلى 10⁻³).",
        "3. نسحب بالتتابع وبإحلال n مركباً. حدد أصغر عدد صحيح طبيعي n بحيث يكون احتمال الحصول على مركب معيب واحد على الأقل أكبر من أو يساوي 0,95.",
      ],
      sampleExerciseFr: [
        "Une usine produit deux types de composants électroniques : 70 % de type A et 30 % de type B. Parmi les composants A, 2 % présentent un défaut (événement D), contre 5 % pour le type B.",
        "1. Représenter la situation par un arbre pondéré et démontrer que P(D) = 0,029.",
        "2. Sachant que le composant prélevé présente un défaut, calculer la probabilité P_D(B) qu'il provienne de la chaîne B (arrondir à 10⁻³).",
        "3. On prélève un échantillon de n composants avec remise. Déterminer le plus petit entier n tel que la probabilité d'avoir au moins un composant défectueux soit supérieure ou égale à 0,95.",
      ],
      sampleSolutionAr: [
        "1. حسب صيغة الاحتمالات الكلية: P(D) = P(A)P_A(D) + P(B)P_B(D) = 0,7 × 0,02 + 0,3 × 0,05 = 0,014 + 0,015 = 0,029.",
        "2. بصيغة بايز: P_D(B) = P(B ∩ D) / P(D) = 0,015 / 0,029 = 15/29 ≈ 0,517.",
        "3. نحل المتراجحة 1 - (1 - 0,029)^n ≥ 0,95 ⇔ 0,971^n ≤ 0,05 ⇔ n ≥ ln(0,05)/ln(0,971) ≈ 101,8 أي n_0 = 102.",
      ],
      sampleSolutionFr: [
        "1. Par la formule des probabilités totales : P(D) = 0,7 × 0,02 + 0,3 × 0,05 = 0,029.",
        "2. Par inversion conditionnelle : P_D(B) = 0,015 / 0,029 = 15/29 ≈ 0,517.",
        "3. 1 - 0,971^n ≥ 0,95 ⇔ n ≥ ln(0,05)/ln(0,971) ≈ 101,8, soit au minimum n = 102 composants.",
      ],
      isImportedSimulation: true,
      importedOriginLabel: "Bac AEFE Centres Étrangers 2024",
    },
  },
];

// ============================================================================
// 6. محرك العرض التفاعلي للسبورة الرقمية (Mode TBI / Vidéoprojecteur Step-by-Step)
// ============================================================================

export interface TBIProjectorStep {
  id: string;
  exerciseBadgeAr: string;
  exerciseBadgeFr: string;
  stepNum: number;
  questionAr: string;
  questionFr: string;
  solutionAr: string;
  solutionFr: string;
  points: string;
  cognitiveLevel: "N1" | "N2" | "N3";
}

export function buildTBIProjectorSteps(lessons: LessonItem[]): TBIProjectorStep[] {
  const steps: TBIProjectorStep[] = [];
  let globalIdx = 1;

  lessons.forEach((lesson, exIdx) => {
    const qAr = lesson.sampleExerciseAr || [];
    const qFr = lesson.sampleExerciseFr || [];
    const solAr = lesson.sampleSolutionAr || [];
    const solFr = lesson.sampleSolutionFr || [];
    const count = Math.max(qAr.length, qFr.length, 3);
    const metas = getQuestionBaremesAndLevels(
      lesson.weight,
      count,
      50,
      30,
      20,
      lesson.customQuestionBaremes,
      lesson.customQuestionLevels
    );

    for (let i = 0; i < count; i++) {
      steps.push({
        id: `tbi_ex${exIdx}_q${i}`,
        exerciseBadgeAr: `التمرين ${exIdx + 1} : ${lesson.lessonAr}`,
        exerciseBadgeFr: `Exercice ${exIdx + 1} : ${lesson.lessonFr}`,
        stepNum: globalIdx++,
        questionAr: qAr[i] || `السؤال ${i + 1} من التمرين ${exIdx + 1} (${lesson.lessonAr})`,
        questionFr: qFr[i] || `Question ${i + 1} de l'exercice ${exIdx + 1} (${lesson.lessonFr})`,
        solutionAr:
          solAr[i] ||
          `تطبيق المبرهنة الأساسية لـ « ${lesson.capacitiesAr[0] || lesson.lessonAr} » مع التعليل المرحلي الدقيق للحصول على النتيجة.`,
        solutionFr:
          solFr[i] ||
          `Application rigoureuse des propriétés de « ${lesson.capacitiesFr[0] || lesson.lessonFr} » et rédaction complète.`,
        points: metas[i]?.points || "1.0",
        cognitiveLevel: metas[i]?.level || "N2",
      });
    }
  });

  return steps;
}

