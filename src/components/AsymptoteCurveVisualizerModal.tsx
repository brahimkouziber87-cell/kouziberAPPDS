import React, { useState, useMemo } from "react";
import {
  X,
  Compass,
  Code2,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import {
  analyzeFunctionAsymptotesAndCurve,
  AsymptoteSpec,
} from "../utils/asymptoteCurveEngine";

export interface AsymptoteCurveVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFr?: boolean;
}

export const AsymptoteCurveVisualizerModal: React.FC<AsymptoteCurveVisualizerModalProps> = ({
  isOpen,
  onClose,
  isFr = false,
}) => {
  const [exprInput, setExprInput] = useState<string>("f(x) = (2*x + 1)/(x - 1)");
  const [copiedTikz, setCopiedTikz] = useState(false);

  const analysis = useMemo(
    () => analyzeFunctionAsymptotesAndCurve(exprInput),
    [exprInput]
  );

  if (!isOpen) return null;

  const handleCopyTikz = () => {
    navigator.clipboard.writeText(analysis.tikzSnippet);
    setCopiedTikz(true);
    setTimeout(() => setCopiedTikz(false), 2000);
  };

  const presetFunctions = [
    { label: "دالة تناسبية (Homographique)", expr: "f(x) = (2*x + 1)/(x - 1)" },
    { label: "دالة أسية مع مقارب أفقي (Exponentielle)", expr: "f(x) = exp(-x) + 2" },
    { label: "دالة لوغاريتمية مع مقارب عمودي (Logarithmique)", expr: "f(x) = ln(x) - x" },
    { label: "دالة كسرية مع مقارب مائل (Oblique)", expr: "f(x) = (x^2 + 1)/(x - 1)" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
      dir={isFr ? "ltr" : "rtl"}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* شريط العنوان التفاعلي */}
        <div className="bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-900 px-5 py-3.5 border-b border-cyan-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">
                  {isFr
                    ? "Traceur de Courbes & Détecteur d'Asymptotes Mathématiques"
                    : "مختبر رسم المنحنيات واستنتاج المقاربات والفروع اللانهائية"}
                </h3>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  SVG + TikZ
                </span>
              </div>
              <p className="text-xs text-cyan-200/80">
                {isFr
                  ? "Détection automatique des asymptotes verticales, horizontales et obliques avec tracé vectoriel SVG et export LaTeX"
                  : "استنتاج فوري للمستقيمات المقاربة الأفقية والعمودية والمائلة ورسم المنحنى بدقة متجهية"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم النافذة */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/50 space-y-4">
          {/* حقل إدخال الدالة ونماذج سريعة */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-300">
                {isFr ? "Expression de la fonction f(x) :" : "تعبير الدالة العددية f(x) :"}
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {presetFunctions.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setExprInput(p.expr)}
                    className="text-[10.5px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-slate-700 transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={exprInput}
              onChange={(e) => setExprInput(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl px-3.5 py-2 font-mono text-sm text-cyan-300 focus:outline-none"
            />
          </div>

          {/* العرض البصري: رسم SVG + المقاربات المستنتجة */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* بطاقة رسم SVG التفاعلي */}
            <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
              <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
                <span>{isFr ? "Repère Orthonormé (O, i, j) :" : "المعلم المتعامد الممنظم (O, i, j) :"}</span>
                <span className="font-mono text-[10px] text-cyan-300">360 × 240 px</span>
              </div>
              <div
                className="p-2 w-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: analysis.svgMarkup }}
              />
            </div>

            {/* بطاقة المقاربات المستنتجة وكود TikZ */}
            <div className="md:col-span-5 space-y-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="text-xs font-black text-white flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {isFr ? "Asymptotes & Branches Détectées :" : "المقاربات والفروع اللانهائية المرصودة :"}
                  </span>
                </div>

                <div className="space-y-2">
                  {analysis.asymptotes.map((asymp, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-cyan-300">
                          {asymp.equationLatex}
                        </span>
                        <span
                          className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded ${
                            asymp.type === "VERTICAL"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : asymp.type === "HORIZONTAL"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : "bg-indigo-950 text-indigo-300 border border-indigo-800"
                          }`}
                        >
                          {asymp.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {isFr ? asymp.descriptionFr : asymp.descriptionAr}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* كود TikZ لملفات LaTeX */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Code2 className="w-3 h-3 text-cyan-400" />
                    <span>TikZ Code (LaTeX)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyTikz}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold flex items-center gap-1"
                  >
                    {copiedTikz ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTikz ? (isFr ? "Copié !" : "تم النسخ!") : (isFr ? "Copier" : "نسخ")}</span>
                  </button>
                </div>
                <pre
                  dir="ltr"
                  className="bg-slate-950 p-2 rounded text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-28"
                >
                  {analysis.tikzSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
