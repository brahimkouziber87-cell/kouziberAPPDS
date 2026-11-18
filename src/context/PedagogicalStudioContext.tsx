import React, { createContext, useContext, useMemo } from "react";
import { LessonItem } from "../data/curriculum";
import {
  buildPedagogicalDomainStoreSnapshot,
  computeDualModelABComparison,
  PedagogicalDomainStoreSnapshot,
} from "../utils/sevenStrategicProposalsEngine";
import { MathText } from "../components/MathRenderer";

export interface PedagogicalStudioContextValue {
  storeSnapshot: PedagogicalDomainStoreSnapshot;
}

const PedagogicalStudioContext = createContext<PedagogicalStudioContextValue | null>(
  null
);

export const PedagogicalStudioProvider: React.FC<{
  snapshotParams: Parameters<typeof buildPedagogicalDomainStoreSnapshot>[0];
  children: React.ReactNode;
}> = React.memo(({ snapshotParams, children }) => {
  const storeSnapshot = useMemo(
    () => buildPedagogicalDomainStoreSnapshot(snapshotParams),
    [snapshotParams]
  );

  const value = useMemo(() => ({ storeSnapshot }), [storeSnapshot]);

  return (
    <PedagogicalStudioContext.Provider value={value}>
      {children}
    </PedagogicalStudioContext.Provider>
  );
});

PedagogicalStudioProvider.displayName = "PedagogicalStudioProvider";

export function usePedagogicalStudio(): PedagogicalStudioContextValue | null {
  return useContext(PedagogicalStudioContext);
}

/**
 * عارض فرعي معزول بـ React.memo للمقارنة الفورية جنب-إلى-جنب بين النموذج (A) والنموذج الموازي (B)
 * (المقترح 2 + المقترح 6: Memoized Sub-Sheet Renderer & Dual A/B Split Preview)
 */
export const MemoizedDualModelABComparisonView: React.FC<{
  lessons: LessonItem[];
  isFr?: boolean;
  school: string;
  prof: string;
  year: string;
  trackLabel: string;
  onSelectModel?: (model: "A" | "B") => void;
  onCloseSplitView?: () => void;
}> = React.memo(
  ({
    lessons,
    isFr = false,
    school,
    prof,
    year,
    trackLabel,
    onSelectModel,
    onCloseSplitView,
  }) => {
    const report = useMemo(
      () => computeDualModelABComparison(lessons, isFr),
      [lessons, isFr]
    );

    return (
      <div
        dir={isFr ? "ltr" : "rtl"}
        className="no-print bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 border-2 border-cyan-500/50 shadow-xl space-y-4 my-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono text-[10.5px] font-black">
                Dual A/B Split Preview · Memoized Renderer
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono text-[10.5px] font-black">
                مؤشر التكافؤ: {report.isomorphismScorePct}%
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white">
              المقارنة الفورية جنب-إلى-جنب بين النموذج (A) والنموذج الموازي (B) —{" "}
              {trackLabel}
            </h3>
            <p className="text-[11px] text-slate-300">{report.verdictAr}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onSelectModel && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectModel("A")}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition cursor-pointer"
                >
                  اعتماد النموذج (A) للطباعة
                </button>
                <button
                  type="button"
                  onClick={() => onSelectModel("B")}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer"
                >
                  اعتماد النموذج (B) للطباعة
                </button>
              </>
            )}
            {onCloseSplitView && (
              <button
                type="button"
                onClick={onCloseSplitView}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                إغلاق المقارنة المزدوجة
              </button>
            )}
          </div>
        </div>

        {/* جدول المقارنة جنب-إلى-جنب لكل تمرين */}
        <div className="space-y-3">
          {report.exercises.map((ex) => (
            <div
              key={`dual-ab-ex-${ex.exerciseNumber}`}
              className="bg-slate-950/80 rounded-xl border border-slate-800 p-3 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-black text-xs">
                    التمرين {ex.exerciseNumber} ({ex.points} ن)
                  </span>
                  <span className="font-black text-xs text-cyan-200">
                    {isFr ? ex.lessonTitleFr : ex.lessonTitleAr}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10.5px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-300 border border-slate-700">
                    تطابق الكثافة النصية: {ex.charLengthRatioPct}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-200 border border-emerald-700/60 font-sans font-bold">
                    {ex.cognitiveEquivalenceLabelAr}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* عمود النموذج A */}
                <div className="bg-white text-slate-900 rounded-xl p-3 border-2 border-cyan-500/60 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-black text-xs text-cyan-900">
                      📄 النموذج الرسمي (Sujet A)
                    </span>
                    <span className="font-mono text-[10px] font-bold text-slate-500">
                      {ex.modelAQuestions.length} أسئلة · {school}
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                    {ex.modelAQuestions.map((q, qIdx) => (
                      <li key={qIdx} className="text-slate-800">
                        <MathText text={q} />
                      </li>
                    ))}
                  </ol>
                </div>

                {/* عمود النموذج B */}
                <div className="bg-amber-50/95 text-slate-900 rounded-xl p-3 border-2 border-amber-500/70 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                    <span className="font-black text-xs text-amber-950">
                      📄 النموذج الموازي المضاد للغش (Sujet B)
                    </span>
                    <span className="font-mono text-[10px] font-bold text-amber-800">
                      {ex.modelBQuestions.length} أسئلة · {prof} ({year})
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                    {ex.modelBQuestions.map((q, qIdx) => (
                      <li key={qIdx} className="text-slate-800">
                        <MathText text={q} />
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

MemoizedDualModelABComparisonView.displayName =
  "MemoizedDualModelABComparisonView";
