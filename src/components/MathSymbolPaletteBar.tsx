import React, { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";

export interface MathSymbolItem {
  glyph: string;
  latex?: string;
  nameAr: string;
  nameFr: string;
  category: "ANALYSIS" | "GEOMETRY" | "SETS_LOGIC" | "GREEK";
}

export const MATH_SYMBOLS_LIBRARY: MathSymbolItem[] = [
  // 1. التحليل والتفاضل والتكامل (Analyse & Calcul)
  { glyph: "∫", latex: "\\int", nameAr: "تكامل", nameFr: "Intégrale", category: "ANALYSIS" },
  { glyph: "∑", latex: "\\sum", nameAr: "مجموع", nameFr: "Somme", category: "ANALYSIS" },
  { glyph: "lim", latex: "\\lim_{x \\to +\\infty}", nameAr: "نهاية", nameFr: "Limite", category: "ANALYSIS" },
  { glyph: "√x", latex: "\\sqrt{x}", nameAr: "جذر مربع", nameFr: "Racine carrée", category: "ANALYSIS" },
  { glyph: "f'(x)", latex: "f'(x)", nameAr: "مشتقة أولى", nameFr: "Dérivée première", category: "ANALYSIS" },
  { glyph: "f''(x)", latex: "f''(x)", nameAr: "مشتقة ثانية", nameFr: "Dérivée seconde", category: "ANALYSIS" },
  { glyph: "∂", latex: "\\partial", nameAr: "مشتق جزئي", nameFr: "Dérivée partielle", category: "ANALYSIS" },
  { glyph: "eˣ", latex: "e^{x}", nameAr: "دالة أسية", nameFr: "Exponentielle", category: "ANALYSIS" },
  { glyph: "ln(x)", latex: "\\ln(x)", nameAr: "لوغاريتم نبيري", nameFr: "Logarithme népérien", category: "ANALYSIS" },
  { glyph: "(uₙ)", latex: "(u_n)", nameAr: "متتالية عددية", nameFr: "Suite numérique", category: "ANALYSIS" },
  { glyph: "∞", latex: "+\\infty", nameAr: "لا نهاية", nameFr: "Infini", category: "ANALYSIS" },
  { glyph: "π", latex: "\\pi", nameAr: "العدد باي", nameFr: "Pi", category: "ANALYSIS" },
  { glyph: "(𝒞f)", latex: "(\\mathcal{C}_f)", nameAr: "منحنى دالة", nameFr: "Courbe représentative", category: "ANALYSIS" },
  { glyph: "dx", latex: "dx", nameAr: "تفاضل x", nameFr: "Différentielle", category: "ANALYSIS" },

  // 2. الهندسة والمتجهات والفضاء (Géométrie, Vecteurs & Espace)
  { glyph: "u⃗", latex: "\\vec{u}", nameAr: "متجهة u", nameFr: "Vecteur u", category: "GEOMETRY" },
  { glyph: "v⃗", latex: "\\vec{v}", nameAr: "متجهة v", nameFr: "Vecteur v", category: "GEOMETRY" },
  { glyph: "AB⃗", latex: "\\vec{AB}", nameAr: "متجهة AB", nameFr: "Vecteur AB", category: "GEOMETRY" },
  { glyph: "n⃗", latex: "\\vec{n}", nameAr: "متجهة منظمية", nameFr: "Vecteur normal", category: "GEOMETRY" },
  { glyph: "‖u⃗‖", latex: "\\|\\vec{u}\\|", nameAr: "معيار متجهة", nameFr: "Norme de vecteur", category: "GEOMETRY" },
  { glyph: "u⃗·v⃗", latex: "\\vec{u} \\cdot \\vec{v}", nameAr: "جداء سلمي", nameFr: "Produit scalaire", category: "GEOMETRY" },
  { glyph: "u⃗∧v⃗", latex: "\\vec{u} \\wedge \\vec{v}", nameAr: "جداء متجهي", nameFr: "Produit vectoriel", category: "GEOMETRY" },
  { glyph: "⊥", latex: "\\perp", nameAr: "تعامد", nameFr: "Perpendiculaire", category: "GEOMETRY" },
  { glyph: "∥", latex: "\\parallel", nameAr: "توازي", nameFr: "Parallèle", category: "GEOMETRY" },
  { glyph: "(𝒟)", latex: "(\\mathcal{D})", nameAr: "مستقيم D", nameFr: "Droite D", category: "GEOMETRY" },
  { glyph: "(𝒫)", latex: "(\\mathcal{P})", nameAr: "مستوى P", nameFr: "Plan P", category: "GEOMETRY" },
  { glyph: "(𝒮)", latex: "(\\mathcal{S})", nameAr: "فلكة S", nameFr: "Sphère S", category: "GEOMETRY" },
  { glyph: "Ω", latex: "\\Omega", nameAr: "مركز فلكة أو أوميغا", nameFr: "Centre Oméga", category: "GEOMETRY" },

  // 3. المجموعات والمنطق (Ensembles & Logique)
  { glyph: "ℝ", latex: "\\mathbb{R}", nameAr: "مجموعة الأعداد الحقيقية", nameFr: "Ensemble des réels", category: "SETS_LOGIC" },
  { glyph: "ℕ", latex: "\\mathbb{N}", nameAr: "الأعداد الصحيحة الطبيعية", nameFr: "Entiers naturels", category: "SETS_LOGIC" },
  { glyph: "ℤ", latex: "\\mathbb{Z}", nameAr: "الأعداد النسبية", nameFr: "Entiers relatifs", category: "SETS_LOGIC" },
  { glyph: "ℚ", latex: "\\mathbb{Q}", nameAr: "الأعداد الجذرية", nameFr: "Rationnels", category: "SETS_LOGIC" },
  { glyph: "ℂ", latex: "\\mathbb{C}", nameAr: "الأعداد العقدية", nameFr: "Nombres complexes", category: "SETS_LOGIC" },
  { glyph: "∈", latex: "\\in", nameAr: "ينتمي إلى", nameFr: "Appartient à", category: "SETS_LOGIC" },
  { glyph: "∉", latex: "\\notin", nameAr: "لا ينتمي", nameFr: "N'appartient pas", category: "SETS_LOGIC" },
  { glyph: "⊂", latex: "\\subset", nameAr: "ضمن / احتواء", nameFr: "Inclus dans", category: "SETS_LOGIC" },
  { glyph: "∩", latex: "\\cap", nameAr: "تقاطع", nameFr: "Intersection", category: "SETS_LOGIC" },
  { glyph: "∪", latex: "\\cup", nameAr: "اتحاد", nameFr: "Union", category: "SETS_LOGIC" },
  { glyph: "⇒", latex: "\\implies", nameAr: "استلزام", nameFr: "Implication", category: "SETS_LOGIC" },
  { glyph: "⇔", latex: "\\iff", nameAr: "تكافؤ", nameFr: "Équivalence", category: "SETS_LOGIC" },
  { glyph: "∀", latex: "\\forall", nameAr: "مهما يكن (لكل)", nameFr: "Pour tout", category: "SETS_LOGIC" },
  { glyph: "∃", latex: "\\exists", nameAr: "يوجد على الأقل", nameFr: "Il existe", category: "SETS_LOGIC" },
  { glyph: "≤", latex: "\\le", nameAr: "أصغر من أو يساوي", nameFr: "Inférieur ou égal", category: "SETS_LOGIC" },
  { glyph: "≥", latex: "\\ge", nameAr: "أكبر من أو يساوي", nameFr: "Supérieur ou égal", category: "SETS_LOGIC" },
  { glyph: "≠", latex: "\\neq", nameAr: "يخالف", nameFr: "Différent de", category: "SETS_LOGIC" },
  { glyph: "∅", latex: "\\emptyset", nameAr: "المجموعة الفارغة", nameFr: "Ensemble vide", category: "SETS_LOGIC" },

  // 4. الحروف اليونانية والمتغيرات (Lettres Grecques & Constantes)
  { glyph: "α", latex: "\\alpha", nameAr: "ألفا", nameFr: "Alpha", category: "GREEK" },
  { glyph: "β", latex: "\\beta", nameAr: "بيتا", nameFr: "Bêta", category: "GREEK" },
  { glyph: "γ", latex: "\\gamma", nameAr: "غاما", nameFr: "Gamma", category: "GREEK" },
  { glyph: "θ", latex: "\\theta", nameAr: "ثيتا (عمدة/زاوية)", nameFr: "Thêta", category: "GREEK" },
  { glyph: "λ", latex: "\\lambda", nameAr: "لامدا (معامل)", nameFr: "Lambda", category: "GREEK" },
  { glyph: "Δ", latex: "\\Delta", nameAr: "دلتا (مميز المعادلة)", nameFr: "Discriminant Delta", category: "GREEK" },
  { glyph: "σ", latex: "\\sigma", nameAr: "سيغما (انحراف معياري)", nameFr: "Écart-type Sigma", category: "GREEK" },
  { glyph: "φ", latex: "\\varphi", nameAr: "فاي (النسبة الذهبية)", nameFr: "Phi", category: "GREEK" },
];

interface MathSymbolPaletteBarProps {
  onInsertSymbol?: (glyph: string, latex?: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isArabic?: boolean;
}

export const MathSymbolPaletteBar: React.FC<MathSymbolPaletteBarProps> = ({
  onInsertSymbol,
  isOpen,
  onToggle,
  isArabic = true,
}) => {
  const [selectedCat, setSelectedCat] = useState<"ALL" | "ANALYSIS" | "GEOMETRY" | "SETS_LOGIC" | "GREEK">("ALL");
  const [copiedGlyph, setCopiedGlyph] = useState<string | null>(null);

  const categories = [
    { id: "ALL" as const, labelAr: "الكل (∫, ∑, ℝ, u⃗)", labelFr: "Tous" },
    { id: "ANALYSIS" as const, labelAr: "تفاضل وتكامل (∫, ∑, lim)", labelFr: "Analyse" },
    { id: "GEOMETRY" as const, labelAr: "متجهات وهندسة (u⃗, ⊥, ‖‖)", labelFr: "Géométrie" },
    { id: "SETS_LOGIC" as const, labelAr: "مجموعات ومنطق (ℝ, ⇒, ∀)", labelFr: "Logique" },
    { id: "GREEK" as const, labelAr: "حروف إغريقية (α, θ, Δ)", labelFr: "Grec" },
  ];

  const filteredSymbols = selectedCat === "ALL" 
    ? MATH_SYMBOLS_LIBRARY 
    : MATH_SYMBOLS_LIBRARY.filter((s) => s.category === selectedCat);

  const handleCopyOrInsert = (item: MathSymbolItem) => {
    // 1. نسخ إلى الحافظة
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(item.glyph);
    }
    setCopiedGlyph(item.glyph);
    setTimeout(() => {
      setCopiedGlyph(null);
    }, 1800);

    // 2. إدراج إن وُجد معالج مخصص
    if (onInsertSymbol) {
      onInsertSymbol(item.glyph, item.latex);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="شريط الرموز والتعابير الرياضية الهادئ"
      className="no-print bg-slate-900/95 text-slate-100 border-b border-cyan-950/60 shadow-lg backdrop-blur-md transition-all select-none"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 space-y-2">
        {/* شريط العنوان والفئات بألوان هادئة وباردة */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 flex items-center justify-center font-serif text-sm font-black shadow-xs">
              ∫
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-cyan-200">لوحة الرموز والعمليات الرياضية:</span>
              <span className="text-[11px] text-slate-400">
                (انقر فوق أي رمز لنسخه فورا إلى الحافظة أو إدراجه)
              </span>
            </div>
            {copiedGlyph && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-900/90 text-cyan-200 border border-cyan-400/50 text-[10.5px] font-bold flex items-center gap-1 animate-pulse">
                <Check className="w-3 h-3 text-cyan-300" />
                <span>تم نسخ: {copiedGlyph}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* أزرار الفئات الباردة */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px]">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCat(c.id)}
                  className={`px-2 py-1 rounded-md font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedCat === c.id
                      ? "bg-cyan-600 text-white shadow-2xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {isArabic ? c.labelAr : c.labelFr}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onToggle}
              title="إغلاق لوحة الرموز"
              className="w-6 h-6 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* شبكة الرموز الرياضية التفاعلية بألوان زرقاء وسماوية هادئة */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto studio-scroll py-1">
          {filteredSymbols.map((item) => (
            <button
              key={item.glyph}
              type="button"
              onClick={() => handleCopyOrInsert(item)}
              title={`${item.nameAr} (${item.nameFr}) · LaTeX: ${item.latex || item.glyph}`}
              className="math-symbol-btn group relative h-8 min-w-[34px] px-2 rounded-lg bg-slate-800/90 hover:bg-cyan-950/70 border border-slate-700/70 hover:border-cyan-400/60 text-slate-100 hover:text-cyan-200 text-sm font-semibold flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            >
              <span>{item.glyph}</span>
              <span className="sr-only">{item.nameAr}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
