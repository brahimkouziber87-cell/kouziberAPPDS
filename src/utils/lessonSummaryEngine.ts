/**
 * المرحلة 3 و 5 من خارطة الطريق الاستراتيجية:
 * 1) محرك استوديو ملخصات الدروس المستقل (Dedicated Lesson Summary Studio) بـ 3 قوالب رسمية:
 *    - CHEAT_SHEET_1PAGE: بطاقة المراجعة المكثفة في صفحة واحدة
 *    - METHOD_SHEETS_HOWTO: بطاقات الطرائق المنهجية للامتحان ("كيف أبرهن على...؟") + الأخطاء الـ 5 الشائعة
 *    - MIND_MAP_BIOF_LEXICON: الخريطة الذهنية البصرية SVG + معجم التناوب اللغوي BIOF (AR ↔ FR)
 * 2) معالج حقيبة الدرس التربوية المتكاملة بضغطة واحدة (1-Click Complete Unit Dossier 5-in-1)
 */

import {
  LessonItem,
  TrackData,
  getVariantQuestions,
  getQuestionBaremesAndLevels,
} from "../data/curriculum";
import {
  generateFullMoroccanPedagogicalFiche,
  FullPedagogicalFiche,
  FichePedagogicalFormat,
} from "./ficheGenerator";
import {
  getMoroccanLessonMemo,
  generateCustomCountSerieExercises,
} from "./seriesGenerator";
import {
  decomposeQuestionIntoSubQuestions,
  SubQuestionItem,
} from "./dsSupervisedExamEnhancements";

export type LessonSummaryTemplateType =
  | "CHEAT_SHEET_1PAGE"
  | "METHOD_SHEETS_HOWTO"
  | "MIND_MAP_BIOF_LEXICON";

export interface MethodHowToCard {
  id: string;
  examQuestionPromptAr: string;
  examQuestionPromptFr: string;
  methodStepsAr: string[];
  methodStepsFr: string[];
  keyFormulaLatex: string;
  miniSolvedExampleAr: string;
  miniSolvedExampleFr: string;
  difficultyBadge: "N1" | "N2" | "N3";
}

export interface BiofLexiconTerm {
  termAr: string;
  termFr: string;
  mathSymbolLatex: string;
  categoryAr: string;
}

export interface StandaloneLessonSummaryDocument {
  lessonId: string;
  lessonTitleAr: string;
  lessonTitleFr: string;
  trackCode: string;
  trackLabelAr: string;
  templateType: LessonSummaryTemplateType;
  coreDefinitions: Array<{
    titleAr: string;
    titleFr: string;
    statementAr: string;
    statementFr: string;
    formulaLatex: string;
  }>;
  methodHowToCards: MethodHowToCard[];
  topFivePitfallsAr: string[];
  topFivePitfallsFr: string[];
  biofLexicon: BiofLexiconTerm[];
  mindMapSvgMarkup: string;
  inspectorRevisionTipAr: string;
  inspectorRevisionTipFr: string;
}

export interface CompletePedagogicalUnitDossier {
  dossierId: string;
  generatedAtIso: string;
  trackCode: string;
  trackLabelAr: string;
  lessonId: string;
  lessonTitleAr: string;
  lessonTitleFr: string;
  components: {
    "1_pedagogicalFicheOp2007": FullPedagogicalFiche;
    "2_visualLessonSummary": StandaloneLessonSummaryDocument;
    "3_differentiatedSeriesTD": {
      totalExercises: number;
      tiersSummaryAr: string[];
      exercises: ReturnType<typeof generateCustomCountSerieExercises>;
    };
    "4_parameterizedHomeworkDM": {
      groupsCount: number;
      antiPlagiarismGroups: Array<{
        groupCode: "A" | "B" | "C" | "D";
        parameterAlpha: number;
        parameterBeta: number;
        customizedQuestionsAr: string[];
        customizedQuestionsFr: string[];
        scaffoldingHintsAr: string[];
      }>;
      rubric20PtsAr: Array<{ criterionAr: string; points: number }>;
    };
    "5_supervisedExamSectionDS": {
      totalPoints: number;
      mainQuestionsCount: number;
      decomposedSubQuestionsCount: number;
      questionsWithSubQuestions: Array<{
        questionIndex: number;
        parentPoints: number;
        subQuestionsAr: SubQuestionItem[];
        subQuestionsFr: SubQuestionItem[];
      }>;
    };
  };
}

