import React, { useMemo, useState } from "react";
import {
  X,
  GraduationCap,
  Download,
  Copy,
  Check,
  Code2,
  FileSpreadsheet,
  Globe,
  Layers,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import {
  LmsExportConfig,
  LmsExportFormat,
  generateLmsExportArtifact,
} from "../utils/lmsExporter";

export interface LmsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LmsExportConfig;
  onNotify?: (type: "success" | "error" | "info", msg: string) => void;
  onFileExported?: (
    fileName: string,
    category: "PDF" | "OVERLEAF_ZIP" | "LATEX_TYPST" | "EXCEL_CSV" | "HTML_JSON",
    formatLabel: string,
    fileSizeKb: number
  ) => void;
}

const LMS_FORMATS: Array<{
  id: LmsExportFormat;
  titleAr: string;
  platformTag: string;
  descAr: string;
  ext: string;
  category: "EXCEL_CSV" | "HTML_JSON";
}> = [
  {
    id: "MOODLE_XML",
    titleAr: "Moodle XML التفاعلي (بنك الأسئلة والتصحيح الآلي)",
    platformTag: "Moodle / TelmidTICE",
    descAr:
      "يدعم استيراد أسئلة QCM المصححة تلقائياً بنسبة 100% + التمارين المقالية مع شبكة سلم التنقيط 142-08 وصيغ MathJax.",
    ext: ".xml",
    category: "HTML_JSON",
  },
  {
    id: "GOOGLE_CLASSROOM_HTML_QUIZ",
    titleAr: "اختبار ويب تفاعلي (Google Classroom HTML5 Quiz)",
    platformTag: "Google Classroom Assignment",
    descAr:
      "صفحة اختبار تفاعلية مستقلة تشتغل في المتصفح مع مؤقت زمني، تصييغ KaTeX، تصحيح فوري لأسئلة QCM وتقرير للتسليم.",
    ext: ".html",
    category: "HTML_JSON",
  },
  {
    id: "GOOGLE_CLASSROOM_RUBRIC_CSV",
    titleAr: "شبكة التقييم الرسمية (Google Classroom Rubric CSV)",
    platformTag: "Google Classroom / Sheets",
    descAr:
      "جدول معايير التقويم الأربعة ومستويات التحكم (N1/N2/N3) مهيأ للاستيراد المباشر داخل قسم Rubrics في Google Classroom.",
    ext: ".csv",
    category: "EXCEL_CSV",
  },
  {
    id: "MOODLE_GIFT",
    titleAr: "صيغة Moodle GIFT النصية السريعة",
    platformTag: "Moodle GIFT Bank",
    descAr:
      "ملف نصي خفيف وسريع الاستيراد داخل بنوك الأسئلة في Moodle مع تضمين التعليقات البيداغوجية التلقائية.",
    ext: ".txt",
    category: "HTML_JSON",
  },
  {
    id: "IMS_QTI_21",
    titleAr: "المعيار الدولي IMS QTI 2.1 XML",
    platformTag: "Canvas / Blackboard / Moodle",
    descAr:
      "حزمة تقييم رقمية معيارية متوافقة مع أغلب منصات إدارة التعلم الجامعية والثانوية الدولية.",
    ext: ".xml",
    category: "HTML_JSON",
  },
];

