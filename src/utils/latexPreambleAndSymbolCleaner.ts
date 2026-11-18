/**
 * محرك تنظيف ملفات LaTeX المستوردة وهندسة الترويسة
 * LaTeX Preamble & Symbol Optimizer Engine
 * 
 * الميزات:
 * 1. تحويل كافة الرموز الرياضية واليونيكود غير القياسية إلى صيغ LaTeX متوافقة.
 * 2. تحديث الأوامر القديمة والمهملة (\over, \choose, \bf, \it, \cal...).
 * 3. تصحيح ترتيب الحزم في الترويسة (preamble) حسب الأسبقية الصارمة لمنع أخطاء التعارض (Option Clash & Package Dependencies).
 * 4. نقل hyperref إلى ذيل الترويسة، وضمان تحميل الحزم التي تليها (cleveref, autonum, bookmark) بعدها حصراً.
 * 5. دمج وتوحيد خيارات الحزم المكررة وحل تعارض خيارات xcolor وتجنب تعارضات tikz/tcolorbox/amsthm.
 */

export interface PackageEntry {
  raw: string;
  name: string;
  options: string[];
  comment?: string;
}

export interface PreambleAnalysisReport {
  documentClass: {
    raw: string;
    className: string;
    options: string[];
  } | null;
  originalPackagesCount: number;
  reorderedPackagesCount: number;
  deduplicatedPackagesCount: number;
  clashResolvedCount: number;
  hasHyperref: boolean;
  hasCleveref: boolean;
  hyperrefRepositioned: boolean;
  cleverefRepositioned: boolean;
  amsthmOrderFixed: boolean;
  xcolorClashFixed: boolean;
  cleanedPreamblePackages: PackageEntry[];
  unrecognizedPreambleLines: string[];
}

export interface SymbolCleaningReport {
  mathSymbolsConvertedCount: number;
  superscriptsSubscriptsConvertedCount: number;
  greekLettersConvertedCount: number;
  quotesAndDashesConvertedCount: number;
  obsoleteCommandsUpdatedCount: number;
  invisibleCharsRemovedCount: number;
  unescapedSpecialCharsFixedCount: number;
  totalConversionsCount: number;
  sampleConversions: Array<{
    categoryAr: string;
    original: string;
    converted: string;
    count: number;
  }>;
}

export interface LatexCleaningResult {
  originalCode: string;
  cleanedCode: string;
  preambleReport: PreambleAnalysisReport;
  symbolReport: SymbolCleaningReport;
  auditLog: Array<{
    type: "PREAMBLE" | "SYMBOL" | "COMMAND" | "TYPOGRAPHY";
    titleAr: string;
    descriptionAr: string;
    severity: "INFO" | "SUCCESS" | "WARNING";
  }>;
}

export interface LatexCleanerOptions {
  reorderPreamble?: boolean;
  resolvePackageClashes?: boolean;
  convertUnicodeMathSymbols?: boolean;
  convertSuperscriptsSubscripts?: boolean;
  modernizeObsoleteCommands?: boolean;
  cleanInvisibleAndQuotes?: boolean;
  escapeUnescapedTextPercents?: boolean;
  targetEngine?: "PDFLATEX" | "XELATEX_LUALATEX" | "AUTO";
}

export const DEFAULT_CLEANER_OPTIONS: LatexCleanerOptions = {
  reorderPreamble: true,
  resolvePackageClashes: true,
  convertUnicodeMathSymbols: true,
  convertSuperscriptsSubscripts: true,
  modernizeObsoleteCommands: true,
  cleanInvisibleAndQuotes: true,
  escapeUnescapedTextPercents: true,
  targetEngine: "AUTO",
};

/**
 * مصفوفة تصنيف الحزم وأولويات التحميل الصارمة في الترويسة
 * Tiers:
 * 1: TeX Engine & Encodings (iftex, fontenc, inputenc)
 * 2: Fonts & Typography (fontspec, amsfonts, lmodern, fourier)
 * 3: Math Suites & AMS (amsmath, mathtools, amssymb - NOTE: amsthm MUST be after amsmath)
 * 4: Colors & Drawing Graphics (xcolor MUST precede tikz, tcolorbox, pgfplots, bclogo)
 * 5: Geometry & Page Dimensions (geometry, layout)
 * 6: Headers & Footers (fancyhdr, lastpage)
 * 7: Boxes & Framing (tcolorbox, mdframed, bclogo, framed)
 * 8: Tables & Lists (array, booktabs, tabularx, multirow, enumitem, tasks, multicol)
 * 9: Code & Verbatim (listings, minted)
 * 10: Internationalization (babel, polyglossia, csquotes, arabtex)
 * 11: Miscellaneous Packages
 * 12: Hyperref & Links (MUST be almost last)
 * 13: Post-Hyperref Packages (cleveref, autonum, bookmark, hypcap, glossaries - MUST be after hyperref)
 */
