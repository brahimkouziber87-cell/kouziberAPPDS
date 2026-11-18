/**
 * مكتبة قوالب وهياكل الطباعة للوثائق الرياضية
 * Predefined Print Layout Templates Library for High School Mathematics
 * 
 * يتيح للأستاذ التبديل بين هياكل طباعية متعددة تتجاوز النمط القياسي،
 * ملبية احتياجات الفروض الرسمية، التوفير الاقتصادي للورق، ورشات العمل، والمسارات الفارقية.
 */

import {
  detectAutoLessonHeaderIconId,
  LessonHeaderIconId,
  LessonItem,
  resolveLessonHeaderIcon,
} from "../data/curriculum";

export type PrintLayoutTemplateId =
  | "STANDARD_ACADEMIC"        // النمط الأكاديمي القياسي للوزارة
  | "DUAL_COLUMN_COMPACT"       // نمط العمودين المكثف (توفير الورق بنسبة 35%+)
  | "OFFICIAL_EXAM_BORDERED"    // نمط الامتحان الوطني الرسمي المؤطر مع خانة المترشح
  | "PEDAGOGICAL_WORKSHOP_CARDS"// نمط ورشات العمل والأعمال الموجهة مع شارات القدرات
  | "DIFFERENTIATED_TIER_SPLIT" // نمط المسارات الفارقية المتمايزة (الأساس والتحدي)
  | "WORKBOOK_ANSWER_ZONES"     // نمط الدفتر الامتحاني مع حيز الإجابة وشبكة التنقيط
  | "MINIMALIST_AEFE_MODERN";   // النمط العصري لمؤسسات البعثة الفرنسية AEFE

export type PrintLayoutCategory =
  | "ALL"
  | "OFFICIAL"
  | "COMPACT"
  | "PEDAGOGICAL"
  | "WORKBOOK";

export interface PrintLayoutTemplate {
  id: PrintLayoutTemplateId;
  labelAr: string;
  labelFr: string;
  shortBadgeAr: string;
  shortBadgeFr: string;
  category: "OFFICIAL" | "COMPACT" | "PEDAGOGICAL" | "WORKBOOK";
  descriptionAr: string;
  descriptionFr: string;
  bestForAr: string;
  bestForFr: string;
  columnsCount: 1 | 2;
  paperSavingsPercent: number;
  hasOfficialBorder: boolean;
  hasStudentIdBox: boolean;
  hasDifferentiatedSplit: boolean;
  hasAnswerWorkspaceProminent: boolean;
  hasAccentRibbon: boolean;
  accentColor: string;
  containerClass: string;
  exerciseCardClass: string;
  exerciseHeaderClass: string;
  latexEquivalentPreamble: string;
}

export const PRINT_LAYOUT_TEMPLATES: PrintLayoutTemplate[] = [
  {
    id: "STANDARD_ACADEMIC",
    labelAr: "النمط الأكاديمي القياسي (المنهاج الوطني)",
    labelFr: "Standard Académique National (A4)",
    shortBadgeAr: "أكاديمي قياسي · عمود واحد متوازن",
    shortBadgeFr: "Standard 1 Colonne",
    category: "OFFICIAL",
    descriptionAr:
      "الهيكل الأكاديمي التقليدي المعتمد في المذكرة الوزارية 142-08: ترويسة وزارية كلاسيكية متوازنة، عمود واحد عريض، وفواصل أنيقة بين التمارين وسلم التنقيط.",
    descriptionFr:
      "Structure académique traditionnelle conforme à la note ministérielle 142-08 : en-tête institutionnel, colonne unique aérée et barème soigné.",
    bestForAr: "الفروض المحروسة الدورية، سلاسل التمارين النموذجية، والمذكرات البيداغوجية.",
    bestForFr: "Devoirs surveillés réguliers, fiches d'exercices classiques et polycopiés.",
    columnsCount: 1,
    paperSavingsPercent: 0,
    hasOfficialBorder: false,
    hasStudentIdBox: true,
    hasDifferentiatedSplit: false,
    hasAnswerWorkspaceProminent: false,
    hasAccentRibbon: false,
    accentColor: "indigo",
    containerClass: "max-w-4xl mx-auto space-y-6",
    exerciseCardClass: "bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3",
    exerciseHeaderClass: "border-b border-slate-200 pb-2 text-indigo-950 font-bold",
    latexEquivalentPreamble: "\\usepackage{geometry}\\geometry{a4paper,margin=1.5cm}",
  },
  {
    id: "DUAL_COLUMN_COMPACT",
    labelAr: "نمط العمودين المكثف (المباريات وتوفير الورق)",
    labelFr: "Deux Colonnes Haute Densité (Économique & Concours)",
    shortBadgeAr: "عمودان · توفير حتى 40% من الورق",
    shortBadgeFr: "2 Colonnes Concours (-40%)",
    category: "COMPACT",
    descriptionAr:
      "توزيع التمارين والأسئلة على عمودين متوازيين مع خط فاصل رأسي دقيق. يستثمر 92% من المساحة المطبوعة، مما يقلل عدد الصفحات بنسبة تصل إلى 40% عند الاستنساخ المكثف.",
    descriptionFr:
      "Disposition en 2 colonnes équilibrées avec séparateur vertical. Idéal pour les épreuves de concours, olympiades et économie massive de papier (-40%).",
    bestForAr: "مباريات التميز، الأولمبيادات المدرسية، سلاسل التمارين المكثفة، والاستنساخ المدرسي بميزانية محدودة.",
    bestForFr: "Préparation concours, olympiades, TD intensifs et tirages en grand nombre.",
    columnsCount: 2,
    paperSavingsPercent: 40,
    hasOfficialBorder: false,
    hasStudentIdBox: false,
    hasDifferentiatedSplit: false,
    hasAnswerWorkspaceProminent: false,
    hasAccentRibbon: false,
    accentColor: "emerald",
    containerClass: "max-w-5xl mx-auto space-y-4",
    exerciseCardClass: "bg-slate-50/60 rounded-lg border border-slate-200/90 p-3 space-y-2 mb-3 break-inside-avoid shadow-none",
    exerciseHeaderClass: "bg-emerald-950 text-emerald-100 px-2.5 py-1 rounded text-xs font-bold flex justify-between items-center",
    latexEquivalentPreamble: "\\usepackage{multicol}\\setlength{\\columnsep}{18pt}\\setlength{\\columnseprule}{0.4pt}",
  },
  {
    id: "OFFICIAL_EXAM_BORDERED",
    labelAr: "نمط الامتحان الوطني الرسمي المؤطر (Cadre Examen)",
    labelFr: "Format Cadre Officiel Ministère (Examen National)",
    shortBadgeAr: "إطار وزاري مضاعف · شبكة تنقيط رسمية",
    shortBadgeFr: "Cadre Officiel Ministère",
    category: "OFFICIAL",
    descriptionAr:
      "تصميم رسمي يحيط الورقة بإطار وزاري مضاعف، متضمناً خانة تعريف المترشح برقم الامتحان والبارود، شريط الإرشادات الصارمة، وعموداً جانبياً مخصصاً لتنقيط المصحح.",
    descriptionFr:
      "Encadrement officiel avec cartouche d'identification du candidat (n° anonymat, note/20, appréciation), consignes ministérielles et marge de correction.",
    bestForAr: "الامتحان التجريبي الموحد (البكالوريا البيضاء)، فروز المراقبة الموحدة، والامتحانات الإشهادية.",
    bestForFr: "Bacs blancs, devoirs communs de niveau et examens standardisés.",
    columnsCount: 1,
    paperSavingsPercent: 5,
    hasOfficialBorder: true,
    hasStudentIdBox: true,
    hasDifferentiatedSplit: false,
    hasAnswerWorkspaceProminent: false,
    hasAccentRibbon: false,
    accentColor: "slate",
    containerClass: "max-w-4xl mx-auto border-4 border-double border-slate-900 p-5 bg-white space-y-6 shadow-sm",
    exerciseCardClass: "border-2 border-slate-900 rounded-lg p-4 bg-white space-y-3",
    exerciseHeaderClass: "bg-slate-900 text-white px-3 py-1.5 -mx-4 -mt-4 mb-3 rounded-t text-xs font-black flex justify-between",
    latexEquivalentPreamble: "\\usepackage{fancybox}\\cornersize*{10pt}\\usepackage{framed}",
  },
  {
    id: "PEDAGOGICAL_WORKSHOP_CARDS",
    labelAr: "نمط ورشات العمل والأعمال الموجهة (Cartes TD)",
    labelFr: "Fiche Atelier & Travaux Dirigés (Cartes Didactiques)",
    shortBadgeAr: "بطاقات ورشات · شارات القدرات والصعوبة",
    shortBadgeFr: "Cartes Atelier Didactique",
    category: "PEDAGOGICAL",
    descriptionAr:
      "هيكلة تفاعلية تقدم كل تمرين داخل بطاقة بيداغوجية مستقلة مسبوقة بالهدف التعليمي، شارات القدرات المستهدفة (تطبيق مباشر، تركيب، برهان)، ومستوى الصعوبة بالنجوم.",
    descriptionFr:
      "Structure en cartes interactives : objectifs d'apprentissage en bandeau, étiquettes de compétences ciblées et étoiles de difficulté.",
    bestForAr: "حصص الدعم والمعالجة المركزة، أنشطة التعلم النشط، العمل في مجموعات صغيرة، وأوراق العمل المنزلية.",
    bestForFr: "Séances de remédiation, travaux de groupes, apprentissage actif et différenciation.",
    columnsCount: 1,
    paperSavingsPercent: 10,
    hasOfficialBorder: false,
    hasStudentIdBox: false,
    hasDifferentiatedSplit: false,
    hasAnswerWorkspaceProminent: false,
    hasAccentRibbon: true,
    accentColor: "purple",
    containerClass: "max-w-4xl mx-auto space-y-5",
    exerciseCardClass: "bg-gradient-to-br from-white to-purple-50/30 rounded-2xl border-2 border-purple-200 p-4 shadow-xs space-y-3",
    exerciseHeaderClass: "bg-purple-900 text-purple-100 px-3.5 py-1.5 rounded-xl font-bold flex justify-between items-center text-xs",
    latexEquivalentPreamble: "\\usepackage[most]{tcolorbox}\\tcbuselibrary{skins,theorems}",
  },
  {
    id: "DIFFERENTIATED_TIER_SPLIT",
    labelAr: "نمط المسارات الفارقية المتمايزة (الأساس والتحدي)",
    labelFr: "Parcours Pédagogique Différencié (Socle & Défi)",
    shortBadgeAr: "مساران متمايزان · تمكن وتفوق",
    shortBadgeFr: "Différencié (Socle & Défi)",
    category: "PEDAGOGICAL",
    descriptionAr:
      "يقسم ورقة العمل بصرياً إلى مسارين متمايزين: الجزء الأول مخصص لتمارين التحصيل والتمكن الأساسي (Socle Commun)، والجزء الثاني مخصص لتمارين التعميق والتحدي والمسائل المركبة.",
    descriptionFr:
      "Scission visuelle en deux parcours : Volet 1 dédié au socle commun d'assimilation, Volet 2 réservé à l'approfondissement et aux défis d'excellence.",
    bestForAr: "الفصول ذات الفروق الفردية الكبيرة، البيداغوجيا الفارقية، والاستعداد للأقسام التحضيرية CPGE ومسلك العلوم الرياضية.",
    bestForFr: "Gestion de l'hétérogénéité, différenciation pédagogique et préparation aux filières d'excellence.",
    columnsCount: 1,
    paperSavingsPercent: 15,
    hasOfficialBorder: false,
    hasStudentIdBox: true,
    hasDifferentiatedSplit: true,
    hasAnswerWorkspaceProminent: false,
    hasAccentRibbon: true,
    accentColor: "amber",
    containerClass: "max-w-4xl mx-auto space-y-6",
    exerciseCardClass: "bg-white rounded-xl border border-amber-300 p-4 shadow-2xs space-y-3",
    exerciseHeaderClass: "bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-amber-200 px-4 py-2 rounded-lg font-bold text-xs flex justify-between",
    latexEquivalentPreamble: "\\usepackage{tcolorbox}\\usepackage{enumitem}",
  },
  {
    id: "WORKBOOK_ANSWER_ZONES",
    labelAr: "نمط الدفتر الامتحاني مع حيز الإجابة المدمج (Cahier Réponse)",
    labelFr: "Cahier d'Épreuve avec Zone Réponse & Grille de Correction",
    shortBadgeAr: "إجابة مباشرة على الورقة · تسطير Seyès",
    shortBadgeFr: "Cahier Réponse Seyès",
    category: "WORKBOOK",
    descriptionAr:
      "ورقة أسئلة وأجوبة مدمجة في وثيقة واحدة، توفر مساحة كتابة مسطرة بدقة وفق شبكة Seyès الفرنسية أو المربعات أسفل كل سؤال، مع مربعات تنقيط للمصحح على الهامش.",
    descriptionFr:
      "Épreuve sur feuille réponse intégrée : lignes Seyès françaises ou quadrillage réglable sous chaque question avec cases de pointage enseignant.",
    bestForAr: "فروض المراقبة المستمرة الصباحية، المراقبة المستمرة السريعة (Interrogations Écrites)، وتقليل هدر الأوراق المزدوجة.",
    bestForFr: "Interrogations écrites, devoirs sur feuille-réponse directe et correction immédiate.",
    columnsCount: 1,
    paperSavingsPercent: -20, // تتطلب مساحة أكبر للإجابة
    hasOfficialBorder: false,
    hasStudentIdBox: true,
    hasDifferentiatedSplit: false,
    hasAnswerWorkspaceProminent: true,
    hasAccentRibbon: false,
    accentColor: "sky",
    containerClass: "max-w-4xl mx-auto space-y-6",
    exerciseCardClass: "bg-white rounded-xl border-2 border-sky-300 p-4 shadow-xs space-y-4",
    exerciseHeaderClass: "bg-sky-950 text-sky-100 px-3.5 py-1.5 rounded-lg font-bold text-xs flex justify-between",
    latexEquivalentPreamble: "\\usepackage{tikz}\\usepackage{linegoal}",
  },
  {
    id: "MINIMALIST_AEFE_MODERN",
    labelAr: "النمط العصري لمؤسسات البعثة الفرنسية (Épuré AEFE)",
    labelFr: "Design Minimaliste Épuré AEFE Mission",
    shortBadgeAr: "عصري أنيق · شريط جانبي وتيبوغرافيا حديثة",
    shortBadgeFr: "Minimaliste Moderne AEFE",
    category: "OFFICIAL",
    descriptionAr:
      "تصميم حديث مستوحى من مطبوعات شبكة المدارس الفرنسية بالمغرب AEFE: خطوط طباعية واضحة، شريط عمودي ملون على جانب الورقة، ترويسة مدمجة بشعار المؤسسة، وهوامش متناسقة.",
    descriptionFr:
      "Design épuré inspiré des établissements français AEFE : ruban vertical coloré, typographie moderne soignée, cartouche compact et aération élégante.",
    bestForAr: "مؤسسات التعليم الخاص والبعثة الفرنسية، الامتحانات الموحدة الدولية، والوثائق البيداغوجية الراقية.",
    bestForFr: "Lycées français AEFE/OSUI, bilingue d'excellence et évaluations formatives soignées.",
    columnsCount: 1,
    paperSavingsPercent: 5,
    hasOfficialBorder: false,
    hasStudentIdBox: true,
    hasDifferentiatedSplit: false,
    hasAnswerWorkspaceProminent: false,
    hasAccentRibbon: true,
    accentColor: "rose",
    containerClass: "max-w-4xl mx-auto space-y-6 border-r-4 border-rose-600 pr-5 bg-white",
    exerciseCardClass: "border-b-2 border-slate-100 pb-5 space-y-3 bg-white",
    exerciseHeaderClass: "text-rose-950 font-black text-sm pb-1 flex justify-between items-center",
    latexEquivalentPreamble: "\\usepackage{tikz}\\usepackage[framemethod=TikZ]{mdframed}",
  },
];

