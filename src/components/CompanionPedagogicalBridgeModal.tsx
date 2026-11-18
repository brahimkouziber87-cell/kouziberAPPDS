import React, { useState, useMemo, useRef } from "react";
import {
  X,
  Upload,
  Download,
  Share2,
  CheckCircle2,
  FileJson,
  BookOpen,
  Sparkles,
  ArrowLeftRight,
  AlertTriangle,
  Copy,
  Check,
  Code2,
} from "lucide-react";
import {
  DMSubType,
  LessonItem,
  ModuleType,
  SemesterType,
  TrackData,
} from "../data/curriculum";
import {
  AppliedBriefStudioConfig,
  buildCompanionAppPedagogicalBrief,
  buildCompanionDocumentExportPayload,
  parseAndResolveCompanionBriefForStudio,
} from "../utils/companionPedagogicalBridge";
import { SubQuestionDecompositionMode } from "../utils/dsSupervisedExamEnhancements";

export interface CompanionPedagogicalBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: ModuleType;
  dmSubType: DMSubType;
  track: TrackData;
  semester: SemesterType;
  dsKey: string;
  school: string;
  prof: string;
  year: string;
  totalPoints: number;
  totalQuestions: number;
  n1: number;
  n2: number;
  n3: number;
  lessons: LessonItem[];
  subQuestionDecompositionMode: SubQuestionDecompositionMode;
  onApplyImportedBrief: (config: AppliedBriefStudioConfig) => void;
}

export const CompanionPedagogicalBridgeModal: React.FC<
  CompanionPedagogicalBridgeModalProps
