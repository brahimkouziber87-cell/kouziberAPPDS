import React, { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  FileDown,
  FileSpreadsheet,
  Layers,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  Table2,
} from "lucide-react";
import {
  CustomEvaluationGridData,
  EVAL_GRID_TEMPLATES_142_08,
  EvalGridCustomConfig142_08,
  EvalGridMasteryScaleType,
  EvalGridTemplateId,
  GridGranularity,
  createCustomConfigFromTemplate,
  getEvalGridTemplateById,
} from "../utils/evaluationGridExporter";

export interface SavedUserEvalGridTemplate {
  id: string;
  labelAr: string;
  createdAt: string;
  config: EvalGridCustomConfig142_08;
}

const SAVED_EVAL_GRID_TEMPLATES_STORAGE_KEY =
  "prof_math_saved_eval_grid_142_08_templates_v1";

export interface EvalGridTemplates142_08PanelProps {
  config: EvalGridCustomConfig142_08;
  onChangeConfig: (next: EvalGridCustomConfig142_08) => void;
  gridData: CustomEvaluationGridData;
  includeCustomEvalGridSheet: boolean;
  onToggleIncludeSheet: (include: boolean) => void;
  evalGridGranularity: GridGranularity;
  onChangeGranularity: (g: GridGranularity) => void;
  evalGridStudentCount: number;
  onChangeStudentCount: (count: number) => void;
  onApplyRecommendedTaxonomicWeights?: (n1: number, n2: number, n3: number) => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  isExportingPDF?: boolean;
  isFr?: boolean;
  compactMode?: boolean;
  onNotify?: (type: "success" | "info" | "error", text: string) => void;
}

export const EvalGridTemplates142_08Panel: React.FC<
  EvalGridTemplates142_08PanelProps
