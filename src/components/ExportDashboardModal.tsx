import React, { useState, useMemo } from "react";
import {
  X,
  FolderArchive,
  FileText,
  FileCode2,
  FileSpreadsheet,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  RefreshCw,
  Layers,
  Eye,
  ShieldCheck,
  BookOpen,
  Square,
  CheckSquare,
  Sliders,
  Scissors,
  FileCheck2,
  FileStack,
} from "lucide-react";
import { TrackData, SemesterType, ModuleType, ExamModel } from "../data/curriculum";
import {
  EXPORT_HISTORY_STORAGE_KEY as STORAGE_KEY,
  ExportFileCategory,
  BatchPrintSharedConfig,
  ExportHistoryEntry,
  getInitialSeededExportHistory,
  loadExportHistory,
  recordExportHistoryEntry,
} from "../utils/exportHistoryStorage";

export {
  type ExportFileCategory,
  type BatchPrintSharedConfig,
  type ExportHistoryEntry,
  getInitialSeededExportHistory,
  loadExportHistory,
  recordExportHistoryEntry,
};

interface ExportDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: TrackData;
  sem: SemesterType;
  dsKey: string;
  activeModule: ModuleType;
  examModel: ExamModel;
  includeAnswerWorkspace: boolean;
  includeDetailedSolutions: boolean;
  latexCode: string;
  typstCode: string;
  exportHistory: ExportHistoryEntry[];
  onUpdateExportHistory: (next: ExportHistoryEntry[]) => void;
  onTriggerPrintPdf: () => void;
  onTriggerExportOverleafZip: () => Promise<void> | void;
  onTriggerDownloadLatex: () => void;
  onTriggerDownloadTypst: () => void;
  onTriggerDownloadHtml: () => void;
  onTriggerDownloadEvalExcel: () => void;
  onOpenExportCenter?: () => void;
  onTriggerBatchPrintWithOptions?: (config: BatchPrintSharedConfig) => void;
}

