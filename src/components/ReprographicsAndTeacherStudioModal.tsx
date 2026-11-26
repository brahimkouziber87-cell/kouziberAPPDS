import React, { useState, useMemo } from "react";
import {
  X,
  Printer,
  Layers,
  Calculator,
  Compass,
  FileText,
  AlertTriangle,
  PlusCircle,
  Copy,
  Check,
  Clock,
  Scissors,
  Users,
  QrCode,
  LayoutGrid,
  Bookmark,
  GraduationCap,
  BookMarked,
  ShieldAlert,
  Search,
} from "lucide-react";
import { InsertedFigure, LessonItem, SemesterType, TrackData } from "../data/curriculum";
import {
  BindingAndCropConfig,
  buildQuarterPointMicroRubric,
  calculateReprographicsProductionEstimate,
  ForbiddenValuePresetId,
  generateForbiddenValueVariationBundle,
  getAlgebraicCounterExamplesForLessons,
  computeExamChronoPacing,
  generateCorrectionMiniBandeau,
  generateParametricAntiCopyDM,
  generateProgressiveHintsForDM,
  SERIE_DIFFERENTIATED_PATHS,
  buildMicroMemoCapsule,
  generateTriptychBlackboardPlan,
  generateCahierDeTextesSummary,
  verifyFormulaWithCAS,
  diagnoseSampleStudentAttempt,
  buildBiofGlossaryForTrack,
} from "../utils/reprographicsAndDidacticsEngine";
import { MathText } from "./MathRenderer";

export type ReprographicsStudioTabId =
  | "ECO_TONER_SIMULATOR"
  | "BINDING_CROP_MARKS"
  | "QUARTER_POINT_RUBRIC"
  | "DOUBLE_BARRE_VARIATION"
  | "REPROGRAPHICS_JOB_TICKET"
  | "COUNTER_EXAMPLES_LAB"
  | "CHRONO_PACING_METER"
  | "MINI_BANDEAU_CORRECTION"
  | "PARAMETRIC_DM_ANTI_COPY"
  | "PROGRESSIVE_QR_HINTS"
  | "DIFFERENTIATED_PATHS_TD"
  | "BLACKBOARD_TRIPTYCH_PLAN"
  | "CAHIER_DE_TEXTES_SYNC"
  | "AUTO_CAS_VERIFIER"
  | "HANDWRITING_DIAGNOSTICIAN"
  | "BIOF_GLOSSARY_ADAPTER";

import {
  PrintableStapleAndCropMarksOverlay,
  PrintableReprographicsJobTicketBanner,
  PrintableQuarterPointMicroRubricCard,
  PrintableAlgebraicCounterExamplesCard,
} from "./PrintableReprographicsOverlays";

export {
  PrintableStapleAndCropMarksOverlay,
  PrintableReprographicsJobTicketBanner,
  PrintableQuarterPointMicroRubricCard,
  PrintableAlgebraicCounterExamplesCard,
};

// ============================================================================
// 2. MAIN INTERACTIVE MODAL FOR THE 6 REPROGRAPHICS & MATH TEACHER PROPOSALS
// ============================================================================

interface ReprographicsAndTeacherStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ReprographicsStudioTabId;
  track: TrackData;
  sem: SemesterType;
  dsKey: string;
  school: string;
  prof: string;
  year: string;
  lessons: LessonItem[];
  isFr: boolean;
  bindingAndCropConfig: BindingAndCropConfig;
  onChangeBindingAndCropConfig: React.Dispatch<
    React.SetStateAction<BindingAndCropConfig>
  >;
  groupsCount: number;
  onChangeGroupsCount: (n: number) => void;
  studentsPerGroup: number;
  onChangeStudentsPerGroup: (n: number) => void;
  duplexMode: "RECTO_ONLY" | "RECTO_VERSO" | "TWO_UP_A5";
  onChangeDuplexMode: (m: "RECTO_ONLY" | "RECTO_VERSO" | "TWO_UP_A5") => void;
  onInsertFigureToExam: (figure: InsertedFigure) => void;
  onNotify: (type: "success" | "info" | "error", text: string) => void;
}

export const ReprographicsAndTeacherStudioModal: React.FC<
  ReprographicsAndTeacherStudioModalProps
