import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  FileCode2,
  History,
  Layers,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import { LessonItem } from "../data/curriculum";

export interface ExerciseDiagnosticMeta {
  index: number;
  lessonAr: string;
  lessonFr: string;
  weight: number;
  points: number;
  detectedDomain: string;
  templateVariantId: string;
  seedUsed: number;
  parametersUsed: string;
  questionCount: number;
  firstQuestionPreviewAr: string;
  firstQuestionPreviewFr: string;
  allQuestionsAr?: string[];
  allQuestionsFr?: string[];
}

export interface GenerationDiagnosticEntry {
  id: string;
  timestamp: string;
  generationSeed: number;
  examModel: string;
  exportFormat: string;
  activeModule: string;
  trackLabelAr: string;
  trackLabelFr: string;
  modelRequested: string;
  modelUsed: string;
  generationSource: "GEMINI_CLOUD" | "SERVER_SYMBOLIC_ENGINE" | "LOCAL_VARIANT_ENGINE";
  promptSent: string;
  exercisesMetadata: ExerciseDiagnosticMeta[];
}

interface AiGenerationDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosticsHistory: GenerationDiagnosticEntry[];
  currentLessons: LessonItem[];
  currentVariationSeed: number;
  isGeneratingAI: boolean;
  onTriggerNewSeedGeneration: () => void;
  onTriggerAiGenerationWithNewSeed: () => void;
}

export const AiGenerationDiagnosticsModal: React.FC<
  AiGenerationDiagnosticsModalProps
