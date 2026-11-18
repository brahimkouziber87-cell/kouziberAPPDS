import React, { useState, useEffect } from "react";
import {
  X,
  Tv2,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { LessonItem, getVariantQuestions } from "../data/curriculum";
import MathRenderer from "./MathRenderer";
import { generateExerciseCorrection } from "../utils/correctionGenerator";

export interface ClassroomProjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: LessonItem[];
  examTitle?: string;
  isFr?: boolean;
  examModel?: "A" | "B";
}

export const ClassroomProjectionModal: React.FC<ClassroomProjectionModalProps> = ({
  isOpen,
  onClose,
  lessons = [],
  examTitle = "الفرض المحروس في مادة الرياضيات",
  isFr = false,
  examModel = "A",
}) => {
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [revealStage, setRevealStage] = useState<0 | 1 | 2 | 3>(0);
  // 0: Statement only, 1: Statement + Key Idea & Hint, 2: Full Solution, 3: Full Solution + Rubric
  const [boardTheme, setBoardTheme] = useState<"DARK_BOARD" | "LIGHT_CANVAS">("DARK_BOARD");
  const [fontScale, setFontScale] = useState<number>(1.25);

  // Classroom timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  if (!isOpen) return null;

  const currentLesson = lessons[activeExerciseIdx] || lessons[0];
  const correction = currentLesson
    ? generateExerciseCorrection(currentLesson, activeExerciseIdx, examModel)
    : null;

  const variantQs = currentLesson
    ? getVariantQuestions(currentLesson, examModel, false)
    : null;
  const questionsList: string[] = variantQs
    ? isFr
      ? variantQs.questionsFr
      : variantQs.questionsAr
    : [];

  const handleNextEx = () => {
    if (activeExerciseIdx < lessons.length - 1) {
      setActiveExerciseIdx((prev) => prev + 1);
      setRevealStage(0);
    }
  };

  const handlePrevEx = () => {
    if (activeExerciseIdx > 0) {
      setActiveExerciseIdx((prev) => prev - 1);
      setRevealStage(0);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isDark = boardTheme === "DARK_BOARD";

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"
      } select-none`}
      dir={isFr ? "ltr" : "rtl"}
    >
      {/* شريط أدوات السبورة التفاعلية العلوي */}
      <div
        className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isDark
            ? "bg-slate-900/90 border-slate-800"
            : "bg-slate-100/90 border-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md">
            <Tv2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black">
                {isFr
                  ? "Mode Vidéoprojecteur & Tableau Interactif (TBI)"
                  : "وضع العرض بالمسلاط والسبورة التفاعلية (Data Show & TBI)"}
              </h3>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {isFr ? `Sujet ${examModel}` : `النموذج ${examModel}`}
              </span>
            </div>
            <p className="text-[11px] opacity-70">
              {isFr
                ? "Affichage haute lisibilité pour la classe avec révélation progressive et chronomètre"
                : "خط عريض فائق الوضوح للصفوف الخلفية مع كشف تدريجي لعناصر الإجابة ومؤقت حصة"}
            </p>
          </div>
        </div>

        {/* مؤقت القسم التفاعلي (Chronomètre de classe) */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-300"
          }`}
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-base font-black text-cyan-400 tracking-wider">
            {formatTimer(timerSeconds)}
          </span>
          <div className="flex items-center gap-1 border-s ps-2 ms-1 border-slate-700">
            <button
              type="button"
              onClick={() => setTimerRunning((v) => !v)}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title={timerRunning ? "إيقاف مؤقت" : "بدء العد التنازلي"}
            >
              {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(300);
              }}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              title="إعادة ضبط 5 دقائق"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {( [60, 180, 300, 600] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(s);
                }}
                className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${
                  timerSeconds === s ? "bg-cyan-600 text-white" : "hover:bg-slate-800 opacity-60"
                }`}
              >
                {s / 60}m
              </button>
            ))}
          </div>
        </div>

        {/* أزرار التحكم في التكبير ونمط السبورة والإغلاق */}
        <div className="flex items-center gap-2">
          {/* تبديل السبورة */}
          <button
            type="button"
            onClick={() =>
              setBoardTheme((prev) =>
                prev === "DARK_BOARD" ? "LIGHT_CANVAS" : "DARK_BOARD"
              )
            }
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isDark
                ? "bg-slate-800 border-slate-700 text-amber-300"
                : "bg-slate-200 border-slate-300 text-slate-800"
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isDark
                ? isFr ? "Tableau Blanc" : "سبورة بيضاء"
                : isFr ? "Tableau Noir" : "سبورة سوداء"}
            </span>
          </button>

          {/* حجم الخط */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFontScale((v) => Math.max(1.0, v - 0.15))}
              className="p-1.5 text-slate-300 hover:text-white"
              title="تصغير الخط"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] px-1 text-cyan-300">
              {Math.round(fontScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setFontScale((v) => Math.min(1.8, v + 0.15))}
              className="p-1.5 text-slate-300 hover:text-white"
              title="تكبير الخط للقسم"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-rose-900 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* محتوى التمرين والحل بخط عملاق قابل للقراءة من آخر الصف */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 max-w-6xl mx-auto w-full">
        {/* عنوان التمرين المختار */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-black text-sm">
              {isFr
                ? `Exercice ${activeExerciseIdx + 1} / ${lessons.length}`
                : `التمرين ${activeExerciseIdx + 1} من ${lessons.length}`}
            </span>
            <h2 className="text-lg sm:text-xl font-black">
              {isFr ? currentLesson?.lessonFr : currentLesson?.lessonAr}
            </h2>
          </div>

          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg">
            {currentLesson?.weight || 4} {isFr ? "Points" : "نقط"}
          </span>
        </div>

        {/* عرض نص الأسئلة */}
        <div
          style={{ fontSize: `${fontScale}rem` }}
          className={`rounded-2xl p-6 sm:p-8 border leading-relaxed space-y-4 shadow-xl ${
            isDark
              ? "bg-slate-900/90 border-slate-800 text-slate-100"
              : "bg-slate-50 border-slate-300 text-slate-900"
          }`}
        >
          <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-2">
            {isFr ? "Énoncé de l'exercice :" : "نص أسئلة التمرين :"}
          </div>
          <ol className="list-decimal list-inside space-y-4 font-semibold">
            {questionsList.map((q: string, idx: number) => (
              <li key={idx} className="leading-loose">
                <span className="ms-1">
                  <MathRenderer text={q} />
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* خطوة الكشف 1: الفكرة والمفهوم المفتاحي (Indice & Méthode) */}
        {revealStage >= 1 && (
          <div
            style={{ fontSize: `${fontScale * 0.95}rem` }}
            className="rounded-2xl p-6 border-2 border-amber-500/50 bg-amber-950/20 text-amber-200 space-y-2 shadow-lg"
          >
            <div className="flex items-center gap-2 text-xs font-black text-amber-400">
              <Lightbulb className="w-4 h-4" />
              <span>
                {isFr ? "1. Idée Directrice & Méthode Clé :" : "1. الفكرة الموجهة والمبرهنة الواجب توظيفها :"}
              </span>
            </div>
            <p className="leading-relaxed">
              {isFr
                ? "Identifier le domaine de définition, mobiliser le théorème des valeurs intermédiaires ou la dérivation composée en justifiant les continuités préalables."
                : "تحديد مجال التعريف بدقة، توظيف مبرهنة القيم الوسيطية أو مشتقة مركب دالتين مع التأكيد على تعليل الاتصال المسبق على المجال."}
            </p>
          </div>
        )}

        {/* خطوة الكشف 2 & 3: الحل النموذجي المفصل وسلم التنقيط */}
        {revealStage >= 2 && correction && (
          <div
            style={{ fontSize: `${fontScale * 0.95}rem` }}
            className={`rounded-2xl p-6 sm:p-8 border-2 border-emerald-600/70 space-y-4 shadow-xl ${
              isDark ? "bg-emerald-950/20 text-emerald-100" : "bg-emerald-50 text-emerald-950"
            }`}
          >
            <div className="flex items-center justify-between border-b border-emerald-700/50 pb-2 text-xs font-black text-emerald-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {isFr ? "2. Corrigé Détaillé & Rédaction Mathématique Type :" : "2. عناصر الإجابة والتحرير الرياضي النموذجي :"}
                </span>
              </div>
              {revealStage >= 3 && (
                <span className="font-mono bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded text-[11px]">
                  Barème officiel : 20 / 20
                </span>
              )}
            </div>

            <div className="space-y-4 leading-loose">
              {correction.solutions.map((sol, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/40 pb-1.5 mb-2 text-xs font-bold text-emerald-400">
                    <span>
                      {isFr ? `Question ${sol.questionNumber}` : `السؤال ${sol.questionNumber}`}
                    </span>
                    {revealStage >= 3 && (
                      <span className="font-mono bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded text-[11px]">
                        [{sol.bareme}]
                      </span>
                    )}
                  </div>
                  <div className="leading-relaxed">
                    <MathRenderer text={isFr ? sol.solutionTextFr : sol.solutionTextAr} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* شريط التحكم السفلي في مراحل الكشف والتنقل بين التمارين */}
      <div
        className={`px-6 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isDark
            ? "bg-slate-900/90 border-slate-800"
            : "bg-slate-100/90 border-slate-300"
        }`}
      >
        {/* أزرار التنقل بين التمارين */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={activeExerciseIdx === 0}
            onClick={handlePrevEx}
            className="px-3 py-1.5 rounded-xl border border-slate-700 disabled:opacity-40 text-xs font-black flex items-center gap-1 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
            <span>{isFr ? "Précédent" : "التمرين السابق"}</span>
          </button>
          <span className="font-mono text-xs font-bold px-2">
            {activeExerciseIdx + 1} / {lessons.length}
          </span>
          <button
            type="button"
            disabled={activeExerciseIdx === lessons.length - 1}
            onClick={handleNextEx}
            className="px-3 py-1.5 rounded-xl border border-slate-700 disabled:opacity-40 text-xs font-black flex items-center gap-1 cursor-pointer"
          >
            <span>{isFr ? "Suivant" : "التمرين الموالي"}</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* أزرار الكشف التدريجي للحل (Révélation Progressive) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold opacity-70">
            {isFr ? "Affichage :" : "مرحلة الكشف :"}
          </span>

          <button
            type="button"
            onClick={() => setRevealStage(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              revealStage === 0
                ? "bg-cyan-600 text-white font-black"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {isFr ? "1. Énoncé Seul" : "1. نص الأسئلة فقط"}
          </button>

          <button
            type="button"
            onClick={() => setRevealStage(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              revealStage === 1
                ? "bg-amber-600 text-white font-black"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {isFr ? "2. Idée & Indice" : "2. فكرة الحل وتلميح"}
          </button>

          <button
            type="button"
            onClick={() => setRevealStage(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              revealStage === 2
                ? "bg-emerald-600 text-white font-black"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {isFr ? "3. Solution Détaillée" : "3. التصحيح الكامل"}
          </button>

          <button
            type="button"
            onClick={() => setRevealStage(3)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              revealStage === 3
                ? "bg-purple-600 text-white font-black"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {isFr ? "4. Avec Barème" : "4. مع سلم التنقيط"}
          </button>
        </div>
      </div>
    </div>
  );
};