export const PACKAGE_TIER_PRIORITY: Record<string, { tier: number; order: number; labelAr: string }> = {
  // Tier 1: Encodings & Engine Detection
  iftex: { tier: 1, order: 10, labelAr: "التحقق من محرك TeX" },
  ifluatex: { tier: 1, order: 11, labelAr: "التحقق من LuaTeX" },
  ifxetex: { tier: 1, order: 12, labelAr: "التحقق من XeTeX" },
  fontenc: { tier: 1, order: 20, labelAr: "ترميز الخطوط القياسي T1" },
  inputenc: { tier: 1, order: 30, labelAr: "ترميز الإدخال UTF-8" },
  fontspec: { tier: 1, order: 40, labelAr: "إدارة خطوط النظام الحديثة" },
  microtype: { tier: 1, order: 50, labelAr: "الضبط الميكرو-طباعي" },

  // Tier 2: Math Packages (AMS & Extensions)
  // ملاحظة صارمة: amsmath أو mathtools يجب أن يسبقا amsthm دائماً
  mathtools: { tier: 2, order: 10, labelAr: "محرك الرياضيات المتقدم mathtools" },
  amsmath: { tier: 2, order: 20, labelAr: "حزمة الرياضيات الأساسية amsmath" },
  amssymb: { tier: 2, order: 30, labelAr: "رموز الرياضيات الموسعة amssymb" },
  amsfonts: { tier: 2, order: 40, labelAr: "خطوط ومحارف الرياضيات amsfonts" },
  amsthm: { tier: 2, order: 50, labelAr: "بيئات المبرهنات amsthm (بعد amsmath حتماً)" },
  bm: { tier: 2, order: 60, labelAr: "الخط الرياضي العريض bm" },
  esint: { tier: 2, order: 70, labelAr: "رموز التكاملات المزدوجة والمغلقة" },
  cancel: { tier: 2, order: 80, labelAr: "التشطيب والاختزال الجبري" },
  mathrsfs: { tier: 2, order: 90, labelAr: "محارف الخط التمايزيmathscr" },
  stmaryrd: { tier: 2, order: 100, labelAr: "رموز المجالات المزدوجة" },
  derivative: { tier: 2, order: 110, labelAr: "تنسيق المشتقات والكسور التفاضلية" },
  physics: { tier: 2, order: 120, labelAr: "صيغ الرياضيات والفيزياء" },

  // Tier 3: Colors & Core Graphics (xcolor يجب أن تسبق أي حزمة رسم أو تلوين)
  xcolor: { tier: 3, order: 10, labelAr: "محرك الألوان xcolor (يسبق التلوين والرسم)" },
  color: { tier: 3, order: 15, labelAr: "ألوان كلاسيكية" },
  graphicx: { tier: 3, order: 20, labelAr: "إدراج الصور والأشكال graphicx" },
  tikz: { tier: 3, order: 30, labelAr: "محرك الرسم الرياضي والبياني TikZ" },
  pgfplots: { tier: 3, order: 40, labelAr: "منحنيات الدوال الحسابية pgfplots" },
  "tkz-tab": { tier: 3, order: 50, labelAr: "جداول التغيرات والإشارة tkz-tab" },
  "tkz-euclide": { tier: 3, order: 60, labelAr: "الهندسة الإقليدية tkz-euclide" },

  // Tier 4: Page Geometry & Dimensions
  geometry: { tier: 4, order: 10, labelAr: "هوامش وأبعاد الصفحة geometry" },
  layout: { tier: 4, order: 20, labelAr: "مخطط الورقة" },
  changepage: { tier: 4, order: 30, labelAr: "تغيير هوامش المقاطع" },

  // Tier 5: Header, Footers & Structuring
  fancyhdr: { tier: 5, order: 10, labelAr: "الترويسات والتذييلات fancyhdr" },
  lastpage: { tier: 5, order: 20, labelAr: "ترقيم الصفحة الإجمالي LastPage" },
  titlesec: { tier: 5, order: 30, labelAr: "تنسيق العناوين والفقرات" },
  titletoc: { tier: 5, order: 40, labelAr: "فهارس الأبواب" },

  // Tier 6: Boxes & High-Level Framing
  tcolorbox: { tier: 6, order: 10, labelAr: "الصناديق الملونة tcolorbox" },
  mdframed: { tier: 6, order: 20, labelAr: "التأطير الجانبي mdframed" },
  bclogo: { tier: 6, order: 30, labelAr: "شارات التنبيه بيداغوجية bclogo" },
  framed: { tier: 6, order: 40, labelAr: "الإطارات الكلاسيكية framed" },

  // Tier 7: Tables, Arrays & Lists
  array: { tier: 7, order: 10, labelAr: "مصفوفات الجداول المتقدمة array" },
  booktabs: { tier: 7, order: 20, labelAr: "خطوط الجداول الأكاديمية booktabs" },
  tabularx: { tier: 7, order: 30, labelAr: "جداول العرض المتكيف tabularx" },
  multirow: { tier: 7, order: 40, labelAr: "دمج الصفوف multirow" },
  colortbl: { tier: 7, order: 50, labelAr: "تلوين خلايا الجداول" },
  enumitem: { tier: 7, order: 60, labelAr: "ترقيم القوائم والتفريعات enumitem" },
  tasks: { tier: 7, order: 70, labelAr: "أسئلة أفقية متعددة الأعمدة tasks" },
  multicol: { tier: 7, order: 80, labelAr: "توزيع الأعمدة multicolor" },

  // Tier 8: Code & Listings
  listings: { tier: 8, order: 10, labelAr: "كود البرمجة وبايثون listings" },
  minted: { tier: 8, order: 20, labelAr: "تلوين الأكواد البرمجية minted" },

  // Tier 9: Languages & Internationalization
  babel: { tier: 9, order: 10, labelAr: "تدويل اللغات babel" },
  polyglossia: { tier: 9, order: 20, labelAr: "تدويل اللغات الحديث polyglossia" },
  csquotes: { tier: 9, order: 30, labelAr: "علامات الاقتباس الموجهة csquotes" },
  arabtex: { tier: 9, order: 40, labelAr: "الخط العربي التقليدي ArabTeX" },

  // Tier 10: General & Utilities (Default tier for unlisted packages is 10)
  hyperref: { tier: 11, order: 10, labelAr: "الروابط التفاعلية hyperref (قرب نهاية الترويسة)" },
  url: { tier: 11, order: 5, labelAr: "روابط الويب url" },

  // Tier 12: Post-Hyperref Packages (الحزم التي يجب تحميلها حتماً بعد hyperref)
  cleveref: { tier: 12, order: 10, labelAr: "الإحالات المرجعية الذكية cleveref (بعد hyperref حتماً)" },
  autonum: { tier: 12, order: 20, labelAr: "الترقيم التلقائي للمعادلات المستعملة" },
  bookmark: { tier: 12, order: 30, labelAr: "فهارس PDF التفاعلية bookmark" },
  hypcap: { tier: 12, order: 40, labelAr: "محاذاة مراسي الصور hypcap" },
  glossaries: { tier: 12, order: 50, labelAr: "معاجم المصطلحات glossaries" },
  subcaption: { tier: 12, order: 60, labelAr: "العناوين الفرعية للأشكال subcaption" },
};

/**
 * خريطة استبدال الأوامر والرموز القديمة المهملة في TeX
 */
export const OBSOLETE_TEX_COMMANDS: Array<{
  regex: RegExp;
  replaceWith: string | ((...args: string[]) => string);
  nameAr: string;
}> = [
  {
    regex: /\\matrix\s*\{([\s\S]*?)\}/g,
    replaceWith: "\\begin{pmatrix}$1\\end{pmatrix}",
    nameAr: "أمر \\matrix القديم → بيئة pmatrix القياسية",
  },
  {
    regex: /\{\s*([^{}]+?)\s*\\over\s*([^{}]+?)\s*\}/g,
    replaceWith: "\\frac{$1}{$2}",
    nameAr: "صيغة {a \\over b} القديمة → \\frac{a}{b}",
  },
  {
    regex: /\{\s*([^{}]+?)\s*\\choose\s*([^{}]+?)\s*\}/g,
    replaceWith: "\\binom{$1}{$2}",
    nameAr: "صيغة {n \\choose k} القديمة → \\binom{n}{k}",
  },
  {
    regex: /\{\s*\\bf\s+([^{}]+?)\s*\}/g,
    replaceWith: "\\textbf{$1}",
    nameAr: "تبديل الخط {\\bf ...} القديم → \\textbf{...}",
  },
  {
    regex: /\{\s*\\it\s+([^{}]+?)\s*\}/g,
    replaceWith: "\\textit{$1}",
    nameAr: "تبديل الخط {\\it ...} القديم → \\textit{...}",
  },
  {
    regex: /\{\s*\\tt\s+([^{}]+?)\s*\}/g,
    replaceWith: "\\texttt{$1}",
    nameAr: "تبديل الخط {\\tt ...} القديم → \\texttt{...}",
  },
  {
    regex: /\{\s*\\rm\s+([^{}]+?)\s*\}/g,
    replaceWith: "\\textrm{$1}",
    nameAr: "تبديل الخط {\\rm ...} القديم → \\textrm{...}",
  },
  {
    regex: /\{\s*\\cal\s+([^{}]+?)\s*\}/g,
    replaceWith: "\\mathcal{$1}",
    nameAr: "تبديل الخط {\\cal ...} القديم → \\mathcal{...}",
  },
  {
    regex: /\\bf\b(?!\w)/g,
    replaceWith: "\\bfseries",
    nameAr: "أمر \\bf المنعزل → \\bfseries القياسي",
  },
  {
    regex: /\\it\b(?!\w)/g,
    replaceWith: "\\itshape",
    nameAr: "أمر \\it المنعزل → \\itshape القياسي",
  },
  {
    regex: /\\tt\b(?!\w)/g,
    replaceWith: "\\ttfamily",
    nameAr: "أمر \\tt المنعزل → \\ttfamily القياسي",
  },
  {
    regex: /\\rm\b(?!\w)/g,
    replaceWith: "\\rmfamily",
    nameAr: "أمر \\rm المنعزل → \\rmfamily القياسي",
  },
];