> = ({
  isOpen,
  onClose,
  diagnosticsHistory,
  currentLessons,
  currentVariationSeed,
  isGeneratingAI,
  onTriggerNewSeedGeneration,
  onTriggerAiGenerationWithNewSeed,
}) => {
  const [activeTab, setActiveTab] = useState<
    "EXERCISES_META" | "PROMPT_VIEW" | "HISTORY_DIFF"
  >("EXERCISES_META");
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number>(0);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeEntry: GenerationDiagnosticEntry | undefined =
    diagnosticsHistory[selectedHistoryIdx] || diagnosticsHistory[0];

  const handleCopyPrompt = () => {
    if (!activeEntry?.promptSent) return;
    navigator.clipboard.writeText(activeEntry.promptSent);
    setCopiedPrompt(true);
    window.setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleLogToConsole = () => {
    if (!activeEntry) return;
    console.group(
      `%c[AI & Document Generation Diagnostic Report] Seed #${activeEntry.generationSeed} (${activeEntry.timestamp})`,
      "color: #38bdf8; font-weight: bold; font-size: 13px;"
    );
    console.info("Engine Source:", activeEntry.generationSource);
    console.info("Model Used:", activeEntry.modelUsed);
    console.info("Track:", `${activeEntry.trackLabelAr} (${activeEntry.trackLabelFr})`);
    console.info("Generation Seed:", activeEntry.generationSeed);
    console.info("Prompt Sent to AI:\n", activeEntry.promptSent);
    console.table(
      activeEntry.exercisesMetadata.map((m) => ({
        Ex: m.index,
        Lesson: m.lessonAr,
        Domain: m.detectedDomain,
        VariantID: m.templateVariantId,
        Seed: m.seedUsed,
        Params: m.parametersUsed,
        Questions: m.questionCount,
        FirstQuestion: m.firstQuestionPreviewAr.slice(0, 90),
      }))
    );
    console.groupEnd();
  };

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-l from-slate-950 via-indigo-950 to-slate-950 px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  مرصد تشخيص توليد الوثائق والذكاء الاصطناعي (AI & Exercise Randomization Diagnostics)
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Seed #{activeEntry?.generationSeed ?? currentVariationSeed}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                معاينة حية للأمر المرسل (Prompt Sent to AI)، بذرة العشوائية الزمنية (Timestamp/Random Seed)، والبيانات الوصفية للتمارين المولدة لضمان عدم تكرار التمرين الأول.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onTriggerNewSeedGeneration}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تدوير البذرة فوراً (Seed جديد)</span>
            </button>

            <button
              type="button"
              onClick={onTriggerAiGenerationWithNewSeed}
              disabled={isGeneratingAI}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isGeneratingAI
                  ? "جاري التوليد..."
                  : "توليد ذكي (AI) ببذرة جديدة"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleLogToConsole}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="طباعة التقرير الكامل في Console المتصفح (F12)"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>إرسال إلى Console</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Status Strip */}
        {activeEntry && (
          <div className="bg-slate-950/90 px-5 py-2.5 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
              <div className="text-[10px] text-slate-400">بذرة التوليد (Seed)</div>
              <div className="font-mono font-black text-cyan-300 text-sm">
                #{activeEntry.generationSeed}
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
              <div className="text-[10px] text-slate-400">محرك التوليد الفعلي</div>
              <div className="font-bold text-amber-300 truncate">
                {activeEntry.generationSource === "GEMINI_CLOUD"
                  ? "سحابة Gemini AI"
                  : activeEntry.generationSource === "SERVER_SYMBOLIC_ENGINE"
                  ? "المحرك الرمزي للخادم (Seeded)"
                  : "محرك القوالب المتجددة (Local Seed)"}
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
              <div className="text-[10px] text-slate-400">الشعبة والمسلك</div>
              <div className="font-bold text-white truncate">
                {activeEntry.trackLabelAr}
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
              <div className="text-[10px] text-slate-400">عدد التمارين المفحوصة</div>
              <div className="font-mono font-bold text-emerald-300">
                {activeEntry.exercisesMetadata.length} تمارين ({currentLessons.length} دروس)
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
              <div className="text-[10px] text-slate-400">توقيت التوليد (ISO)</div>
              <div className="font-mono text-[11px] text-slate-200 truncate" dir="ltr">
                {new Date(activeEntry.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("EXERCISES_META")}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-black flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                activeTab === "EXERCISES_META"
                  ? "border-cyan-400 text-cyan-300 bg-slate-800/80"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. البيانات الوصفية للتمارين المولدة ({activeEntry?.exercisesMetadata.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PROMPT_VIEW")}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-black flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                activeTab === "PROMPT_VIEW"
                  ? "border-amber-400 text-amber-300 bg-slate-800/80"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>2. الأمر النصي المرسل للذكاء الاصطناعي (Prompt Sent to AI)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("HISTORY_DIFF")}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-black flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                activeTab === "HISTORY_DIFF"
                  ? "border-emerald-400 text-emerald-300 bg-slate-800/80"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <History className="w-4 h-4" />
              <span>3. سجل مقارنة التوليدات المتتالية ({diagnosticsHistory.length})</span>
            </button>
          </div>

          {diagnosticsHistory.length > 1 && (
            <div className="flex items-center gap-2 pb-2">
              <span className="text-[11px] text-slate-400">معاينة التوليد:</span>
              <select
                value={selectedHistoryIdx}
                onChange={(e) => setSelectedHistoryIdx(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-200 font-mono"
              >
                {diagnosticsHistory.map((item, idx) => (
                  <option key={item.id} value={idx}>
                    #{idx + 1} — Seed #{item.generationSeed} ({new Date(item.timestamp).toLocaleTimeString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!activeEntry ? (
            <div className="p-8 text-center text-slate-400">
              لا توجد بيانات تشخيصية مسجلة بعد. اضغط على «توليد ذكي (AI) ببذرة جديدة» أو «تدوير البذرة فوراً».
            </div>
          ) : activeTab === "EXERCISES_META" ? (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-black text-emerald-300">
                    نتيجة الفحص البيداغوجي لمنع تكرار التمرين الأول (Anti-Static Exercise Audit):
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    كل تمرين أدناه يرتبط مباشرة بعنوان الدرس المختار في المقرر الدراسي، مع حقن بذرة توليد متغيرة{" "}
                    <code className="text-cyan-300 font-mono">
                      generationSeed = #{activeEntry.generationSeed}
                    </code>{" "}
                    تغير الدوال والمعاملات العددية <code className="text-amber-300 font-mono">(k, a, variant)</code> وتمنع ظهور تمرين الدالة اللوغاريتمية <code className="text-rose-300 font-mono">ln(x)</code> في غير موضعه.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {activeEntry.exercisesMetadata.map((ex) => {
                  const isLogLesson = /لوغاريتم|logarithm/i.test(
                    `${ex.lessonAr} ${ex.lessonFr}`
                  );
                  const hasLogInPreview = /\\ln|ln\(/i.test(
                    `${ex.firstQuestionPreviewAr} ${ex.firstQuestionPreviewFr}`
                  );
                  const domainClean = !hasLogInPreview || isLogLesson;

                  return (
                    <div
                      key={ex.index}
                      className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 font-black text-xs">
                            التمرين {ex.index}
                          </span>
                          <div>
                            <h3 className="font-black text-sm text-white">
                              {ex.lessonAr}
                            </h3>
                            <p className="text-[11px] text-slate-400" dir="ltr">
                              {ex.lessonFr}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                            Domain: {ex.detectedDomain}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/50">
                            Variant: {ex.templateVariantId}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                            {ex.parametersUsed}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                            {ex.weight}% ({ex.points} ن)
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1.5">
                          <div className="text-[11px] font-bold text-cyan-300 flex items-center justify-between">
                            <span>معاينة السؤال الأول (العربية):</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              إجمالي الأسئلة: {ex.questionCount}
                            </span>
                          </div>
                          <p className="text-slate-200 leading-relaxed font-mono text-[11.5px]">
                            {ex.firstQuestionPreviewAr}
                          </p>
                        </div>

                        <div
                          className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1.5"
                          dir="ltr"
                        >
                          <div className="text-[11px] font-bold text-indigo-300 flex items-center justify-between">
                            <span>Aperçu de la 1ère question (FR) :</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              Seed: #{ex.seedUsed}
                            </span>
                          </div>
                          <p className="text-slate-200 leading-relaxed font-mono text-[11.5px]">
                            {ex.firstQuestionPreviewFr}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span
                          className={`inline-flex items-center gap-1.5 font-bold ${
                            domainClean ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {domainClean
                            ? "✓ تطابق بيداغوجي سليم 100% مع الدرس المختار (لا يوجد تكرار نمطي)"
                            : "⚠ تنبيه: تم رصد دالة لوغاريتمية في درس غير لوغاريتمي"}
                        </span>
                        <span className="text-slate-400 font-mono">
                          Template ID: {ex.templateVariantId}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === "PROMPT_VIEW" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>
                    الأمر النصي الكامل المرسل إلى محرك الذكاء الاصطناعي (شاملاً بذرة العشوائية الزمنية #{activeEntry.generationSeed})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedPrompt ? "✓ تم نسخ الـ Prompt" : "نسخ الـ Prompt"}</span>
                </button>
              </div>

              <pre
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[56vh]"
                dir="rtl"
              >
                {activeEntry.promptSent}
              </pre>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300">
                يوضح الجدول التالي سجل عمليات التوليد المتتالية وكيف تتغير البذرة الرقمية{" "}
                <code className="text-cyan-300 font-mono">generationSeed</code> ومعرف القالب الرياضي{" "}
                <code className="text-amber-300 font-mono">templateVariantId</code> ونص التمرين الأول في كل مرة:
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">التوقيت</th>
                      <th className="p-2.5">البذرة (Seed)</th>
                      <th className="p-2.5">المصدر</th>
                      <th className="p-2.5">الدرس الأول</th>
                      <th className="p-2.5">المجال والقالب (Ex 1)</th>
                      <th className="p-2.5">مقتطف التمرين الأول المولد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnosticsHistory.map((item, idx) => {
                      const ex1 = item.exercisesMetadata[0];
                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            setSelectedHistoryIdx(idx);
                            setActiveTab("EXERCISES_META");
                          }}
                          className={`border-b border-slate-800/70 hover:bg-slate-800/50 cursor-pointer transition ${
                            idx === selectedHistoryIdx ? "bg-indigo-950/40" : ""
                          }`}
                        >
                          <td className="p-2.5 font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="p-2.5 font-mono text-slate-300" dir="ltr">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="p-2.5 font-mono font-black text-cyan-300">
                            #{item.generationSeed}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10.5px]">
                              {item.generationSource}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-white">
                            {ex1?.lessonAr || "—"}
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-emerald-300">
                            {ex1?.templateVariantId || "—"}
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-300 max-w-md truncate">
                            {ex1?.firstQuestionPreviewAr || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