export function getPrintLayoutTemplate(id: PrintLayoutTemplateId): PrintLayoutTemplate {
  const found = PRINT_LAYOUT_TEMPLATES.find((t) => t.id === id);
  return found || PRINT_LAYOUT_TEMPLATES[0];
}

// ============================================================================
// محرك تحسين فواصل الصفحات الذكي (A4 / Letter) ومنع انقسام المعادلات والجداول
// Smart Page-Break Optimizer & Equation/Table Row Anti-Split Engine
// ============================================================================

export type PageBreakPaperFormat = "A4" | "LETTER";

export type PageBreakStrictnessMode = "BALANCED" | "STRICT_NO_SPLIT" | "MAXIMUM_COMPACT";

export type PageBreakVisualizerStyle = "SAFETY_BAND" | "DASHED_LASER" | "RULER_GRID";

export type VerticalDensityPresetId =
  | "ULTRA_COMPACT"
  | "COMPACT"
  | "BALANCED"
  | "COMFORTABLE"
  | "SPACIOUS"
  | "CUSTOM";

export interface CustomMarginPreset {
  id: string;
  nameAr: string;
  nameFr: string;
  topMm: number;
  bottomMm: number;
  leftMm: number;
  rightMm: number;
  isBuiltIn?: boolean;
}

export const BUILT_IN_MARGIN_PRESETS: CustomMarginPreset[] = [
  {
    id: "OFFICIAL_MINISTRY_14MM",
    nameAr: "قياسي وزاري (14×14×15×15 ملم)",
    nameFr: "Standard Ministère (14/14/15/15 mm)",
    topMm: 14,
    bottomMm: 14,
    leftMm: 15,
    rightMm: 15,
    isBuiltIn: true,
  },
  {
    id: "COMPACT_CONCOURS_8MM",
    nameAr: "مكثف للمباريات والسلاسل (8×8×8×8 ملم)",
    nameFr: "Compact Concours & TD (8/8/8/8 mm)",
    topMm: 8,
    bottomMm: 8,
    leftMm: 8,
    rightMm: 8,
    isBuiltIn: true,
  },
  {
    id: "STAPLE_BINDING_RTL_22MM",
    nameAr: "هامش تدبيس يمين عربي (14×14×12×22 ملم)",
    nameFr: "Reliure & Agrafage Droite RTL (14/14/12/22 mm)",
    topMm: 14,
    bottomMm: 14,
    leftMm: 12,
    rightMm: 22,
    isBuiltIn: true,
  },
  {
    id: "WIDE_ANNOTATION_20MM",
    nameAr: "مريح مع هامش تصحيح واسع (18×18×20×20 ملم)",
    nameFr: "Large pour Annotations (18/18/20/20 mm)",
    topMm: 18,
    bottomMm: 18,
    leftMm: 20,
    rightMm: 20,
    isBuiltIn: true,
  },
];

