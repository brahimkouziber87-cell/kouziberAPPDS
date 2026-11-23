import React, { useMemo, useState, useEffect } from "react";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  Copy,
  FileCheck2,
  FileSpreadsheet,
  Layers,
  Printer,
  QrCode,
  Scale,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import {
  LessonItem,
  MoroccanDSStructureMode,
  ModuleType,
  SemesterType,
} from "../data/curriculum";
import {
  buildOfficialMoroccanProfessorPortfolio,
  computeNote14208SemesterAverage,
  getOfficialNote14208TrackStandards,
  MoroccanPortfolioDocItem,
  runDeepPedagogical14208Audit,
} from "../utils/moroccanPedagogicalPortfolio14208Engine";
import { autoRebalanceSpecMatrixTo14208 } from "../utils/diagnosticAndDynamicSpecMatrixEngine";

interface MoroccanPedagogicalPortfolio14208ModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackCode: string;
  semester: SemesterType;
  dsKey: string;
  academicYear: string;
  teacherName: string;
  schoolName: string;
  activeModule: ModuleType;
  selectedLessons: LessonItem[];
  n1: number;
  n2: number;
  n3: number;
  dsStructureMode: MoroccanDSStructureMode;
  includeDetailedSolutions: boolean;
  include2DSpecMatrix: boolean;
  includePostExamRemediationSheet: boolean;
  showQuestionBareme: boolean;
  examModel: "A" | "B" | "BOTH";
  subQuestionDecompositionMode?: string;
  onApplyDeepPedagogicalFix: (params: {
    lessons: LessonItem[];
    n1: number;
    n2: number;
    n3: number;
    includeDetailedSolutions: boolean;
    include2DSpecMatrix: boolean;
    includePostExamRemediationSheet: boolean;
    showQuestionBareme: boolean;
  }) => void;
  onApplyPortfolioDocument: (doc: MoroccanPortfolioDocItem) => void;
  onExportCurrentDocumentPdf: () => void;
  onOpenDiagnosticModal: () => void;
  onOpenDynamicSpecMatrixModal: () => void;
}

export const MoroccanPedagogicalPortfolio14208Modal: React.FC<
  MoroccanPedagogicalPortfolio14208ModalProps
