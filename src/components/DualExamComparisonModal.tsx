import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Columns,
  Diff,
  Download,
  Eye,
  FileCheck2,
  Layers,
  Percent,
  Scale,
  Sparkles,
  Split,
  X,
} from "lucide-react";
import { LessonItem, CURRICULUM_DB, getVariantQuestions } from "../data/curriculum";
import { MathText } from "./MathRenderer";

export interface DualExamComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrackCode?: string;
  currentTrackLabel?: string;
  currentTrack?: any;
  currentSemester?: "S1" | "S2";
  defaultSemester?: "S1" | "S2";
  currentDsKey?: string;
  defaultDsKey?: string;
  currentLessons?: LessonItem[];
  isFr?: boolean;
  onApplyExamConfiguration?: (lessons: LessonItem[], dsKey: string) => void;
  onNotify?: (type: "success" | "error" | "info", msg: string) => void;
}

export const DualExamComparisonModal: React.FC<DualExamComparisonModalProps> = ({
  isOpen,
  onClose,
  currentTrackCode,
  currentTrackLabel,
  currentTrack,
  currentSemester,
  defaultSemester,
  currentDsKey,
  defaultDsKey,
  currentLessons,
  isFr = false,
  onApplyExamConfiguration,
  onNotify,
}) => {
  const resolvedTrackCode = currentTrackCode || currentTrack?.code || "2BAC_PC";
  const resolvedTrackLabel = currentTrackLabel || currentTrack?.labelAr || "الثانية باكلوريا";
  const resolvedSemester = currentSemester || defaultSemester || "S1";
  const resolvedDsKey = currentDsKey || defaultDsKey || "DS1";

  // الفرض الأول (النافذة اليمنى): الفرض الحالي قيد التحرير أو فرض مختار
  const [examKeyA, setExamKeyA] = useState<string>(resolvedDsKey);
  const [modelA, setModelA] = useState<"A" | "B">("A");

  // الفرض الثاني (النافذة اليسرى): فرض للمقارنة (مثلاً الفرض الموالي أو فرض مسلك موازي)
  const [targetTrackCodeB, setTargetTrackCodeB] = useState<string>(resolvedTrackCode);
  const [semesterB, setSemesterB] = useState<"S1" | "S2">(resolvedSemester);
  const [examKeyB, setExamKeyB] = useState<string>(
    resolvedDsKey === "DS1" ? "DS2" : resolvedDsKey === "DS2" ? "DS3" : "DS1"
  );
  const [modelB, setModelB] = useState<"A" | "B">("A");

  // التبويب الفرعي للمقارنة
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<
    "SIDE_BY_SIDE" | "POINTS_TAXONOMY" | "PROGRESSION_CURVE"
  >("SIDE_BY_SIDE");

  // تجهيز دروس الفرض أ
  const lessonsA: LessonItem[] = useMemo(() => {
    if (examKeyA === resolvedDsKey && currentLessons && currentLessons.length > 0) {
      return currentLessons;
    }
    const trackObj = CURRICULUM_DB[resolvedTrackCode];
    return trackObj?.semesters?.[resolvedSemester]?.[examKeyA] || currentLessons || [];
  }, [examKeyA, resolvedDsKey, currentLessons, resolvedTrackCode, resolvedSemester]);

  // تجهيز دروس الفرض ب
  const lessonsB: LessonItem[] = useMemo(() => {
    const trackObj = CURRICULUM_DB[targetTrackCodeB];
    return trackObj?.semesters?.[semesterB]?.[examKeyB] || [];
  }, [targetTrackCodeB, semesterB, examKeyB]);

  // إحصائيات الفرض أ
  const statsA = useMemo(() => {
    const totalWeight = lessonsA.reduce((sum, l) => sum + (l.weight || 5), 0) || 1;
    let totalQuestions = 0;
    const exItems = lessonsA.map((l, idx) => {
      const v = getVariantQuestions(l, modelA, false, idx);
      const q = isFr ? v.questionsFr : v.questionsAr;
      totalQuestions += q.length;
      const pts = Number((((l.weight || 5) / totalWeight) * 20).toFixed(1));
      return {
        lesson: l,
        points: pts,
        questions: q,
      };
    });
    return {
      totalPoints: 20,
      totalExercises: lessonsA.length,
      totalQuestions,
      exercises: exItems,
      n1Est: Math.round(lessonsA.reduce((sum, l) => sum + (l.weight >= 8 ? 0.3 : 0.45) * l.weight, 0)),
      n2Est: Math.round(lessonsA.reduce((sum, l) => sum + (l.weight >= 8 ? 0.4 : 0.35) * l.weight, 0)),
      n3Est: Math.round(lessonsA.reduce((sum, l) => sum + (l.weight >= 8 ? 0.3 : 0.20) * l.weight, 0)),
    };
  }, [lessonsA, modelA, isFr]);

  // إحصائيات الفرض ب
  const statsB = useMemo(() => {
    const totalWeight = lessonsB.reduce((sum, l) => sum + (l.weight || 5), 0) || 1;
    let totalQuestions = 0;
    const exItems = lessonsB.map((l, idx) => {
      const v = getVariantQuestions(l, modelB, false, idx);
      const q = isFr ? v.questionsFr : v.questionsAr;
      totalQuestions += q.length;
      const pts = Number((((l.weight || 5) / totalWeight) * 20).toFixed(1));
      return {
        lesson: l,
        points: pts,
        questions: q,
      };
    });
    return {
      totalPoints: 20,
      totalExercises: lessonsB.length,
      totalQuestions,
      exercises: exItems,
      n1Est: Math.round(lessonsB.reduce((sum, l) => sum + (l.weight >= 8 ? 0.3 : 0.45) * l.weight, 0)),
      n2Est: Math.round(lessonsB.reduce((sum, l) => sum + (l.weight >= 8 ? 0.4 : 0.35) * l.weight, 0)),
      n3Est: Math.round(lessonsB.reduce((sum, l) => sum + (l.weight >= 8 ? 0.3 : 0.20) * l.weight, 0)),
    };
  }, [lessonsB, modelB, isFr]);

  // مقارنة التدرج البيداغوجي ومعدل التقارب
  const comparisonReport = useMemo(() => {
    const qDiff = Math.abs(statsA.totalQuestions - statsB.totalQuestions);
    const exDiff = Math.abs(statsA.totalExercises - statsB.totalExercises);
    const parityScore = Math.max(50, 100 - qDiff * 7 - exDiff * 10);
    return {
      parityScore,
      qDiff,
      exDiff,
      assessmentAr:
        parityScore >= 85
          ? "تطابق وتناغم ديداكتيكي متقدم في الحجم وتدرج الصعوبة"
          : parityScore >= 70
          ? "تدرج بيداغوجي متوازن مع تباين طفيف في كثافة الأسئلة"
          : "تباين ملحوظ في كثافة الأسئلة أو عدد التمارين يحتاج إلى موازنة",
    };
  }, [statsA, statsB]);

  if (!isOpen) return null;

  return (
    <div
      dir={isFr ? "ltr" : "rtl"}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border-2 border-cyan-400/80 shadow-2xl w-full max-w-7xl max-h-[94vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0 border-b border-cyan-500/40 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-black shadow-inner shrink-0">
              <Split className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">
                  وضع المقارنة الذكية للفروض (Smart Dual-Exam Comparison Studio)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-mono text-[11px] font-black">
                  مؤشر التكافؤ: {comparisonReport.parityScore}%
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                فتح فرضين متجاورين لمقارنة التدرج البيداغوجي، كثافة الأسئلة، وتوزيع سلم التنقيط (20/20) عبر شاشتين متزامنتين.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Comparison Summary Strip */}
        <div className="bg-slate-900 text-white p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-black">
              التشخيص الديداكتيكي:
            </span>
            <span className="text-slate-200 font-bold">{comparisonReport.assessmentAr}</span>
          </div>

          {/* Analysis View Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-xl border border-slate-700 text-[11px] font-black">
            <button
              type="button"
              onClick={() => setActiveAnalysisTab("SIDE_BY_SIDE")}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeAnalysisTab === "SIDE_BY_SIDE"
                  ? "bg-cyan-400 text-slate-950 shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>النافذتان المتجاورتان (Side-by-Side)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveAnalysisTab("POINTS_TAXONOMY")}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeAnalysisTab === "POINTS_TAXONOMY"
                  ? "bg-cyan-400 text-slate-950 shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>مقارنة سلم التنقيط والمهارات</span>
            </button>
          </div>
        </div>

        {/* Dual Panels Area */}
        <div className="flex-1 overflow-y-auto studio-scroll p-4 sm:p-5">
          {activeAnalysisTab === "SIDE_BY_SIDE" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {/* النافذة الأولى: الفرض (A) */}
              <div className="bg-slate-50/90 rounded-2xl border-2 border-indigo-300 shadow-sm p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-950 text-amber-300 text-xs font-black flex items-center justify-center font-mono">
                        A
                      </span>
                      <h3 className="text-sm font-black text-indigo-950">
                        الفرض (A) : {resolvedTrackLabel}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {resolvedSemester} · {examKeyA} · {statsA.totalExercises} تمارين ({statsA.totalQuestions} سؤالاً)
                    </p>
                  </div>

                  {/* Exam A Selectors */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300 text-xs font-black">
                    {["DS1", "DS2", "DS3"].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setExamKeyA(k)}
                        className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                          examKeyA === k
                            ? "bg-indigo-950 text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                    <div className="h-4 w-px bg-slate-300 mx-0.5" />
                    <button
                      type="button"
                      onClick={() => setModelA((m) => (m === "A" ? "B" : "A"))}
                      className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-950 hover:bg-indigo-200 transition cursor-pointer"
                    >
                      نموذج {modelA}
                    </button>
                  </div>
                </div>

                {/* Exercises of Exam A */}
                <div className="space-y-3">
                  {statsA.exercises.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-slate-200/90 p-3.5 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                        <span className="text-xs font-black text-slate-900">
                          تمرين {idx + 1} : {isFr ? item.lesson.lessonFr : item.lesson.lessonAr}
                        </span>
                        <span className="font-mono text-xs font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {item.points} pts
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-700 font-medium leading-relaxed">
                        {item.questions.map((q, qIdx) => (
                          <div key={qIdx} className="flex items-start gap-1.5">
                            <span className="font-mono text-[11px] text-slate-400 font-bold shrink-0">
                              {qIdx + 1})
                            </span>
                            <div className="flex-1">
                              <MathText text={q} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* النافذة الثانية: الفرض (B) */}
              <div className="bg-slate-50/90 rounded-2xl border-2 border-teal-300 shadow-sm p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-200 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-teal-900 text-cyan-300 text-xs font-black flex items-center justify-center font-mono">
                        B
                      </span>
                      <h3 className="text-sm font-black text-teal-950">
                        الفرض (B) المقارن : {CURRICULUM_DB[targetTrackCodeB]?.labelAr || targetTrackCodeB}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {semesterB} · {examKeyB} · {statsB.totalExercises} تمارين ({statsB.totalQuestions} سؤالاً)
                    </p>
                  </div>

                  {/* Exam B Selectors */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300 text-xs font-black">
                    <select
                      value={targetTrackCodeB}
                      onChange={(e) => setTargetTrackCodeB(e.target.value)}
                      className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold"
                    >
                      {Object.entries(CURRICULUM_DB).map(([code, tData]) => (
                        <option key={code} value={code}>
                          {tData.labelAr.slice(0, 24)}...
                        </option>
                      ))}
                    </select>
                    {["DS1", "DS2", "DS3"].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setExamKeyB(k)}
                        className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
                          examKeyB === k
                            ? "bg-teal-900 text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setModelB((m) => (m === "A" ? "B" : "A"))}
                      className="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-950 hover:bg-teal-200 transition cursor-pointer"
                    >
                      نموذج {modelB}
                    </button>
                  </div>
                </div>

                {/* Exercises of Exam B */}
                <div className="space-y-3">
                  {statsB.exercises.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500 font-bold">
                      لا توجد تمارين مسجلة لهذا الفرض في المقرر.
                    </div>
                  ) : (
                    statsB.exercises.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-slate-200/90 p-3.5 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-black text-slate-900">
                            تمرين {idx + 1} : {isFr ? item.lesson.lessonFr : item.lesson.lessonAr}
                          </span>
                          <span className="font-mono text-xs font-black text-teal-900 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            {item.points} pts
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-700 font-medium leading-relaxed">
                          {item.questions.map((q, qIdx) => (
                            <div key={qIdx} className="flex items-start gap-1.5">
                              <span className="font-mono text-[11px] text-slate-400 font-bold shrink-0">
                                {qIdx + 1})
                              </span>
                              <div className="flex-1">
                                <MathText text={q} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Points & Taxonomy Distribution Comparison Table */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-700" />
                  <h3 className="text-sm font-black text-slate-950">
                    مقارنة توزيع النقط والمستويات المهارية (N1 · N2 · N3) طبقاً للمذكرة 142-08
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  المجموع المعياري: 20.00 / 20.00 ن
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Metric Card A */}
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                  <h4 className="text-xs font-black text-indigo-950">
                    الفرض (A) — {resolvedTrackCode} ({examKeyA})
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                    <div className="p-2 rounded-lg bg-white border border-indigo-100">
                      <div className="text-[10px] text-slate-500 font-medium">تطبيق مباشر (N1)</div>
                      <div className="font-mono font-black text-indigo-900 text-sm mt-0.5">
                        {statsA.n1Est}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-indigo-100">
                      <div className="text-[10px] text-slate-500 font-medium">استدلال وتطبيق (N2)</div>
                      <div className="font-mono font-black text-indigo-900 text-sm mt-0.5">
                        {statsA.n2Est}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-indigo-100">
                      <div className="text-[10px] text-slate-500 font-medium">حل مسائل (N3)</div>
                      <div className="font-mono font-black text-indigo-900 text-sm mt-0.5">
                        {statsA.n3Est}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metric Card B */}
                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3">
                  <h4 className="text-xs font-black text-teal-950">
                    الفرض (B) — {targetTrackCodeB} ({examKeyB})
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                    <div className="p-2 rounded-lg bg-white border border-teal-100">
                      <div className="text-[10px] text-slate-500 font-medium">تطبيق مباشر (N1)</div>
                      <div className="font-mono font-black text-teal-900 text-sm mt-0.5">
                        {statsB.n1Est}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-teal-100">
                      <div className="text-[10px] text-slate-500 font-medium">استدلال وتطبيق (N2)</div>
                      <div className="font-mono font-black text-teal-900 text-sm mt-0.5">
                        {statsB.n2Est}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-teal-100">
                      <div className="text-[10px] text-slate-500 font-medium">حل مسائل (N3)</div>
                      <div className="font-mono font-black text-teal-900 text-sm mt-0.5">
                        {statsB.n3Est}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              تساعد المقارنة المتجاورة على ضبط التدرج البيداغوجي وتوحيد الصعوبة بين الأفواج المتوازية والفروض المحروسة.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onApplyExamConfiguration && (
              <button
                type="button"
                onClick={() => {
                  onApplyExamConfiguration(lessonsB, examKeyB);
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-black transition cursor-pointer"
              >
                اعتماد وتطبيق الفرض (B) في مساحة العمل
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