export interface VerticalDensityPresetSpec {
  id: VerticalDensityPresetId;
  labelAr: string;
  labelFr: string;
  exerciseGapMm: number;
  paragraphGapMm: number;
  lineHeightRatio: number;
}

export const VERTICAL_DENSITY_PRESETS: VerticalDensityPresetSpec[] = [
  {
    id: "ULTRA_COMPACT",
    labelAr: "شديد التكاثف (توفير أقصى للورق)",
    labelFr: "Ultra-Compact (Densité Maximale)",
    exerciseGapMm: 2.5,
    paragraphGapMm: 1.0,
    lineHeightRatio: 1.28,
  },
  {
    id: "COMPACT",
    labelAr: "مكثف متوازن (سلاسل وفروض طويلة)",
    labelFr: "Compact (TD & Épreuves Longues)",
    exerciseGapMm: 4.0,
    paragraphGapMm: 1.8,
    lineHeightRatio: 1.38,
  },
  {
    id: "BALANCED",
    labelAr: "قياسي أكاديمي (متوازن)",
    labelFr: "Équilibré Académique (Standard)",
    exerciseGapMm: 6.0,
    paragraphGapMm: 2.5,
    lineHeightRatio: 1.5,
  },
  {
    id: "COMFORTABLE",
    labelAr: "مريح للقراءة (تهوية موسعة)",
    labelFr: "Confortable & Aéré",
    exerciseGapMm: 8.5,
    paragraphGapMm: 3.5,
    lineHeightRatio: 1.62,
  },
  {
    id: "SPACIOUS",
    labelAr: "واسع جداً (للكتابة المباشرة بين الأسطر)",
    labelFr: "Très Spacieux (Annotations Directes)",
    exerciseGapMm: 11.0,
    paragraphGapMm: 4.5,
    lineHeightRatio: 1.75,
  },
];

const CUSTOM_MARGIN_PRESETS_STORAGE_KEY = "math_studio_custom_margin_presets_v1";

export function loadCustomMarginPresets(): CustomMarginPreset[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [...BUILT_IN_MARGIN_PRESETS];
  }
  try {
    const raw = window.localStorage.getItem(CUSTOM_MARGIN_PRESETS_STORAGE_KEY);
    if (!raw) return [...BUILT_IN_MARGIN_PRESETS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...BUILT_IN_MARGIN_PRESETS];
    const userPresets = parsed.filter(
      (p) => p && typeof p.id === "string" && !p.isBuiltIn
    );
    return [...BUILT_IN_MARGIN_PRESETS, ...userPresets];
  } catch {
    return [...BUILT_IN_MARGIN_PRESETS];
  }
}

export function saveCustomMarginPresetToStorage(
  preset: Omit<CustomMarginPreset, "id" | "isBuiltIn"> & { id?: string }
): CustomMarginPreset {
  const newPreset: CustomMarginPreset = {
    id: preset.id || `CUSTOM_MARGIN_${Date.now()}`,
    nameAr: preset.nameAr.trim() || "هامش مخصص",
    nameFr: preset.nameFr.trim() || "Marge Personnalisée",
    topMm: Math.max(4, Math.min(40, Number(preset.topMm) || 14)),
    bottomMm: Math.max(4, Math.min(40, Number(preset.bottomMm) || 14)),
    leftMm: Math.max(4, Math.min(40, Number(preset.leftMm) || 15)),
    rightMm: Math.max(4, Math.min(40, Number(preset.rightMm) || 15)),
    isBuiltIn: false,
  };

  const current = loadCustomMarginPresets().filter((p) => !p.isBuiltIn && p.id !== newPreset.id);
  const updatedUserPresets = [...current, newPreset];

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(
        CUSTOM_MARGIN_PRESETS_STORAGE_KEY,
        JSON.stringify(updatedUserPresets)
      );
    } catch {
      // ignore storage quota errors
    }
  }

  return newPreset;
}

export function deleteCustomMarginPresetFromStorage(presetId: string): CustomMarginPreset[] {
  const current = loadCustomMarginPresets().filter(
    (p) => !p.isBuiltIn && p.id !== presetId
  );
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(
        CUSTOM_MARGIN_PRESETS_STORAGE_KEY,
        JSON.stringify(current)
      );
    } catch {
      // ignore
    }
  }
  return [...BUILT_IN_MARGIN_PRESETS, ...current];
}

export interface SmartPageBreakConfig {
  enabled: boolean;
  paperFormat: PageBreakPaperFormat;
  strictnessMode: PageBreakStrictnessMode;
  lockDisplayEquations: boolean;       // منع انقسام المعادلات الرياضية والنظمات والمصفوفات
  lockTableRowsAndSignTables: boolean; // منع انقسام أسطر الجداول وجداول التغيرات والإشارة
  lockQuestionWithAnswerZone: boolean; // ربط نص السؤال بحيز الإجابة المسطر (Seyès / Grid)
  lockExerciseHeadersAndOrphans: boolean; // منع بقاء عنوان التمرين وحيداً في أسفل الصفحة (Orphans/Widows)
  lockFiguresAndQrBadges: boolean;     // حماية المبيانات ورموز QR من الانقسام
  autoInsertBreaksOnCollision: boolean;// إدراج فواصل صفحات استباقية عند رصد تصادم مع حد الصفحة
  forcedBreakBeforeExercises: number[];// أرقام التمارين (0-indexed) التي يُدرج قبلها فاصل صفحة
  marginTopBottomMm: number;           // مجموع الهامشين العلوي والسفلي بالمليمتر (افتراضياً 28mm)
  marginTopMm?: number;                // الهامش العلوي بالمليمتر (Top Margin mm)
  marginBottomMm?: number;             // الهامش السفلي بالمليمتر (Bottom Margin mm)
  marginLeftMm?: number;               // الهامش الأيسر بالمليمتر (Left Margin mm)
  marginRightMm?: number;              // الهامش الأيمن بالمليمتر (Right Margin mm)
  activeMarginPresetId?: string;       // معرف قالب الهوامش النشط
  verticalDensityPreset?: VerticalDensityPresetId; // نمط الكثافة والتباعد العمودي
  exerciseGapMm?: number;              // التباعد العمودي بين أقسام التمارين بالمليمتر
  paragraphGapMm?: number;             // التباعد العمودي بين الفقرات والأسئلة بالمليمتر
  lineHeightRatio?: number;            // معامل ارتفاع السطر داخل الورقة
  showLivePageBreakVisualizer?: boolean; // عرض خطوط الفواصل شبه الشفافة الحية على ورقة المعاينة A4
  visualizerLineStyle?: PageBreakVisualizerStyle; // نمط خطوط المعاينة شبه الشفافة
  visualizerOpacity?: number;          // درجة شفافية خطوط الفواصل (0.3 إلى 1.0)
}

export const DEFAULT_SMART_PAGE_BREAK_CONFIG: SmartPageBreakConfig = {
  enabled: true,
  paperFormat: "A4",
  strictnessMode: "STRICT_NO_SPLIT",
  lockDisplayEquations: true,
  lockTableRowsAndSignTables: true,
  lockQuestionWithAnswerZone: true,
  lockExerciseHeadersAndOrphans: true,
  lockFiguresAndQrBadges: true,
  autoInsertBreaksOnCollision: true,
  forcedBreakBeforeExercises: [],
  marginTopBottomMm: 28,
  marginTopMm: 14,
  marginBottomMm: 14,
  marginLeftMm: 15,
  marginRightMm: 15,
  activeMarginPresetId: "OFFICIAL_MINISTRY_14MM",
  verticalDensityPreset: "BALANCED",
  exerciseGapMm: 6.0,
  paragraphGapMm: 2.5,
  lineHeightRatio: 1.5,
  showLivePageBreakVisualizer: true,
  visualizerLineStyle: "SAFETY_BAND",
  visualizerOpacity: 0.85,
};

export interface ExercisePageBreakAnalysisItem {
  exerciseIndex: number;
  exerciseNumber: number;
  titleAr: string;
  titleFr: string;
  estimatedHeightMm: number;
  equationsCount: number;
  tablesCount: number;
  assignedPageNumber: number;
  startOffsetMmOnPage: number;
  endOffsetMmOnPage: number;
  wouldCollideWithoutBreak: boolean;
  collisionType?: "EQUATION_SPLIT" | "TABLE_ROW_SPLIT" | "HEADER_ORPHAN" | "BOX_OVERFLOW";
  collisionSavedDescriptionAr?: string;
  collisionSavedDescriptionFr?: string;
  hasPageBreakBefore: boolean;
  isManualBreak: boolean;
}

export interface OptimizedPageSummary {
  pageNumber: number;
  usedHeightMm: number;
  usableHeightMm: number;
  fillPercentage: number;
  exerciseIndices: number[];
  protectedEquationsOnPage: number;
  protectedTableRowsOnPage: number;
}

export interface SmartPageBreakOptimizationPlan {
  paperFormat: PageBreakPaperFormat;
  paperWidthMm: number;
  paperHeightMm: number;
  usableWidthMm: number;
  usableHeightMm: number;
  usableHeightPx: number;
  totalPages: number;
  totalExercisesAnalyzed: number;
  totalProtectedEquations: number;
  totalProtectedTableRows: number;
  totalCollisionsPrevented: number;
  recommendedBreakIndices: number[];
  exercisesAnalysis: ExercisePageBreakAnalysisItem[];
  pagesSummary: OptimizedPageSummary[];
  cssRules: string;
  latexPreambleSnippet: string;
  typstPreambleSnippet: string;
}

export interface PageBreakLessonInput {
  lessonAr: string;
  lessonFr: string;
  weight?: number;
  questionsAr?: string[];
  questionsFr?: string[];
}