> = ({
  isOpen,
  onClose,
  trackCode,
  semester,
  dsKey,
  academicYear,
  teacherName,
  schoolName,
  activeModule,
  selectedLessons,
  n1,
  n2,
  n3,
  dsStructureMode,
  includeDetailedSolutions,
  include2DSpecMatrix,
  includePostExamRemediationSheet,
  showQuestionBareme,
  examModel,
  subQuestionDecompositionMode,
  onApplyDeepPedagogicalFix,
  onApplyPortfolioDocument,
  onExportCurrentDocumentPdf,
  onOpenDiagnosticModal,
  onOpenDynamicSpecMatrixModal,
}) => {
  const [activeTab, setActiveTab] = useState<
    "DEEP_AUDIT_142_08" | "PORTFOLIO_7_DOCS" | "CAHIER_TEXTES_PV"
  >("DEEP_AUDIT_142_08");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const trackStandard = useMemo(
    () => getOfficialNote14208TrackStandards(trackCode),
    [trackCode]
  );

  // حاسبة المراقبة المستمرة التفاعلية (75% فروض محروسة + 25% أنشطة مدمجة)
  const [sampleDsGrades, setSampleDsGrades] = useState<number[]>(() =>
    Array.from({ length: trackStandard.dsCountPerSemester }, (_, i) =>
      i === 0 ? 13.5 : i === 1 ? 14.25 : 15
    )
  );
  const [sampleActivitiesGrade, setSampleActivitiesGrade] =
    useState<number>(16);

  useEffect(() => {
    setSampleDsGrades((prev) =>
      Array.from({ length: trackStandard.dsCountPerSemester }, (_, i) =>
        typeof prev[i] === "number" ? prev[i] : 14
      )
    );
  }, [trackStandard.dsCountPerSemester]);

  const continuousAssessmentCalc = useMemo(
    () =>
      computeNote14208SemesterAverage(sampleDsGrades, sampleActivitiesGrade),
    [sampleDsGrades, sampleActivitiesGrade]
  );

  const auditReport = useMemo(
    () =>
      runDeepPedagogical14208Audit({
        trackCode,
        semester,
        dsKey,
        lessons: selectedLessons,
        n1,
        n2,
        n3,
        dsStructureMode,
        includeDetailedSolutions,
        include2DSpecMatrix,
        includePostExamRemediationSheet,
        showQuestionBareme,
        examModel,
        subQuestionDecompositionMode,
      }),
    [
      trackCode,
      semester,
      dsKey,
      selectedLessons,
      n1,
      n2,
      n3,
      dsStructureMode,
      includeDetailedSolutions,
      include2DSpecMatrix,
      includePostExamRemediationSheet,
      showQuestionBareme,
      examModel,
      subQuestionDecompositionMode,
    ]
  );

  const portfolioDocs = useMemo(
    () =>
      buildOfficialMoroccanProfessorPortfolio({
        trackCode,
        semester,
        dsKey,
        lessons: selectedLessons,
        school: schoolName,
        prof: teacherName,
        year: academicYear,
      }),
    [
      trackCode,
      semester,
      dsKey,
      selectedLessons,
      schoolName,
      teacherName,
      academicYear,
    ]
  );

  if (!isOpen) return null;

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleOneClickAutoFix14208 = () => {
    const rebalanced = autoRebalanceSpecMatrixTo14208(
      selectedLessons,
      trackStandard.recommendedN1,
      trackStandard.recommendedN2,
      trackStandard.recommendedN3
    );
    onApplyDeepPedagogicalFix({
      lessons: rebalanced.lessons,
      n1: trackStandard.recommendedN1,
      n2: trackStandard.recommendedN2,
      n3: trackStandard.recommendedN3,
      includeDetailedSolutions: true,
      include2DSpecMatrix: true,
      includePostExamRemediationSheet: true,
      showQuestionBareme: true,
    });
    setStatusMessage(
      `تم ضبط وموازنة الوثيقة وفق المذكرة 142-08 والتوجيهات 2007 (${trackStandard.officialDurationAr} · 20.00/20 ن · مطابقة 10/10)`
    );
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleApplyDoc = (
    doc: MoroccanPortfolioDocItem,
    triggerPdf = false
  ) => {
    onApplyPortfolioDocument(doc);
    setStatusMessage(`تم تفعيل وثيقة «${doc.titleAr}» في ورقة المعاينة A4 بنجاح`);
    setTimeout(() => setStatusMessage(null), 3500);
    if (triggerPdf) {
      setTimeout(() => {
        onExportCurrentDocumentPdf();
      }, 220);
    }
  };

  const cahierTextString = [
    `■ ${auditReport.cahierDeTextesDraftEntry.sessionTitleAr}`,
    `• المرجع الرسمي: ${trackStandard.officialNoteCitationAr}`,
    `• الأهداف البيداغوجية: ${auditReport.cahierDeTextesDraftEntry.pedagogicalObjectivesAr}`,
    `• القدرات المستهدفة (OP 2007):`,
    ...auditReport.cahierDeTextesDraftEntry.targetedCapacitiesAr.map(
      (c) => `  - ${c}`
    ),
    `• توزيع سلم التنقيط (20/20 ن): ${auditReport.cahierDeTextesDraftEntry.baremeSummaryAr}`,
    `• بروتوكول الاستثمار والمعالجة البعدية: ${auditReport.cahierDeTextesDraftEntry.remediationProtocolAr}`,
  ].join("\n");

  const passCount = auditReport.compliantCount;
  const tuneCount =
    auditReport.totalCriteriaCount - auditReport.compliantCount;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="المرصد البيداغوجي للمذكرة 142-08 وحقيبة الأستاذ الرسمية"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900">
        {/* Top Academic Header */}
        <div className="px-5 py-4 bg-slate-900 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  المرصد البيداغوجي للمذكرة 142-08 وحقيبة الأستاذ الرسمية
                </h2>
                <span className="font-mono tabular-nums text-xs font-black text-emerald-300">
                  مطابقة {auditReport.overallScorePercent}%
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                {trackStandard.trackLabelAr} ({trackStandard.trackCode}) ·{" "}
                {semester === "S1" ? "الأسدس الأول" : "الأسدس الثاني"} · الفرض{" "}
                {dsKey} · المعامل{" "}
                <strong className="font-mono tabular-nums text-amber-300">
                  {trackStandard.officialCoefficient}
                </strong>{" "}
                ·{" "}
                <strong className="font-mono tabular-nums text-amber-300">
                  {trackStandard.dsCountPerSemester} فروض/أسدس
                </strong>{" "}
                · {trackStandard.officialDurationAr} · {trackStandard.weeklyHours}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOneClickAutoFix14208}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
              title="ضبط تلقائي لسلم التنقيط 20/20 بخطوة 0.25 ن وتصحيح نسب المهارات N1/N2/N3 وإرفاق جدول التخصيص وعناصر الإجابة"
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span>تصحيح وموازنة شاملة 142-08 (10/10)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Feedback Banner */}
        {statusMessage && (
          <div className="px-5 py-2.5 bg-emerald-50 text-emerald-950 border-b border-emerald-200 text-xs font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 whitespace-nowrap shrink-0">
              NOTE 142-08 · OP 2007
            </span>
          </div>
        )}

        {/* Navigation Tabs & Live Metrics Strip */}
        <div className="px-5 pt-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5">
            <button
              type="button"
              onClick={() => setActiveTab("DEEP_AUDIT_142_08")}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "DEEP_AUDIT_142_08"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-200/70"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>شبكة فحص المفتش التربوي (10 معايير)</span>
              <span
                className={`font-mono tabular-nums text-[11px] ${
                  activeTab === "DEEP_AUDIT_142_08"
                    ? "text-emerald-300"
                    : "text-emerald-700"
                }`}
              >
                {passCount}/{auditReport.totalCriteriaCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PORTFOLIO_7_DOCS")}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "PORTFOLIO_7_DOCS"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-200/70"
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>حقيبة الأستاذ الرسمية (7 وثائق)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CAHIER_TEXTES_PV")}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "CAHIER_TEXTES_PV"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-200/70"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>دفتر النصوص · حاسبة 75%/25% · التوجيهات 2007</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2.5 text-xs text-slate-600 font-mono tabular-nums">
            <span>
              المجموع{" "}
              <strong className="text-slate-950">
                {auditReport.specMatrix.totals.grandTotalPoints.toFixed(2)}/20
              </strong>
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span>
              N1{" "}
              <strong className="text-slate-900">
                {auditReport.specMatrix.totals.n1Percent}%
              </strong>{" "}
              ({trackStandard.recommendedN1}%)
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span>
              N2{" "}
              <strong className="text-slate-900">
                {auditReport.specMatrix.totals.n2Percent}%
              </strong>{" "}
              ({trackStandard.recommendedN2}%)
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span>
              N3{" "}
              <strong className="text-slate-900">
                {auditReport.specMatrix.totals.n3Percent}%
              </strong>{" "}
              ({trackStandard.recommendedN3}%)
            </span>
          </div>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
          {activeTab === "DEEP_AUDIT_142_08" && (
            <>
              {/* Official Track Normative Strip */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="text-xs font-black text-slate-900">
                    {auditReport.verdictTitleAr}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {auditReport.verdictSummaryAr}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {trackStandard.officialNoteCitationAr} ·{" "}
                    {trackStandard.continuousAssessmentSplitAr}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDynamicSpecMatrixModal();
                    }}
                    className="px-3 py-2 rounded-xl bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>جدول المواصفات الديناميكي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDiagnosticModal();
                    }}
                    className="px-3 py-2 rounded-xl bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                    <span>الروائز التشخيصية QR</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500">
                      مؤشر المطابقة البيداغوجية العام
                    </div>
                    <div className="text-xl font-black font-mono tabular-nums text-slate-950 mt-0.5">
                      {auditReport.overallScorePercent}%
                    </div>
                  </div>
                  <Award
                    className={`w-6 h-6 ${
                      auditReport.overallScorePercent >= 90
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-emerald-800">
                      معايير مستوفاة بالكامل (142-08 & OP 2007)
                    </div>
                    <div className="text-xl font-black font-mono tabular-nums text-emerald-950 mt-0.5">
                      {passCount} / {auditReport.totalCriteriaCount}
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-amber-800">
                      معايير قابلة للضبط التلقائي الفوري
                    </div>
                    <div className="text-xl font-black font-mono tabular-nums text-amber-950 mt-0.5">
                      {tuneCount}
                    </div>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
              </div>

              {/* 10 Criteria Detailed Audit Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {auditReport.criteria.map((c) => {
                  const isPass = c.status === "COMPLIANT";
                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isPass
                          ? "border-slate-200 bg-white"
                          : "border-amber-300 bg-amber-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-mono tabular-nums text-xs font-black flex items-center justify-center shrink-0">
                            {c.orderNumber}
                          </span>
                          <div>
                            <h4 className="text-xs font-black text-slate-950">
                              {c.titleAr}
                            </h4>
                            <span className="text-[10.5px] font-medium text-slate-500">
                              {c.referenceSourceAr}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-black whitespace-nowrap shrink-0 ${
                            isPass ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          {c.statusLabelAr}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-600">
                          الواقع:{" "}
                          <strong className="font-mono tabular-nums text-slate-950">
                            {c.measuredValueAr}
                          </strong>
                        </span>
                        <span className="text-slate-500">
                          المعيار:{" "}
                          <strong className="font-mono tabular-nums text-slate-800">
                            {c.officialStandardAr}
                          </strong>
                        </span>
                      </div>

                      <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed">
                        {c.inspectorNoteAr}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === "PORTFOLIO_7_DOCS" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-950">
                    حقيبة الأستاذ الرسمية للثانوي التأهيلي (7 وثائق مترابطة)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    اختر أي وثيقة لتفعيلها فوراً في ورقة المعاينة A4 مع ضبط الباريم وجدول المواصفات، أو تصديرها مباشرة كـ PDF أو نسخ كود LaTeX.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onExportCurrentDocumentPdf}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span>تصدير الوثيقة الحالية PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {portfolioDocs.map((doc) => {
                  const isActiveDoc = activeModule === doc.targetModule;
                  return (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        isActiveDoc
                          ? "border-slate-900 bg-slate-50/70 shadow-2xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono tabular-nums text-xs font-black flex items-center justify-center shrink-0">
                              {doc.orderNumber}
                            </span>
                            <div>
                              <h4 className="text-sm font-black text-slate-950">
                                {doc.titleAr}
                              </h4>
                              <span className="text-[11px] font-mono text-slate-500">
                                {doc.titleFr} · {doc.officialReferenceAr}
                              </span>
                            </div>
                          </div>
                          {isActiveDoc && (
                            <span className="text-[11px] font-black text-emerald-700 whitespace-nowrap shrink-0">
                              ● نشطة
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                          {doc.purposeAr}
                        </p>

                        <div className="mt-2.5 text-[11px] font-mono tabular-nums font-bold text-slate-700">
                          {doc.keyMetricsAr}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApplyDoc(doc, false)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                            <span>تفعيل في الورقة A4</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApplyDoc(doc, true)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Printer className="w-3.5 h-3.5 shrink-0" />
                            <span>PDF</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText(doc.id, doc.readyLatexSnippet)
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          {copiedId === doc.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-emerald-700">
                                تم نسخ LaTeX
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 shrink-0" />
                              <span>نسخ LaTeX</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "CAHIER_TEXTES_PV" && (
            <div className="space-y-4">
              {/* Interactive Note 142-08 Continuous Assessment (75% DS + 25% Activities) Calculator */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-slate-800 shrink-0" />
                    <h3 className="text-sm font-black text-slate-950">
                      حاسبة معدل المراقبة المستمرة الرسمية (المذكرة 142-08: 75% فروض محروسة + 25% أنشطة مدمجة)
                    </h3>
                  </div>
                  <span className="font-mono tabular-nums text-[11px] font-bold text-slate-600">
                    مسلك {trackStandard.trackCode} · المعامل{" "}
                    {trackStandard.officialCoefficient} ·{" "}
                    {trackStandard.dsCountPerSemester} فروض/أسدس
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 items-end">
                  {sampleDsGrades.map((grade, idx) => (
                    <label key={idx} className="block space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 block">
                        الفرض المحروس DS{idx + 1} (/20)
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.25}
                        value={grade}
                        onChange={(e) => {
                          const val = Math.max(
                            0,
                            Math.min(20, Number(e.target.value) || 0)
                          );
                          setSampleDsGrades((prev) =>
                            prev.map((g, i) => (i === idx ? val : g))
                          );
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-950 font-mono tabular-nums text-xs font-bold focus:outline-none focus:border-slate-900"
                      />
                    </label>
                  ))}

                  <label className="block space-y-1">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      الأنشطة والمنزلي 25% (/20)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.25}
                      value={sampleActivitiesGrade}
                      onChange={(e) =>
                        setSampleActivitiesGrade(
                          Math.max(0, Math.min(20, Number(e.target.value) || 0))
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-950 font-mono tabular-nums text-xs font-bold focus:outline-none focus:border-slate-900"
                    />
                  </label>

                  <div className="p-2.5 rounded-lg bg-slate-900 text-white col-span-2 sm:col-span-1 md:col-span-1">
                    <div className="text-[10px] text-slate-300 font-bold">
                      المعدل الدوري (مسار)
                    </div>
                    <div className="text-lg font-black font-mono tabular-nums text-amber-300">
                      {continuousAssessmentCalc.finalSemesterAverage.toFixed(2)}
                      <span className="text-xs text-slate-400"> / 20</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
                  <span className="font-mono tabular-nums text-slate-700">
                    معدل الفروض المحروسة: <strong>{continuousAssessmentCalc.dsAverage.toFixed(2)}</strong> × 0.75 ={" "}
                    <strong>{continuousAssessmentCalc.weightedDsPart.toFixed(2)}</strong> · الأنشطة:{" "}
                    <strong>{continuousAssessmentCalc.activitiesAverage.toFixed(2)}</strong> × 0.25 ={" "}
                    <strong>{continuousAssessmentCalc.weightedActivitiesPart.toFixed(2)}</strong>
                  </span>
                  <span
                    className={`font-bold ${
                      continuousAssessmentCalc.remediationTierCode ===
                      "EXCELLENCE"
                        ? "text-emerald-700"
                        : continuousAssessmentCalc.remediationTierCode ===
                          "CONSOLIDATION"
                        ? "text-amber-700"
                        : "text-rose-700"
                    }`}
                  >
                    {continuousAssessmentCalc.remediationTierAr}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Ready Cahier de Textes & PV Entry */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-950">
                          بطاقة التدوين في دفتر النصوص ومحضر الاستثمار
                        </h3>
                        <p className="text-xs text-slate-500">
                          صياغة رسمية جاهزة للنسخ في دفتر النصوص ومحضر استثمار نتائج الفرض
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText("cahier_textes", cahierTextString)
                        }
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {copiedId === "cahier_textes" ? (
                          <>
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 shrink-0" />
                            <span>نسخ البطاقة الرسمية</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {cahierTextString}
                    </pre>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>{trackStandard.officialNoteCitationAr}</span>
                    <span className="font-mono font-bold text-slate-900">
                      142-08
                    </span>
                  </div>
                </div>

                {/* Right: Orientations Pédagogiques 2007 Guidelines */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-950">
                      التوجيهات التربوية لمسلك {trackStandard.trackLabelAr}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {trackStandard.taxonomyReferenceNoteAr}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {trackStandard.didacticGuidelinesAr.map((guide, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {guide}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-900 mb-2">
                      الوثائق التربوية الإلزامية في ملف الأستاذ:
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5">
                      {trackStandard.requiredPortfolioDocumentsAr.map(
                        (docName, idx) => (
                          <div
                            key={idx}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{docName}</span>
                          </div>
                        )
                      )}
                    </div>
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