/**
 * قاموس شامل لتحويل الرموز الرياضية اليونيكود إلى أوامر LaTeX القياسية
 */
export const UNICODE_MATH_SYMBOLS_MAP: Array<{
  regex: RegExp;
  latex: string;
  category: "SETS" | "RELATIONS" | "OPERATORS" | "ARROWS" | "LOGIC" | "CALCULUS" | "GEOMETRY" | "GREEK";
  nameAr: string;
}> = [
  // المجموعات العددية (Blackboard Bold)
  { regex: /ℝ/g, latex: "\\mathbb{R}", category: "SETS", nameAr: "مجموعة الأعداد الحقيقية ℝ" },
  { regex: /ℂ/g, latex: "\\mathbb{C}", category: "SETS", nameAr: "مجموعة الأعداد العقدية ℂ" },
  { regex: /ℕ/g, latex: "\\mathbb{N}", category: "SETS", nameAr: "مجموعة الأعداد الصحيحة الطبيعية ℕ" },
  { regex: /ℤ/g, latex: "\\mathbb{Z}", category: "SETS", nameAr: "مجموعة الأعداد الصحيحة النسبية ℤ" },
  { regex: /ℚ/g, latex: "\\mathbb{Q}", category: "SETS", nameAr: "مجموعة الأعداد الجذرية ℚ" },
  { regex: /ℙ/g, latex: "\\mathbb{P}", category: "SETS", nameAr: "مجموعة الأعداد الأولية أو فضاء الاحتمال ℙ" },
  { regex: /∅/g, latex: "\\emptyset ", category: "SETS", nameAr: "المجموعة الفارغة ∅" },
  { regex: /⊂/g, latex: "\\subset ", category: "SETS", nameAr: "ضمن ⊂" },
  { regex: /⊃/g, latex: "\\supset ", category: "SETS", nameAr: "تحتوي ⊃" },
  { regex: /⊆/g, latex: "\\subseteq ", category: "SETS", nameAr: "ضمن أو تساوي ⊆" },
  { regex: /⊇/g, latex: "\\supseteq ", category: "SETS", nameAr: "تحتوي أو تساوي ⊇" },
  { regex: /⊊/g, latex: "\\subsetneq ", category: "SETS", nameAr: "تضمين قطعي ⊊" },
  { regex: /∪/g, latex: "\\cup ", category: "SETS", nameAr: "اتحاد ∪" },
  { regex: /∩/g, latex: "\\cap ", category: "SETS", nameAr: "تقاطع ∩" },
  { regex: /∖/g, latex: "\\setminus ", category: "SETS", nameAr: "فرق المجموعات ∖" },
  { regex: /∈/g, latex: "\\in ", category: "SETS", nameAr: "ينتمي إلى ∈" },
  { regex: /∉/g, latex: "\\notin ", category: "SETS", nameAr: "لا ينتمي إلى ∉" },
  { regex: /∋/g, latex: "\\ni ", category: "SETS", nameAr: "يحتوي كعنصر ∋" },

  // المنطق الرياضي والاستلزام
  { regex: /∀/g, latex: "\\forall ", category: "LOGIC", nameAr: "لكل (المهَمّم الكوني) ∀" },
  { regex: /∃/g, latex: "\\exists ", category: "LOGIC", nameAr: "يوجد (المهَمّم الوجودي) ∃" },
  { regex: /∄/g, latex: "\\nexists ", category: "LOGIC", nameAr: "لا يوجد ∄" },
  { regex: /∧/g, latex: "\\land ", category: "LOGIC", nameAr: "عطف منطقي (و) ∧" },
  { regex: /∨/g, latex: "\\lor ", category: "LOGIC", nameAr: "فصل منطقي (أو) ∨" },
  { regex: /¬/g, latex: "\\neg ", category: "LOGIC", nameAr: "نفي منطقي ¬" },
  { regex: /⇒|⟹/g, latex: "\\implies ", category: "LOGIC", nameAr: "استلزام منطقي ⇒" },
  { regex: /⇐|⟸/g, latex: "\\impliedby ", category: "LOGIC", nameAr: "استلزام عكسي ⇐" },
  { regex: /⇔|⟺/g, latex: "\\iff ", category: "LOGIC", nameAr: "تكافؤ منطقي ⇔" },
  { regex: /⇏/g, latex: "\\not\\implies ", category: "LOGIC", nameAr: "لا يستلزم ⇏" },
  { regex: /⇎/g, latex: "\\not\\iff ", category: "LOGIC", nameAr: "لا يكافئ ⇎" },

  // المقارنات والعلاقات
  { regex: /≤/g, latex: "\\leq ", category: "RELATIONS", nameAr: "أصغر من أو يساوي ≤" },
  { regex: /≥/g, latex: "\\geq ", category: "RELATIONS", nameAr: "أكبر من أو يساوي ≥" },
  { regex: /≠/g, latex: "\\neq ", category: "RELATIONS", nameAr: "يخالف ≠" },
  { regex: /≈/g, latex: "\\approx ", category: "RELATIONS", nameAr: "تقريباً يساوي ≈" },
  { regex: /≡/g, latex: "\\equiv ", category: "RELATIONS", nameAr: "يوافق أو يطابق ≡" },
  { regex: /≪/g, latex: "\\ll ", category: "RELATIONS", nameAr: "أصغر بكثير ≪" },
  { regex: /≫/g, latex: "\\gg ", category: "RELATIONS", nameAr: "أكبر بكثير ≫" },
  { regex: /∝/g, latex: "\\propto ", category: "RELATIONS", nameAr: "يتناسب مع ∝" },
  { regex: /∼/g, latex: "\\sim ", category: "RELATIONS", nameAr: "علاقة تكافؤ أو توزيع ∼" },
  { regex: /≃/g, latex: "\\simeq ", category: "RELATIONS", nameAr: "تقريباً مقارب ≃" },
  { regex: /≅/g, latex: "\\cong ", category: "RELATIONS", nameAr: "تماكل أو تطابق ≅" },

  // العمليات الجبرية والحسابية
  { regex: /±/g, latex: "\\pm ", category: "OPERATORS", nameAr: "زائد أو ناقص ±" },
  { regex: /∓/g, latex: "\\mp ", category: "OPERATORS", nameAr: "ناقص أو زائد ∓" },
  { regex: /×/g, latex: "\\times ", category: "OPERATORS", nameAr: "جداء ضرب ×" },
  { regex: /÷/g, latex: "\\div ", category: "OPERATORS", nameAr: "قسمة ÷" },
  { regex: /·|•/g, latex: "\\cdot ", category: "OPERATORS", nameAr: "جداء نقطي ·" },
  { regex: /∘/g, latex: "\\circ ", category: "OPERATORS", nameAr: "تركيب الدوال ∘" },
  { regex: /∗/g, latex: "\\ast ", category: "OPERATORS", nameAr: "قانون تركيب داخلي ∗" },
  { regex: /⊕/g, latex: "\\oplus ", category: "OPERATORS", nameAr: "مجموع مباشر ⊕" },
  { regex: /⊗/g, latex: "\\otimes ", category: "OPERATORS", nameAr: "جداء موتر ⊗" },

  // الأسهم والتحويلات
  { regex: /→|⟶/g, latex: "\\to ", category: "ARROWS", nameAr: "يؤول إلى أو سهم دالة →" },
  { regex: /←|⟵/g, latex: "\\leftarrow ", category: "ARROWS", nameAr: "سهم يسار ←" },
  { regex: /↔|⟷/g, latex: "\\leftrightarrow ", category: "ARROWS", nameAr: "سهم مزدوج ↔" },
  { regex: /↦|⟼/g, latex: "\\mapsto ", category: "ARROWS", nameAr: "يربط العنصر بـ ↦" },
  { regex: /↑/g, latex: "\\uparrow ", category: "ARROWS", nameAr: "سهم صاعد ↑" },
  { regex: /↓/g, latex: "\\downarrow ", category: "ARROWS", nameAr: "سهم نازل ↓" },

  // التحليل والتكامل والحسابيات
  { regex: /∑/g, latex: "\\sum ", category: "CALCULUS", nameAr: "رمز المجموع المباشر ∑" },
  { regex: /∏/g, latex: "\\prod ", category: "CALCULUS", nameAr: "رمز الجداء المباشر ∏" },
  { regex: /∫/g, latex: "\\int ", category: "CALCULUS", nameAr: "رمز التكامل المباشر ∫" },
  { regex: /∬/g, latex: "\\iint ", category: "CALCULUS", nameAr: "تكامل ثنائي ∬" },
  { regex: /∭/g, latex: "\\iiint ", category: "CALCULUS", nameAr: "تكامل ثلاثي ∭" },
  { regex: /∮/g, latex: "\\oint ", category: "CALCULUS", nameAr: "تكامل على مسار مغلق ∮" },
  { regex: /∂/g, latex: "\\partial ", category: "CALCULUS", nameAr: "مشتقة جزئية ∂" },
  { regex: /∇/g, latex: "\\nabla ", category: "CALCULUS", nameAr: "تدرج نابل ∇" },
  { regex: /∞/g, latex: "\\infty ", category: "CALCULUS", nameAr: "ما لا نهاية ∞" },
  { regex: /√/g, latex: "\\sqrt", category: "CALCULUS", nameAr: "جذر مربع √" },

  // الهندسة والفضاء
  { regex: /⊥/g, latex: "\\perp ", category: "GEOMETRY", nameAr: "عمودي على ⊥" },
  { regex: /∥/g, latex: "\\parallel ", category: "GEOMETRY", nameAr: "يوازي ∥" },
  { regex: /∦/g, latex: "\\nparallel ", category: "GEOMETRY", nameAr: "لا يوازي ∦" },
  { regex: /∠/g, latex: "\\angle ", category: "GEOMETRY", nameAr: "زاوية هندسية ∠" },
  { regex: /△/g, latex: "\\triangle ", category: "GEOMETRY", nameAr: "مثلث هندسي △" },

  // الحروف اليونانية الشائعة في الثانوي
  { regex: /α/g, latex: "\\alpha ", category: "GREEK", nameAr: "حرف ألفا α" },
  { regex: /β/g, latex: "\\beta ", category: "GREEK", nameAr: "حرف بيتا β" },
  { regex: /γ/g, latex: "\\gamma ", category: "GREEK", nameAr: "حرف غاما γ" },
  { regex: /δ/g, latex: "\\delta ", category: "GREEK", nameAr: "حرف دلتا δ" },
  { regex: /ε/g, latex: "\\varepsilon ", category: "GREEK", nameAr: "حرف إبسيلون ε" },
  { regex: /θ/g, latex: "\\theta ", category: "GREEK", nameAr: "حرف ثيتا θ" },
  { regex: /λ/g, latex: "\\lambda ", category: "GREEK", nameAr: "حرف لامدا λ" },
  { regex: /μ/g, latex: "\\mu ", category: "GREEK", nameAr: "حرف ميو μ" },
  { regex: /π/g, latex: "\\pi ", category: "GREEK", nameAr: "العدد الدائري π" },
  { regex: /ρ/g, latex: "\\rho ", category: "GREEK", nameAr: "حرف رو ρ" },
  { regex: /σ/g, latex: "\\sigma ", category: "GREEK", nameAr: "حرف سيغما σ" },
  { regex: /τ/g, latex: "\\tau ", category: "GREEK", nameAr: "حرف تاو τ" },
  { regex: /φ/g, latex: "\\varphi ", category: "GREEK", nameAr: "حرف فاي φ" },
  { regex: /ω/g, latex: "\\omega ", category: "GREEK", nameAr: "حرف أوميغا ω" },
  { regex: /Δ/g, latex: "\\Delta ", category: "GREEK", nameAr: "مميز المعادلة أو التغير Δ" },
  { regex: /Γ/g, latex: "\\Gamma ", category: "GREEK", nameAr: "دالة غاما الكبرى Γ" },
  { regex: /Ω/g, latex: "\\Omega ", category: "GREEK", nameAr: "فضاء الإمكانيات أو أوميغا الكبرى Ω" },
];

