import React, { useState, useMemo } from "react";
import {
  X,
  LayoutTemplate,
  Sparkles,
  ShieldCheck,
  Check,
  Info,
  ArrowRight,
  TrendingDown,
  Scissors,
  FileSpreadsheet,
  Sigma,
  AlignVerticalSpaceAround,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  Sliders,
  Code2,
  Eye,
  EyeOff,
  ScanLine,
  Maximize2,
  BookmarkPlus,
  Trash2,
  MoveVertical,
} from "lucide-react";
import {
  PRINT_LAYOUT_TEMPLATES,
  PrintLayoutTemplateId,
  PrintLayoutCategory,
  SmartPageBreakConfig,
  DEFAULT_SMART_PAGE_BREAK_CONFIG,
  PageBreakLessonInput,
  computeOptimizedPageBreakPlan,
  computeVisualizerOverlayLines,
  PageBreakPaperFormat,
  PageBreakStrictnessMode,
  CustomMarginPreset,
  loadCustomMarginPresets,
  saveCustomMarginPresetToStorage,
  deleteCustomMarginPresetFromStorage,
  VERTICAL_DENSITY_PRESETS,
  VerticalDensityPresetId,
} from "../utils/printLayoutTemplates";

interface PrintLayoutTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTemplateId: PrintLayoutTemplateId;
  onSelectTemplate: (templateId: PrintLayoutTemplateId) => void;
  smartPageBreakConfig?: SmartPageBreakConfig;
  onChangeSmartPageBreakConfig?: (config: SmartPageBreakConfig) => void;
  lessons?: PageBreakLessonInput[];
  includeAnswerWorkspace?: boolean;
  includeDetailedSolutions?: boolean;
  isFr?: boolean;
}