/**
 * حساب الخطة المثلى لفواصل الصفحات (A4 أو US Letter) مع رصد المعادلات والجداول المهددة بالانقسام
 */
export function computeOptimizedPageBreakPlan(
  lessons: PageBreakLessonInput[],
  config: SmartPageBreakConfig = DEFAULT_SMART_PAGE_BREAK_CONFIG,
  options?: {
    columnsCount?: 1 | 2;
    includeAnswerWorkspace?: boolean;
    includeDetailedSolutions?: boolean;
    hasQcmBlock?: boolean;
    hasSynthesisProblem?: boolean;
  }
): SmartPageBreakOptimizationPlan {
  const isLetter = config.paperFormat === "LETTER";
  const paperWidthMm = isLetter ? 215.9 : 210;
  const paperHeightMm = isLetter ? 279.4 : 297;
  const resolvedTopBottomMm =
    config.marginTopMm !== undefined && config.marginBottomMm !== undefined
      ? config.marginTopMm + config.marginBottomMm
      : config.marginTopBottomMm || 28;
  const resolvedLeftRightMm =
    (config.marginLeftMm ?? 15) + (config.marginRightMm ?? 15);
  const marginMm = Math.max(8, Math.min(70, resolvedTopBottomMm));
  const usableWidthMm = Number((paperWidthMm - Math.max(8, Math.min(70, resolvedLeftRightMm))).toFixed(1));
  const usableHeightMm = Number((paperHeightMm - marginMm).toFixed(1));
  // 1mm ≈ 3.7795px at 96 DPI
  const usableHeightPx = Math.round(usableHeightMm * 3.7795);

  const exerciseGapMm = Math.max(1, Math.min(20, config.exerciseGapMm ?? 6));
  const paragraphGapMm = Math.max(0.5, Math.min(10, config.paragraphGapMm ?? 2.5));
  const lineHeightRatio = Math.max(1.15, Math.min(2.0, config.lineHeightRatio ?? 1.5));
  const densityFactor = (lineHeightRatio / 1.5) * (0.85 + paragraphGapMm * 0.06);

  const cols = options?.columnsCount || 1;
  const colScaleFactor = cols === 2 ? 0.56 : 1.0;

  // ارتفاع الترويسة الوزارية وسلم التنقيط في الصفحة الأولى
  const headerAndBaremeHeightMm = Math.round((options?.hasQcmBlock ? 72 : 48) * colScaleFactor);

  let currentPage = 1;
  let currentOffsetMm = headerAndBaremeHeightMm;

  let totalProtectedEquations = 0;
  let totalProtectedTableRows = 0;
  let totalCollisionsPrevented = 0;
  const recommendedBreakIndices: number[] = [];
  const exercisesAnalysis: ExercisePageBreakAnalysisItem[] = [];

  const safeLessons: PageBreakLessonInput[] =
    lessons && lessons.length > 0
      ? lessons
      : [
          {
            lessonAr: "الاتصال والاشتقاق ودراسة الدوال",
            lessonFr: "Continuité, dérivabilité et étude de fonctions",
            weight: 35,
            questionsAr: [
              "أحسب النهايات التالية: $\\lim_{x \\to +\\infty} f(x)$",
              "ضع جدول تغيرات الدالة $f$ على $\\mathbb{R}$",
              "حل في $\\mathbb{R}$ المعادلة $f(x) = 0$",
            ],
          },
          {
            lessonAr: "المتتاليات العددية والبرهان بالترجع",
            lessonFr: "Suites numériques et récurrence",
            weight: 30,
            questionsAr: [
              "بين بالترجع أن $(\\forall n \\in \\mathbb{N}) : u_n > 1$",
              "ادرس رتابة المتتالية $(u_n)$ واستنتج أنها متقاربة",
            ],
          },
          {
            lessonAr: "الأعداد العقدية والهندسة الفضائية",
            lessonFr: "Nombres complexes et géométrie dans l'espace",
            weight: 35,
            questionsAr: [
              "حل في $\\mathbb{C}$ المعادلة $z^2 - 2\\sqrt{3}z + 4 = 0$",
              "حدد معادلة ديكارتية للفلكة $(S)$ ومستوى التماس $(P)$",
            ],
          },
        ];

  safeLessons.forEach((lesson, idx) => {
    const qList =
      (lesson.questionsAr && lesson.questionsAr.length > 0
        ? lesson.questionsAr
        : lesson.questionsFr) || [];
    const qCount = Math.max(2, qList.length || 3);

    // إحصاء المعادلات والجداول داخل أسئلة التمرين
    let eqCount = 0;
    let tblCount = 1; // جدول تنقيط أو جدول تغيرات ضمني على الأقل
    const combinedText = `${lesson.lessonAr} ${lesson.lessonFr} ${qList.join(" ")}`;

    const dollarMatches = combinedText.match(/\$[^$]+\$/g);
    eqCount += dollarMatches ? Math.ceil(dollarMatches.length / 2) : 2;
    if (/\\frac|\\lim|\\int|\\sum|matrix|cases|system/i.test(combinedText)) {
      eqCount += 2;
    }
    if (/جدول|تغيرات|إشارة|قيمة|tableau|variation|signe|spec/i.test(combinedText)) {
      tblCount += 2;
    }

    totalProtectedEquations += eqCount;
    totalProtectedTableRows += tblCount * 3;

    // تقدير الارتفاع الفيزيائي للتمرين بالمليمتر حسب محتواه وكثافة التباعد العمودي
    const baseHeaderMm = 14;
    const questionsMm = qCount * (11.5 * densityFactor + paragraphGapMm * 0.8);
    const equationsExtraMm = eqCount * 5.5;
    const tablesExtraMm = tblCount * 11;
    const workspaceExtraMm = options?.includeAnswerWorkspace ? qCount * 18 : 0;
    const solutionExtraMm = options?.includeDetailedSolutions ? qCount * 14 : 0;

    const rawHeightMm =
      (baseHeaderMm +
        exerciseGapMm +
        questionsMm +
        equationsExtraMm +
        tablesExtraMm +
        workspaceExtraMm +
        solutionExtraMm) *
      colScaleFactor;

    const estimatedHeightMm = Math.min(
      usableHeightMm - 12,
      Math.max(32, Math.round(rawHeightMm))
    );

    const isManuallyForced = config.forcedBreakBeforeExercises.includes(idx);
    const projectedEndMm = currentOffsetMm + estimatedHeightMm;

    // فحص ما إذا كان التمرين سيتجاوز الحد الآمن للصفحة ويؤدي إلى شطر معادلة أو جدول
    const safetyThresholdMm =
      config.strictnessMode === "STRICT_NO_SPLIT"
        ? usableHeightMm - 8
        : config.strictnessMode === "BALANCED"
        ? usableHeightMm - 3
        : usableHeightMm;

    const wouldCollide = idx > 0 && projectedEndMm > safetyThresholdMm;

    let collisionType: ExercisePageBreakAnalysisItem["collisionType"] = undefined;
    let collisionSavedDescriptionAr: string | undefined = undefined;
    let collisionSavedDescriptionFr: string | undefined = undefined;

    if (wouldCollide) {
      const overhangMm = Math.round(projectedEndMm - usableHeightMm);
      if (tblCount >= 2 && config.lockTableRowsAndSignTables) {
        collisionType = "TABLE_ROW_SPLIT";
        collisionSavedDescriptionAr = `منع انقسام جدول التغيرات/الإشارة (${tblCount} جداول) عند الحد ${usableHeightMm}mm`;
        collisionSavedDescriptionFr = `Coupure évitée pour le tableau de variations/signes à ${usableHeightMm}mm`;
      } else if (eqCount >= 2 && config.lockDisplayEquations) {
        collisionType = "EQUATION_SPLIT";
        collisionSavedDescriptionAr = `حماية ${eqCount} معادلات رياضية من الانشطار بين الصفحتين ${currentPage} و ${currentPage + 1}`;
        collisionSavedDescriptionFr = `Protection de ${eqCount} équations contre la coupure entre pages ${currentPage} et ${currentPage + 1}`;
      } else if (usableHeightMm - currentOffsetMm < 28 && config.lockExerciseHeadersAndOrphans) {
        collisionType = "HEADER_ORPHAN";
        collisionSavedDescriptionAr = `منع بقاء عنوان التمرين ${idx + 1} يتيماً في ذيل الصفحة ${currentPage}`;
        collisionSavedDescriptionFr = `Évite l'en-tête orphelin de l'exercice ${idx + 1} en bas de page ${currentPage}`;
      } else {
        collisionType = "BOX_OVERFLOW";
        collisionSavedDescriptionAr = `تفادي تجاوز إطار التمرين بمقدار +${Math.max(4, overhangMm)}mm عبر حدود ${config.paperFormat}`;
        collisionSavedDescriptionFr = `Dépassement de bloc (+${Math.max(4, overhangMm)}mm) corrigé sur format ${config.paperFormat}`;
      }
    }

    const shouldInsertBreak =
      idx > 0 &&
      (isManuallyForced || (config.enabled && config.autoInsertBreaksOnCollision && wouldCollide));

    if (shouldInsertBreak) {
      currentPage += 1;
      currentOffsetMm = 12; // بداية الصفحة الجديدة مع هامش علوي داخلي خفيف
      recommendedBreakIndices.push(idx);
      if (wouldCollide) {
        totalCollisionsPrevented += 1;
      }
    }

    const startOffsetMmOnPage = Math.round(currentOffsetMm);
    const endOffsetMmOnPage = Math.min(
      usableHeightMm,
      Math.round(currentOffsetMm + estimatedHeightMm)
    );

    exercisesAnalysis.push({
      exerciseIndex: idx,
      exerciseNumber: idx + 1,
      titleAr: lesson.lessonAr,
      titleFr: lesson.lessonFr,
      estimatedHeightMm,
      equationsCount: eqCount,
      tablesCount: tblCount,
      assignedPageNumber: currentPage,
      startOffsetMmOnPage,
      endOffsetMmOnPage,
      wouldCollideWithoutBreak: wouldCollide,
      collisionType,
      collisionSavedDescriptionAr,
      collisionSavedDescriptionFr,
      hasPageBreakBefore: shouldInsertBreak,
      isManualBreak: isManuallyForced,
    });

    currentOffsetMm = endOffsetMmOnPage + Math.round(exerciseGapMm);
  });

  // تجميع ملخص الصفحات
  const pagesMap = new Map<number, OptimizedPageSummary>();
  for (let p = 1; p <= currentPage; p++) {
    pagesMap.set(p, {
      pageNumber: p,
      usedHeightMm: p === 1 ? headerAndBaremeHeightMm : 10,
      usableHeightMm,
      fillPercentage: 0,
      exerciseIndices: [],
      protectedEquationsOnPage: 0,
      protectedTableRowsOnPage: 0,
    });
  }

  exercisesAnalysis.forEach((item) => {
    const pageSummary = pagesMap.get(item.assignedPageNumber);
    if (pageSummary) {
      pageSummary.usedHeightMm = Math.max(pageSummary.usedHeightMm, item.endOffsetMmOnPage);
      pageSummary.exerciseIndices.push(item.exerciseIndex);
      pageSummary.protectedEquationsOnPage += item.equationsCount;
      pageSummary.protectedTableRowsOnPage += item.tablesCount * 3;
    }
  });

  const pagesSummary: OptimizedPageSummary[] = Array.from(pagesMap.values()).map((pg) => ({
    ...pg,
    fillPercentage: Math.min(100, Math.round((pg.usedHeightMm / usableHeightMm) * 100)),
  }));

  return {
    paperFormat: config.paperFormat,
    paperWidthMm,
    paperHeightMm,
    usableWidthMm,
    usableHeightMm,
    usableHeightPx,
    totalPages: currentPage,
    totalExercisesAnalyzed: exercisesAnalysis.length,
    totalProtectedEquations,
    totalProtectedTableRows,
    totalCollisionsPrevented,
    recommendedBreakIndices,
    exercisesAnalysis,
    pagesSummary,
    cssRules: generateSmartPageBreakCssRules(config),
    latexPreambleSnippet: generateSmartPageBreakLatexCommands(config),
    typstPreambleSnippet: generateSmartPageBreakTypstCommands(config),
  };
}