/**
 * خريطة تحويل الأسس والمؤشرات اليونيكود
 */
export const SUPERSCRIPTS_SUBSCRIPTS_MAP: Array<{ regex: RegExp; latex: string; nameAr: string }> = [
  // أسس علوية
  { regex: /⁰/g, latex: "^0", nameAr: "أس علوي ⁰ → ^0" },
  { regex: /¹/g, latex: "^1", nameAr: "أس علوي ¹ → ^1" },
  { regex: /²/g, latex: "^2", nameAr: "أس علوي ² → ^2" },
  { regex: /³/g, latex: "^3", nameAr: "أس علوي ³ → ^3" },
  { regex: /⁴/g, latex: "^4", nameAr: "أس علوي ⁴ → ^4" },
  { regex: /⁵/g, latex: "^5", nameAr: "أس علوي ⁵ → ^5" },
  { regex: /⁶/g, latex: "^6", nameAr: "أس علوي ⁶ → ^6" },
  { regex: /⁷/g, latex: "^7", nameAr: "أس علوي ⁷ → ^7" },
  { regex: /⁸/g, latex: "^8", nameAr: "أس علوي ⁸ → ^8" },
  { regex: /⁹/g, latex: "^9", nameAr: "أس علوي ⁹ → ^9" },
  { regex: /⁺/g, latex: "^+", nameAr: "علامة موجبة علوية ⁺ → ^+" },
  { regex: /⁻/g, latex: "^-", nameAr: "علامة سالبة علوية ⁻ → ^-" },
  { regex: /⁼/g, latex: "^=", nameAr: "يساوي علوي ⁼ → ^=" },
  { regex: /⁽/g, latex: "^(", nameAr: "قوس علوي ⁽ → ^(" },
  { regex: /⁾/g, latex: "^)", nameAr: "قوس علوي ⁾ → ^)" },
  { regex: /ⁿ/g, latex: "^n", nameAr: "حرف n علوي ⁿ → ^n" },
  { regex: /ⁱ/g, latex: "^i", nameAr: "حرف i علوي ⁱ → ^i" },

  // مؤشرات سفلية
  { regex: /₀/g, latex: "_0", nameAr: "مؤشر سفلي ₀ → _0" },
  { regex: /₁/g, latex: "_1", nameAr: "مؤشر سفلي ₁ → _1" },
  { regex: /₂/g, latex: "_2", nameAr: "مؤشر سفلي ₂ → _2" },
  { regex: /₃/g, latex: "_3", nameAr: "مؤشر سفلي ₃ → _3" },
  { regex: /₄/g, latex: "_4", nameAr: "مؤشر سفلي ₄ → _4" },
  { regex: /₅/g, latex: "_5", nameAr: "مؤشر سفلي ₅ → _5" },
  { regex: /₆/g, latex: "_6", nameAr: "مؤشر سفلي ₆ → _6" },
  { regex: /₇/g, latex: "_7", nameAr: "مؤشر سفلي ₇ → _7" },
  { regex: /₈/g, latex: "_8", nameAr: "مؤشر سفلي ₈ → _8" },
  { regex: /₉/g, latex: "_9", nameAr: "مؤشر سفلي ₉ → _9" },
  { regex: /₊/g, latex: "_+", nameAr: "زائد سفلي ₊ → _+" },
  { regex: /₋/g, latex: "_-", nameAr: "ناقص سفلي ₋ → _-" },
  { regex: /₌/g, latex: "_=", nameAr: "يساوي سفلي ₌ → _=" },
  { regex: /₍/g, latex: "_(", nameAr: "قوس سفلي ₍ → _(" },
  { regex: /₎/g, latex: "_)", nameAr: "قوس سفلي ₎ → _)" },
  { regex: /ₙ/g, latex: "_n", nameAr: "حرف n سفلي ₙ → _n" },
  { regex: /ₖ/g, latex: "_k", nameAr: "حرف k سفلي ₖ → _k" },
  { regex: /ᵢ/g, latex: "_i", nameAr: "حرف i سفلي ᵢ → _i" },
  { regex: /ⱼ/g, latex: "_j", nameAr: "حرف j سفلي ⱼ → _j" },
];

