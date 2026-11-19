import React, { useMemo, useState } from "react";
import {
  CURRICULUM_DB,
  LessonItem,
  MoroccanDSStructureMode,
} from "../data/curriculum";
import {
  addExerciseAndSyncSpecMatrix,
  autoRebalanceSpecMatrixTo14208,
  buildAutomatedDynamicSpecMatrix,
  buildPrerequisiteDiagnosticBlueprint,
  evaluateDiagnosticMasteryReport,
  exportAutomatedSpecMatrixLatex,
  exportStandaloneDiagnosticQuizHtml,
  PrerequisiteDiagnosticBlueprint,
  removeExerciseAndSyncSpecMatrix,
  updateExerciseAndSyncSpecMatrix,
} from "../utils/diagnosticAndDynamicSpecMatrixEngine";
import { InteractiveQuizData } from "../utils/quizGenerator";

interface DiagnosticAndDynamicSpecMatrixModalProps {
  isOpen: boolean;
  initialTab?: "DIAGNOSTIC_STUDIO" | "DYNAMIC_SPEC_MATRIX";
  trackCode: string;
  examModel: "A" | "B";
  durationAr: string;
  lessons: LessonItem[];
  n1Target: number;
  n2Target: number;
  n3Target: number;
  dsStructureMode: MoroccanDSStructureMode;
  onClose: () => void;
  onSelectTrackCode?: (newTrackCode: string) => void;
  onApplyDiagnosticToA4AndExportPdf: (
    blueprint: PrerequisiteDiagnosticBlueprint,
    triggerPrintPdf: boolean
  ) => void;
  onLaunchInteractiveQuizModal: (quizData: InteractiveQuizData) => void;
  onSyncLessonsAndSpecMatrix: (payload: {
    lessons: LessonItem[];
    n1: number;
    n2: number;
    n3: number;
    summaryMessageAr: string;
    appendSpecMatrixToA4?: boolean;
    triggerPrintPdf?: boolean;
  }) => void;
}

export const DiagnosticAndDynamicSpecMatrixModal: React.FC<
  DiagnosticAndDynamicSpecMatrixModalProps