export const ExportDashboardModal: React.FC<ExportDashboardModalProps> = ({
  isOpen,
  onClose,
  track,
  sem,
  dsKey,
  activeModule,
  examModel,
  includeAnswerWorkspace,
  includeDetailedSolutions,
  latexCode,
  typstCode,
  exportHistory,
  onUpdateExportHistory,
  onTriggerPrintPdf,
  onTriggerExportOverleafZip,
  onTriggerDownloadLatex,
  onTriggerDownloadTypst,
  onTriggerDownloadHtml,
  onTriggerDownloadEvalExcel,
  onOpenExportCenter,
  onTriggerBatchPrintWithOptions,
}) => {
  const [activeDashboardTab, setActiveDashboardTab] = useState<"HISTORY_OVERLEAF" | "BATCH_PRINT">("HISTORY_OVERLEAF");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | ExportFileCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [batchCopies, setBatchCopies] = useState<number>(35);
  const [batchOrientation, setBatchOrientation] = useState<"PORTRAIT" | "LANDSCAPE" | "AUTO">("PORTRAIT");
  const [batchPageRange, setBatchPageRange] = useState<"ALL" | "PAGE_1" | "PAGES_1_2" | "CUSTOM">("ALL");
  const [batchCustomRange, setBatchCustomRange] = useState<string>("1-2");
  const [batchPaperFormat, setBatchPaperFormat] = useState<"A4_STANDARD" | "A5_BOOKLET_FOLDED">("A4_STANDARD");
  const [batchDuplex, setBatchDuplex] = useState<"DUPLEX_RECTO_VERSO" | "SIMPLEX_ONE_SIDED">("DUPLEX_RECTO_VERSO");
  const [selectedBatchDocIds, setSelectedBatchDocIds] = useState<string[]>([
    "doc_model_a",
    "doc_model_b",
    "doc_solutions_annex",
  ]);
  const [batchExecutedNotice, setBatchExecutedNotice] = useState<string | null>(null);

  const [pdfJobState, setPdfJobState] = useState<{
    status: "IDLE" | "GENERATING" | "READY";
    progress: number;
    stepLabel: string;
    lastGeneratedTime: string;
  }>({
    status: "READY",
    progress: 100,
    stepLabel: "محرك PDF الشعاعي جاهز (300 DPI · A4 · Cairo/Amiri + TikZ)",
    lastGeneratedTime: "الآن",
  });
  const [copiedBundleId, setCopiedBundleId] = useState<string | null>(null);
  const [previewEntry, setPreviewEntry] = useState<ExportHistoryEntry | null>(null);
  const [isExportingZipNow, setIsExportingZipNow] = useState(false);

  const batchAvailableDocs = useMemo(
    () => [
      {
        id: "doc_model_a",
        titleAr: "النموذج (أ) — موضوع الفرض المحروس للمترشح (Sujet Modèle A)",
        titleFr: "Sujet Modèle A (Format A4)",
        badge: "Modèle A",
        pagesEstimated: 2,
        orientation: "PORTRAIT" as const,
        descAr: "ورقة الفرض المحروس الرسمية النموذج A للتوزيع داخل القاعة.",
      },
      {
        id: "doc_model_b",
        titleAr: "النموذج (ب) — النسخة التوأمية الموازية لتفادي الغش (Sujet Modèle B)",
        titleFr: "Sujet Isomorphe Modèle B",
        badge: "Modèle B",
        pagesEstimated: 2,
        orientation: "PORTRAIT" as const,
        descAr: "نسخة مكافئة بنفس المعايير والأوزان مع معطيات عددية مغايرة لمنع التواصل.",
      },
      {
        id: "doc_solutions_annex",
        titleAr: "الملحق الرسمي لعناصر الإجابة وسلم التنقيط المفصل (Corrigé & Barème)",
        titleFr: "Corrigé Détaillé & Barème Officiel",
        badge: "Corrigé",
        pagesEstimated: 2,
        orientation: "PORTRAIT" as const,
        descAr: "عناصر الإجابة وسلم التنقيط الجزئي [ن] المفصل لكل سؤال للمصحح.",
      },
      {
        id: "doc_eval_grid",
        titleAr: "شبكة التقويم التوليفي وتفريغ نتائج مسار (Grille Massar)",
        titleFr: "Grille d'Évaluation & Suivi des Compétences",
        badge: "Massar",
        pagesEstimated: 1,
        orientation: "LANDSCAPE" as const,
        descAr: "شبكة رصد نسب التحكم في الكفايات ومعدلات التلاميذ ومعدل القسم.",
      },
      {
        id: "doc_remediation_sheet",
        titleAr: "خطة الدعم البيداغوجي والمعالجة الفارقية (Fiche de Remédiation)",
        titleFr: "Dispositif de Soutien & Remédiation Différenciée",
        badge: "Remédiation",
        pagesEstimated: 1,
        orientation: "PORTRAIT" as const,
        descAr: "تفييء المتعلمين إلى 3 مجموعات علاجية ورصد الأخطاء المتكررة.",
      },
      {
        id: "doc_cover_cahier_textes",
        titleAr: "البطاقة التقنية لملف الأستاذ ودفتر النصوص (Fiche Technique)",
        titleFr: "Fiche Technique Officielle de l'Épreuve",
        badge: "Dossier",
        pagesEstimated: 1,
        orientation: "PORTRAIT" as const,
        descAr: "ورقة الغلاف الرسمية المعتمدة لدى المفتش التربوي وإدارة المؤسسة.",
      },
      {
        id: "doc_formula_sheet",
        titleAr: "تذكرة القوانين والصيغ المرجعية المركزة (Formulaire)",
        titleFr: "Formulaire Mathématique & Rappels",
        badge: "Formulaire",
        pagesEstimated: 1,
        orientation: "PORTRAIT" as const,
        descAr: "ملحق اختياري بالقواعد الرسمية المعتمدة في الاشتقاق والمتتاليات.",
      },
    ],
    []
  );

  const selectedBatchDocs = useMemo(
    () => batchAvailableDocs.filter((d) => selectedBatchDocIds.includes(d.id)),
    [batchAvailableDocs, selectedBatchDocIds]
  );

  const totalRawPagesPerSet = useMemo(() => {
    const pages = selectedBatchDocs.reduce((sum, d) => {
      if (batchPageRange === "PAGE_1") return sum + 1;
      if (batchPageRange === "PAGES_1_2") return sum + Math.min(2, d.pagesEstimated);
      return sum + d.pagesEstimated;
    }, 0);
    return Math.max(1, pages);
  }, [selectedBatchDocs, batchPageRange]);

  const physicalSheetsPerSet = useMemo(() => {
    if (batchPaperFormat === "A5_BOOKLET_FOLDED") {
      return Math.max(1, Math.ceil(totalRawPagesPerSet / 4));
    }
    if (batchDuplex === "DUPLEX_RECTO_VERSO") {
      return Math.max(1, Math.ceil(totalRawPagesPerSet / 2));
    }
    return totalRawPagesPerSet;
  }, [batchPaperFormat, batchDuplex, totalRawPagesPerSet]);

  const totalPhysicalSheetsForClass = useMemo(() => {
    return physicalSheetsPerSet * batchCopies;
  }, [physicalSheetsPerSet, batchCopies]);

  const paperSavingsPercent = useMemo(() => {
    const baseline = totalRawPagesPerSet * batchCopies;
    if (baseline <= 0) return 0;
    const saved = baseline - totalPhysicalSheetsForClass;
    return Math.max(0, Math.round((saved / baseline) * 100));
  }, [totalRawPagesPerSet, batchCopies, totalPhysicalSheetsForClass]);

  const handleToggleBatchDoc = (id: string) => {
    setSelectedBatchDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllBatchDocs = (select: boolean) => {
    setSelectedBatchDocIds(select ? batchAvailableDocs.map((d) => d.id) : []);
  };

  const handleExecuteSharedBatchPrint = () => {
    if (selectedBatchDocIds.length === 0) return;
    const config: BatchPrintSharedConfig = {
      selectedDocIds: selectedBatchDocIds,
      copies: batchCopies,
      orientation: batchOrientation,
      pageRange: batchPageRange,
      customPageRange: batchCustomRange,
      paperFormat: batchPaperFormat,
      duplex: batchDuplex,
    };

    if (onTriggerBatchPrintWithOptions) {
      onTriggerBatchPrintWithOptions(config);
    } else {
      onTriggerPrintPdf();
    }

    const updated = recordExportHistoryEntry({
      fileName: `Batch_Print_${track.code}_${batchCopies}copies_${batchPaperFormat === "A5_BOOKLET_FOLDED" ? "A5_Booklet" : "A4"}.pdf`,
      formatLabel: `طباعة مجمعة (${batchCopies} نسخة · ${selectedBatchDocs.length} وثائق)`,
      category: "PDF",
      trackCode: track.code,
      trackLabelAr: track.labelAr,
      semester: sem,
      moduleType: activeModule,
      modelCode: examModel,
      fileSizeKb: Number((180 + totalPhysicalSheetsForClass * 1.5).toFixed(1)),
      dpiOrCompiler: `${batchPaperFormat === "A5_BOOKLET_FOLDED" ? "A5 Booklet Folded" : "A4"} · ${batchOrientation} · ${batchCopies}x`,
      includeAnswerWorkspace,
      includeDetailedSolutions,
    });
    onUpdateExportHistory(updated);

    setBatchExecutedNotice(
      `✓ تم إرسال أمر الطباعة المجمعة بنجاح! تم تجهيز ${selectedBatchDocs.length} وثائق بـ (${batchCopies} نسخة) بإجمالي ${totalPhysicalSheetsForClass} ورقة فيزيائية (وفر ورقي: ${paperSavingsPercent}%).`
    );
    setTimeout(() => setBatchExecutedNotice(null), 5000);
  };

  const overleafBundles = useMemo(
    () => exportHistory.filter((item) => item.category === "OVERLEAF_ZIP"),
    [exportHistory]
  );

  const filteredHistory = useMemo(() => {
    return exportHistory.filter((item) => {
      const matchesCat =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.fileName.toLowerCase().includes(q) ||
        item.trackLabelAr.toLowerCase().includes(q) ||
        item.formatLabel.toLowerCase().includes(q) ||
        item.trackCode.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [exportHistory, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const formatRelativeTime = (iso: string) => {
    const diffSec = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (diffSec < 60) return "منذ لحظات";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  };

  const handleRunLivePdfGeneration = () => {
    setPdfJobState({
      status: "GENERATING",
      progress: 22,
      stepLabel: "1/3 معايرة الهوامش، الصيغ الرياضية، وفراغات الإجابة الكاملة للتلميذ...",
      lastGeneratedTime: "جاري التوليد...",
    });

    setTimeout(() => {
      setPdfJobState({
        status: "GENERATING",
        progress: 68,
        stepLabel: "2/3 تجهيز الأشكال الهندسية الشعاعية وشبكة التنقيط...",
        lastGeneratedTime: "جاري التوليد...",
      });
    }, 280);

    setTimeout(() => {
      const newHistory = recordExportHistoryEntry({
        fileName: `${track.code}_${activeModule}_${sem}_${dsKey}_Complet.pdf`,
        formatLabel: "PDF Vectoriel (A4)",
        category: "PDF",
        trackCode: track.code,
        trackLabelAr: track.labelAr,
        semester: sem,
        moduleType: activeModule,
        modelCode: examModel,
        fileSizeKb: Number((260 + latexCode.length / 180).toFixed(1)),
        dpiOrCompiler: "300 DPI · Vector Math",
        includeAnswerWorkspace,
        includeDetailedSolutions,
      });
      onUpdateExportHistory(newHistory);

      setPdfJobState({
        status: "READY",
        progress: 100,
        stepLabel: "تم تجهيز ملف PDF بنجاح (100%) — جاهز للطباعة والحفظ الفوري",
        lastGeneratedTime: "منذ لحظات",
      });
      onTriggerPrintPdf();
    }, 620);
  };

  const handleGenerateNewOverleafBundle = async () => {
    setIsExportingZipNow(true);
    try {
      await onTriggerExportOverleafZip();
    } finally {
      setTimeout(() => setIsExportingZipNow(false), 450);
    }
  };

  const handleCopyBundleLatex = async (bundleId: string, content?: string) => {
    const codeToCopy = content || latexCode;
    try {
      await navigator.clipboard.writeText(codeToCopy);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = codeToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedBundleId(bundleId);
    setTimeout(() => setCopiedBundleId(null), 2000);
  };

  const handleRedownloadHistoryItem = (item: ExportHistoryEntry) => {
    switch (item.category) {
      case "PDF":
        handleRunLivePdfGeneration();
        break;
      case "OVERLEAF_ZIP":
        handleGenerateNewOverleafBundle();
        break;
      case "LATEX_TYPST":
        if (item.fileName.endsWith(".typ")) {
          onTriggerDownloadTypst();
        } else {
          onTriggerDownloadLatex();
        }
        break;
      case "EXCEL_CSV":
        onTriggerDownloadEvalExcel();
        break;
      case "HTML_JSON":
      default:
        onTriggerDownloadHtml();
        break;
    }
  };

  const handleDeleteEntry = (id: string) => {
    const next = exportHistory.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    onUpdateExportHistory(next);
  };

  const handleClearAllHistory = () => {
    const seeded = getInitialSeededExportHistory(track, sem).slice(0, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    onUpdateExportHistory(seeded);
  };

  const totalSizeKb = exportHistory.reduce((acc, i) => acc + (i.fileSizeKb || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[93vh] animate-in fade-in zoom-in-95 duration-200">
        {/* الترويسة العليا للوحة التحكم المركزية للملفات المصدرة */}
        <div className="bg-gradient-to-l from-indigo-950 via-slate-900 to-slate-950 px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  لوحة القيادة المركزية للملفات المصدّرة وسجل التحميلات وحزم Overleaf
                </h2>
                <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Export & Overleaf Hub
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                مراقبة فورية لحالة توليد ملفات الـ PDF، أرشيف التحميلات، والوصول السريع لحزم Overleaf المصدّرة مؤخراً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenExportCenter && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenExportCenter();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>تخصيص إعدادات التصدير</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
              title="إغلاق النافذة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* شريط التبويب الرئيسي: أرشيف الملفات وحزم Overleaf مقابل الطباعة المجمعة للمستندات بإعدادات موحدة */}
        <div className="bg-slate-950/90 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveDashboardTab("HISTORY_OVERLEAF")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
                activeDashboardTab === "HISTORY_OVERLEAF"
                  ? "bg-gradient-to-l from-amber-500 to-orange-600 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>أرشيف التحميلات وحزم Overleaf ({exportHistory.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDashboardTab("BATCH_PRINT")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
                activeDashboardTab === "BATCH_PRINT"
                  ? "bg-gradient-to-l from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25"
                  : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              }`}
            >
              <Printer className="w-4 h-4 text-cyan-300" />
              <span>الطباعة المجمعة للمستندات بإعدادات موحدة (Batch Print Studio)</span>
            </button>
          </div>
          {activeDashboardTab === "BATCH_PRINT" && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-cyan-300 font-bold bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                {selectedBatchDocs.length} وثائق مختارة · {batchCopies} نسخة
              </span>
            </div>
          )}
        </div>

        {/* المحتوى الرئيسي القابل للتمرير */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 studio-scroll">
          {activeDashboardTab === "BATCH_PRINT" ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* إشعار نجاح الطباعة */}
              {batchExecutedNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{batchExecutedNotice}</span>
                </div>
              )}

              {/* 1. لوحة إعدادات الطابعة الموحدة (Shared Printer Settings) */}
              <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-black text-white">
                        إعدادات الطابعة الموحدة للحزمة (Shared Printer Settings)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        تُطبق هذه الإعدادات المشتركة بدقة وتجانس على كافة الوثائق المحددة في أمر الطباعة المجمعة
                      </p>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                    Shared Print Profile
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* أ. عدد النسخ للقسم مع أزرار سريعة */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileStack className="w-3.5 h-3.5 text-indigo-400" />
                        <span>عدد النسخ (Copies):</span>
                      </label>
                      <span className="font-mono text-xs font-black text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {batchCopies}x
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={batchCopies}
                        onChange={(e) =>
                          setBatchCopies(
                            Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setBatchCopies(1)}
                        className={`px-1.5 py-0.5 rounded border cursor-pointer ${
                          batchCopies === 1
                            ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        1 (معاينة)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchCopies(25)}
                        className={`px-1.5 py-0.5 rounded border cursor-pointer ${
                          batchCopies === 25
                            ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        25 (فوج)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchCopies(35)}
                        className={`px-1.5 py-0.5 rounded border cursor-pointer ${
                          batchCopies === 35
                            ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        35 (قسم)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchCopies(40)}
                        className={`px-1.5 py-0.5 rounded border cursor-pointer ${
                          batchCopies === 40
                            ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        40 (كامل)
                      </button>
                    </div>
                  </div>

                  {/* ب. نطاق الصفحات الموحد (Page Range) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>نطاق الصفحات (Page Range):</span>
                    </label>
                    <select
                      value={batchPageRange}
                      onChange={(e) => setBatchPageRange(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="ALL">كل صفحات الوثائق (All Pages)</option>
                      <option value="PAGE_1">الصفحة الأولى فقط (Page 1 Only)</option>
                      <option value="PAGES_1_2">الصفحتان 1 و 2 فقط (Pages 1-2)</option>
                      <option value="CUSTOM">نطاق مخصص (Custom Range)</option>
                    </select>
                    {batchPageRange === "CUSTOM" && (
                      <input
                        type="text"
                        value={batchCustomRange}
                        onChange={(e) => setBatchCustomRange(e.target.value)}
                        placeholder="مثال: 1-2 أو 1,3"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                      />
                    )}
                    <span className="text-[10px] text-slate-400 block">
                      {batchPageRange === "ALL" && "طباعة كافة أوراق المواضيع والملاحق"}
                      {batchPageRange === "PAGE_1" && "اقتصار الطباعة على ورقة الأسئلة الأولى"}
                      {batchPageRange === "PAGES_1_2" && "طباعة ص 1 وص 2 وتجاوز ملاحق الدعم"}
                      {batchPageRange === "CUSTOM" && `تطبيق النطاق المحدد (${batchCustomRange})`}
                    </span>
                  </div>

                  {/* ج. الاتجاه المطبعي الموحد (Orientation) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5 text-emerald-400" />
                      <span>الاتجاه المطبعي (Orientation):</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setBatchOrientation("PORTRAIT")}
                        className={`px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold border transition cursor-pointer text-center ${
                          batchOrientation === "PORTRAIT"
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:text-white"
                        }`}
                      >
                        عمودي (Portrait)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchOrientation("LANDSCAPE")}
                        className={`px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold border transition cursor-pointer text-center ${
                          batchOrientation === "LANDSCAPE"
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:text-white"
                        }`}
                      >
                        أفقي (Landscape)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatchOrientation("AUTO")}
                        className={`px-1.5 py-1.5 rounded-lg text-[10.5px] font-bold border transition cursor-pointer text-center ${
                          batchOrientation === "AUTO"
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:text-white"
                        }`}
                      >
                        تلقائي (Auto)
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {batchOrientation === "PORTRAIT" && "توجيه عمودي موحد مناسب للفرض المدرسي"}
                      {batchOrientation === "LANDSCAPE" && "توجيه أفقي لشبكات التنقيط والجداول"}
                      {batchOrientation === "AUTO" && "ضبط الاتجاه ذكياً بحسب كل وثيقة"}
                    </span>
                  </div>

                  {/* د. نمط الطي وحجم الورق والوجهين (Duplex & Folding) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                      <span>تنسيق الورق والوجهين:</span>
                    </label>
                    <div className="space-y-1">
                      <select
                        value={batchPaperFormat}
                        onChange={(e) => setBatchPaperFormat(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="A4_STANDARD">ورق A4 فردي قياسي</option>
                        <option value="A5_BOOKLET_FOLDED">كتيب A5 مطوي (وفر 50% ورق)</option>
                      </select>
                      <select
                        value={batchDuplex}
                        onChange={(e) => setBatchDuplex(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="DUPLEX_RECTO_VERSO">وجهان (Recto-Verso)</option>
                        <option value="SIMPLEX_ONE_SIDED">وجه واحد (Simplex)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* حاسبة استهلاك الورق والميزانية المباشرة */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/25 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-black text-sm">
                      {totalPhysicalSheetsForClass}
                    </div>
                    <div>
                      <div className="font-bold text-white">
                        إجمالي الأوراق الفيزيائية المطلوبة: <span className="font-mono text-cyan-300">{totalPhysicalSheetsForClass} ورقة A4</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        لـ ({batchCopies} تلميذ) · {selectedBatchDocs.length} وثائق مختارة · {totalRawPagesPerSet} صفحة أصلية لكل مجموعة
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {paperSavingsPercent > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold font-mono text-[11px]">
                        وفر ورقي للمؤسسة: {paperSavingsPercent}% 🌱
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleExecuteSharedBatchPrint}
                      disabled={selectedBatchDocIds.length === 0}
                      className="px-4 py-2 rounded-xl bg-gradient-to-l from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition disabled:opacity-50"
                    >
                      <Printer className="w-4 h-4" />
                      <span>بدء الطباعة المجمعة بالإعدادات الموحدة الآن</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. قائمة اختيار وثائق الفرض المجمعة (Document Selection Queue) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white">
                      حدد الوثائق المراد إدراجها في أمر الطباعة المجمعة:
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleSelectAllBatchDocs(true)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold cursor-pointer transition"
                    >
                      تحديد الكل
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAllBatchDocs(false)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {batchAvailableDocs.map((doc) => {
                    const isSelected = selectedBatchDocIds.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleToggleBatchDoc(doc.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? "bg-slate-900/90 border-cyan-500/50 shadow-sm"
                            : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-60"
                        }`}
                      >
                        <div className="mt-0.5 text-cyan-400">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white">
                              {doc.titleAr}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              ~{doc.pagesEstimated} ص · {doc.orientation === "PORTRAIT" ? "عمودي" : "أفقي"}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 leading-snug">
                            {doc.descAr}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* 1. بطاقات المؤشرات السريعة + مراقب حالة توليد PDF المباشر */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* مراقب حالة توليد الـ PDF والحزم (PDF Generation Status Monitor) */}
            <div className="lg:col-span-7 bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-4 space-y-3 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      pdfJobState.status === "GENERATING"
                        ? "bg-amber-400 animate-ping"
                        : "bg-emerald-400"
                    }`}
                  />
                  <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-cyan-400" />
                    <span>حالة محرك توليد الـ PDF والمطابقة المطبعية (PDF Generation Status)</span>
                  </h3>
                </div>
                <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {pdfJobState.status === "GENERATING" ? "قيد التوليد..." : "مُعاير وجاهز 100%"}
                </span>
              </div>

              {/* شريط تقدم توليد PDF التفاعلي */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>{pdfJobState.stepLabel}</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {pdfJobState.progress}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${pdfJobState.progress}%` }}
                  />
                </div>
              </div>

              {/* تفاصيل الإعدادات النشطة لملف PDF */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2">
                  <span className="text-slate-400 block text-[10px]">المسلك والدورة</span>
                  <span className="font-bold text-white truncate block">
                    {track.code} · {sem}
                  </span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2">
                  <span className="text-slate-400 block text-[10px]">فراغ إجابة التلميذ</span>
                  <span className="font-bold text-emerald-300 block">
                    {includeAnswerWorkspace ? "مُفعّل (إجابة كاملة)" : "غير مفعّل (موضوع فقط)"}
                  </span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2">
                  <span className="text-slate-400 block text-[10px]">عناصر الإجابة والباريم</span>
                  <span className="font-bold text-amber-300 block">
                    {includeDetailedSolutions ? "مرفقة بالكامل" : "بدون تصحيح"}
                  </span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2">
                  <span className="text-slate-400 block text-[10px]">آخر تحديث للمحرك</span>
                  <span className="font-bold text-cyan-300 block">
                    {pdfJobState.lastGeneratedTime}
                  </span>
                </div>
              </div>

              {/* أزرار التوليد المباشر */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRunLivePdfGeneration}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-l from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>توليد وطباعة PDF الآن</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateNewOverleafBundle}
                  disabled={isExportingZipNow}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 font-black text-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>
                    {isExportingZipNow
                      ? "جاري ضغط حزمة Overleaf..."
                      : "تصدير حزمة Overleaf (.zip) جديدة"}
                  </span>
                </button>
              </div>
            </div>

            {/* إحصائيات مركز التحميلات وحزم Overleaf */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">إجمالي الملفات المصدّرة</span>
                  <Download className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-black text-white font-mono">
                    {exportHistory.length}
                  </span>
                  <span className="text-xs text-slate-400 mr-1.5">ملفاً محفوظاً</span>
                </div>
                <div className="text-[10.5px] text-emerald-400 font-mono">
                  الحجم الكلي: {totalSizeKb.toFixed(1)} KB
                </div>
              </div>

              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">حزم Overleaf الجاهزة</span>
                  <FolderArchive className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-black text-amber-300 font-mono">
                    {overleafBundles.length}
                  </span>
                  <span className="text-xs text-slate-300 mr-1.5">حزمة ZIP قياسية</span>
                </div>
                <div className="text-[10.5px] text-slate-400 font-mono">
                  main.tex + preamble.tex
                </div>
              </div>

              <div className="col-span-2 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>الربط الفوري مع منصة Overleaf السحابية</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ارفع ملف الـ ZIP المصدّر مباشرة في Overleaf مع ضبط المترجم على XeLaTeX.
                  </p>
                </div>
                <a
                  href="https://www.overleaf.com/project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition"
                >
                  <span>فتح Overleaf</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* 2. قسم الروابط السريعة لحزم Overleaf المصدّرة مؤخراً (Quick Links to Recently Exported Overleaf Bundles) */}
          <div className="bg-slate-950/75 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-white">
                  روابط الوصول السريع لحزم Overleaf المصدّرة مؤخراً (Recent Overleaf Bundles)
                </h3>
                <span className="text-[10.5px] font-mono bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {overleafBundles.length} حزم متاحة
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                XeLaTeX · Polyglossia/Babel · tcolorbox · TikZ/PGFPlots
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {overleafBundles.slice(0, 6).map((bundle) => {
                const isCopied = copiedBundleId === bundle.id;
                return (
                  <div
                    key={bundle.id}
                    className="bg-slate-900/95 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3.5 flex flex-col justify-between gap-3 transition group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="font-mono text-xs font-black text-amber-300 truncate block"
                          dir="ltr"
                          title={bundle.fileName}
                        >
                          {bundle.fileName}
                        </span>
                        <span className="shrink-0 text-[10px] font-mono bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                          {bundle.fileSizeKb} KB
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 font-bold">
                        {bundle.trackLabelAr} · {bundle.semester}
                      </div>

                      <div className="flex flex-wrap items-center gap-1 pt-0.5" dir="ltr">
                        {(
                          bundle.includedFiles || [
                            "main.tex",
                            "preamble.tex",
                            "README_OVERLEAF.md",
                          ]
                        ).map((fName) => (
                          <span
                            key={fName}
                            className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                          >
                            {fName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatRelativeTime(bundle.createdAtIso)}
                        </span>
                        <span className="font-mono text-cyan-300">{bundle.dpiOrCompiler}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={handleGenerateNewOverleafBundle}
                          className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-[10.5px] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                          title="إعادة تنزيل حزمة ZIP"
                        >
                          <Download className="w-3 h-3" />
                          <span>تنزيل .ZIP</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyBundleLatex(bundle.id, bundle.cachedContent)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10.5px] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                          title="نسخ كود main.tex مباشرة"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-cyan-400" />
                              <span>نسخ .tex</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewEntry(bundle)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 text-indigo-300 border border-slate-700 text-[10.5px] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                          title="معاينة محتوى الحزمة"
                        >
                          <Eye className="w-3 h-3" />
                          <span>معاينة</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. معاينة الكود السريعة عند اختيار ملف من السجل */}
          {previewEntry && (
            <div className="bg-slate-950 border border-indigo-500/40 rounded-2xl p-4 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-white" dir="ltr">
                    {previewEntry.fileName}
                  </span>
                  <span className="text-[10.5px] text-slate-400">
                    ({previewEntry.formatLabel} · {previewEntry.trackLabelAr})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewEntry(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
                >
                  إغلاق المعاينة ✕
                </button>
              </div>
              <pre
                dir="ltr"
                className="text-[11px] font-mono text-emerald-300 bg-slate-900/90 p-3 rounded-xl max-h-48 overflow-y-auto studio-scroll leading-relaxed"
              >
                {(
                  previewEntry.cachedContent ||
                  (previewEntry.fileName.endsWith(".typ") ? typstCode : latexCode)
                ).slice(0, 2600)}
              </pre>
            </div>
          )}

          {/* 4. سجل التحميلات المركزي الكامل مع التصفية والبحث (Download History & Archive Table) */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs sm:text-sm font-black text-white">
                  سجل التحميلات وأرشيف الملفات المصدّرة (Download History)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* شريط البحث */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الملف أو المسلك..."
                    className="bg-slate-900 border border-slate-700 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-60"
                  />
                </div>

                {/* أزرار التصفية حسب الصيغة */}
                <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                  <Filter className="w-3 h-3 text-slate-400 mx-1" />
                  {(
                    [
                      { id: "ALL", label: "الكل" },
                      { id: "PDF", label: "PDF" },
                      { id: "OVERLEAF_ZIP", label: "Overleaf ZIP" },
                      { id: "LATEX_TYPST", label: "LaTeX / Typst" },
                      { id: "EXCEL_CSV", label: "Excel / مسار" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                        selectedCategory === tab.id
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                  title="تصفير سجل التحميلات"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>مسح السجل</span>
                </button>
              </div>
            </div>

            {/* جدول سجل الملفات المصدّرة */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800 text-[11px]">
                    <th className="py-2.5 px-3 text-right font-bold">اسم الملف المصدّر</th>
                    <th className="py-2.5 px-3 text-center font-bold">الصيغة والنوع</th>
                    <th className="py-2.5 px-3 text-right font-bold">المسلك والدورة</th>
                    <th className="py-2.5 px-3 text-center font-bold">الحالة والمحرك</th>
                    <th className="py-2.5 px-3 text-center font-bold">التوقيت والحجم</th>
                    <th className="py-2.5 px-3 text-center font-bold">إجراءات سريعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-900/60 transition text-slate-200"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {item.category === "OVERLEAF_ZIP" ? (
                            <FolderArchive className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : item.category === "PDF" ? (
                            <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : item.category === "EXCEL_CSV" ? (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <FileCode2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          )}
                          <div>
                            <div
                              className="font-mono font-bold text-white text-xs"
                              dir="ltr"
                            >
                              {item.fileName}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2">
                              {item.includeAnswerWorkspace && (
                                <span className="text-emerald-400">
                                  ✓ مع فراغ الإجابة الكاملة
                                </span>
                              )}
                              {item.includeDetailedSolutions && (
                                <span className="text-amber-300">✓ مع عناصر الإجابة</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700">
                          {item.formatLabel}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-200 text-[11.5px]">
                          {item.trackLabelAr}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {item.semester} · النموذج {item.modelCode}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          مكتمل
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {item.dpiOrCompiler}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                        <div className="text-slate-300">
                          {formatRelativeTime(item.createdAtIso)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.fileSizeKb} KB
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRedownloadHistoryItem(item)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/25 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                            title="إعادة تنزيل وتوليد هذا الملف"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>إعادة التحميل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewEntry(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition"
                            title="معاينة المصدر"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 cursor-pointer transition"
                            title="حذف من السجل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