/**
 * تنظيف علامات الاقتباس والمحارف غير المرئية
 */
export const TYPOGRAPHY_FIXES: Array<{ regex: RegExp; replaceWith: string; nameAr: string }> = [
  // محارف يونيكود خفية ومعطلة للتجميع
  { regex: /[\u200B-\u200D\uFEFF]/g, replaceWith: "", nameAr: "إزالة المسافات الصفرية غير المرئية (Zero-width chars & BOM)" },
  { regex: /[\u200E\u200F]/g, replaceWith: "", nameAr: "إزالة علامات الاتجاه الخفية (LTR / RTL marks)" },
  { regex: /\u00A0/g, replaceWith: "~", nameAr: "تحويل المسافة غير المنكسرة إلى ~ في LaTeX" },
  { regex: /\u00AD/g, replaceWith: "", nameAr: "إزالة الواصلة الاختيارية الخفية (Soft hyphen)" },

  // علامات الاقتباس المائلة أو الفرنسية
  { regex: /“|”/g, replaceWith: "''", nameAr: "تطبيع علامات الاقتباس المزدوجة “ ” إلى ''" },
  { regex: /‘|’/g, replaceWith: "'", nameAr: "تطبيع علامات الاقتباس الفردية ‘ ’ إلى '" },
  { regex: /«\s*([^»]*?)\s*»/g, replaceWith: "\\og $1\\fg{}", nameAr: "تنسيق علامات الاقتباس الفرنسية « ... » عبر \\og ... \\fg{}" },

  // الشُرَط
  { regex: /—/g, replaceWith: "---", nameAr: "تحويل الشرطة الطويلة Em-dash إلى ---" },
  { regex: /–/g, replaceWith: "--", nameAr: "تحويل الشرطة المتوسطة En-dash إلى --" },
  { regex: /…/g, replaceWith: "\\dots ", nameAr: "تحويل نقط الحذف … إلى \\dots" },
];

/**
 * استخراج وتفكيك حزم الترويسة من أي كود LaTeX
 */
export function parsePreamblePackages(preambleText: string): {
  packages: PackageEntry[];
  cleanedPreambleWithoutPackages: string;
} {
  const packages: PackageEntry[] = [];
  const lines = preambleText.split("\n");
  const remainingLines: string[] = [];

  const usepackageRegex = /\\usepackage(?:\s*\[([^\]]*)\])?\s*\{([^}]+)\}/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("%") && !trimmed.includes("\\usepackage")) {
      remainingLines.push(line);
      continue;
    }

    const match = line.match(usepackageRegex);
    if (match) {
      const rawOptions = match[1] || "";
      const rawNames = match[2] || "";
      const options = rawOptions
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      // قد تحتوي الحزمة الواحدة على عدة أسماء مفصولة بفواصل، مثل: \usepackage{amsmath,amssymb,amsfonts}
      const names = rawNames
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);

      names.forEach((name) => {
        packages.push({
          raw: line.trim(),
          name,
          options: [...options],
        });
      });
    } else {
      remainingLines.push(line);
    }
  }

  return {
    packages,
    cleanedPreambleWithoutPackages: remainingLines.join("\n"),
  };
}

/**
 * إعادة ترتيب الحزم وحل التعارضات (Package Clash & Priority Sorting)
 */