> = ({
  isOpen,
  initialTab = "DIAGNOSTIC_STUDIO",
  trackCode,
  examModel,
  durationAr,
  lessons,
  n1Target,
  n2Target,
  n3Target,
  dsStructureMode,
  onClose,
  onSelectTrackCode,
  onApplyDiagnosticToA4AndExportPdf,
  onLaunchInteractiveQuizModal,
  onSyncLessonsAndSpecMatrix,
}) => {
  const [activeTab, setActiveTab] = useState<
    "DIAGNOSTIC_STUDIO" | "DYNAMIC_SPEC_MATRIX"
  >(initialTab);

  // ==========================================================================
  // TAB 1 STATE: PREREQUISITE DIAGNOSTIC TEST STUDIO
  // ==========================================================================
  const [diagTrackCode, setDiagTrackCode] = useState<string>(
    trackCode || "2BAC_PC"
  );
  const [diagModel, setDiagModel] = useState<"A" | "B">(examModel || "A");
  const [diagDuration, setDiagDuration] = useState<string>(
    durationAr || "ساعة واحدة (1h00)"
  );
  const [includeQcm, setIncludeQcm] = useState<boolean>(true);
  const [includeOpenExercises, setIncludeOpenExercises] =
    useState<boolean>(true);
  const [includeSynthesisProblem, setIncludeSynthesisProblem] =
    useState<boolean>(true);
  const [customDiagTitleAr, setCustomDiagTitleAr] = useState<string>("");
  const [excludedPrereqIndices, setExcludedPrereqIndices] = useState<number[]>(
    []
  );
  const [simulatedAnswers, setSimulatedAnswers] = useState<
    Record<string, number>
  >({});
  const [showInlineSimulator, setShowInlineSimulator] =
    useState<boolean>(false);

  // ==========================================================================
  // TAB 2 STATE: AUTOMATED DYNAMIC SPECIFICATION MATRIX
  // ==========================================================================
  const [expandedExIndex, setExpandedExIndex] = useState<number | null>(0);
  const [newExTitleAr, setNewExTitleAr] = useState<string>("");
  const [newExDomainAr, setNewExDomainAr] = useState<string>("تحليل");
  const [newExPoints, setNewExPoints] = useState<number>(4);
  const [newExQuestionsText, setNewExQuestionsText] = useState<string>(
    "1. أحسب النهاية وحدد الفرع اللانهائي للمنحنى.\n2. بين الاشتقاق وضع جدول تغيرات الدالة.\n3. استنتج عدد حلول المعادلة f(x) = 0."
  );
  const [selectedCurriculumLessonIdx, setSelectedCurriculumLessonIdx] =
    useState<number>(0);
  const [statusBannerAr, setStatusBannerAr] = useState<string>(
    "جدول المواصفات متصل ديناميكياً بتمارين الفرض المحروس — أي إضافة أو تعديل يُحدّث المصفوفة والورقة A4 فوراً."
  );
  const [copiedLatexNotice, setCopiedLatexNotice] = useState<boolean>(false);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    if (trackCode && CURRICULUM_DB[trackCode]) {
      setDiagTrackCode(trackCode);
      setExcludedPrereqIndices([]);
    }
  }, [trackCode]);

  const activeTrack =
    CURRICULUM_DB[diagTrackCode] || CURRICULUM_DB["2BAC_PC"];

  const selectedPrereqIndices = useMemo(() => {
    const count = (activeTrack.prereqsAr || []).length || 4;
    const all = Array.from({ length: count }, (_, idx) => idx);
    const filtered = all.filter((idx) => !excludedPrereqIndices.includes(idx));
    return filtered.length > 0 ? filtered : [0];
  }, [activeTrack, excludedPrereqIndices]);

  const diagnosticBlueprint = useMemo(() => {
    return buildPrerequisiteDiagnosticBlueprint({
      trackCode: diagTrackCode,
      duration: diagDuration,
      examModel: diagModel,
      selectedPrereqIndices,
      includeQcm,
      includeOpenExercises,
      includeSynthesisProblem,
      customTitleAr: customDiagTitleAr,
    });
  }, [
    diagTrackCode,
    diagDuration,
    diagModel,
    selectedPrereqIndices,
    includeQcm,
    includeOpenExercises,
    includeSynthesisProblem,
    customDiagTitleAr,
  ]);

  const masteryReport = useMemo(() => {
    return evaluateDiagnosticMasteryReport(
      diagnosticBlueprint,
      simulatedAnswers
    );
  }, [diagnosticBlueprint, simulatedAnswers]);

  const dynamicSpecMatrix = useMemo(() => {
    return buildAutomatedDynamicSpecMatrix({
      lessons,
      n1Target,
      n2Target,
      n3Target,
      dsStructureMode,
    });
  }, [lessons, n1Target, n2Target, n3Target, dsStructureMode]);

  const availableCurriculumLessons = useMemo(() => {
    const t = CURRICULUM_DB[trackCode] || CURRICULUM_DB["2BAC_PC"];
    const s1 = Object.values(t.semesters.S1 || {}).flat();
    const s2 = Object.values(t.semesters.S2 || {}).flat();
    return [...s1, ...s2];
  }, [trackCode]);

  if (!isOpen) return null;

  const handleTogglePrereqIndex = (idx: number) => {
    setExcludedPrereqIndices((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      }
      const totalCount = (activeTrack.prereqsAr || []).length || 4;
      if (prev.length >= totalCount - 1) {
        return prev; // Keep at least 1 prerequisite selected
      }
      return [...prev, idx];
    });
  };

  // ==========================================================================
  // DYNAMIC SPEC MATRIX HANDLERS (REAL-TIME MUTATION -> SYNC EXAM & MATRIX)
  // ==========================================================================
  const handleAddCustomExercise = () => {
    const title =
      newExTitleAr.trim() || `تمرين تطبيقي في ${newExDomainAr}`;
    const qLines = newExQuestionsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const res = addExerciseAndSyncSpecMatrix(
      lessons,
      {
        lessonAr: title,
        lessonFr: title,
        domainAr: newExDomainAr,
        targetPoints: newExPoints,
        questionsAr:
          qLines.length > 0
            ? qLines
            : [
                `1. سؤال تطبيقي مباشر (N1) في ${title}.`,
                `2. سؤال استحضار واستدلال (N2) في ${title}.`,
              ],
      },
      { n1Target, n2Target, n3Target, dsStructureMode }
    );

    setStatusBannerAr(res.changeSummaryAr);
    setNewExTitleAr("");
    onSyncLessonsAndSpecMatrix({
      lessons: res.lessons,
      n1: res.effectiveN1,
      n2: res.effectiveN2,
      n3: res.effectiveN3,
      summaryMessageAr: res.changeSummaryAr,
    });
  };

  const handleAddFromCurriculum = () => {
    const picked =
      availableCurriculumLessons[selectedCurriculumLessonIdx] ||
      availableCurriculumLessons[0];
    if (!picked) return;

    const res = addExerciseAndSyncSpecMatrix(
      lessons,
      {
        lessonAr: picked.lessonAr,
        lessonFr: picked.lessonFr,
        domainAr: picked.subCategory || "تحليل",
        targetPoints: 5,
        questionsAr: picked.sampleExerciseAr,
        questionsFr: picked.sampleExerciseFr,
        capacitiesAr: picked.capacitiesAr,
      },
      { n1Target, n2Target, n3Target, dsStructureMode }
    );

    setStatusBannerAr(res.changeSummaryAr);
    onSyncLessonsAndSpecMatrix({
      lessons: res.lessons,
      n1: res.effectiveN1,
      n2: res.effectiveN2,
      n3: res.effectiveN3,
      summaryMessageAr: res.changeSummaryAr,
    });
  };

  const handleUpdateExercisePoints = (exIdx: number, newPoints: number) => {
    const res = updateExerciseAndSyncSpecMatrix(
      lessons,
      exIdx,
      { targetPoints: newPoints },
      { n1Target, n2Target, n3Target, dsStructureMode }
    );
    setStatusBannerAr(res.changeSummaryAr);
    onSyncLessonsAndSpecMatrix({
      lessons: res.lessons,
      n1: res.effectiveN1,
      n2: res.effectiveN2,
      n3: res.effectiveN3,
      summaryMessageAr: res.changeSummaryAr,
    });
  };

  const handleUpdateExerciseTitleOrDomain = (
    exIdx: number,
    patch: { lessonAr?: string; domainAr?: string }
  ) => {
    const res = updateExerciseAndSyncSpecMatrix(lessons, exIdx, patch, {
      n1Target,
      n2Target,
      n3Target,
      dsStructureMode,
    });
    setStatusBannerAr(res.changeSummaryAr);
    onSyncLessonsAndSpecMatrix({
      lessons: res.lessons,
      n1: res.effectiveN1,
      n2: res.effectiveN2,
      n3: res.effectiveN3,
      summaryMessageAr: res.changeSummaryAr,
    });
  };

  const handleUpdateQuestionLevelOrPoints = (
    exIdx: number,
    qIdx: number,
    change: { level?: "N1" | "N2" | "N3"; points?: number; textAr?: string }
  ) => {
    const row = dynamicSpecMatrix.rows[exIdx];
    if (!row) return;

    const currentQuestionsAr = row.questionsBreakdown.map((q) => q.textAr);
    const currentBaremes = row.questionsBreakdown.map((q) => q.points);
    const currentLevels = row.questionsBreakdown.map((q) => q.level);

    if (typeof change.textAr === "string") {
      currentQuestionsAr[qIdx] = change.textAr;
    }
    if (change.level) {
      currentLevels[qIdx] = change.level;
    }
    if (typeof change.points === "number") {
      currentBaremes[qIdx] = Math.max(0.25, change.points);
    }

    const newTotalExPoints =
      typeof change.points === "number"
        ? Number(currentBaremes.reduce((a, b) => a + b, 0).toFixed(2))
        : row.totalPoints;

    const res = updateExerciseAndSyncSpecMatrix(
      lessons,
      exIdx,
      {
        targetPoints: newTotalExPoints,
        questionsAr: currentQuestionsAr,
        questionBaremes: currentBaremes,
        questionLevels: currentLevels,
      },
      { n1Target, n2Target, n3Target, dsStructureMode }
    );

    setStatusBannerAr(res.changeSummaryAr);
    onSyncLessonsAndSpecMatrix({
      lessons: res.lessons,
      n1: res.effectiveN1,
      n2: res.effectiveN2,
      n3: res.effectiveN3,
      summaryMessageAr: res.changeSummaryAr,
    });
  };

  const handleAddQuestionToExercise = (exIdx: number) => {
    const row = dynamicSpecMatrix.rows[exIdx];
    if (!row) return;
    const nextNum = row.questionsBreakdown.length + 1;
    const currentQuestionsAr = [
      ...row.questionsBreakdown.map((q) => q.textAr),
      `${nextNum}. سؤال إضافي في «${row.lessonAr}» لتعميق الفهم والاستدلال.`,
    ];
    const currentLevels: Array<"N1" | "N2" | "N3"> = [
      ...row.questionsBreakdown.map((q) => q.level),
      "N2",
    ];

    const res = updateExerciseAndSyncSpecMatrix(
      lessons,
      exIdx,
      {
        questionsAr: currentQuestionsAr,
        questionLevels: currentLevels,
      },
      { n1Target, n2Target, n3Target, dsStructureMode }
    );
    setStatusBannerAr(res.changeSummaryAr);
    onSyncLessonsAndSpecMatrix({
      lessons: res.lessons,
      n1: res.effectiveN1,
      n2: res.effectiveN2,
      n3: res.effectiveN3,
      summaryMessageAr: res.changeSummaryAr,
    });
  };

  const handleRemoveQuestionFromExercise = (exIdx: number, qIdx: number) => {
    const row = dynamicSpecMatrix.rows[exIdx];
    if (!row || row.questionsBreakdown.length <= 1) return;
    const currentQuestionsAr = row.questionsBreakdown
      .filter((_, i) => i !== qIdx)
      .map((q) => q.textAr);
    const currentLevels = row.questionsBreakdown
      .filter((_, i) => i !== qIdx)
      .map((q) => q.level);

    const res = updateExerciseAndSyncSpecMatrix(
      lessons,
      exIdx,
      {
        questionsAr: currentQuestionsAr,
        questionLevels: currentLevels,
      },
      { n1Target, n2Target, n3Target, dsStructureMode }
    );
    setStatusBannerAr(res.changeSummaryAr);
    onSyncLessonsAndSpecMatrix({
      lessons: res.lessons,
      n1: res.effectiveN1,
      n2: res.effectiveN2,
      n3: res.effectiveN3,
      summaryMessageAr: res.changeSummaryAr,
    });
  };

  const handleRemoveExercise = (exIdx: number) => {
    const res = removeExerciseAndSyncSpecMatrix(lessons, exIdx, {
      n1Target,
      n2Target,
      n3Target,
      dsStructureMode,
    });
    setStatusBannerAr(res.changeSummaryAr);
    onSyncLessonsAndSpecMatrix({
      lessons: res.lessons,
      n1: res.effectiveN1,
      n2: res.effectiveN2,
      n3: res.effectiveN3,
      summaryMessageAr: res.changeSummaryAr,
    });
  };

  const handleAutoRebalance = () => {
    const res = autoRebalanceSpecMatrixTo14208(
      lessons,
      n1Target,
      n2Target,
      n3Target,
      dsStructureMode
    );
    setStatusBannerAr(res.changeSummaryAr);
    onSyncLessonsAndSpecMatrix({
      lessons: res.lessons,
      n1: res.effectiveN1,
      n2: res.effectiveN2,
      n3: res.effectiveN3,
      summaryMessageAr: res.changeSummaryAr,
    });
  };

  const handleCopySpecMatrixLatex = () => {
    const latex = exportAutomatedSpecMatrixLatex(
      dynamicSpecMatrix,
      activeTrack.labelAr,
      `الفرض المحروس — ${activeTrack.labelAr}`
    );
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(latex);
    }
    setCopiedLatexNotice(true);
    setTimeout(() => setCopiedLatexNotice(false), 3000);
  };

  const handleDownloadDiagnosticStandaloneHtml = () => {
    const html = exportStandaloneDiagnosticQuizHtml(diagnosticBlueprint);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Diagnostic_Interactive_QR_${diagnosticBlueprint.trackCode}_${diagnosticBlueprint.examModel}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 md:p-5 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white border-2 border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xl">
              🧭
            </span>
            <div>
              <h2 className="text-base md:text-lg font-black tracking-tight text-white">
                استوديو الروائز التشخيصية التفاعلية (QR + PDF) وأتمتة جدول المواصفات الديناميكي
              </h2>
              <p className="text-xs text-slate-300">
                تشخيص المكتسبات القبلية لكل مستوى دراسي مع تصدير PDF ورمز QR تفاعلي · وتحديث فوري لجدول المواصفات (142-08) عند إضافة أو تعديل أي تمرين
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("DIAGNOSTIC_STUDIO")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === "DIAGNOSTIC_STUDIO"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              🎯 الاختبارات التشخيصية (المكتسبات + PDF + QR)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("DYNAMIC_SPEC_MATRIX")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === "DYNAMIC_SPEC_MATRIX"
                  ? "bg-emerald-400 text-slate-950 shadow-md"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              📊 أتمتة جدول المواصفات الديناميكي ({dynamicSpecMatrix.totals.totalExercises} تمارين)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              ✕ إغلاق
            </button>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-slate-50">
          {activeTab === "DIAGNOSTIC_STUDIO" ? (
            <>
              {/* DIAGNOSTIC STUDIO CONFIGURATION & QR CARD */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Right Column: Grade Level & Prerequisites Selector */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        1. اختيار المستوى الدراسي والمكتسبات القبلية المستهدفة بالتشخيص
                      </h3>
                      <p className="text-xs text-slate-600">
                        المصدر المرجعي للمكتسبات:{" "}
                        <span className="font-bold text-indigo-700">
                          {diagnosticBlueprint.priorGradeLabelAr}
                        </span>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold tabular-nums">
                      {diagnosticBlueprint.selectedPrerequisites.length} مكتسبات · 20/20 ن
                    </span>
                  </div>

                  {/* Controls Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        المستوى والمسلك الدراسي:
                      </label>
                      <select
                        value={diagTrackCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          setDiagTrackCode(code);
                          setExcludedPrereqIndices([]);
                          if (onSelectTrackCode) onSelectTrackCode(code);
                        }}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900"
                      >
                        {Object.values(CURRICULUM_DB).map((t) => (
                          <option key={t.code} value={t.code}>
                            {t.labelAr} ({t.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        مدة الرائز التشخيصي:
                      </label>
                      <select
                        value={diagDuration}
                        onChange={(e) => setDiagDuration(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900"
                      >
                        <option value="ساعة واحدة (1h00)">ساعة واحدة (1h00)</option>
                        <option value="ساعة ونصف (1h30)">ساعة ونصف (1h30)</option>
                        <option value="ساعتان (2h00)">ساعتان (2h00)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        نموذج الرائز (لمنع الغش):
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["A", "B"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setDiagModel(m)}
                            className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                              diagModel === m
                                ? "bg-indigo-900 text-white border-indigo-900"
                                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            النموذج ({m})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Custom Title & Structure Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        عنوان مخصص للرائز التشخيصي (اختياري):
                      </label>
                      <input
                        type="text"
                        value={customDiagTitleAr}
                        onChange={(e) => setCustomDiagTitleAr(e.target.value)}
                        placeholder={diagnosticBlueprint.customTitleAr}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                      />
                    </div>
                    <div className="flex flex-wrap items-end gap-3 pb-1">
                      <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeQcm}
                          onChange={(e) => setIncludeQcm(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span>أسئلة QCM تشخيصية</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeOpenExercises}
                          onChange={(e) =>
                            setIncludeOpenExercises(e.target.checked)
                          }
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span>تمارين تطبيق المكتسبات</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeSynthesisProblem}
                          onChange={(e) =>
                            setIncludeSynthesisProblem(e.target.checked)
                          }
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span>شبكة التشخيص وخطة الدعم</span>
                      </label>
                    </div>
                  </div>

                  {/* Prerequisite Checkboxes List */}
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-black text-slate-800">
                      قائمة المكتسبات القبلية الرسمية للمستوى ({activeTrack.labelAr}):
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {(activeTrack.prereqsAr || []).map((prereqAr, idx) => {
                        const isSelected = !excludedPrereqIndices.includes(idx);
                        const matched =
                          diagnosticBlueprint.selectedPrerequisites.find(
                            (p) => p.index === idx
                          );
                        return (
                          <div
                            key={idx}
                            onClick={() => handleTogglePrereqIndex(idx)}
                            className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between gap-2 ${
                              isSelected
                                ? "bg-indigo-50/70 border-indigo-300 shadow-xs"
                                : "bg-slate-50 border-slate-200 opacity-60"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="mt-1 rounded border-slate-300 text-indigo-600"
                              />
                              <div>
                                <div className="text-xs font-black text-slate-900">
                                  المكتسب القبلي {idx + 1}: {prereqAr}
                                </div>
                                <div
                                  className="text-[11px] text-slate-600 mt-0.5"
                                  dir="ltr"
                                >
                                  {(activeTrack.prereqsFr || [])[idx] || ""}
                                </div>
                              </div>
                            </div>
                            {isSelected && matched && (
                              <span className="px-2 py-0.5 rounded bg-indigo-900 text-white text-[11px] font-bold tabular-nums whitespace-nowrap shrink-0">
                                {matched.targetPoints} ن
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Left Column: Live QR Code Card & Export Actions */}
                <div className="lg:col-span-4 bg-white border-2 border-indigo-900 rounded-2xl p-4 shadow-md flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-indigo-950">
                        📱 رمز QR التفاعلي للرائز التشخيصي
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-bold font-mono">
                        {diagnosticBlueprint.verificationCode}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div
                        className="bg-white p-2 rounded-lg border border-slate-300 shadow-xs"
                        dangerouslySetInnerHTML={{
                          __html: diagnosticBlueprint.interactiveQrSvg,
                        }}
                      />
                      <p className="text-[11px] text-slate-700 font-bold text-center mt-2">
                        يمسح التلميذ رمز QR بهاتفه لإنجاز الرائز التشخيصي تفاعلياً والحصول على تقرير التحكم الفوري
                      </p>
                      <input
                        type="text"
                        readOnly
                        value={diagnosticBlueprint.interactiveQrUrl}
                        dir="ltr"
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-mono text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Direct Actions */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyDiagnosticToA4AndExportPdf(
                          diagnosticBlueprint,
                          true
                        );
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black shadow-sm transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <span>📄 تطبيق في الورقة A4 وتصدير PDF (مع QR)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onApplyDiagnosticToA4AndExportPdf(
                          diagnosticBlueprint,
                          false
                        );
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <span>👁️ معاينة الرائز التشخيصي في الورقة الرسمية A4</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLaunchInteractiveQuizModal(
                          diagnosticBlueprint.interactiveQuizData
                        );
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-sm transition cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <span>📱 تشغيل الرائز التفاعلي عبر QR الآن (واجهة التلميذ)</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setShowInlineSimulator(!showInlineSimulator)
                        }
                        className="py-2 px-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[11px] font-bold transition cursor-pointer whitespace-nowrap"
                      >
                        🧪 محاكاة التشخيص
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadDiagnosticStandaloneHtml}
                        className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 text-[11px] font-bold transition cursor-pointer whitespace-nowrap"
                      >
                        ⬇️ تصدير HTML5
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* OPTIONAL INLINE INTERACTIVE DIAGNOSTIC SIMULATOR & REMEDIATION REPORT */}
              {showInlineSimulator && (
                <div className="bg-amber-50/70 border-2 border-amber-400 rounded-2xl p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                    <div>
                      <h4 className="text-sm font-black text-amber-950">
                        🧪 محاكي التصحيح التشخيصي الفوري وتقرير التحكم في المكتسبات القبلية
                      </h4>
                      <p className="text-xs text-amber-900">
                        جرّب الإجابة عن أسئلة المكتسبات القبلية لمعاينة كيف يصنف النظام مستوى التحكم ويقترح خطة الدعم الفردية:
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-amber-900 text-white text-xs font-black tabular-nums">
                        النتيجة: {masteryReport.totalEarned} /{" "}
                        {masteryReport.totalMax} ن ({masteryReport.overallPercent}
                        %)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const allCorrect: Record<string, number> = {};
                          diagnosticBlueprint.interactiveQuizData.questions.forEach(
                            (q) => {
                              const correctIdx = q.choices.findIndex(
                                (c) => c.isCorrect
                              );
                              allCorrect[q.id] =
                                correctIdx >= 0 ? correctIdx : 0;
                            }
                          );
                          setSimulatedAnswers(allCorrect);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        ✓ ملء إجابات نموذجية
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {diagnosticBlueprint.interactiveQuizData.questions.map(
                      (q, qIdx) => (
                        <div
                          key={q.id}
                          className="bg-white border border-amber-200 rounded-xl p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>
                              سؤال {qIdx + 1}: {q.exerciseTitleAr}
                            </span>
                            <span className="tabular-nums text-indigo-800">
                              {q.points} ن
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900">
                            {q.questionPromptAr}
                          </div>
                          <div className="space-y-1">
                            {q.choices.map((choice, oIdx) => {
                              const selected = simulatedAnswers[q.id] === oIdx;
                              const isCorrect = choice.isCorrect;
                              return (
                                <button
                                  key={choice.id}
                                  type="button"
                                  onClick={() =>
                                    setSimulatedAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: oIdx,
                                    }))
                                  }
                                  className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs border transition cursor-pointer flex items-center justify-between ${
                                    selected
                                      ? isCorrect
                                        ? "bg-emerald-100 border-emerald-500 text-emerald-950 font-bold"
                                        : "bg-rose-100 border-rose-500 text-rose-950 font-bold"
                                      : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                                  }`}
                                >
                                  <span>
                                    {choice.code}) {choice.labelAr}
                                  </span>
                                  {selected && (
                                    <span>{isCorrect ? "✓ صحيح" : "✗ خطأ"}</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Mastery & Remediation Matrix */}
                  <div className="bg-white border border-amber-300 rounded-xl p-3">
                    <div className="text-xs font-black text-slate-900 mb-2">
                      📊 بطاقة تشخيص التحكم الفردي وخطة الدعم الوقائي ({masteryReport.overallStatusAr}):
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                            <th className="p-2 text-right">المكتسب القبلي</th>
                            <th className="p-2 text-center">المجال</th>
                            <th className="p-2 text-center">النقط</th>
                            <th className="p-2 text-center">نسبة التحكم</th>
                            <th className="p-2 text-center">التشخيص</th>
                            <th className="p-2 text-right">خطة الدعم والتقوية الموصى بها</th>
                          </tr>
                        </thead>
                        <tbody>
                          {masteryReport.rows.map((r) => (
                            <tr
                              key={r.prereqId}
                              className="border-b border-slate-200"
                            >
                              <td className="p-2 font-bold text-slate-900">
                                {r.titleAr}
                              </td>
                              <td className="p-2 text-center text-slate-700">
                                {r.domainAr}
                              </td>
                              <td className="p-2 text-center font-bold tabular-nums">
                                {r.earnedPoints} / {r.maxPoints}
                              </td>
                              <td className="p-2 text-center font-black tabular-nums">
                                {r.masteryPercent}%
                              </td>
                              <td className="p-2 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    r.status === "MASTERED"
                                      ? "bg-emerald-100 text-emerald-900"
                                      : r.status === "PARTIAL"
                                      ? "bg-amber-100 text-amber-900"
                                      : "bg-rose-100 text-rose-900"
                                  }`}
                                >
                                  {r.statusLabelAr}
                                </span>
                              </td>
                              <td className="p-2 text-slate-700">
                                {r.remediationPlanAr}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PREVIEW OF GENERATED DIAGNOSTIC EXERCISES & COMPETENCY GRID */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-black text-slate-900">
                    2. معاينة بنية الرائز التشخيصي وشبكة المكتسبات القبلية (20/20 ن)
                  </h4>
                  <span className="text-xs font-bold text-slate-600">
                    {diagnosticBlueprint.customTitleAr}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {diagnosticBlueprint.selectedPrerequisites.map((p, idx) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-indigo-950">
                          المكتسب {idx + 1}: {p.titleAr}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 text-xs font-black tabular-nums">
                          {p.targetPoints} ن
                        </span>
                      </div>
                      {includeQcm && (
                        <div className="text-xs bg-white border border-slate-200 rounded-lg p-2">
                          <span className="font-bold text-indigo-800">
                            • سؤال QCM ({p.qcmItem.points} ن):{" "}
                          </span>
                          <span className="text-slate-800">
                            {p.qcmItem.statementAr}
                          </span>
                        </div>
                      )}
                      {includeOpenExercises && (
                        <div className="text-xs bg-white border border-slate-200 rounded-lg p-2 space-y-1">
                          <div className="font-bold text-emerald-800">
                            • تمرين التشخيص التطبيقي (
                            {p.openExercise.questionPoints
                              .reduce((a, b) => a + b, 0)
                              .toFixed(2)
                              .replace(/\.00$/, "")}{" "}
                            ن):
                          </div>
                          {p.openExercise.questionsAr.map((q, qIdx) => (
                            <div key={qIdx} className="text-slate-700">
                              {q}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                        <span className="font-bold">خطة الدعم الفردي: </span>
                        {p.openExercise.remediationAr}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ================================================================
               TAB 2: AUTOMATED DYNAMIC SPECIFICATION MATRIX (SPEC MATRIX)
               ================================================================ */
            <div className="space-y-4">
              {/* STATUS & QUICK ACTIONS BAR */}
              <div className="bg-emerald-950 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 text-xs font-black">
                      تزامن ديناميكي حي (Real-Time Sync)
                    </span>
                    <span className="text-xs font-bold text-emerald-200">
                      مؤشر المطابقة مع المذكرة 142-08:{" "}
                      <strong className="text-white tabular-nums">
                        {dynamicSpecMatrix.conformity14208.score}%
                      </strong>{" "}
                      ({dynamicSpecMatrix.conformity14208.statusAr})
                    </span>
                  </div>
                  <p className="text-xs text-slate-200">{statusBannerAr}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoRebalance}
                    className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    ⚖️ موازنة آلية فورية لجدول المواصفات (20/20 ن)
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySpecMatrixLatex}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {copiedLatexNotice
                      ? "✓ تم نسخ جدول LaTeX"
                      : "📋 نسخ جدول المواصفات LaTeX"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSyncLessonsAndSpecMatrix({
                        lessons,
                        n1: dynamicSpecMatrix.totals.n1Percent,
                        n2: dynamicSpecMatrix.totals.n2Percent,
                        n3: dynamicSpecMatrix.totals.n3Percent,
                        summaryMessageAr:
                          "تم إرفاق جدول المواصفات الديناميكي بالورقة الرسمية A4 وتحديث معاينة PDF.",
                        appendSpecMatrixToA4: true,
                        triggerPrintPdf: true,
                      });
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    📄 إرفاق الجدول بالورقة A4 وتصدير PDF
                  </button>
                </div>
              </div>

              {/* LIVE 2D SPECIFICATION MATRIX TABLE */}
              <div className="bg-white border-2 border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      1. جدول المواصفات الديناميكي المؤتمت للفرض المحروس (يتحدث تلقائياً مع كل تعديل)
                    </h3>
                    <p className="text-xs text-slate-600">
                      يوضح توزيع التمارين، المجالات، الأسئلة، المستويات المعرفية (N1 / N2 / N3)، النقط (/20)، والزمن المقدر
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold tabular-nums">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900">
                      N1: {dynamicSpecMatrix.totals.n1Points} ن (
                      {dynamicSpecMatrix.totals.n1Percent}%)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-900">
                      N2: {dynamicSpecMatrix.totals.n2Points} ن (
                      {dynamicSpecMatrix.totals.n2Percent}%)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900">
                      N3: {dynamicSpecMatrix.totals.n3Points} ن (
                      {dynamicSpecMatrix.totals.n3Percent}%)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-black">
                      المجموع: {dynamicSpecMatrix.totals.grandTotalPoints} / 20 ن
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-2.5 text-right border border-slate-700">
                          التمرين والدرس المقرر
                        </th>
                        <th className="p-2.5 text-center border border-slate-700">
                          المجال
                        </th>
                        <th className="p-2.5 text-center border border-slate-700">
                          عدد الأسئلة
                        </th>
                        <th className="p-2.5 text-center border border-slate-700 bg-sky-950">
                          تطبيق مباشر (N1)
                        </th>
                        <th className="p-2.5 text-center border border-slate-700 bg-indigo-950">
                          استحضار (N2)
                        </th>
                        <th className="p-2.5 text-center border border-slate-700 bg-purple-950">
                          توليف وبرهان (N3)
                        </th>
                        <th className="p-2.5 text-center border border-slate-700">
                          النقط (/20)
                        </th>
                        <th className="p-2.5 text-center border border-slate-700">
                          الوزن %
                        </th>
                        <th className="p-2.5 text-center border border-slate-700">
                          الزمن
                        </th>
                        <th className="p-2.5 text-center border border-slate-700">
                          تحكم مباشر
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dynamicSpecMatrix.rows.map((row) => (
                        <tr
                          key={row.exerciseIndex}
                          className="border-b border-slate-200 hover:bg-slate-50"
                        >
                          <td className="p-2.5 font-bold text-slate-900 border border-slate-200">
                            التمرين {row.exerciseNumber}: {row.lessonAr}
                          </td>
                          <td className="p-2.5 text-center text-slate-700 border border-slate-200">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-bold">
                              {row.domainAr}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-black tabular-nums border border-slate-200">
                            {row.questionCount}
                          </td>
                          <td className="p-2.5 text-center tabular-nums border border-slate-200 bg-sky-50/50">
                            <span className="font-bold text-sky-900">
                              {row.n1Points} ن
                            </span>{" "}
                            <span className="text-slate-500">
                              ({row.n1Count} س)
                            </span>
                          </td>
                          <td className="p-2.5 text-center tabular-nums border border-slate-200 bg-indigo-50/50">
                            <span className="font-bold text-indigo-900">
                              {row.n2Points} ن
                            </span>{" "}
                            <span className="text-slate-500">
                              ({row.n2Count} س)
                            </span>
                          </td>
                          <td className="p-2.5 text-center tabular-nums border border-slate-200 bg-purple-50/50">
                            <span className="font-bold text-purple-900">
                              {row.n3Points} ن
                            </span>{" "}
                            <span className="text-slate-500">
                              ({row.n3Count} س)
                            </span>
                          </td>
                          <td className="p-2.5 text-center border border-slate-200">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateExercisePoints(
                                    row.exerciseIndex,
                                    Math.max(1, row.totalPoints - 0.5)
                                  )
                                }
                                className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-black text-slate-800 cursor-pointer"
                                title="إنقاص 0.5 نقطة"
                              >
                                -
                              </button>
                              <span className="px-2 py-0.5 rounded bg-indigo-950 text-white font-black tabular-nums">
                                {row.totalPoints} ن
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateExercisePoints(
                                    row.exerciseIndex,
                                    Math.min(16, row.totalPoints + 0.5)
                                  )
                                }
                                className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-black text-slate-800 cursor-pointer"
                                title="إضافة 0.5 نقطة"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-2.5 text-center font-bold tabular-nums border border-slate-200">
                            {row.weightPercent}%
                          </td>
                          <td className="p-2.5 text-center tabular-nums text-slate-700 border border-slate-200">
                            {row.estimatedMinutes} د
                          </td>
                          <td className="p-2.5 text-center border border-slate-200">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedExIndex(
                                    expandedExIndex === row.exerciseIndex
                                      ? null
                                      : row.exerciseIndex
                                  )
                                }
                                className="px-2 py-1 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-950 font-bold text-[11px] cursor-pointer whitespace-nowrap"
                              >
                                ✏️ تعديل الأسئلة
                              </button>
                              {dynamicSpecMatrix.rows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveExercise(row.exerciseIndex)
                                  }
                                  className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-[11px] cursor-pointer"
                                  title="حذف التمرين وإعادة توزيع النقط"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-900 text-white font-black">
                        <td className="p-2.5 border border-slate-700">
                          المجموع العام للفرض المحروس ({dynamicSpecMatrix.totals.totalExercises}{" "}
                          تمارين)
                        </td>
                        <td className="p-2.5 text-center border border-slate-700">
                          {dynamicSpecMatrix.domainSummary.length} مجالات
                        </td>
                        <td className="p-2.5 text-center tabular-nums border border-slate-700">
                          {dynamicSpecMatrix.totals.totalQuestions} سؤالاً
                        </td>
                        <td className="p-2.5 text-center tabular-nums border border-slate-700 bg-sky-950">
                          {dynamicSpecMatrix.totals.n1Points} ن (
                          {dynamicSpecMatrix.totals.n1Percent}%)
                        </td>
                        <td className="p-2.5 text-center tabular-nums border border-slate-700 bg-indigo-950">
                          {dynamicSpecMatrix.totals.n2Points} ن (
                          {dynamicSpecMatrix.totals.n2Percent}%)
                        </td>
                        <td className="p-2.5 text-center tabular-nums border border-slate-700 bg-purple-950">
                          {dynamicSpecMatrix.totals.n3Points} ن (
                          {dynamicSpecMatrix.totals.n3Percent}%)
                        </td>
                        <td className="p-2.5 text-center tabular-nums border border-slate-700 text-amber-300">
                          {dynamicSpecMatrix.totals.grandTotalPoints} / 20 ن
                        </td>
                        <td className="p-2.5 text-center tabular-nums border border-slate-700">
                          100%
                        </td>
                        <td className="p-2.5 text-center tabular-nums border border-slate-700">
                          {dynamicSpecMatrix.totals.totalEstimatedMinutes} د
                        </td>
                        <td className="p-2.5 text-center border border-slate-700">
                          مطابق 142-08
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* INLINE EXERCISE & QUESTION EDITOR (UPDATES SPEC MATRIX ON EVERY KEYSTROKE / CLICK) */}
              {expandedExIndex !== null &&
                dynamicSpecMatrix.rows[expandedExIndex] && (
                  <div className="bg-indigo-50/70 border-2 border-indigo-400 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-2">
                      <div>
                        <h4 className="text-sm font-black text-indigo-950">
                          ✏️ محرر التمرين رقم {expandedExIndex + 1} وأسئلته (تحديث فوري لجدول المواصفات)
                        </h4>
                        <p className="text-xs text-indigo-900">
                          غيّر عنوان التمرين، مجاله، سلم كل سؤال، أو مستواه المعرفي (N1 / N2 / N3) ولاحظ التحديث اللحظي في الجدول أعلاه:
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddQuestionToExercise(expandedExIndex)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                      >
                        + إضافة سؤال جديد لهذا التمرين
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          عنوان التمرين / الدرس:
                        </label>
                        <input
                          type="text"
                          value={
                            dynamicSpecMatrix.rows[expandedExIndex].lessonAr
                          }
                          onChange={(e) =>
                            handleUpdateExerciseTitleOrDomain(expandedExIndex, {
                              lessonAr: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-indigo-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          المجال الرياضي:
                        </label>
                        <select
                          value={
                            dynamicSpecMatrix.rows[expandedExIndex].domainAr
                          }
                          onChange={(e) =>
                            handleUpdateExerciseTitleOrDomain(expandedExIndex, {
                              domainAr: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-indigo-300 bg-white px-3 py-2 text-xs font-bold text-slate-900"
                        >
                          <option value="تحليل">تحليل (Analyse)</option>
                          <option value="جبر">جبر (Algèbre)</option>
                          <option value="هندسة فضائية">
                            هندسة فضائية (Géométrie 3D)
                          </option>
                          <option value="هندسة مستوية">
                            هندسة مستوية (Géométrie plane)
                          </option>
                          <option value="أعداد عقدية">
                            أعداد عقدية (Nombres complexes)
                          </option>
                          <option value="احتمالات وإحصاء">
                            احتمالات وإحصاء (Probabilités)
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Questions list */}
                    <div className="space-y-2">
                      {dynamicSpecMatrix.rows[
                        expandedExIndex
                      ].questionsBreakdown.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="bg-white border border-indigo-200 rounded-xl p-2.5 flex flex-wrap md:flex-nowrap items-center gap-2"
                        >
                          <span className="px-2 py-1 rounded bg-slate-900 text-white text-xs font-black tabular-nums shrink-0">
                            س {q.questionIndex}
                          </span>
                          <input
                            type="text"
                            value={q.textAr}
                            onChange={(e) =>
                              handleUpdateQuestionLevelOrPoints(
                                expandedExIndex,
                                qIdx,
                                { textAr: e.target.value }
                              )
                            }
                            className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                          />
                          {/* Cognitive Level Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {(["N1", "N2", "N3"] as const).map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() =>
                                  handleUpdateQuestionLevelOrPoints(
                                    expandedExIndex,
                                    qIdx,
                                    { level: lvl }
                                  )
                                }
                                className={`px-2 py-1 rounded text-xs font-black transition cursor-pointer ${
                                  q.level === lvl
                                    ? lvl === "N1"
                                      ? "bg-sky-700 text-white"
                                      : lvl === "N2"
                                      ? "bg-indigo-700 text-white"
                                      : "bg-purple-700 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                          {/* Question Points */}
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="number"
                              step="0.25"
                              min="0.25"
                              max="10"
                              value={q.points}
                              onChange={(e) =>
                                handleUpdateQuestionLevelOrPoints(
                                  expandedExIndex,
                                  qIdx,
                                  {
                                    points:
                                      parseFloat(e.target.value) || q.points,
                                  }
                                )
                              }
                              className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-xs font-black text-center tabular-nums"
                            />
                            <span className="text-xs font-bold text-slate-600">
                              ن
                            </span>
                          </div>
                          {dynamicSpecMatrix.rows[expandedExIndex]
                            .questionsBreakdown.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveQuestionFromExercise(
                                  expandedExIndex,
                                  qIdx
                                )
                              }
                              className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold cursor-pointer shrink-0"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* ADD NEW EXERCISE PANEL (FROM CURRICULUM OR CUSTOM) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Add from Curriculum */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <h4 className="text-sm font-black text-slate-900">
                    ➕ إضافة تمرين جديد من المقرر الرسمي للمسلك (مع تحديث جدول المواصفات)
                  </h4>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <select
                      value={selectedCurriculumLessonIdx}
                      onChange={(e) =>
                        setSelectedCurriculumLessonIdx(Number(e.target.value))
                      }
                      className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      {availableCurriculumLessons.map((l, idx) => (
                        <option key={idx} value={idx}>
                          {l.lessonAr} ({l.subCategory || "تحليل"})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddFromCurriculum}
                      className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      + إدراج التمرين وتحديث المصفوفة
                    </button>
                  </div>
                </div>

                {/* Add Custom Exercise */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <h4 className="text-sm font-black text-slate-900">
                    ✍️ إنشاء تمرين مخصص جديد وإدراجه ديناميكياً في جدول المواصفات
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newExTitleAr}
                      onChange={(e) => setNewExTitleAr(e.target.value)}
                      placeholder="عنوان التمرين (مثلاً: دراسة دالة لوغاريتمية)"
                      className="sm:col-span-2 rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                    />
                    <div className="flex items-center gap-1">
                      <select
                        value={newExDomainAr}
                        onChange={(e) => setNewExDomainAr(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-300 px-2 py-1.5 text-xs font-bold text-slate-900"
                      >
                        <option value="تحليل">تحليل</option>
                        <option value="جبر">جبر</option>
                        <option value="هندسة فضائية">هندسة فضائية</option>
                        <option value="أعداد عقدية">أعداد عقدية</option>
                        <option value="احتمالات وإحصاء">احتمالات</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        max="14"
                        step="0.5"
                        value={newExPoints}
                        onChange={(e) =>
                          setNewExPoints(parseFloat(e.target.value) || 4)
                        }
                        className="w-14 rounded-xl border border-slate-300 px-2 py-1.5 text-xs font-black text-center tabular-nums"
                        title="النقط"
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <textarea
                      rows={2}
                      value={newExQuestionsText}
                      onChange={(e) => setNewExQuestionsText(e.target.value)}
                      placeholder="أسئلة التمرين (سؤال في كل سطر)..."
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomExercise}
                      className="px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      + إضافة للفرض
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