/**
 * توليد خريطة ذهنية شعاعية SVG نظيفة ومؤمنة لروابط مفاهيم الدرس
 */
export function buildLessonConceptMindMapSvg(lesson: LessonItem): string {
  const centerTitle = (lesson.lessonAr || "الدرس الرياضي").slice(0, 28);
  const centerSub = (lesson.lessonFr || "Chapitre").slice(0, 32);
  const cap0 = (lesson.capacitiesAr[0] || "المفهوم الأساسي والتعريف").slice(0, 34);
  const cap1 = (lesson.capacitiesAr[1] || "الخاصيات والمبرهنات").slice(0, 34);
  const cap2 = (lesson.capacitiesAr[2] || "الطرائق الحسابية والبرهان").slice(0, 34);
  const cap3 = (lesson.capacitiesAr[3] || "التأويل الهندسي والنمذجة").slice(0, 34);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 320" width="100%" height="100%">
  <defs>
    <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="752" height="312" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
  <!-- خطوط الربط الشعاعية -->
  <path d="M 380 160 C 290 160, 250 75, 195 75" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="5,3" />
  <path d="M 380 160 C 470 160, 510 75, 565 75" fill="none" stroke="#0d9488" stroke-width="2.5" stroke-dasharray="5,3" />
  <path d="M 380 160 C 290 160, 250 245, 195 245" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="5,3" />
  <path d="M 380 160 C 470 160, 510 245, 565 245" fill="none" stroke="#d97706" stroke-width="2.5" stroke-dasharray="5,3" />
  <!-- العقدة الفرعية 1 -->
  <rect x="20" y="42" width="185" height="66" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.8" />
  <text x="112" y="66" text-anchor="middle" font-family="Cairo, sans-serif" font-size="11" font-weight="700" fill="#1e40af">1. البناء المفاهيمي (N1)</text>
  <text x="112" y="88" text-anchor="middle" font-family="Cairo, sans-serif" font-size="10" fill="#1e293b">${cap0}</text>
  <!-- العقدة الفرعية 2 -->
  <rect x="555" y="42" width="185" height="66" rx="10" fill="#f0fdfa" stroke="#14b8a6" stroke-width="1.8" />
  <text x="647" y="66" text-anchor="middle" font-family="Cairo, sans-serif" font-size="11" font-weight="700" fill="#0f766e">2. المبرهنات والقواعد (N2)</text>
  <text x="647" y="88" text-anchor="middle" font-family="Cairo, sans-serif" font-size="10" fill="#1e293b">${cap1}</text>
  <!-- العقدة الفرعية 3 -->
  <rect x="20" y="212" width="185" height="66" rx="10" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="1.8" />
  <text x="112" y="236" text-anchor="middle" font-family="Cairo, sans-serif" font-size="11" font-weight="700" fill="#5b21b6">3. الطرائق الإجرائية (N2)</text>
  <text x="112" y="258" text-anchor="middle" font-family="Cairo, sans-serif" font-size="10" fill="#1e293b">${cap2}</text>
  <!-- العقدة الفرعية 4 -->
  <rect x="555" y="212" width="185" height="66" rx="10" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.8" />
  <text x="647" y="236" text-anchor="middle" font-family="Cairo, sans-serif" font-size="11" font-weight="700" fill="#b45309">4. التأويل والتوليف (N3)</text>
  <text x="647" y="258" text-anchor="middle" font-family="Cairo, sans-serif" font-size="10" fill="#1e293b">${cap3}</text>
  <!-- النواة المركزية للدرس -->
  <rect x="255" y="118" width="250" height="84" rx="16" fill="url(#centerGrad)" stroke="#93c5fd" stroke-width="2.2" />
  <text x="380" y="152" text-anchor="middle" font-family="Cairo, sans-serif" font-size="13" font-weight="800" fill="#ffffff">${centerTitle}</text>
  <text x="380" y="176" text-anchor="middle" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#bfdbfe">${centerSub}</text>
</svg>`;
}

/**
 * توليد ملخص درس مستقل متكامل وفق القوالب الثلاثة المعتمدة
 */
export function generateStandaloneLessonSummary(
  lesson: LessonItem,
  track: TrackData,
  templateType: LessonSummaryTemplateType = "CHEAT_SHEET_1PAGE"
): StandaloneLessonSummaryDocument {
  const fiche = generateFullMoroccanPedagogicalFiche(lesson, track);
  const memo = getMoroccanLessonMemo(lesson);
  const section0 = fiche.fullCourseContent[0];

  const coreDefinitions = [
    ...(section0?.definitions || []).map((d) => ({
      titleAr: d.termAr,
      titleFr: d.termFr,
      statementAr: d.contentAr,
      statementFr: d.contentFr,
      formulaLatex: d.notationMath || "f(x) = y",
    })),
    ...(section0?.theorems || []).map((t) => ({
      titleAr: t.nameAr,
      titleFr: t.nameFr,
      statementAr: t.statementAr,
      statementFr: t.statementFr,
      formulaLatex: fiche.officialFormulasSummary[0]?.latex || "\\forall x \\in I",
    })),
  ];

  const cap0Ar = lesson.capacitiesAr[0] || lesson.lessonAr;
  const cap1Ar = lesson.capacitiesAr[1] || cap0Ar;
  const cap2Ar = lesson.capacitiesAr[2] || cap1Ar;
  const cap0Fr = lesson.capacitiesFr[0] || lesson.lessonFr;
  const cap1Fr = lesson.capacitiesFr[1] || cap0Fr;
  const cap2Fr = lesson.capacitiesFr[2] || cap1Fr;

  const methodHowToCards: MethodHowToCard[] = [
    {
      id: "method_1",
      examQuestionPromptAr: `كيف أتعامل مع سؤال: « ${cap0Ar} »؟`,
      examQuestionPromptFr: `Comment traiter une question sur : « ${cap0Fr} » ?`,
      methodStepsAr: [
        "1. تحديد مجموعة التعريف أو حيز الصلاحية بدقة قبل أي تحويل جبري.",
        `2. استحضار التعريف الرسمي أو الصيغة المرجعية المرتبطة بـ « ${cap0Ar} ».`,
        "3. إنجاز التعويض والحساب المرحلي مع تبسيط النتيجة النهائية وتأطيرها.",
      ],
      methodStepsFr: [
        "1. Préciser le domaine de définition ou de validité avant tout calcul.",
        `2. Énoncer la définition ou formule de référence relative à « ${cap0Fr} ».`,
        "3. Effectuer le calcul étape par étape et encadrer le résultat irréductible.",
      ],
      keyFormulaLatex: fiche.officialFormulasSummary[0]?.latex || "\\lim_{x\\to x_0} f(x) = f(x_0)",
      miniSolvedExampleAr:
        section0?.solvedExamples?.[0]?.statementAr.split("\n")[0] ||
        `مثال مباشر حول « ${cap0Ar} » مع تعليل جميع المراحل.`,
      miniSolvedExampleFr:
        section0?.solvedExamples?.[0]?.statementFr.split("\n")[0] ||
        `Exemple direct sur « ${cap0Fr} » avec justification complète.`,
      difficultyBadge: "N1",
    },
    {
      id: "method_2",
      examQuestionPromptAr: `كيف أبرهن على خاصية أو علاقة مرتبطة بـ « ${cap1Ar} »؟`,
      examQuestionPromptFr: `Comment démontrer une propriété liée à « ${cap1Fr} » ?`,
      methodStepsAr: [
        "1. التحقق الصريح من كافة الشروط القبلية للمبرهنة (الاتصال، الاشتقاق، الأولية...).",
        `2. تطبيق الخاصية المميزة لـ « ${cap1Ar} » بترتيب منطقي سليم.`,
        "3. صياغة الاستنتاج الرياضي بلغة سليمة مطابقة للإطار المرجعي.",
      ],
      methodStepsFr: [
        "1. Vérifier explicitement toutes les hypothèses du théorème.",
        `2. Appliquer la propriété caractéristique de « ${cap1Fr} ».`,
        "3. Conclure rigoureusement selon les exigences du cadre de référence.",
      ],
      keyFormulaLatex:
        fiche.officialFormulasSummary[1]?.latex ||
        fiche.officialFormulasSummary[0]?.latex ||
        "f'(x) = 0 \\iff x = x_0",
      miniSolvedExampleAr:
        section0?.solvedExamples?.[0]?.solutionStepsAr?.[0] ||
        `تطبيق منهجي لخاصيات « ${cap1Ar} ».`,
      miniSolvedExampleFr:
        section0?.solvedExamples?.[0]?.solutionStepsFr?.[0] ||
        `Application méthodique de « ${cap1Fr} ».`,
      difficultyBadge: "N2",
    },
    {
      id: "method_3",
      examQuestionPromptAr: `كيف أستنتج التأويل الهندسي أو الحل التوليفي في « ${cap2Ar} »؟`,
      examQuestionPromptFr: `Comment déduire l'interprétation ou la synthèse sur « ${cap2Fr} » ?`,
      methodStepsAr: [
        "1. الربط المباشر بين النتيجة الحسابية للسؤال السابق والمدلول الهندسي/التحليلي.",
        `2. ترجمة المعادلة أو النهاية أو المعيار إلى عنصر هندسي (مماس، مقارب، دورة، مجموعة نقط).`,
        "3. التحقق من التناسق البياني أو العددي للنتيجة المستنتجة.",
      ],
      methodStepsFr: [
        "1. Relier directement le résultat algébrique précédent à son sens géométrique.",
        `2. Traduire la relation analytique en objet géométrique (tangente, asymptote, lieu).`,
        "3. Contrôler la cohérence graphique ou numérique.",
      ],
      keyFormulaLatex:
        fiche.officialFormulasSummary[2]?.latex ||
        "y = f'(x_0)(x - x_0) + f(x_0)",
      miniSolvedExampleAr: `استنتاج هندسي وتوليفي مباشر من نتائج « ${cap2Ar} ».`,
      miniSolvedExampleFr: `Déduction géométrique et synthétique sur « ${cap2Fr} ».`,
      difficultyBadge: "N3",
    },
  ];

  const rawPitfallsAr = [
    ...(memo.commonPitfallsAr || []),
    ...(section0?.commonMistakesAr || []),
    `إغفال التحقق من شروط المبرهنة قبل تطبيقها في أسئلة « ${cap0Ar} ».`,
    "الخلط بين الاستلزام المباشر (⇒) والتكافؤ المنطقي (⇔) أثناء حل المعادلات.",
    "نسيان كتابة الوحدة أو التأويل الهندسي الكامل بعد الوصول للنتيجة العددية.",
  ];
  const rawPitfallsFr = [
    ...(memo.commonPitfallsFr || []),
    ...(section0?.commonMistakesFr || []),
    `Oublier de vérifier les hypothèses avant d'appliquer le théorème sur « ${cap0Fr} ».`,
    "Confondre implication (⇒) et équivalence logique (⇔) dans les résolutions.",
    "Omettre l'interprétation géométrique ou l'unité d'aire/volume en conclusion.",
  ];

  const topFivePitfallsAr = Array.from(new Set(rawPitfallsAr)).slice(0, 5);
  const topFivePitfallsFr = Array.from(new Set(rawPitfallsFr)).slice(0, 5);

  const biofLexicon: BiofLexiconTerm[] = [
    {
      termAr: "مجموعة التعريف / حيز الصلاحية",
      termFr: "Domaine de définition / de validité",
      mathSymbolLatex: "D_f = \\{x \\in \\mathbb{R} \\mid f(x) \\in \\mathbb{R}\\}",
      categoryAr: "أساسيات التحليل",
    },
    {
      termAr: "رتيبة قطعا (تزايدية / تناقصية)",
      termFr: "Strictement monotone (croissante / décroissante)",
      mathSymbolLatex: "\\forall (a,b)\\in I^2,\\; a < b \\implies f(a) < f(b)",
      categoryAr: "دراسة الدوال",
    },
    {
      termAr: "الاستدلال بالترجع / بالخلف",
      termFr: "Raisonnement par récurrence / par l'absurde",
      mathSymbolLatex: "\\mathcal{P}(n) \\implies \\mathcal{P}(n+1)",
      categoryAr: "المنطق والبرهان",
    },
    {
      termAr: "معلم متعامد ممنظم مباشر",
      termFr: "Repère orthonormé direct (R.O.N.D)",
      mathSymbolLatex: "(O; \\vec{i}, \\vec{j}, \\vec{k})",
      categoryAr: "الهندسة التحليلية",
    },
    {
      termAr: "القدرة المنتظرة: " + cap0Ar.slice(0, 32),
      termFr: "Capacité attendue : " + cap0Fr.slice(0, 36),
      mathSymbolLatex: fiche.officialFormulasSummary[0]?.latex || "f(x)",
      categoryAr: "خاص بالدرس",
    },
  ];

  const lessonSlug = (lesson.lessonFr || lesson.lessonAr)
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return {
    lessonId: lessonSlug,
    lessonTitleAr: lesson.lessonAr,
    lessonTitleFr: lesson.lessonFr,
    trackCode: track.code,
    trackLabelAr: track.labelAr,
    templateType,
    coreDefinitions,
    methodHowToCards,
    topFivePitfallsAr,
    topFivePitfallsFr,
    biofLexicon,
    mindMapSvgMarkup: buildLessonConceptMindMapSvg(lesson),
    inspectorRevisionTipAr: memo.inspectorAdviceAr,
    inspectorRevisionTipFr: memo.inspectorAdviceFr,
  };
}

