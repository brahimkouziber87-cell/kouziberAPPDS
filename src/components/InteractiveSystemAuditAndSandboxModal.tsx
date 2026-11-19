import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CloudUpload,
  Download,
  Layers,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { CURRICULUM_DB, SemesterType } from "../data/curriculum";
import {
  AuditSubsystemId,
  ComprehensiveSystemAuditReport,
  LiveSandboxSimulationPayload,
  runComprehensiveApplicationAudit,
  SubsystemAuditResult,
} from "../utils/comprehensiveSystemAuditEngine";
import {
  firebaseAuth,
  saveExamToFirebaseFirestore,
  testFirestoreConnection,
} from "../services/firebaseExamsService";

export interface InteractiveSystemAuditAndSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrackCode: string;
  initialSemester: SemesterType;
  school: string;
  prof: string;
  year: string;
  onApplyLiveSandboxToStudio: (payload: LiveSandboxSimulationPayload) => void;
  onOpenFirebaseDashboard: () => void;
  onNotify?: (type: "success" | "info" | "error", text: string) => void;
}

type CategoryFilterId =
  | "ALL"
  | "EXAMS_AND_LATEX"
  | "PEDAGOGY_AND_BRIDGE"
  | "CLOUD_AND_SECURITY";

export const InteractiveSystemAuditAndSandboxModal: React.FC<
  InteractiveSystemAuditAndSandboxModalProps
