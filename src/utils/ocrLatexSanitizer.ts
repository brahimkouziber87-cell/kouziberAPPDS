import {
  MathValidationIssue,
  sanitizeQuestionMathExpressions,
  validateCustomQuestionWithMathJS,
} from "./mathjsValidator";

export interface OcrMathSanitizationResult {
  original: string;
  sanitized: string;
  fixesCount: number;
  fixesApplied: string[];
  integrityScorePct: number;
  issues: MathValidationIssue[];
}

export interface OcrMappingValidationSummary {
  integrityScorePct: number;
  fixesAppliedCount: number;
  expressionsCheckedCount: number;
  issues: MathValidationIssue[];
}

const UNICODE_TO_LATEX_IN_MATH: Array<[RegExp, string, string]> = [
  [/≤/g, "\\le ", "تطبيع رمز ≤ إلى \\le"],
  [/≥/g, "\\ge ", "تطبيع رمز ≥ إلى \\ge"],
  [/≠/g, "\\neq ", "تطبيع رمز ≠ إلى \\neq"],
  [/×/g, "\\times ", "تطبيع رمز × إلى \\times"],
  [/÷/g, "\\div ", "تطبيع رمز ÷ إلى \\div"],
  [/∞/g, "\\infty ", "تطبيع رمز ∞ إلى \\infty"],
  [/∈/g, "\\in ", "تطبيع رمز ∈ إلى \\in"],
  [/∉/g, "\\notin ", "تطبيع رمز ∉ إلى \\notin"],
  [/⊂/g, "\\subset ", "تطبيع رمز ⊂ إلى \\subset"],
  [/∪/g, "\\cup ", "تطبيع رمز ∪ إلى \\cup"],
  [/∩/g, "\\cap ", "تطبيع رمز ∩ إلى \\cap"],
  [/∀/g, "\\forall ", "تطبيع رمز ∀ إلى \\forall"],
  [/∃/g, "\\exists ", "تطبيع رمز ∃ إلى \\exists"],
  [/⇒/g, "\\implies ", "تطبيع رمز ⇒ إلى \\implies"],
  [/⇔/g, "\\iff ", "تطبيع رمز ⇔ إلى \\iff"],
  [/→/g, "\\to ", "تطبيع رمز → إلى \\to"],
  [/ℝ/g, "\\mathbb{R}", "تطبيع رمز ℝ إلى \\mathbb{R}"],
  [/ℕ/g, "\\mathbb{N}", "تطبيع رمز ℕ إلى \\mathbb{N}"],
  [/ℤ/g, "\\mathbb{Z}", "تطبيع رمز ℤ إلى \\mathbb{Z}"],
  [/ℚ/g, "\\mathbb{Q}", "تطبيع رمز ℚ إلى \\mathbb{Q}"],
  [/ℂ/g, "\\mathbb{C}", "تطبيع رمز ℂ إلى \\mathbb{C}"],
  [/π/g, "\\pi ", "تطبيع رمز π إلى \\pi"],
  [/α/g, "\\alpha ", "تطبيع رمز α إلى \\alpha"],
  [/β/g, "\\beta ", "تطبيع رمز β إلى \\beta"],
  [/Δ/g, "\\Delta ", "تطبيع رمز Δ إلى \\Delta"],
  [/∑/g, "\\sum ", "تطبيع رمز ∑ إلى \\sum"],
  [/∫/g, "\\int ", "تطبيع رمز ∫ إلى \\int"],
  [/−|–/g, "-", "تطبيع علامة الطرح Unicode"],
];

export type ArabicMathNotationMode =
  | "CONVERT_TO_STANDARD_LATEX"
  | "PRESERVE_ARABIC_MATH_SCRIPT"
  | "DUAL_BILINGUAL_BRIDGE";

export interface ArabicMathTokenConversion {
  arabicToken: string;
  latexReplacement: string;
  category:
    | "TRIG_LOG_LIMIT"
    | "FUNCTION_SEQUENCE"
    | "NUMBER_SET"
    | "NUMERAL_ARROW"
    | "VARIABLE";
  descriptionAr: string;
  occurrences: number;
}

export interface ArabicMathOcrDiagnostics {
  mode: ArabicMathNotationMode;
  originalText: string;
  transpiledText: string;
  detectedArabicMathTokensCount: number;
  convertedTokensLog: ArabicMathTokenConversion[];
  legacyScriptType:
    | "ARABIC_MATH_LEGACY"
    | "MOROCCAN_BILINGUAL_HYBRID"
    | "STANDARD_LATIN_LATEX";
  notationConfidenceBoostPct: number;
  arabicIndicDigitsConverted: number;
}