/**
 * توليد قواعد CSS الدقيقة لمنع انقسام المعادلات وأسطر الجداول وضبط مقاس A4 / Letter والهوامش والتباعد العمودي
 */
export function generateSmartPageBreakCssRules(config: SmartPageBreakConfig): string {
  const topMm = config.marginTopMm ?? 14;
  const bottomMm = config.marginBottomMm ?? 14;
  const leftMm = config.marginLeftMm ?? 15;
  const rightMm = config.marginRightMm ?? 15;
  const exerciseGapMm = config.exerciseGapMm ?? 6;
  const paragraphGapMm = config.paragraphGapMm ?? 2.5;
  const lineHeightRatio = config.lineHeightRatio ?? 1.5;

  const pageSizeCss = config.paperFormat === "LETTER" ? "letter portrait" : "A4 portrait";
  const rules: string[] = [
    `/* Smart Page-Break, Custom Margins (${topMm}/${bottomMm}/${leftMm}/${rightMm}mm) & Vertical Density Rules (${config.paperFormat}) */`,
    `#printable-document-sheet, .printable-document-sheet {`,
    `  --doc-margin-top-mm: ${topMm}mm;`,
    `  --doc-margin-bottom-mm: ${bottomMm}mm;`,
    `  --doc-margin-left-mm: ${leftMm}mm;`,
    `  --doc-margin-right-mm: ${rightMm}mm;`,
    `  --doc-exercise-gap-mm: ${exerciseGapMm}mm;`,
    `  --doc-paragraph-gap-mm: ${paragraphGapMm}mm;`,
    `  --doc-line-height: ${lineHeightRatio};`,
    `  line-height: ${lineHeightRatio};`,
    `}`,
    `#printable-document-sheet [data-sync-section="EXERCISES"],`,
    `.printable-document-sheet [data-sync-section="EXERCISES"],`,
    `#printable-document-sheet .print-exercise-block,`,
    `.printable-document-sheet .print-exercise-block {`,
    `  margin-bottom: ${exerciseGapMm}mm !important;`,
    `}`,
    `#printable-document-sheet ol > li,`,
    `.printable-document-sheet ol > li,`,
    `#printable-document-sheet ul > li,`,
    `.printable-document-sheet ul > li,`,
    `#printable-document-sheet p,`,
    `.printable-document-sheet p {`,
    `  margin-bottom: ${paragraphGapMm}mm !important;`,
    `  line-height: ${lineHeightRatio};`,
    `}`,
    `@media print {`,
    `  @page { size: ${pageSizeCss}; margin: ${topMm}mm ${rightMm}mm ${bottomMm}mm ${leftMm}mm !important; }`,
  ];

  if (!config.enabled) {
    rules.push(`}`);
    return rules.join("\n");
  }

  if (config.lockDisplayEquations) {
    rules.push(
      `  .katex-display, .katex, .math-block, .equation-box, [data-math-block="true"], mjx-container[display="true"] {`,
      `    page-break-inside: avoid !important;`,
      `    break-inside: avoid-page !important;`,
      `    break-inside: avoid !important;`,
      `  }`
    );
  }

  if (config.lockTableRowsAndSignTables) {
    rules.push(
      `  table, tr, thead, tbody, tfoot, .tkz-tab, .variation-table, .spec-table-row {`,
      `    page-break-inside: avoid !important;`,
      `    break-inside: avoid-page !important;`,
      `    break-inside: avoid !important;`,
      `  }`,
      `  thead { display: table-header-group !important; }`,
      `  tfoot { display: table-footer-group !important; }`
    );
  }

  if (config.lockQuestionWithAnswerZone) {
    rules.push(
      `  li, .question-item, .question-with-workspace, .answer-workspace-box {`,
      `    page-break-inside: avoid !important;`,
      `    break-inside: avoid-page !important;`,
      `    break-inside: avoid !important;`,
      `  }`,
      `  .question-statement {`,
      `    page-break-after: avoid !important;`,
      `    break-after: avoid-page !important;`,
      `  }`
    );
  }

  if (config.lockExerciseHeadersAndOrphans) {
    rules.push(
      `  p, li, div { orphans: 3 !important; widows: 3 !important; }`,
      `  h1, h2, h3, h4, .exercise-header, .section-header {`,
      `    page-break-after: avoid !important;`,
      `    break-after: avoid-page !important;`,
      `    page-break-inside: avoid !important;`,
      `    break-inside: avoid !important;`,
      `  }`
    );
  }

  if (config.lockFiguresAndQrBadges) {
    rules.push(
      `  svg, canvas, figure, .inserted-figure-card, .qr-solution-badge {`,
      `    page-break-inside: avoid !important;`,
      `    break-inside: avoid-page !important;`,
      `  }`
    );
  }

  rules.push(
    `  .smart-forced-page-break {`,
    `    page-break-before: always !important;`,
    `    break-before: page !important;`,
    `  }`,
    `}`
  );

  // قواعد المعاينة الحية أيضاً لمنع انشطار العناصر داخل الأعمدة أو الصفحات
  rules.push(
    `.smart-page-guard-active .katex-display,`,
    `.smart-page-guard-active tr,`,
    `.smart-page-guard-active table,`,
    `.smart-page-guard-active svg,`,
    `.smart-page-guard-active li {`,
    `  break-inside: avoid;`,
    `  page-break-inside: avoid;`,
    `}`
  );

  return rules.join("\n");
}

/**
 * توليد أوامر ترويسة LaTeX لمنع انشطار المعادلات والجداول والفقرات اليتيمة وضبط التباعد العمودي
 */
export function generateSmartPageBreakLatexCommands(config: SmartPageBreakConfig): string {
  if (!config.enabled) return "";
  const topMm = config.marginTopMm ?? 14;
  const bottomMm = config.marginBottomMm ?? 14;
  const leftMm = config.marginLeftMm ?? 15;
  const rightMm = config.marginRightMm ?? 15;
  const paragraphGapMm = config.paragraphGapMm ?? 2.5;
  const lineHeightRatio = config.lineHeightRatio ?? 1.5;

  const lines: string[] = [
    `% --- محرك ضبط فواصل الصفحات الذكي (${config.paperFormat}) والهوامش (${topMm}/${bottomMm}/${leftMm}/${rightMm}mm) والتباعد العمودي ---`,
    `\\setlength{\\parskip}{${paragraphGapMm}mm}`,
    `\\renewcommand{\\baselinestretch}{${lineHeightRatio}}`,
  ];
  if (config.lockDisplayEquations) {
    lines.push(
      `\\interdisplaylinepenalty=10000 % منع انقسام المعادلات متعددة الأسطر والنظمات بين صفحتين`,
      `\\relpenalty=10000            % منع كسر العلاقات الرياضية في نهاية السطر/الصفحة`,
      `\\binoppenalty=10000          % منع كسر العمليات الثنائية الحرجة`
    );
  }
  if (config.lockExerciseHeadersAndOrphans) {
    lines.push(
      `\\widowpenalty=10000          % منع الأسطر المنفردة في أعلى الصفحة الجديدة`,
      `\\clubpenalty=10000           % منع الأسطر اليتيمة في أسفل الصفحة`,
      `\\brokenpenalty=10000`
    );
  }
  if (config.lockTableRowsAndSignTables) {
    lines.push(
      `\\renewcommand{\\arraystretch}{1.25} % حماية تباعد أسطر الجداول وجداول التغيرات`
    );
  }
  return lines.join("\n");
}