export const LmsExportModal: React.FC<LmsExportModalProps> = ({
  isOpen,
  onClose,
  config,
  onNotify,
  onFileExported,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<LmsExportFormat>("MOODLE_XML");
  const [includeQcm, setIncludeQcm] = useState<boolean>(config.includeQcmSection ?? true);
  const [qcmCount, setQcmCount] = useState<number>(config.qcmQuestionCount ?? 4);
  const [includeFeedback, setIncludeFeedback] = useState<boolean>(
    config.includeDetailedSolutionsAsFeedback ?? true
  );
  const [language, setLanguage] = useState<"BILINGUAL" | "AR" | "FR">(
    config.language ?? "BILINGUAL"
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    config.durationMinutes ?? 120
  );
  const [copied, setCopied] = useState(false);

  const effectiveConfig: LmsExportConfig = useMemo(
    () => ({
      ...config,
      includeQcmSection: includeQcm,
      qcmQuestionCount: qcmCount,
      includeDetailedSolutionsAsFeedback: includeFeedback,
      language,
      durationMinutes,
    }),
    [config, includeQcm, qcmCount, includeFeedback, language, durationMinutes]
  );

  const artifact = useMemo(
    () => generateLmsExportArtifact(selectedFormat, effectiveConfig),
    [selectedFormat, effectiveConfig]
  );

  if (!isOpen) return null;

  const activeMeta =
    LMS_FORMATS.find((f) => f.id === selectedFormat) || LMS_FORMATS[0];

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(artifact.content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    onNotify?.("success", `تم نسخ محتوى ${activeMeta.platformTag} إلى الحافظة بنجاح!`);
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([artifact.content], { type: artifact.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = artifact.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const sizeKb = Number((blob.size / 1024).toFixed(1)) || 12.0;
      onFileExported?.(
        artifact.fileName,
        activeMeta.category,
        artifact.labelAr,
        sizeKb
      );
      onNotify?.(
        "success",
        `تم تصدير حزمة التقييم الرقمي بنجاح (${artifact.fileName})!`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ غير متوقع";
      onNotify?.("error", `تعذر تحميل ملف LMS: ${msg}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 no-print"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl border border-slate-300 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
        {/* الترويسة العلوية */}
        <div className="px-5 py-4 bg-gradient-to-l from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  أستوديو التصدير التفاعلي لأنظمة إدارة التعلم (LMS Export)
                </h3>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/40 font-bold">
                  Moodle · Google Classroom · IMS QTI 2.1
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تحويل الفروض والتمارين وسلم التنقيط 142-08 إلى حزم تقييم رقمية تفاعلية جاهزة للتصحيح الآلي والرفع المباشر
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600/80 text-slate-200 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* المحتوى الرئيسي: عمود الصيغ والضبط + عمود المعاينة الحية */}
        <div className="flex-1 overflow-y-auto studio-scroll p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* العمود الأيمن: اختيار الصيغة وضوابط الحزمة */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-700" />
                <span>1. اختر منصة وصيغة التقييم الرقمي:</span>
              </div>

              <div className="space-y-2">
                {LMS_FORMATS.map((fmt) => {
                  const isActive = fmt.id === selectedFormat;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`w-full text-right p-3 rounded-2xl border-2 transition cursor-pointer space-y-1 ${
                        isActive
                          ? "border-indigo-600 bg-indigo-50/70 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-xs text-slate-950 flex items-center gap-1.5">
                          {fmt.id === "GOOGLE_CLASSROOM_RUBRIC_CSV" ? (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                          ) : fmt.id === "GOOGLE_CLASSROOM_HTML_QUIZ" ? (
                            <Globe className="w-4 h-4 text-sky-700 shrink-0" />
                          ) : (
                            <Code2 className="w-4 h-4 text-amber-700 shrink-0" />
                          )}
                          <span>{fmt.titleAr}</span>
                        </span>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-300 shrink-0">
                          {fmt.ext}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {fmt.descAr}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* إعدادات التخصيص */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3 text-xs">
              <div className="font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <Sliders className="w-4 h-4 text-teal-700" />
                <span>2. خصائص التقييم التفاعلي:</span>
              </div>

              <label className="flex items-center justify-between gap-2 font-bold text-slate-700 cursor-pointer">
                <span>تضمين قسم QCM مصحح تلقائياً:</span>
                <input
                  type="checkbox"
                  checked={includeQcm}
                  onChange={(e) => setIncludeQcm(e.target.checked)}
                  className="w-4 h-4 accent-indigo-700"
                />
              </label>

              {includeQcm && (
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-700">
                    عدد أسئلة الاختيار من متعدد (QCM):
                  </span>
                  <div className="flex items-center gap-1">
                    {[2, 4, 6].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setQcmCount(cnt)}
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold border text-[11px] cursor-pointer ${
                          qcmCount === cnt
                            ? "bg-indigo-700 text-white border-indigo-700"
                            : "bg-white text-slate-700 border-slate-300"
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center justify-between gap-2 font-bold text-slate-700 cursor-pointer">
                <span>إدراج عناصر الإجابة وسلم 142-08 للمصحح:</span>
                <input
                  type="checkbox"
                  checked={includeFeedback}
                  onChange={(e) => setIncludeFeedback(e.target.checked)}
                  className="w-4 h-4 accent-indigo-700"
                />
              </label>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    لغة المحتوى المصدّر:
                  </label>
                  <select
                    value={language}
                    onChange={(e) =>
                      setLanguage(e.target.value as "BILINGUAL" | "AR" | "FR")
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                  >
                    <option value="BILINGUAL">ثنائي اللغة (AR + FR)</option>
                    <option value="AR">العربية فقط</option>
                    <option value="FR">Français فقط</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    المدة الزمنية (دقيقة):
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    step={15}
                    value={durationMinutes}
                    onChange={(e) =>
                      setDurationMinutes(Math.max(15, Number(e.target.value) || 60))
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* العمود الأيسر: المعاينة الحية وتنفيذ التصدير */}
          <div className="lg:col-span-7 flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-amber-300 font-bold">
                  {artifact.fileName}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({(new Blob([artifact.content]).size / 1024).toFixed(1)} KB)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? "تم النسخ" : "نسخ الكود"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-l from-amber-400 to-orange-500 hover:brightness-105 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer transition shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل ملف {activeMeta.ext}</span>
                </button>
              </div>
            </div>

            <pre
              dir="ltr"
              className="flex-1 p-4 text-[11px] font-mono text-emerald-300 overflow-auto max-h-[54vh] leading-relaxed text-left whitespace-pre-wrap break-words"
            >
              {artifact.content.slice(0, 12000)}
              {artifact.content.length > 12000
                ? "\n\n... [تم اختصار المعاينة — الملف الكامل سيتضمن جميع التمارين والأسئلة عند التحميل]"
                : ""}
            </pre>

            <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-2">
              <span>
                عدد الدروس/التمارين المضمّنة:{" "}
                <strong className="text-white">{config.lessons.length}</strong> ·{" "}
                النقطة الإجمالية: <strong className="text-emerald-400">20 / 20</strong>
              </span>
              <span className="font-mono text-[10px] text-cyan-300">
                {activeMeta.platformTag} Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
