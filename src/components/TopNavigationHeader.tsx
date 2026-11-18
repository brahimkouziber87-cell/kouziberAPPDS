import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Award,
  BookOpen,
  BrainCircuit,
  Calculator,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Code2,
  Edit3,
  FileCheck2,
  FileDown,
  FileJson,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  FolderOpen,
  Highlighter,
  Layers,
  LogOut,
  Plus,
  Printer,
  RectangleHorizontal,
  RectangleVertical,
  RefreshCw,
  RotateCcw,
  Scale,
  Settings,
  Share2,
  Sliders,
  Sparkles,
  Stethoscope,
  Table2,
  ScanLine,
  Clock,
  Maximize2,
  Compass,
  Mic,
  Search,
  Zap,
  Tv2,
  TrendingUp,
  Star,
  Split,
  GraduationCap,
} from "lucide-react";
import {
  BilingualLayout,
  DMSubType,
  DocLanguage,
  EducationSystem,
  ExportFormat,
  ModuleType,
} from "../data/curriculum";
import { TeacherLogo, TeacherLogoVariant } from "./TeacherLogo";
import { MATH_SYMBOLS_LIBRARY, MathSymbolItem } from "./MathSymbolPaletteBar";

export interface TopNavigationHeaderProps {
  // Brand & Identity
  prof: string;
  school: string;
  currentTrackCode: string;
  savedBadge: boolean;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  lastSavedTime?: Date | null;
  logoVariant: TeacherLogoVariant;
  customLogoUrl: string | null;
  onOpenLogoStudio: () => void;

  // Core Pedagogical Document Modules & Sub-Modes
  activeModule: ModuleType;
  onSelectModule: (mod: ModuleType) => void;
  dmSubType: DMSubType;
  onSelectDmSubType: (subType: DMSubType) => void;
  dmNumber?: string;
  onCreateNewHomeworkDoc?: () => void;
  homeworkDocsList?: Array<{
    id: string;
    dmNumber: string;
    titleAr: string;
    dueDate: string;
  }>;
  activeHomeworkDocId?: string;
  onSelectHomeworkDoc?: (docId: string) => void;
  ficheContentDetailLevel: "FULL_WITH_PROOFS" | "SYNTHETIC_OFFICIAL";
  onChangeFicheContentDetailLevel: (
    level: "FULL_WITH_PROOFS" | "SYNTHETIC_OFFICIAL"
  ) => void;
  isMission: boolean;
  activeExercisesCount?: number;

  // Document & System Controls
  educationSystem: EducationSystem;
  onSystemChange: (sys: EducationSystem) => void;
  docLang: DocLanguage;
  onChangeDocLang: (lang: DocLanguage) => void;
  bilingualLayout: BilingualLayout;
  onChangeBilingualLayout: (layout: BilingualLayout) => void;
  exportFormat: ExportFormat;
  onChangeExportFormat: (fmt: ExportFormat) => void;
  pageOrientation: "PORTRAIT" | "LANDSCAPE";
  onTogglePageOrientation: () => void;
  includeAnswerWorkspace: boolean;
  onToggleAnswerWorkspace: () => void;
  isInlineEditable?: boolean;
  onToggleInlineEditable?: () => void;

  // Barème & Audit
  totalPoints: number;
  auditScorePercent: number;
  auditIssueCount: number;
  showAuditPanel: boolean;
  onToggleAuditPanel: () => void;
  onOpenBaremeModal: () => void;

  // Document Authoring Labs & Math Symbols
  showMathPalette?: boolean;
  onToggleMathPalette?: () => void;
  onInsertMathSymbol?: (glyph: string, latex?: string) => void;
  onOpenAdvancedPedagogyStudio: () => void;
  onOpenSpec2DMatrix?: () => void;
  onOpenPythonLab: () => void;
  onOpenAiAssistant: () => void;
  onOpenAiPedagogicalAction?: (
    task: "GENERATE_ISOMORPHIC_VARIANT" | "SIMPLIFY_COMPLEX_WORDING"
  ) => void;
  onOpenAiSettings: () => void;
  onOpenWolframVerifier: () => void;
  onOpenJsonConfigModal: () => void;
  onOpenSignTableStudio?: () => void;
  onOpenIntegralAreaStudio?: () => void;
  onOpenSpaceGeometry3DStudio?: () => void;
  onOpenInteractiveCurveSpline?: () => void;
  onOpenPdfHighlighterStudio?: () => void;
  onOpenReprographicsStudio?: () => void;
  onExportCompanionBridgeJson?: () => void;
  selectedAiModel: "gemini-3.8-flash" | "gemini-4-argon";
  onSelectAiModel: (model: "gemini-3.8-flash" | "gemini-4-argon") => void;
  isExamSimulationActive: boolean;
  showImportedExamStudio: boolean;
  onToggleImportedExamStudio: () => void;
  onOpenOcrScanner?: () => void;

  // Export, Overleaf, Print & Cloud Drive
  isExportingPDF: boolean;
  onExportPDF: () => void;
  onExportInstitutionalFoldedA5?: () => void;
  onDirectExportOverleafZip?: () => void;
  onPrintA4: () => void;
  onOpenExportCenter: () => void;
  onOpenExportDashboard: () => void;
  exportHistoryCount: number;
  onOpenBatchPrint: () => void;
  driveConnected: boolean;
  isLoggingInDrive: boolean;
  driveUserDisplayName?: string;
  onDriveSignIn: () => void;
  onToggleDrivePanel: () => void;
  onDriveLogout: () => void;

  // Workspace Layout
  isConfigDeckCollapsed: boolean;
  onToggleConfigDeck: () => void;
  onResetPreferences: () => void;

  // Didactic Inspection & Printing Enhancements
  onOpenDidacticChecklist?: () => void;
  onOpenWeeklyTimetable?: () => void;
  onOpenLessonPresentation?: () => void;
  onOpenGeoGebraLibrary?: () => void;
  onOpenVoiceCommandStudio?: () => void;
  isVoiceListening?: boolean;
  showA4LivePageBreaks?: boolean;
  onToggleA4LivePageBreaks?: () => void;
  economicTwoUpPrintMode?: boolean;
  onToggleEconomicTwoUpPrintMode?: () => void;

  // New Quality Features & Dual Mode
  uiMode?: "ESSENTIAL" | "EXPERT";
  onToggleUiMode?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenClassroomProjection?: () => void;
  onOpenMassarGradebook?: () => void;
  onOpenEvalGridTemplatesLibrary?: () => void;
  onOpenCustomExamComposer?: () => void;
  onOpenAsymptoteVisualizer?: () => void;
  isReadingMode?: boolean;
  onToggleReadingMode?: () => void;
  onOpenFavorites?: () => void;
  favoritesCount?: number;
  onOpenDualExamComparison?: () => void;
  onOpenLmsExport?: () => void;
}

type TopDropdownId =
  | "EVAL_EXERCISES"
  | "PLANNING_DOCS"
  | "MATH_SYMBOLS"
  | "LABS"
  | "OVERLEAF"
  | "PRINT_CENTER"
  | null;

