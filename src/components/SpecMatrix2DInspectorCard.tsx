import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileCode2,
  FileSpreadsheet,
  FileText,
  PlusCircle,
  RefreshCw,
  Scale,
  Sliders,
  Sparkles,
  Table2,
  TrendingUp,
  Users,
} from "lucide-react";
import { DSQuestionDensity, LessonItem } from "../data/curriculum";
import {
  build2DSpecificationMatrix,
  generate2DSpecMatrixLatex,
  generate2DSpecMatrixTypst,
  SpecMatrixCell,
} from "../utils/advancedPedagogicalTools";
import {
  AdaptiveSpecMatrixUpdateResult,
  computeAdaptive2DSpecMatrixWeights,
  createDefaultStudentSkillEvaluations,
  cycleSkillAcquisitionLevel,
  exportIntegratedPedagogicalReportCSV,
  exportIntegratedPedagogicalReportHTML,
  loadOrInitializeStudentSkillAssessments,
  saveStudentSkillAssessments,
  SKILL_ACQUISITION_META,
  SkillAcquisitionLevel,
  StudentSpecMatrixEvaluation,
  SuggestedRemedialExercise,
} from "../utils/specMatrixSkillAssessmentEngine";
import { MathText } from "./MathRenderer";

export type SpecMatrix2DSubTab =
  | "MATRIX_2D"
  | "STUDENT_SKILL_ASSESSMENT"
  | "ADAPTIVE_WEIGHTS_ENGINE";

export interface AdaptiveApplyPayload {
  rawLessonWeightsMap: Record<string, number>;
  recommendedRatios: { n1: number; n2: number; n3: number };
  injectedExercises: SuggestedRemedialExercise[];
}

export interface SpecMatrix2DInspectorCardProps {
  lessons: LessonItem[];
  n1: number;
  n2: number;
  n3: number;
  dsStructureMode: string;
  isMission: boolean;
  isFr?: boolean;
  dsQuestionDensity?: DSQuestionDensity;
  qcmQuestionCount?: number;
  examDurationMinutes?: number;
  variant?: "interactive" | "print";
  include2DSpecMatrix?: boolean;
  onToggleIncludeInSheet?: (val: boolean) => void;
  onApplyPresetRatios?: (n1: number, n2: number, n3: number) => void;
  onOpenBaremeModal?: () => void;
  onOpenAdvancedStudio2D?: () => void;
  trackCode?: string;
  trackNameAr?: string;
  trackNameFr?: string;
  dsKey?: string;
  dsTitleAr?: string;
  dsTitleFr?: string;
  school?: string;
  prof?: string;
  year?: string;
  academy?: string;
  direction?: string;
  initialSubTab?: SpecMatrix2DSubTab;
  onApplyAdaptiveWeightsAndExercises?: (payload: AdaptiveApplyPayload) => void;
}