> = ({
  config,
  onChangeConfig,
  gridData,
  includeCustomEvalGridSheet,
  onToggleIncludeSheet,
  evalGridGranularity,
  onChangeGranularity,
  evalGridStudentCount,
  onChangeStudentCount,
  onApplyRecommendedTaxonomicWeights,
  onExportPDF,
  onExportExcel,
  isExportingPDF = false,
  isFr = false,
  compactMode = false,
  onNotify,
}) => {
  const [activeEditorSection, setActiveEditorSection] = useState<
    "TEMPLATES" | "CUSTOMIZE_HEADER_COLS" | "EDIT_CRITERIA_ROWS"
  >("TEMPLATES");
  const [showAllCriteriaRows, setShowAllCriteriaRows] = useState<boolean>(false);
  const [customPresetName, setCustomPresetName] = useState<string>("");
  const [savedUserPresets, setSavedUserPresets] = useState<
    SavedUserEvalGridTemplate[]
  >(() => {
    try {
      const raw = localStorage.getItem(SAVED_EVAL_GRID_TEMPLATES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage read error
    }
    return [];
  });

  const activeTemplatePreset = getEvalGridTemplateById(config.templateId);

  const handleSelectTemplatePreset = (templateId: EvalGridTemplateId) => {
    const nextConfig = createCustomConfigFromTemplate(
      templateId,
      config.questionOverrides
    );
    onChangeConfig(nextConfig);
    onChangeGranularity(nextConfig.granularity);
    if (!includeCustomEvalGridSheet) {
      onToggleIncludeSheet(true);
    }
    if (onApplyRecommendedTaxonomicWeights) {
      onApplyRecommendedTaxonomicWeights(
        nextConfig.recommendedN1,
        nextConfig.recommendedN2,
        nextConfig.recommendedN3
      );
    }
    const tpl = getEvalGridTemplateById(templateId);
    onNotify?.(
      "success",
      `تم تفعيل قالب شبكة التقويم « ${tpl.nameAr} » المتوافق مع المذكرة 142-08 (${nextConfig.recommendedN1}% N1 / ${nextConfig.recommendedN2}% N2 / ${nextConfig.recommendedN3}% N3) وإدراجه في وثيقة المعاينة A4.`
    );
  };

  const handleMasteryScaleChange = (scaleType: EvalGridMasteryScaleType) => {
    let labelsAr: [string, string, string] = [
      "متحكم (A)",
      "في طور التحكم (EC)",
      "غير متحكم (NA)",
    ];
    let labelsFr: [string, string, string] = [
      "Acquis (A)",
      "En cours (EC)",
      "Non acquis (NA)",
    ];

    if (scaleType === "NUMERIC_THRESHOLDS") {
      labelsAr = ["تمكن جيد (≥75%)", "تمكن متوسط (50-74%)", "تعثر (<50%)"];
      labelsFr = ["Maîtrise ≥75%", "Moyenne 50-74%", "Fragile <50%"];
    } else if (scaleType === "ERROR_TYPE_CODES") {
      labelsAr = ["خطأ مفاهيمي (C)", "خطأ حسابي (A)", "خطأ استدلالي (R)"];
      labelsFr = ["Conceptuel (C)", "Algébrique (A)", "Raisonnement (R)"];
    } else if (scaleType === "FOUR_LEVELS_ABCD") {
      labelsAr = ["امتياز (A)", "مقبول (B)", "جزئي (C) / تعثر (D)"];
      labelsFr = ["Expert (A)", "Satisfaisant (B)", "Partiel (C/D)"];
    }

    onChangeConfig({
      ...config,
      masteryScaleType: scaleType,
      masteryLabelsAr: labelsAr,
      masteryLabelsFr: labelsFr,
    });
  };

  const handleUpdateQuestionOverride = (
    questionCode: string,
    patch: Partial<{
      capacityAr: string;
      levelCode: "N1" | "N2" | "N3";
      points: number;
      remediationCriterionAr: string;
    }>
  ) => {
    const prevOv = config.questionOverrides[questionCode] || {};
    onChangeConfig({
      ...config,
      questionOverrides: {
        ...config.questionOverrides,
        [questionCode]: {
          ...prevOv,
          ...patch,
        },
      },
    });
  };

  const handleSaveCustomPreset = () => {
    const trimmed =
      customPresetName.trim() ||
      `${config.customTitleAr.slice(0, 32)} (${new Date().toLocaleDateString("ar-MA")})`;
    const newEntry: SavedUserEvalGridTemplate = {
      id: `custom_grid_142_08_${Date.now()}`,
      labelAr: trimmed,
      createdAt: new Date().toISOString(),
      config,
    };
    const nextList = [newEntry, ...savedUserPresets].slice(0, 12);
    setSavedUserPresets(nextList);
    setCustomPresetName("");
    try {
      localStorage.setItem(
        SAVED_EVAL_GRID_TEMPLATES_STORAGE_KEY,
        JSON.stringify(nextList)
      );
    } catch {
      // ignore storage write error
    }
    onNotify?.(
      "success",
      `تم حفظ قالب شبكة التقويم المخصص « ${trimmed} » في مكتبتك المحلية!`
    );
  };

  const handleDeleteSavedPreset = (id: string) => {
    const nextList = savedUserPresets.filter((item) => item.id !== id);
    setSavedUserPresets(nextList);
    try {
      localStorage.setItem(
        SAVED_EVAL_GRID_TEMPLATES_STORAGE_KEY,
        JSON.stringify(nextList)
      );
    } catch {
      // ignore
    }
  };

  const handleResetToTemplateDefaults = () => {
    const fresh = createCustomConfigFromTemplate(config.templateId, {});
    onChangeConfig(fresh);
    onChangeGranularity(fresh.granularity);
    onNotify?.(
      "info",
      "تمت استعادة الإعدادات المعيارية الأصلية لقالب شبكة التقويم 142-08."
    );
  };

  const questionsToDisplay = showAllCriteriaRows
    ? gridData.allQuestions
    : gridData.allQuestions.slice(0, 6);

  const overrideCount = Object.keys(config.questionOverrides).length;

  return (
    <div className="bg-gradient-to-br from-indigo-50/90 via-white to-cyan-50/70 border border-indigo-200/95 rounded-2xl p-3.5 space-y-3 shadow-2xs text-xs">
      {/* رأس مكتبة قوالب شبكات التقويم المتوافقة مع المذكرة 142-08 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-indigo-950 text-cyan-300 flex items-center justify-center shadow-2xs shrink-0">
            <Table2 className="w-4 h-4" />
          </span>
          <div>
            <div className="font-black text-indigo-950 text-xs flex items-center gap-1.5">
              <span>مكتبة قوالب شبكات التقويم الجاهزة (المذكرة 142-08)</span>
              <span className="text-[9.5px] font-mono font-black px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                6 قوالب رسمية
              </span>
            </div>
            <p className="text-[10.5px] text-slate-600 font-medium">
              اختر قالب شبكة التقويم وعدّل بنوده وقدراته وسلّم التمكن مباشرة لإنتاج الوثيقة
            </p>
          </div>
        </div>

        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950 text-white text-[10.5px] font-black cursor-pointer shadow-2xs">
          <input
            type="checkbox"
            checked={includeCustomEvalGridSheet}
            onChange={(e) => {
              onToggleIncludeSheet(e.target.checked);
              if (e.target.checked) {
                setTimeout(() => {
                  const el = document.getElementById(
                    "printable-evaluation-grid-section"
                  );
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 150);
              }
            }}
            className="rounded text-cyan-400 w-3.5 h-3.5 accent-cyan-400"
          />
          <span>إرفاق الشبكة بوثيقة A4</span>
        </label>
      </div>

      {/* أزرار التنقل بين: 1) اختيار القالب · 2) تخصيص الهيكلة والمؤشرات · 3) تعديل القدرات والأسئلة */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/90 text-[10.5px] font-black">
        <button
          type="button"
          onClick={() => setActiveEditorSection("TEMPLATES")}
          className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
            activeEditorSection === "TEMPLATES"
              ? "bg-indigo-950 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span>1. قوالب 142-08</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveEditorSection("CUSTOMIZE_HEADER_COLS")}
          className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
            activeEditorSection === "CUSTOMIZE_HEADER_COLS"
              ? "bg-indigo-950 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 shrink-0" />
          <span>2. المؤشرات والأعمدة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveEditorSection("EDIT_CRITERIA_ROWS")}
          className={`py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
            activeEditorSection === "EDIT_CRITERIA_ROWS"
              ? "bg-indigo-950 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5 shrink-0" />
          <span>
            3. تعديل البنود ({gridData.allQuestions.length})
          </span>
        </button>
      </div>

      {/* القسم الأول: مكتبة القوالب الجاهزة المتوافقة مع المذكرة 142-08 */}
      {activeEditorSection === "TEMPLATES" && (
        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-black text-indigo-950 mb-1">
              اختيار قالب جاهز من مكتبة المذكرة الوزارية 142-08:
            </label>
            <select
              value={config.templateId}
              onChange={(e) =>
                handleSelectTemplatePreset(e.target.value as EvalGridTemplateId)
              }
              className="w-full border border-indigo-300 rounded-xl px-2.5 py-2 text-xs bg-white font-black text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {EVAL_GRID_TEMPLATES_142_08.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {isFr ? tpl.nameFr : tpl.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* بطاقات القوالب الجاهزة للاختيار السريع بنقرة واحدة */}
          {!compactMode && (
            <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto studio-scroll pr-0.5">
              {EVAL_GRID_TEMPLATES_142_08.map((tpl) => {
                const isSelected = tpl.id === config.templateId;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplatePreset(tpl.id)}
                    className={`w-full text-right p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? "bg-indigo-950 text-white border-indigo-950 shadow-xs"
                        : "bg-white hover:bg-indigo-50/70 text-slate-800 border-slate-200/90"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-[11px] flex items-center gap-1.5">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        )}
                        <span>{isFr ? tpl.nameFr : tpl.nameAr}</span>
                      </span>
                      <span
                        className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          isSelected
                            ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/40"
                            : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                        }`}
                      >
                        {tpl.defaultConfig.recommendedN1}/
                        {tpl.defaultConfig.recommendedN2}/
                        {tpl.defaultConfig.recommendedN3}%
                      </span>
                    </div>
                    <p
                      className={`text-[10px] leading-relaxed ${
                        isSelected ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {isFr ? tpl.shortDescFr : tpl.shortDescAr}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* ملخص القالب المفعل حالياً مع إمكانية التعديل الفوري */}
          <div className="bg-white border border-indigo-200/90 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10.5px] font-black text-indigo-950">
                📌 القالب النشط: {activeTemplatePreset.badgeAr}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                المجموع: {gridData.totalPoints.toFixed(2)} / 20
              </span>
            </div>
            <p className="text-[10.5px] text-slate-600 leading-relaxed">
              {activeTemplatePreset.shortDescAr}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveEditorSection("CUSTOMIZE_HEADER_COLS")}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-[10.5px] font-black flex items-center gap-1 transition cursor-pointer"
              >
                <Sliders className="w-3 h-3 text-indigo-700" />
                <span>تخصيص العنوان ومؤشرات التمكن</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveEditorSection("EDIT_CRITERIA_ROWS")}
                className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-slate-900 text-cyan-200 text-[10.5px] font-black flex items-center gap-1 transition cursor-pointer"
              >
                <Edit3 className="w-3 h-3 text-cyan-400" />
                <span>تعديل القدرات وتنقيط الأسئلة مباشرة</span>
              </button>
            </div>
          </div>

          {/* القوالب المحفوظة من طرف الأستاذ */}
          {savedUserPresets.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
              <div className="text-[10.5px] font-black text-slate-800">
                قوالب شبكات التقويم المخصصة المحفوظة ({savedUserPresets.length}):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {savedUserPresets.map((item) => (
                  <div
                    key={item.id}
                    className="inline-flex items-center bg-white border border-indigo-200 rounded-lg text-[10.5px] font-bold text-indigo-950 shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onChangeConfig(item.config);
                        onChangeGranularity(item.config.granularity);
                        onNotify?.(
                          "success",
                          `تم تحميل قالب التقويم المخصص « ${item.labelAr} » بنجاح.`
                        );
                      }}
                      className="px-2 py-1 hover:bg-indigo-50 rounded-r-lg cursor-pointer"
                    >
                      {item.labelAr}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedPreset(item.id)}
                      className="px-1.5 py-1 text-slate-400 hover:text-rose-600 border-r border-slate-200 cursor-pointer"
                      title="حذف القالب المخصص"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* القسم الثاني: تعديل عنوان الشبكة، سلم التمكن، والأعمدة المطبوعة مباشرة */}
      {activeEditorSection === "CUSTOMIZE_HEADER_COLS" && (
        <div className="space-y-2.5 bg-white border border-indigo-200/90 rounded-xl p-3">
          <div>
            <label className="block text-[10.5px] font-black text-slate-800 mb-1">
              عنوان وثيقة شبكة التقويم (قابل للتعديل المباشر):
            </label>
            <input
              type="text"
              value={config.customTitleAr}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  customTitleAr: e.target.value,
                })
              }
              placeholder="مثال: شبكة التقويم التحليلية الرسمية للفرض المحروس رقم 1 (المذكرة 142-08)"
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50/70 focus:bg-white font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-black text-slate-800 mb-1">
              المرجع البيداغوجي والتوجيه الديداكتيكي أعلى الشبكة:
            </label>
            <input
              type="text"
              value={config.pedagogicalDirectiveAr}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  pedagogicalDirectiveAr: e.target.value,
                })
              }
              placeholder="توجيهات استثمار الشبكة وتوزيع النقط..."
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px] bg-slate-50/70 focus:bg-white font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                بنية تفصيل الشبكة:
              </label>
              <select
                value={evalGridGranularity}
                onChange={(e) => {
                  const nextG = e.target.value as GridGranularity;
                  onChangeGranularity(nextG);
                  onChangeConfig({ ...config, granularity: nextG });
                }}
                className="w-full border border-indigo-200 rounded-lg px-2 py-1.5 text-[11px] bg-slate-50 font-bold text-slate-900"
              >
                <option value="BY_QUESTION">تفصيلي حسب كل سؤال وقدرة</option>
                <option value="BY_EXERCISE">إجمالي حسب التمارين والمجالات</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                سلم مؤشرات التمكن (142-08):
              </label>
              <select
                value={config.masteryScaleType}
                onChange={(e) =>
                  handleMasteryScaleChange(
                    e.target.value as EvalGridMasteryScaleType
                  )
                }
                className="w-full border border-indigo-200 rounded-lg px-2 py-1.5 text-[11px] bg-slate-50 font-bold text-slate-900"
              >
                <option value="A_EC_NA">درجة التحكم الرسمية (A / EC / NA)</option>
                <option value="NUMERIC_THRESHOLDS">عتبات النسب المئوية (≥75% / 50%)</option>
                <option value="ERROR_TYPE_CODES">تصنيف الأخطاء (مفاهيمي C / حسابي A / استدلالي R)</option>
                <option value="FOUR_LEVELS_ABCD">سلم الكفايات الرباعي (A / B / C / D)</option>
              </select>
            </div>
          </div>

          {/* تعديل تسميات مؤشرات التمكن الثلاثة مباشرة */}
          <div className="space-y-1">
            <label className="block text-[10.5px] font-bold text-indigo-950">
              تعديل تسميات مؤشرات التمكن الظاهرة في خلايا الشبكة:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  value={config.masteryLabelsAr[idx]}
                  onChange={(e) => {
                    const nextLabels: [string, string, string] = [
                      ...config.masteryLabelsAr,
                    ] as [string, string, string];
                    nextLabels[idx] = e.target.value;
                    onChangeConfig({
                      ...config,
                      masteryLabelsAr: nextLabels,
                    });
                  }}
                  className="border border-slate-300 rounded-lg px-2 py-1 text-[10.5px] bg-slate-50 font-bold text-center text-indigo-950"
                />
              ))}
            </div>
          </div>

          {/* التحكم في إظهار وإخفاء أعمدة وأقسام وثيقة شبكة التقويم */}
          <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
            <div className="text-[10.5px] font-black text-indigo-950">
              الأعمدة والأقسام المضمنة في وثيقة شبكة التقويم المطبوعة:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10.5px] font-bold text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showCapacityColumn}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      showCapacityColumn: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-700 w-3.5 h-3.5"
                />
                <span>عمود القدرة المنتظرة ومعيار التقويم</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showSkillLevelColumn}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      showSkillLevelColumn: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-700 w-3.5 h-3.5"
                />
                <span>عمود المستوى المهاري (N1 / N2 / N3)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showMasteryColumn}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      showMasteryColumn: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-700 w-3.5 h-3.5"
                />
                <span>عمود مؤشرات التحكم / تشخيص الأخطاء</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showRemediationColumn}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      showRemediationColumn: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-700 w-3.5 h-3.5"
                />
                <span>عمود ملاحظات التشخيص والدعم الفوري</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showTaxonomicSummaryBanner}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      showTaxonomicSummaryBanner: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-700 w-3.5 h-3.5"
                />
                <span>حصيلة التوازن المهاري (N1/N2/N3) أعلى الشبكة</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showInspectorVisaFooter}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      showInspectorVisaFooter: e.target.checked,
                    })
                  }
                  className="rounded text-indigo-700 w-3.5 h-3.5"
                />
                <span>إطار توقيع الأستاذ وتأشيرة المفتش التربوي</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
            <span className="text-[10.5px] font-bold text-slate-700">
              عدد أسطر استمارة التفريغ الورقية المرفقة:
            </span>
            <select
              value={evalGridStudentCount}
              onChange={(e) => {
                const count = Number(e.target.value);
                onChangeStudentCount(count);
                onChangeConfig({ ...config, printableMatrixRowsCount: count });
              }}
              className="border border-indigo-200 rounded-lg px-2 py-1 text-[11px] bg-slate-50 font-bold text-slate-900 tabular-nums"
            >
              <option value={10}>10 أسطر (مدمج)</option>
              <option value={15}>15 سطراً</option>
              <option value={20}>20 سطراً (قياسي)</option>
              <option value={25}>25 سطراً</option>
              <option value={30}>30 سطراً</option>
              <option value={35}>35 سطراً</option>
            </select>
          </div>

          {/* حفظ التعديلات كقالب مخصص في المكتبة */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/80">
            <input
              type="text"
              value={customPresetName}
              onChange={(e) => setCustomPresetName(e.target.value)}
              placeholder="اسم القالب لحفظه في المكتبة (مثال: شبكة 2 باك علوم فيزيائية)..."
              className="flex-1 border border-slate-300 rounded-lg px-2 py-1 text-[10.5px] bg-slate-50"
            />
            <button
              type="button"
              onClick={handleSaveCustomPreset}
              className="px-2.5 py-1 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white font-black text-[10.5px] flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Save className="w-3 h-3" />
              <span>حفظ القالب</span>
            </button>
            <button
              type="button"
              onClick={handleResetToTemplateDefaults}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              title="استعادة الإعدادات الافتراضية للقالب"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* القسم الثالث: المحرر المباشر لبنود وقدرات وسلّم تنقيط الشبكة سؤالاً بسؤال */}
      {activeEditorSection === "EDIT_CRITERIA_ROWS" && (
        <div className="space-y-2 bg-white border border-indigo-200/90 rounded-xl p-2.5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
            <div className="text-[10.5px] font-black text-indigo-950">
              تعديل القدرات المنتظرة والمستوى المهاري والنقطة لكل سؤال:
            </div>
            {overrideCount > 0 && (
              <button
                type="button"
                onClick={() =>
                  onChangeConfig({
                    ...config,
                    questionOverrides: {},
                  })
                }
                className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
              >
                إلغاء التعديلات اليدوية ({overrideCount})
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto studio-scroll pr-0.5">
            {questionsToDisplay.map((q) => {
              const ov = config.questionOverrides[q.questionCode] || {};
              return (
                <div
                  key={q.questionCode}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200/90 space-y-1.5 text-[10.5px]"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-mono font-black text-indigo-950 bg-indigo-100/80 px-1.5 py-0.5 rounded">
                      {q.questionLabelAr} · {q.exerciseTitleAr}
                    </span>
                    <div className="flex items-center gap-1">
                      <select
                        value={ov.levelCode || q.levelCode}
                        onChange={(e) =>
                          handleUpdateQuestionOverride(q.questionCode, {
                            levelCode: e.target.value as "N1" | "N2" | "N3",
                          })
                        }
                        className="border border-slate-300 rounded px-1.5 py-0.5 font-mono font-bold text-[10px] bg-white text-indigo-950"
                      >
                        <option value="N1">N1 (تطبيق مباشر)</option>
                        <option value="N2">N2 (استدلال وتوليف)</option>
                        <option value="N3">N3 (مبادرة وتعمق)</option>
                      </select>

                      <div className="flex items-center gap-0.5 bg-white border border-emerald-300 rounded px-1.5 py-0.5">
                        <input
                          type="number"
                          step="0.25"
                          min="0.25"
                          max="10"
                          value={
                            typeof ov.points === "number" ? ov.points : q.points
                          }
                          onChange={(e) =>
                            handleUpdateQuestionOverride(q.questionCode, {
                              points: Math.max(
                                0.25,
                                parseFloat(e.target.value) || 0.5
                              ),
                            })
                          }
                          className="w-12 font-mono font-black text-emerald-900 text-center text-[10.5px] focus:outline-none tabular-nums"
                        />
                        <span className="text-[9.5px] font-bold text-emerald-800">
                          ن
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={
                        ov.capacityAr !== undefined ? ov.capacityAr : q.capacityAr
                      }
                      onChange={(e) =>
                        handleUpdateQuestionOverride(q.questionCode, {
                          capacityAr: e.target.value,
                        })
                      }
                      placeholder="القدرة المنتظرة ومعيار التقويم..."
                      className="w-full border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-900 text-[10.5px]"
                    />
                    <input
                      type="text"
                      value={ov.remediationCriterionAr || ""}
                      onChange={(e) =>
                        handleUpdateQuestionOverride(q.questionCode, {
                          remediationCriterionAr: e.target.value,
                        })
                      }
                      placeholder="معيار التصحيح / إرشاد الدعم المرفق بالسؤال..."
                      className="w-full border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 text-[10.5px]"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {gridData.allQuestions.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllCriteriaRows((prev) => !prev)}
              className="w-full py-1 text-center text-[10.5px] font-black text-indigo-800 hover:text-indigo-950 bg-indigo-50/70 rounded-lg border border-indigo-200/80 flex items-center justify-center gap-1 cursor-pointer"
            >
              {showAllCriteriaRows ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>عرض عدد أقل من الأسئلة</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>
                    عرض وتعديل جميع أسئلة الشبكة ({gridData.allQuestions.length}{" "}
                    سؤالاً)
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* أزرار إنتاج وتصدير وثيقة شبكة التقويم الرسمية (PDF A4 & Excel) */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onExportPDF}
          disabled={isExportingPDF}
          className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-black py-2 px-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5 shrink-0" />
          <span>
            {isExportingPDF
              ? "جاري إنتاج PDF..."
              : "تصدير وثيقة الشبكة PDF"}
          </span>
        </button>

        <button
          type="button"
          onClick={onExportExcel}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2 px-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
          <span>تصدير الشبكة Excel (.xls)</span>
        </button>
      </div>
    </div>
  );
};