> = ({
  isOpen,
  onClose,
  initialTrackCode,
  initialSemester,
  school,
  prof,
  year,
  onApplyLiveSandboxToStudio,
  onOpenFirebaseDashboard,
  onNotify,
}) => {
  const [selectedTrackCode, setSelectedTrackCode] =
    useState<string>(initialTrackCode || "2BAC_PC");
  const [selectedSemester, setSelectedSemester] =
    useState<SemesterType>(initialSemester || "S1");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilterId>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRunningAudit, setIsRunningAudit] = useState<boolean>(false);
  const [firestoreReachable, setFirestoreReachable] = useState<boolean>(true);
  const [savingSubsystemId, setSavingSubsystemId] =
    useState<AuditSubsystemId | null>(null);
  const [lastTestedSubsystemId, setLastTestedSubsystemId] =
    useState<AuditSubsystemId | null>(null);

  const [auditReport, setAuditReport] =
    useState<ComprehensiveSystemAuditReport>(() =>
      runComprehensiveApplicationAudit(
        initialTrackCode || "2BAC_PC",
        initialSemester || "S1"
      )
    );

  useEffect(() => {
    if (!isOpen) return;
    setAuditReport(
      runComprehensiveApplicationAudit(selectedTrackCode, selectedSemester)
    );
    testFirestoreConnection()
      .then((ok) => setFirestoreReachable(ok))
      .catch(() => setFirestoreReachable(false));
  }, [isOpen, selectedTrackCode, selectedSemester]);

  const handleRerunFullAudit = () => {
    setIsRunningAudit(true);
    window.setTimeout(() => {
      const fresh = runComprehensiveApplicationAudit(
        selectedTrackCode,
        selectedSemester
      );
      setAuditReport(fresh);
      setIsRunningAudit(false);
      onNotify?.(
        "success",
        `اكتمل الفحص الشامل لجميع المحركات الثمانية (${fresh.passedAssertionsChecked}/${fresh.totalAssertionsChecked} فحصاً ناجحاً بنسبة ${fresh.overallHealthPercent}%)!`
      );
    }, 140);
  };

  const filteredSubsystems = useMemo(() => {
    return auditReport.subsystems.filter((sub) => {
      if (categoryFilter === "EXAMS_AND_LATEX") {
        if (
          ![
            "SUBSYSTEM_1_CURRICULUM_BAREME",
            "SUBSYSTEM_2_SUBQUESTIONS_DECOMPOSITION",
            "SUBSYSTEM_5_EXAMEN_BLANC_BOOKLET_A5",
            "SUBSYSTEM_6_LATEX_TEX_NORMALIZER",
          ].includes(sub.id)
        ) {
          return false;
        }
      } else if (categoryFilter === "PEDAGOGY_AND_BRIDGE") {
        if (
          ![
            "SUBSYSTEM_3_FICHE_OP2007_SUMMARY",
            "SUBSYSTEM_4_SERIES_HOMEWORK_3TIER",
            "SUBSYSTEM_7_COMPANION_BRIDGE",
          ].includes(sub.id)
        ) {
          return false;
        }
      } else if (categoryFilter === "CLOUD_AND_SECURITY") {
        if (
          ![
            "SUBSYSTEM_6_LATEX_TEX_NORMALIZER",
            "SUBSYSTEM_8_FIREBASE_CLOUD_STORAGE",
          ].includes(sub.id)
        ) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${sub.titleAr} ${sub.subtitleAr} ${sub.summaryMetricsAr} ${sub.checks
          .map((c) => `${c.labelAr} ${c.measuredValue}`)
          .join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [auditReport.subsystems, categoryFilter, searchQuery]);

  if (!isOpen) return null;

  const handleTriggerLiveSandboxInStudio = (sub: SubsystemAuditResult) => {
    setLastTestedSubsystemId(sub.id);
    onApplyLiveSandboxToStudio(sub.sandboxPayload);
    onNotify?.(
      "success",
      `تم تفعيل التجربة الحية للمكون «${sub.titleAr}» وتطبيق مخرجاته مباشرة في الورقة التفاعلية A4 ومحرر LaTeX!`
    );
    onClose();
  };

  const handleSaveSandboxScenarioToFirebase = async (
    sub: SubsystemAuditResult
  ) => {
    setSavingSubsystemId(sub.id);
    try {
      const payload = sub.sandboxPayload;
      const trackObj =
        CURRICULUM_DB[payload.trackCode] || CURRICULUM_DB["2BAC_PC"];
      const saved = await saveExamToFirebaseFirestore({
        titleAr: `[سيناريو فحص معتمد] ${payload.titleAr}`,
        titleFr: `[Validated Audit Scenario] ${sub.orderNumber} - ${trackObj.labelFr}`,
        documentType:
          sub.id === "SUBSYSTEM_6_LATEX_TEX_NORMALIZER"
            ? "IMPORTED_TEX"
            : sub.id === "SUBSYSTEM_5_EXAMEN_BLANC_BOOKLET_A5"
              ? "EXAMEN_BLANC"
              : payload.moduleType === "DM_SERIE"
                ? "DM_SERIE"
                : payload.moduleType === "FICHE_OP2007"
                  ? "FICHE_OP2007"
                  : "DS_142_08",
        trackCode: payload.trackCode,
        trackLabelAr: trackObj.labelAr,
        semester: payload.semester === "S2" ? 2 : 1,
        examKey: payload.dsKey,
        examModel: payload.examModel,
        duration:
          sub.id === "SUBSYSTEM_5_EXAMEN_BLANC_BOOKLET_A5" ? "3h" : "2h",
        totalPoints: 20,
        totalQuestions: payload.lessons.reduce(
          (acc, l) => acc + (l.sampleExerciseAr?.length || 2),
          0
        ),
        totalSubQuestions:
          payload.lessons.reduce(
            (acc, l) => acc + (l.sampleExerciseAr?.length || 2),
            0
          ) * 2,
        n1: payload.n1,
        n2: payload.n2,
        n3: payload.n3,
        school,
        professor: prof,
        academicYear: year,
        latexSource:
          payload.latexSourceOverride ||
          `% Validated LaTeX Output for ${sub.titleAr}\n\\documentclass[11pt,a4paper]{article}\n\\begin{document}\n\\section*{${payload.titleAr}}\n\\end{document}`,
        lessons: payload.lessons,
        isFavorite: true,
        sourceOrigin:
          sub.id === "SUBSYSTEM_6_LATEX_TEX_NORMALIZER"
            ? "IMPORTED_TEX"
            : sub.id === "SUBSYSTEM_5_EXAMEN_BLANC_BOOKLET_A5"
              ? "EXAMEN_BLANC"
              : "STUDIO_GENERATED",
      });
      onNotify?.(
        "success",
        `تم حفظ سيناريو «${sub.titleAr}» في خزانة Firebase بنجاح (${saved.id})!`
      );
    } catch (err: any) {
      onNotify?.(
        "error",
        err?.message || "تعذر حفظ سيناريو التجربة في قاعدة البيانات."
      );
    } finally {
      setSavingSubsystemId(null);
    }
  };

  const handleDownloadAuditReportJson = () => {
    const blob = new Blob([JSON.stringify(auditReport, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprehensive_system_audit_${selectedTrackCode}_${selectedSemester}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[93vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                مركز الفحص الدقيق والتجربة الحية الشاملة لجميع مكونات المنصة
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-0.5 font-mono tabular-nums">
                <span>المعرّف: {auditReport.reportId}</span>
                <span aria-hidden="true">·</span>
                <span>
                  الأنظمة المفحوصة: {auditReport.passedSubsystems}/
                  {auditReport.totalSubsystems}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  الاختبارات التحققية: {auditReport.passedAssertionsChecked}/
                  {auditReport.totalAssertionsChecked}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  زمن الفحص: {auditReport.totalExecutionTimeMs} ms
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-300 font-bold">
                  {firestoreReachable
                    ? firebaseAuth.currentUser
                      ? `● متصل بـ Firebase (${firebaseAuth.currentUser.email})`
                      : "● قاعدة Firebase جاهزة (المرآة المحلية نشطة)"
                    : "▲ وضع عدم الاتصال"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRerunFullAudit}
              disabled={isRunningAudit}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRunningAudit ? "animate-spin" : ""}`}
              />
              <span>
                {isRunningAudit
                  ? "جاري إعادة الفحص..."
                  : "إعادة فحص جميع المكونات"}
              </span>
            </button>
            <button
              type="button"
              onClick={handleDownloadAuditReportJson}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير التقرير JSON</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Metrics Strip & Controls */}
        <div className="bg-white px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          {/* Interactive Segmented Category Filter */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                categoryFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              جميع المنظومات (8)
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("EXAMS_AND_LATEX")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                categoryFilter === "EXAMS_AND_LATEX"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              الفروض و LaTeX و A5
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("PEDAGOGY_AND_BRIDGE")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                categoryFilter === "PEDAGOGY_AND_BRIDGE"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              الجذاذات والسلاسل وجسر التتبع
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("CLOUD_AND_SECURITY")}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                categoryFilter === "CLOUD_AND_SECURITY"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Firebase والأمان
            </button>
          </div>

          {/* Target Track / Semester Selector & Search */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
            <select
              value={selectedTrackCode}
              onChange={(e) => setSelectedTrackCode(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-slate-50 text-slate-900"
            >
              <option value="TCS">الجذع المشترك العلمي (TCS)</option>
              <option value="1BAC_SE">الأولى باك علوم تجريبية (1BAC SE)</option>
              <option value="1BAC_SM">الأولى باك علوم رياضية (1BAC SM)</option>
              <option value="2BAC_PC">الثانية باك علوم فيزيائية (2BAC PC)</option>
              <option value="2BAC_SVT">الثانية باك علوم الحياة والأرض (2BAC SVT)</option>
              <option value="2BAC_SM">الثانية باك علوم رياضية (2BAC SM)</option>
            </select>

            <select
              value={selectedSemester}
              onChange={(e) =>
                setSelectedSemester(e.target.value as SemesterType)
              }
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold bg-slate-50 text-slate-900"
            >
              <option value="S1">الدورة الأولى (S1)</option>
              <option value="S2">الدورة الثانية (S2)</option>
            </select>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في فحوصات المكونات..."
                className="w-full border border-slate-300 rounded-lg pr-8 pl-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Main Subsystems Inspection List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Top Quantitative Summary Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  نتيجة الفحص الهندسي والديداكتيكي الشامل: جاهزية{" "}
                  <span className="font-mono tabular-nums text-emerald-700">
                    {auditReport.overallHealthPercent}%
                  </span>
                </span>
              </div>
              <div className="text-xs text-slate-600">
                يمكنك النقر على زر{" "}
                <strong className="text-slate-900">
                  «تجربة حية في الورقة A4»
                </strong>{" "}
                أمام أي مكون لتحميل سيناريو حقيقي كامل منه مباشرة في الاستوديو ومعاينته أو طباعته.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFirebaseDashboard();
                }}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-700" />
                <span>فتح لوحة قيادة Firebase واستيراد .tex</span>
              </button>
            </div>
          </div>

          {/* Subsystem Cards */}
          <div className="grid grid-cols-1 gap-4">
            {filteredSubsystems.map((sub) => {
              const isSavingThis = savingSubsystemId === sub.id;
              const wasLastTested = lastTestedSubsystemId === sub.id;

              return (
                <div
                  key={sub.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
                >
                  {/* Subsystem Header & Actions */}
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono tabular-nums text-xs font-bold text-slate-400">
                          {sub.orderNumber}.
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          {sub.titleAr}
                        </h3>
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <span
                          className={`text-xs font-bold flex items-center gap-1 ${
                            sub.status === "PASSED"
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {sub.statusLabelAr} ({sub.passedChecksCount}/
                            {sub.totalChecksCount})
                          </span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{sub.subtitleAr}</p>
                      <div className="text-[11px] font-mono tabular-nums text-slate-500 pt-0.5">
                        {sub.summaryMetricsAr} · زمن التنفيذ:{" "}
                        {sub.executionTimeMs} ms
                        {wasLastTested ? " · تم تطبيقه في الورقة A4" : ""}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTriggerLiveSandboxInStudio(sub)}
                        className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تجربة حية في الورقة A4</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveSandboxScenarioToFirebase(sub)}
                        disabled={isSavingThis}
                        className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <CloudUpload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {isSavingThis
                            ? "جاري الحفظ..."
                            : "حفظ السيناريو في Firebase"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Granular Assertion Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold">
                          <th className="py-2 pr-2 font-bold">
                            بند الفحص والتحقق الهندسي / البيداغوجي
                          </th>
                          <th className="py-2 px-3 font-bold">
                            القيمة المقاسة حياً
                          </th>
                          <th className="py-2 px-3 font-bold">
                            المعيار المرجعي المطلوب
                          </th>
                          <th className="py-2 pl-2 font-bold text-left">
                            الحالة
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sub.checks.map((chk) => (
                          <tr
                            key={chk.checkId}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="py-2.5 pr-2 font-semibold text-slate-800">
                              {chk.labelAr}
                            </td>
                            <td className="py-2.5 px-3 font-mono tabular-nums text-slate-900 font-bold">
                              {chk.measuredValue}
                            </td>
                            <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500">
                              {chk.expectedStandard}
                            </td>
                            <td className="py-2.5 pl-2 text-left font-bold whitespace-nowrap">
                              {chk.passed ? (
                                <span className="text-emerald-700">
                                  ✓ ناجح ومطابق
                                </span>
                              ) : (
                                <span className="text-amber-700">
                                  ▲ يحتاج مراجعة
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveSystemAuditAndSandboxModal;
