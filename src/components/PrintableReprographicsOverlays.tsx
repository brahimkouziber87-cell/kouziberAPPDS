import React, { useMemo } from "react";
import { LessonItem } from "../data/curriculum";
import {
  BindingAndCropConfig,
  buildQuarterPointMicroRubric,
  calculateReprographicsProductionEstimate,
  getAlgebraicCounterExamplesForLessons,
} from "../utils/reprographicsAndDidacticsEngine";
import { MathText } from "./MathRenderer";

export const PrintableStapleAndCropMarksOverlay: React.FC<{
  config: BindingAndCropConfig;
  isFr: boolean;
}> = React.memo(({ config, isFr }) => {
  if (!config.enableStapleBindingGutter && !config.showGuillotineCropMarks) {
    return null;
  }

  return (
    <>
      {config.enableStapleBindingGutter && (
        <div
          dir={isFr ? "ltr" : "rtl"}
          className="mb-2 flex items-center justify-between border border-dashed border-slate-500 rounded-lg px-3 py-1 bg-slate-50/70 text-[9.5px] font-mono text-slate-700 avoid-break"
        >
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <span className="inline-block w-5 h-1.5 border border-slate-900 bg-slate-300 rounded-xs rotate-[-25deg]" />
            <span>
              {config.stapleCorner === "LEFT_TWO_HOLES"
                ? isFr
                  ? "[ ⚪⚪ Zone de Perforation Classeur (+8mm) — Ne pas écrire ici ]"
                  : "[ ⚪⚪ منطقة التثقيب للملف (+8mm) — لا تكتب في هذا الهامش ]"
                : isFr
                ? "[ 📎 Zone d'Agrafage Officielle (+8mm) — Coin supérieur ]"
                : "[ 📎 موضع التدبيس الرسمي (+8mm) — زاوية الورقة ]"}
            </span>
          </div>
          <span className="text-[9px] text-slate-500">
            {isFr
              ? "Marge de reliure calibrée pour photocopieur / RISO"
              : "هامش تجليد وتدبيس معاير لآلة النسخ والاستنساخ"}
          </span>
        </div>
      )}

      {config.showGuillotineCropMarks && (
        <div
          dir="ltr"
          className="my-2 border-t border-dashed border-slate-700 pt-0.5 flex items-center justify-between text-[8.5px] font-mono text-slate-600 avoid-break"
        >
          <span>┌── CROP MARK (0mm)</span>
          <span>
            ✂ ─── LIGNE DE COUPE MASSICOT / خط القص بالمقصلة (A4 → 2×A5 : 148.5mm) ─── ✂
          </span>
          <span>CROP MARK (210mm) ──┐</span>
        </div>
      )}
    </>
  );
});
PrintableStapleAndCropMarksOverlay.displayName =
  "PrintableStapleAndCropMarksOverlay";

export const PrintableReprographicsJobTicketBanner: React.FC<{
  school: string;
  prof: string;
  year: string;
  trackLabelAr: string;
  trackLabelFr: string;
  dsKey: string;
  semester: string;
  groupsCount: number;
  studentsPerGroup: number;
  pagesPerCopy: number;
  duplexMode: "RECTO_ONLY" | "RECTO_VERSO" | "TWO_UP_A5";
  ecoTonerActive: boolean;
  isFr: boolean;
}> = React.memo(
  ({
    school,
    prof,
    year,
    trackLabelAr,
    trackLabelFr,
    dsKey,
    semester,
    groupsCount,
    studentsPerGroup,
    pagesPerCopy,
    duplexMode,
    ecoTonerActive,
    isFr,
  }) => {
    const est = useMemo(
      () =>
        calculateReprographicsProductionEstimate({
          groupsCount,
          studentsPerGroup,
          pagesPerCopy,
          duplexMode,
          ecoTonerActive,
        }),
      [groupsCount, studentsPerGroup, pagesPerCopy, duplexMode, ecoTonerActive]
    );

    return (
      <div
        dir={isFr ? "ltr" : "rtl"}
        className="avoid-break border-2 border-slate-900 rounded-xl p-3 mb-4 bg-white text-slate-950 text-[10.5px] space-y-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-1.5">
          <div className="font-black text-xs flex items-center gap-2">
            <span className="bg-slate-950 text-white font-mono px-2 py-0.5 rounded text-[10px]">
              BON DE TIRAGE / مصلحة الطبع والاستنساخ
            </span>
            <span>
              {isFr
                ? `Fiche Technique de Reprographie — ${school}`
                : `بطاقة الأمر بالسحب والاستنساخ (خاص بمصلحة النسخ والطبع) — ${school}`}
            </span>
          </div>
          <span className="font-mono font-bold text-[10px]">
            {year} · {semester} · {dsKey}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[10px]">
          <div className="border border-slate-400 rounded p-1.5">
            <span className="block text-[9px] text-slate-500">
              {isFr ? "Professeur & Niveau" : "الأستاذ(ة) والمستوى"}
            </span>
            <strong className="text-slate-950">
              {prof} ({isFr ? trackLabelFr : trackLabelAr})
            </strong>
          </div>
          <div className="border border-slate-400 rounded p-1.5">
            <span className="block text-[9px] text-slate-500">
              {isFr ? "Tirage Total (Copies)" : "مجموع النسخ المطلوبة"}
            </span>
            <strong className="text-slate-950">
              {est.totalStudentCopies} نسخة ({est.groupsCount} أفواج × {est.studentsPerGroup})
            </strong>
          </div>
          <div className="border border-slate-400 rounded p-1.5">
            <span className="block text-[9px] text-slate-500">
              {isFr ? "Mode d'impression" : "نمط السحب والورق"}
            </span>
            <strong className="text-slate-950">
              {duplexMode === "RECTO_VERSO"
                ? "Recto-Verso (وجهين)"
                : duplexMode === "TWO_UP_A5"
                ? "2-Up A5 (اقتصادي + قص)"
                : "Recto (وجه واحد)"}
            </strong>
          </div>
          <div className="border border-slate-400 rounded p-1.5">
            <span className="block text-[9px] text-slate-500">
              {isFr ? "Besoin Papier A4" : "الحاجيات من ورق A4"}
            </span>
            <strong className="text-slate-950">
              {est.totalA4SheetsRequired} ورقة ({est.paperReams500Required} رزمة)
            </strong>
          </div>
          <div className="border border-slate-400 rounded p-1.5">
            <span className="block text-[9px] text-slate-500">
              {isFr ? "Visas (Prof / Censeur / Tirage)" : "توقيع الأستاذ / الناظر / المطبعة"}
            </span>
            <strong className="text-slate-600">
              [ ...... | ...... | ...... ]
            </strong>
          </div>
        </div>
      </div>
    );
  }
);
PrintableReprographicsJobTicketBanner.displayName =
  "PrintableReprographicsJobTicketBanner";