/**
 * توليد قواعد Typst المكافئة لمنع انقسام المعادلات والجداول وضبط الهوامش والتباعد العمودي
 */
export function generateSmartPageBreakTypstCommands(config: SmartPageBreakConfig): string {
  if (!config.enabled) return "";
  const paper = config.paperFormat === "LETTER" ? "us-letter" : "a4";
  const topMm = config.marginTopMm ?? 14;
  const bottomMm = config.marginBottomMm ?? 14;
  const leftMm = config.marginLeftMm ?? 15;
  const rightMm = config.marginRightMm ?? 15;
  const paragraphGapMm = config.paragraphGapMm ?? 2.5;

  const lines: string[] = [
    `// --- Smart Page-Break, Custom Margins & Vertical Density Rules (${config.paperFormat}) ---`,
    `#set page(paper: "${paper}", margin: (top: ${topMm}mm, bottom: ${bottomMm}mm, left: ${leftMm}mm, right: ${rightMm}mm))`,
    `#set par(spacing: ${paragraphGapMm}mm)`,
  ];
  if (config.lockDisplayEquations) {
    lines.push(`#show math.equation.where(block: true): set block(breakable: false)`);
  }
  if (config.lockTableRowsAndSignTables) {
    lines.push(`#show figure: set block(breakable: false)`);
  }
  return lines.join("\n");
}

export interface PageBreakVisualizerLineSpec {
  breakIndex: number;
  fromPage: number;
  toPage: number;
  offsetMm: number;
  offsetPx: number;
  percentageOfTotalHeight: number;
  safetyBandHeightMm: number;
  safetyBandHeightPx: number;
  triggeredBeforeExerciseNumber?: number;
  rescuedCollisionType?: ExercisePageBreakAnalysisItem["collisionType"];
  badgeLabelAr: string;
  badgeLabelFr: string;
  subLabelAr: string;
  subLabelFr: string;
}

/**
 * توليد إحداثيات خطوط وأشرطة المعاينة الحية شبه الشفافة (Page Break Visualizer Overlay Lines)
 * لعرضها فوق معاينة ورقة A4 / Letter سواء داخل النافذة أو على الورقة الرئيسية
 */
export function computeVisualizerOverlayLines(
  plan: SmartPageBreakOptimizationPlan,
  measuredSheetHeightPx?: number
): PageBreakVisualizerLineSpec[] {
  const lines: PageBreakVisualizerLineSpec[] = [];
  const totalPages = Math.max(1, plan.totalPages);
  const effectiveSheetPx =
    measuredSheetHeightPx && measuredSheetHeightPx > 400
      ? measuredSheetHeightPx
      : totalPages * plan.usableHeightPx;

  // في حالة صفحة واحدة، نعرض خط الحد الأقصى للورقة (نهاية الصفحة الأولى) كمرجع بصري للأستاذ
  const breakCount = totalPages > 1 ? totalPages - 1 : 1;

  for (let b = 1; b <= breakCount; b++) {
    const fromPage = b;
    const toPage = b + 1;
    const pageSummary = plan.pagesSummary.find((p) => p.pageNumber === fromPage);

    // التمرين الذي تم إدراج فاصل الصفحة قبله لبدء الصفحة toPage
    const breakExercise = plan.exercisesAnalysis.find(
      (ex) => ex.assignedPageNumber === toPage && ex.hasPageBreakBefore
    );

    const exactBreakMm =
      totalPages > 1 && pageSummary
        ? (b - 1) * plan.usableHeightMm + pageSummary.usedHeightMm
        : b * plan.usableHeightMm;

    const offsetPx =
      totalPages > 1
        ? Math.round((b / totalPages) * effectiveSheetPx)
        : Math.min(effectiveSheetPx - 16, plan.usableHeightPx);

    const percentageOfTotalHeight = Math.min(
      96,
      Math.max(12, Math.round((offsetPx / Math.max(1, effectiveSheetPx)) * 100))
    );

    const safetyBandHeightMm = 12;
    const safetyBandHeightPx = Math.round(safetyBandHeightMm * 3.7795);

    const badgeLabelAr =
      totalPages > 1
        ? `خط فاصل الصفحة التلقائي ${fromPage} ➔ ${toPage} (${plan.paperFormat} · ${exactBreakMm} mm)`
        : `حد الأمان السفلي لصفحة ${plan.paperFormat} (${plan.usableHeightMm} mm)`;

    const badgeLabelFr =
      totalPages > 1
        ? `Saut de Page Automatique ${fromPage} ➔ ${toPage} (${plan.paperFormat} · ${exactBreakMm} mm)`
        : `Limite de Sécurité Bas de Page ${plan.paperFormat} (${plan.usableHeightMm} mm)`;

    const subLabelAr = breakExercise
      ? breakExercise.collisionSavedDescriptionAr ||
        `ترحيل آمن قبل التمرين ${breakExercise.exerciseNumber} لمنع انشطار المعادلات والجداول`
      : `تأمين ${pageSummary?.protectedEquationsOnPage || plan.totalProtectedEquations} معادلات و ${
          pageSummary?.protectedTableRowsOnPage || plan.totalProtectedTableRows
        } أسطر جدول`;

    const subLabelFr = breakExercise
      ? breakExercise.collisionSavedDescriptionFr ||
        `Report sécurisé avant l'Exercice ${breakExercise.exerciseNumber} (anti-coupure)`
      : `${pageSummary?.protectedEquationsOnPage || plan.totalProtectedEquations} équations & ${
          pageSummary?.protectedTableRowsOnPage || plan.totalProtectedTableRows
        } lignes protégées`;

    lines.push({
      breakIndex: b,
      fromPage,
      toPage,
      offsetMm: exactBreakMm,
      offsetPx,
      percentageOfTotalHeight,
      safetyBandHeightMm,
      safetyBandHeightPx,
      triggeredBeforeExerciseNumber: breakExercise?.exerciseNumber,
      rescuedCollisionType: breakExercise?.collisionType,
      badgeLabelAr,
      badgeLabelFr,
      subLabelAr,
      subLabelFr,
    });
  }

  return lines;
}

// ============================================================================
// 5. محرك وضع القراءة والمراجعة التفاعلية المركّزة للوثيقة (Document Reading Mode Engine)
// ============================================================================

export type ReadingModePaperTone = "PURE_WHITE" | "WARM_CREAM" | "SOFT_SLATE";

/**
 * نمط عرض الصفحات في وضع القراءة:
 * - 'SINGLE_PAGE': عرض الصفحة الواحدة العمودي المتسلسل القياسي
 * - 'FACING_PAGES': عرض الصفحات المتقابل جنباً إلى جنب (Dual Spread) المخصص لشاشات الحواسيب والألواح اللمسية (Tablets & iPad)
 */
export type ReadingModeSpreadLayout = "SINGLE_PAGE" | "FACING_PAGES";

export type ReadingModeExerciseTypeIconId = Exclude<LessonHeaderIconId, "AUTO" | "NONE">;

export interface ReadingModeExerciseTypeSpec {
  iconId: ReadingModeExerciseTypeIconId;
  mathSymbol: string;
  typeLabelAr: string;
  typeLabelFr: string;
  shortNavLabelAr: string;
  shortNavLabelFr: string;
  pedagogicalRoleAr: string;
  accentHex: string;
  softBgHex: string;
  borderHex: string;
}

export const READING_MODE_EXERCISE_TYPE_SPECS: Record<
  ReadingModeExerciseTypeIconId,
  ReadingModeExerciseTypeSpec