/**
 * المرحلة 5 من خارطة الطريق:
 * بناء حقيبة الدرس التربوية المتكاملة (5 وثائق مترابطة في ملف واحد: الجذاذة + الملخص + السلسلة + الفرض المنزلي + الفرض المحروس)
 */
export function buildCompletePedagogicalUnitDossier(params: {
  lesson: LessonItem;
  track: TrackData;
  ficheFormat?: FichePedagogicalFormat;
  summaryTemplate?: LessonSummaryTemplateType;
}): CompletePedagogicalUnitDossier {
  const {
    lesson,
    track,
    ficheFormat = "COURSE_BUILD",
    summaryTemplate = "CHEAT_SHEET_1PAGE",
  } = params;

  // 1. الجذاذة التربوية الكاملة OP 2007 v2
  const fiche = generateFullMoroccanPedagogicalFiche(lesson, track, ficheFormat);

  // 2. ملخص الدرس المستقل مع الخريطة الذهنية ومعجم BIOF
  const summary = generateStandaloneLessonSummary(lesson, track, summaryTemplate);

  // 3. سلسلة التمارين المتدرجة (3-Tier Differentiated Series)
  const seriesExercises = generateCustomCountSerieExercises([lesson], 6, "A");

  // 4. الفرض المنزلي المفرد بـ 4 مجموعات مضادة للغش (Groups A, B, C, D)
  const baseVariant = getVariantQuestions(lesson, "A", false, 0, "STANDARD");
  const groups: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
  const antiPlagiarismGroups = groups.map((groupCode, idx) => {
    const alpha = idx + 2;
    const beta = (idx + 1) * 3;
    const variantQs = getVariantQuestions(lesson, groupCode, false, idx + 1, "STANDARD");
    return {
      groupCode,
      parameterAlpha: alpha,
      parameterBeta: beta,
      customizedQuestionsAr: variantQs.questionsAr.map(
        (q, qIdx) => `[الفوج ${groupCode} · معامل (${alpha},${beta})] س${qIdx + 1}: ${q}`
      ),
      customizedQuestionsFr: variantQs.questionsFr.map(
        (q, qIdx) => `[Groupe ${groupCode} · Param (${alpha},${beta})] Q${qIdx + 1}: ${q}`
      ),
      scaffoldingHintsAr: [
        `إرشاد منهجي 1 (دون إعطاء الجواب): ابدأ بتحديد شروط الصلاحية وتوظيف خاصية « ${lesson.capacitiesAr[0] || lesson.lessonAr} » من أجل المعامل α = ${alpha}.`,
        `إرشاد منهجي 2: استثمر نتيجة السؤال الأول لاستنتاج العلاقة المرتبطة بـ β = ${beta}.`,
      ],
    };
  });

  // 5. فقرة الفرض المحروس المفككة إلى أسئلة فرعية (أ، ب، ج / a, b, c) بدقة 0.25 نقطة
  const qMetas = getQuestionBaremesAndLevels(
    100,
    baseVariant.questionsAr.length,
    30,
    50,
    20,
    lesson.customQuestionBaremes,
    lesson.customQuestionLevels
  );

  let decomposedSubQuestionsCount = 0;
  const questionsWithSubQuestions = baseVariant.questionsAr.map((qAr, idx) => {
    const qFr = baseVariant.questionsFr[idx] || qAr;
    const meta = qMetas[idx] || { points: 1.5, level: "N2" as const };
    const parentPts = Number(meta.points) || 1.5;

    const decomp = decomposeQuestionIntoSubQuestions({
      questionAr: qAr,
      questionFr: qFr,
      parentPoints: parentPts,
      parentLevel: meta.level,
      mode: "STRUCTURED_ABC_ALL",
      questionIndex: idx,
      lessonTitleAr: lesson.lessonAr,
      lessonTitleFr: lesson.lessonFr,
    });

    decomposedSubQuestionsCount += decomp.subQuestions.length;
    return {
      questionIndex: idx + 1,
      parentPoints: parentPts,
      subQuestionsAr: decomp.subQuestions,
      subQuestionsFr: decomp.subQuestions,
    };
  });

  const lessonSlug = (lesson.lessonFr || lesson.lessonAr)
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return {
    dossierId: `UNIT-DOSSIER-${track.code}-${lessonSlug}`,
    generatedAtIso: new Date().toISOString(),
    trackCode: track.code,
    trackLabelAr: track.labelAr,
    lessonId: lessonSlug,
    lessonTitleAr: lesson.lessonAr,
    lessonTitleFr: lesson.lessonFr,
    components: {
      "1_pedagogicalFicheOp2007": fiche,
      "2_visualLessonSummary": summary,
      "3_differentiatedSeriesTD": {
        totalExercises: seriesExercises.length,
        tiersSummaryAr: [
          "المستوى I (تطبيق مباشر N1 — تثبيت القواعد داخل القسم · 15 د)",
          "المستوى II (تعمق واستدلال N2 — تمارين نموذجية · 25 د)",
          "المستوى III (توليف وتميز N3/N4 — مسائل وتحدي · 35 د)",
        ],
        exercises: seriesExercises,
      },
      "4_parameterizedHomeworkDM": {
        groupsCount: antiPlagiarismGroups.length,
        antiPlagiarismGroups,
        rubric20PtsAr: [
          { criterionAr: "مجهود البحث الفردي وتوظيف السقالات المنهجية", points: 4 },
          { criterionAr: "سلامة الاستدلال المنطقي والبرهان الرياضي", points: 10 },
          { criterionAr: "الدقة الحسابية والتمثيل المبياني/الهندسي", points: 4 },
          { criterionAr: "جودة التحرير الرياضي وتنظيم الورقة المزدوجة", points: 2 },
        ],
      },
      "5_supervisedExamSectionDS": {
        totalPoints: Number(
          questionsWithSubQuestions.reduce((acc, q) => acc + q.parentPoints, 0).toFixed(2)
        ),
        mainQuestionsCount: questionsWithSubQuestions.length,
        decomposedSubQuestionsCount,
        questionsWithSubQuestions,
      },
    },
  };
}