export const ARABIC_MATH_NOTATION_DICTIONARY: ReadonlyArray<{
  id: string;
  arabicDisplay: string;
  standardLatex: string;
  category: ArabicMathTokenConversion["category"];
  descriptionAr: string;
}> = [
  {
    id: "lim",
    arabicDisplay: "نهـا / نها",
    standardLatex: "\\lim",
    category: "TRIG_LOG_LIMIT",
    descriptionAr: "تحويل رمز النهاية العربي (نها / نهـا) إلى \\lim",
  },
  {
    id: "sin",
    arabicDisplay: "جا(س)",
    standardLatex: "\\sin(x)",
    category: "TRIG_LOG_LIMIT",
    descriptionAr: "تحويل دالة الجيب العربية (جا) إلى \\sin",
  },
  {
    id: "cos",
    arabicDisplay: "جتا(س)",
    standardLatex: "\\cos(x)",
    category: "TRIG_LOG_LIMIT",
    descriptionAr: "تحويل دالة جيب التمام العربية (جتا) إلى \\cos",
  },
  {
    id: "tan",
    arabicDisplay: "ظا(س) / ظل(س)",
    standardLatex: "\\tan(x)",
    category: "TRIG_LOG_LIMIT",
    descriptionAr: "تحويل دالة الظل العربية (ظا / ظل) إلى \\tan",
  },
  {
    id: "cot",
    arabicDisplay: "ظتا(س)",
    standardLatex: "\\cot(x)",
    category: "TRIG_LOG_LIMIT",
    descriptionAr: "تحويل دالة ظل التمام العربية (ظتا) إلى \\cot",
  },
  {
    id: "ln",
    arabicDisplay: "لو(س) / لغ(س)",
    standardLatex: "\\ln(x)",
    category: "TRIG_LOG_LIMIT",
    descriptionAr: "تحويل اللوغاريتم العربي (لو / لغ) إلى \\ln",
  },
  {
    id: "sqrt",
    arabicDisplay: "جذر(س)",
    standardLatex: "\\sqrt{x}",
    category: "TRIG_LOG_LIMIT",
    descriptionAr: "تحويل الجذر المربع العربي (جذر) إلى \\sqrt{...}",
  },
  {
    id: "func_f",
    arabicDisplay: "د(س) ، د'(س)",
    standardLatex: "f(x) , f'(x)",
    category: "FUNCTION_SEQUENCE",
    descriptionAr: "تحويل ترميز الدالة ومشتقتها د(س)/د'(س) إلى f(x)/f'(x)",
  },
  {
    id: "func_g",
    arabicDisplay: "ق(س) ، هـ(س)",
    standardLatex: "g(x) , h(x)",
    category: "FUNCTION_SEQUENCE",
    descriptionAr: "تحويل ترميز الدالتين ق(س) وهـ(س) إلى g(x) و h(x)",
  },
  {
    id: "seq_u",
    arabicDisplay: "(ح_ن) / (م_ن)",
    standardLatex: "(u_n)",
    category: "FUNCTION_SEQUENCE",
    descriptionAr: "تحويل ترميز المتتالية العددية (ح_ن / م_ن) إلى (u_n)",
  },
  {
    id: "set_r",
    arabicDisplay: "∈ ح ، ح+ ، ح*",
    standardLatex: "\\in \\mathbb{R}, \\mathbb{R}^+, \\mathbb{R}^*",
    category: "NUMBER_SET",
    descriptionAr: "تحويل رمز مجموعة الأعداد الحقيقية (ح) إلى \\mathbb{R}",
  },
  {
    id: "set_n_z_c",
    arabicDisplay: "∈ ط ، ص ، ع",
    standardLatex: "\\in \\mathbb{N}, \\mathbb{Z}, \\mathbb{C}",
    category: "NUMBER_SET",
    descriptionAr: "تحويل مجموعات الأعداد (ط، ص، ع) إلى \\mathbb{N}, \\mathbb{Z}, \\mathbb{C}",
  },
];

const ARABIC_INDIC_MAP: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

/**
 * محرك OCR متخصص في تحليل وتحويل الترميز الرياضي العربي التراثي والوثائق الممسوحة بالكاميرا
 * (مثل: نهـا، جا، جتا، ظا، لو، جذر، د(س)، ق(س)، ح_ن، م_ن، المجموعات ح/ط/ص/ع، والأرقام المشرقية)
 */