> = ({
  isOpen,
  onClose,
  activeModule,
  dmSubType,
  track,
  semester,
  dsKey,
  school,
  prof,
  year,
  totalPoints,
  totalQuestions,
  n1,
  n2,
  n3,
  lessons,
  subQuestionDecompositionMode,
  onApplyImportedBrief,
}) => {
  const [activeTab, setActiveTab] = useState<
    "IMPORT_BRIEF" | "EXPORT_DOC" | "ENGINE_SCRIPT"
  >("IMPORT_BRIEF");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // البطاقات التشخيصية الجاهزة للمحاكاة أو الاستيراد المباشر
  const presetBriefs = useMemo(
    () => ({
      REMEDIATION_NEEDED: buildCompanionAppPedagogicalBrief({
        className: `${track.code}-G2`,
        trackCode: track.code,
        trackLabelAr: track.labelAr,
        trackLabelFr: track.labelFr,
        semester,
        examKey: dsKey,
        school,
        professor: prof,
        academicYear: year,
        totalStudents: 34,
        classAverage: 8.65,
        passRatePercent: 38.2,
        strugglingCount: 15,
        completedLessons: lessons.map((l, idx) => ({
          order: idx + 1,
          lessonAr: l.lessonAr,
          lessonFr: l.lessonFr,
          axisAr: l.category,
          completedHours: parseInt(l.hours, 10) || 8,
          completionRatePercent: 100,
        })),
      }),
      BALANCED_DS_READY: buildCompanionAppPedagogicalBrief({
        className: `${track.code}-G1`,
        trackCode: track.code,
        trackLabelAr: track.labelAr,
        trackLabelFr: track.labelFr,
        semester,
        examKey: dsKey,
        school,
        professor: prof,
        academicYear: year,
        totalStudents: 32,
        classAverage: 11.45,
        passRatePercent: 62.5,
        strugglingCount: 6,
        completedLessons: lessons.map((l, idx) => ({
          order: idx + 1,
          lessonAr: l.lessonAr,
          lessonFr: l.lessonFr,
          axisAr: l.category,
          completedHours: parseInt(l.hours, 10) || 8,
          completionRatePercent: 100,
        })),
      }),
      EXCELLENCE_SYNTHESIS: buildCompanionAppPedagogicalBrief({
        className: `${track.code}-G3`,
        trackCode: track.code,
        trackLabelAr: track.labelAr,
        trackLabelFr: track.labelFr,
        semester,
        examKey: dsKey,
        school,
        professor: prof,
        academicYear: year,
        totalStudents: 30,
        classAverage: 14.2,
        passRatePercent: 86.7,
        strugglingCount: 2,
        completedLessons: lessons.map((l, idx) => ({
          order: idx + 1,
          lessonAr: l.lessonAr,
          lessonFr: l.lessonFr,
          axisAr: l.category,
          completedHours: parseInt(l.hours, 10) || 8,
          completionRatePercent: 100,
        })),
      }),
    }),
    [track, semester, dsKey, school, prof, year, lessons]
  );

  const [rawBriefJsonText, setRawBriefJsonText] = useState<string>(() =>
    JSON.stringify(presetBriefs.REMEDIATION_NEEDED, null, 2)
  );
  const [copiedFlag, setCopiedFlag] = useState<boolean>(false);

  const parsedBriefState = useMemo<{
    config: AppliedBriefStudioConfig | null;
    error: string | null;
  }>(() => {
    try {
      return {
        config: parseAndResolveCompanionBriefForStudio(rawBriefJsonText),
        error: null,
      };
    } catch (e: any) {
      return {
        config: null,
        error: `تعذر قراءة ملف JSON للبطاقة التشخيصية: ${
          e?.message || "صيغة غير صالحة"
        }`,
      };
    }
  }, [rawBriefJsonText]);

  const parsedBriefConfig = parsedBriefState.config;
  const importError = parsedBriefState.error;

  const exportPayload = useMemo(
    () =>
      buildCompanionDocumentExportPayload({
        activeModule,
        dmSubType,
        track,
        semester,
        dsKey,
        school,
        prof,
        year,
        totalPoints,
        totalQuestions,
        n1,
        n2,
        n3,
        lessons,
        subQuestionDecompositionMode,
      }),
    [
      activeModule,
      dmSubType,
      track,
      semester,
      dsKey,
      school,
      prof,
      year,
      totalPoints,
      totalQuestions,
      n1,
      n2,
      n3,
      lessons,
      subQuestionDecompositionMode,
    ]
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRawBriefJsonText(reader.result);
      }
    };
    reader.readAsText(file, "utf-8");
  };

  const handleDownloadExportedDocJson = () => {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Companion_Document_${track.code}_${semester}_${dsKey}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyExportJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
      setCopiedFlag(true);
      setTimeout(() => setCopiedFlag(false), 2500);
    } catch {
      // ignore clipboard restriction
    }
  };

  const normalizedDoc = exportPayload.normalizedCompanionPreview;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-teal-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-l from-teal-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>
                  جسر التكامل البيداغوجي مع تطبيق التتبع والتدبير ودفتر النصوص
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  /public/core/lesson-log-engine.js
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                1) استيراد البطاقة التشخيصية للقسم (buildCompanionAppPedagogicalBrief) · 2) تصدير الوثيقة المنتجة للمكتبة الرقمية ودفتر النصوص (normalizeImportedCompanionDocument)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 py-2 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("IMPORT_BRIEF")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "IMPORT_BRIEF"
                ? "bg-teal-600 text-white shadow"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>
              1. استيراد البطاقة التشخيصية للقسم (buildCompanionAppPedagogicalBrief)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("EXPORT_DOC")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "EXPORT_DOC"
                ? "bg-indigo-600 text-white shadow"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>
              2. تصدير الوثيقة المنتجة نحو تطبيق التدبير (normalizeImportedCompanionDocument)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ENGINE_SCRIPT")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "ENGINE_SCRIPT"
                ? "bg-amber-600 text-white shadow"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>3. ملف المحرك المشترك (/public/core/lesson-log-engine.js)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === "IMPORT_BRIEF" && (
            <div className="space-y-4">
              {/* Top Controls: Upload or Select Preset */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-teal-300 ml-1">
                    اختر نموذج بطاقة تشخيصية أو ارفع ملف JSON من تطبيق التدبير:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setRawBriefJsonText(
                        JSON.stringify(presetBriefs.REMEDIATION_NEEDED, null, 2)
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 text-rose-200 text-[11px] font-bold"
                  >
                    قسم متعثر (معدل 8.65 · توصية: سلسلة دعم)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRawBriefJsonText(
                        JSON.stringify(presetBriefs.BALANCED_DS_READY, null, 2)
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-500/40 text-indigo-200 text-[11px] font-bold"
                  >
                    قسم متوازن (معدل 11.45 · توصية: فرض محروس)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRawBriefJsonText(
                        JSON.stringify(presetBriefs.EXCELLENCE_SYNTHESIS, null, 2)
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold"
                  >
                    قسم متميز (معدل 14.20 · توصية: فرض/سلسلة توليفية)
                  </button>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع ملف البطاقة التشخيصية (.json)</span>
                  </button>
                </div>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {parsedBriefConfig && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left: Parsed Diagnostic Card */}
                  <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <span className="text-xs font-extrabold text-teal-300">
                          البطاقة التشخيصية للقسم المستوردة من دفتر النصوص:
                        </span>
                        <div className="text-sm font-black text-white mt-0.5">
                          {parsedBriefConfig.brief.classIdentity.trackLabelAr} — القسم{" "}
                          {parsedBriefConfig.brief.classIdentity.className} (المعامل:{" "}
                          {parsedBriefConfig.brief.classIdentity.coefficient} · الأسدس:{" "}
                          {parsedBriefConfig.brief.classIdentity.semester})
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300">
                        {parsedBriefConfig.brief.cahierDeTexteProgress.totalCompletedHours}h منجزة
                      </span>
                    </div>

                    {/* Diagnostic Metrics */}
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[11px] text-slate-400">معدل القسم</div>
                        <div className="text-base font-black text-amber-300">
                          {parsedBriefConfig.brief.classDiagnosticMetrics.classAverage} / 20
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[11px] text-slate-400">نسبة الاستيفاء (≥10)</div>
                        <div className="text-base font-black text-emerald-300">
                          {parsedBriefConfig.brief.classDiagnosticMetrics.passRatePercent}%
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[11px] text-slate-400">عدد المتعثرين (&lt;8)</div>
                        <div className="text-base font-black text-rose-400">
                          {parsedBriefConfig.brief.classDiagnosticMetrics.strugglingCountLt8} تلميذاً
                        </div>
                      </div>
                    </div>

                    {/* Completed Lessons in Cahier de Texte */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-300">
                        الدروس والمحاور المنجزة فعلياً في دفتر النصوص ({parsedBriefConfig.matchedCurriculumLessons.length} دروس مطابقة):
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {parsedBriefConfig.brief.cahierDeTexteProgress.completedLessons.map(
                          (item, idx) => (
                            <div
                              key={idx}
                              className="px-2.5 py-1.5 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]"
                            >
                              <span className="font-bold text-slate-200">
                                {idx + 1}. {item.lessonAr} ({item.axisAr})
                              </span>
                              <span className="text-teal-300 font-mono">
                                {item.completedHours}h ({item.completionRatePercent}%)
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Automated Recommendation */}
                    <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-teal-300 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>التوصية الآلية بنوع الوثيقة المطلوب إنتاجها:</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-200">
                          N1:{parsedBriefConfig.n1}% · N2:{parsedBriefConfig.n2}% · N3:{parsedBriefConfig.n3}%
                        </span>
                      </div>
                      <div className="text-xs font-black text-white">
                        {
                          parsedBriefConfig.brief.automatedPedagogicalRecommendation
                            .recommendationTitleAr
                        }
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {
                          parsedBriefConfig.brief.automatedPedagogicalRecommendation
                            .recommendationRationaleAr
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onApplyImportedBrief(parsedBriefConfig);
                        onClose();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        تطبيق البطاقة التشخيصية وتوليد الوثيقة الموصى بها فوراً في الاستوديو
                      </span>
                    </button>
                  </div>

                  {/* Right: Raw JSON Editor */}
                  <div className="lg:col-span-5 flex flex-col">
                    <div className="text-xs font-bold text-slate-400 mb-1.5">
                      محتوى JSON الصادر عن LessonLogEngine.buildCompanionAppPedagogicalBrief:
                    </div>
                    <textarea
                      value={rawBriefJsonText}
                      onChange={(e) => setRawBriefJsonText(e.target.value)}
                      dir="ltr"
                      className="w-full flex-1 min-h-[290px] bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-300 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "EXPORT_DOC" && (
            <div className="space-y-4">
              <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-extrabold text-indigo-300">
                    جاهز للاستيراد عبر LessonLogEngine.normalizeImportedCompanionDocument
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    يتم إدراج هذه الوثيقة تلقائياً في المكتبة التربوية الرقمية وسجل دفتر النصوص مع ربطها بالمسلك ({track.code}) والمعامل ({normalizedDoc.digitalLibraryEntry.coefficient}) والغلاف الزمني ({normalizedDoc.cahierDeTexteLogEntry.allocatedHours}).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyExportJson}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                  >
                    {copiedFlag ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadExportedDocJson}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل ملف الوثيقة لتطبيق التدبير (.json)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Preview 1: Digital Pedagogical Library Card */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-300 border-b border-slate-800 pb-2">
                    <BookOpen className="w-4 h-4" />
                    <span>1. المعاينة في المكتبة التربوية الرقمية (digitalLibraryEntry):</span>
                  </div>
                  <div className="text-xs font-bold text-white">
                    {normalizedDoc.digitalLibraryEntry.titleAr}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div>
                      • التصنيف: <strong className="text-amber-300">{normalizedDoc.digitalLibraryEntry.kindLabelAr}</strong>
                    </div>
                    <div>
                      • المسلك والمعامل: <strong>{normalizedDoc.digitalLibraryEntry.trackCode} (معامل {normalizedDoc.digitalLibraryEntry.coefficient})</strong>
                    </div>
                    <div>
                      • المحور المستهدف: <strong>{normalizedDoc.digitalLibraryEntry.targetAxisAr}</strong>
                    </div>
                    <div>
                      • الأسئلة والفرعيات: <strong>{normalizedDoc.digitalLibraryEntry.totalQuestions} س ← {normalizedDoc.digitalLibraryEntry.totalSubQuestions} فرع (أ/ب/ج)</strong>
                    </div>
                  </div>
                </div>

                {/* Preview 2: Cahier de Texte Auto-Log Entry */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-300 border-b border-slate-800 pb-2">
                    <FileJson className="w-4 h-4" />
                    <span>2. التدوين التلقائي في دفتر النصوص (cahierDeTexteLogEntry):</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1.5">
                    <div>
                      • التاريخ والغلاف الزمني: <strong className="text-emerald-300">{normalizedDoc.cahierDeTexteLogEntry.dateIso} ({normalizedDoc.cahierDeTexteLogEntry.allocatedHours})</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed">
                      {normalizedDoc.cahierDeTexteLogEntry.summaryAr}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ENGINE_SCRIPT" && (
            <div className="space-y-3">
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-extrabold text-amber-300">
                    ملف المحرك المشترك: /public/core/lesson-log-engine.js
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    متاح مباشرة عبر الرابط <code className="text-amber-200">/core/lesson-log-engine.js</code> ويضم الدالتين الرسميتين <code className="text-amber-200">LessonLogEngine.buildCompanionAppPedagogicalBrief</code> و <code className="text-amber-200">LessonLogEngine.normalizeImportedCompanionDocument</code>.
                  </p>
                </div>
                <a
                  href="/core/lesson-log-engine.js"
                  download="lesson-log-engine.js"
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل lesson-log-engine.js</span>
                </a>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-slate-300">
                  مثال الربط المباشر في تطبيق التدبير ودفتر النصوص (API Usage):
                </div>
                <pre
                  dir="ltr"
                  className="text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800"
                >{`// 1. تصدير البطاقة التشخيصية للقسم نحو تطبيق إنتاج الوثائق:
const briefJson = LessonLogEngine.buildCompanionAppPedagogicalBrief({
  trackCode: "${track.code}",
  semester: "${semester}",
  examKey: "${dsKey}",
  classAverage: 9.4,
  passRatePercent: 45.0,
  strugglingCount: 11,
  completedLessons: [{ lessonAr: "${lessons[0]?.lessonAr || "الاتصال والاشتقاق"}", completedHours: 12 }]
});

// 2. استيراد الوثيقة المنتجة وإدراجها تلقائياً في المكتبة الرقمية ودفتر النصوص:
const normalized = LessonLogEngine.normalizeImportedCompanionDocument(exportedStudioDoc);
// -> normalized.digitalLibraryEntry (المكتبة التربوية الرقمية)
// -> normalized.cahierDeTexteLogEntry (دفتر النصوص الرقمي)`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanionPedagogicalBridgeModal;
