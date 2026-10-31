import React, { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Eye,
  Grid,
  Layers,
  RotateCcw,
  Sparkles,
  Type,
  Wand2,
} from "lucide-react";
import {
  evaluateTitleCalligraphyHarmony,
  formatTitleWithCalligraphyOrnaments,
  TitleCalligraphyScale,
  TitleCalligraphyScope,
  TitleOrnamentStyle,
  TRADITIONAL_TITLE_FONT_OPTIONS,
  TraditionalTitleFontId,
} from "../data/curriculum";

export interface AppliedTitleCalligraphyConfig {
  fontId: TraditionalTitleFontId;
  scale: TitleCalligraphyScale;
  ornament: TitleOrnamentStyle;
  scope: TitleCalligraphyScope;
}

interface ArabicCalligraphySimulatorProps {
  docTitle: string;
  docSubtitle: string;
  headerNote: string;
  school: string;
  prof: string;
  academy: string;
  firstExerciseTitle: string;
  appliedConfig: AppliedTitleCalligraphyConfig;
  onApplyConfig: (config: AppliedTitleCalligraphyConfig) => void;
  onUpdateDocTitleText?: (formattedTitle: string) => void;
}

export const ArabicCalligraphySimulator: React.FC<ArabicCalligraphySimulatorProps> = ({
  docTitle,
  docSubtitle,
  headerNote,
  school,
  prof,
  academy,
  firstExerciseTitle,
  appliedConfig,
  onApplyConfig,
  onUpdateDocTitleText,
}) => {
  // حالة المحاكي الداخلية لمعاينة الخطوط بحرية قبل الاعتماد النهائي
  const [previewFontId, setPreviewFontId] = useState<TraditionalTitleFontId>(
    appliedConfig.fontId === "DEFAULT_DOC" ? "THULUTH_ROYAL" : appliedConfig.fontId
  );
  const [previewScale, setPreviewScale] = useState<TitleCalligraphyScale>(
    appliedConfig.scale || "BALANCED"
  );
  const [previewOrnament, setPreviewOrnament] = useState<TitleOrnamentStyle>(
    appliedConfig.ornament || "NONE"
  );
  const [previewScope, setPreviewScope] = useState<TitleCalligraphyScope>(
    appliedConfig.scope || "HEADER_TITLES"
  );
  const [simulatorMode, setSimulatorMode] = useState<"SINGLE_STAGE" | "COMPARE_GRID">(
    "SINGLE_STAGE"
  );
  const [showMizanGrid, setShowMizanGrid] = useState<boolean>(true);
  const [previewSurface, setPreviewSurface] = useState<
    "A4_WHITE" | "PARCHMENT" | "ROYAL_NAVY"
  >("PARCHMENT");
  const [customTestPhrase, setCustomTestPhrase] = useState<string>("");

  const activeFontMeta = useMemo(
    () =>
      TRADITIONAL_TITLE_FONT_OPTIONS.find((f) => f.id === previewFontId) ||
      TRADITIONAL_TITLE_FONT_OPTIONS[1],
    [previewFontId]
  );

  const effectiveTitleToPreview =
    customTestPhrase.trim() ||
    docTitle.trim() ||
    "الفرض المحروس رقم 1 — الدورة الأولى في مادة الرياضيات";

  const formattedMainTitle = useMemo(
    () => formatTitleWithCalligraphyOrnaments(effectiveTitleToPreview, previewOrnament),
    [effectiveTitleToPreview, previewOrnament]
  );

  const harmonyReport = useMemo(
    () =>
      evaluateTitleCalligraphyHarmony(
        effectiveTitleToPreview,
        docSubtitle,
        previewFontId,
        previewScale
      ),
    [effectiveTitleToPreview, docSubtitle, previewFontId, previewScale]
  );

  const isCurrentlyApplied =
    appliedConfig.fontId === previewFontId &&
    appliedConfig.scale === previewScale &&
    appliedConfig.ornament === previewOrnament &&
    appliedConfig.scope === previewScope;

  const scaleSizeClass =
    previewScale === "COMPACT"
      ? "text-lg md:text-xl"
      : previewScale === "GRAND"
      ? "text-2xl md:text-3xl"
      : "text-xl md:text-2xl";

  const surfaceStyles =
    previewSurface === "ROYAL_NAVY"
      ? "bg-slate-950 text-amber-100 border-amber-500/40"
      : previewSurface === "PARCHMENT"
      ? "bg-[#fcf8ef] text-slate-950 border-amber-300/80"
      : "bg-white text-slate-950 border-slate-300";

  return (
    <div
      dir="rtl"
      className="bg-white border-2 border-indigo-200/90 rounded-2xl p-3.5 space-y-3.5 shadow-xs"
    >
      {/* الشريط العلوي للمحاكي */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center font-serif text-sm font-black shadow-2xs">
            ق
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-slate-950">
                محاكي الخطوط العربية التقليدية وميزان تناسق العناوين
              </h3>
              <span className="text-[10.5px] font-bold text-slate-500">
                الثلث · الديواني · الديواني الجلي · المغربي · الرقعة · الكوفي
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              عاين تناسق العنوان الرئيسي والفرعي مع قواعد الخط العربي الأصيل قبل اعتماده في التصميم النهائي للورقة (A4).
            </p>
          </div>
        </div>

        {/* أزرار التبديل بين المعاينة التفصيلية ومقارنة جميع الخطوط */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setSimulatorMode("SINGLE_STAGE")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                simulatorMode === "SINGLE_STAGE"
                  ? "bg-slate-900 text-amber-300 font-black shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>لوحة الميزان والتناسق</span>
            </button>
            <button
              type="button"
              onClick={() => setSimulatorMode("COMPARE_GRID")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                simulatorMode === "COMPARE_GRID"
                  ? "bg-slate-900 text-amber-300 font-black shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>مقارنة جميع الخطوط معاً</span>
            </button>
          </div>
        </div>
      </div>

      {/* شريط اختيار الخط العربي التقليدي */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-black text-slate-800">
            1. اختر الخط العربي التقليدي للمعاينة في المحاكي:
          </span>
          <span className="text-slate-500 font-semibold">
            المدرسة الخطية: <strong className="text-indigo-950">{activeFontMeta.schoolOriginAr}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {TRADITIONAL_TITLE_FONT_OPTIONS.map((fontOpt) => {
            const isSelected = previewFontId === fontOpt.id;
            const isAppliedOnDoc =
              appliedConfig.fontId === fontOpt.id && fontOpt.id !== "DEFAULT_DOC";
            return (
              <button
                key={fontOpt.id}
                type="button"
                onClick={() => {
                  setPreviewFontId(fontOpt.id);
                }}
                className={`p-2 rounded-xl border text-right transition flex flex-col justify-between gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-amber-400/50"
                    : "bg-slate-50/90 hover:bg-white text-slate-800 border-slate-200/90"
                }`}
              >
                <div className="flex items-center justify-between w-full gap-1">
                  <span
                    className={`text-[10.5px] font-black truncate ${
                      isSelected ? "text-amber-300" : "text-slate-900"
                    }`}
                  >
                    {fontOpt.shortAr}
                  </span>
                  {isAppliedOnDoc && (
                    <span
                      title="معتمد حالياً في الوثيقة"
                      className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
                    />
                  )}
                </div>
                <div
                  className={`text-sm truncate w-full py-0.5 ${fontOpt.cssClass} ${
                    isSelected ? "text-white" : "text-indigo-950"
                  }`}
                >
                  الرياضيات
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ضوابط التناسق، الحجم، الزخرفة، ونطاق التطبيق */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
        {/* 1. حجم خط العنوان */}
        <div>
          <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
            حجم القلم والثلث الرأسي:
          </label>
          <div className="grid grid-cols-3 gap-1 bg-white p-0.5 rounded-lg border border-slate-300 text-[10.5px] font-bold">
            {(
              [
                { id: "COMPACT", label: "مدمج" },
                { id: "BALANCED", label: "متوازن" },
                { id: "GRAND", label: "جليّ بارز" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setPreviewScale(s.id)}
                className={`py-1 rounded-md transition cursor-pointer ${
                  previewScale === s.id
                    ? "bg-indigo-950 text-white font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. الكشيدة والزخرفة السلطانية */}
        <div>
          <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
            الكشيدة والزخرفة الخطية:
          </label>
          <select
            value={previewOrnament}
            onChange={(e) => setPreviewOrnament(e.target.value as TitleOrnamentStyle)}
            className="w-full border border-slate-300 rounded-lg px-2 py-1 text-[11px] bg-white font-bold text-slate-900"
          >
            <option value="NONE">بدون زخرفة إضافية (نص صافي)</option>
            <option value="KASHIDA">تطويل الحروف بالكشيدة (ـ)</option>
            <option value="ROYAL_BRACKETS">أقواس سلطانية مزخرفة ﴾ ... ﴿</option>
            <option value="FULL_SULTANI">ترويسة سلطانية كاملة ۞ ﴾ ... ﴿ ۞</option>
          </select>
        </div>

        {/* 3. نطاق تطبيق الخط في الوثيقة */}
        <div>
          <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
            نطاق التطبيق عند الاعتماد:
          </label>
          <select
            value={previewScope}
            onChange={(e) => setPreviewScope(e.target.value as TitleCalligraphyScope)}
            className="w-full border border-slate-300 rounded-lg px-2 py-1 text-[11px] bg-white font-bold text-slate-900"
          >
            <option value="MAIN_TITLE_ONLY">العنوان الرئيسي للوثيقة فقط</option>
            <option value="HEADER_TITLES">ترويسة الوثيقة كاملة (الرئيسي + الفرعي + المؤسسة)</option>
            <option value="ALL_TITLES">جميع العناوين (الترويسة + عناوين التمارين)</option>
          </select>
        </div>

        {/* 4. خلفية المسرح وشبكة الميزان */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10.5px] font-bold text-slate-700">
              بيئة العرض وشبكة الميزان:
            </label>
            <button
              type="button"
              onClick={() => setShowMizanGrid((v) => !v)}
              className={`text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                showMizanGrid ? "text-amber-800 underline" : "text-slate-500"
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>{showMizanGrid ? "إخفاء الميزان" : "إظهار الميزان"}</span>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-white p-0.5 rounded-lg border border-slate-300 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setPreviewSurface("PARCHMENT")}
              className={`py-1 rounded transition cursor-pointer ${
                previewSurface === "PARCHMENT"
                  ? "bg-amber-800 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              رق مخطوط
            </button>
            <button
              type="button"
              onClick={() => setPreviewSurface("A4_WHITE")}
              className={`py-1 rounded transition cursor-pointer ${
                previewSurface === "A4_WHITE"
                  ? "bg-indigo-950 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ورقة A4
            </button>
            <button
              type="button"
              onClick={() => setPreviewSurface("ROYAL_NAVY")}
              className={`py-1 rounded transition cursor-pointer ${
                previewSurface === "ROYAL_NAVY"
                  ? "bg-slate-900 text-amber-300"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              لوحة ملكية
            </button>
          </div>
        </div>
      </div>

      {/* مسرح المعاينة: إما لوحة الميزان التفصيلية أو مقارنة جميع الخطوط جنباً إلى جنب */}
      {simulatorMode === "SINGLE_STAGE" ? (
        <div
          className={`rounded-2xl border-2 p-4 md:p-5 transition-colors relative overflow-hidden ${surfaceStyles} ${
            showMizanGrid && previewSurface !== "ROYAL_NAVY" ? "calligraphy-mizan-grid" : ""
          }`}
        >
          {/* شارة نوع الخط وأصله */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pb-2.5 mb-3 border-b border-current/15">
            <div className="flex items-center gap-2 font-bold">
              <Type className="w-3.5 h-3.5 opacity-75" />
              <span>معاينة حية للترويسة بـ: {activeFontMeta.nameAr}</span>
            </div>
            <div className="flex items-center gap-3 text-[10.5px] opacity-80 font-mono">
              <span>الطول: {harmonyReport.charLength} حرفاً</span>
              <span>·</span>
              <span>الكلمات: {harmonyReport.wordCount}</span>
              <span>·</span>
              <span>نسبة الحروف العربية: {harmonyReport.arabicRatioPercent}%</span>
            </div>
          </div>

          {/* محاكاة الترويسة الفعلية للفرض */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center md:text-right">
            <div className="space-y-0.5 text-[11px] opacity-85">
              <div className="font-bold">المملكة المغربية · وزارة التربية الوطنية</div>
              <div className="text-[10.5px] opacity-80">{academy}</div>
              <div
                className={`font-black text-xs pt-0.5 ${
                  previewScope !== "MAIN_TITLE_ONLY" ? activeFontMeta.cssClass : ""
                }`}
              >
                {school}
              </div>
            </div>

            <div className="md:col-span-1 text-center space-y-1.5 py-2 px-3 rounded-xl border border-current/15 bg-current/[0.03]">
              <div
                className={`font-black tracking-normal transition-all ${activeFontMeta.cssClass} ${scaleSizeClass}`}
              >
                {formattedMainTitle}
              </div>
              <div
                className={`text-xs font-bold opacity-90 ${
                  previewScope !== "MAIN_TITLE_ONLY" ? activeFontMeta.cssClass : ""
                }`}
              >
                {docSubtitle.trim() || "المدة الزمنية: ساعتان (2h) · سلم التنقيط: 20/20"}
              </div>
              {headerNote.trim() && (
                <div className="text-[10.5px] italic opacity-75">{headerNote}</div>
              )}
            </div>

            <div className="space-y-0.5 text-[11px] md:text-left opacity-85">
              <div className="font-bold">المادة: الرياضيات</div>
              <div className="font-extrabold">{prof}</div>
              <div className="text-[10.5px] opacity-75">معاينة التناسق قبل الطباعة</div>
            </div>
          </div>

          {/* معاينة عنوان التمرين الأول أسفل الترويسة للتأكد من التناغم مع متن الورقة */}
          <div className="mt-3.5 pt-2.5 border-t border-current/15 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-bold opacity-70">
                معاينة عنوان التمرين مع هذا التنسيق:
              </span>
              <span
                className={`font-black text-sm ${
                  previewScope === "ALL_TITLES" ? activeFontMeta.cssClass : ""
                }`}
              >
                {firstExerciseTitle || "التمرين 1 : اتصال واشتقاق دالة عددية ودراسة تغيراتها"}
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold opacity-80">
              [6.0 نقط · N1/N2]
            </span>
          </div>
        </div>
      ) : (
        /* شبكة مقارنة جميع الخطوط العربية التقليدية جنباً إلى جنب */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {TRADITIONAL_TITLE_FONT_OPTIONS.filter((f) => f.id !== "DEFAULT_DOC").map(
            (fontOpt) => {
              const isSelected = previewFontId === fontOpt.id;
              const rep = evaluateTitleCalligraphyHarmony(
                effectiveTitleToPreview,
                docSubtitle,
                fontOpt.id,
                previewScale
              );
              return (
                <div
                  key={fontOpt.id}
                  onClick={() => setPreviewFontId(fontOpt.id)}
                  className={`rounded-xl border p-3 transition cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/30"
                      : "bg-[#fcf9f2] hover:bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-1.5">
                    <div>
                      <div className="text-xs font-black text-slate-950">
                        {fontOpt.nameAr}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {fontOpt.bestForAr}
                      </div>
                    </div>
                    <span className="font-mono text-[10.5px] font-black text-emerald-800 shrink-0">
                      تناسق {rep.score}%
                    </span>
                  </div>

                  <div className="py-2 text-center space-y-1">
                    <div
                      className={`text-xl font-black text-indigo-950 ${fontOpt.cssClass}`}
                    >
                      {formatTitleWithCalligraphyOrnaments(
                        effectiveTitleToPreview,
                        previewOrnament
                      )}
                    </div>
                    <div
                      className={`text-xs font-bold text-slate-600 ${fontOpt.cssClass}`}
                    >
                      {docSubtitle.trim() || "المدة الزمنية: ساعتان · المعامل: 7"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 text-[10.5px]">
                    <span className="text-slate-500">{fontOpt.shortAr}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewFontId(fontOpt.id);
                        onApplyConfig({
                          fontId: fontOpt.id,
                          scale: previewScale,
                          ornament: previewOrnament,
                          scope: previewScope,
                        });
                      }}
                      className="text-indigo-800 hover:text-indigo-950 font-black underline cursor-pointer"
                    >
                      اعتماد مباشر للوثيقة ←
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* شريط التشخيص البصري ومؤشر التناسق + أزرار الاعتماد النهائي */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-black flex items-center gap-1 ${
                harmonyReport.status === "EXCELLENT"
                  ? "text-emerald-800"
                  : harmonyReport.status === "GOOD"
                  ? "text-indigo-900"
                  : "text-amber-800"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                مؤشر التناسق والوضوح الطباعي: {harmonyReport.score}% ({harmonyReport.statusLabelAr})
              </span>
            </span>
            <span className="text-[11px] text-slate-400">·</span>
            <span className="text-[11px] font-semibold text-slate-600">
              {activeFontMeta.descriptionAr}
            </span>
          </div>
          <div className="text-[11px] text-slate-700 font-medium">
            💡 <strong>توصية الخبير الخطي:</strong> {harmonyReport.notesAr[0]}{" "}
            <span className="text-indigo-900 font-bold">
              {harmonyReport.recommendationAr}
            </span>
          </div>
        </div>

        {/* أزرار التطبيق والاعتماد النهائي */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {previewOrnament !== "NONE" && onUpdateDocTitleText && (
            <button
              type="button"
              onClick={() => onUpdateDocTitleText(formattedMainTitle)}
              title="إدراج الكشيدة أو الأقواس السلطانية مباشرة في حقل نص العنوان الرئيسي"
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 transition flex items-center gap-1 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-700" />
              <span>تثبيت الزخرفة في النص</span>
            </button>
          )}

          {appliedConfig.fontId !== "DEFAULT_DOC" && (
            <button
              type="button"
              onClick={() => {
                setPreviewFontId("DEFAULT_DOC");
                setPreviewOrnament("NONE");
                onApplyConfig({
                  fontId: "DEFAULT_DOC",
                  scale: "BALANCED",
                  ornament: "NONE",
                  scope: "HEADER_TITLES",
                });
              }}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الخط القياسي</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onApplyConfig({
                fontId: previewFontId,
                scale: previewScale,
                ornament: previewOrnament,
                scope: previewScope,
              })
            }
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isCurrentlyApplied && previewFontId !== "DEFAULT_DOC"
                ? "bg-emerald-700 text-white"
                : "bg-indigo-950 hover:bg-indigo-900 text-amber-300"
            }`}
          >
            {isCurrentlyApplied && previewFontId !== "DEFAULT_DOC" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>معتمد في التصميم النهائي للوثيقة ({activeFontMeta.shortAr})</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>اعتماد «{activeFontMeta.shortAr}» في التصميم النهائي للوثيقة</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* حقل اختياري لتجربة عبارة حرة داخل المحاكي دون تغيير عنوان الوثيقة إلا عند الرغبة */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
        <span className="font-bold text-slate-600 shrink-0">
          تجربة نص حر في المحاكي (اختياري):
        </span>
        <input
          type="text"
          value={customTestPhrase}
          onChange={(e) => setCustomTestPhrase(e.target.value)}
          placeholder="اكتب هنا أي عنوان لتجربته بالخط الديواني أو الثلث دون تغيير عنوانك الأصلي..."
          className="flex-1 min-w-[220px] border border-slate-300 rounded-lg px-2.5 py-1 text-xs bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
        {customTestPhrase.trim() && (
          <>
            <button
              type="button"
              onClick={() => {
                onUpdateDocTitleText?.(customTestPhrase.trim());
                setCustomTestPhrase("");
              }}
              className="text-[11px] font-black text-indigo-800 hover:underline cursor-pointer"
            >
              اعتماد هذا النص كعنوان رئيسي
            </button>
            <button
              type="button"
              onClick={() => setCustomTestPhrase("")}
              className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
            >
              مسح النص التجريبي
            </button>
          </>
        )}
      </div>
    </div>
  );
};