export const SpecMatrix2DInspectorCard: React.FC<SpecMatrix2DInspectorCardProps> =
  React.memo(
    ({
      lessons,
      n1,
      n2,
      n3,
      dsStructureMode,
      isMission,
      isFr = false,
      dsQuestionDensity = "STANDARD",
      qcmQuestionCount = 4,
      examDurationMinutes = 120,
      variant = "interactive",
      include2DSpecMatrix = true,
      onToggleIncludeInSheet,
      onApplyPresetRatios,
      onOpenBaremeModal,
      onOpenAdvancedStudio2D,
      trackCode = "DEFAULT",
      trackNameAr = "السنة الثانية بكالوريا",
      trackNameFr = "2ème Baccalauréat",
      dsKey = "DS1",
      dsTitleAr = "الفرض المحروس رقم 1",
      dsTitleFr = "Devoir Surveillé N°1",
      school = "الثانوية التأهيلية",
      prof = "أستاذ(ة) المادة",
      year = "2024/2025",
      academy = "الأكاديمية الجهوية للتربية والتكوين",
      direction = "المديرية الإقليمية",
      initialSubTab = "MATRIX_2D",
      onApplyAdaptiveWeightsAndExercises,
    }) => {
      const [copiedFormat, setCopiedFormat] = useState<"LATEX" | "TYPST" | null>(null);
      const [activeSubTab, setActiveSubTab] =
        useState<SpecMatrix2DSubTab>(initialSubTab);
      const [studentEvaluations, setStudentEvaluations] = useState<
        StudentSpecMatrixEvaluation[]
      >(() => loadOrInitializeStudentSkillAssessments(trackCode, dsKey, lessons));
      const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>("ALL");
      const [appliedFeedbackBanner, setAppliedFeedbackBanner] = useState<string | null>(
        null
      );

      const copyTimerRef = useRef<number | null>(null);
      const feedbackTimerRef = useRef<number | null>(null);

      useEffect(() => {
        return () => {
          if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
          if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
        };
      }, []);

      // Reload/normalize student evaluations when trackCode, dsKey, or lessons change
      useEffect(() => {
        const loaded = loadOrInitializeStudentSkillAssessments(
          trackCode,
          dsKey,
          lessons
        );
        setStudentEvaluations(loaded);
      }, [trackCode, dsKey, lessons]);

      const updateAndPersistStudents = (
        updater: (
          prev: StudentSpecMatrixEvaluation[]
        ) => StudentSpecMatrixEvaluation[]
      ) => {
        setStudentEvaluations((prev) => {
          const next = updater(prev);
          saveStudentSkillAssessments(trackCode, dsKey, next);
          return next;
        });
      };

      const adaptiveResult: AdaptiveSpecMatrixUpdateResult = useMemo(
        () =>
          computeAdaptive2DSpecMatrixWeights(
            lessons,
            studentEvaluations,
            trackCode,
            n1,
            n2,
            n3
          ),
        [lessons, studentEvaluations, trackCode, n1, n2, n3]
      );

      const spec2D = useMemo(
        () =>
          build2DSpecificationMatrix(
            lessons,
            n1,
            n2,
            n3,
            dsStructureMode,
            isMission,
            dsQuestionDensity,
            qcmQuestionCount,
            examDurationMinutes
          ),
        [
          lessons,
          n1,
          n2,
          n3,
          dsStructureMode,
          isMission,
          dsQuestionDensity,
          qcmQuestionCount,
          examDurationMinutes,
        ]
      );

      const handleCopyCode = (format: "LATEX" | "TYPST") => {
        const snippet =
          format === "LATEX"
            ? generate2DSpecMatrixLatex(spec2D)
            : generate2DSpecMatrixTypst(spec2D, isFr);
        navigator.clipboard.writeText(snippet);
        setCopiedFormat(format);
        if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = window.setTimeout(() => setCopiedFormat(null), 2000);
      };

      const showTemporaryFeedback = (msg: string) => {
        setAppliedFeedbackBanner(msg);
        if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = window.setTimeout(
          () => setAppliedFeedbackBanner(null),
          4000
        );
      };

      const handleToggleStudentSkill = (
        studentId: string,
        lessonFr: string,
        skillKey: "n1Status" | "n2Status" | "n3Status"
      ) => {
        updateAndPersistStudents((prev) =>
          prev.map((student) => {
            if (student.studentId !== studentId) return student;
            const currentRec = student.lessonRecords[lessonFr] || {
              n1Status: "IN_PROGRESS",
              n2Status: "IN_PROGRESS",
              n3Status: "IN_PROGRESS",
              previousScoreOn20: 11,
            };
            const nextLevel = cycleSkillAcquisitionLevel(currentRec[skillKey]);
            const updatedRec = {
              ...currentRec,
              [skillKey]: nextLevel,
            };
            const nextRecords = {
              ...student.lessonRecords,
              [lessonFr]: updatedRec,
            };

            // Recompute student average grade on 20
            let sumScores = 0;
            lessons.forEach((l) => {
              const r = nextRecords[l.lessonFr] || updatedRec;
              sumScores +=
                (SKILL_ACQUISITION_META[r.n1Status].numericScore * 0.45 +
                  SKILL_ACQUISITION_META[r.n2Status].numericScore * 0.35 +
                  SKILL_ACQUISITION_META[r.n3Status].numericScore * 0.2) *
                20;
            });
            const newGrade =
              lessons.length > 0
                ? Number((sumScores / lessons.length).toFixed(2))
                : student.previousExamGrade20;

            const newObs =
              newGrade >= 14
                ? "تحكم جيد في الكفايات الأساسية والتوليفية"
                : newGrade >= 10
                ? "مكتسبات متوسطة تحتاج تثبيت مهارات التطبيق المباشر N1/N2"
                : "تعثر ملحوظ في المهارات القاعدية N1/N2 يستوجب دعماً بيداغوجياً عاجلاً";

            return {
              ...student,
              previousExamGrade20: newGrade,
              lessonRecords: nextRecords,
              inspectorObservation: newObs,
            };
          })
        );
      };

      const handleSimulatePreset = (
        preset: "REALISTIC_MIXED" | "WEAK_N1_N2" | "HIGH_MASTERY"
      ) => {
        const generated = createDefaultStudentSkillEvaluations(lessons, preset);
        setStudentEvaluations(generated);
        saveStudentSkillAssessments(trackCode, dsKey, generated);
        showTemporaryFeedback(
          preset === "WEAK_N1_N2"
            ? "تم توليد سيناريو تعثر ملحوظ في المهارات القاعدية (N1/N2) لاختبار التحيين التلقائي للأوزان."
            : preset === "HIGH_MASTERY"
            ? "تم توليد سيناريو تحكم عالٍ في المكتسبات لجميع التلاميذ."
            : "تم توليد نتائج الفرض السابق الواقعية وتحديث مؤشرات الاكتساب."
        );
      };

      const handleExportHTMLReport = () => {
        exportIntegratedPedagogicalReportHTML({
          trackNameAr,
          trackNameFr,
          dsTitleAr,
          dsTitleFr,
          school,
          prof,
          year,
          academy,
          direction,
          lessons,
          students: studentEvaluations,
          adaptiveResult,
        });
        showTemporaryFeedback(
          "تم تصدير التقرير البيداغوجي المدمج (HTML قابلة للطباعة A4) بنجاح!"
        );
      };

      const handleExportCSVReport = () => {
        exportIntegratedPedagogicalReportCSV({
          trackNameAr,
          trackNameFr,
          dsTitleAr,
          dsTitleFr,
          school,
          prof,
          year,
          academy,
          direction,
          lessons,
          students: studentEvaluations,
          adaptiveResult,
        });
        showTemporaryFeedback(
          "تم تصدير شبكة تقييم المهارات المكتسبة وأوزان المصفوفة بصيغة CSV/Excel بنجاح!"
        );
      };

      const handleApplyAdaptiveUpdate = (includeSuggestedExercises: boolean) => {
        const allSuggestedExercises = includeSuggestedExercises
          ? adaptiveResult.recommendations.flatMap((rec) => rec.suggestedExercises)
          : [];

        if (onApplyAdaptiveWeightsAndExercises) {
          onApplyAdaptiveWeightsAndExercises({
            rawLessonWeightsMap: adaptiveResult.rawLessonWeightsMap,
            recommendedRatios: adaptiveResult.recommendedRatios,
            injectedExercises: allSuggestedExercises,
          });
        } else if (onApplyPresetRatios) {
          onApplyPresetRatios(
            adaptiveResult.recommendedRatios.n1,
            adaptiveResult.recommendedRatios.n2,
            adaptiveResult.recommendedRatios.n3
          );
        }

        showTemporaryFeedback(
          includeSuggestedExercises
            ? `تم تحديث أوزان مصفوفة التخصيص 2D تلقائياً وإدراج ${allSuggestedExercises.length} تمريناً/سؤالاً داعماً للمهارات الأقل اكتساباً (N1/N2) في الفرض القادم!`
            : "تم تحديث أوزان مصفوفة التخصيص 2D والنسب المهارية تلقائياً بناءً على نتائج الفرض السابق!"
        );
      };

      const renderCellContent = (
        cell: SpecMatrixCell,
        levelColorClass: string,
        badgeBgClass: string
      ) => {
        if (cell.questionsCount === 0) {
          return (
            <span className="text-slate-400 font-mono text-[10.5px]">—</span>
          );
        }
        const qPrefix = isFr ? "Q" : "س";
        return (
          <div className="space-y-0.5">
            <div className={`font-mono font-extrabold ${levelColorClass} tabular-nums`}>
              {cell.questionsCount}
              {isFr ? "Q" : " س"} · {cell.points.toFixed(2)} {isFr ? "pt" : "ن"}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-0.5">
              {cell.questionIndices.map((qNum) => (
                <span
                  key={qNum}
                  className={`inline-block font-mono text-[9.5px] font-bold px-1 py-0.2 rounded border ${badgeBgClass}`}
                >
                  {qPrefix}
                  {qNum}
                </span>
              ))}
              <span className="text-[9.5px] font-mono text-slate-500">
                ({cell.percentageOfTotal}%)
              </span>
            </div>
          </div>
        );
      };

      const renderDeltaBadge = (delta: number) => {
        const abs = Math.abs(delta);
        const sign = delta > 0 ? `+${delta}%` : `${delta}%`;
        if (abs <= 3) {
          return (
            <span className="font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              {delta === 0 ? (isFr ? "Exact" : "مطابق") : sign}
            </span>
          );
        }
        if (abs <= 8) {
          return (
            <span className="font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Δ {sign}
            </span>
          );
        }
        return (
          <span className="font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 border border-rose-300">
            Δ {sign}
          </span>
        );
      };

      // ========================================================================
      // 1. وضع الطباعة والمعاينة الورقية الرسمية A4 (Print Mode)
      // ========================================================================
      if (variant === "print") {
        return (
          <div className="mt-3 pt-3 border-t-2 border-slate-300 space-y-2.5 avoid-break">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-950 text-cyan-300 font-mono text-[10px] font-black px-2 py-0.5 rounded">
                  MATRICE 2D · 142-08
                </span>
                <span className="font-black text-indigo-950">
                  {isFr
                    ? "Tableau de Spécification Bidimensionnel 2D (Chapitres × Niveaux Taxonomiques N1 / N2 / N3) :"
                    : "مصفوفة التخصيص ثنائية الأبعاد 2D (تقاطع الدروس والقدرات مع المستويات المهارية N1 و N2 و N3):"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-mono text-[10.5px] font-extrabold px-2 py-0.5 rounded border ${
                    spec2D.inspectorAuditStatus === "CONFORME"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                      : spec2D.inspectorAuditStatus === "TOLERANCE"
                      ? "bg-amber-50 text-amber-900 border-amber-300"
                      : "bg-rose-50 text-rose-900 border-rose-300"
                  }`}
                >
                  {isFr
                    ? `Indice de conformité : ${spec2D.conformityScore}%`
                    : `مؤشر مطابقة المفتشية (142-08) : ${spec2D.conformityScore}%`}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-400 text-[10.5px] bg-white">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-extrabold">
                    <th className="border border-slate-400 p-1.5 text-start">
                      {isFr
                        ? "Composante / Chapitre & Capacités ciblées (OP 2007)"
                        : "المكون / الدرس والقدرات المنتظرة المستهدفة (OP 2007)"}
                    </th>
                    <th className="border border-slate-400 p-1.5 text-center bg-sky-50/70 w-32">
                      <div>
                        {isFr ? "N1 : Application" : "N1 : تطبيق مباشر"}
                      </div>
                      <div className="text-[9.5px] font-mono text-sky-900">
                        {isFr ? `Cible : ${n1}%` : `المستهدف: ${n1}%`} (
                        {((n1 * 20) / 100).toFixed(1)} {isFr ? "pt" : "ن"})
                      </div>
                    </th>
                    <th className="border border-slate-400 p-1.5 text-center bg-indigo-50/70 w-32">
                      <div>
                        {isFr ? "N2 : Mobilisation" : "N2 : استدلال وتعبئة"}
                      </div>
                      <div className="text-[9.5px] font-mono text-indigo-900">
                        {isFr ? `Cible : ${n2}%` : `المستهدف: ${n2}%`} (
                        {((n2 * 20) / 100).toFixed(1)} {isFr ? "pt" : "ن"})
                      </div>
                    </th>
                    <th className="border border-slate-400 p-1.5 text-center bg-amber-50/70 w-32">
                      <div>
                        {isFr ? "N3 : Synthèse" : "N3 : توليف ومبادرة"}
                      </div>
                      <div className="text-[9.5px] font-mono text-amber-900">
                        {isFr ? `Cible : ${n3}%` : `المستهدف: ${n3}%`} (
                        {((n3 * 20) / 100).toFixed(1)} {isFr ? "pt" : "ن"})
                      </div>
                    </th>
                    <th className="border border-slate-400 p-1.5 text-center w-16">
                      {isFr ? "Poids" : "الوزن"}
                    </th>
                    <th className="border border-slate-400 p-1.5 text-center w-16">
                      {isFr ? "Durée" : "الزمن"}
                    </th>
                    <th className="border border-slate-400 p-1.5 text-center w-24 bg-emerald-50/60">
                      {isFr ? "Barème (/20)" : "المجموع (/20)"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {spec2D.rows.map((r, rIdx) => {
                    const caps = (isFr ? r.capacitiesFr : r.capacitiesAr).slice(0, 2);
                    return (
                      <tr key={rIdx} className="border-b border-slate-300">
                        <td className="border border-slate-400 p-1.5 align-top">
                          <div className="font-extrabold text-slate-950">
                            {isFr
                              ? `Ex. ${r.lessonIndex} : ${r.lessonTitleFr}`
                              : `التمرين ${r.lessonIndex} : ${r.lessonTitleAr}`}
                          </div>
                          {caps.length > 0 && (
                            <div className="text-[9.5px] text-slate-600 mt-0.5 leading-snug">
                              {caps.map((c, cIdx) => (
                                <span key={cIdx} className="block">
                                  • <MathText text={c} inline />
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="border border-slate-400 p-1.5 text-center align-middle bg-sky-50/20">
                          {renderCellContent(
                            r.n1,
                            "text-sky-950",
                            "bg-sky-50 text-sky-900 border-sky-200"
                          )}
                        </td>
                        <td className="border border-slate-400 p-1.5 text-center align-middle bg-indigo-50/20">
                          {renderCellContent(
                            r.n2,
                            "text-indigo-950",
                            "bg-indigo-50 text-indigo-900 border-indigo-200"
                          )}
                        </td>
                        <td className="border border-slate-400 p-1.5 text-center align-middle bg-amber-50/20">
                          {renderCellContent(
                            r.n3,
                            "text-amber-950",
                            "bg-amber-50 text-amber-900 border-amber-200"
                          )}
                        </td>
                        <td className="border border-slate-400 p-1.5 text-center font-mono font-bold tabular-nums">
                          {r.weightPercent}%
                        </td>
                        <td className="border border-slate-400 p-1.5 text-center font-mono text-slate-700 tabular-nums">
                          ~{r.estimatedMinutes} {isFr ? "min" : "د"}
                        </td>
                        <td className="border border-slate-400 p-1.5 text-center font-mono font-black text-indigo-950 bg-emerald-50/20 tabular-nums">
                          <div>{r.totalPoints.toFixed(2)} pts</div>
                          <div className="text-[9px] font-normal text-slate-600">
                            ({r.totalQuestions} {isFr ? "questions" : "أسئلة"})
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-black text-slate-950">
                    <td className="border border-slate-400 p-1.5 text-end">
                      {isFr
                        ? `Total Général (${spec2D.totals.grandTotalQuestions} questions)`
                        : `المجموع العام للفرض (${spec2D.totals.grandTotalQuestions} سؤالاً)`}
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono bg-sky-100/60">
                      <div>
                        {spec2D.totals.n1Questions}Q · {spec2D.totals.n1Points.toFixed(2)}{" "}
                        {isFr ? "pt" : "ن"}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className="text-[9.5px] text-sky-950">
                          {isFr ? "Effectif :" : "الفعلي:"} {spec2D.totals.n1Percent}%
                        </span>
                        {renderDeltaBadge(spec2D.deviations.n1Delta)}
                      </div>
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono bg-indigo-100/60">
                      <div>
                        {spec2D.totals.n2Questions}Q · {spec2D.totals.n2Points.toFixed(2)}{" "}
                        {isFr ? "pt" : "ن"}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className="text-[9.5px] text-indigo-950">
                          {isFr ? "Effectif :" : "الفعلي:"} {spec2D.totals.n2Percent}%
                        </span>
                        {renderDeltaBadge(spec2D.deviations.n2Delta)}
                      </div>
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono bg-amber-100/60">
                      <div>
                        {spec2D.totals.n3Questions}Q · {spec2D.totals.n3Points.toFixed(2)}{" "}
                        {isFr ? "pt" : "ن"}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className="text-[9.5px] text-amber-950">
                          {isFr ? "Effectif :" : "الفعلي:"} {spec2D.totals.n3Percent}%
                        </span>
                        {renderDeltaBadge(spec2D.deviations.n3Delta)}
                      </div>
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono">
                      100%
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono">
                      {spec2D.totals.totalEstimatedMinutes} {isFr ? "min" : "د"}
                    </td>
                    <td className="border border-slate-400 p-1.5 text-center font-mono text-indigo-950 bg-emerald-100/70">
                      {spec2D.totals.grandTotalPoints.toFixed(2)} / 20
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* خلاصة وتأشيرة المفتش التربوي حول التوازن المهاري ثنائي الأبعاد + تشخيص المكتسبات */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 space-y-1 text-[10px] text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    {isFr
                      ? spec2D.inspectorVerdictFr
                      : spec2D.inspectorVerdictAr}
                  </span>
                </div>
                <span className="font-mono text-[9.5px] font-bold text-indigo-950 shrink-0">
                  {isFr
                    ? "Visa d'Audit Pédagogique · Note 142-08"
                    : "تأشيرة التدقيق الديداكتيكي · المذكرة 142-08"}
                </span>
              </div>
              <div className="pt-1 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-slate-600">
                <span>
                  {isFr
                    ? adaptiveResult.inspectorDiagnosticSummaryFr
                    : adaptiveResult.inspectorDiagnosticSummaryAr}
                </span>
                <span className="font-mono font-bold text-emerald-800 shrink-0">
                  {isFr
                    ? `Maîtrise N1: ${adaptiveResult.globalN1MasteryPct}% · N2: ${adaptiveResult.globalN2MasteryPct}% · N3: ${adaptiveResult.globalN3MasteryPct}%`
                    : `التحكم الفعلي — N1: ${adaptiveResult.globalN1MasteryPct}% · N2: ${adaptiveResult.globalN2MasteryPct}% · N3: ${adaptiveResult.globalN3MasteryPct}%`}
                </span>
              </div>
            </div>
          </div>
        );
      }

      const filteredLessonsForSkillTable =
        selectedLessonFilter === "ALL"
          ? lessons
          : lessons.filter((l) => l.lessonFr === selectedLessonFilter);

      // ========================================================================
      // 2. الوضع التفاعلي لمرصد المفتش التربوي ولوحة الإعدادات (Interactive Mode)
      // ========================================================================
      return (
        <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/60 p-4 space-y-3.5 shadow-2xs">
          {/* Header & Inspector Conformity Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/90 pb-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 text-cyan-300 border border-indigo-800 flex items-center justify-center shrink-0 mt-0.5">
                <Table2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs md:text-sm font-black text-slate-950">
                    مصفوفة التخصيص ثنائية الأبعاد (2D) لتدقيق المفتش التربوي وتقييم المهارات المكتسبة
                  </h4>
                  <span
                    className={`text-[10.5px] font-mono font-black px-2 py-0.5 rounded-md border tabular-nums ${
                      spec2D.inspectorAuditStatus === "CONFORME"
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : spec2D.inspectorAuditStatus === "TOLERANCE"
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-rose-100 text-rose-900 border-rose-300"
                    }`}
                  >
                    مؤشر المطابقة 142-08 : {spec2D.conformityScore}%
                  </span>
                  <span className="text-[10.5px] font-mono font-black px-2 py-0.5 rounded-md border bg-sky-100 text-sky-900 border-sky-300 tabular-nums">
                    مؤشر اكتساب القسم : {adaptiveResult.globalMasteryIndex}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  ربط تقاطعي بين الدروس والمهارات (N1/N2/N3) مع سجل تقييم المهارات المكتسبة لكل تلميذ والتحيين التلقائي لأوزان المصفوفة بناءً على نتائج الفرض السابق.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {onToggleIncludeInSheet && (
                <button
                  type="button"
                  onClick={() => onToggleIncludeInSheet(!include2DSpecMatrix)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black border transition flex items-center gap-1.5 cursor-pointer ${
                    include2DSpecMatrix
                      ? "bg-indigo-950 text-cyan-300 border-indigo-900 shadow-2xs"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {include2DSpecMatrix
                      ? "✓ مدمجة في ورقة الفرض A4"
                      : "+ إدراج في ورقة الفرض A4"}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportHTMLReport}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-900 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                title="تصدير التقرير البيداغوجي المدمج (مصفوفة التخصيص 2D + تقييم المهارات المكتسبة للتلاميذ)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>تصدير التقرير البيداغوجي المدمج</span>
              </button>

              {onApplyPresetRatios && (
                <button
                  type="button"
                  onClick={() => onApplyPresetRatios(35, 45, 20)}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-300 transition flex items-center gap-1 cursor-pointer"
                  title="ضبط النسب المهارية على معيار المفتشية العامة (35% N1 / 45% N2 / 20% N3)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>معيار المفتش (35/45/20)</span>
                </button>
              )}

              {onOpenBaremeModal && (
                <button
                  type="button"
                  onClick={onOpenBaremeModal}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-700" />
                  <span>تعديل مستويات الأسئلة</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCopyCode("LATEX")}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                title="نسخ كود مصفوفة التخصيص 2D بصيغة LaTeX"
              >
                {copiedFormat === "LATEX" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-800">تم نسخ LaTeX</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>كود LaTeX</span>
                  </>
                )}
              </button>

              {onOpenAdvancedStudio2D && (
                <button
                  type="button"
                  onClick={onOpenAdvancedStudio2D}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-indigo-700" />
                  <span>مختبر 2D الموسع</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub-Tabs Navigation Bar inside 2D Specification Matrix */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSubTab("MATRIX_2D")}
              className={`flex-1 min-w-[180px] px-3 py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSubTab === "MATRIX_2D"
                  ? "bg-indigo-950 text-cyan-300 shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80"
              }`}
            >
              <Table2 className="w-4 h-4 shrink-0" />
              <span>1. جدول التخصيص ثنائي الأبعاد (2D)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("STUDENT_SKILL_ASSESSMENT")}
              className={`flex-1 min-w-[220px] px-3 py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSubTab === "STUDENT_SKILL_ASSESSMENT"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-emerald-50/60 border border-slate-200/80"
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>2. تقييم المهارات المكتسبة للتلاميذ والتقرير المدمج</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-900">
                {studentEvaluations.length} تلميذ
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("ADAPTIVE_WEIGHTS_ENGINE")}
              className={`flex-1 min-w-[220px] px-3 py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSubTab === "ADAPTIVE_WEIGHTS_ENGINE"
                  ? "bg-amber-700 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-amber-50/60 border border-slate-200/80"
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>3. التحديث التلقائي للأوزان واقتراح تمارين (N1/N2)</span>
            </button>
          </div>

          {appliedFeedbackBanner && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{appliedFeedbackBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setAppliedFeedbackBanner(null)}
                className="text-[11px] text-emerald-800 underline cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          )}

          {/* ==============================================================
              SUB-TAB 1: 2D SPECIFICATION MATRIX TABLE
             ============================================================== */}
          {activeSubTab === "MATRIX_2D" && (
            <div className="space-y-3.5">
              {/* Target vs Actual Skill Comparison Bars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                {[
                  {
                    code: "N1",
                    title: "المستوى N1 : تطبيق مباشر للتعاريف والخاصيات",
                    target: spec2D.targetRatios.n1,
                    actualPct: spec2D.totals.n1Percent,
                    pts: spec2D.totals.n1Points,
                    qCount: spec2D.totals.n1Questions,
                    delta: spec2D.deviations.n1Delta,
                    barColor: "bg-sky-600",
                    cardBg: "bg-sky-50/50 border-sky-200/90",
                  },
                  {
                    code: "N2",
                    title: "المستوى N2 : استدلال وتعبئة الموارد",
                    target: spec2D.targetRatios.n2,
                    actualPct: spec2D.totals.n2Percent,
                    pts: spec2D.totals.n2Points,
                    qCount: spec2D.totals.n2Questions,
                    delta: spec2D.deviations.n2Delta,
                    barColor: "bg-indigo-600",
                    cardBg: "bg-indigo-50/50 border-indigo-200/90",
                  },
                  {
                    code: "N3",
                    title: "المستوى N3 : توليف، تعمق ومبادرة",
                    target: spec2D.targetRatios.n3,
                    actualPct: spec2D.totals.n3Percent,
                    pts: spec2D.totals.n3Points,
                    qCount: spec2D.totals.n3Questions,
                    delta: spec2D.deviations.n3Delta,
                    barColor: "bg-amber-600",
                    cardBg: "bg-amber-50/50 border-amber-200/90",
                  },
                ].map((lvl) => (
                  <div
                    key={lvl.code}
                    className={`p-2.5 rounded-xl border ${lvl.cardBg} space-y-1.5`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-slate-900 text-[11px]">
                        {lvl.title}
                      </span>
                      {renderDeltaBadge(lvl.delta)}
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-600">
                        المستهدف: <strong>{lvl.target}%</strong> (
                        {((lvl.target * 20) / 100).toFixed(1)} ن)
                      </span>
                      <span className="font-black text-slate-950">
                        الفعلي: {lvl.actualPct}% ({lvl.pts.toFixed(2)} ن · {lvl.qCount} س)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full ${lvl.barColor} transition-all duration-300`}
                        style={{
                          width: `${Math.min(100, Math.max(4, lvl.actualPct))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 2D Cross-Tabulation Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-300">
                      <th className="p-2 text-start border-l border-slate-300">
                        التمرين / الدرس والقدرات المستهدفة (OP 2007)
                      </th>
                      <th className="p-2 text-center border-l border-slate-300 bg-sky-50/70 w-36">
                        <div>N1 : تطبيق مباشر</div>
                        <div className="text-[9.5px] font-mono text-sky-800">
                          المستهدف {n1}%
                        </div>
                      </th>
                      <th className="p-2 text-center border-l border-slate-300 bg-indigo-50/70 w-36">
                        <div>N2 : استدلال وتعبئة</div>
                        <div className="text-[9.5px] font-mono text-indigo-800">
                          المستهدف {n2}%
                        </div>
                      </th>
                      <th className="p-2 text-center border-l border-slate-300 bg-amber-50/70 w-36">
                        <div>N3 : توليف ومبادرة</div>
                        <div className="text-[9.5px] font-mono text-amber-800">
                          المستهدف {n3}%
                        </div>
                      </th>
                      <th className="p-2 text-center border-l border-slate-300 w-16">
                        الوزن
                      </th>
                      <th className="p-2 text-center border-l border-slate-300 w-20">
                        الزمن
                      </th>
                      <th className="p-2 text-center bg-emerald-50/70 w-24">
                        النقط (/20)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {spec2D.rows.map((r, rIdx) => (
                      <tr
                        key={rIdx}
                        className="border-b border-slate-200 hover:bg-slate-50/80 transition"
                      >
                        <td className="p-2 border-l border-slate-200 align-top">
                          <div className="font-black text-slate-950 flex items-center gap-1.5">
                            <span className="bg-slate-900 text-cyan-300 font-mono text-[9.5px] px-1.5 py-0.2 rounded">
                              تمرين {r.lessonIndex}
                            </span>
                            <span>{r.lessonTitleAr}</span>
                          </div>
                          {r.capacitiesAr.length > 0 && (
                            <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                              القدرة: <MathText text={r.capacitiesAr[0]} inline />
                            </div>
                          )}
                        </td>
                        <td className="p-2 border-l border-slate-200 text-center bg-sky-50/20">
                          {renderCellContent(
                            r.n1,
                            "text-sky-950",
                            "bg-sky-100/90 text-sky-900 border-sky-300"
                          )}
                        </td>
                        <td className="p-2 border-l border-slate-200 text-center bg-indigo-50/20">
                          {renderCellContent(
                            r.n2,
                            "text-indigo-950",
                            "bg-indigo-100/90 text-indigo-900 border-indigo-300"
                          )}
                        </td>
                        <td className="p-2 border-l border-slate-200 text-center bg-amber-50/20">
                          {renderCellContent(
                            r.n3,
                            "text-amber-950",
                            "bg-amber-100/90 text-amber-900 border-amber-300"
                          )}
                        </td>
                        <td className="p-2 border-l border-slate-200 text-center font-mono font-bold text-slate-700 tabular-nums">
                          {r.weightPercent}%
                        </td>
                        <td className="p-2 border-l border-slate-200 text-center font-mono text-slate-600 tabular-nums">
                          <span className="inline-flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {r.estimatedMinutes} د
                          </span>
                        </td>
                        <td className="p-2 text-center font-mono font-black text-indigo-950 bg-emerald-50/30 tabular-nums">
                          <div>{r.totalPoints.toFixed(2)} ن</div>
                          <div className="text-[9.5px] font-normal text-slate-500">
                            ({r.totalQuestions} أسئلة)
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black text-slate-950 border-t-2 border-slate-300">
                      <td className="p-2 text-end border-l border-slate-300">
                        المجموع العام للفرض ({spec2D.totals.grandTotalQuestions} سؤالاً)
                      </td>
                      <td className="p-2 text-center font-mono border-l border-slate-300 bg-sky-100/60">
                        <div>
                          {spec2D.totals.n1Questions} س · {spec2D.totals.n1Points.toFixed(2)}{" "}
                          ن ({spec2D.totals.n1Percent}%)
                        </div>
                      </td>
                      <td className="p-2 text-center font-mono border-l border-slate-300 bg-indigo-100/60">
                        <div>
                          {spec2D.totals.n2Questions} س · {spec2D.totals.n2Points.toFixed(2)}{" "}
                          ن ({spec2D.totals.n2Percent}%)
                        </div>
                      </td>
                      <td className="p-2 text-center font-mono border-l border-slate-300 bg-amber-100/60">
                        <div>
                          {spec2D.totals.n3Questions} س · {spec2D.totals.n3Points.toFixed(2)}{" "}
                          ن ({spec2D.totals.n3Percent}%)
                        </div>
                      </td>
                      <td className="p-2 text-center font-mono border-l border-slate-300">
                        100%
                      </td>
                      <td className="p-2 text-center font-mono border-l border-slate-300">
                        {spec2D.totals.totalEstimatedMinutes} د
                      </td>
                      <td className="p-2 text-center font-mono text-indigo-950 bg-emerald-100/80">
                        {spec2D.totals.grandTotalPoints.toFixed(2)} / 20
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ==============================================================
              SUB-TAB 2: STUDENT SKILL ACQUISITION ASSESSMENT & REPORT EXPORT
             ============================================================== */}
          {activeSubTab === "STUDENT_SKILL_ASSESSMENT" && (
            <div className="space-y-3.5">
              {/* Top Toolbar: Legend, Filter, Simulation & Export Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-emerald-950">
                      سجل المفتش التربوي لتقييم المهارات المكتسبة لكل تلميذ عبر جدول التخصيص 2D:
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                      مكتسبة ✓ (A)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      في طور الاكتساب ≈ (ECA)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                      غير مكتسبة ✗ (NA)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    انقر على أي خلية مهارية (N1 أو N2 أو N3) لتبديل حالة التملك للتلميذ؛ يتم حفظ التقييمات وحساب الأوزان التكيفية تلقائياً.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <select
                    value={selectedLessonFilter}
                    onChange={(e) => setSelectedLessonFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white border border-slate-300 text-slate-800"
                    aria-label="تصفية حسب الدرس"
                  >
                    <option value="ALL">جميع دروس الفرض ({lessons.length})</option>
                    {lessons.map((l) => (
                      <option key={l.lessonFr} value={l.lessonFr}>
                        {l.lessonAr}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleSimulatePreset("WEAK_N1_N2")}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 transition cursor-pointer"
                    title="محاكاة نتائج فرض سابق بتعثر في المهارات الأساسية N1/N2"
                  >
                    محاكاة تعثر N1/N2
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulatePreset("REALISTIC_MIXED")}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer"
                  >
                    توزيع واقعي متباين
                  </button>

                  <button
                    type="button"
                    onClick={handleExportHTMLReport}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-emerald-700 hover:bg-emerald-800 text-white transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير التقرير البيداغوجي المدمج (A4 HTML)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSVReport}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-950 hover:bg-indigo-900 text-cyan-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>تصدير Excel/CSV</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Strip */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-center">
                  <div className="text-[10.5px] text-slate-500">المؤشر العام للاكتساب</div>
                  <div className="text-base font-black font-mono text-indigo-950">
                    {adaptiveResult.globalMasteryIndex}%
                  </div>
                </div>
                <div className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/50 text-center">
                  <div className="text-[10.5px] text-sky-800">تملك مهارات N1 (تطبيق)</div>
                  <div className="text-base font-black font-mono text-sky-900">
                    {adaptiveResult.globalN1MasteryPct}%
                  </div>
                </div>
                <div className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 text-center">
                  <div className="text-[10.5px] text-indigo-800">تملك مهارات N2 (استدلال)</div>
                  <div className="text-base font-black font-mono text-indigo-900">
                    {adaptiveResult.globalN2MasteryPct}%
                  </div>
                </div>
                <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 text-center">
                  <div className="text-[10.5px] text-amber-800">تملك مهارات N3 (توليف)</div>
                  <div className="text-base font-black font-mono text-amber-900">
                    {adaptiveResult.globalN3MasteryPct}%
                  </div>
                </div>
                <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 text-center">
                  <div className="text-[10.5px] text-rose-800">تلاميذ في حاجة لدعم N1/N2</div>
                  <div className="text-base font-black font-mono text-rose-900">
                    {adaptiveResult.studentsNeedingSupportCount} /{" "}
                    {adaptiveResult.totalStudentsCount}
                  </div>
                </div>
              </div>

              {/* Per-Student Interactive 2D Skill Assessment Grid */}
              <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-300">
                      <th rowSpan={2} className="p-2 text-center border-l border-slate-300 w-9">
                        ر.ت
                      </th>
                      <th rowSpan={2} className="p-2 text-start border-l border-slate-300 min-w-[165px]">
                        التلميذ(ة) ورمز مسار (CNE)
                      </th>
                      <th rowSpan={2} className="p-2 text-center border-l border-slate-300 w-20 bg-slate-50">
                        نقطة الفرض السابق
                      </th>
                      {filteredLessonsForSkillTable.map((lesson) => (
                        <th
                          key={lesson.lessonFr}
                          colSpan={3}
                          className="p-1.5 text-center border-l border-slate-300 bg-indigo-50/60"
                        >
                          <div className="font-black text-indigo-950 text-[11px]">
                            {lesson.lessonAr}
                          </div>
                          <div className="text-[9.5px] font-mono text-slate-500">
                            {lesson.lessonFr}
                          </div>
                        </th>
                      ))}
                      <th rowSpan={2} className="p-2 text-start min-w-[180px]">
                        تشخيص المفتش / الأستاذ(ة)
                      </th>
                    </tr>
                    <tr className="bg-slate-50 text-[10px] font-mono font-bold border-b border-slate-300">
                      {filteredLessonsForSkillTable.map((lesson) => (
                        <React.Fragment key={`${lesson.lessonFr}_sub`}>
                          <th className="p-1 text-center border-l border-slate-200 bg-sky-50 text-sky-900">
                            N1
                          </th>
                          <th className="p-1 text-center border-l border-slate-200 bg-indigo-50 text-indigo-900">
                            N2
                          </th>
                          <th className="p-1 text-center border-l border-slate-300 bg-amber-50 text-amber-900">
                            N3
                          </th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentEvaluations.map((student, sIdx) => {
                      const renderSkillBtn = (
                        lessonFr: string,
                        skillKey: "n1Status" | "n2Status" | "n3Status",
                        status: SkillAcquisitionLevel
                      ) => {
                        const meta = SKILL_ACQUISITION_META[status];
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStudentSkill(student.studentId, lessonFr, skillKey)
                            }
                            className={`w-full px-1.5 py-1 rounded text-[10px] font-black border transition cursor-pointer ${meta.bgClass} ${meta.textClass} ${meta.borderClass} hover:opacity-85`}
                            title={`انقر لتغيير التقييم (${meta.labelAr})`}
                          >
                            {meta.shortAr}
                          </button>
                        );
                      };

                      return (
                        <tr
                          key={student.studentId}
                          className="border-b border-slate-200 hover:bg-slate-50/80 transition"
                        >
                          <td className="p-1.5 text-center font-mono font-bold text-slate-500 border-l border-slate-200">
                            {sIdx + 1}
                          </td>
                          <td className="p-1.5 border-l border-slate-200">
                            <div className="font-black text-slate-900">
                              {student.fullNameAr}
                            </div>
                            <div className="text-[9.5px] font-mono text-slate-500">
                              {student.cne} · {student.fullNameFr}
                            </div>
                          </td>
                          <td className="p-1.5 text-center font-mono font-black border-l border-slate-200 tabular-nums">
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                student.previousExamGrade20 >= 10
                                  ? "bg-emerald-50 text-emerald-800"
                                  : "bg-rose-50 text-rose-800"
                              }`}
                            >
                              {student.previousExamGrade20.toFixed(2)}
                            </span>
                          </td>
                          {filteredLessonsForSkillTable.map((lesson) => {
                            const rec = student.lessonRecords[lesson.lessonFr] || {
                              n1Status: "IN_PROGRESS",
                              n2Status: "IN_PROGRESS",
                              n3Status: "IN_PROGRESS",
                            };
                            return (
                              <React.Fragment key={`${student.studentId}_${lesson.lessonFr}`}>
                                <td className="p-1 border-l border-slate-200 text-center">
                                  {renderSkillBtn(lesson.lessonFr, "n1Status", rec.n1Status)}
                                </td>
                                <td className="p-1 border-l border-slate-200 text-center">
                                  {renderSkillBtn(lesson.lessonFr, "n2Status", rec.n2Status)}
                                </td>
                                <td className="p-1 border-l border-slate-300 text-center">
                                  {renderSkillBtn(lesson.lessonFr, "n3Status", rec.n3Status)}
                                </td>
                              </React.Fragment>
                            );
                          })}
                          <td className="p-1.5 text-[10.5px] text-slate-600">
                            {student.inspectorObservation}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==============================================================
              SUB-TAB 3: AUTOMATIC 2D WEIGHTS RECALIBRATION & N1/N2 REMEDIAL EXERCISES
             ============================================================== */}
          {activeSubTab === "ADAPTIVE_WEIGHTS_ENGINE" && (
            <div className="space-y-3.5">
              {/* Diagnostic & One-Click Action Header */}
              <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-800 shrink-0" />
                    <h5 className="text-xs font-black text-amber-950">
                      خوارزمية التحيين التلقائي لأوزان مصفوفة التخصيص 2D واقتراح التمارين الداعمة (N1/N2)
                    </h5>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyAdaptiveUpdate(false)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-indigo-950 hover:bg-indigo-900 text-cyan-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>تطبيق الأوزان المحينة فقط على المصفوفة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAdaptiveUpdate(true)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-emerald-700 hover:bg-emerald-800 text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>
                        تحديث الأوزان + إدراج التمارين الإضافية المقترحة (N1/N2) في الفرض
                      </span>
                    </button>
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-700 leading-relaxed">
                  {adaptiveResult.inspectorDiagnosticSummaryAr}
                </p>
              </div>

              {/* Adaptive Recommendations & Suggested N1/N2 Exercises Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-300">
                      <th className="p-2 text-start border-l border-slate-300">
                        الدرس / الوحدة الدراسية
                      </th>
                      <th className="p-2 text-center border-l border-slate-300 bg-sky-50/70">
                        تملك N1
                      </th>
                      <th className="p-2 text-center border-l border-slate-300 bg-indigo-50/70">
                        تملك N2
                      </th>
                      <th className="p-2 text-center border-l border-slate-300">
                        الوزن السابق
                      </th>
                      <th className="p-2 text-center border-l border-slate-300 bg-emerald-50/70">
                        الوزن المحيّن تلقائياً
                      </th>
                      <th className="p-2 text-center border-l border-slate-300">
                        أولوية الدعم (N1/N2)
                      </th>
                      <th className="p-2 text-start min-w-[290px]">
                        التمارين الإضافية المقترحة للفرض القادم (N1 / N2)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adaptiveResult.recommendations.map((rec) => (
                      <tr
                        key={rec.lessonFr}
                        className="border-b border-slate-200 hover:bg-slate-50/80 transition"
                      >
                        <td className="p-2 border-l border-slate-200 align-top">
                          <div className="font-black text-slate-950">{rec.lessonAr}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {rec.lessonFr}
                          </div>
                        </td>
                        <td className="p-2 border-l border-slate-200 text-center font-mono font-bold text-sky-900 bg-sky-50/20">
                          <div>{rec.n1MasteryPct}%</div>
                          <div className="text-[9.5px] text-rose-700">
                            ({rec.n1NotAcquiredCount} غير مكتسبة)
                          </div>
                        </td>
                        <td className="p-2 border-l border-slate-200 text-center font-mono font-bold text-indigo-900 bg-indigo-50/20">
                          <div>{rec.n2MasteryPct}%</div>
                          <div className="text-[9.5px] text-rose-700">
                            ({rec.n2NotAcquiredCount} غير مكتسبة)
                          </div>
                        </td>
                        <td className="p-2 border-l border-slate-200 text-center font-mono text-slate-600">
                          {rec.previousWeight}%
                        </td>
                        <td className="p-2 border-l border-slate-200 text-center font-mono font-black bg-emerald-50/30">
                          <span className="text-indigo-950 text-xs">
                            {rec.recommendedWeight}%
                          </span>
                          <span
                            className={`block text-[9.5px] ${
                              rec.weightDelta > 0
                                ? "text-emerald-700"
                                : rec.weightDelta < 0
                                ? "text-amber-700"
                                : "text-slate-500"
                            }`}
                          >
                            ({rec.weightDelta >= 0 ? `+${rec.weightDelta}%` : `${rec.weightDelta}%`})
                          </span>
                        </td>
                        <td className="p-2 border-l border-slate-200 text-center align-middle">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border ${
                              rec.priorityLevel === "CRITICAL_REMEDIATION"
                                ? "bg-rose-100 text-rose-900 border-rose-300"
                                : rec.priorityLevel === "MODERATE_SUPPORT"
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : "bg-emerald-100 text-emerald-900 border-emerald-300"
                            }`}
                          >
                            {rec.priorityLabelAr}
                          </span>
                        </td>
                        <td className="p-2 space-y-1.5">
                          {rec.suggestedExercises.map((ex) => (
                            <div
                              key={ex.id}
                              className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10.5px]"
                            >
                              <div className="flex items-center justify-between gap-1 font-bold text-indigo-950">
                                <span>
                                  [{ex.level} · {ex.points} ن]{" "}
                                  <MathText text={ex.questionAr} inline />
                                </span>
                              </div>
                              <div className="text-[9.5px] text-slate-500 mt-0.5">
                                الهدف: {ex.pedagogicalGoalAr}
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inspector Verdict Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-slate-100 px-3.5 py-2 rounded-xl text-[11px]">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-bold">{spec2D.inspectorVerdictAr}</span>
            </div>
            <span className="font-mono text-[10px] text-cyan-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0">
              Note 142-08 · Cadre Référentiel
            </span>
          </div>
        </div>
      );
    }
  );

SpecMatrix2DInspectorCard.displayName = "SpecMatrix2DInspectorCard";