> = ({
  isOpen,
  onClose,
  initialTab = "ECO_TONER_SIMULATOR",
  track,
  sem,
  dsKey,
  school,
  prof,
  year,
  lessons,
  isFr,
  bindingAndCropConfig,
  onChangeBindingAndCropConfig,
  groupsCount,
  onChangeGroupsCount,
  studentsPerGroup,
  onChangeStudentsPerGroup,
  duplexMode,
  onChangeDuplexMode,
  onInsertFigureToExam,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<ReprographicsStudioTabId>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Proposal 4 State: Double-barre forbidden value preset
  const [forbiddenPreset, setForbiddenPreset] = useState<ForbiddenValuePresetId>(
    "RATIONAL_OBLIQUE_ASYMPTOTE"
  );
  const [forbiddenX, setForbiddenX] = useState<number>(1);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const productionEstimate = useMemo(
    () =>
      calculateReprographicsProductionEstimate({
        groupsCount,
        studentsPerGroup,
        pagesPerCopy: 2,
        duplexMode,
        ecoTonerActive: bindingAndCropConfig.enableEcoTonerBlackMode,
      }),
    [
      groupsCount,
      studentsPerGroup,
      duplexMode,
      bindingAndCropConfig.enableEcoTonerBlackMode,
    ]
  );

  const quarterRubric = useMemo(
    () => buildQuarterPointMicroRubric({ lessons, isFr }),
    [lessons, isFr]
  );

  const doubleBarreBundle = useMemo(
    () =>
      generateForbiddenValueVariationBundle({
        presetId: forbiddenPreset,
        forbiddenX,
      }),
    [forbiddenPreset, forbiddenX]
  );

  const counterExamples = useMemo(
    () => getAlgebraicCounterExamplesForLessons(lessons),
    [lessons]
  );

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleInsertDoubleBarreTableToExam = () => {
    const svgBase64 = `data:image/svg+xml;utf8,${encodeURIComponent(
      doubleBarreBundle.svgVariationTableMarkup
    )}`;
    onInsertFigureToExam({
      id: `double_barre_table_${Date.now()}`,
      titleAr: doubleBarreBundle.titleAr,
      titleFr: doubleBarreBundle.titleFr,
      caption: isFr
        ? `Domaine : ${doubleBarreBundle.domainLatex} — Asymptote verticale x = ${doubleBarreBundle.forbiddenX}`
        : `مجموعة التعريف: ${doubleBarreBundle.domainLatex} — مقارب عمودي x = ${doubleBarreBundle.forbiddenX}`,
      dataUrl: svgBase64,
      widthPercent: 80,
      alignment: "center",
      exerciseId: "ex_0",
      borderStyle: "academic",
    });
    onNotify(
      "success",
      `✓ تم إدراج جدول التغيرات بالقيمة الممنوعة (Double-Barre || عند x = ${forbiddenX}) في الورقة الحالية!`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print"
      dir="rtl"
    >
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[93vh] flex flex-col overflow-hidden">
        {/* ترويسة الاستوديو */}
        <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-indigo-950 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 font-mono text-[10px] font-black">
                  REPROGRAPHICS · RISO/RICOH · MATH DIDACTICS
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono text-[10px] font-bold">
                  16 أداة ومقترحاً تطبيقياً للمشرف على الطبع وأستاذ الرياضيات والذكاء الاصطناعي
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                استوديو هندسة النسخ والطباعة والديداكتيك الرياضي المتقدم (Chrono · DM Paramétrique · Triptyque · CAS · BIOF)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-200 border border-white/15 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* شريط التبويبات المتطورة للديداكتيك والمشرف */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {[
            {
              id: "ECO_TONER_SIMULATOR" as ReprographicsStudioTabId,
              label: "1. محاكي RISO والتوفير",
              icon: Printer,
            },
            {
              id: "BINDING_CROP_MARKS" as ReprographicsStudioTabId,
              label: "2. التدبيس والمقصلة",
              icon: Layers,
            },
            {
              id: "QUARTER_POINT_RUBRIC" as ReprographicsStudioTabId,
              label: "3. أرباع النقط (0.25 ن)",
              icon: Calculator,
            },
            {
              id: "DOUBLE_BARRE_VARIATION" as ReprographicsStudioTabId,
              label: "4. القيم الممنوعة (||)",
              icon: Compass,
            },
            {
              id: "REPROGRAPHICS_JOB_TICKET" as ReprographicsStudioTabId,
              label: "5. الأمر بالسحب",
              icon: FileText,
            },
            {
              id: "COUNTER_EXAMPLES_LAB" as ReprographicsStudioTabId,
              label: "6. الأمثلة المضادة",
              icon: AlertTriangle,
            },
            {
              id: "CHRONO_PACING_METER" as ReprographicsStudioTabId,
              label: "7. موازن الزمن الفعلي (Chrono)",
              icon: Clock,
            },
            {
              id: "MINI_BANDEAU_CORRECTION" as ReprographicsStudioTabId,
              label: "8. أشرطة التصحيح للقص",
              icon: Scissors,
            },
            {
              id: "PARAMETRIC_DM_ANTI_COPY" as ReprographicsStudioTabId,
              label: "9. تفريد الفرض المنزلي (k)",
              icon: Users,
            },
            {
              id: "PROGRESSIVE_QR_HINTS" as ReprographicsStudioTabId,
              label: "10. تلميحات متدرجة (QR)",
              icon: QrCode,
            },
            {
              id: "DIFFERENTIATED_PATHS_TD" as ReprographicsStudioTabId,
              label: "11. مسارات السلسلة A/B/C",
              icon: LayoutGrid,
            },
            {
              id: "BLACKBOARD_TRIPTYCH_PLAN" as ReprographicsStudioTabId,
              label: "12. مخطط السبورة الثلاثية",
              icon: Bookmark,
            },
            {
              id: "CAHIER_DE_TEXTES_SYNC" as ReprographicsStudioTabId,
              label: "13. دفتر النصوص الرسمي",
              icon: BookMarked,
            },
            {
              id: "AUTO_CAS_VERIFIER" as ReprographicsStudioTabId,
              label: "14. المدقق الجبري CAS",
              icon: Search,
            },
            {
              id: "HANDWRITING_DIAGNOSTICIAN" as ReprographicsStudioTabId,
              label: "15. مصحح أوراق التلاميذ",
              icon: GraduationCap,
            },
            {
              id: "BIOF_GLOSSARY_ADAPTER" as ReprographicsStudioTabId,
              label: "16. معجم خيار فرنسية BIOF",
              icon: ShieldAlert,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  active
                    ? "bg-gradient-to-l from-emerald-400 to-amber-300 text-slate-950 shadow-sm"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* محتوى التبويب */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
          {/* =================================================================
              1. محاكي آلة الاستنساخ RISO/Ricoh وتوفير الحبر والورق
          ================================================================= */}
          {activeTab === "ECO_TONER_SIMULATOR" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-emerald-700" />
                    <span>
                      وضع آلة النسخ والاستنساخ الصناعي عالي التباين (100% Pure K-Black Photocopier & RISO Mode)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    يزيل التظليلات الملونة التي تتحول إلى بقع رمادية داكنة في آلات التصوير، ويرفع تباين خطوط الشبكة المليمترية وتسطير الإجابة لضمان عدم اختفائها أثناء السحب السريع.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onChangeBindingAndCropConfig((prev) => ({
                      ...prev,
                      enableEcoTonerBlackMode: !prev.enableEcoTonerBlackMode,
                    }));
                    onNotify(
                      "success",
                      !bindingAndCropConfig.enableEcoTonerBlackMode
                        ? "✓ تم تفعيل وضع آلة الاستنساخ والحبر الاقتصادي (Pure K-Black RISO/Photocopier) على ورقة A4!"
                        : "تمت استعادة الألوان الأكاديمية القياسية على الورقة."
                    );
                  }}
                  className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition ${
                    bindingAndCropConfig.enableEcoTonerBlackMode
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-950 text-amber-300 hover:bg-slate-900"
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>
                    {bindingAndCropConfig.enableEcoTonerBlackMode
                      ? "✓ وضع الاستنساخ الأسود الصافي مفعّل (اضغط للإلغاء)"
                      : "تفعيل وضع الاستنساخ الأسود الصافي وتوفير التونر"}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-500 font-bold">مجموع النسخ المطلوبة:</span>
                  <div className="text-xl font-black font-mono text-indigo-950">
                    {productionEstimate.totalStudentCopies} نسخة
                  </div>
                  <span className="text-[11px] text-slate-600">
                    ({productionEstimate.groupsCount} أفواج × {productionEstimate.studentsPerGroup} تلميذاً + {productionEstimate.extraArchiveCopies} حراسة)
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-500 font-bold">استهلاك الورق الصافي (A4):</span>
                  <div className="text-xl font-black font-mono text-emerald-800">
                    {productionEstimate.totalA4SheetsRequired} ورقة A4
                  </div>
                  <span className="text-[11px] text-slate-600">
                    يعادل {productionEstimate.paperReams500Required} رزمة ورق (500 ورقة)
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-500 font-bold">تغطية مسحوق الحبر (Toner):</span>
                  <div className="text-xl font-black font-mono text-amber-800">
                    {bindingAndCropConfig.enableEcoTonerBlackMode
                      ? `${productionEstimate.ecoRisoTonerCoveragePct}% (اقتصادي)`
                      : `${productionEstimate.standardTonerCoveragePct}% (قياسي)`}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    وفر التونر عند التفعيل: 58%
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
                  <span className="text-slate-500 font-bold">زمن السحب في المطبعة:</span>
                  <div className="text-xl font-black font-mono text-slate-900">
                    ~{productionEstimate.estimatedPrintTimeMinutes} دقائق
                  </div>
                  <span className="text-[11px] text-slate-600">
                    على آلة سحب متوسطة (75 ص/دقيقة)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              2. هامش التدبيس والتثقيب وعلامات القص بالمقصلة
          ================================================================= */}
          {activeTab === "BINDING_CROP_MARKS" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-slate-950">
                      أولاً: هامش التدبيس والتثقيب الرسمي (+8mm Binding Gutter)
                    </h4>
                    <input
                      type="checkbox"
                      checked={bindingAndCropConfig.enableStapleBindingGutter}
                      onChange={(e) =>
                        onChangeBindingAndCropConfig((prev) => ({
                          ...prev,
                          enableStapleBindingGutter: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-indigo-700 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-600">
                    يضيف منطقة أمان للتدبيس (`Agrafage`) أو التثقيب (`Perforation`) لمنع ضياع بداية السطور أو أرقام التمارين عند تدبيس الفرض المكون من عدة صفحات.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(
                      [
                        {
                          id: "TOP_RIGHT_RTL",
                          label: "تدبيس زاوية يمنى (عربي RTL)",
                        },
                        {
                          id: "TOP_LEFT_LTR",
                          label: "تدبيس زاوية يسرى (فرنسي BIOF/AEFE)",
                        },
                        {
                          id: "LEFT_TWO_HOLES",
                          label: "تثقيب ثنائي للملف الإشهادي (Classeur)",
                        },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          onChangeBindingAndCropConfig((prev) => ({
                            ...prev,
                            enableStapleBindingGutter: true,
                            stapleCorner: opt.id,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          bindingAndCropConfig.stapleCorner === opt.id
                            ? "bg-indigo-950 text-amber-300 border-indigo-900"
                            : "bg-slate-50 text-slate-700 border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-300 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-slate-950">
                      ثانياً: علامات القص بالمقصلة (Guillotine Crop Marks 148.5mm)
                    </h4>
                    <input
                      type="checkbox"
                      checked={bindingAndCropConfig.showGuillotineCropMarks}
                      onChange={(e) =>
                        onChangeBindingAndCropConfig((prev) => ({
                          ...prev,
                          showGuillotineCropMarks: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-emerald-700 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-slate-600">
                    يدرج خط القص الشعري المتقطع وعلامات الضبط الجانبية (`Crop Marks`) لمساعدة المشرف على الطبع عند قص أوراق `A4` المزدوجة إلى نسختين `A5` بالمقصلة اليدوية أو الآلية.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="text-xs font-black text-slate-700 mb-2">
                  معاينة حية لدليل التدبيس وعلامات القص على الورقة:
                </div>
                <PrintableStapleAndCropMarksOverlay
                  config={{
                    ...bindingAndCropConfig,
                    enableStapleBindingGutter: true,
                    showGuillotineCropMarks: true,
                  }}
                  isFr={isFr}
                />
              </div>
            </div>
          )}

          {/* =================================================================
              3. تفكيك سلم التنقيط إلى أرباع النقط (0.25 ن) وجسور الإنقاذ
          ================================================================= */}
          {activeTab === "QUARTER_POINT_RUBRIC" && (
            <div className="space-y-4">
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-950">
                    تفكيك سلم التنقيط إلى أرباع النقط (0.25 pt) وجسور الإنقاذ التلقائية بين الأسئلة
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    يضمن توحيد معايير التصحيح وتفادي «العقوبة المزدوجة» للتلميذ عبر قبول نتائج الأسئلة المرحلية.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onChangeBindingAndCropConfig((prev) => ({
                      ...prev,
                      includeQuarterPointRubric: !prev.includeQuarterPointRubric,
                    }));
                    onNotify(
                      "success",
                      !bindingAndCropConfig.includeQuarterPointRubric
                        ? "✓ تم إرفاق جدول تفكيك التنقيط بأرباع النقط (0.25 ن) وجسور الإنقاذ في ورقة المعاينة!"
                        : "تم إخفاء جدول تفكيك أرباع النقط من المعاينة."
                    );
                  }}
                  className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer transition ${
                    bindingAndCropConfig.includeQuarterPointRubric
                      ? "bg-emerald-700 text-white"
                      : "bg-indigo-950 text-amber-300"
                  }`}
                >
                  {bindingAndCropConfig.includeQuarterPointRubric
                    ? "✓ مدمج في ورقة المعاينة (اضغط للإخفاء)"
                    : "+ إرفاق شبكة أرباع النقط (0.25 ن) في ورقة الفرض"}
                </button>
              </div>

              <PrintableQuarterPointMicroRubricCard lessons={lessons} isFr={isFr} />
            </div>
          )}

          {/* =================================================================
              4. جداول التغيرات بالقيم الممنوعة (Double-Barre ||) والتأويل الهندسي
          ================================================================= */}
          {activeTab === "DOUBLE_BARRE_VARIATION" && (
            <div className="space-y-4">
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={forbiddenPreset}
                    onChange={(e) =>
                      setForbiddenPreset(e.target.value as ForbiddenValuePresetId)
                    }
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="RATIONAL_OBLIQUE_ASYMPTOTE">
                      دالة جذرية بمقارب عمودي ومقارب مائل: f(x) = x + 1 + 1/(x - x0)
                    </option>
                    <option value="HOMOGRAPHIC_POLE">
                      دالة متخاطة (Homographique): f(x) = (2x + 1)/(x - x0)
                    </option>
                    <option value="LN_DOMAIN_WALL">
                      دالة لوغاريتمية بقيمة ممنوعة: f(x) = ln(x - x0)/(x - x0)
                    </option>
                  </select>

                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span>القيمة الممنوعة x_0:</span>
                    <input
                      type="number"
                      min={-5}
                      max={5}
                      value={forbiddenX}
                      onChange={(e) => setForbiddenX(Number(e.target.value) || 1)}
                      className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 font-mono text-center"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleInsertDoubleBarreTableToExam}
                  className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-amber-300 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ إدراج جدول القيمة الممنوعة (||) في الفرض</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 bg-white border border-slate-300 rounded-2xl p-4 space-y-3">
                  <div className="font-black text-xs text-slate-900 flex justify-between">
                    <span>معاينة جدول التغيرات بالخط المضاعف للقيمة الممنوعة (Double-Barre ||):</span>
                    <span className="font-mono text-rose-700" dir="ltr">
                      x ≠ {forbiddenX}
                    </span>
                  </div>
                  <div
                    className="w-full overflow-x-auto"
                    dangerouslySetInnerHTML={{
                      __html: doubleBarreBundle.svgVariationTableMarkup,
                    }}
                  />

                  <div className="space-y-1.5 pt-2">
                    <div className="font-black text-xs text-slate-900">
                      جدول التأويلات الهندسية للنهايات والاشتقاق:
                    </div>
                    <table className="w-full border-collapse border border-slate-300 text-xs">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 p-2 text-center">
                            النهاية / الاشتقاق التحليلي
                          </th>
                          <th className="border border-slate-300 p-2 text-start">
                            التأويل الهندسي للمنحنى (C_f)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {doubleBarreBundle.geometricInterpretations.map((row, idx) => (
                          <tr key={idx}>
                            <td
                              className="border border-slate-300 p-2 font-mono text-center"
                              dir="ltr"
                            >
                              <MathText text={`$${row.analyticLimitOrDerivative}$`} inline />
                            </td>
                            <td className="border border-slate-300 p-2">
                              <MathText
                                text={
                                  isFr
                                    ? row.geometricInterpretationFr
                                    : row.geometricInterpretationAr
                                }
                                inline
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white border border-slate-300 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-900">
                      كود LaTeX (tkz-tab مع رمز d للخط المضاعف ||):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          "double_barre_tkz",
                          doubleBarreBundle.tkzTabDoubleBarreCode
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === "double_barre_tkz" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>نسخ الكود</span>
                    </button>
                  </div>
                  <pre
                    dir="ltr"
                    className="bg-slate-950 text-cyan-300 rounded-xl p-3 font-mono text-[11px] overflow-x-auto"
                  >
                    {doubleBarreBundle.tkzTabDoubleBarreCode}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              5. بطاقة الأمر بالسحب لمصلحة الطبع والاستنساخ (Bon de Tirage)
          ================================================================= */}
          {activeTab === "REPROGRAPHICS_JOB_TICKET" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                  <label className="flex items-center gap-1.5">
                    <span>عدد الأفواج المسندة:</span>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={groupsCount}
                      onChange={(e) =>
                        onChangeGroupsCount(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-mono text-center"
                    />
                  </label>
                  <label className="flex items-center gap-1.5">
                    <span>عدد التلاميذ في الفوج:</span>
                    <input
                      type="number"
                      min={5}
                      max={55}
                      value={studentsPerGroup}
                      onChange={(e) =>
                        onChangeStudentsPerGroup(
                          Math.max(5, Number(e.target.value) || 36)
                        )
                      }
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-mono text-center"
                    />
                  </label>
                  <select
                    value={duplexMode}
                    onChange={(e) =>
                      onChangeDuplexMode(
                        e.target.value as "RECTO_ONLY" | "RECTO_VERSO" | "TWO_UP_A5"
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="RECTO_VERSO">سحب وجهين (Recto-Verso)</option>
                    <option value="TWO_UP_A5">سحب اقتصادي مزدوج (2-Up A5)</option>
                    <option value="RECTO_ONLY">سحب وجه واحد (Recto)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onChangeBindingAndCropConfig((prev) => ({
                      ...prev,
                      includeReprographicsJobTicket:
                        !prev.includeReprographicsJobTicket,
                    }));
                    onNotify(
                      "success",
                      !bindingAndCropConfig.includeReprographicsJobTicket
                        ? "✓ تم إرفاق بطاقة الأمر بالسحب (Bon de Tirage) في أعلى ورقة المعاينة!"
                        : "تم إخفاء بطاقة الأمر بالسحب من المعاينة."
                    );
                  }}
                  className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer transition ${
                    bindingAndCropConfig.includeReprographicsJobTicket
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-950 text-amber-300"
                  }`}
                >
                  {bindingAndCropConfig.includeReprographicsJobTicket
                    ? "✓ بطاقة الأمر بالسحب مرفقة بالورقة (اضغط للإخفاء)"
                    : "+ إرفاق بطاقة الأمر بالسحب لمصلحة الطبع أعلى الورقة"}
                </button>
              </div>

              <PrintableReprographicsJobTicketBanner
                school={school}
                prof={prof}
                year={year}
                trackLabelAr={track.labelAr}
                trackLabelFr={track.labelFr}
                dsKey={dsKey}
                semester={sem}
                groupsCount={groupsCount}
                studentsPerGroup={studentsPerGroup}
                pagesPerCopy={2}
                duplexMode={duplexMode}
                ecoTonerActive={bindingAndCropConfig.enableEcoTonerBlackMode}
                isFr={isFr}
              />
            </div>
          )}

          {/* =================================================================
              6. مختبر الأمثلة المضادة والأخطاء الجبرية الشائعة
          ================================================================= */}
          {activeTab === "COUNTER_EXAMPLES_LAB" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-950">
                    بطاقة اليقظة الجبرية والأمثلة المضادة الحاسمة (Contre-Exemples Numériques)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    تعرض للتلميذ الأخطاء الجبرية الأكثر شيوعاً في الفرض مع مثال مضاد عددي بسيط يرسخ القاعدة الصحيحة.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onChangeBindingAndCropConfig((prev) => ({
                      ...prev,
                      includeCounterExamplesCard: !prev.includeCounterExamplesCard,
                    }));
                    onNotify(
                      "success",
                      !bindingAndCropConfig.includeCounterExamplesCard
                        ? "✓ تم إرفاق بطاقة الأمثلة المضادة واليقظة الجبرية في ورقة الفرض!"
                        : "تم إخفاء بطاقة الأمثلة المضادة من الورقة."
                    );
                  }}
                  className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer transition ${
                    bindingAndCropConfig.includeCounterExamplesCard
                      ? "bg-emerald-700 text-white"
                      : "bg-rose-900 text-amber-200"
                  }`}
                >
                  {bindingAndCropConfig.includeCounterExamplesCard
                    ? "✓ مدمجة في ورقة الفرض (اضغط للإخفاء)"
                    : "+ إرفاق بطاقة الأمثلة المضادة في ورقة الفرض"}
                </button>
              </div>

              <PrintableAlgebraicCounterExamplesCard lessons={lessons} isFr={isFr} />
            </div>
          )}

          {/* =================================================================
              7. موازن الزمن الفعلي للإنجاز (Chrono-Solver Pacing Meter)
          ================================================================= */}
          {activeTab === "CHRONO_PACING_METER" && (() => {
            const chronoReport = computeExamChronoPacing({ lessons, examDurationMinutes: 120 });
            return (
              <div className="space-y-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-600" />
                      <span>موازن الزمن الفعلي وحساب زمن الحل التقديري (Chrono-Solver)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {chronoReport.summaryAr}
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs ${
                    chronoReport.pacingStatus === "OPTIMAL"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : chronoReport.pacingStatus === "DANGEROUSLY_LONG"
                      ? "bg-rose-100 text-rose-900 border border-rose-300"
                      : "bg-sky-100 text-sky-900 border border-sky-300"
                  }`}>
                    {chronoReport.totalEstimatedMinutes} دقيقة / {chronoReport.targetExamDurationMinutes} د ({chronoReport.fillPercentage}%)
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {chronoReport.questions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-1">
                        <span>التمرين {q.exerciseIndex} — السؤال {q.questionIndex}</span>
                        <span className="font-mono bg-sky-50 text-sky-800 px-2 py-0.5 rounded text-[11px]">
                          ⏱ {q.estimatedMinutes} دقيقة
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px] line-clamp-2">
                        {q.questionTextAr}
                      </p>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {q.pacingAdviceAr}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* =================================================================
              8. أشرطة التصحيح الفردية للقص واللصق (Mini-Bandeaux)
          ================================================================= */}
          {activeTab === "MINI_BANDEAU_CORRECTION" && (() => {
            const bandeau = generateCorrectionMiniBandeau({ lessons, isFr });
            return (
              <div className="space-y-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-amber-600" />
                      <span>قسائم وأشرطة التصحيح الفردية القابلة للقص واللصق على أوراق التلاميذ</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      شريط تنقيط طولي مضغوط يُطبع في 3 أعمدة ويُقص بالمقصلة ليلصق في حاشية ورقة التحرير (ربح الوقت).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("bandeau", JSON.stringify(bandeau, null, 2))}
                    className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-900 text-white cursor-pointer hover:bg-slate-800"
                  >
                    {copiedKey === "bandeau" ? "✓ تم النسخ" : "نسخ بيانات القسيمة"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map((col) => (
                    <div key={col} className="bg-white border-2 border-dashed border-slate-400 rounded-xl p-3 space-y-2 text-xs">
                      <div className="text-[10px] font-mono text-slate-500 border-b border-slate-200 pb-1">
                        ✂ خط القص بالمقصلة · شريط رقم {col}
                      </div>
                      <div className="font-bold text-slate-900 text-[11px]">
                        {bandeau.examTitle}
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono">
                        {bandeau.studentNamePlaceholder}
                      </div>
                      <div className="space-y-1 pt-1">
                        {bandeau.questions.map((q, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10.5px] border-b border-dotted border-slate-200 py-0.5">
                            <span className="font-medium text-slate-800">{q.code}</span>
                            <span className="font-mono text-slate-400">... / {q.ptsMax} ن</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center font-bold text-slate-950 pt-1 text-xs border-t border-slate-300">
                        <span>المجموع النهائي:</span>
                        <span className="font-mono">..... / {bandeau.totalPoints} ن</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* =================================================================
              9. تفريد الفرض المنزلي بالرقم الترتيبي لمنع النقل (k)
          ================================================================= */}
          {activeTab === "PARAMETRIC_DM_ANTI_COPY" && (() => {
            const parametricDM = generateParametricAntiCopyDM(40);
            return (
              <div className="space-y-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>نظام تفريد الفرض المنزلي بالوسيط k المرتبط برقم التلميذ (Anti-Copy)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      كل تلميذ يحل المسألة بدالته الخاصة $f_k(x)$ حيث $k$ هو رقمه الترتيبي مع جدول تصحيح فوري للأستاذ لـ 40 تلميذاً.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-mono font-bold">
                    40 تلميذاً مغطى بـ 40 صيغة
                  </span>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-xs space-y-2">
                  <div className="font-black text-indigo-950 text-sm">
                    نص المسألة الموزعة على القسم:
                  </div>
                  <div className="text-indigo-900 font-medium leading-relaxed">
                    <MathText text={isFr ? parametricDM.baseProblemStatementFr : parametricDM.baseProblemStatementAr} />
                  </div>
                </div>

                <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-900 text-white px-4 py-2 text-xs font-bold flex justify-between">
                    <span>جدول الحلول المضبوطة للأستاذ (من التلميذ 1 إلى 40):</span>
                    <span className="font-mono text-[11px] text-teal-300">f_k(x) Solutions Matrix</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs font-mono">
                    {parametricDM.studentRows.slice(0, 15).map((row) => (
                      <div key={row.studentNumber} className="px-4 py-2 flex items-center justify-between hover:bg-slate-50">
                        <span className="font-bold text-slate-900 w-24">التلميذ #{row.studentNumber}:</span>
                        <span className="text-indigo-900 font-bold"><MathText text={`$${row.formulaLatex}$`} inline /></span>
                        <span className="text-emerald-800 text-[11px]"><MathText text={`$${row.derivativeZero}$`} inline /></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =================================================================
              10. بطاقات التلميح المتدرج عبر رمز QR (Progressive Hints)
          ================================================================= */}
          {activeTab === "PROGRESSIVE_QR_HINTS" && (() => {
            const hints = generateProgressiveHintsForDM(lessons);
            return (
              <div className="space-y-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>بطاقات التلميح التدريجي عبر رمز QR للفرض المنزلي (3 مستويات)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      يمسح التلميذ الرمز للحصول على (تلميح 1: الفكرة، تلميح 2: المبرهنة، تلميح 3: النتيجة الوسطية) دون إفساد متعة البحث الذاتي.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hints.map((h) => (
                    <div key={h.exerciseNumber} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-black text-slate-950 text-sm">
                          التمرين {h.exerciseNumber}: {h.titleAr}
                        </span>
                        <span className="font-mono text-[10.5px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          {h.qrHashTarget}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {h.levels.map((lvl) => (
                          <div key={lvl.level} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                            <span className="font-bold text-slate-900 text-[11px] block">
                              {lvl.titleAr}
                            </span>
                            <p className="text-slate-600 text-[10.5px] leading-relaxed">
                              {lvl.hintAr}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* =================================================================
              11. المسارات الفارقية الثلاثة لسلاسل التمارين (Parcours TD A/B/C)
          ================================================================= */}
          {activeTab === "DIFFERENTIATED_PATHS_TD" && (() => {
            const microMemo = buildMicroMemoCapsule(lessons);
            return (
              <div className="space-y-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-cyan-600" />
                      <span>المسارات الفارقية الثلاثة لسلسلة التمارين (Parcours A / B / C)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      توجيه التلاميذ في نفس السلسلة المطبوعة إلى 3 مسارات تناسب مستوى تحكمهم ومكتسباتهم السابقة.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SERIE_DIFFERENTIATED_PATHS.map((path) => (
                    <div key={path.id} className="bg-white border-2 rounded-2xl p-4 space-y-2 text-xs shadow-2xs" style={{ borderColor: path.colorHex }}>
                      <div className="font-black text-sm" style={{ color: path.colorHex }}>
                        {path.labelAr}
                      </div>
                      <div className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
                        التمارين المستهدفة: {path.exercisesRange}
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {path.didacticGoalAr}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    <span>كبسولة تذكير القواعد الأساسية المدمجة في ترويسة السلسلة (Micro-Mémo):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {microMemo.map((m, mIdx) => (
                      <div key={mIdx} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-1">
                        <div className="text-[10px] text-cyan-300 font-bold">{m.ruleNameAr}</div>
                        <div className="font-mono text-center text-white font-bold text-[11px]">
                          <MathText text={`$${m.latexMath}$`} inline />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =================================================================
              12. مخطط السبورة الثلاثية للجذاذة OP 2007 (Tableau Noir Triptyque)
          ================================================================= */}
          {activeTab === "BLACKBOARD_TRIPTYCH_PLAN" && (() => {
            const blackboard = generateTriptychBlackboardPlan(lessons[0] || { lessonAr: "الرياضيات", lessonFr: "Maths", capacitiesAr: [], capacitiesFr: [] });
            return (
              <div className="space-y-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-emerald-700" />
                      <span>مخطط تدبير السبورة الثلاثية لحصة الرياضيات (Plan du Tableau Noir)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      هندسة بصرية للسبورة في الجذاذة: (اليمين: التذكير والمعجم، الوسط: الاستدلال والبرهان، اليسار: الملخص المؤطر).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-4 border border-emerald-800 space-y-2 text-xs">
                    <div className="font-black text-amber-300 border-b border-emerald-800 pb-1.5 text-xs">
                      1. {blackboard.leftPanelAr}
                    </div>
                    <ul className="space-y-1 text-[11px] text-emerald-200">
                      {blackboard.leftPanelItemsAr.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-700 space-y-2 text-xs">
                    <div className="font-black text-cyan-300 border-b border-slate-700 pb-1.5 text-xs">
                      2. {blackboard.centerPanelAr}
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-200">
                      {blackboard.centerPanelItemsAr.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-indigo-950 text-indigo-100 rounded-2xl p-4 border border-indigo-800 space-y-2 text-xs">
                    <div className="font-black text-teal-300 border-b border-indigo-800 pb-1.5 text-xs">
                      3. {blackboard.rightPanelAr}
                    </div>
                    <ul className="space-y-1 text-[11px] text-indigo-200">
                      {blackboard.rightPanelItemsAr.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =================================================================
              13. دفتر النصوص الرسمي مع توزيع الحصص (Cahier de Textes Sync — ينطلق 08:00 صباحاً)
          ================================================================= */}
          {activeTab === "CAHIER_DE_TEXTES_SYNC" && (() => {
            const cahierEntries = generateCahierDeTextesSummary(
              lessons[0] || {
                lessonAr: "الرياضيات",
                lessonFr: "Maths",
                capacitiesAr: [],
                capacitiesFr: [],
              },
              4
            );
            return (
              <div className="space-y-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <BookMarked className="w-4 h-4 text-indigo-600" />
                      <span>
                        مولد سجل دفتر النصوص الرسمي حصة بحصة (ينطلق على الساعة 08:00 صباحاً)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      تدوين رسمي متكامل للحصص الصباحية والمسائية ابتداءً من (08:00 - 09:00) يشمل مرجع التوجيهات التربوية، الأنشطة المنجزة، التمارين المنزلية، حصر الغياب، وتأشيرة الإدارة والمفتشية.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200">
                    ⏰ التوقيت الرسمي: 08:00 صباحاً
                  </span>
                </div>

                <div className="space-y-3">
                  {cahierEntries.map((entry) => (
                    <div
                      key={entry.sessionNumber}
                      className="bg-white border border-slate-300 rounded-2xl p-4 space-y-2.5 text-xs shadow-2xs"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-cyan-300 font-mono font-black text-[11px]">
                            {entry.timeSlotLabel}
                          </span>
                          <span className="font-black text-slate-950 text-sm">
                            {entry.courseTitleAr}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10.5px] bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded font-bold">
                            {entry.sessionTypeAr}
                          </span>
                          <span className="font-mono text-[10.5px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                            {entry.curriculumRefCode}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="font-bold text-slate-900 block mb-1">
                            📌 الأنشطة والفقرات المنجزة في الحصة:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                            {entry.activitiesConductedAr.map((act, aIdx) => (
                              <li key={aIdx}>{act}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1.5">
                          <div>
                            <span className="font-bold text-slate-900 block mb-0.5">
                              🏠 العمل المنزلي والتكليفات المستقلة:
                            </span>
                            <p className="text-slate-700 text-[11px]">
                              {entry.homeworkAssignedAr}
                            </p>
                          </div>
                          <div className="text-[10.5px] text-emerald-800 bg-emerald-50/80 border border-emerald-200 px-2 py-1 rounded">
                            ✓ {entry.absencesRecordAr}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono pt-1">
                            {entry.signatureBox}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* =================================================================
              14. المدقق الجبري الآلي للحسابات الرمزية (Auto-CAS Verifier)
          ================================================================= */}
          {activeTab === "AUTO_CAS_VERIFIER" && (() => {
            const sampleCas = verifyFormulaWithCAS("f(x) = x - 1 + \\frac{\\ln(x)}{x}");
            return (
              <div className="space-y-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <Search className="w-4 h-4 text-teal-600" />
                      <span>المدقق الجبري الآلي للحسابات الرمزية والمشتقات (Auto-CAS Pipeline)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      فحص فوري لصحة المشتقات، النهايات، ومجموعات التعريف المقترحة من طرف الذكاء الاصطناعي لضمان عصمتها من الخطأ.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900">الصيغة المختبرة:</span>
                    <span className="font-mono font-black text-indigo-900 text-sm">
                      <MathText text={`$${sampleCas.rawFormula}$`} inline />
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                      <span className="text-[10.5px] text-teal-800 font-bold block">المشتقة الرمزية:</span>
                      <span className="font-mono text-xs font-black text-teal-950">{sampleCas.symbolicDerivative}</span>
                    </div>
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <span className="text-[10.5px] text-indigo-800 font-bold block">مطابقة الحساب:</span>
                      <span className="font-mono text-xs font-black text-indigo-950">{sampleCas.evalAt2}</span>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="text-[10.5px] text-amber-800 font-bold block">حالة الاتساق:</span>
                      <span className="text-xs font-bold text-amber-950">متسقة 100% ✓</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    {sampleCas.notesAr}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* =================================================================
              15. مصحح أوراق التلاميذ التكويني (Handwriting Diagnostician)
          ================================================================= */}
          {activeTab === "HANDWRITING_DIAGNOSTICIAN" && (() => {
            const diag = diagnoseSampleStudentAttempt("DOMAIN_FORGET");
            return (
              <div className="space-y-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-rose-600" />
                      <span>المصحح التكويني لأوراق التلاميذ وتشخيص العوائق (Diagnostician)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      تشخيص الأخطاء المكتوبة في تحرير التلميذ (مثل نسيان مجموعة الصلاحية) وتوليد بطاقة معالجة ودعم فوري.
                    </p>
                  </div>
                </div>

                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="font-black text-rose-950 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-700" />
                    <span>الخطأ المشخص في ورقة التلميذ: {diag.stepIdentified}</span>
                  </div>
                  <p className="text-rose-900 leading-relaxed font-medium">
                    {diag.diagnosisAr}
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-rose-200 text-slate-800 text-[11px] mt-2">
                    <span className="font-bold text-rose-950">إجراء المعالجة والدعم الموصى به: </span>
                    <span>{diag.remediationActionAr}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =================================================================
              16. معجم خيار فرنسية BIOF (Linguistic Glossary Adapter)
          ================================================================= */}
          {activeTab === "BIOF_GLOSSARY_ADAPTER" && (() => {
            const glossary = buildBiofGlossaryForTrack(track.code);
            return (
              <div className="space-y-4">
                <div className="bg-white border border-slate-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-sky-700" />
                      <span>المعجم اللغوي التوجيهي لمسالك خيار فرنسية (Glossaire BIOF)</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      معجم المصطلحات الرياضية الرسمية مع النطق الصوتي وسياق الصياغة الفرنسية الدقيقة لتجاوز العائق اللغوي.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {glossary.map((term, tIdx) => (
                    <div key={tIdx} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs shadow-2xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                        <span className="font-black text-slate-950">{term.arabic}</span>
                        <span className="font-mono text-[10px] text-slate-400">{term.phoneticPronunciation}</span>
                      </div>
                      <div className="font-bold text-sky-900" dir="ltr">
                        {term.french}
                      </div>
                      <div className="text-[10.5px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100" dir="ltr">
                        « {term.contextSentenceFr} »
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