export function transpileArabicMathNotationToLatex(
  rawInput: string,
  mode: ArabicMathNotationMode = "CONVERT_TO_STANDARD_LATEX"
): ArabicMathOcrDiagnostics {
  const originalText = rawInput || "";
  if (!originalText.trim()) {
    return {
      mode,
      originalText,
      transpiledText: originalText,
      detectedArabicMathTokensCount: 0,
      convertedTokensLog: [],
      legacyScriptType: "STANDARD_LATIN_LATEX",
      notationConfidenceBoostPct: 0,
      arabicIndicDigitsConverted: 0,
    };
  }

  let working = originalText;
  const conversionsMap = new Map<string, ArabicMathTokenConversion>();
  let totalTokensCount = 0;
  let arabicIndicDigitsConverted = 0;

  const recordConversion = (
    key: string,
    arabicToken: string,
    latexReplacement: string,
    category: ArabicMathTokenConversion["category"],
    descriptionAr: string,
    count = 1
  ) => {
    totalTokensCount += count;
    const existing = conversionsMap.get(key);
    if (existing) {
      existing.occurrences += count;
    } else {
      conversionsMap.set(key, {
        arabicToken,
        latexReplacement,
        category,
        descriptionAr,
        occurrences: count,
      });
    }
  };

  // 1. تحويل الأرقام الهندية/المشرقية (٠-٩) إلى أرقام مغربية/عربية غربية قياسية (0-9)
  working = working.replace(/[٠-٩۰-۹]/g, (digit) => {
    arabicIndicDigitsConverted += 1;
    return ARABIC_INDIC_MAP[digit] ?? digit;
  });
  if (arabicIndicDigitsConverted > 0) {
    recordConversion(
      "arabic_indic_digits",
      "٠١٢٣٤٥٦٧٨٩",
      "0123456789",
      "NUMERAL_ARROW",
      "تطبيع الأرقام الهندية/المشرقية إلى الأرقام المغربية القياسية (0-9)",
      arabicIndicDigitsConverted
    );
  }

  // إذا كان الوضع هو الحفاظ التام على الترميز العربي دون تحويله لرموز لاتينية، نكتفي بتطبيع الأرقام وتصحيح محددات الجذور والكسور
  if (mode === "PRESERVE_ARABIC_MATH_SCRIPT") {
    working = working.replace(/جذر\s*\(([^()]+)\)/g, (_m, inner) => {
      recordConversion(
        "sqrt_ar",
        "جذر(...)",
        "\\sqrt{...}",
        "TRIG_LOG_LIMIT",
        "تحويل جذر(...) إلى \\sqrt{...}"
      );
      return `\\sqrt{${inner}}`;
    });

    return {
      mode,
      originalText,
      transpiledText: working,
      detectedArabicMathTokensCount: totalTokensCount,
      convertedTokensLog: Array.from(conversionsMap.values()),
      legacyScriptType:
        totalTokensCount > 0 ? "ARABIC_MATH_LEGACY" : "STANDARD_LATIN_LATEX",
      notationConfidenceBoostPct: Math.min(18, totalTokensCount * 2),
      arabicIndicDigitsConverted,
    };
  }

  // 2. تحويل عبارات النهايات العربية المركبة: نها_{س ← ...} أو نهـا لما س ← ...
  working = working.replace(
    /(?:نهـ+ا|نها)\s*(?:_\s*\{\s*([سصعنx])\s*(?:←|→|\\to)\s*([^}]+)\s*\}|لما\s+([سصعنx])\s*(?:←|→|تؤول\s+إلى)\s*([^\s،,:$]+))/g,
    (_match, v1, target1, v2, target2) => {
      const rawVar = (v1 || v2 || "x").trim();
      const rawTarget = (target1 || target2 || "0")
        .trim()
        .replace(/∞/g, "\\infty");
      const latinVar =
        rawVar === "س"
          ? "x"
          : rawVar === "ص"
          ? "y"
          : rawVar === "ن"
          ? "n"
          : rawVar === "ع"
          ? "z"
          : rawVar;
      recordConversion(
        "lim_sub",
        `نها_{${rawVar} ← ${rawTarget}}`,
        `\\lim_{${latinVar} \\to ${rawTarget}}`,
        "TRIG_LOG_LIMIT",
        "تحويل عبارة النهاية العربية المركبة إلى صيغة LaTeX القياسية \\lim"
      );
      return `\\lim_{${latinVar} \\to ${rawTarget}} `;
    }
  );

  // تحويل كلمة نهـا / نها المفردة داخل سياق رياضي
  working = working.replace(/(^|[\s$(])(?:نهـ+ا|نها)(?=[\s_({\\])/g, (_m, prefix) => {
    recordConversion(
      "lim_bare",
      "نهـا / نها",
      "\\lim",
      "TRIG_LOG_LIMIT",
      "تحويل رمز النهاية العربي (نها) إلى \\lim"
    );
    return `${prefix}\\lim `;
  });

  // 3. تحويل الجذور العربية: جذر(...) أو جذر س
  working = working.replace(/جذر\s*\(([^()]+)\)/g, (_m, inner) => {
    recordConversion(
      "sqrt_paren",
      "جذر(...)",
      "\\sqrt{...}",
      "TRIG_LOG_LIMIT",
      "تحويل جذر(...) إلى \\sqrt{...}"
    );
    return `\\sqrt{${inner}}`;
  });

  // 4. تحويل الدوال المثلثية واللوغاريتمية العربية (جا، جتا، ظا، ظتا، لو، لغ)
  const trigLogPatterns: Array<{
    key: string;
    regex: RegExp;
    tokenLabel: string;
    latexCmd: string;
    desc: string;
  }> = [
    {
      key: "cos_ar",
      regex: /جتا\s*\(([^()]+)\)/g,
      tokenLabel: "جتا(...)",
      latexCmd: "\\cos",
      desc: "تحويل دالة جيب التمام (جتا) إلى \\cos",
    },
    {
      key: "sin_ar",
      regex: /جا\s*\(([^()]+)\)/g,
      tokenLabel: "جا(...)",
      latexCmd: "\\sin",
      desc: "تحويل دالة الجيب (جا) إلى \\sin",
    },
    {
      key: "cot_ar",
      regex: /ظتا\s*\(([^()]+)\)/g,
      tokenLabel: "ظتا(...)",
      latexCmd: "\\cot",
      desc: "تحويل دالة ظل التمام (ظتا) إلى \\cot",
    },
    {
      key: "tan_ar",
      regex: /(?:ظا|ظل)\s*\(([^()]+)\)/g,
      tokenLabel: "ظا(...)",
      latexCmd: "\\tan",
      desc: "تحويل دالة الظل (ظا/ظل) إلى \\tan",
    },
    {
      key: "ln_ar",
      regex: /(?:لو|لغ)\s*\(([^()]+)\)/g,
      tokenLabel: "لو(...)",
      latexCmd: "\\ln",
      desc: "تحويل دالة اللوغاريتم (لو/لغ) إلى \\ln",
    },
  ];

  for (const item of trigLogPatterns) {
    working = working.replace(item.regex, (_m, inner) => {
      recordConversion(
        item.key,
        item.tokenLabel,
        `${item.latexCmd}(...)`,
        "TRIG_LOG_LIMIT",
        item.desc
      );
      return `${item.latexCmd}(${inner})`;
    });
  }

  // 5. تحويل الدوال العددية ومشتقاتها: د''(س)، د'(س)، د(س)، ق'(س)، ق(س)، هـ(س)
  const funcPatterns: Array<{
    key: string;
    regex: RegExp;
    arabicLabel: string;
    fnLatex: string;
    desc: string;
  }> = [
    {
      key: "f_double_prime",
      regex: /د''\s*\(\s*([^()]+)\s*\)/g,
      arabicLabel: "د''(س)",
      fnLatex: "f''",
      desc: "تحويل المشتقة الثانية د''(س) إلى f''(x)",
    },
    {
      key: "f_prime",
      regex: /د'\s*\(\s*([^()]+)\s*\)/g,
      arabicLabel: "د'(س)",
      fnLatex: "f'",
      desc: "تحويل الدالة المشتقة د'(س) إلى f'(x)",
    },
    {
      key: "f_std",
      regex: /(^|[^\u0621-\u064A])د\s*\(\s*([^()]+)\s*\)/g,
      arabicLabel: "د(س)",
      fnLatex: "f",
      desc: "تحويل ترميز الدالة د(س) إلى f(x)",
    },
    {
      key: "g_prime",
      regex: /ق'\s*\(\s*([^()]+)\s*\)/g,
      arabicLabel: "ق'(س)",
      fnLatex: "g'",
      desc: "تحويل الدالة المشتقة ق'(س) إلى g'(x)",
    },
    {
      key: "g_std",
      regex: /(^|[^\u0621-\u064A])ق\s*\(\s*([^()]+)\s*\)/g,
      arabicLabel: "ق(س)",
      fnLatex: "g",
      desc: "تحويل ترميز الدالة ق(س) إلى g(x)",
    },
    {
      key: "h_std",
      regex: /(^|[^\u0621-\u064A])هـ\s*\(\s*([^()]+)\s*\)/g,
      arabicLabel: "هـ(س)",
      fnLatex: "h",
      desc: "تحويل ترميز الدالة هـ(س) إلى h(x)",
    },
  ];

  for (const fp of funcPatterns) {
    if (fp.key === "f_std" || fp.key === "g_std" || fp.key === "h_std") {
      working = working.replace(fp.regex, (_m, prefix, arg) => {
        const mappedArg = String(arg).replace(/س/g, "x").replace(/ص/g, "y").replace(/ن/g, "n");
        recordConversion(
          fp.key,
          fp.arabicLabel,
          `${fp.fnLatex}(${mappedArg})`,
          "FUNCTION_SEQUENCE",
          fp.desc
        );
        return `${prefix}${fp.fnLatex}(${mappedArg})`;
      });
    } else {
      working = working.replace(fp.regex, (_m, arg) => {
        const mappedArg = String(arg).replace(/س/g, "x").replace(/ص/g, "y").replace(/ن/g, "n");
        recordConversion(
          fp.key,
          fp.arabicLabel,
          `${fp.fnLatex}(${mappedArg})`,
          "FUNCTION_SEQUENCE",
          fp.desc
        );
        return `${fp.fnLatex}(${mappedArg})`;
      });
    }
  }

  // 6. تحويل المتتاليات العددية: (ح_ن)، ح_{ن+1}، ح_ن، ح_0، (م_ن)، م_ن
  working = working.replace(
    /\(\s*(?:ح|م)\s*_\s*\{\s*ن\s*\}\s*\)|\(\s*(?:ح|م)\s*_\s*ن\s*\)/g,
    () => {
      recordConversion(
        "seq_paren",
        "(ح_ن)",
        "(u_n)",
        "FUNCTION_SEQUENCE",
        "تحويل ترميز المتتالية (ح_ن / م_ن) إلى (u_n)"
      );
      return "(u_n)";
    }
  );

  working = working.replace(
    /(?:ح|م)\s*_\s*\{\s*([^}]+)\s*\}/g,
    (_m, subInner) => {
      const cleanSub = String(subInner).replace(/ن/g, "n");
      recordConversion(
        "seq_brace",
        "ح_{ن+1}",
        `u_{${cleanSub}}`,
        "FUNCTION_SEQUENCE",
        "تحويل الحد العام للمتتالية ح_{...} إلى u_{...}"
      );
      return `u_{${cleanSub}}`;
    }
  );

  working = working.replace(
    /(^|[^\u0621-\u064A])(?:ح|م)\s*_\s*(ن|[0-9]+)/g,
    (_m, prefix, subTok) => {
      const cleanSub = subTok === "ن" ? "n" : subTok;
      recordConversion(
        "seq_simple",
        `ح_${subTok}`,
        `u_${cleanSub}`,
        "FUNCTION_SEQUENCE",
        "تحويل حد المتتالية ح_ن / ح_0 إلى u_n / u_0"
      );
      return `${prefix}u_${cleanSub}`;
    }
  );

  // 7. تحويل المجموعات العددية العربية بعد رمز الانتماء ∈ أو عبارة "من المجموعة"
  working = working.replace(
    /(∈|\\in|في\s+المجموعة|على\s+المجموعة|من\s+المجموعة)\s*(ح\s*\^\s*\*\+|ح\s*\*\+|ح\s*\+|ح\s*\*|ح|ط\s*\*|ط|ص|ع)(?![\u0621-\u064A])/g,
    (_m, rel, setSym) => {
      const normalizedSet = setSym.replace(/\s+/g, "");
      let latexSet = "\\mathbb{R}";
      if (normalizedSet === "ح*+" || normalizedSet === "ح^*+") {
        latexSet = "\\mathbb{R}^{*+}";
      } else if (normalizedSet === "ح+") {
        latexSet = "\\mathbb{R}^+";
      } else if (normalizedSet === "ح*") {
        latexSet = "\\mathbb{R}^*";
      } else if (normalizedSet === "ط*") {
        latexSet = "\\mathbb{N}^*";
      } else if (normalizedSet === "ط") {
        latexSet = "\\mathbb{N}";
      } else if (normalizedSet === "ص") {
        latexSet = "\\mathbb{Z}";
      } else if (normalizedSet === "ع") {
        latexSet = "\\mathbb{C}";
      }
      recordConversion(
        `set_${normalizedSet}`,
        setSym,
        latexSet,
        "NUMBER_SET",
        `تحويل رمز المجموعة العددية (${setSym}) إلى ${latexSet}`
      );
      const relLatex = rel === "∈" ? "\\in" : rel;
      return `${relLatex} ${latexSet}`;
    }
  );

  // 8. تحويل المتغيرات العربية (س، ص، ن) والسهم العكسي (←) داخل مقاطع الصيغ الرياضية ($...$ أو المعادلات)
  const convertVariablesInSegment = (seg: string): string => {
    let out = seg;
    if (/←/.test(out)) {
      out = out.replace(/←/g, "\\to ");
      recordConversion(
        "arrow_rtl",
        "←",
        "\\to",
        "NUMERAL_ARROW",
        "تحويل سهم النهاية العربي (←) إلى \\to"
      );
    }
    // استبدال المتغير س المفرد (غير المتصل بحروف عربية أخرى) بـ x
    const beforeX = out;
    out = out.replace(/(^|[^\u0621-\u064A])س(?![\u0621-\u064A])/g, "$1x");
    if (out !== beforeX) {
      recordConversion(
        "var_x",
        "س",
        "x",
        "VARIABLE",
        "تحويل المتغير المجهول العربي (س) داخل الصيغة الرياضية إلى x"
      );
    }
    const beforeY = out;
    out = out.replace(/(^|[^\u0621-\u064A])ص(?![\u0621-\u064A])/g, "$1y");
    if (out !== beforeY) {
      recordConversion(
        "var_y",
        "ص",
        "y",
        "VARIABLE",
        "تحويل المتغير العربي (ص) داخل الصيغة الرياضية إلى y"
      );
    }
    const beforeN = out;
    out = out.replace(/(^|[^\u0621-\u064A])ن(?![\u0621-\u064A])/g, "$1n");
    if (out !== beforeN) {
      recordConversion(
        "var_n",
        "ن",
        "n",
        "VARIABLE",
        "تحويل دليل المتتالية العربي (ن) داخل الصيغة الرياضية إلى n"
      );
    }
    // الدالة الأسية العربية هـ^{...} أو هـ^x
    const beforeExp = out;
    out = out.replace(/(^|[^\u0621-\u064A])هـ\s*\^/g, "$1e^");
    if (out !== beforeExp) {
      recordConversion(
        "exp_ar",
        "هـ^",
        "e^",
        "TRIG_LOG_LIMIT",
        "تحويل الأساس النيبيري العربي (هـ^) إلى e^"
      );
    }
    return out;
  };

  if (working.includes("$")) {
    working = working.replace(/\$\$([\s\S]*?)\$\$/g, (_full, inner) => {
      return `$$${convertVariablesInSegment(String(inner))}$$`;
    });
    working = working.replace(
      /(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g,
      (_full, inner) => {
        return `$${convertVariablesInSegment(String(inner))}$`;
      }
    );
  } else {
    // حتى لو لم تكن الصيغة محاطة بـ $، نحول المعادلات الصريحة مثل س^2 أو جا(س) التي تم تحويل دالتها للتو
    working = working.replace(
      /(\\(?:sin|cos|tan|cot|ln|sqrt|lim)\s*(?:\{[^}]+\}|\([^()]+\)))/g,
      (m) => convertVariablesInSegment(m)
    );
    working = working.replace(
      /(^|[\s(=+-])س(\s*(?:\^\s*[0-9]+|[+\-*/=<>≤≥])\s*[0-9x]+)/g,
      (_m, p1, rest) => {
        recordConversion(
          "var_x",
          "س",
          "x",
          "VARIABLE",
          "تحويل المتغير المجهول العربي (س) في المعادلة الجبرية إلى x"
        );
        return `${p1}x${ convertVariablesInSegment(String(rest)) }`;
      }
    );
  }

  const convertedTokensLog = Array.from(conversionsMap.values());
  const legacyScriptType: ArabicMathOcrDiagnostics["legacyScriptType"] =
    totalTokensCount >= 4
      ? "ARABIC_MATH_LEGACY"
      : totalTokensCount >= 1
      ? "MOROCCAN_BILINGUAL_HYBRID"
      : "STANDARD_LATIN_LATEX";

  const notationConfidenceBoostPct = Math.min(
    22,
    convertedTokensLog.length * 3 + Math.min(8, Math.floor(totalTokensCount / 2))
  );

  return {
    mode,
    originalText,
    transpiledText: working,
    detectedArabicMathTokensCount: totalTokensCount,
    convertedTokensLog,
    legacyScriptType,
    notationConfidenceBoostPct,
    arabicIndicDigitsConverted,
  };
}

function repairBareMathSegment(segment: string, fixes: Set<string>): string {
  let out = segment;

  // 0. تحويل الترميز الرياضي العربي التراثي داخل المقطع الرياضي أولاً
  const arabicTranspiled = transpileArabicMathNotationToLatex(
    `$${out}$`,
    "CONVERT_TO_STANDARD_LATEX"
  );
  if (arabicTranspiled.detectedArabicMathTokensCount > 0) {
    out = arabicTranspiled.transpiledText.replace(/^\$|\$$/g, "");
    for (const c of arabicTranspiled.convertedTokensLog) {
      fixes.add(c.descriptionAr);
    }
  }

  // 1. Unicode math symbols -> proper LaTeX inside $...$ / $$...$$
  for (const [pattern, replacement, label] of UNICODE_TO_LATEX_IN_MATH) {
    if (pattern.test(out)) {
      out = out.replace(pattern, replacement);
      fixes.add(label);
    }
  }

  // 2. Unicode √ followed by expression or single token -> \sqrt{...}
  const sqrtUnicodeBefore = out;
  out = out
    .replace(/√\s*\(([^()]+)\)/g, "\\sqrt{$1}")
    .replace(/√([a-zA-Z0-9]+)/g, "\\sqrt{$1}");
  if (out !== sqrtUnicodeBefore) {
    fixes.add("تحويل رمز √ إلى \\sqrt{...}");
  }

  // 3. Bare shorthand commands: \frac a b -> \frac{a}{b}, \sqrt x -> \sqrt{x}
  const fracShortBefore = out;
  out = out.replace(
    /\\(d?frac)\s+([a-zA-Z0-9])\s+([a-zA-Z0-9])/g,
    "\\$1{$2}{$3}"
  );
  if (out !== fracShortBefore) {
    fixes.add("إصلاح صيغة الكسر المختصر \\frac a b إلى \\frac{a}{b}");
  }

  const sqrtShortBefore = out;
  out = out.replace(/\\sqrt\s+([a-zA-Z0-9])/g, "\\sqrt{$1}");
  if (out !== sqrtShortBefore) {
    fixes.add("إصلاح صيغة الجذر المختصر \\sqrt x إلى \\sqrt{x}");
  }

  // 4. Bare common OCR operators (lim_, ln(, sin(, cos(, exp() missing backslash
  const bareOpsBefore = out;
  out = out
    .replace(/(^|[^\\a-zA-Z])lim_/g, "$1\\lim_")
    .replace(/(^|[^\\a-zA-Z])(ln|log|sin|cos|tan|exp)\s*\(/g, "$1\\$2(");
  if (out !== bareOpsBefore) {
    fixes.add("إضافة شرطة LaTeX (\\) قبل الدوال الرياضية (lim/ln/sin/cos)");
  }

  // 5. Superscript ² / ³ -> ^{2} / ^{3}
  const supBefore = out;
  out = out.replace(/²/g, "^{2}").replace(/³/g, "^{3}");
  if (out !== supBefore) {
    fixes.add("تحويل الأسس الفوقية ²/³ إلى ^{2}/^{3}");
  }

  // Collapse excess whitespace produced after replacements
  out = out.replace(/\s{2,}/g, " ").trim();
  return out;
}

/**
 * ينقّي ويصلح صيغ LaTeX المستخرجة عبر الـ OCR مع دعم تحويل الترميز الرياضي العربي التراثي.
 */
export function sanitizeOcrMathString(
  rawInput: string,
  treatWholeAsMath = false,
  arabicNotationMode: ArabicMathNotationMode = "CONVERT_TO_STANDARD_LATEX"
): OcrMathSanitizationResult {
  const original = rawInput || "";
  if (!original.trim()) {
    return {
      original,
      sanitized: original,
      fixesCount: 0,
      fixesApplied: [],
      integrityScorePct: 100,
      issues: [],
    };
  }

  const fixes = new Set<string>();
  let working = original;

  // 0. تمرير النص عبر محرك الترميز الرياضي العربي التراثي أولاً
  const arabicPass = transpileArabicMathNotationToLatex(working, arabicNotationMode);
  if (arabicPass.detectedArabicMathTokensCount > 0) {
    working = arabicPass.transpiledText;
    for (const item of arabicPass.convertedTokensLog) {
      fixes.add(item.descriptionAr);
    }
  }

  // Normalize \( ... \) and \[ ... \] to $ ... $ / $$ ... $$
  if (/\\\(|\\\[/.test(working)) {
    working = working
      .replace(/\\\(/g, "$")
      .replace(/\\\)/g, "$")
      .replace(/\\\[/g, "$$")
      .replace(/\\\]/g, "$$");
    fixes.add("توحيد محددات LaTeX إلى $...$");
  }

  // Pre-balance delimiters ($ and braces) first so even unclosed trailing $... blocks get repaired
  const preBalanced = sanitizeQuestionMathExpressions(working);
  if (preBalanced.wasAutoFixed) {
    working = preBalanced.sanitizedText;
    for (const iss of preBalanced.issues) {
      fixes.add(iss.messageAr);
    }
  }

  if (treatWholeAsMath && !working.includes("$")) {
    working = repairBareMathSegment(working, fixes);
  } else {
    // Process $$...$$ and $...$ segments
    working = working.replace(/\$\$([\s\S]*?)\$\$/g, (_full, inner) => {
      return `$$${repairBareMathSegment(String(inner), fixes)}$$`;
    });
    working = working.replace(/(?<!\$)\$(?!\$)([^$\n]+?)(?<!\$)\$(?!\$)/g, (_full, inner) => {
      return `$${repairBareMathSegment(String(inner), fixes)}$`;
    });
  }

  // Final brace, paren, empty fraction, and $ delimiter pass after segment repairs
  const baseSanitized = sanitizeQuestionMathExpressions(working);
  if (baseSanitized.wasAutoFixed) {
    for (const iss of baseSanitized.issues) {
      fixes.add(iss.messageAr);
    }
  }

  // Run mathjs AST structural validation on extracted segments
  const validation = validateCustomQuestionWithMathJS(
    treatWholeAsMath && !baseSanitized.sanitizedText.includes("$")
      ? `$${baseSanitized.sanitizedText}$`
      : baseSanitized.sanitizedText
  );

  const errorIssues = validation.issues.filter((i) => i.type === "ERROR");
  const warningIssues = validation.issues.filter((i) => i.type === "WARNING");
  const unparsedExprs = validation.expressionsChecked.filter((e) => !e.isValid);

  let score = 100;
  score -= errorIssues.length * 18;
  score -= warningIssues.length * 6;
  score -= unparsedExprs.length * 5;
  // Auto-repaired expressions still preserve near-full integrity after repair
  const integrityScorePct = Math.max(40, Math.min(100, Math.round(score)));

  return {
    original,
    sanitized: baseSanitized.sanitizedText,
    fixesCount: fixes.size,
    fixesApplied: Array.from(fixes),
    integrityScorePct,
    issues: validation.issues,
  };
}

/**
 * يفحص ويصحح كافة تمارين وأسئلة وحلول مطابقة المنهاج المستخرجة من الـ OCR
 */
export function validateAndSanitizeOcrMapping<
  T extends {
    exercises: Array<{
      id: string;
      titleAr: string;
      titleFr: string;
      questionsAr: string[];
      questionsFr: string[];
      solutionsAr?: string[];
      solutionsFr?: string[];
      [key: string]: any;
    }>;
    [key: string]: any;
  },
>(
  mapping: T,
  arabicNotationMode: ArabicMathNotationMode = "CONVERT_TO_STANDARD_LATEX"
): {
  sanitizedMapping: T;
  summary: OcrMappingValidationSummary;
} {
  let totalFixes = 0;
  let totalChecked = 0;
  let scoreSum = 0;
  const collectedIssues: MathValidationIssue[] = [];

  const cleanStr = (txt: string): string => {
    const res = sanitizeOcrMathString(txt, false, arabicNotationMode);
    totalFixes += res.fixesCount;
    totalChecked += 1;
    scoreSum += res.integrityScorePct;
    if (res.issues.length > 0 && collectedIssues.length < 25) {
      collectedIssues.push(...res.issues.filter((i) => i.type !== "INFO"));
    }
    return res.sanitized;
  };

  const sanitizedExercises = (mapping.exercises || []).map((ex) => ({
    ...ex,
    titleAr: cleanStr(ex.titleAr),
    titleFr: cleanStr(ex.titleFr),
    questionsAr: (ex.questionsAr || []).map(cleanStr),
    questionsFr: (ex.questionsFr || []).map(cleanStr),
    ...(Array.isArray(ex.solutionsAr)
      ? { solutionsAr: ex.solutionsAr.map(cleanStr) }
      : {}),
    ...(Array.isArray(ex.solutionsFr)
      ? { solutionsFr: ex.solutionsFr.map(cleanStr) }
      : {}),
  }));

  const avgScore =
    totalChecked > 0 ? Math.round(scoreSum / totalChecked) : 100;

  return {
    sanitizedMapping: {
      ...mapping,
      exercises: sanitizedExercises,
    },
    summary: {
      integrityScorePct: avgScore,
      fixesAppliedCount: totalFixes,
      expressionsCheckedCount: totalChecked,
      issues: collectedIssues,
    },
  };
}

/**
 * ينقّي ويصلح صيغ LaTeX داخل تقرير التصحيح الآلي لورقة التلميذ
 */
export function validateAndSanitizeGradingReport<
  T extends {
    transcribedStudentLatex: string;
    gradedItems: Array<{
      studentAnswerLatex: string;
      referenceSolutionLatex: string;
      [key: string]: any;
    }>;
    printableRemediationSheet: {
      remediationExercises: Array<{
        questionsAr: string[];
        questionsFr: string[];
        solutionHintAr: string;
        [key: string]: any;
      }>;
      [key: string]: any;
    };
    [key: string]: any;
  },
>(
  report: T,
  arabicNotationMode: ArabicMathNotationMode = "CONVERT_TO_STANDARD_LATEX"
): {
  sanitizedReport: T;
  summary: OcrMappingValidationSummary;
} {
  let totalFixes = 0;
  let totalChecked = 0;
  let scoreSum = 0;
  const collectedIssues: MathValidationIssue[] = [];

  const cleanField = (txt: string, asPureMath: boolean): string => {
    const res = sanitizeOcrMathString(txt, asPureMath, arabicNotationMode);
    totalFixes += res.fixesCount;
    totalChecked += 1;
    scoreSum += res.integrityScorePct;
    if (res.issues.length > 0 && collectedIssues.length < 25) {
      collectedIssues.push(...res.issues.filter((i) => i.type !== "INFO"));
    }
    return res.sanitized;
  };

  const sanitizedReport: T = {
    ...report,
    transcribedStudentLatex: cleanField(report.transcribedStudentLatex || "", false),
    gradedItems: (report.gradedItems || []).map((item) => ({
      ...item,
      studentAnswerLatex: cleanField(item.studentAnswerLatex || "", true),
      referenceSolutionLatex: cleanField(item.referenceSolutionLatex || "", true),
    })),
    printableRemediationSheet: {
      ...report.printableRemediationSheet,
      remediationExercises: (
        report.printableRemediationSheet?.remediationExercises || []
      ).map((rem) => ({
        ...rem,
        questionsAr: (rem.questionsAr || []).map((q) => cleanField(q, false)),
        questionsFr: (rem.questionsFr || []).map((q) => cleanField(q, false)),
        solutionHintAr: cleanField(rem.solutionHintAr || "", false),
      })),
    },
  };

  const avgScore =
    totalChecked > 0 ? Math.round(scoreSum / totalChecked) : 100;

  return {
    sanitizedReport,
    summary: {
      integrityScorePct: avgScore,
      fixesAppliedCount: totalFixes,
      expressionsCheckedCount: totalChecked,
      issues: collectedIssues,
    },
  };
}