> = {
  FUNCTION: {
    iconId: "FUNCTION",
    mathSymbol: "f(x)",
    typeLabelAr: "تمرين الدوال والمنحنيات البيانية",
    typeLabelFr: "Étude de Fonctions & Courbes",
    shortNavLabelAr: "دوال f(x)",
    shortNavLabelFr: "Fonctions f(x)",
    pedagogicalRoleAr: "النهايات، الاتصال، الاشتقاق، وتأويل الفروع اللانهائية",
    accentHex: "#1d4ed8",
    softBgHex: "#eff6ff",
    borderHex: "#93c5fd",
  },
  SEQUENCE: {
    iconId: "SEQUENCE",
    mathSymbol: "(uₙ)",
    typeLabelAr: "تمرين المتتاليات العددية والترجع",
    typeLabelFr: "Suites Numériques & Récurrence",
    shortNavLabelAr: "متتاليات (uₙ)",
    shortNavLabelFr: "Suites (uₙ)",
    pedagogicalRoleAr: "البرهان بالترجع، الرتابة، المتتاليات المساعدة، ونهاية متتالية",
    accentHex: "#0369a1",
    softBgHex: "#f0f9ff",
    borderHex: "#7dd3fc",
  },
  GEOMETRY: {
    iconId: "GEOMETRY",
    mathSymbol: "△",
    typeLabelAr: "تمرين الهندسة الفضائية والمستوية",
    typeLabelFr: "Géométrie dans l'Espace & Plane",
    shortNavLabelAr: "هندسة △",
    shortNavLabelFr: "Géométrie △",
    pedagogicalRoleAr: "الجداء السلمي والمتجهي، الفلكة، المستقيمات والمستويات",
    accentHex: "#047857",
    softBgHex: "#ecfdf5",
    borderHex: "#6ee7b7",
  },
  COMPLEX: {
    iconId: "COMPLEX",
    mathSymbol: "ℂ",
    typeLabelAr: "تمرين الأعداد العقدية والتحويلات",
    typeLabelFr: "Nombres Complexes & Transformations",
    shortNavLabelAr: "عقدية ℂ",
    shortNavLabelFr: "Complexes ℂ",
    pedagogicalRoleAr: "الشكل المثلثي والأسي، المعادلات في ℂ، والإزاحة والدوران",
    accentHex: "#6d28d9",
    softBgHex: "#f5f3ff",
    borderHex: "#c4b5fd",
  },
  PROBABILITY: {
    iconId: "PROBABILITY",
    mathSymbol: "P(A)",
    typeLabelAr: "تمرين الاحتمالات والإحصاء",
    typeLabelFr: "Probabilités & Variables Aléatoires",
    shortNavLabelAr: "احتمالات P(A)",
    shortNavLabelFr: "Probas P(A)",
    pedagogicalRoleAr: "التعداد، الاحتمال الشرطي، المتغير العشوائي، وقانون الحدانية",
    accentHex: "#be123c",
    softBgHex: "#fff1f2",
    borderHex: "#fda4af",
  },
  INTEGRAL: {
    iconId: "INTEGRAL",
    mathSymbol: "∫",
    typeLabelAr: "تمرين التكامل والمعادلات التفاضلية",
    typeLabelFr: "Calcul Intégral & Équations Différentielles",
    shortNavLabelAr: "تكامل ∫",
    shortNavLabelFr: "Intégrale ∫",
    pedagogicalRoleAr: "الدوال الأصلية، المكاملة بالأجزاء، حساب المساحات والحجوم",
    accentHex: "#4c1d95",
    softBgHex: "#f3e8ff",
    borderHex: "#d8b4fe",
  },
  ALGEBRA: {
    iconId: "ALGEBRA",
    mathSymbol: "∑",
    typeLabelAr: "تمرين الجبر والحسابيات والبنيات",
    typeLabelFr: "Algèbre, Arithmétique & Structures",
    shortNavLabelAr: "جبر ∑",
    shortNavLabelFr: "Algèbre ∑",
    pedagogicalRoleAr: "القسمة الإقليدية، الموافقة بترديد، المصفوفات، وقوانين التركيب",
    accentHex: "#b45309",
    softBgHex: "#fffbeb",
    borderHex: "#fcd34d",
  },
  LOGIC: {
    iconId: "LOGIC",
    mathSymbol: "∀∃",
    typeLabelAr: "تمرين المنطق والمجموعات والاستدلال",
    typeLabelFr: "Logique, Ensembles & Raisonnement",
    shortNavLabelAr: "منطق ∀∃",
    shortNavLabelFr: "Logique ∀∃",
    pedagogicalRoleAr: "المكممات، الاستلزام والتكافؤ، الخلف، وفصل الحالات",
    accentHex: "#0f766e",
    softBgHex: "#f0fdfa",
    borderHex: "#5eead4",
  },
};

export interface ReadingModeExerciseNavItem {
  exerciseIndex: number;
  exerciseNumber: number;
  domAnchorId: string;
  iconId: ReadingModeExerciseTypeIconId;
  mathSymbol: string;
  typeLabelAr: string;
  typeLabelFr: string;
  shortNavLabelAr: string;
  shortNavLabelFr: string;
  titleAr: string;
  titleFr: string;
  points: number;
  weightPct: number;
  accentHex: string;
  softBgHex: string;
  borderHex: string;
  isSynthesisProblem?: boolean;
}

/**
 * بناء عناصر شريط التنقل البصري السريع بين التمارين في وضع القراءة مع أيقونات مخصصة لكل نوع رياضي
 */
export function buildReadingModeExerciseNavigatorItems(
  lessons: LessonItem[],
  options?: {
    customExerciseTitles?: Record<number, string>;
    customLessonIconsMap?: Record<string, LessonHeaderIconId>;
    customWeightsMap?: Record<string, number>;
    hasSynthesisProblem?: boolean;
    synthesisProblemTitleAr?: string;
    synthesisProblemTitleFr?: string;
  }
): ReadingModeExerciseNavItem[] {
  const safeLessons = Array.isArray(lessons) ? lessons : [];
  const items: ReadingModeExerciseNavItem[] = safeLessons.map((lesson, idx) => {
    const lessonKey = lesson.lessonFr || `${lesson.weight}-${idx}`;
    const explicitOverride =
      options?.customLessonIconsMap?.[lessonKey] || lesson.customHeaderIcon;
    const resolvedOption = resolveLessonHeaderIcon(lesson, explicitOverride);
    const resolvedIconId: ReadingModeExerciseTypeIconId =
      resolvedOption && resolvedOption.id !== "AUTO" && resolvedOption.id !== "NONE"
        ? resolvedOption.id
        : detectAutoLessonHeaderIconId(lesson);

    const spec =
      READING_MODE_EXERCISE_TYPE_SPECS[resolvedIconId] ||
      READING_MODE_EXERCISE_TYPE_SPECS.FUNCTION;

    const effectiveWeight =
      options?.customWeightsMap?.[lessonKey] !== undefined
        ? options.customWeightsMap[lessonKey]
        : lesson.weight || Math.round(100 / Math.max(1, safeLessons.length));

    const points = Number(((effectiveWeight * 20) / 100).toFixed(1));
    const customTitle = options?.customExerciseTitles?.[idx]?.trim();

    return {
      exerciseIndex: idx,
      exerciseNumber: idx + 1,
      domAnchorId: `reading-mode-exercise-${idx + 1}`,
      iconId: resolvedIconId,
      mathSymbol: spec.mathSymbol,
      typeLabelAr: spec.typeLabelAr,
      typeLabelFr: spec.typeLabelFr,
      shortNavLabelAr: spec.shortNavLabelAr,
      shortNavLabelFr: spec.shortNavLabelFr,
      titleAr: customTitle || lesson.lessonAr || `التمرين ${idx + 1}`,
      titleFr: customTitle || lesson.lessonFr || `Exercice ${idx + 1}`,
      points,
      weightPct: effectiveWeight,
      accentHex: spec.accentHex,
      softBgHex: spec.softBgHex,
      borderHex: spec.borderHex,
      isSynthesisProblem: false,
    };
  });

  if (options?.hasSynthesisProblem) {
    const synthSpec = READING_MODE_EXERCISE_TYPE_SPECS.FUNCTION;
    items.push({
      exerciseIndex: items.length,
      exerciseNumber: items.length + 1,
      domAnchorId: "reading-mode-synthesis-problem",
      iconId: "FUNCTION",
      mathSymbol: "★ f(x)",
      typeLabelAr: "المسألة التوليفية الشاملة",
      typeLabelFr: "Problème de Synthèse",
      shortNavLabelAr: "مسألة توليفية",
      shortNavLabelFr: "Problème",
      titleAr: options.synthesisProblemTitleAr || "المسألة التوليفية الشاملة",
      titleFr: options.synthesisProblemTitleFr || "Problème de Synthèse",
      points: 8,
      weightPct: 40,
      accentHex: synthSpec.accentHex,
      softBgHex: synthSpec.softBgHex,
      borderHex: synthSpec.borderHex,
      isSynthesisProblem: true,
    });
  }

  return items;
}

export interface ReadingModeConfig {
  enabled: boolean;
  /** نسبة تكبير نص التمارين والمعادلات (105% إلى 165% — الافتراضي 125%) */
  exerciseScalePercent: number;
  /** لون خلفية الورقة المريح للعين أثناء المراجعة */
  paperTone: ReadingModePaperTone;
  /** نمط عرض الصفحات: صفحة واحدة أو صفحات متقابلة (Dual-Page Spread) لراحة المراجعة على الأجهزة اللوحية */
  spreadLayoutMode: ReadingModeSpreadLayout;
  /** تباعد الأسطر المريح للقراءة والمراجعة */
  lineHeightRatio: number;
  /** إخفاء كافة أشرطة التحكم الجانبية والعلوية للتركيز الكامل على الوثيقة */
  hideAllSideControls: boolean;
  /** إبراز بطاقات التمارين بحواف واضحة وتباعد مريح */
  highlightExerciseCards: boolean;
  /** إظهار شريط وأيقونات التنقل المخصصة لكل نوع من التمارين الرياضية */
  showExerciseTypeNavigator?: boolean;
  /** تصفية أو إبراز نوع محدد من التمارين الرياضية أثناء وضع القراءة */
  activeExerciseFilterIconId?: ReadingModeExerciseTypeIconId | "ALL";
}

export const DEFAULT_READING_MODE_CONFIG: ReadingModeConfig = {
  enabled: false,
  exerciseScalePercent: 125,
  paperTone: "WARM_CREAM",
  spreadLayoutMode: "SINGLE_PAGE",
  lineHeightRatio: 1.85,
  hideAllSideControls: true,
  highlightExerciseCards: true,
  showExerciseTypeNavigator: true,
  activeExerciseFilterIconId: "ALL",
};

