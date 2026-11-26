import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  X,
  Sparkles,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Download,
  Upload,
  RefreshCw,
  FileCode,
  ShieldCheck,
  Zap,
  Check,
  ChevronRight,
  Code2,
  BookOpen,
} from "lucide-react";
import {
  cleanLatexDocument,
  DEFAULT_CLEANER_OPTIONS,
  LatexCleanerOptions,
  LatexCleaningResult,
  SAMPLE_DIRTY_LATEX_WITH_CONFLICTS,
  PACKAGE_TIER_PRIORITY,
} from "../utils/latexPreambleAndSymbolCleaner";

interface LatexCleanerStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  onApplyCleanedCode: (cleanedCode: string, reportSummary: string) => void;
}

type TabType = "DIFF" | "PREAMBLE" | "SYMBOLS" | "AUDIT" | "RAW_OUTPUT";

export const LatexCleanerStudioModal: React.FC<LatexCleanerStudioModalProps> = ({
  isOpen,
  onClose,
  initialCode = "",
  onApplyCleanedCode,
}) => {
  const [inputCode, setInputCode] = useState<string>(
    initialCode || SAMPLE_DIRTY_LATEX_WITH_CONFLICTS
  );
  const [options, setOptions] = useState<LatexCleanerOptions>(DEFAULT_CLEANER_OPTIONS);
  const [activeTab, setActiveTab] = useState<TabType>("DIFF");
  const [copiedCleaned, setCopiedCleaned] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحديث الكود عند فتح النافذة إذا كان هناك كود أولي جديد
  React.useEffect(() => {
    if (isOpen && initialCode && initialCode.trim().length > 0) {
      setInputCode(initialCode);
    }
  }, [isOpen, initialCode]);

  // تشغيل محرك التنظيف وإعادة الترتيب التلقائي
  const cleaningResult: LatexCleaningResult = useMemo(() => {
    return cleanLatexDocument(inputCode, options);
  }, [inputCode, options]);

  // رفع ملف .tex خارجي
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        setInputCode(text);
      } catch (err) {
        console.error("فشل قراءة الملف:", err);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    []
  );

  // نسخ الكود المنظف
  const handleCopyCleaned = useCallback(() => {
    navigator.clipboard.writeText(cleaningResult.cleanedCode);
    setCopiedCleaned(true);
    setTimeout(() => setCopiedCleaned(false), 2200);
  }, [cleaningResult.cleanedCode]);

  // تنزيل ملف .tex منظف
  const handleDownloadCleaned = useCallback(() => {
    const blob = new Blob([cleaningResult.cleanedCode], {
      type: "text/x-tex;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Document_Latex_Cleaned_Normalized.tex";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [cleaningResult.cleanedCode]);

  // تطبيق الكود على محرر التطبيق
  const handleApply = useCallback(() => {
    const summary = `تم تنظيف الكود بنجاح: إعادة ترتيب ${cleaningResult.preambleReport.reorderedPackagesCount} حزمة في الترويسة، وتحويل ${cleaningResult.symbolReport.totalConversionsCount} رمز وأمر TeX قديم.`;
    onApplyCleanedCode(cleaningResult.cleanedCode, summary);
    setAppliedStatus(true);
    setTimeout(() => {
      setAppliedStatus(false);
      onClose();
    }, 900);
  }, [cleaningResult, onApplyCleanedCode, onClose]);

  // تحميل نموذج الاختبار المحتوي على تعارضات
  const handleLoadSample = useCallback(() => {
    setInputCode(SAMPLE_DIRTY_LATEX_WITH_CONFLICTS);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-slate-100">
        {/* شريط العنوان التفاعلي */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-5 py-3.5 border-b border-indigo-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  أداة تنظيف وترتيب وثائق LaTeX المستوردة
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  محرك ترويسة ذكي + تطبيع الرموز
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                تصحيح ترتيب الحزم في الترويسة لمنع التعارضات وحل نزاعات Option Clash وتحويل الرموز الرياضية غير القياسية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".tex,text/x-tex,text/plain"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-700/70 flex items-center gap-1.5 transition"
              title="استيراد ملف .tex من جهازك"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>رفع ملف .tex</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
              title="تجربة نموذج يحوي تعارضات حزم ورموز يونيكود"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">نموذج تجريبي</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* بطاقات الإحصاءات والتشخيص السريع */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-5 py-2.5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 text-xs shrink-0">
          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">حزم الترويسة</div>
              <div className="font-bold text-slate-200">
                {cleaningResult.preambleReport.reorderedPackagesCount} حزمة مرتبة
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">تعارضات تم حلها</div>
              <div className="font-bold text-emerald-400">
                {cleaningResult.preambleReport.clashResolvedCount +
                  (cleaningResult.preambleReport.amsthmOrderFixed ? 1 : 0) +
                  (cleaningResult.preambleReport.cleverefRepositioned ? 1 : 0) +
                  (cleaningResult.preambleReport.xcolorClashFixed ? 1 : 0)}{" "}
                تعارض حرج
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">رموز رياضية محولة</div>
              <div className="font-bold text-amber-300">
                {cleaningResult.symbolReport.mathSymbolsConvertedCount +
                  cleaningResult.symbolReport.superscriptsSubscriptsConvertedCount}{" "}
                رمز قياسي
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">أوامر TeX قديمة</div>
              <div className="font-bold text-cyan-300">
                {cleaningResult.symbolReport.obsoleteCommandsUpdatedCount} تم تحديثها
              </div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">إجمالي التعديلات</div>
              <div className="font-bold text-purple-300">
                {cleaningResult.symbolReport.totalConversionsCount +
                  cleaningResult.preambleReport.reorderedPackagesCount}
              </div>
            </div>
          </div>
        </div>

        {/* خيارات المحرك والتبويبات */}
        <div className="px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* التبويبات */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("DIFF")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === "DIFF"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>مقارنة الكود (Diff)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PREAMBLE")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === "PREAMBLE"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ترتيب الترويسة ({cleaningResult.preambleReport.reorderedPackagesCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SYMBOLS")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === "SYMBOLS"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>الرموز المحولة ({cleaningResult.symbolReport.sampleConversions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("AUDIT")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === "AUDIT"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>سجل التدقيق ({cleaningResult.auditLog.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("RAW_OUTPUT")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === "RAW_OUTPUT"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>الكود النهائي</span>
            </button>
          </div>

          {/* مفاتيح التبديل السريعة لخيارات المحرك */}
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
              <input
                type="checkbox"
                checked={options.reorderPreamble}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, reorderPreamble: e.target.checked }))
                }
                className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>إعادة ترتيب الترويسة</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
              <input
                type="checkbox"
                checked={options.resolvePackageClashes}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    resolvePackageClashes: e.target.checked,
                  }))
                }
                className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>حل تعارض الحزم</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
              <input
                type="checkbox"
                checked={options.convertUnicodeMathSymbols}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    convertUnicodeMathSymbols: e.target.checked,
                  }))
                }
                className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>تطبيع رموز الرياضيات</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
              <input
                type="checkbox"
                checked={options.modernizeObsoleteCommands}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    modernizeObsoleteCommands: e.target.checked,
                  }))
                }
                className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
              />
              <span>تحديث الأوامر القديمة</span>
            </label>
          </div>
        </div>

        {/* جسم النافذة الرئيسي حسب التبويب */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/40">
          {activeTab === "DIFF" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-[440px]">
              {/* الكود الأصلي المدخل */}
              <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                <div className="bg-slate-950 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                    <span>الكود الأصلي (يمكنك لصق أو تعديل الكود هنا)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {inputCode.split("\n").length} سطر
                  </span>
                </div>
                <textarea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  dir="ltr"
                  placeholder="% الصق كود LaTeX هنا..."
                  className="flex-1 w-full bg-slate-900/90 text-slate-200 font-mono text-xs p-3.5 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 selection:bg-indigo-700 selection:text-white leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* الكود المنظف والمرتب */}
              <div className="flex flex-col bg-slate-900 border border-indigo-900/50 rounded-xl overflow-hidden shadow-inner">
                <div className="bg-slate-950 px-3.5 py-2 border-b border-indigo-900/50 flex items-center justify-between text-xs font-bold text-indigo-200">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                    <span>الكود المنظف والمصحح ترويسته (جاهز للتجميع المباشر)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {cleaningResult.cleanedCode.split("\n").length} سطر
                  </span>
                </div>
                <textarea
                  readOnly
                  value={cleaningResult.cleanedCode}
                  dir="ltr"
                  className="flex-1 w-full bg-slate-950/60 text-emerald-200/90 font-mono text-xs p-3.5 resize-none focus:outline-none selection:bg-indigo-700 selection:text-white leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {activeTab === "PREAMBLE" && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <h4 className="text-sm font-black text-slate-100 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>ترتيب حزم الترويسة حسب الأسبقية الطباعية الصارمة (TeX Packages Hierarchy)</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  تعتمد برمجية LaTeX نظام أسبقية حساس جداً في تحميل الحزم. يؤدي تحميل حزمة مثل{" "}
                  <code className="text-amber-300 font-mono">amsthm</code> قبل{" "}
                  <code className="text-amber-300 font-mono">amsmath</code> إلى خطأ مميت، كما يتطلب{" "}
                  <code className="text-amber-300 font-mono">hyperref</code> أن يكون في نهاية
                  الترويسة تقريباً، بينما تتطلب حزم مثل{" "}
                  <code className="text-amber-300 font-mono">cleveref</code> التحميل بعده مباشرة.
                </p>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
                  {cleaningResult.preambleReport.cleanedPreamblePackages.map((pkg, idx) => {
                    const info = PACKAGE_TIER_PRIORITY[pkg.name.toLowerCase()];
                    return (
                      <div
                        key={idx}
                        className="px-4 py-2.5 flex items-center justify-between text-xs font-mono hover:bg-slate-900/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-[10px] w-6">{idx + 1}.</span>
                          <span className="font-bold text-indigo-300">
                            \usepackage
                            {pkg.options.length > 0 && `[${pkg.options.join(",")}]`}
                            {`{${pkg.name}}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-sans">
                          {info ? (
                            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded-md text-[10px] font-medium">
                              المستوى {info.tier}: {info.labelAr}
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md text-[10px]">
                              حزمة عامة
                            </span>
                          )}
                          {pkg.name === "hyperref" && (
                            <span className="bg-amber-950 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              موقع متأخر إلزامي
                            </span>
                          )}
                          {pkg.name === "cleveref" && (
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              بعد hyperref حصراً
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "SYMBOLS" && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black text-slate-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>جدول الرموز الرياضية والأوامر المحدثة</span>
                  </h4>
                  <span className="text-xs text-amber-300 font-bold bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-lg">
                    تم رصد وتحويل {cleaningResult.symbolReport.totalConversionsCount} عنصراً
                  </span>
                </div>

                {cleaningResult.symbolReport.sampleConversions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    لم يتم العثور على رموز غير قياسية أو أوامر قديمة بحاجة للتحويل في هذا الملف.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {cleaningResult.symbolReport.sampleConversions.map((conv, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            {conv.categoryAr}
                          </span>
                          <span className="font-mono text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
                            {conv.original}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                            {conv.converted}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ×{conv.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "AUDIT" && (
            <div className="space-y-3">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
                <h4 className="text-sm font-black text-slate-100 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>سجل التدقيق والتصحيحات الآلية المطبقة</span>
                </h4>

                <div className="space-y-2">
                  {cleaningResult.auditLog.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                        log.severity === "SUCCESS"
                          ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
                          : log.severity === "WARNING"
                          ? "bg-amber-950/20 border-amber-800/40 text-amber-200"
                          : "bg-slate-950/40 border-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="mt-0.5">
                        {log.severity === "SUCCESS" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : log.severity === "WARNING" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold mb-0.5 text-slate-100">{log.titleAr}</div>
                        <div className="text-[11px] opacity-80 leading-relaxed font-sans">
                          {log.descriptionAr}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "RAW_OUTPUT" && (
            <div className="h-full min-h-[440px] flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">
                  الكود الكامل بعد التنظيف وهندسة الترويسة
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {cleaningResult.cleanedCode.length} حرف
                </span>
              </div>
              <textarea
                readOnly
                value={cleaningResult.cleanedCode}
                dir="ltr"
                className="flex-1 w-full bg-slate-950/80 text-emerald-200/90 font-mono text-xs p-4 resize-none focus:outline-none selection:bg-indigo-700 selection:text-white leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* الشريط السفلي للإجراءات والحفظ */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>
              تم الفحص والتصحيح طبقا لأحدث مواصفات محركات TeX Live و MikTeX الحديثة.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCleaned}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedCleaned ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>نسخ الكود المنظف</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadCleaned}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>تنزيل (.tex)</span>
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={appliedStatus}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {appliedStatus ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم التطبيق في المحرر!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>تطبيق على محرر الكود المصدري</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