export function reorderAndDeduplicatePackages(
  packages: PackageEntry[],
  options: LatexCleanerOptions = DEFAULT_CLEANER_OPTIONS
): {
  reordered: PackageEntry[];
  report: {
    reorderedCount: number;
    deduplicatedCount: number;
    clashResolvedCount: number;
    amsthmFixed: boolean;
    xcolorFixed: boolean;
    hyperrefFixed: boolean;
    cleverefFixed: boolean;
  };
} {
  const mergedMap = new Map<string, { options: Set<string>; raw: string }>();

  let deduplicatedCount = 0;
  let clashResolvedCount = 0;

  // 1. دمج وتوحيد الحزم المكررة وجمع خياراتها
  packages.forEach((pkg) => {
    const normName = pkg.name.trim();
    if (!normName) return;

    if (mergedMap.has(normName)) {
      deduplicatedCount += 1;
      const existing = mergedMap.get(normName)!;
      pkg.options.forEach((opt) => {
        if (!existing.options.has(opt)) {
          existing.options.add(opt);
          clashResolvedCount += 1;
        }
      });
    } else {
      mergedMap.set(normName, {
        options: new Set(pkg.options),
        raw: pkg.raw,
      });
    }
  });

  // 2. معالجة خيارات xcolor المسبقة لمنع Option Clash عند تحميل tikz أو tcolorbox
  let xcolorFixed = false;
  if (mergedMap.has("xcolor")) {
    const xcEntry = mergedMap.get("xcolor")!;
    // إضافة table و dvipsnames تلقائياً لمنع أي تعارض خيارات مشهور في LaTeX
    if (!xcEntry.options.has("table") || !xcEntry.options.has("dvipsnames")) {
      xcEntry.options.add("table");
      xcEntry.options.add("dvipsnames");
      xcolorFixed = true;
      clashResolvedCount += 1;
    }
  } else if (
    mergedMap.has("tikz") ||
    mergedMap.has("tcolorbox") ||
    mergedMap.has("pgfplots") ||
    mergedMap.has("bclogo")
  ) {
    // إذا كان tikz أو tcolorbox موجوداً دون xcolor صريحة، ندرج xcolor أولاً لتفادي تعارض الخيارات لاحقاً
    mergedMap.set("xcolor", {
      options: new Set(["table", "dvipsnames"]),
      raw: "\\usepackage[table,dvipsnames]{xcolor}",
    });
    xcolorFixed = true;
  }

  // 3. ترقية خيارات inputenc القديمة إذا وجدت
  if (mergedMap.has("inputenc")) {
    const inputEnc = mergedMap.get("inputenc")!;
    const legacyOptions = ["latin1", "cp1256", "windows-1256", "ansinew", "applemac", "iso-8859-1"];
    let hadLegacy = false;
    legacyOptions.forEach((leg) => {
      if (inputEnc.options.has(leg)) {
        inputEnc.options.delete(leg);
        hadLegacy = true;
      }
    });
    inputEnc.options.add("utf8");
    if (hadLegacy) clashResolvedCount += 1;
  }

  // 4. التأكد من وجود fontenc مع T1
  if (mergedMap.has("fontenc")) {
    const fontEnc = mergedMap.get("fontenc")!;
    if (fontEnc.options.size === 0) {
      fontEnc.options.add("T1");
    }
  }

  // 5. حل تعارض الحزم المتقادمة واستبدالها بنظيراتها الحديثة
  if (mergedMap.has("subfigure")) {
    mergedMap.delete("subfigure");
    if (!mergedMap.has("subcaption")) {
      mergedMap.set("subcaption", { options: new Set(), raw: "\\usepackage{subcaption}" });
    }
    clashResolvedCount += 1;
  }
  if (mergedMap.has("epsfig")) {
    mergedMap.delete("epsfig");
    if (!mergedMap.has("graphicx")) {
      mergedMap.set("graphicx", { options: new Set(), raw: "\\usepackage{graphicx}" });
    }
    clashResolvedCount += 1;
  }

  // 6. التحقق من أسبقية amsthm و amsmath و hyperref و cleveref
  let amsthmFixed = false;
  let hyperrefFixed = false;
  let cleverefFixed = false;

  const originalOrder = packages.map((p) => p.name.trim());
  const amsmathIdx = originalOrder.indexOf("amsmath");
  const amsthmIdx = originalOrder.indexOf("amsthm");
  if (amsthmIdx !== -1 && amsmathIdx !== -1 && amsthmIdx < amsmathIdx) {
    amsthmFixed = true;
  }

  const hyperrefIdx = originalOrder.indexOf("hyperref");
  if (hyperrefIdx !== -1 && hyperrefIdx < originalOrder.length - 3) {
    hyperrefFixed = true;
  }

  const cleverefIdx = originalOrder.indexOf("cleveref");
  if (cleverefIdx !== -1 && hyperrefIdx !== -1 && cleverefIdx < hyperrefIdx) {
    cleverefFixed = true;
  }

  // 7. ترتيب الحزم حسب سلم الأولويات Tiers الصارم
  const sortedNames = Array.from(mergedMap.keys()).sort((a, b) => {
    const metaA = PACKAGE_TIER_PRIORITY[a] || { tier: 10, order: 50 };
    const metaB = PACKAGE_TIER_PRIORITY[b] || { tier: 10, order: 50 };

    if (metaA.tier !== metaB.tier) {
      return metaA.tier - metaB.tier;
    }
    if (metaA.order !== metaB.order) {
      return metaA.order - metaB.order;
    }
    return a.localeCompare(b);
  });

  const reordered: PackageEntry[] = sortedNames.map((name) => {
    const entry = mergedMap.get(name)!;
    const opts = Array.from(entry.options);
    const optsStr = opts.length > 0 ? `[${opts.join(",")}]` : "";
    return {
      name,
      options: opts,
      raw: `\\usepackage${optsStr}{${name}}`,
    };
  });

  const reorderedCount = packages.length > 0 ? packages.length : 0;

  return {
    reordered,
    report: {
      reorderedCount,
      deduplicatedCount,
      clashResolvedCount,
      amsthmFixed,
      xcolorFixed,
      hyperrefFixed,
      cleverefFixed,
    },
  };
}

/**
 * الدالة المركزية لتنظيف أي كود أو مستند LaTeX بالكامل
 */
