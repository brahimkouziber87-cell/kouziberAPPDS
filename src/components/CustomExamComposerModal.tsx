import React, { useState } from "react";
import {
  X,
  Layers,
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Scale,
} from "lucide-react";
import { LessonItem, TrackData } from "../data/curriculum";

export interface CustomExamComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: TrackData;
  availableLessons: LessonItem[];
  currentLessons: LessonItem[];
  onApplyComposedLessons: (newLessons: LessonItem[]) => void;
  isFr?: boolean;
}

export const CustomExamComposerModal: React.FC<CustomExamComposerModalProps> = ({
  isOpen,
  onClose,
  track,
  availableLessons = [],
  currentLessons = [],
  onApplyComposedLessons,
  isFr = false,
}) => {
  const [selectedList, setSelectedList] = useState<LessonItem[]>(() =>
    currentLessons.length > 0 ? [...currentLessons] : [...availableLessons.slice(0, 3)]
  );

  if (!isOpen) return null;

  const totalRawWeight = selectedList.reduce((acc, curr) => acc + (curr.weight || 25), 0);

  const handleAddLesson = (lesson: LessonItem) => {
    setSelectedList((prev) => [...prev, { ...lesson, weight: 20 }]);
  };

  const handleRemoveLesson = (idx: number) => {
    if (selectedList.length <= 1) return;
    setSelectedList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveUp = (idx: number) => {
    if (idx <= 0) return;
    setSelectedList((prev) => {
      const copy = [...prev];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  };

  const handleMoveDown = (idx: number) => {
    if (idx >= selectedList.length - 1) return;
    setSelectedList((prev) => {
      const copy = [...prev];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  };

  const handleWeightChange = (idx: number, newWeight: number) => {
    const clamped = Math.max(5, Math.min(60, Number(newWeight) || 10));
    setSelectedList((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], weight: clamped };
      return copy;
    });
  };

  const handleAutoNormalizeWeights = () => {
    if (selectedList.length === 0) return;
    const baseEqual = Math.floor(100 / selectedList.length);
    const remainder = 100 - baseEqual * selectedList.length;

    setSelectedList((prev) =>
      prev.map((item, idx) => ({
        ...item,
        weight: idx === 0 ? baseEqual + remainder : baseEqual,
      }))
    );
  };

  const handleSaveAndApply = () => {
    onApplyComposedLessons(selectedList);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
      dir={isFr ? "ltr" : "rtl"}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* شريط العنوان التفاعلي */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-5 py-3.5 border-b border-indigo-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">
                  {isFr
                    ? "Compositeur d'Épreuves & Synthèse Hybride sur Mesure"
                    : "مُركِّب الفروض والمسائل التوليفية الهجينة المخصصة"}
                </h3>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {selectedList.length} {isFr ? "Exercices" : "تمارين مركبة"}
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                {isFr
                  ? "Combinez des chapitres de différents semestres, réordonnez et équilibrez le barème à 20/20"
                  : "اجمع وحدات من دورات مختلفة، رتب التمارين، واضبط سلم التنقيط تلقائياً إلى 20/20 نقطة"}
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

        {/* جسم النافذة المقسم لعمودين: بنك الدروس المتوفرة + قائمة الفرض المركب */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/50 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* العمود 1: الدروس المتاحة في المقرر للاختيار السريع */}
          <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isFr ? "Chapitres Disponibles" : "بنك الدروس المتاحة"}</span>
              </span>
              <span className="text-[10.5px] font-mono text-slate-400">
                {availableLessons.length} {isFr ? "unités" : "درساً"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[50vh]">
              {availableLessons.map((lesson, idx) => {
                const isAlreadySelected = selectedList.some((s) => s.lessonFr === lesson.lessonFr);
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-slate-700 flex items-center justify-between gap-2 transition"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {isFr ? lesson.lessonFr : lesson.lessonAr}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {lesson.hours} · {lesson.sampleExerciseAr?.length || 3} {isFr ? "questions" : "أسئلة"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddLesson(lesson)}
                      className="px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-bold border border-indigo-500/40 transition shrink-0 cursor-pointer"
                    >
                      + {isFr ? "Ajouter" : "إضافة"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* العمود 2: بنية الفرض المخصص قيد التركيب */}
          <div className="md:col-span-7 bg-slate-900 border border-indigo-500/40 rounded-xl p-3.5 space-y-3 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">
                  {isFr ? "Structure de l'Épreuve Personnalisée" : "هندسة الفرض المخصص"}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    totalRawWeight === 100
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-amber-950 text-amber-300 border border-amber-800"
                  }`}
                >
                  {isFr ? "Total :" : "المجموع:"} {totalRawWeight}% (
                  {((totalRawWeight * 20) / 100).toFixed(1)}/20 pts)
                </span>
              </div>

              <button
                type="button"
                onClick={handleAutoNormalizeWeights}
                className="px-2.5 py-1 rounded-lg bg-teal-600/30 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/40 text-[10.5px] font-black flex items-center gap-1 transition cursor-pointer"
                title="موازنة النسب المئوية تلقائياً لتطابق 100% بالضبط"
              >
                <Scale className="w-3 h-3" />
                <span>{isFr ? "Équilibrer 100%" : "موازنة تلقائية 100%"}</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[50vh]">
              {selectedList.map((item, idx) => {
                const exPoints = (((item.weight || 20) * 20) / 100).toFixed(1);
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                          title="تحريك لأعلى"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === selectedList.length - 1}
                          onClick={() => handleMoveDown(idx)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                          title="تحريك لأسفل"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10.5px] font-black bg-indigo-900/60 text-indigo-300 border border-indigo-700 px-1.5 rounded">
                            Ex {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white truncate">
                            {isFr ? item.lessonFr : item.lessonAr}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {exPoints} {isFr ? "pts sur 20" : "نقط على 20"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                        <span className="text-[10.5px] font-bold text-slate-400">
                          {isFr ? "Poids :" : "الوزن:"}
                        </span>
                        <input
                          type="number"
                          min={5}
                          max={60}
                          step={5}
                          value={item.weight || 20}
                          onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                          className="w-12 bg-slate-950 border border-slate-700 rounded text-center text-xs font-black text-indigo-300 focus:outline-none"
                        />
                        <span className="font-mono text-[10px] text-slate-400">%</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLesson(idx)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-700 text-rose-300 hover:text-white transition cursor-pointer"
                        title="حذف من الفرض المركب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* الشريط السفلي للحفظ والتطبيق الفوري */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-400">
            {isFr
              ? "L'épreuve hybride sera immédiatement générée sur la feuille avec numérotation et barème équilibré."
              : "سيتم تطبيق الفرض المركب فوراً على ورقة المعاينة وتحديث سلم التنقيط وعناصر الإجابة."}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-bold"
            >
              {isFr ? "Annuler" : "إلغاء"}
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isFr ? "Valider & Générer l'Épreuve" : "اعتماد وتوليد الفرض المركب"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