export const TopNavigationHeader: React.FC<TopNavigationHeaderProps> = ({
  prof,
  school,
  currentTrackCode,
  saveStatus = "saved",
  lastSavedTime,
  logoVariant,
  customLogoUrl,
  onOpenLogoStudio,
  activeModule,
  onSelectModule,
  dmSubType,
  onSelectDmSubType,
  dmNumber = "N° 1",
  onCreateNewHomeworkDoc,
  homeworkDocsList = [],
  activeHomeworkDocId,
  onSelectHomeworkDoc,
  ficheContentDetailLevel,
  onChangeFicheContentDetailLevel,
  isMission,
  activeExercisesCount = 3,
  educationSystem,
  onSystemChange,
  docLang,
  onChangeDocLang,
  bilingualLayout,
  onChangeBilingualLayout,
  exportFormat,
  onChangeExportFormat,
  pageOrientation,
  onTogglePageOrientation,
  includeAnswerWorkspace,
  onToggleAnswerWorkspace,
  isInlineEditable = false,
  onToggleInlineEditable,
  totalPoints,
  auditScorePercent,
  auditIssueCount,
  showAuditPanel,
  onToggleAuditPanel,
  onOpenBaremeModal,
  onInsertMathSymbol,
  onOpenAdvancedPedagogyStudio,
  onOpenSpec2DMatrix,
  onOpenPythonLab,
  onOpenAiAssistant,
  onOpenAiPedagogicalAction,
  onOpenAiSettings,
  onOpenWolframVerifier,
  onOpenJsonConfigModal,
  onOpenSignTableStudio,
  onOpenIntegralAreaStudio,
  onOpenSpaceGeometry3DStudio,
  onOpenInteractiveCurveSpline,
  onOpenPdfHighlighterStudio,
  onOpenReprographicsStudio,
  onExportCompanionBridgeJson,
  selectedAiModel,
  isExamSimulationActive,
  onToggleImportedExamStudio,
  onOpenOcrScanner,
  isExportingPDF,
  onExportPDF,
  onExportInstitutionalFoldedA5,
  onDirectExportOverleafZip,
  onPrintA4,
  onOpenExportCenter,
  onOpenExportDashboard,
  exportHistoryCount,
  onOpenBatchPrint,
  driveConnected,
  isLoggingInDrive,
  driveUserDisplayName,
  onToggleDrivePanel,
  onDriveLogout,
  isConfigDeckCollapsed,
  onToggleConfigDeck,
  onResetPreferences,
  onOpenDidacticChecklist,
  onOpenWeeklyTimetable,
  onOpenLessonPresentation,
  onOpenGeoGebraLibrary,
  onOpenVoiceCommandStudio,
  isVoiceListening,
  showA4LivePageBreaks,
  onToggleA4LivePageBreaks,
  economicTwoUpPrintMode,
  onToggleEconomicTwoUpPrintMode,
  uiMode = "EXPERT",
  onToggleUiMode,
  onOpenCommandPalette,
  onOpenEvalGridTemplatesLibrary,
  onOpenCustomExamComposer,
  onOpenAsymptoteVisualizer,
  isReadingMode = false,
  onToggleReadingMode,
  onOpenFavorites,
  favoritesCount = 0,
  onOpenDualExamComparison,
  onOpenLmsExport,
}) => {
  const [openMenu, setOpenMenu] = useState<TopDropdownId>(null);
  const [selectedSymbolCat, setSelectedSymbolCat] = useState<
    "ALL" | "ANALYSIS" | "GEOMETRY" | "SETS_LOGIC" | "GREEK"
  >("ALL");
  const [copyLatexMode, setCopyLatexMode] = useState<boolean>(false);
  const [copiedSymbolText, setCopiedSymbolText] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isScore20 = Math.abs(totalPoints - 20) <= 0.05;

  const isEvalGroupActive =
    activeModule === "DS_142_08" || activeModule === "DM_SERIE";

  const isPlanningGroupActive =
    activeModule === "REPARTITION_CERTIF" ||
    activeModule === "FICHE_OP2007" ||
    activeModule === "DIAGNOSTIC";

  const evalDropdownActiveLabel =
    activeModule === "DS_142_08"
      ? "الفروض المحروسة"
      : activeModule === "DM_SERIE"
      ? dmSubType === "SERIE_TD"
        ? "سلاسل التمارين"
        : `الفروض المنزلية (${dmNumber})`
      : "الفروض والسلاسل";

  const planningDropdownActiveLabel =
    activeModule === "REPARTITION_CERTIF"
      ? "التوزيع السنوي"
      : activeModule === "FICHE_OP2007"
      ? ficheContentDetailLevel === "SYNTHETIC_OFFICIAL"
        ? "ملخصات الدروس"
        : "الجذاذات التربوية"
      : activeModule === "DIAGNOSTIC"
      ? "الروائز التشخيصية"
      : "التوزيع والجذاذات";

  const toggleDropdown = (id: Exclude<TopDropdownId, null>) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const filteredMathSymbols =
    selectedSymbolCat === "ALL"
      ? MATH_SYMBOLS_LIBRARY
      : MATH_SYMBOLS_LIBRARY.filter((s) => s.category === selectedSymbolCat);

  const handleSelectMathSymbol = (item: MathSymbolItem) => {
    const textToCopy = copyLatexMode && item.latex ? item.latex : item.glyph;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopiedSymbolText(textToCopy);
    window.setTimeout(() => {
      setCopiedSymbolText(null);
    }, 1600);
    if (onInsertMathSymbol) {
      onInsertMathSymbol(textToCopy, item.latex);
    }
  };

  return (
    <>
      {/* =====================================================================
          المستوى الأول: الشريط العلوي المؤسسي المخصص لإنتاج الوثائق البيداغوجية
          يضم القوائم المنسدلة المنظمة:
          1) الفروض المحروسة · السلاسل · الفروض المنزلية
          2) التوزيع السنوي · الجذاذات · ملخصات الدروس · التشخيص
          3) لوحة الرموز والعمليات الرياضية (∫∑ الرموز)
          4) لائحة المختبرات (لصناعة ورسم مكونات الوثيقة الرياضية)
          5) لائحة Overleaf (LaTeX / Typst / حزم المشاريع)
          6) لائحة مركز الطبع (PDF A4 / A5 مطوي للمؤسسات / الطباعة المجمعة)
         ===================================================================== */}
      <header
        ref={menuContainerRef}
        className="top-navigation-header cool-header-gradient sticky top-0 z-40 no-print text-white border-b border-cyan-500/30 px-2 xl:px-4 py-1.5 min-h-[46px] flex flex-wrap items-center justify-between gap-1.5 xl:gap-2.5"
      >
        {/* Zone 1: الهوية البصرية والمؤسسية (إنتاج الوثائق البيداغوجية) */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <button
            type="button"
            onClick={onOpenLogoStudio}
            className={`cursor-pointer w-7 h-7 ${
              logoVariant === "DOC2APP_MONO" ? "rounded-lg" : "rounded-full"
            } p-0.5 ${
              logoVariant === "DOC2APP_MONO"
                ? "bg-gradient-to-tr from-slate-300 via-white to-slate-400 shadow-sm shadow-white/15"
                : "bg-gradient-to-tr from-cyan-400 via-sky-400 to-teal-400 shadow-sm shadow-cyan-500/30"
            } shrink-0 self-center flex items-center justify-center transition-transform hover:scale-105`}
            title="Doc2App — تخصيص الهوية البصرية والشعار الأكاديمي للوثائق"
          >
            <TeacherLogo
              variant={logoVariant}
              size={24}
              customImageUrl={customLogoUrl}
            />
          </button>

          <div className="min-w-0 flex flex-col justify-center self-center gap-0.5">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                onOpenLogoStudio();
              }}
              className="text-xs font-black tracking-tight text-white hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 leading-none flex items-center gap-1"
            >
              <span
                dir="ltr"
                className="font-mono text-[10.5px] font-black tracking-wider text-cyan-300"
              >
                ∫DOC2APP
              </span>
              <span aria-hidden="true" className="text-slate-500">
                ·
              </span>
              <span className="hidden md:inline text-[11.5px]">
                إنتاج الوثائق البيداغوجية
              </span>
              <span className="md:hidden text-[11px]">إنتاج الوثائق</span>
            </a>
            <div className="text-[9.5px] text-slate-300 flex items-center gap-1 whitespace-nowrap leading-none">
              <span className="font-bold text-white truncate max-w-[90px]">
                {prof}
              </span>
              <span aria-hidden="true" className="text-cyan-400/70">
                ·
              </span>
              <span className="hidden lg:inline truncate max-w-[95px] text-slate-300">
                {school}
              </span>
              <span aria-hidden="true" className="hidden lg:inline text-cyan-400/70">
                ·
              </span>
              <span className="font-mono text-[9.5px] font-bold text-cyan-300">
                {currentTrackCode}
              </span>
              <span aria-hidden="true" className="text-cyan-400/70">
                ·
              </span>
              {saveStatus === "saving" ? (
                <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-cyan-300">
                  <RefreshCw className="w-2.5 h-2.5 text-cyan-300 animate-spin shrink-0" />
                  <span>حفظ</span>
                </span>
              ) : saveStatus === "error" ? (
                <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-rose-300">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                  <span>تنبيه</span>
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-0.5 text-[9.5px] font-semibold text-emerald-300/95"
                  title={
                    lastSavedTime
                      ? `الوثيقة محفوظة تلقائياً (${lastSavedTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })})`
                      : "الوثيقة محفوظة تلقائياً"
                  }
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  <span className="hidden xl:inline">محفوظ</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Zone 1.5: أزرار لوحة الأوامر السريعة ونمط الواجهة */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="flex items-center gap-1 h-7 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all text-[10.5px] font-semibold cursor-pointer shadow-xs"
              title="لوحة الأوامر السريعة الشاملة (Ctrl+K / ⌘K)"
            >
              <Search className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="hidden 2xl:inline text-[10.5px] font-bold">بحث</span>
              <kbd className="font-mono text-[9.5px] bg-slate-950/80 border border-slate-700/90 text-cyan-300 px-1 py-0.2 rounded font-black">
                ⌘K
              </kbd>
            </button>
          )}

          {onToggleUiMode && (
            <button
              type="button"
              onClick={onToggleUiMode}
              className={`h-7 px-2 rounded-lg text-[10.5px] font-black transition-all flex items-center gap-1 cursor-pointer border ${
                uiMode === "ESSENTIAL"
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/80"
              }`}
              title={
                uiMode === "ESSENTIAL"
                  ? "التبديل إلى نمط الاستوديو الخبير المتقدم"
                  : "التبديل إلى النمط السريع المبسط (3 نقرات فقط)"
              }
            >
              <Zap className={`w-3 h-3 shrink-0 ${uiMode === "ESSENTIAL" ? "text-slate-950" : "text-amber-400"}`} />
              <span>{uiMode === "ESSENTIAL" ? "3 نقرات" : "متقدم"}</span>
            </button>
          )}
        </div>

        {/* Zone 2: القوائم المنسدلة المنظمة في الشريط العلوي */}
        <nav
          aria-label="القوائم المنسدلة الرئيسية لإنتاج الوثائق البيداغوجية"
          className="flex flex-wrap items-center gap-1 shrink-0"
        >
          {/* =================================================================
              1. اللائحة المنسدلة الأولى: الفروض المحروسة · السلاسل · الفروض المنزلية
             ================================================================= */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("EVAL_EXERCISES")}
              className={`h-7 px-2 rounded-lg text-[11px] font-black whitespace-nowrap shrink-0 flex items-center gap-1 transition-all cursor-pointer border ${
                openMenu === "EVAL_EXERCISES"
                  ? "bg-cyan-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/25"
                  : isEvalGroupActive
                  ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 text-slate-950 border-cyan-300 shadow-sm shadow-cyan-500/20"
                  : "bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/90"
              }`}
              title="لائحة إنتاج الفروض المحروسة، السلاسل، والفروض المنزلية"
            >
              <FileCheck2
                className={`w-3 h-3 shrink-0 ${
                  openMenu === "EVAL_EXERCISES" || isEvalGroupActive
                    ? "text-slate-950"
                    : "text-cyan-400"
                }`}
              />
              <span>{evalDropdownActiveLabel}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-150 ${
                  openMenu === "EVAL_EXERCISES" ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openMenu === "EVAL_EXERCISES" && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl p-2.5 z-50 text-right space-y-1.5"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>إنتاج وثائق التقويم والتمارين</span>
                    <span className="font-mono text-cyan-400 tabular-nums">
                      {activeExercisesCount} تمارين · {totalPoints.toFixed(1)}/20
                    </span>
                  </div>

                  {/* 1.1 الفروض المحروسة */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule("DS_142_08");
                      setOpenMenu(null);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      activeModule === "DS_142_08"
                        ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 font-black"
                        : "hover:bg-slate-800 text-slate-100 font-bold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="text-right">
                        <div>الفروض المحروسة (Devoirs Surveillés)</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          مذكرة 142-08 · نماذج A/B/C/D وعناصر الإجابة
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 shrink-0">
                      DS
                    </span>
                  </button>

                  {/* 1.2 السلاسل (سلاسل التمارين TD) */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule("DM_SERIE");
                      onSelectDmSubType("SERIE_TD");
                      setOpenMenu(null);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      activeModule === "DM_SERIE" && dmSubType === "SERIE_TD"
                        ? "bg-teal-500/20 text-teal-200 border border-teal-500/50 font-black"
                        : "hover:bg-slate-800 text-slate-100 font-bold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-teal-400 shrink-0" />
                      <div className="text-right">
                        <div>السلاسل (سلاسل التمارين Séries TD)</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          تدرج الكفايات N1→N2→N3 مع تذكير القواعد
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-teal-300 shrink-0">
                      TD
                    </span>
                  </button>

                  {/* 1.3 الفروض المنزلية (Devoirs Maison DM) مدمجة مع خيار إضافة فرض منزلي جديد */}
                  <div
                    className={`w-full p-1.5 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors border ${
                      activeModule === "DM_SERIE" && dmSubType === "DEVOIR_MAISON"
                        ? "bg-sky-500/20 text-sky-200 border-sky-500/50"
                        : "bg-slate-900/60 hover:bg-slate-800 text-slate-100 border-slate-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectModule("DM_SERIE");
                        onSelectDmSubType("DEVOIR_MAISON");
                        setOpenMenu(null);
                      }}
                      className="flex-1 flex items-center gap-2.5 text-right cursor-pointer py-1 px-1.5"
                    >
                      <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="text-right">
                        <div className="font-bold flex items-center gap-1.5">
                          <span>الفروض المنزلية (Devoirs Maison DM)</span>
                          <span className="text-[10px] font-mono text-sky-300 font-bold">
                            {dmNumber}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          وظائف منزلية للبحث والتعمق وتاريخ الإرجاع
                        </div>
                      </div>
                    </button>

                    {onCreateNewHomeworkDoc && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateNewHomeworkDoc();
                          setOpenMenu(null);
                        }}
                        className="px-2 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-[10.5px] flex items-center gap-1 transition cursor-pointer shadow-xs shrink-0"
                        title="إنشاء وثيقة فرض منزلي جديدة مستقلة"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>فرض جديد</span>
                      </button>
                    )}
                  </div>

                  {/* قائمة وثائق الفروض المنزلية المستقلة المنشأة للتبديل السريع بينها */}
                  {homeworkDocsList.length > 0 && onSelectHomeworkDoc && (
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1">
                        <span>وثائق الفروض المنزلية المستقلة:</span>
                        <span className="font-mono text-sky-400">
                          {homeworkDocsList.length} وثائق
                        </span>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-0.5">
                        {homeworkDocsList.map((hwDoc) => {
                          const isCurrentHw =
                            activeModule === "DM_SERIE" &&
                            dmSubType === "DEVOIR_MAISON" &&
                            activeHomeworkDocId === hwDoc.id;
                          return (
                            <button
                              key={hwDoc.id}
                              type="button"
                              onClick={() => {
                                onSelectHomeworkDoc(hwDoc.id);
                                setOpenMenu(null);
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2 text-[11px] transition-colors cursor-pointer ${
                                isCurrentHw
                                  ? "bg-sky-500/25 text-sky-200 border border-sky-400/50 font-black"
                                  : "hover:bg-slate-800/90 text-slate-300 font-semibold"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3 h-3 text-sky-400 shrink-0" />
                                <span className="truncate">{hwDoc.titleAr}</span>
                              </div>
                              <span className="text-[9.5px] font-mono text-slate-400 shrink-0">
                                {hwDoc.dmNumber}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* أدوات بناء وهندسة الفرض داخل اللائحة */}
                  <div className="border-t border-slate-800 pt-1.5 mt-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenBaremeModal();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Scale className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>مدبر سلم التنقيط وتجزئة النقط</span>
                      </div>
                      <span className="text-[10px] font-mono text-teal-300 tabular-nums">
                        {totalPoints.toFixed(2)}/20
                      </span>
                    </button>

                    {onOpenSpec2DMatrix && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onOpenSpec2DMatrix();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-cyan-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Table2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>جدول التخصيص ثنائي الأبعاد (142-08)</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300">
                          2D Spec
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onToggleImportedExamStudio();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-amber-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>محاكاة فرض مستورد (PDF أو صورة)</span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300">
                        {isExamSimulationActive ? "نشط" : "محاكاة"}
                      </span>
                    </button>

                    {onOpenOcrScanner && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onOpenOcrScanner();
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-200 flex items-center justify-between gap-2 text-xs font-black transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ScanLine className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="text-right">
                            <div>التصحيح التلقائي للأوراق الممسوحة (OCR) وإنتاج وثيقة التصحيح</div>
                            <div className="text-[10px] text-slate-300 font-normal">
                              تصحيح آلي لأوراق التلاميذ بالذكاء الاصطناعي وتوليد مطبوع التصحيح والدعم (PDF)
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                          OCR Grader
                        </span>
                      </button>
                    )}

                    {onOpenCustomExamComposer && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onOpenCustomExamComposer();
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>تأليف امتحان تركيبي هجين (Hybrid Composer)</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300">
                          Σ 20/20
                        </span>
                      </button>
                    )}

                    {onOpenEvalGridTemplatesLibrary && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onOpenEvalGridTemplatesLibrary();
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-teal-950/40 hover:bg-teal-900/50 border border-teal-500/40 text-teal-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Table2 className="w-4 h-4 text-teal-400 shrink-0" />
                          <span>مكتبة قوالب شبكات التقويم الرسمية (142-08)</span>
                        </div>
                        <span className="text-[10px] font-mono text-teal-300">
                          142-08
                        </span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =================================================================
              2. اللائحة المنسدلة الثانية: التوزيع السنوي · الجذاذات · ملخصات الدروس · التشخيص
             ================================================================= */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("PLANNING_DOCS")}
              className={`h-7 px-2 rounded-lg text-[11px] font-black whitespace-nowrap shrink-0 flex items-center gap-1 transition-all cursor-pointer border ${
                openMenu === "PLANNING_DOCS"
                  ? "bg-cyan-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/25"
                  : isPlanningGroupActive
                  ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 text-slate-950 border-cyan-300 shadow-sm shadow-cyan-500/20"
                  : "bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/90"
              }`}
              title="لائحة التوزيع السنوي، الجذاذات، ملخصات الدروس، والتشخيص"
            >
              <BookOpen
                className={`w-3 h-3 shrink-0 ${
                  openMenu === "PLANNING_DOCS" || isPlanningGroupActive
                    ? "text-slate-950"
                    : "text-teal-400"
                }`}
              />
              <span>{planningDropdownActiveLabel}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-150 ${
                  openMenu === "PLANNING_DOCS" ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openMenu === "PLANNING_DOCS" && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl p-2.5 z-50 text-right space-y-1.5"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>وثائق التخطيط والسيناريو البيداغوجي</span>
                    <span className="font-mono text-teal-400">OP 2007</span>
                  </div>

                  {/* 2.1 التوزيع السنوي */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule("REPARTITION_CERTIF");
                      setOpenMenu(null);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      activeModule === "REPARTITION_CERTIF"
                        ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 font-black"
                        : "hover:bg-slate-800 text-slate-100 font-bold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarRange className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="text-right">
                        <div>التوزيع السنوي (Progression Annuelle)</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          توزيع الأسابيع، الغلاف الزمني، ومحطات الفروض
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 shrink-0">
                      S1/S2
                    </span>
                  </button>

                  {/* 2.2 الجذاذات التربوية */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule("FICHE_OP2007");
                      onChangeFicheContentDetailLevel("FULL_WITH_PROOFS");
                      setOpenMenu(null);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      activeModule === "FICHE_OP2007" &&
                      ficheContentDetailLevel === "FULL_WITH_PROOFS"
                        ? "bg-teal-500/20 text-teal-200 border border-teal-500/50 font-black"
                        : "hover:bg-slate-800 text-slate-100 font-bold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-teal-400 shrink-0" />
                      <div className="text-right">
                        <div>
                          {isMission
                            ? "الجذاذات وأنشطة Python"
                            : "الجذاذات التربوية (Fiches OP 2007)"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          السيناريو الديداكتيكي الكامل مع البراهين والأنشطة
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-teal-300 shrink-0">
                      Fiche
                    </span>
                  </button>

                  {/* 2.3 ملخصات الدروس */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule("FICHE_OP2007");
                      onChangeFicheContentDetailLevel("SYNTHETIC_OFFICIAL");
                      setOpenMenu(null);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      activeModule === "FICHE_OP2007" &&
                      ficheContentDetailLevel === "SYNTHETIC_OFFICIAL"
                        ? "bg-amber-500/20 text-amber-200 border border-amber-500/50 font-black"
                        : "hover:bg-slate-800 text-slate-100 font-bold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="text-right">
                        <div>ملخصات الدروس (Résumés & Fiches Mémo)</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          الملخص الرسمي المركز للتعاريف والخاصيات والمبرهنات
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 shrink-0">
                      Résumé
                    </span>
                  </button>

                  {/* 2.4 التشخيص (الروائز التشخيصية) */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule("DIAGNOSTIC");
                      setOpenMenu(null);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      activeModule === "DIAGNOSTIC"
                        ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 font-black"
                        : "hover:bg-slate-800 text-slate-100 font-bold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="text-right">
                        <div>التشخيص (وثيقة الرائز التشخيصي)</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          إنتاج رائز المكتسبات القبلية وشبكة التصحيح
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 shrink-0">
                      Diag
                    </span>
                  </button>

                  {/* بطاقة التأشير الديداكتيكي للوثائق */}
                  {onOpenDidacticChecklist && (
                    <div className="border-t border-slate-800 pt-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onOpenDidacticChecklist();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-cyan-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>بطاقة التأشير الديداكتيكي للوثيقة (142-08)</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300">
                          Visa
                        </span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =================================================================
              3. اللائحة المنسدلة للرموز والعمليات الرياضية في الشريط العلوي (∫∑ الرموز)
             ================================================================= */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("MATH_SYMBOLS")}
              className={`h-7 px-2 rounded-lg text-[11px] font-black whitespace-nowrap shrink-0 flex items-center gap-1 transition-all cursor-pointer border ${
                openMenu === "MATH_SYMBOLS"
                  ? "bg-slate-800 text-cyan-300 border-cyan-400 shadow-md"
                  : "bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/90"
              }`}
              title="لوحة الرموز والعمليات الرياضية السريعة في الشريط العلوي (∫, ∑, ℝ, u⃗, lim)"
            >
              <span className="font-serif text-xs font-black text-cyan-400">
                ∫∑
              </span>
              <span>الرموز</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                  openMenu === "MATH_SYMBOLS" ? "rotate-180 text-cyan-300" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openMenu === "MATH_SYMBOLS" && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-[360px] sm:w-[430px] rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl p-3 z-50 text-right space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-700/60 text-cyan-300 flex items-center justify-center font-serif text-xs font-black">
                        ∫∑
                      </span>
                      <div>
                        <div className="text-xs font-black text-white">
                          لوحة الرموز والعمليات الرياضية
                        </div>
                        <div className="text-[10px] text-slate-400">
                          انقر على أي رمز لنسخه فوراً إلى الحافظة
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCopyLatexMode((v) => !v)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer ${
                        copyLatexMode
                          ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                          : "bg-slate-800 text-cyan-300 border-slate-700 hover:bg-slate-700"
                      }`}
                      title="تبديل وضع النسخ بين الرمز الرياضي المباشر (∫) أو صيغة LaTeX (\int)"
                    >
                      {copyLatexMode ? "نسخ: كود LaTeX" : "نسخ: رمز مباشر"}
                    </button>
                  </div>

                  {copiedSymbolText && (
                    <div className="px-2.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-[11px] font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>تم نسخ الرمز إلى الحافظة:</span>
                      </span>
                      <code
                        dir="ltr"
                        className="font-mono text-xs text-emerald-300 bg-slate-950/70 px-2 py-0.5 rounded"
                      >
                        {copiedSymbolText}
                      </code>
                    </div>
                  )}

                  <div className="grid grid-cols-5 gap-1 p-1 bg-slate-950/90 rounded-xl border border-slate-800 text-[10.5px] font-bold">
                    {(
                      [
                        { id: "ALL", label: "الكل" },
                        { id: "ANALYSIS", label: "تحليل ∫" },
                        { id: "GEOMETRY", label: "هندسة u⃗" },
                        { id: "SETS_LOGIC", label: "منطق ℝ" },
                        { id: "GREEK", label: "يوناني α" },
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedSymbolCat(cat.id)}
                        className={`py-1 rounded-lg transition cursor-pointer whitespace-nowrap ${
                          selectedSymbolCat === cat.id
                            ? "bg-cyan-500 text-slate-950 font-black"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 max-h-60 overflow-y-auto studio-scroll p-0.5">
                    {filteredMathSymbols.map((item) => (
                      <button
                        key={item.glyph}
                        type="button"
                        onClick={() => handleSelectMathSymbol(item)}
                        title={`${item.nameAr} (${item.nameFr}) · LaTeX: ${
                          item.latex || item.glyph
                        }`}
                        className="h-9 px-1.5 rounded-xl bg-slate-800/90 hover:bg-cyan-500/20 border border-slate-700/80 hover:border-cyan-400/70 text-slate-100 hover:text-cyan-200 text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95"
                      >
                        <span className="font-serif text-sm leading-none">
                          {item.glyph}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =================================================================
              4. اللائحة المنسدلة الرابعة: لائحة المختبرات (لصناعة ورسم مكونات الوثيقة)
             ================================================================= */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("LABS")}
              className={`h-7 px-2 rounded-lg text-[11px] font-black whitespace-nowrap shrink-0 flex items-center gap-1 transition-all cursor-pointer border ${
                openMenu === "LABS"
                  ? "bg-slate-800 text-cyan-300 border-cyan-500/80 shadow-md"
                  : "bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/90"
              }`}
              title="لائحة مختبرات التأليف الرياضي والرسوم المبيانية والهندسية للوثائق"
            >
              <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>المختبرات</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                  openMenu === "LABS" ? "rotate-180 text-cyan-300" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openMenu === "LABS" && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl p-2.5 z-50 text-right space-y-1"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>مختبرات التأليف والرسوم الرياضية</span>
                    <span className="font-mono text-cyan-400">
                      PLOTS · CAS · TICE
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onOpenAdvancedPedagogyStudio();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-100 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>مختبر المنحنيات C_f وجداول التغيرات</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300">
                      tkz-tab
                    </span>
                  </button>

                  {onOpenInteractiveCurveSpline && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenInteractiveCurveSpline();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-100 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center font-serif text-cyan-400 font-black">
                          C_f
                        </span>
                        <span>محرر المنحنى البياني بالماوس (Spline)</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300">
                        تفاعلي
                      </span>
                    </button>
                  )}

                  {onOpenSignTableStudio && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenSignTableStudio();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-100 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center font-mono text-indigo-400 font-black">
                          ±||
                        </span>
                        <span>مولد جدول الإشارة ومجموعة التعريف D_f</span>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-300">
                        MathJS
                      </span>
                    </button>
                  )}

                  {onOpenIntegralAreaStudio && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenIntegralAreaStudio();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-100 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center font-serif text-emerald-400 font-black">
                          ∫
                        </span>
                        <span>مختبر التكامل والمساحات المظللة</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300">
                        Aires
                      </span>
                    </button>
                  )}

                  {onOpenSpaceGeometry3DStudio && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenSpaceGeometry3DStudio();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-100 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-center font-mono text-sky-400 font-black">
                          3D
                        </span>
                        <span>مختبر المجسمات والهندسة الفضائية SVG</span>
                      </div>
                      <span className="text-[10px] font-mono text-sky-300">
                        Espace
                      </span>
                    </button>
                  )}

                  {onOpenGeoGebraLibrary && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenGeoGebraLibrary();
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-200 flex items-center justify-between gap-2 text-xs font-black transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>مكتبة قوالب GeoGebra التفاعلية وإدراج الأشكال</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        GGB
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onOpenPythonLab();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-100 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>مختبر خوارزميات Python للثانوي</span>
                    </div>
                    <span className="text-[10px] font-mono text-teal-300">
                      TICE
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onOpenWolframVerifier();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-100 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>مختبر الحساب الرمزي (Wolfram CAS)</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300">
                      CAS
                    </span>
                  </button>

                  <div className="border-t border-slate-800 pt-1 mt-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenAiAssistant();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-cyan-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>مختبر المساعد الذكي لصياغة التمارين</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300">
                        {selectedAiModel === "gemini-4-argon"
                          ? "Argon 4"
                          : "Flash"}
                      </span>
                    </button>

                    {onOpenAiPedagogicalAction && (
                      <div className="grid grid-cols-2 gap-1.5 px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            onOpenAiPedagogicalAction(
                              "GENERATE_ISOMORPHIC_VARIANT"
                            );
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-slate-800/90 hover:bg-slate-800 text-cyan-300 border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>أسئلة موازية</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            onOpenAiPedagogicalAction(
                              "SIMPLIFY_COMPLEX_WORDING"
                            );
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-slate-800/90 hover:bg-slate-800 text-teal-300 border border-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-teal-400 shrink-0" />
                          <span>تبسيط المسائل</span>
                        </button>
                      </div>
                    )}

                    {onOpenPdfHighlighterStudio && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onOpenPdfHighlighterStudio();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-amber-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Highlighter className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>عارض PDF والتوليد بالتظليل</span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-300">
                          PDF→Ex
                        </span>
                      </button>
                    )}

                    {onOpenAsymptoteVisualizer && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onOpenAsymptoteVisualizer();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-cyan-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>مستكشف المقاربات والفروع اللانهائية (C_f)</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300">
                          Asymptotes
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenLogoStudio();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center justify-between gap-2 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>استوديو الهوية والشعار الرسمي للوثائق</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        SVG
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =================================================================
              5. اللائحة المنسدلة الخامسة: لائحة Overleaf
             ================================================================= */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("OVERLEAF")}
              className={`h-7 px-2 rounded-lg text-[11px] font-black whitespace-nowrap shrink-0 flex items-center gap-1 transition-all cursor-pointer border ${
                openMenu === "OVERLEAF"
                  ? "bg-slate-800 text-amber-300 border-amber-500/80 shadow-md"
                  : "bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/90"
              }`}
              title="لائحة Overleaf ومشاريع LaTeX و Typst وأرشيف الوثائق"
            >
              <FolderOpen className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Overleaf</span>
              <span className="font-mono tabular-nums text-[9.5px] text-amber-300">
                ({exportHistoryCount})
              </span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
                  openMenu === "OVERLEAF" ? "rotate-180 text-amber-300" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openMenu === "OVERLEAF" && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl p-2.5 z-50 text-right space-y-1"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>بيئة Overleaf والأكواد المصدرية</span>
                    <span className="font-mono text-amber-400 tabular-nums">
                      XeLaTeX · {exportHistoryCount} ملف
                    </span>
                  </div>

                  {onDirectExportOverleafZip && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onDirectExportOverleafZip();
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 flex items-center justify-between gap-2 text-xs font-black transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FolderArchive className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>تحميل حزمة مشروع Overleaf (.zip)</span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300">
                        main.tex
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onOpenExportDashboard();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-100 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>سجل حزم Overleaf والوثائق المصدّرة</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 tabular-nums">
                      {exportHistoryCount} ملفات
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onOpenExportCenter();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-100 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>مركز الاستخراج المتعدد (LaTeX / Typst)</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300">
                      TikZ
                    </span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5 px-1 py-1">
                    <button
                      type="button"
                      onClick={() => {
                        onChangeExportFormat("LATEX");
                        setOpenMenu(null);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                        exportFormat === "LATEX"
                          ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                          : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 shrink-0" />
                      <span>كود LaTeX</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChangeExportFormat("TYPST");
                        setOpenMenu(null);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                        exportFormat === "TYPST"
                          ? "bg-cyan-400 text-slate-950 border-cyan-300 font-black"
                          : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 shrink-0" />
                      <span>كود Typst</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-800 pt-1 mt-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenJsonConfigModal();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-amber-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>حفظ أو استيراد قالب الوثيقة (.json)</span>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300">
                        v3.0
                      </span>
                    </button>

                    {onExportCompanionBridgeJson && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onExportCompanionBridgeJson();
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-teal-950/70 hover:bg-teal-900/80 border border-teal-500/40 text-teal-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                        title="تصدير بيانات الوثيقة الحالية (الدروس، القدرات، وسلم التنقيط) لاستيرادها في تطبيق الغياب والمواكبة والتدبير البيداغوجي"
                      >
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-teal-400 shrink-0" />
                          <span>تصدير لتطبيق المواكبة والتدبير البيداغوجي</span>
                        </div>
                        <span className="text-[10px] font-mono text-teal-300">
                          Bridge
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onToggleDrivePanel();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-sky-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>
                          {driveConnected
                            ? `خزانة Google Drive (${
                                driveUserDisplayName?.split(" ")[0] || "متصل"
                              })`
                            : "ربط أرشيف Google Drive"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-sky-300">
                        Cloud
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =================================================================
              6. اللائحة المنسدلة السادسة: لائحة مركز الطبع
             ================================================================= */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("PRINT_CENTER")}
              className={`h-7 px-2 rounded-lg text-[11px] font-black whitespace-nowrap shrink-0 flex items-center gap-1 transition-all cursor-pointer border ${
                openMenu === "PRINT_CENTER"
                  ? "bg-emerald-400 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/25"
                  : "bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/20 hover:brightness-105"
              }`}
              title="لائحة مركز الطبع والتصدير الورقي والمؤسسي (A4 / A5 مطوي / Batch)"
            >
              <Printer className="w-3 h-3 text-slate-950 shrink-0" />
              <span>الطبع</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-950 transition-transform duration-150 ${
                  openMenu === "PRINT_CENTER" ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openMenu === "PRINT_CENTER" && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.14 }}
                  className="absolute left-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl p-2.5 z-50 text-right space-y-1.5"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>مركز الطبع والنسخ المؤسسي</span>
                    <span className="font-mono text-emerald-400">
                      A4 · A5 · 300 DPI
                    </span>
                  </div>

                  {/* تصدير PDF الرسمي مقاس A4 */}
                  <button
                    type="button"
                    disabled={isExportingPDF}
                    onClick={() => {
                      setOpenMenu(null);
                      onExportPDF();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 text-slate-950 flex items-center justify-between gap-2 text-xs font-black transition-all cursor-pointer disabled:opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      <FileDown className="w-4 h-4 text-slate-950 shrink-0" />
                      <span>
                        {isExportingPDF
                          ? "جاري توليد ملف PDF..."
                          : "تصدير الوثيقة بصيغة PDF (A4)"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-950/15 px-1.5 py-0.5 rounded font-black">
                      PDF
                    </span>
                  </button>

                  {/* الطباعة المجمعة للمؤسسات بتنسيق A5 مطوي */}
                  {onExportInstitutionalFoldedA5 && (
                    <button
                      type="button"
                      disabled={isExportingPDF}
                      onClick={() => {
                        setOpenMenu(null);
                        onExportInstitutionalFoldedA5();
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-emerald-950/90 hover:bg-emerald-900/90 border border-emerald-500/60 text-emerald-100 flex items-center justify-between gap-2 text-xs font-black transition-colors cursor-pointer"
                      title="تصدير الفروض بتنسيق A5 مطوي (صفحتان A5 في ورقة A4 أفقية) لتقليل استهلاك الورق بنسبة 50%"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>الطباعة المجمعة للمؤسسات (A5 مطوي)</span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40 shrink-0">
                        -50% ورق
                      </span>
                    </button>
                  )}

                  {/* الطباعة الفورية للورقة الحالية A4 */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onPrintA4();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-100 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>طباعة فورية للورقة الحالية (A4)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Ctrl+P
                    </span>
                  </button>

                  {/* الطباعة المجمعة لطابور الوثائق Batch */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onOpenBatchPrint();
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-100 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>الطباعة المجمعة لطابور الوثائق (Batch)</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300">
                      Queue
                    </span>
                  </button>

                  {onOpenReprographicsStudio && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        onOpenReprographicsStudio();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-cyan-200 flex items-center justify-between gap-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>إعدادات مصلحة النسخ RISO وتدبيس +8mm</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300">
                        RISO
                      </span>
                    </button>
                  )}

                  {/* ضوابط إعداد الصفحة والورقة داخل مركز الطبع */}
                  <div className="border-t border-slate-800 pt-1.5 mt-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        onTogglePageOrientation();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center justify-between gap-2 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {pageOrientation === "LANDSCAPE" ? (
                          <RectangleHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <RectangleVertical className="w-4 h-4 text-cyan-400 shrink-0" />
                        )}
                        <span>اتجاه الورقة (عمودي / أفقي)</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-300">
                        {pageOrientation === "LANDSCAPE" ? "أفقي" : "عمودي"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onToggleAnswerWorkspace();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center justify-between gap-2 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>حيز الإجابة المعاير داخل الورقة</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono ${
                          includeAnswerWorkspace
                            ? "text-emerald-300 font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {includeAnswerWorkspace ? "مفعّل ✓" : "معطّل"}
                      </span>
                    </button>

                    {onToggleEconomicTwoUpPrintMode && (
                      <button
                        type="button"
                        onClick={() => {
                          onToggleEconomicTwoUpPrintMode();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center justify-between gap-2 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>معاينة الطباعة الاقتصادية 2-في-1 (2-Up)</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono ${
                            economicTwoUpPrintMode
                              ? "text-emerald-300 font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {economicTwoUpPrintMode ? "مفعّل ✓" : "معطّل"}
                        </span>
                      </button>
                    )}

                    {onToggleA4LivePageBreaks && (
                      <button
                        type="button"
                        onClick={() => {
                          onToggleA4LivePageBreaks();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center justify-between gap-2 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-sky-400 shrink-0" />
                          <span>إظهار فواصل الصفحات الحية (A4)</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono ${
                            showA4LivePageBreaks
                              ? "text-sky-300 font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {showA4LivePageBreaks ? "مفعّل ✓" : "معطّل"}
                        </span>
                      </button>
                    )}

                    {onToggleInlineEditable && (
                      <button
                        type="button"
                        onClick={() => {
                          onToggleInlineEditable();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center justify-between gap-2 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>التعديل النصي المباشر داخل الورقة</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono ${
                            isInlineEditable
                              ? "text-indigo-300 font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {isInlineEditable ? "مفعّل ✓" : "معطّل"}
                        </span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </header>

      {/* =====================================================================
          المستوى الثاني: شريط ضوابط الوثيقة والأدوات المصغر (إظهار كافة الأيقونات دون قص)
         ===================================================================== */}
      <div className="bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-2 xl:px-4 py-1 shadow-2xs no-print">
        <div className="w-full flex flex-wrap items-center justify-between gap-1.5">
          {/* الجناح الأيمن: مواصفات الوثيقة واللغة + المساعد الذكي وسلم التنقيط */}
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center gap-1 p-0.5 bg-slate-50/90 rounded-lg border border-slate-200/80 text-[10.5px]">
              {/* المنظومة التعليمية */}
              <div className="h-6 flex items-center gap-0.5 p-0.5 bg-slate-200/60 rounded-md">
                <button
                  type="button"
                  onClick={() => onSystemChange("MAROC_NATIONAL")}
                  className={`h-5 px-1.5 rounded font-bold transition whitespace-nowrap cursor-pointer ${
                    educationSystem === "MAROC_NATIONAL"
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  الوطنية
                </button>
                <button
                  type="button"
                  onClick={() => onSystemChange("MISSION_FRANCAISE")}
                  className={`h-5 px-1.5 rounded font-bold transition whitespace-nowrap cursor-pointer ${
                    educationSystem === "MISSION_FRANCAISE"
                      ? "bg-blue-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  البعثة
                </button>
              </div>

              {/* لغة الوثيقة */}
              <div className="h-6 flex items-center gap-0.5 p-0.5 bg-slate-200/60 rounded-md">
                <button
                  type="button"
                  onClick={() => onChangeDocLang("FR")}
                  className={`h-5 px-1.5 rounded font-bold transition whitespace-nowrap cursor-pointer ${
                    docLang === "FR"
                      ? "bg-white text-slate-950 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  FR
                </button>
                {!isMission && (
                  <>
                    <button
                      type="button"
                      onClick={() => onChangeDocLang("AR")}
                      className={`h-5 px-1.5 rounded font-bold transition whitespace-nowrap cursor-pointer ${
                        docLang === "AR"
                          ? "bg-white text-slate-950 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      AR
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeDocLang("BILINGUAL")}
                      className={`h-5 px-1.5 rounded font-bold transition whitespace-nowrap cursor-pointer ${
                        docLang === "BILINGUAL"
                          ? "bg-teal-700 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      مزدوج
                    </button>
                  </>
                )}
              </div>

              {docLang === "BILINGUAL" && !isMission && (
                <select
                  value={bilingualLayout}
                  onChange={(e) =>
                    onChangeBilingualLayout(e.target.value as BilingualLayout)
                  }
                  className="h-6 border border-teal-300 bg-teal-50/70 text-teal-950 rounded-md px-1.5 text-[10.5px] font-bold"
                >
                  <option value="SIDE_BY_SIDE">عمودان</option>
                  <option value="QUESTION_BY_QUESTION">سؤال بسؤال</option>
                  <option value="TWO_VERSIONS">نسختان</option>
                </select>
              )}

              {/* محرك التصدير */}
              <div className="h-6 flex items-center gap-0.5 p-0.5 bg-slate-200/60 rounded-md font-mono">
                <button
                  type="button"
                  onClick={() => onChangeExportFormat("PDF")}
                  className={`h-5 px-1.5 rounded font-bold transition flex items-center gap-0.5 whitespace-nowrap cursor-pointer ${
                    exportFormat === "PDF"
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-2.5 h-2.5 shrink-0" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeExportFormat("LATEX")}
                  className={`h-5 px-1.5 rounded font-bold transition whitespace-nowrap cursor-pointer ${
                    exportFormat === "LATEX"
                      ? "bg-white text-slate-950 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  LaTeX
                </button>
                <button
                  type="button"
                  onClick={() => onChangeExportFormat("TYPST")}
                  className={`h-5 px-1.5 rounded font-bold transition whitespace-nowrap cursor-pointer ${
                    exportFormat === "TYPST"
                      ? "bg-white text-slate-950 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Typst
                </button>
              </div>
            </div>

            {/* شريحة الذكاء الاصطناعي وسلم التنقيط */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-50/90 rounded-lg border border-slate-200/80 text-[10.5px]">
              <div className="h-6 flex items-center rounded-md bg-white border border-slate-200 p-0.5">
                <button
                  type="button"
                  onClick={onOpenAiAssistant}
                  className="h-full px-1.5 text-[10.5px] font-bold text-slate-800 hover:text-cyan-900 hover:bg-slate-100 rounded transition flex items-center gap-1 cursor-pointer"
                  title="فتح المساعد الديداكتيكي والرياضياتي الذكي لصياغة الوثائق"
                >
                  <BrainCircuit className="w-3 h-3 text-cyan-700 shrink-0" />
                  <span className="font-mono font-bold tracking-tight">
                    {selectedAiModel === "gemini-4-argon" ? "Argon" : "Flash"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onOpenAiSettings}
                  className="h-full w-4.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition flex items-center justify-center shrink-0 cursor-pointer border-r border-slate-200"
                  title="تفضيلات محرك الذكاء الاصطناعي"
                  aria-label="تفضيلات محرك الذكاء الاصطناعي"
                >
                  <Settings className="w-2.5 h-2.5" />
                </button>
              </div>

              {(activeModule === "DS_142_08" ||
                (activeModule === "DM_SERIE" &&
                  dmSubType === "DEVOIR_MAISON")) && (
                <button
                  type="button"
                  onClick={onOpenBaremeModal}
                  className="h-6 px-1.5 text-[10.5px] font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="تجزئة النقط وسلم التنقيط الدقيق وفق المذكرة 142-08"
                >
                  <Scale className="w-3 h-3 text-teal-700 shrink-0" />
                  <span
                    className={`font-mono tabular-nums font-black ${
                      isScore20 ? "text-teal-700" : "text-amber-700"
                    }`}
                  >
                    {totalPoints.toFixed(1)}/20
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* الجناح الأيسر: كافة أيقونات الأدوات السريعة بحجم مضغوط لتظهر جميعها دون إخفاء */}
          <div className="flex flex-wrap items-center gap-1 text-[10.5px]">
            <div className="flex flex-wrap items-center gap-1 p-0.5 bg-slate-50/90 rounded-lg border border-slate-200/80">
              {onOpenVoiceCommandStudio && (
                <button
                  type="button"
                  onClick={onOpenVoiceCommandStudio}
                  className={`h-6 px-1.5 rounded-md font-black border transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                    isVoiceListening
                      ? "bg-rose-600 text-white border-rose-400 animate-pulse"
                      : "bg-rose-950 text-rose-200 border-rose-500/80 hover:bg-rose-900"
                  }`}
                  title="مركز الأوامر الصوتية للتحكم في التبويبات وإدراج العناصر الرياضية بالصوت"
                >
                  <Mic
                    className={`w-3 h-3 shrink-0 ${
                      isVoiceListening ? "text-white" : "text-rose-400"
                    }`}
                  />
                  <span>{isVoiceListening ? "استماع..." : "صوت"}</span>
                </button>
              )}

              {onOpenGeoGebraLibrary && (
                <button
                  type="button"
                  onClick={onOpenGeoGebraLibrary}
                  className="h-6 px-1.5 rounded-md font-black bg-cyan-950 text-cyan-200 border border-cyan-500/80 hover:bg-cyan-900 transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="مكتبة قوالب GeoGebra التفاعلية وإدراج الأشكال الهندسية مباشرة في التمارين المخصصة"
                >
                  <Compass className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>GeoGebra</span>
                </button>
              )}

              {onOpenWeeklyTimetable && (
                <button
                  type="button"
                  onClick={onOpenWeeklyTimetable}
                  className="h-6 px-1.5 rounded-md font-black bg-indigo-950 text-indigo-200 border border-indigo-500/80 hover:bg-indigo-900 transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="إنشاء جدول الحصص الأسبوعي للأستاذ وتصديره بصيغة PDF"
                >
                  <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>الحصص</span>
                </button>
              )}

              {onOpenEvalGridTemplatesLibrary && (
                <button
                  type="button"
                  onClick={onOpenEvalGridTemplatesLibrary}
                  className="h-6 px-1.5 rounded-md font-black bg-emerald-950 text-emerald-200 border border-emerald-500/80 hover:bg-emerald-900 transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="مكتبة قوالب شبكات التقويم المتوافقة مع المذكرة 142-08 وتعديلها مباشرة"
                >
                  <Table2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>شبكة 142</span>
                </button>
              )}

              {onOpenCustomExamComposer && (
                <button
                  type="button"
                  onClick={onOpenCustomExamComposer}
                  className="h-6 px-1.5 rounded-md font-black bg-cyan-950 text-cyan-200 border border-cyan-500/80 hover:bg-cyan-900 transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="تأليف وتوليد امتحان تركيبي مخصص بدمج تمارين الدروس"
                >
                  <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>هجين</span>
                </button>
              )}

              {onOpenOcrScanner && (
                <button
                  type="button"
                  onClick={onOpenOcrScanner}
                  className="h-6 px-1.5 rounded-md font-black bg-emerald-900 text-emerald-100 border border-emerald-400/70 hover:bg-emerald-800 transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="التصحيح التلقائي للصور الممسوحة ضوئياً (OCR) مع تعزيز جودة الصورة"
                >
                  <ScanLine className="w-3 h-3 text-emerald-300 shrink-0" />
                  <span>OCR</span>
                </button>
              )}

              {onOpenLmsExport && (
                <button
                  type="button"
                  onClick={onOpenLmsExport}
                  className="h-6 px-1.5 rounded-md font-black bg-amber-950 text-amber-200 border border-amber-500/80 hover:bg-amber-900 transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="تصدير الفروض والتمارين بصيغ LMS التفاعلية (Moodle / Google Classroom / IMS QTI)"
                >
                  <GraduationCap className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>LMS</span>
                </button>
              )}

              {onOpenFavorites && (
                <button
                  type="button"
                  onClick={onOpenFavorites}
                  className="h-6 px-1.5 rounded-md font-black bg-amber-400 text-slate-950 border border-amber-300 hover:bg-amber-300 transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="مكتبة النماذج والتمارين المفضلة للوصول السريع إليها"
                >
                  <Star className="w-3 h-3 fill-slate-950 text-slate-950 shrink-0" />
                  <span>المفضلة</span>
                  {favoritesCount > 0 && (
                    <span className="bg-slate-950 text-amber-300 px-1 rounded-full font-mono text-[9px]">
                      {favoritesCount}
                    </span>
                  )}
                </button>
              )}

              {onOpenDualExamComparison && (
                <button
                  type="button"
                  onClick={onOpenDualExamComparison}
                  className="h-6 px-1.5 rounded-md font-black bg-gradient-to-r from-cyan-600 to-indigo-700 text-white border border-cyan-400 hover:brightness-110 transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="المقارنة الذكية: فتح فرضين في نافذتين متجاورتين لمقارنة التدرج البيداغوجي وتوزيع النقط"
                >
                  <Split className="w-3 h-3 text-cyan-200 shrink-0" />
                  <span>مقارنة</span>
                </button>
              )}

              {onOpenAsymptoteVisualizer && (
                <button
                  type="button"
                  onClick={onOpenAsymptoteVisualizer}
                  className="h-6 px-1.5 rounded-md font-black bg-sky-950 text-sky-200 border border-sky-500/80 hover:bg-sky-900 transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="مستكشف المقاربات والفروع اللانهائية والمنحنيات C_f"
                >
                  <TrendingUp className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>C_f</span>
                </button>
              )}

              {onOpenDidacticChecklist && (
                <button
                  type="button"
                  onClick={onOpenDidacticChecklist}
                  className="h-6 px-1.5 rounded-md font-black bg-slate-900 text-cyan-300 border border-cyan-500/80 hover:bg-slate-800 transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="فتح بطاقة المراقبة والتأشير الديداكتيكي للوثيقة (Note 142-08)"
                >
                  <FileCheck2 className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>142-08</span>
                </button>
              )}

              <button
                type="button"
                onClick={onToggleAuditPanel}
                className={`h-6 px-1.5 rounded-md font-bold border transition whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                  showAuditPanel
                    ? "bg-slate-900 text-cyan-300 border-slate-900"
                    : auditIssueCount === 0
                    ? "bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100"
                    : "bg-white text-slate-800 border-slate-200 hover:bg-slate-100"
                }`}
                title="فتح مرصد المراجعة الشاملة وتدقيق جودة الوثيقة (142-08)"
              >
                <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />
                <span className="font-mono tabular-nums font-black">
                  {auditScorePercent}%
                </span>
              </button>

              {!driveConnected ? (
                <button
                  type="button"
                  onClick={onToggleDrivePanel}
                  disabled={isLoggingInDrive}
                  className="h-6 bg-white hover:bg-slate-100 text-slate-700 font-bold px-1.5 rounded-md border border-slate-200 transition flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                  title="Google Drive"
                >
                  <Cloud className="w-3 h-3 text-sky-600 shrink-0" />
                  <span>{isLoggingInDrive ? "..." : "Drive"}</span>
                </button>
              ) : (
                <div className="h-6 flex items-center gap-1 bg-teal-50 border border-teal-200 px-1.5 rounded-md shrink-0">
                  <button
                    type="button"
                    onClick={onToggleDrivePanel}
                    className="flex items-center gap-1 text-teal-900 font-bold hover:text-teal-950 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Cloud className="w-3 h-3 text-teal-700 shrink-0" />
                    <span>{driveUserDisplayName?.split(" ")[0] || "Drive"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onDriveLogout}
                    title="تسجيل الخروج من Google Drive"
                    className="text-slate-500 hover:text-rose-600 p-0.5 flex items-center justify-center cursor-pointer"
                  >
                    <LogOut className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              {onToggleReadingMode && (
                <button
                  type="button"
                  onClick={onToggleReadingMode}
                  className={`h-6 px-1.5 rounded-md font-black border transition flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                    isReadingMode
                      ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50"
                      : "bg-indigo-950 hover:bg-indigo-900 text-amber-200 border-indigo-700"
                  }`}
                  title="وضع القراءة والمراجعة المركّزة (Reading Mode): Alt+R"
                >
                  <BookOpen className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{isReadingMode ? "إنهاء القراءة" : "القراءة"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onToggleConfigDeck}
                className={`h-6 px-1.5 rounded-md font-bold border transition flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                  isConfigDeckCollapsed
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
                title="طي أو إظهار لوحة الإعدادات"
              >
                <Sliders className="w-3 h-3 shrink-0" />
                <span>{isConfigDeckCollapsed ? "إظهار" : "إعدادات"}</span>
              </button>

              <button
                type="button"
                onClick={onResetPreferences}
                title="استعادة الإعدادات الافتراضية"
                className="h-6 w-6 text-slate-500 hover:text-rose-600 flex items-center justify-center rounded-md border border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