export function cleanLatexDocument(
  rawInput: string,
  userOptions: Partial<LatexCleanerOptions> = {}
): LatexCleaningResult {
  const options = { ...DEFAULT_CLEANER_OPTIONS, ...userOptions };
  const auditLog: LatexCleaningResult["auditLog"] = [];

  let text = (rawInput || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  let invisibleCount = 0;
  let quotesCount = 0;
  let obsoleteCount = 0;
  let mathSymbolsCount = 0;
  let subSuperCount = 0;
  let unescapedSpecialCount = 0;

  const sampleConversions: SymbolCleaningReport["sampleConversions"] = [];

  // --------------------------------------------------------------------------
  // المرحلة 1: تنظيف المحارف الخفية، الفواصل الاختيارية، وعلامات الاقتباس
  // --------------------------------------------------------------------------
  if (options.cleanInvisibleAndQuotes) {
    TYPOGRAPHY_FIXES.forEach((fix) => {
      const matches = text.match(fix.regex);
      if (matches && matches.length > 0) {
        text = text.replace(fix.regex, fix.replaceWith as string);
        if (fix.nameAr.includes("خفية") || fix.nameAr.includes("الاتجاه")) {
          invisibleCount += matches.length;
        } else {
          quotesCount += matches.length;
        }
        auditLog.push({
          type: "TYPOGRAPHY",
          titleAr: fix.nameAr,
          descriptionAr: `تمت معالجة وتطبيع ${matches.length} موضعاً في المستند.`,
          severity: "INFO",
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // المرحلة 2: تحديث الأوامر القديمة والمهملة (\over, \choose, \bf, \cal...)
  // --------------------------------------------------------------------------
  if (options.modernizeObsoleteCommands) {
    OBSOLETE_TEX_COMMANDS.forEach((cmd) => {
      const matches = text.match(cmd.regex);
      if (matches && matches.length > 0) {
        obsoleteCount += matches.length;
        text = text.replace(cmd.regex, cmd.replaceWith as any);
        auditLog.push({
          type: "COMMAND",
          titleAr: cmd.nameAr,
          descriptionAr: `تم تحديث ${matches.length} أمراً من الصيغ القديمة إلى صياغة LaTeX الحديثة.`,
          severity: "SUCCESS",
        });
        sampleConversions.push({
          categoryAr: "تحديث أوامر قديمة",
          original: matches[0].slice(0, 30),
          converted: "صيغة LaTeX الحديثة",
          count: matches.length,
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // المرحلة 3: تحويل الرموز الرياضية اليونيكود (ℝ, ≤, ≥, ⇔, ∀, ∑, ∫...)
  // --------------------------------------------------------------------------
  if (options.convertUnicodeMathSymbols) {
    UNICODE_MATH_SYMBOLS_MAP.forEach((sym) => {
      const matches = text.match(sym.regex);
      if (matches && matches.length > 0) {
        mathSymbolsCount += matches.length;
        text = text.replace(sym.regex, sym.latex);
        sampleConversions.push({
          categoryAr: sym.category,
          original: sym.nameAr.split(" ")[0] || matches[0],
          converted: sym.latex.trim(),
          count: matches.length,
        });
      }
    });

    // استبدال محددات المعادلات القديمة $$ ... $$ إلى \[ ... \]
    const doubleDollarMatches = text.match(/\$\$([\s\S]*?)\$\$/g);
    if (doubleDollarMatches) {
      mathSymbolsCount += doubleDollarMatches.length;
      text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner) => `\\[${inner}\\]`);
      auditLog.push({
        type: "SYMBOL",
        titleAr: "توحيد محددات المعادلات $$ ... $$",
        descriptionAr: `تم تحويل ${doubleDollarMatches.length} معادلة إلى محددات \\[ ... \\] القياسية.`,
        severity: "INFO",
      });
    }

    if (mathSymbolsCount > 0) {
      auditLog.push({
        type: "SYMBOL",
        titleAr: "تطبيع الرموز الرياضية واليونيكود",
        descriptionAr: `تم بنجاح تحويل ${mathSymbolsCount} رمزاً رياضياً إلى أوامر LaTeX الرسمية.`,
        severity: "SUCCESS",
      });
    }
  }

  // --------------------------------------------------------------------------
  // المرحلة 4: تحويل الأسس والمؤشرات اليونيكود (x², uₙ, 2ⁿ...)
  // --------------------------------------------------------------------------
  if (options.convertSuperscriptsSubscripts) {
    SUPERSCRIPTS_SUBSCRIPTS_MAP.forEach((subSuper) => {
      const matches = text.match(subSuper.regex);
      if (matches && matches.length > 0) {
        subSuperCount += matches.length;
        text = text.replace(subSuper.regex, subSuper.latex);
      }
    });
    if (subSuperCount > 0) {
      auditLog.push({
        type: "SYMBOL",
        titleAr: "تطبيع الأسس والمؤشرات السفلية",
        descriptionAr: `تم تحويل ${subSuperCount} مؤشراً ورمز أس يونيكود إلى صيغ ^ و _ القياسية.`,
        severity: "INFO",
      });
    }
  }

  // --------------------------------------------------------------------------
  // المرحلة 5: تنظيف وترتيب ترويسة LaTeX وتفادي التعارض (Preamble Optimizer)
  // --------------------------------------------------------------------------
  let cleanedFullCode = text;

  const docStartIdx = text.indexOf("\\begin{document}");
  const docEndIdx = text.lastIndexOf("\\end{document}");

  let docClassEntry: PreambleAnalysisReport["documentClass"] = null;
  let reorderedPkgEntries: PackageEntry[] = [];
  let preambleReport: PreambleAnalysisReport = {
    documentClass: null,
    originalPackagesCount: 0,
    reorderedPackagesCount: 0,
    deduplicatedPackagesCount: 0,
    clashResolvedCount: 0,
    hasHyperref: false,
    hasCleveref: false,
    hyperrefRepositioned: false,
    cleverefRepositioned: false,
    amsthmOrderFixed: false,
    xcolorClashFixed: false,
    cleanedPreamblePackages: [],
    unrecognizedPreambleLines: [],
  };

  if (docStartIdx !== -1 && options.reorderPreamble) {
    const rawPreamble = text.slice(0, docStartIdx);
    const bodyAndEnd = text.slice(docStartIdx);

    // استخراج \documentclass
    const docClassMatch = rawPreamble.match(/\\documentclass(?:\s*\[([^\]]*)\])?\s*\{([^}]+)\}/);
    if (docClassMatch) {
      const opts = (docClassMatch[1] || "").split(",").map((s) => s.trim()).filter(Boolean);
      docClassEntry = {
        raw: docClassMatch[0],
        className: docClassMatch[2].trim(),
        options: opts,
      };
    }

    // استخراج الحزم
    const { packages: originalPkgs, cleanedPreambleWithoutPackages } = parsePreamblePackages(rawPreamble);

    // ترتيب وحل التعارضات
    const { reordered, report } = reorderAndDeduplicatePackages(originalPkgs, options);
    reorderedPkgEntries = reordered;

    const hasHyperref = reordered.some((p) => p.name === "hyperref");
    const hasCleveref = reordered.some((p) => p.name === "cleveref");

    preambleReport = {
      documentClass: docClassEntry,
      originalPackagesCount: originalPkgs.length,
      reorderedPackagesCount: report.reorderedCount,
      deduplicatedPackagesCount: report.deduplicatedCount,
      clashResolvedCount: report.clashResolvedCount,
      hasHyperref,
      hasCleveref,
      hyperrefRepositioned: report.hyperrefFixed,
      cleverefRepositioned: report.cleverefFixed,
      amsthmOrderFixed: report.amsthmFixed,
      xcolorClashFixed: report.xcolorFixed,
      cleanedPreamblePackages: reordered,
      unrecognizedPreambleLines: [],
    };

    // إعادة بناء ترويسة منظمة ومهيكلة أكاديمياً
    const preambleBuilder: string[] = [];

    if (docClassEntry) {
      const dcOpts = docClassEntry.options.length > 0 ? `[${docClassEntry.options.join(",")}]` : "";
      preambleBuilder.push(`\\documentclass${dcOpts}{${docClassEntry.className}}`);
    }

    preambleBuilder.push(`\n% ==============================================================================`);
    preambleBuilder.push(`% ترويسة LaTeX منظمة ومحمية من التعارضات (Preamble Optimisé sans Conflit)`);
    preambleBuilder.push(`% الترتيب الصارم: الترميز → الرياضيات → الألوان والرسم → الأبعاد → التذييل → الروابط`);
    preambleBuilder.push(`% ==============================================================================`);

    // تصنيف الحزم في الترويسة المخرجة بمجموعات واضحة
    let currentTier = -1;
    reordered.forEach((pkg) => {
      const meta = PACKAGE_TIER_PRIORITY[pkg.name] || { tier: 10, order: 50, labelAr: "حزم مساعدة" };
      if (meta.tier !== currentTier) {
        currentTier = meta.tier;
        let tierTitle = "";
        switch (currentTier) {
          case 1:
            tierTitle = "% --- [1] محرك TeX وترميز المحارف (Encoding & Fonts) ---";
            break;
          case 2:
            tierTitle = "% --- [2] محركات الرياضيات وحزم AMS (amsmath يسبق amsthm حتماً) ---";
            break;
          case 3:
            tierTitle = "% --- [3] الألوان والرسوم البيانية (xcolor قبل tikz/tcolorbox لمنع Option Clash) ---";
            break;
          case 4:
            tierTitle = "% --- [4] هوامش وأبعاد الصفحة (Geometry) ---";
            break;
          case 5:
            tierTitle = "% --- [5] الترويسات والتذييلات الأكاديمية (Fancyhdr) ---";
            break;
          case 6:
            tierTitle = "% --- [6] التأطير والصناديق (tcolorbox, mdframed, bclogo) ---";
            break;
          case 7:
            tierTitle = "% --- [7] الجداول وتنسيق القوائم والتفريعات (Tables & Lists) ---";
            break;
          case 8:
            tierTitle = "% --- [8] الأكواد البرمجية وبايثون (Listings) ---";
            break;
          case 9:
            tierTitle = "% --- [9] تدويل اللغات (Babel & Languages) ---";
            break;
          case 10:
            tierTitle = "% --- [10] حزم عامة وإضافية ---";
            break;
          case 11:
            tierTitle = "% --- [11] الروابط التفاعلية (hyperref محمل في ذيل الترويسة لمنع التعارض) ---";
            break;
          case 12:
            tierTitle = "% --- [12] حزم ما بعد hyperref (cleveref محمل بعد hyperref حتماً) ---";
            break;
        }
        preambleBuilder.push(`\n${tierTitle}`);
      }
      preambleBuilder.push(pkg.raw);
    });

    // استخراج سطور الإعدادات الخاصة (Macros, definecolor, tcbset, etc.) التي لا تحتوي على \documentclass أو \usepackage
    const otherPreambleLines = cleanedPreambleWithoutPackages
      .replace(/\\documentclass(?:\s*\[[^\]]*\])?\s*\{[^}]+\}/, "")
      .trim();

    if (otherPreambleLines.length > 0) {
      preambleBuilder.push(`\n% --- أوامر وتخصيصات الأنماط والألوان الإضافية ---\n${otherPreambleLines}`);
    }

    cleanedFullCode = `${preambleBuilder.join("\n")}\n\n${bodyAndEnd}`;

    // إضافة سجلات الفحص والتدقيق
    auditLog.push({
      type: "PREAMBLE",
      titleAr: "تصحيح ترتيب حزم الترويسة وحل تعارضات التحميل",
      descriptionAr: `تم فرز ${reordered.length} حزمة وفق الأسبقية الصارمة وإزالة ${report.deduplicatedCount} حزمة مكررة.`,
      severity: "SUCCESS",
    });

    if (report.xcolorFixed) {
      auditLog.push({
        type: "PREAMBLE",
        titleAr: "منع تعارض خيارات الألوان (xcolor Option Clash)",
        descriptionAr: "تم تحميل xcolor بخيارات [table,dvipsnames] قبل tikz و tcolorbox لتفادي خطأ Option Clash.",
        severity: "SUCCESS",
      });
    }

    if (report.amsthmFixed) {
      auditLog.push({
        type: "PREAMBLE",
        titleAr: "تصحيح ترتيب amsthm و amsmath",
        descriptionAr: "تم ضمان تحميل amsmath قبل amsthm لتفادي خطأ \\openbox already defined.",
        severity: "SUCCESS",
      });
    }

    if (report.hyperrefFixed) {
      auditLog.push({
        type: "PREAMBLE",
        titleAr: "نقل hyperref إلى نهاية الترويسة",
        descriptionAr: "تم نقل hyperref إلى ذيل الترويسة لضمان إعادة كتابة أوامر المراجع والوصلات بأمان.",
        severity: "INFO",
      });
    }

    if (report.cleverefFixed) {
      auditLog.push({
        type: "PREAMBLE",
        titleAr: "ضمان تحميل cleveref بعد hyperref",
        descriptionAr: "تم وضع cleveref بعد hyperref تماشياً مع قاعدة حزمة cleveref الإلزامية.",
        severity: "SUCCESS",
      });
    }
  }

  const symbolReport: SymbolCleaningReport = {
    mathSymbolsConvertedCount: mathSymbolsCount,
    superscriptsSubscriptsConvertedCount: subSuperCount,
    greekLettersConvertedCount: mathSymbolsCount,
    quotesAndDashesConvertedCount: quotesCount,
    obsoleteCommandsUpdatedCount: obsoleteCount,
    invisibleCharsRemovedCount: invisibleCount,
    unescapedSpecialCharsFixedCount: unescapedSpecialCount,
    totalConversionsCount:
      mathSymbolsCount + subSuperCount + quotesCount + obsoleteCount + invisibleCount,
    sampleConversions,
  };

  return {
    originalCode: rawInput,
    cleanedCode: cleanedFullCode,
    preambleReport,
    symbolReport,
    auditLog,
  };
}

/**
 * نموذج اختبار شامل يحتوي على تعارضات حزم ورموز يونيكود وأوامر قديمة
 * لاختبار الأداة فورا
 */
export const SAMPLE_DIRTY_LATEX_WITH_CONFLICTS = `% وثيقة غير قياسية تحتوي على تعارضات شائعة في الترويسة ورموز يونيكود وأوامر TeX قديمة
\\documentclass[11pt,a4paper]{article}

% تعارض 1: amsthm تم تحميلها قبل amsmath (يسبب خطأ openbox already defined)
\\usepackage{amsthm}
\\usepackage{amsmath}

% تعارض 2: hyperref تم تحميلها مبكراً جداً في الترويسة قبل حزم الرسم والجداول
\\usepackage[colorlinks=true]{hyperref}

% تعارض 3: cleveref محملة قبل hyperref (خطأ فادح في LaTeX)
\\usepackage{cleveref}

% تعارض 4: تحميل تكراري لـ amsmath
\\usepackage{amsmath}

% تعارض 5: خيارات مكررة ومتعارضة لـ xcolor بعد tikz
\\usepackage{tikz}
\\usepackage{xcolor}
\\usepackage[table]{xcolor}

% تعارض 6: ترميز قديم latin1 بدلاً من utf8
\\usepackage[latin1]{inputenc}
\\usepackage{tcolorbox}
\\usepackage{geometry}

\\begin{document}

\\section{Exercice 1 : Étude d'une fonction et intégrales}

Soit $f$ une fonction définie sur ℝ par :
$$ f(x) = {x^2 - 1 \\over 2x + 1} $$

On remarque que pour tout $x ≥ 0$ et $x ≠ -1/2$, $f'(x) > 0$.
Soit la suite (uₙ) définie par u₀ = 2 et uₙ₊₁ = f(uₙ).
Montrer par récurrence que ∀n ∈ ℕ, uₙ ≥ 1.

Montrer que :
$$ I = \\int_0^1 f(x) dx ≤ \\sqrt{2} $$

% أوامر قديمة وأسهم يونيكود
Soit $A$ et $B$ deux matrices {\\bf carrées} telles que $A \\implies B$ et $A ⇔ B$.
Le nombre de combinaisons est {n \\choose k}.

% اقتباسات وشُرَط غير قياسية
“Ceci est une citation” — et voici une parenthèse avec des espaces non-sécables.

\\end{document}
`;