export const READING_MODE_SCALE_PRESETS: Array<{
  scale: number;
  badgeAr: string;
  badgeFr: string;
  descAr: string;
}> = [
  {
    scale: 115,
    badgeAr: "115% (مريح)",
    badgeFr: "115% (Confort)",
    descAr: "تكبير طفيف مع الحفاظ على كثافة الصفحة",
  },
  {
    scale: 125,
    badgeAr: "125% (قياسي)",
    badgeFr: "125% (Standard)",
    descAr: "تكبير مثالي لمراجعة التمارين والرموز الرياضية",
  },
  {
    scale: 135,
    badgeAr: "135% (واضح)",
    badgeFr: "135% (Large)",
    descAr: "تكبير واضح للكسور والنهايات والتكاملات",
  },
  {
    scale: 150,
    badgeAr: "150% (فائق)",
    badgeFr: "150% (Très Grand)",
    descAr: "تكبير فائق للقراءة المريحة عن بُعد والتدقيق الدقيق",
  },
];

export const READING_MODE_PAPER_TONES: Array<{
  id: ReadingModePaperTone;
  labelAr: string;
  labelFr: string;
  bgHex: string;
  borderHex: string;
}> = [
  {
    id: "WARM_CREAM",
    labelAr: "كريمي دافئ مريح للعين",
    labelFr: "Crème Sépia Confort",
    bgHex: "#fdfbf4",
    borderHex: "#e5dcc5",
  },
  {
    id: "PURE_WHITE",
    labelAr: "أبيض ناصع قياسي (A4)",
    labelFr: "Blanc Pur A4",
    bgHex: "#ffffff",
    borderHex: "#cbd5e1",
  },
  {
    id: "SOFT_SLATE",
    labelAr: "رمادي هادئ مضاد للتوهج",
    labelFr: "Gris Doux Anti-Reflet",
    bgHex: "#f8fafc",
    borderHex: "#cbd5e1",
  },
];

/**
 * يولد قواعد CSS المخصصة لوضع القراءة (@media screen فقط حتى لا تتأثر الطباعة الفعلية A4)
 * لتكبير نصوص التمارين والأسئلة والمعادلات الرياضية ودعم عرض الصفحات المتقابل وأيقونات التنقل بين التمارين
 */
export function buildReadingModeStylesheet(config: ReadingModeConfig): string {
  if (!config.enabled) return "";

  const clampedScale = Math.max(105, Math.min(165, config.exerciseScalePercent || 125));
  const scaleFactor = Number((clampedScale / 100).toFixed(2));
  const bodyFontRem = Number((0.82 * scaleFactor).toFixed(3));
  const headerFontRem = Number((0.95 * scaleFactor).toFixed(3));
  const lineHeight = Math.max(1.5, Math.min(2.3, config.lineHeightRatio || 1.85));
  const itemSpacingRem = Number((0.55 * scaleFactor).toFixed(2));

  const toneSpec =
    READING_MODE_PAPER_TONES.find((t) => t.id === config.paperTone) ||
    READING_MODE_PAPER_TONES[0];

  const rules: string[] = [
    `/* --- قواعد وضع القراءة والمراجعة المركّزة (Reading Mode — Screen Only) --- */`,
    `@media screen {`,
    `  #printable-document-sheet[data-reading-mode="true"] {`,
    `    background-color: ${toneSpec.bgHex} !important;`,
    `    border-color: ${toneSpec.borderHex} !important;`,
    `    box-shadow: 0 20px 50px -12px rgba(15, 23, 42, 0.25) !important;`,
    `    transition: font-size 0.2s ease, background-color 0.2s ease;`,
    `  }`,
    `  #printable-document-sheet[data-reading-mode="true"] [data-reading-exercise-anchor] {`,
    `    scroll-margin-top: 7.5rem !important;`,
    `    transition: box-shadow 0.2s ease, opacity 0.2s ease, transform 0.2s ease;`,
    `  }`,
    `  #printable-document-sheet[data-reading-mode="true"] [data-reading-exercise-icon-badge="true"] {`,
    `    transform: scale(1.06);`,
    `    padding: 0.25rem 0.55rem !important;`,
    `  }`,
    `  #printable-document-sheet[data-reading-mode="true"] ol,`,
    `  #printable-document-sheet[data-reading-mode="true"] ul,`,
    `  #printable-document-sheet[data-reading-mode="true"] li,`,
    `  #printable-document-sheet[data-reading-mode="true"] [data-sync-section="EXERCISES"] p,`,
    `  #printable-document-sheet[data-reading-mode="true"] [data-sync-section="SYNTHESIS_PROBLEM"] p,`,
    `  #printable-document-sheet[data-reading-mode="true"] [data-sync-section="SOLUTIONS"] p,`,
    `  #printable-document-sheet[data-reading-mode="true"] [data-sync-section="SOLUTIONS"] li {`,
    `    font-size: ${bodyFontRem}rem !important;`,
    `    line-height: ${lineHeight} !important;`,
    `  }`,
    `  #printable-document-sheet[data-reading-mode="true"] ol > li + li,`,
    `  #printable-document-sheet[data-reading-mode="true"] ul > li + li {`,
    `    margin-top: ${itemSpacingRem}rem !important;`,
    `  }`,
    `  #printable-document-sheet[data-reading-mode="true"] [data-sync-section="EXERCISES"] > div:first-child {`,
    `    font-size: ${headerFontRem}rem !important;`,
    `    padding-top: 0.55rem !important;`,
    `    padding-bottom: 0.55rem !important;`,
    `  }`,
    `  #printable-document-sheet[data-reading-mode="true"] .katex {`,
    `    font-size: 1.08em !important;`,
    `  }`,
  ];

  if (config.highlightExerciseCards) {
    rules.push(
      `  #printable-document-sheet[data-reading-mode="true"] [data-sync-section="EXERCISES"] {`,
      `    padding: 1.25rem !important;`,
      `    margin-bottom: 1.15rem !important;`,
      `    border-radius: 0.85rem !important;`,
      `  }`
    );
  }

  if (
    config.activeExerciseFilterIconId &&
    config.activeExerciseFilterIconId !== "ALL"
  ) {
    rules.push(
      `  #printable-document-sheet[data-reading-mode="true"] [data-exercise-icon-type]:not([data-exercise-icon-type="${config.activeExerciseFilterIconId}"]) {`,
      `    opacity: 0.38 !important;`,
      `  }`,
      `  #printable-document-sheet[data-reading-mode="true"] [data-exercise-icon-type="${config.activeExerciseFilterIconId}"] {`,
      `    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.55) !important;`,
      `  }`
    );
  }

  // دعم «عرض الصفحات المتقابل (Facing Pages / Dual Spread)» على الأجهزة اللوحية والشاشات العريضة
  if (config.spreadLayoutMode === "FACING_PAGES") {
    rules.push(
      `  /* --- نمط عرض الصفحات المتقابل (Facing Pages / Dual Spread) للأجهزة اللوحية والحواسيب --- */`,
      `  #printable-document-sheet[data-reading-mode="true"][data-reading-spread="FACING_PAGES"] {`,
      `    max-width: 98vw !important;`,
      `    width: 98vw !important;`,
      `    padding-left: 2rem !important;`,
      `    padding-right: 2rem !important;`,
      `    box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35) !important;`,
      `    position: relative;`,
      `  }`,
      `  @media (min-width: 768px) {`,
      `    #printable-document-sheet[data-reading-mode="true"][data-reading-spread="FACING_PAGES"] .exercises-container,`,
      `    #printable-document-sheet[data-reading-mode="true"][data-reading-spread="FACING_PAGES"] [data-sync-section="EXERCISES-CONTAINER"] {`,
      `      display: grid !important;`,
      `      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;`,
      `      column-gap: 2.25rem !important;`,
      `      row-gap: 1.25rem !important;`,
      `      align-items: start !important;`,
      `      position: relative !important;`,
      `    }`,
      `    /* فاصل الطي الأوسط بين الصفحتين المتقابلتين كالكتاب المفتوح */`,
      `    #printable-document-sheet[data-reading-mode="true"][data-reading-spread="FACING_PAGES"] .exercises-container::before,`,
      `    #printable-document-sheet[data-reading-mode="true"][data-reading-spread="FACING_PAGES"] [data-sync-section="EXERCISES-CONTAINER"]::before {`,
      `      content: "";`,
      `      position: absolute;`,
      `      top: 0;`,
      `      bottom: 0;`,
      `      left: 50%;`,
      `      width: 2px;`,
      `      background: linear-gradient(to bottom, transparent, rgba(148, 163, 184, 0.6) 10%, rgba(148, 163, 184, 0.6) 90%, transparent);`,
      `      transform: translateX(-50%);`,
      `      pointer-events: none;`,
      `    }`,
      `    /* شبكة الحلول في صفحة الملحق عند تفعيل العرض المتقابل */`,
      `    #printable-document-sheet[data-reading-mode="true"][data-reading-spread="FACING_PAGES"] .solutions-container,`,
      `    #printable-document-sheet[data-reading-mode="true"][data-reading-spread="FACING_PAGES"] [data-sync-section="SOLUTIONS-CONTAINER"] {`,
      `      display: grid !important;`,
      `      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;`,
      `      column-gap: 2.25rem !important;`,
      `      row-gap: 1.25rem !important;`,
      `      align-items: start !important;`,
      `    }`,
      `    /* المسألة التوليفية تمتد على عرض الصفحتين إن وجدت */`,
      `    #printable-document-sheet[data-reading-mode="true"][data-reading-spread="FACING_PAGES"] [data-sync-section="SYNTHESIS_PROBLEM"] {`,
      `      grid-column: 1 / -1 !important;`,
      `    }`,
      `  }`
    );
  }

  rules.push(`}`);
  return rules.join("\n");
}