export const PrintLayoutTemplatesModal: React.FC<PrintLayoutTemplatesModalProps> = ({
  isOpen,
  onClose,
  activeTemplateId,
  onSelectTemplate,
  smartPageBreakConfig = DEFAULT_SMART_PAGE_BREAK_CONFIG,
  onChangeSmartPageBreakConfig,
  lessons = [],
  includeAnswerWorkspace = false,
  includeDetailedSolutions = false,
  isFr = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    "TEMPLATES" | "MARGINS_AND_DENSITY" | "PAGE_BREAK_OPTIMIZER" | "LIVE_VISUALIZER"
  >("MARGINS_AND_DENSITY");
  const [selectedCategory, setSelectedCategory] = useState<PrintLayoutCategory>("ALL");
  const [hoveredTemplateId, setHoveredTemplateId] = useState<PrintLayoutTemplateId | null>(null);
  const [localBreakConfig, setLocalBreakConfig] = useState<SmartPageBreakConfig>(
    smartPageBreakConfig || DEFAULT_SMART_PAGE_BREAK_CONFIG
  );
  const [showCodeSnippetPreview, setShowCodeSnippetPreview] = useState<
    "NONE" | "CSS" | "LATEX" | "TYPST"
  >("NONE");
  const [autoOptimizeFeedback, setAutoOptimizeFeedback] = useState<string | null>(null);
  const [simulateUnprotectedCollision, setSimulateUnprotectedCollision] =
    useState<boolean>(false);

  // حالة قوالب الهوامش المخصصة (Custom Margin Presets)
  const [marginPresets, setMarginPresets] = useState<CustomMarginPreset[]>(() =>
    loadCustomMarginPresets()
  );
  const [newPresetNameAr, setNewPresetNameAr] = useState<string>("");
  const [lockSymmetricMargins, setLockSymmetricMargins] = useState<boolean>(false);

  React.useEffect(() => {
    if (smartPageBreakConfig) {
      setLocalBreakConfig(smartPageBreakConfig);
    }
  }, [smartPageBreakConfig]);

  const activeTemplate =
    PRINT_LAYOUT_TEMPLATES.find((t) => t.id === activeTemplateId) ||
    PRINT_LAYOUT_TEMPLATES[0];

  const optimizationPlan = useMemo(
    () =>
      computeOptimizedPageBreakPlan(lessons, localBreakConfig, {
        columnsCount: activeTemplate.columnsCount,
        includeAnswerWorkspace:
          includeAnswerWorkspace || activeTemplate.hasAnswerWorkspaceProminent,
        includeDetailedSolutions,
      }),
    [
      lessons,
      localBreakConfig,
      activeTemplate.columnsCount,
      activeTemplate.hasAnswerWorkspaceProminent,
      includeAnswerWorkspace,
      includeDetailedSolutions,
    ]
  );

  const visualizerLines = useMemo(
    () => computeVisualizerOverlayLines(optimizationPlan),
    [optimizationPlan]
  );

  if (!isOpen) return null;

  const updateBreakConfig = (partial: Partial<SmartPageBreakConfig>) => {
    const updated: SmartPageBreakConfig = {
      ...localBreakConfig,
      ...partial,
    };
    setLocalBreakConfig(updated);
    onChangeSmartPageBreakConfig?.(updated);
  };

  // تحديث الهوامش الأربعة بالمليمتر لورقة #printable-document-sheet
  const handleMarginChangeMm = (
    side: "top" | "bottom" | "left" | "right",
    rawVal: number
  ) => {
    const clamped = Math.max(4, Math.min(35, Number.isFinite(rawVal) ? rawVal : 12));
    if (lockSymmetricMargins) {
      updateBreakConfig({
        marginTopMm: clamped,
        marginBottomMm: clamped,
        marginLeftMm: clamped,
        marginRightMm: clamped,
        activeMarginPresetId: "CUSTOM_USER",
      });
      return;
    }

    const nextPartial: Partial<SmartPageBreakConfig> = {
      activeMarginPresetId: "CUSTOM_USER",
    };
    if (side === "top") nextPartial.marginTopMm = clamped;
    if (side === "bottom") nextPartial.marginBottomMm = clamped;
    if (side === "left") nextPartial.marginLeftMm = clamped;
    if (side === "right") nextPartial.marginRightMm = clamped;
    updateBreakConfig(nextPartial);
  };

  // تطبيق قالب هوامش جاهز أو محفوظ
  const handleSelectMarginPreset = (preset: CustomMarginPreset) => {
    updateBreakConfig({
      marginTopMm: preset.topMm,
      marginBottomMm: preset.bottomMm,
      marginLeftMm: preset.leftMm,
      marginRightMm: preset.rightMm,
      activeMarginPresetId: preset.id,
    });
    setAutoOptimizeFeedback(
      isFr
        ? `Préréglage de marges appliqué : « ${preset.nameFr} » (${preset.topMm}/${preset.bottomMm}/${preset.leftMm}/${preset.rightMm} mm)`
        : `تم تطبيق قالب الهوامش: « ${preset.nameAr} » (العلوي ${preset.topMm}mm · السفلي ${preset.bottomMm}mm · الأيسر ${preset.leftMm}mm · الأيمن ${preset.rightMm}mm)`
    );
    setTimeout(() => setAutoOptimizeFeedback(null), 4000);
  };

  // حفظ الهوامش الحالية كقالب مخصص جديد في localStorage
  const handleSaveNewCustomMarginPreset = () => {
    const topMm = localBreakConfig.marginTopMm ?? 12;
    const bottomMm = localBreakConfig.marginBottomMm ?? 12;
    const leftMm = localBreakConfig.marginLeftMm ?? 12;
    const rightMm = localBreakConfig.marginRightMm ?? 12;

    const label =
      newPresetNameAr.trim() ||
      (isFr
        ? `Marge Perso (${topMm}/${bottomMm}/${leftMm}/${rightMm}mm)`
        : `قالب أستاذ مخصص (${topMm}/${bottomMm}/${leftMm}/${rightMm}mm)`);

    const saved = saveCustomMarginPresetToStorage({
      nameAr: label,
      nameFr: label,
      topMm,
      bottomMm,
      leftMm,
      rightMm,
    });

    const updatedList = loadCustomMarginPresets();
    setMarginPresets(updatedList);
    setNewPresetNameAr("");
    updateBreakConfig({
      activeMarginPresetId: saved.id,
    });

    setAutoOptimizeFeedback(
      isFr
        ? `Nouveau préréglage de marges enregistré : « ${saved.nameFr} » (${topMm} / ${bottomMm} / ${leftMm} / ${rightMm} mm)`
        : `تم حفظ قالب الهوامش المخصص الجديد بنجاح: « ${saved.nameAr} » (${topMm}/${bottomMm}/${leftMm}/${rightMm} ملم)!`
    );
    setTimeout(() => setAutoOptimizeFeedback(null), 4500);
  };

  const handleDeleteCustomMarginPreset = (presetId: string) => {
    const nextList = deleteCustomMarginPresetFromStorage(presetId);
    setMarginPresets(nextList);
    if (localBreakConfig.activeMarginPresetId === presetId) {
      const fallback = nextList[0];
      if (fallback) {
        handleSelectMarginPreset(fallback);
      }
    }
  };

  // تطبيق مستوى كثافة عمودية جاهز (.printable-document-sheet)
  const handleSelectVerticalDensityPreset = (presetId: VerticalDensityPresetId) => {
    const found = VERTICAL_DENSITY_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    updateBreakConfig({
      verticalDensityPreset: found.id,
      exerciseGapMm: found.exerciseGapMm,
      paragraphGapMm: found.paragraphGapMm,
      lineHeightRatio: found.lineHeightRatio,
    });
    setAutoOptimizeFeedback(
      isFr
        ? `Densité verticale appliquée : « ${found.labelFr} » (Exercices: ${found.exerciseGapMm}mm · Paragraphes: ${found.paragraphGapMm}mm)`
        : `تم ضبط كثافة الوثيقة والتباعد العمودي: « ${found.labelAr} » (بين التمارين: ${found.exerciseGapMm}mm · بين الفقرات: ${found.paragraphGapMm}mm)`
    );
    setTimeout(() => setAutoOptimizeFeedback(null), 4000);
  };

  const handleToggleExerciseBreak = (exerciseIndex: number) => {
    if (exerciseIndex <= 0) return;
    const exists = localBreakConfig.forcedBreakBeforeExercises.includes(exerciseIndex);
    const nextList = exists
      ? localBreakConfig.forcedBreakBeforeExercises.filter((i) => i !== exerciseIndex)
      : [...localBreakConfig.forcedBreakBeforeExercises, exerciseIndex].sort((a, b) => a - b);
    updateBreakConfig({ forcedBreakBeforeExercises: nextList });
  };

  const handleAutoGenerateOptimizedBreaks = () => {
    const freshPlan = computeOptimizedPageBreakPlan(
      lessons,
      {
        ...localBreakConfig,
        enabled: true,
        autoInsertBreaksOnCollision: true,
        lockDisplayEquations: true,
        lockTableRowsAndSignTables: true,
        lockQuestionWithAnswerZone: true,
        lockExerciseHeadersAndOrphans: true,
        forcedBreakBeforeExercises: [],
      },
      {
        columnsCount: activeTemplate.columnsCount,
        includeAnswerWorkspace:
          includeAnswerWorkspace || activeTemplate.hasAnswerWorkspaceProminent,
        includeDetailedSolutions,
      }
    );

    updateBreakConfig({
      enabled: true,
      autoInsertBreaksOnCollision: true,
      lockDisplayEquations: true,
      lockTableRowsAndSignTables: true,
      lockQuestionWithAnswerZone: true,
      lockExerciseHeadersAndOrphans: true,
      lockFiguresAndQrBadges: true,
      showLivePageBreakVisualizer: true,
      forcedBreakBeforeExercises: freshPlan.recommendedBreakIndices,
    });

    setSimulateUnprotectedCollision(false);
    setAutoOptimizeFeedback(
      isFr
        ? `Optimisation automatique réussie (${freshPlan.paperFormat}) : ${freshPlan.totalProtectedEquations} équations et ${freshPlan.totalProtectedTableRows} lignes de tableaux verrouillées sur ${freshPlan.totalPages} page(s).`
        : `تم توليد الفواصل المثلى تلقائياً لمقاس (${freshPlan.paperFormat}): تأمين ${freshPlan.totalProtectedEquations} معادلة و ${freshPlan.totalProtectedTableRows} سطر جدول عبر ${freshPlan.totalPages} صفحة مع تفعيل خطوط المعاينة الحية!`
    );
    setTimeout(() => setAutoOptimizeFeedback(null), 5000);
  };

  const filteredTemplates = PRINT_LAYOUT_TEMPLATES.filter((tpl) => {
    if (selectedCategory === "ALL") return true;
    return tpl.category === selectedCategory;
  });

  const handleApply = (id: PrintLayoutTemplateId) => {
    onSelectTemplate(id);
    onClose();
  };

  const visualizerOpacity = localBreakConfig.visualizerOpacity ?? 0.85;
  const visualizerStyle = localBreakConfig.visualizerLineStyle || "SAFETY_BAND";
  const isVisualizerActive = localBreakConfig.showLivePageBreakVisualizer !== false;

  const curTopMm = localBreakConfig.marginTopMm ?? 12;
  const curBottomMm = localBreakConfig.marginBottomMm ?? 12;
  const curLeftMm = localBreakConfig.marginLeftMm ?? 12;
  const curRightMm = localBreakConfig.marginRightMm ?? 12;
  const curExerciseGapMm = localBreakConfig.exerciseGapMm ?? 4.5;
  const curParagraphGapMm = localBreakConfig.paragraphGapMm ?? 2.2;
  const curLineHeight = localBreakConfig.lineHeightRatio ?? 1.48;

  /**
   * مكون المعاينة التفاعلية الحية لورقة A4/Letter مع تراكب خطوط الفواصل شبه الشفافة وهوامش (Top/Bottom/Left/Right) والتباعد العمودي
   */
  const renderLiveA4PageBreakVisualizerCanvas = (compactMode: boolean = false) => {
    // تحويل الهوامش المليمترية والتباعد العمودي إلى قيم بصرية متناسبة في الورقة المصغرة
    const padTopPx = Math.max(8, Math.round(curTopMm * 1.15));
    const padBottomPx = Math.max(8, Math.round(curBottomMm * 1.15));
    const padLeftPx = Math.max(8, Math.round(curLeftMm * 1.15));
    const padRightPx = Math.max(8, Math.round(curRightMm * 1.15));
    const exerciseGapPx = Math.max(3, Math.round(curExerciseGapMm * 1.8));
    const paragraphGapPx = Math.max(2, Math.round(curParagraphGapMm * 1.6));

    return (
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        {/* شريط أدوات عارض الفواصل الحي */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h5 className="text-xs font-black text-white flex items-center gap-2 flex-wrap">
                <span>
                  {isFr
                    ? `Page Break Visualizer Direct (${optimizationPlan.paperFormat})`
                    : `عارض خطوط فواصل الصفحات والهوامش الحي (${optimizationPlan.paperFormat})`}
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded text-[10px] font-mono">
                  {optimizationPlan.paperWidthMm}×{optimizationPlan.paperHeightMm}mm
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded text-[10px] font-mono">
                  Margins: {curTopMm}/{curBottomMm}/{curLeftMm}/{curRightMm}mm
                </span>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded text-[10px] font-mono">
                  Gap: {curExerciseGapMm}mm / {curParagraphGapMm}mm
                </span>
              </h5>
              <p className="text-[10.5px] text-slate-400">
                {isFr
                  ? "Aperçu direct de #printable-document-sheet avec marges en mm, espacement vertical et lignes de saut de page"
                  : "معاينة حية لـ #printable-document-sheet تعكس الهوامش بالمليمتر والتباعد العمودي بين التمارين والفقرات وخطوط الفواصل"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* زر التفعيل على ورقة المعاينة الرئيسية في التطبيق */}
            <button
              type="button"
              onClick={() =>
                updateBreakConfig({
                  showLivePageBreakVisualizer: !isVisualizerActive,
                })
              }
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                isVisualizerActive
                  ? "bg-cyan-600/30 text-cyan-200 border-cyan-500/60"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
              title={
                isFr
                  ? "Afficher/Masquer les lignes de saut de page semi-transparentes sur l'aperçu A4 principal"
                  : "إظهار أو إخفاء خطوط فواصل الصفحات شبه الشفافة فوق ورقة المعاينة A4 الرئيسية"
              }
            >
              {isVisualizerActive ? (
                <Eye className="w-3.5 h-3.5 text-cyan-300" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>
                {isVisualizerActive
                  ? isFr
                    ? "Superposition A4 Active"
                    : "نشط على ورقة A4"
                  : isFr
                  ? "Superposition Masquée"
                  : "مخفي عن الورقة"}
              </span>
            </button>

            {/* زر مقارنة قبل/بعد الحماية */}
            <button
              type="button"
              onClick={() => setSimulateUnprotectedCollision((v) => !v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                simulateUnprotectedCollision
                  ? "bg-rose-950/80 text-rose-200 border-rose-500/60"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>
                {simulateUnprotectedCollision
                  ? isFr
                    ? "Mode Sans Protection (Coupure visible)"
                    : "معاينة بدون حماية (انشطار المعادلة)"
                  : isFr
                  ? "Simuler Coupure Sans Protection"
                  : "محاكاة الانشطار قبل التحسين"}
              </span>
            </button>
          </div>
        </div>

        {/* شريط التحكم في نمط الخطوط ودرجة الشفافية */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/90 rounded-xl px-3 py-2 text-[11px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-bold">
              {isFr ? "Style de ligne :" : "نمط خط الفاصل شبه الشفاف :"}
            </span>
            {(
              [
                {
                  id: "SAFETY_BAND",
                  labelAr: "شريط أمان ليزري مزدوج",
                  labelFr: "Bande de Sécurité Laser",
                },
                {
                  id: "DASHED_LASER",
                  labelAr: "خط متقطع هندسي دقيق",
                  labelFr: "Ligne Pointillée Précise",
                },
                {
                  id: "RULER_GRID",
                  labelAr: "مسطرة مليمترية متدرجة",
                  labelFr: "Règle Millimétrique",
                },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => updateBreakConfig({ visualizerLineStyle: st.id })}
                className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                  visualizerStyle === st.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {isFr ? st.labelFr : st.labelAr}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">
              {isFr ? "Opacité :" : "الشفافية :"}
            </span>
            <input
              type="range"
              min={30}
              max={100}
              step={5}
              value={Math.round(visualizerOpacity * 100)}
              onChange={(e) =>
                updateBreakConfig({
                  visualizerOpacity: Number(e.target.value) / 100,
                })
              }
              className="w-24 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-cyan-300 w-9 text-end">
              {Math.round(visualizerOpacity * 100)}%
            </span>
          </div>
        </div>

        {/* لوحة ورقة A4 المصغرة الحية مع تراكب خطوط الهوامش والفواصل شبه الشفافة */}
        <div
          className={`relative mx-auto w-full ${
            compactMode ? "max-w-xl" : "max-w-2xl"
          } bg-white text-slate-900 rounded-xl shadow-2xl border-2 border-slate-300 overflow-hidden select-none`}
          style={{
            minHeight: compactMode ? "340px" : "430px",
          }}
        >
          {/* مؤشرات الهوامش الأربعة (Top, Bottom, Left, Right) بالمليمتر على حواف الورقة */}
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 z-20 bg-amber-500/20 border border-amber-500/50 text-amber-950 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold pointer-events-none">
            Top: {curTopMm}mm
          </div>
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 z-20 bg-amber-500/20 border border-amber-500/50 text-amber-950 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold pointer-events-none">
            Bottom: {curBottomMm}mm
          </div>
          <div className="absolute top-1/2 left-0.5 -translate-y-1/2 z-20 bg-amber-500/20 border border-amber-500/50 text-amber-950 px-1 py-0.5 rounded text-[8px] font-mono font-bold pointer-events-none">
            L:{curLeftMm}mm
          </div>
          <div className="absolute top-1/2 right-0.5 -translate-y-1/2 z-20 bg-amber-500/20 border border-amber-500/50 text-amber-950 px-1 py-0.5 rounded text-[8px] font-mono font-bold pointer-events-none">
            R:{curRightMm}mm
          </div>

          {/* مسطرة مليمترية جانبية على يمين/يسار ورقة A4 */}
          {visualizerStyle === "RULER_GRID" && (
            <div className="absolute inset-y-0 left-0 w-6 bg-slate-100/90 border-r border-slate-300 flex flex-col justify-between py-2 px-0.5 text-[8px] font-mono text-slate-500 z-10 pointer-events-none">
              <span>0mm</span>
              <span>70mm</span>
              <span>140mm</span>
              <span>210mm</span>
              <span>{optimizationPlan.usableHeightMm}mm</span>
              <span>{optimizationPlan.paperHeightMm}mm</span>
            </div>
          )}

          {/* محتوى الورقة المصغرة مع تطبيق الهوامش المخصصة والتباعد العمودي */}
          <div
            style={{
              paddingTop: `${padTopPx}px`,
              paddingBottom: `${padBottomPx}px`,
              paddingLeft: `${visualizerStyle === "RULER_GRID" ? padLeftPx + 22 : padLeftPx}px`,
              paddingRight: `${padRightPx}px`,
              lineHeight: curLineHeight,
            }}
            className={`transition-all duration-200 border border-dashed border-amber-400/70 m-1 rounded ${
              activeTemplate.hasOfficialBorder
                ? "border-4 border-double border-slate-900 m-1.5 rounded"
                : ""
            } ${
              activeTemplate.hasAccentRibbon
                ? isFr
                  ? "border-l-4 border-rose-600"
                  : "border-r-4 border-rose-600"
                : ""
            }`}
          >
            {/* ترويسة الوزارة المصغرة */}
            <div
              style={{ marginBottom: `${exerciseGapPx}px` }}
              className="border-2 border-slate-800 rounded-lg p-2 bg-slate-50 flex items-center justify-between text-[9.5px] font-bold"
            >
              <div>
                <div className="text-slate-900">
                  {isFr ? "Royaume du Maroc — MEN" : "المملكة المغربية — وزارة التربية الوطنية"}
                </div>
                <div className="text-[8.5px] text-slate-500">
                  {isFr ? activeTemplate.labelFr : activeTemplate.labelAr}
                </div>
              </div>
              <div className="text-center px-2 py-0.5 bg-indigo-950 text-white rounded font-black text-[9px]">
                {isFr
                  ? `Devoir Surveillé (${optimizationPlan.paperFormat})`
                  : `فرض محروس (${optimizationPlan.paperFormat})`}
              </div>
              <div className="text-end font-mono text-[8.5px] text-slate-700">
                <div>20 / 20 pts</div>
                <div>
                  {optimizationPlan.usableWidthMm}×{optimizationPlan.usableHeightMm}mm
                </div>
              </div>
            </div>

            {/* عرض التمارين على الورقة المصغرة مع تطبيق التباعد العمودي بين التمارين والفقرات */}
            <div
              style={{ gap: `${exerciseGapPx}px` }}
              className={
                activeTemplate.columnsCount === 2
                  ? "grid grid-cols-2 relative"
                  : "flex flex-col relative"
              }
            >
              {optimizationPlan.exercisesAnalysis.map((ex, idx) => {
                const lineSpec =
                  visualizerLines.find(
                    (l) => l.triggeredBeforeExerciseNumber === ex.exerciseNumber
                  ) || (idx === 1 ? visualizerLines[0] : null);

                const showBreakOverlayHere =
                  isVisualizerActive &&
                  (ex.hasPageBreakBefore ||
                    (optimizationPlan.totalPages === 1 &&
                      idx === optimizationPlan.exercisesAnalysis.length - 1));

                return (
                  <React.Fragment key={ex.exerciseIndex}>
                    {/* خط وشريط فاصل الصفحة التلقائي شبه الشفاف فوق ورقة A4 */}
                    {showBreakOverlayHere && ex.hasPageBreakBefore && (
                      <div
                        style={{ opacity: visualizerOpacity }}
                        className={`col-span-full relative my-1.5 transition-all duration-300 ${
                          simulateUnprotectedCollision
                            ? "bg-rose-500/20 border-y-2 border-rose-600"
                            : visualizerStyle === "SAFETY_BAND"
                            ? "bg-gradient-to-r from-cyan-500/20 via-emerald-500/25 to-indigo-500/20 border-y-2 border-dashed border-emerald-600 py-2 px-3 rounded-lg backdrop-blur-[1px]"
                            : visualizerStyle === "RULER_GRID"
                            ? "bg-amber-500/20 border-y-2 border-amber-600 py-1.5 px-3"
                            : "border-t-2 border-dashed border-cyan-600 py-1"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[9.5px] font-black">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full shadow-2xs ${
                              simulateUnprotectedCollision
                                ? "bg-rose-600 text-white"
                                : "bg-emerald-900 text-emerald-100"
                            }`}
                          >
                            <Scissors className="w-3 h-3" />
                            <span>
                              {simulateUnprotectedCollision
                                ? isFr
                                  ? `⚠️ Zone de Coupure Critique à ${
                                      lineSpec?.offsetMm || optimizationPlan.usableHeightMm
                                    } mm (Sans Protection)`
                                  : `⚠️ خط قطع حرج عند ${
                                      lineSpec?.offsetMm || optimizationPlan.usableHeightMm
                                    } mm (انشطار المعادلة/الجدول بدون حماية)`
                                : isFr
                                ? `✂️ Saut de Page Auto-Optimisé (Page ${ex.assignedPageNumber - 1} ➔ Page ${ex.assignedPageNumber} · ${
                                    lineSpec?.offsetMm || optimizationPlan.usableHeightMm
                                  } mm)`
                                : `✂️ خط فاصل الصفحة التلقائي (صفحة ${ex.assignedPageNumber - 1} ➔ صفحة ${ex.assignedPageNumber} · ${
                                    lineSpec?.offsetMm || optimizationPlan.usableHeightMm
                                  } mm)`}
                            </span>
                          </span>

                          <span className="font-mono text-[8.5px] bg-white/90 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                            {simulateUnprotectedCollision
                              ? isFr
                                ? "Équation / Tableau coupé en 2 !"
                                : "انقسام المعادلة أو سطر الجدول بين صفحتين!"
                              : isFr
                              ? ex.collisionSavedDescriptionFr ||
                                "Équations & lignes <tr> protégées"
                              : ex.collisionSavedDescriptionAr ||
                                "تم ترحيل المعادلات والجدول بأمان"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* بطاقة التمرين المصغرة داخل ورقة A4 */}
                    <div
                      style={{ gap: `${paragraphGapPx}px` }}
                      className={`rounded-lg border p-2.5 flex flex-col text-[9.5px] transition-all ${
                        simulateUnprotectedCollision && ex.wouldCollideWithoutBreak
                          ? "border-rose-500 bg-rose-50/70 ring-2 ring-rose-400/50"
                          : "border-slate-300 bg-white shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1 font-bold text-slate-900">
                        <span className="truncate">
                          {isFr
                            ? `Exercice ${ex.exerciseNumber} : ${ex.titleFr}`
                            : `التمرين ${ex.exerciseNumber} : ${ex.titleAr}`}
                        </span>
                        <span className="font-mono text-[8.5px] bg-slate-100 text-indigo-900 px-1.5 py-0.2 rounded shrink-0">
                          {isFr ? `Page ${ex.assignedPageNumber}` : `ص ${ex.assignedPageNumber}`} ·{" "}
                          {ex.startOffsetMmOnPage}→{ex.endOffsetMmOnPage}mm
                        </span>
                      </div>

                      {/* أسئلة وفقرات التمرين مع التباعد العمودي paragraphGapPx */}
                      <div
                        style={{ gap: `${paragraphGapPx}px` }}
                        className="flex flex-col text-[8.5px] text-slate-700"
                      >
                        <div className="flex items-center justify-between bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                          <span>
                            1) {isFr ? "Étudier la continuité et calculer la limite" : "ادرس اتصال الدالة واحسب النهاية عند ∞+"}
                          </span>
                          <span className="font-mono text-[8px] text-purple-700">
                            ↕ {curParagraphGapMm}mm
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          <div className="bg-indigo-50/80 border border-indigo-200 rounded px-2 py-1 flex items-center justify-between font-mono text-[8.5px] text-indigo-950">
                            <span>
                              ∫ f(x)dx = lim u_n ({ex.equationsCount}{" "}
                              {isFr ? "éq." : "معادلات"})
                            </span>
                            <span className="bg-indigo-700 text-white px-1 rounded text-[7.5px]">
                              {localBreakConfig.lockDisplayEquations ? "LOCKED" : "FREE"}
                            </span>
                          </div>

                          <div className="bg-emerald-50/80 border border-emerald-200 rounded px-2 py-1 flex items-center justify-between font-mono text-[8.5px] text-emerald-950">
                            <span>
                              tkz-tab / tr ({ex.tablesCount * 3}{" "}
                              {isFr ? "lignes" : "أسطر"})
                            </span>
                            <span className="bg-emerald-700 text-white px-1 rounded text-[7.5px]">
                              {localBreakConfig.lockTableRowsAndSignTables ? "NO-SPLIT" : "FREE"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {/* في حالة صفحة واحدة، إظهار خط حد الأمان السفلي لورقة A4/Letter */}
              {isVisualizerActive && optimizationPlan.totalPages === 1 && visualizerLines[0] && (
                <div
                  style={{ opacity: visualizerOpacity }}
                  className="col-span-full mt-2 bg-gradient-to-r from-cyan-500/15 via-emerald-500/20 to-indigo-500/15 border-y-2 border-dashed border-emerald-600 py-1.5 px-3 rounded-lg flex flex-wrap items-center justify-between gap-2 text-[9px] font-bold text-emerald-950"
                >
                  <span className="flex items-center gap-1">
                    <ScanLine className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {isFr ? visualizerLines[0].badgeLabelFr : visualizerLines[0].badgeLabelAr}
                    </span>
                  </span>
                  <span className="font-mono bg-white/90 px-2 py-0.5 rounded border border-emerald-300 text-[8.5px]">
                    {isFr ? visualizerLines[0].subLabelFr : visualizerLines[0].subLabelAr}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
      dir={isFr ? "ltr" : "rtl"}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[93vh] overflow-hidden text-slate-100">
        {/* شريط العنوان التفاعلي */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-5 py-3.5 border-b border-indigo-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <LayoutTemplate className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white tracking-wide">
                  {isFr
                    ? "Gabarits, Marges Personnalisées (mm), Densité Verticale & Page Break Visualizer"
                    : "قوالب الطباعة، هندسة الهوامش بالمليمتر، كثافة التباعد العمودي، وعارض الفواصل (A4 / Letter)"}
                </h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {curTopMm}/{curBottomMm}/{curLeftMm}/{curRightMm}mm
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {isFr
                    ? `Anti-Coupure (${localBreakConfig.paperFormat})`
                    : `حماية المعادلات (${localBreakConfig.paperFormat})`}
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                {isFr
                  ? "Personnalisez les marges (Haut, Bas, Gauche, Droite en mm), ajustez l'espacement vertical des exercices/paragraphes et visualisez les sauts de page"
                  : "تخصيص هوامش الوثيقة (العلوي، السفلي، الأيسر، الأيمن بالمليمتر) وحفظها كقالب جديد، مع ضبط التباعد العمودي بين التمارين والفقرات"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            aria-label="Fermer / إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* شريط التبويبات الرباعي: القوالب | الهوامش المخصصة وكثافة التباعد | محسن الفواصل | عارض الفواصل الحي */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab("TEMPLATES")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "TEMPLATES"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>{isFr ? "1. Gabarits (7)" : "1. مكتبة القوالب (7)"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("MARGINS_AND_DENSITY")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "MARGINS_AND_DENSITY"
                  ? "bg-gradient-to-r from-amber-600 to-purple-600 text-white shadow-md shadow-amber-600/20"
                  : "bg-slate-900 text-amber-300 hover:bg-slate-800 border border-amber-700/60"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>
                {isFr
                  ? "2. Marges (mm) & Espacement Vertical"
                  : "2. تخصيص الهوامش (mm) والتباعد العمودي"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PAGE_BREAK_OPTIMIZER")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "PAGE_BREAK_OPTIMIZER"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-900 text-emerald-300 hover:bg-slate-800 border border-emerald-800/60"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>
                {isFr
                  ? "3. Optimiseur Anti-Coupure"
                  : "3. مُحسِّن الفواصل ومنع الانشطار"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("LIVE_VISUALIZER")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "LIVE_VISUALIZER"
                  ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/20"
                  : "bg-slate-900 text-cyan-300 hover:bg-slate-800 border border-cyan-800/60"
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>
                {isFr
                  ? "4. Page Break Visualizer (A4 Direct)"
                  : "4. عارض فواصل الصفحات الحي على A4"}
              </span>
              <span className="bg-slate-950/60 text-cyan-200 px-1.5 py-0.2 rounded text-[10px] font-mono">
                LIVE
              </span>
            </button>
          </div>

          {/* شريط تحكم سريع في مقاس الورق والتوليد التلقائي للفواصل */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-[11px]">
              {(["A4", "LETTER"] as PageBreakPaperFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => updateBreakConfig({ paperFormat: fmt })}
                  className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                    localBreakConfig.paperFormat === fmt
                      ? "bg-cyan-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {fmt === "A4" ? "A4 (210×297mm)" : "Letter (216×279mm)"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAutoGenerateOptimizedBreaks}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
              title={
                isFr
                  ? "Calculer et insérer automatiquement les sauts de page optimaux pour éviter toute coupure d'équation ou de tableau"
                  : "حساب وإدراج فواصل الصفحات المثلى تلقائياً لمنع انشطار أي معادلة أو سطر جدول بين صفحتين"
              }
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isFr ? "Auto-Optimiser" : "توليد الفواصل المثلى تلقائياً"}
              </span>
            </button>
          </div>
        </div>

        {/* إشعار نجاح الحفظ أو التوليد التلقائي */}
        {autoOptimizeFeedback && (
          <div className="bg-emerald-950/90 border-b border-emerald-700/80 px-5 py-2 flex items-center justify-between text-xs text-emerald-200 shrink-0">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{autoOptimizeFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoOptimizeFeedback(null)}
              className="text-emerald-400 hover:text-white text-[11px] font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {activeTab === "MARGINS_AND_DENSITY" ? (
          /* التبويب الثاني الجديد: تخصيص الهوامش بالمليمتر (#printable-document-sheet) وحفظها كقالب + ضبط التباعد العمودي وكثافة الوثيقة (.printable-document-sheet) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/60 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* القسم الأول (6 أعمدة): هندسة الهوامش المخصصة بالمليمتر (Top, Bottom, Left, Right) وحفظ القوالب */}
              <div className="lg:col-span-6 bg-slate-900 border border-amber-500/30 rounded-2xl p-4 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>
                          {isFr
                            ? "Marges du Document en Millimètres (Top, Bottom, Left, Right)"
                            : "تخصيص هوامش الوثيقة بالمليمتر (العلوي، السفلي، الأيسر، الأيمن)"}
                        </span>
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded text-[10px] font-mono">
                          #printable-document-sheet
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {isFr
                          ? "Ajustez chaque bord en mm et sauvegardez vos propres préréglages de marges"
                          : "اضبط كل هامش بدقة المليمتر (mm) واحفظ إعداداتك كقالب هوامش مخصص جديد للعودة إليه بلمسة واحدة"}
                      </p>
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-1.5 text-[11px] text-amber-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={lockSymmetricMargins}
                      onChange={(e) => setLockSymmetricMargins(e.target.checked)}
                      className="rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="font-bold">
                      {isFr ? "Marges symétriques" : "توحيد الهوامش الـ 4"}
                    </span>
                  </label>
                </div>

                {/* حقول التحكم الأربعة بالمليمتر (Top, Bottom, Left, Right) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      {
                        side: "top" as const,
                        labelAr: "الهامش العلوي (Top)",
                        labelFr: "Haut (Top)",
                        val: curTopMm,
                      },
                      {
                        side: "bottom" as const,
                        labelAr: "الهامش السفلي (Bottom)",
                        labelFr: "Bas (Bottom)",
                        val: curBottomMm,
                      },
                      {
                        side: "left" as const,
                        labelAr: "الهامش الأيسر (Left)",
                        labelFr: "Gauche (Left)",
                        val: curLeftMm,
                      },
                      {
                        side: "right" as const,
                        labelAr: "الهامش الأيمن (Right)",
                        labelFr: "Droite (Right)",
                        val: curRightMm,
                      },
                    ] as const
                  ).map((m) => (
                    <div
                      key={m.side}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-bold">
                          {isFr ? m.labelFr : m.labelAr}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={4}
                          max={35}
                          step={1}
                          value={m.val}
                          onChange={(e) =>
                            handleMarginChangeMm(m.side, Number(e.target.value))
                          }
                          className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-2 py-1 text-center font-mono text-sm font-black text-amber-300 focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-[11px] font-mono text-slate-400 font-bold">
                          mm
                        </span>
                      </div>
                      <input
                        type="range"
                        min={4}
                        max={35}
                        step={1}
                        value={m.val}
                        onChange={(e) =>
                          handleMarginChangeMm(m.side, Number(e.target.value))
                        }
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                {/* ملخص المساحة الصافية للطباعة بعد خصم الهوامش */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-300 font-bold">
                    {isFr
                      ? "Surface imprimable nette (#printable-document-sheet) :"
                      : "المساحة الصافية للطباعة على الورقة بعد خصم الهوامش :"}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-bold">
                      {isFr ? "Largeur :" : "العرض الصافي:"} {optimizationPlan.usableWidthMm} mm
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                      {isFr ? "Hauteur :" : "الارتفاع الصافي:"} {optimizationPlan.usableHeightMm} mm
                    </span>
                  </div>
                </div>

                {/* حفظ الهوامش الحالية كقالب مخصص جديد (Save as Custom Margin Preset) */}
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 space-y-2.5">
                  <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <BookmarkPlus className="w-4 h-4 text-amber-400" />
                    <span>
                      {isFr
                        ? "Enregistrer comme nouveau préréglage de marges personnalisé"
                        : "حفظ الهوامش الحالية كقالب هوامش مخصص جديد (Save Custom Margin Preset)"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={newPresetNameAr}
                      onChange={(e) => setNewPresetNameAr(e.target.value)}
                      placeholder={
                        isFr
                          ? "Nom du préréglage (ex: Examen Régional 10mm)..."
                          : "إسم قالب الهوامش الجديد (مثلاً: فرض محروس مضغوط 10mm)..."
                      }
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveNewCustomMarginPreset}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-md shadow-amber-500/10"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>
                        {isFr ? "Sauvegarder le Préréglage" : "حفظ كقالب هوامش جديد"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* مكتبة قوالب الهوامش الجاهزة والمحفوظة */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>
                      {isFr
                        ? `Préréglages de marges disponibles (${marginPresets.length}) :`
                        : `قوالب الهوامش المتاحة والمحفوظة (${marginPresets.length}) :`}
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-mono">
                      Top / Bottom / Left / Right
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {marginPresets.map((preset) => {
                      const isSelected =
                        localBreakConfig.activeMarginPresetId === preset.id ||
                        (curTopMm === preset.topMm &&
                          curBottomMm === preset.bottomMm &&
                          curLeftMm === preset.leftMm &&
                          curRightMm === preset.rightMm);

                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleSelectMarginPreset(preset)}
                          className={`rounded-xl border p-2.5 transition cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-400 text-white shadow-xs"
                              : "bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="text-xs font-bold truncate flex items-center gap-1.5">
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                              <span className="truncate">
                                {isFr ? preset.nameFr : preset.nameAr}
                              </span>
                            </div>
                            <div className="text-[10.5px] font-mono text-amber-300">
                              T:{preset.topMm} · B:{preset.bottomMm} · L:{preset.leftMm} · R:
                              {preset.rightMm} mm
                            </div>
                          </div>

                          {!preset.isBuiltIn && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomMarginPreset(preset.id);
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white transition cursor-pointer shrink-0"
                              title={isFr ? "Supprimer ce préréglage" : "حذف هذا القالب المخصص"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* القسم الثاني (6 أعمدة): التحكم في التباعد العمودي وكثافة الوثيقة (.printable-document-sheet) */}
              <div className="lg:col-span-6 bg-slate-900 border border-purple-500/30 rounded-2xl p-4 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                      <MoveVertical className="w-4 h-4 text-purple-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>
                          {isFr
                            ? "Espacement Vertical & Densité du Document"
                            : "التحكم في التباعد العمودي وكثافة الوثيقة"}
                        </span>
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded text-[10px] font-mono">
                          .printable-document-sheet
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {isFr
                          ? "Ajustez l'espacement entre les sections d'exercices et les paragraphes pour optimiser la densité"
                          : "اضبط المسافة العمودية الفاصلة بين أقسام التمارين وبين الفقرات والأسئلة لتحسين كثافة الصفحة واستغلال الورق"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* أزرار المستويات الخمسة الجاهزة لكثافة الوثيقة */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-300">
                    {isFr
                      ? "Niveaux de densité prédéfinis :"
                      : "أنماط الكثافة العمودية الجاهزة :"}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {VERTICAL_DENSITY_PRESETS.map((dPreset) => {
                      const isActiveDensity =
                        localBreakConfig.verticalDensityPreset === dPreset.id;
                      return (
                        <button
                          key={dPreset.id}
                          type="button"
                          onClick={() => handleSelectVerticalDensityPreset(dPreset.id)}
                          className={`p-2 rounded-xl border text-start transition cursor-pointer flex flex-col justify-between ${
                            isActiveDensity
                              ? "bg-purple-600/25 border-purple-400 text-white shadow-xs"
                              : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <div className="text-[11px] font-black leading-tight">
                            {isFr ? dPreset.labelFr : dPreset.labelAr}
                          </div>
                          <div className="text-[9.5px] font-mono text-purple-300 mt-1">
                            Ex:{dPreset.exerciseGapMm}mm · P:{dPreset.paragraphGapMm}mm
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* المنزلقات الدقيقة الثلاثة للتباعد العمودي بين التمارين والفقرات وارتفاع السطر */}
                <div className="space-y-3 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5">
                  {/* 1. التباعد العمودي بين أقسام التمارين (Exercise Sections Vertical Gap) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <AlignVerticalSpaceAround className="w-3.5 h-3.5 text-purple-400" />
                        {isFr
                          ? "Espacement vertical entre les sections d'exercices :"
                          : "التباعد العمودي بين أقسام التمارين (Exercise Sections Gap) :"}
                      </span>
                      <span className="font-mono text-xs font-black text-purple-300 bg-purple-950/60 border border-purple-700/50 px-2 py-0.5 rounded">
                        {curExerciseGapMm} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={16}
                      step={0.5}
                      value={curExerciseGapMm}
                      onChange={(e) =>
                        updateBreakConfig({
                          exerciseGapMm: Number(e.target.value),
                        })
                      }
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>1.0 mm (مكثف جداً)</span>
                      <span>4.5 mm (قياسي)</span>
                      <span>16.0 mm (متباعد)</span>
                    </div>
                  </div>

                  {/* 2. التباعد العمودي بين الفقرات والأسئلة الفرعية (Paragraphs & Sub-questions Vertical Gap) */}
                  <div className="space-y-1 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <MoveVertical className="w-3.5 h-3.5 text-cyan-400" />
                        {isFr
                          ? "Espacement vertical entre paragraphes et sous-questions :"
                          : "التباعد العمودي بين الفقرات والأسئلة الفرعية (Paragraph Spacing) :"}
                      </span>
                      <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-950/60 border border-cyan-700/50 px-2 py-0.5 rounded">
                        {curParagraphGapMm} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={8}
                      step={0.25}
                      value={curParagraphGapMm}
                      onChange={(e) =>
                        updateBreakConfig({
                          paragraphGapMm: Number(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>0.5 mm (مضغوط)</span>
                      <span>2.2 mm (متوازن)</span>
                      <span>8.0 mm (موسع للكتابة)</span>
                    </div>
                  </div>

                  {/* 3. معامل ارتفاع السطر الرياضي (Line Height Ratio) */}
                  <div className="space-y-1 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">
                        {isFr
                          ? "Hauteur de ligne mathématique (Line-Height) :"
                          : "معامل ارتفاع السطر للنصوص والمعادلات (Line-Height Ratio) :"}
                      </span>
                      <span className="font-mono text-xs font-black text-emerald-300 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded">
                        {curLineHeight.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1.2}
                      max={1.85}
                      step={0.05}
                      value={curLineHeight}
                      onChange={(e) =>
                        updateBreakConfig({
                          lineHeightRatio: Number(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>1.20 (كثيف)</span>
                      <span>1.48 (قياسي)</span>
                      <span>1.85 (مريح جداً)</span>
                    </div>
                  </div>
                </div>

                {/* مؤشر أثر الكثافة والهوامش على عدد الصفحات الكلي */}
                <div className="bg-gradient-to-r from-purple-950/40 via-slate-950 to-amber-950/40 border border-purple-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-black text-white">
                      {isFr
                        ? "Impact en temps réel sur la pagination :"
                        : "الأثر الفوري للهوامش والتباعد العمودي على توزيع الصفحات :"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isFr
                        ? `Total estimé : ${optimizationPlan.totalPages} page(s) (${optimizationPlan.usableHeightMm} mm utiles/page)`
                        : `إجمالي الصفحات المحسوب: ${optimizationPlan.totalPages} صفحة (حيز عمودي صافي ${optimizationPlan.usableHeightMm} ملم لكل صفحة)`}
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-mono font-black text-xs">
                    {optimizationPlan.totalPages}{" "}
                    {isFr ? "Page(s)" : "صفحات"}
                  </span>
                </div>
              </div>
            </div>

            {/* معاينة حية مباشرة لورقة A4 أسفل أدوات الهوامش والتباعد */}
            {renderLiveA4PageBreakVisualizerCanvas(false)}
          </div>
        ) : activeTab === "TEMPLATES" ? (
          <>
            {/* فئات التصفية السريعة */}
            <div className="bg-slate-950/70 border-b border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <span className="text-slate-400 font-bold ml-1">
                  {isFr ? "Catégorie :" : "التصنيف :"}
                </span>
                {(
                  [
                    { id: "ALL", labelAr: "الكل (7 هياكل)", labelFr: "Tous (7)" },
                    { id: "OFFICIAL", labelAr: "فروض وامتحانات رسمية", labelFr: "Examens Officiels" },
                    { id: "COMPACT", labelAr: "توفير الورق والأعمدة", labelFr: "Économie & 2 Colonnes" },
                    { id: "PEDAGOGICAL", labelAr: "بيداغوجيا فارقية وورشات", labelFr: "Différenciation & TD" },
                    { id: "WORKBOOK", labelAr: "دفتر إجابة مدمج", labelFr: "Cahier Réponse" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {isFr ? cat.labelFr : cat.labelAr}
                  </button>
                ))}
              </div>

              {/* مؤشر الهيكل النشط حالياً */}
              <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold">
                  {isFr ? "Gabarit Actif :" : "الهيكل النشط حالياً :"}
                </span>
                <span className="text-white font-mono text-[11px]">
                  {isFr ? activeTemplate.labelFr : activeTemplate.labelAr}
                </span>
              </div>
            </div>

            {/* شريط موجز حالة حماية المعادلات والهوامش وعارض الفواصل الحي */}
            <div className="bg-slate-900/90 border-b border-slate-800/80 px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <ScanLine className="w-4 h-4 text-cyan-400" />
                  {isFr
                    ? `Configuration Active (${optimizationPlan.paperFormat}) :`
                    : `الإعدادات الهندسية النشطة (${optimizationPlan.paperFormat}) :`}
                </span>
                <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  {isFr
                    ? `Marges: ${curTopMm}/${curBottomMm}/${curLeftMm}/${curRightMm}mm`
                    : `الهوامش: ${curTopMm}/${curBottomMm}/${curLeftMm}/${curRightMm} ملم`}
                </span>
                <span className="bg-slate-800 text-purple-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  {isFr
                    ? `Espacement: Ex ${curExerciseGapMm}mm · Par ${curParagraphGapMm}mm`
                    : `التباعد العمودي: تمارين ${curExerciseGapMm}mm · فقرات ${curParagraphGapMm}mm`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("MARGINS_AND_DENSITY")}
                  className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-4 cursor-pointer flex items-center gap-1"
                >
                  <span>
                    {isFr
                      ? "Personnaliser Marges (mm) & Densité"
                      : "تخصيص الهوامش (mm) والتباعد العمودي"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* شبكة القوالب التفاعلية مع خطوط المعاينة شبه الشفافة داخل كل قالب */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const isActive = template.id === activeTemplateId;
                  const isHovered = template.id === hoveredTemplateId;

                  return (
                    <div
                      key={template.id}
                      onMouseEnter={() => setHoveredTemplateId(template.id)}
                      onMouseLeave={() => setHoveredTemplateId(null)}
                      onClick={() => handleApply(template.id)}
                      className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500"
                          : isHovered
                          ? "bg-slate-800/90 border-slate-600"
                          : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* شارة التميز والأعمدة */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                              template.columnsCount === 2
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "bg-indigo-950 text-indigo-300 border border-indigo-800"
                            }`}
                          >
                            {template.columnsCount === 2
                              ? isFr
                                ? "2 Colonnes"
                                : "عمودان متوازيان"
                              : isFr
                              ? "1 Colonne Standard"
                              : "عمود واحد قياسي"}
                          </span>

                          {template.paperSavingsPercent > 0 && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <TrendingDown className="w-3 h-3 text-emerald-400" />
                              <span>-{template.paperSavingsPercent}% ورق</span>
                            </span>
                          )}

                          {template.hasOfficialBorder && (
                            <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {isFr ? "Cadre Officiel" : "مؤطر رسمياً"}
                            </span>
                          )}
                        </div>

                        {isActive ? (
                          <span className="bg-emerald-500 text-slate-950 rounded-full p-1 shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="text-slate-600 group-hover:text-indigo-400 transition">
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </div>

                      {/* المعاينة المخططة (Miniature Wireframe) مع خط فاصل الصفحة شبه الشفاف */}
                      <div className="relative bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 mb-3 flex flex-col gap-1.5 h-28 justify-center overflow-hidden">
                        {/* خط فاصل الصفحة شبه الشفاف فوق المعاينة المصغرة */}
                        {isVisualizerActive && (
                          <div
                            style={{ opacity: visualizerOpacity }}
                            className="absolute inset-x-0 bottom-4 z-10 bg-emerald-500/20 border-y border-dashed border-cyan-400/90 py-0.5 px-2 flex items-center justify-between text-[8px] font-mono text-cyan-200 pointer-events-none"
                          >
                            <span>✂️ {optimizationPlan.paperFormat} Auto-Break</span>
                            <span>{optimizationPlan.usableHeightMm}mm</span>
                          </div>
                        )}

                        {template.id === "STANDARD_ACADEMIC" && (
                          <div className="space-y-1.5 w-full">
                            <div className="h-3 bg-indigo-500/30 rounded w-full border border-indigo-500/40"></div>
                            <div className="h-4 bg-slate-800 rounded w-full border border-slate-700"></div>
                            <div className="h-7 bg-slate-800/60 rounded w-full border border-slate-700/60"></div>
                            <div className="h-4 bg-slate-800 rounded w-full border border-slate-700"></div>
                          </div>
                        )}

                        {template.id === "DUAL_COLUMN_COMPACT" && (
                          <div className="w-full space-y-1.5">
                            <div className="h-3 bg-emerald-500/30 rounded w-full border border-emerald-500/40"></div>
                            <div className="grid grid-cols-2 gap-2 h-16">
                              <div className="border-r border-emerald-500/40 pr-1 space-y-1">
                                <div className="h-3 bg-slate-800 rounded"></div>
                                <div className="h-5 bg-slate-800/60 rounded"></div>
                                <div className="h-4 bg-slate-800/60 rounded"></div>
                              </div>
                              <div className="space-y-1 pl-1">
                                <div className="h-3 bg-slate-800 rounded"></div>
                                <div className="h-5 bg-slate-800/60 rounded"></div>
                                <div className="h-4 bg-slate-800/60 rounded"></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {template.id === "OFFICIAL_EXAM_BORDERED" && (
                          <div className="border-2 border-slate-400 p-1 rounded w-full space-y-1 h-full flex flex-col justify-between">
                            <div className="h-3 bg-slate-700 rounded flex justify-between px-1 items-center">
                              <span className="w-6 h-1.5 bg-slate-500 rounded"></span>
                              <span className="w-8 h-1.5 bg-amber-400 rounded"></span>
                            </div>
                            <div className="h-7 bg-slate-800/80 rounded border border-slate-700"></div>
                            <div className="h-7 bg-slate-800/80 rounded border border-slate-700"></div>
                          </div>
                        )}

                        {template.id === "PEDAGOGICAL_WORKSHOP_CARDS" && (
                          <div className="w-full space-y-1.5">
                            <div className="h-2.5 bg-purple-500/40 rounded w-2/3"></div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <div className="h-10 bg-purple-950/40 border border-purple-500/30 rounded-lg p-1 space-y-0.5">
                                <div className="h-1.5 bg-purple-400 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-800/60 rounded"></div>
                              </div>
                              <div className="h-10 bg-purple-950/40 border border-purple-500/30 rounded-lg p-1 space-y-0.5">
                                <div className="h-1.5 bg-purple-400 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-800/60 rounded"></div>
                              </div>
                            </div>
                            <div className="h-6 bg-slate-800/50 rounded-lg border border-slate-700"></div>
                          </div>
                        )}

                        {template.id === "DIFFERENTIATED_TIER_SPLIT" && (
                          <div className="w-full space-y-1">
                            <div className="h-2.5 bg-amber-500/30 rounded w-full"></div>
                            <div className="h-9 bg-amber-950/30 border border-amber-600/40 rounded p-1 space-y-0.5">
                              <div className="h-1.5 bg-amber-400 rounded w-1/3"></div>
                              <div className="h-4 bg-slate-800/60 rounded"></div>
                            </div>
                            <div className="h-9 bg-indigo-950/30 border border-indigo-600/40 rounded p-1 space-y-0.5">
                              <div className="h-1.5 bg-indigo-400 rounded w-1/3"></div>
                              <div className="h-4 bg-slate-800/60 rounded"></div>
                            </div>
                          </div>
                        )}

                        {template.id === "WORKBOOK_ANSWER_ZONES" && (
                          <div className="w-full space-y-1">
                            <div className="h-2.5 bg-sky-500/30 rounded w-3/4"></div>
                            <div className="h-5 bg-slate-800 rounded"></div>
                            <div className="h-10 bg-sky-950/20 border border-sky-500/30 rounded p-1 flex flex-col justify-around">
                              <div className="h-px bg-sky-400/40 w-full"></div>
                              <div className="h-px bg-sky-400/40 w-full"></div>
                              <div className="h-px bg-sky-400/40 w-full"></div>
                            </div>
                          </div>
                        )}

                        {template.id === "MINIMALIST_AEFE_MODERN" && (
                          <div className="border-r-2 border-rose-500 pr-1.5 w-full space-y-1.5">
                            <div className="h-2.5 bg-slate-700 rounded w-1/2"></div>
                            <div className="h-6 bg-slate-800/80 rounded"></div>
                            <div className="h-6 bg-slate-800/80 rounded"></div>
                          </div>
                        )}
                      </div>

                      {/* اسم وتفاصيل القالب */}
                      <div className="space-y-1.5 flex-1">
                        <h4 className="text-sm font-black text-white group-hover:text-indigo-300 transition">
                          {isFr ? template.labelFr : template.labelAr}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                          {isFr ? template.descriptionFr : template.descriptionAr}
                        </p>
                      </div>

                      {/* الاستخدام المثالي وزر التطبيق */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10.5px]">
                        <span
                          className="text-slate-400 truncate max-w-[200px]"
                          title={template.bestForAr}
                        >
                          <span className="text-slate-500 font-bold ml-1">
                            {isFr ? "Usage :" : "المثالي لـ:"}
                          </span>
                          {isFr ? template.bestForFr : template.bestForAr}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApply(template.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold transition text-[10.5px] cursor-pointer ${
                            isActive
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white"
                          }`}
                        >
                          {isActive
                            ? isFr
                              ? "Sélectionné"
                              : "مفعل حالياً"
                            : isFr
                            ? "Appliquer"
                            : "تطبيق الهيكل"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : activeTab === "LIVE_VISUALIZER" ? (
          /* التبويب الرابع: عارض فواصل الصفحات الحي على ورقة A4/Letter (Live Page Break Visualizer) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/60 space-y-4">
            {renderLiveA4PageBreakVisualizerCanvas(false)}
          </div>
        ) : (
          /* التبويب الثالث: محسن فواصل الصفحات الذكي (A4 / Letter) ومنع انقسام المعادلات والجداول */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/50 space-y-5">
            {/* البطاقات الإحصائية العليا */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isFr ? "Format & Hauteur Utile" : "مقاس الورق والارتفاع الصافي"}</span>
                  <Layers className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-base font-black text-white font-mono">
                  {optimizationPlan.paperFormat} ({optimizationPlan.paperWidthMm}×{optimizationPlan.paperHeightMm}mm)
                </div>
                <div className="text-[11px] text-cyan-300">
                  {isFr
                    ? `Zone imprimable : ${optimizationPlan.usableHeightMm} mm (${optimizationPlan.usableHeightPx} px)`
                    : `حيز الطباعة الآمن: ${optimizationPlan.usableHeightMm} ملم (${optimizationPlan.usableHeightPx} بكسل)`}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isFr ? "Équations Verrouillées" : "المعادلات والنظمات المؤمنة"}</span>
                  <Sigma className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-base font-black text-indigo-300 font-mono">
                  {optimizationPlan.totalProtectedEquations}{" "}
                  <span className="text-xs font-normal text-slate-300">
                    {isFr ? "blocs math." : "كتلة معادلات"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {localBreakConfig.lockDisplayEquations
                    ? isFr
                      ? "break-inside: avoid-page actif"
                      : "مقفلة ضد الانشطار بين صفحتين"
                    : isFr
                    ? "Verrouillage désactivé"
                    : "الحماية معطلة"}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isFr ? "Lignes de Tableaux & tkz-tab" : "أسطر الجداول وجداول التغيرات"}</span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-base font-black text-emerald-300 font-mono">
                  {optimizationPlan.totalProtectedTableRows}{" "}
                  <span className="text-xs font-normal text-slate-300">
                    {isFr ? "lignes (tr)" : "سطر جدول"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {localBreakConfig.lockTableRowsAndSignTables
                    ? isFr
                      ? "thead répété + tr indivisible"
                      : "منع شطر السطر وتكرار الترويسة"
                    : isFr
                    ? "Non verrouillé"
                    : "غير مقفل"}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{isFr ? "Coupures Évitées & Pages" : "الانقسامات التي تم تفاديها"}</span>
                  <Scissors className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-base font-black text-amber-300 font-mono">
                  {optimizationPlan.totalCollisionsPrevented}{" "}
                  <span className="text-xs font-normal text-slate-300">
                    {isFr
                      ? `sur ${optimizationPlan.totalPages} page(s)`
                      : `عبر ${optimizationPlan.totalPages} صفحة`}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-300">
                  {isFr
                    ? `${optimizationPlan.recommendedBreakIndices.length} saut(s) de page actifs`
                    : `${optimizationPlan.recommendedBreakIndices.length} فاصل صفحة استباقي مفعل`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* العمود الأول: إعدادات القفل الذري لمنع الانقسام */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-black text-white">
                      {isFr
                        ? "Règles Anti-Coupure (A4 / US Letter)"
                        : "قواعد الحماية الذرية ضد انقسام المحتوى الرياضي"}
                    </h4>
                  </div>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={localBreakConfig.enabled}
                      onChange={(e) => updateBreakConfig({ enabled: e.target.checked })}
                      className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-emerald-300">
                      {isFr ? "Actif" : "مُفعّل"}
                    </span>
                  </label>
                </div>

                {/* اختيار مقاس الورق وصرامة الفواصل */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block">
                      {isFr ? "Format de Papier :" : "مقاس الورق المعتمد :"}
                    </label>
                    <select
                      value={localBreakConfig.paperFormat}
                      onChange={(e) =>
                        updateBreakConfig({ paperFormat: e.target.value as PageBreakPaperFormat })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white font-bold"
                    >
                      <option value="A4">A4 Standard (210 × 297 mm)</option>
                      <option value="LETTER">US Letter (215.9 × 279.4 mm)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block">
                      {isFr ? "Niveau de Tolérance :" : "صرامة منع الانقسام :"}
                    </label>
                    <select
                      value={localBreakConfig.strictnessMode}
                      onChange={(e) =>
                        updateBreakConfig({
                          strictnessMode: e.target.value as PageBreakStrictnessMode,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-white font-bold"
                    >
                      <option value="STRICT_NO_SPLIT">
                        {isFr ? "Strict (Zéro coupure)" : "صارم جداً (صفر انقسام)"}
                      </option>
                      <option value="BALANCED">
                        {isFr ? "Équilibré (Standard)" : "متوازن (قياسي)"}
                      </option>
                      <option value="MAXIMUM_COMPACT">
                        {isFr ? "Compact (Économie)" : "مكثف (أقصى استغلال للورقة)"}
                      </option>
                    </select>
                  </div>
                </div>

                {/* المفاتيح الخمسة للحماية */}
                <div className="space-y-2.5">
                  {[
                    {
                      key: "lockDisplayEquations" as const,
                      titleAr: "منع انشطار المعادلات والنظمات والمصفوفات",
                      titleFr: "Verrouiller les équations, systèmes et matrices",
                      descAr:
                        "تطبيق break-inside: avoid و \\interdisplaylinepenalty=10000 لمنع كسر النهايات والتكاملات والنظمات بين صفحتين.",
                      descFr:
                        "Applique break-inside: avoid et \\interdisplaylinepenalty=10000 sur tous les blocs mathématiques.",
                    },
                    {
                      key: "lockTableRowsAndSignTables" as const,
                      titleAr: "منع انقسام أسطر الجداول وجداول التغيرات والإشارة",
                      titleFr: "Empêcher la coupure des lignes de tableaux (tr & tkz-tab)",
                      descAr:
                        "حماية أسطر جداول التغيرات والإشارة وسلم التنقيط من الانقسام أفقياً مع تكرار رأس الجدول تلقائياً.",
                      descFr:
                        "Protège chaque ligne <tr> et les tableaux de variations/signes contre toute coupure horizontale.",
                    },
                    {
                      key: "lockQuestionWithAnswerZone" as const,
                      titleAr: "ربط نص السؤال بحيز الإجابة المسطر (Seyès / Grid)",
                      titleFr: "Lier l'énoncé de la question à sa zone réponse Seyès",
                      descAr:
                        "يمنع ظهور نص السؤال في ذيل الصفحة الأولى بينما يظهر مربع الإجابة المسطر في أعلى الصفحة الثانية.",
                      descFr:
                        "Évite qu'une question reste en bas de page pendant que son cadre réponse passe à la page suivante.",
                    },
                    {
                      key: "lockExerciseHeadersAndOrphans" as const,
                      titleAr: "منع العناوين اليتيمة والأسطر المنفردة (Widows & Orphans)",
                      titleFr: "Protection contre les titres et lignes orphelines",
                      descAr:
                        "إلزام بقاء عنوان التمرين مع أول سؤالين على الأقل في نفس الصفحة (orphans: 3; widows: 3).",
                      descFr:
                        "Garantit que l'en-tête d'un exercice reste solidaire d'au moins 2 questions.",
                    },
                    {
                      key: "autoInsertBreaksOnCollision" as const,
                      titleAr: "إدراج فواصل صفحات استباقية تلقائياً عند رصد تصادم",
                      titleFr: "Insertion automatique de sauts de page préventifs",
                      descAr:
                        "ترحيل التمرين تلقائياً لبداية الصفحة الموالية إذا تبين أن معادلاته أو جداوله ستقطع خط النهاية.",
                      descFr:
                        "Bascule automatiquement l'exercice sur une nouvelle page si un tableau ou une équation dépasse.",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border transition cursor-pointer ${
                        localBreakConfig[item.key]
                          ? "bg-slate-950/90 border-indigo-500/40"
                          : "bg-slate-950/40 border-slate-800 opacity-70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(localBreakConfig[item.key])}
                        onChange={(e) =>
                          updateBreakConfig({ [item.key]: e.target.checked })
                        }
                        className="mt-1 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500"
                      />
                      <div className="space-y-0.5 text-xs">
                        <div className="font-bold text-white">
                          {isFr ? item.titleFr : item.titleAr}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {isFr ? item.descFr : item.descAr}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* أزرار معاينة الكود المولد */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      {isFr ? "Inspecter le code généré :" : "معاينة قواعد الكود المولّدة :"}
                    </span>
                    <div className="flex items-center gap-1">
                      {(["NONE", "CSS", "LATEX", "TYPST"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setShowCodeSnippetPreview(mode)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            showCodeSnippetPreview === mode
                              ? "bg-cyan-600 text-white"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {mode === "NONE" ? (isFr ? "Masquer" : "إخفاء") : mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {showCodeSnippetPreview !== "NONE" && (
                    <pre
                      dir="ltr"
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[10.5px] font-mono text-cyan-300 overflow-x-auto max-h-40"
                    >
                      {showCodeSnippetPreview === "CSS"
                        ? optimizationPlan.cssRules
                        : showCodeSnippetPreview === "LATEX"
                        ? optimizationPlan.latexPreambleSnippet
                        : optimizationPlan.typstPreambleSnippet}
                    </pre>
                  )}
                </div>
              </div>

              {/* العمود الثاني: عارض الفواصل الحي على ورقة A4 + قائمة التحكم في التمارين */}
              <div className="lg:col-span-7 space-y-4">
                {/* عارض خطوط الفواصل شبه الشفافة المدمج */}
                {renderLiveA4PageBreakVisualizerCanvas(true)}

                {/* التحكم اليدوي/الآلي في فواصل التمارين */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <AlignVerticalSpaceAround className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-black text-white">
                        {isFr
                          ? "Contrôle des Sauts de Page par Exercice"
                          : "التحكم في فواصل الصفحات قبل كل تمرين"}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoGenerateOptimizedBreaks}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>
                        {isFr ? "Générer Sauts Optimisés" : "تطبيق الفواصل المثلى"}
                      </span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {optimizationPlan.exercisesAnalysis.map((ex) => (
                      <div
                        key={ex.exerciseIndex}
                        className={`rounded-xl border p-2.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          ex.hasPageBreakBefore
                            ? "bg-emerald-950/20 border-emerald-700/50"
                            : "bg-slate-950/70 border-slate-800"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 px-2 py-0.5 rounded text-[10.5px] font-black">
                              {isFr ? `Exercice ${ex.exerciseNumber}` : `التمرين ${ex.exerciseNumber}`}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {isFr ? ex.titleFr : ex.titleAr}
                            </span>
                            <span className="bg-slate-800 text-cyan-300 px-1.5 py-0.2 rounded text-[10px] font-mono">
                              {isFr ? `Page ${ex.assignedPageNumber}` : `الصفحة ${ex.assignedPageNumber}`}{" "}
                              ({ex.startOffsetMmOnPage}→{ex.endOffsetMmOnPage}mm)
                            </span>
                          </div>
                        </div>

                        {ex.exerciseIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => handleToggleExerciseBreak(ex.exerciseIndex)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition shrink-0 flex items-center gap-1 cursor-pointer ${
                              localBreakConfig.forcedBreakBeforeExercises.includes(
                                ex.exerciseIndex
                              )
                                ? "bg-emerald-600 text-white border-emerald-500"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                            }`}
                          >
                            <Scissors className="w-3 h-3" />
                            <span>
                              {localBreakConfig.forcedBreakBeforeExercises.includes(
                                ex.exerciseIndex
                              )
                                ? isFr
                                  ? "Saut avant actif"
                                  : "فاصل قبله مفعل"
                                : isFr
                                ? "Insérer saut avant"
                                : "فاصل صفحة قبله"}
                            </span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* الشريط السفلي للمعلومات */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {isFr
                ? "Les marges (mm), la densité verticale (.printable-document-sheet) et les sauts de page sont appliqués en temps réel sur l'aperçu et l'export PDF/LaTeX."
                : "تُطبَّق الهوامش المخصصة بالمليمتر (#printable-document-sheet) والتباعد العمودي (.printable-document-sheet) وفواصل الصفحات فوراً على ورقة المعاينة والتصدير."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition cursor-pointer"
            >
              {isFr ? "Valider & Fermer" : "اعتماد الإعدادات وإغلاق"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