export const PrintableQuarterPointMicroRubricCard: React.FC<{
  lessons: LessonItem[];
  isFr: boolean;
}> = React.memo(({ lessons, isFr }) => {
  const rubric = useMemo(
    () => buildQuarterPointMicroRubric({ lessons, isFr }),
    [lessons, isFr]
  );

  return (
    <div
      dir={isFr ? "ltr" : "rtl"}
      className="avoid-break border-2 border-slate-900 rounded-xl p-3.5 my-4 bg-white space-y-2.5 text-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2">
        <div className="font-black text-slate-950 flex items-center gap-2">
          <span className="bg-slate-950 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded">
            BARÈME 0.25 PT & PONTS DE SECOURS
          </span>
          <span>
            {isFr
              ? "Barème Micro-Détaillé au Quart de Point (0,25 pt) & Verrous d'Admission :"
              : "شبكة تفكيك سلم التنقيط إلى أرباع النقط (0.25 ن) وجسور الإنقاذ الديداكتيكية:"}
          </span>
        </div>
        <span className="font-mono text-[10.5px] font-bold text-indigo-950">
          {rubric.quarterPointGranularityCount} خطوات جزئية · المجموع:{" "}
          {rubric.totalPointsVerified.toFixed(2)} / 20
        </span>
      </div>

      <div className="space-y-2">
        {rubric.items.map((item, idx) => (
          <div
            key={idx}
            className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/40 space-y-1.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-extrabold text-[11px] text-slate-900">
                {isFr
                  ? `Ex.${item.exerciseNumber} - Q${item.questionNumber} (${item.lessonTitleFr})`
                  : `التمرين ${item.exerciseNumber} - س${item.questionNumber} (${item.lessonTitleAr})`}
              </span>
              <span className="font-mono font-black text-[11px] text-emerald-900 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                {item.totalPoints.toFixed(2)} {isFr ? "pt" : "ن"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {item.microSteps.map((st, sIdx) => (
                <span
                  key={sIdx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-300 text-[10px] text-slate-800"
                >
                  <strong className="font-mono text-indigo-900">
                    [{st.quarterPoints.toFixed(2)}]
                  </strong>
                  <span>{isFr ? st.stepLabelFr : st.stepLabelAr}</span>
                </span>
              ))}
            </div>

            <div className="text-[10px] text-indigo-950 font-semibold pt-0.5">
              {isFr ? item.rescueAdmissionLockFr : item.rescueAdmissionLockAr}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
PrintableQuarterPointMicroRubricCard.displayName =
  "PrintableQuarterPointMicroRubricCard";

export const PrintableAlgebraicCounterExamplesCard: React.FC<{
  lessons: LessonItem[];
  isFr: boolean;
}> = React.memo(({ lessons, isFr }) => {
  const counterExamples = useMemo(
    () => getAlgebraicCounterExamplesForLessons(lessons),
    [lessons]
  );

  return (
    <div
      dir={isFr ? "ltr" : "rtl"}
      className="avoid-break border-2 border-slate-900 rounded-xl p-3.5 my-4 bg-white space-y-2.5 text-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2">
        <div className="font-black text-slate-950 flex items-center gap-2">
          <span className="bg-rose-900 text-amber-200 font-mono text-[10px] px-2 py-0.5 rounded">
            CONTRE-EXEMPLES & PIÈGES CLASSIQUES
          </span>
          <span>
            {isFr
              ? "Vigilance Algébrique : Erreurs Fréquentes & Contre-Exemples Numériques"
              : "بطاقة اليقظة الجبرية: الأخطاء الكلاسيكية الشائعة والأمثلة المضادة الحاسمة"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {counterExamples.map((ce) => (
          <div
            key={ce.id}
            className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/40 space-y-1"
          >
            <div className="font-extrabold text-[10.5px] text-indigo-950">
              • {isFr ? ce.topicBadgeFr : ce.topicBadgeAr}
            </div>
            <div className="text-[10.5px] text-rose-900 font-mono" dir="ltr">
              ❌ <MathText text={`$${ce.wrongIdentityLatex}$`} inline />
            </div>
            <div className="text-[10.5px] text-emerald-900 font-mono" dir="ltr">
              ✅ <MathText text={`$${ce.correctIdentityLatex}$`} inline />
            </div>
            <div className="text-[10px] text-slate-700 pt-0.5">
              <MathText
                text={isFr ? ce.numericCounterExampleFr : ce.numericCounterExampleAr}
                inline
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
PrintableAlgebraicCounterExamplesCard.displayName =
  "PrintableAlgebraicCounterExamplesCard";
