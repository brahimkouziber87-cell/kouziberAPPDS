import React, { useState } from "react";
import {
  X,
  QrCode,
  Sparkles,
  Link2,
  ExternalLink,
  Check,
  Smartphone,
  FileText,
  Compass,
  Copy,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  ExerciseSolutionQrConfig,
  ExerciseSolutionQrMap,
  ExerciseQrBadgePosition,
  ExerciseQrBadgeSize,
  buildExerciseSolutionUrl,
  renderExerciseQrSvg,
} from "../utils/exerciseSolutionQrEngine";
import { LessonItem } from "../data/curriculum";

interface ExerciseSolutionQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: LessonItem[];
  qrMap: ExerciseSolutionQrMap;
  onSaveQrMap: (newMap: ExerciseSolutionQrMap) => void;
  isFr?: boolean;
}

export const ExerciseSolutionQrModal: React.FC<ExerciseSolutionQrModalProps> = ({
  isOpen,
  onClose,
  lessons,
  qrMap,
  onSaveQrMap,
  isFr = false,
}) => {
  const [localMap, setLocalMap] = useState<ExerciseSolutionQrMap>(() => ({ ...qrMap }));
  const [activeExId, setActiveExId] = useState<string>(
    lessons.length > 0 ? `ex_0` : ""
  );
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // تحديث الخريطة المحلية عند فتح النافذة
  React.useEffect(() => {
    if (isOpen) {
      // التأكد من تهيئة التمارين الناقصة
      const updated = { ...qrMap };
      lessons.forEach((l, idx) => {
        const id = `ex_${idx}`;
        if (!updated[id]) {
          updated[id] = {
            exerciseId: id,
            exerciseIndex: idx,
            exerciseNumber: idx + 1,
            exerciseTitleAr: `التمرين ${idx + 1} : ${l.lessonAr}`,
            exerciseTitleFr: `Exercice ${idx + 1} : ${l.lessonFr}`,
            enabled: false,
            targetType: "BUILTIN_INTERACTIVE",
            badgePosition: "BOTTOM_BANNER",
            badgeSize: "STANDARD_22MM",
            customLabelAr: "امسح للاطلاع على التصحيح النموذجي المفصل",
            customLabelFr: "Scanner pour la solution détaillée",
            showScanInstruction: true,
            points: `${l.weight || 4}`,
          };
        }
      });
      setLocalMap(updated);
      if (!activeExId && lessons.length > 0) {
        setActiveExId("ex_0");
      }
    }
  }, [isOpen, qrMap, lessons]);

  if (!isOpen) return null;

  const currentConfig: ExerciseSolutionQrConfig = localMap[activeExId] || {
    exerciseId: activeExId,
    exerciseIndex: 0,
    exerciseNumber: 1,
    exerciseTitleAr: "التمرين 1",
    exerciseTitleFr: "Exercice 1",
    enabled: false,
    targetType: "BUILTIN_INTERACTIVE",
    badgePosition: "BOTTOM_BANNER",
    badgeSize: "STANDARD_22MM",
    customLabelAr: "امسح للاطلاع على التصحيح النموذجي المفصل",
    customLabelFr: "Scanner pour la solution détaillée",
    showScanInstruction: true,
  };

  const currentUrl = buildExerciseSolutionUrl(currentConfig);
  const currentSvg = renderExerciseQrSvg(currentUrl, 120);

  // عداد الرموز المفعلة
  const enabledCount = Object.values(localMap).filter((c) => c.enabled).length;

  const handleToggleCurrent = (enabled: boolean) => {
    setLocalMap((prev) => ({
      ...prev,
      [activeExId]: {
        ...prev[activeExId],
        enabled,
      },
    }));
  };

  const handleUpdateCurrent = (patch: Partial<ExerciseSolutionQrConfig>) => {
    setLocalMap((prev) => ({
      ...prev,
      [activeExId]: {
        ...prev[activeExId],
        ...patch,
      },
    }));
  };

  // تفعيل رموز الـ QR للجميع
  const handleEnableAll = () => {
    setLocalMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = { ...next[k], enabled: true };
      });
      return next;
    });
  };

  // تعطيل رموز الـ QR للجميع
  const handleDisableAll = () => {
    setLocalMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = { ...next[k], enabled: false };
      });
      return next;
    });
  };

  // نسخ الرابط
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // حفظ وتطبيق
  const handleSave = () => {
    onSaveQrMap(localMap);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
      dir={isFr ? "ltr" : "rtl"}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* شريط العنوان التفاعلي */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-5 py-3.5 border-b border-indigo-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  {isFr
                    ? "Générateur de QR Codes pour Solutions d'Exercices"
                    : "توليد وتخصيص رموز QR لحلول التمارين الفردية"}
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {enabledCount} / {lessons.length} {isFr ? "Exercices Actifs" : "تمارين مفعلة"}
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                {isFr
                  ? "Insérez des QR codes scannables directement dans l'impression papier pour chaque exercice"
                  : "إدراج رموز QR متجهة قابلة للمسح بالهاتف في ورقة الطباعة للوصول للحل النموذجي أو فيديو الشرح"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Fermer / إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* الإجراءات السريعة الجماعية */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">
              {isFr ? "Actions par lot :" : "إجراءات جماعية :"}
            </span>
            <button
              type="button"
              onClick={handleEnableAll}
              className="bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isFr ? "Activer pour Tous" : "تفعيل لجميع التمارين"}</span>
            </button>
            <button
              type="button"
              onClick={handleDisableAll}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
            >
              <span>{isFr ? "Désactiver Tous" : "تعطيل الكل"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>
              {isFr
                ? "Scannable avec tout smartphone (Caméra native ou appli QR)"
                : "قابل للمسح الفوري بكاميرا أي هاتف ذكي بدقة متجهة 300+ DPI"}
            </span>
          </div>
        </div>

        {/* جسم النافذة: عمود التمارين + عمود التخصيص والمعاينة */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/30 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* العمود الجانبي: قائمة التمارين */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-xs font-black text-slate-300 mb-2 flex items-center justify-between">
              <span>{isFr ? "Sélectionner un Exercice" : "اختر التمرين للتخصيص :"}</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {lessons.length} {isFr ? "exercices" : "تمارين"}
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {lessons.map((lesson, idx) => {
                const exId = `ex_${idx}`;
                const cfg = localMap[exId];
                const isSelected = activeExId === exId;
                const isEnabled = cfg?.enabled ?? false;

                return (
                  <div
                    key={exId}
                    onClick={() => setActiveExId(exId)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-indigo-950/80 border-indigo-500 shadow-md ring-1 ring-indigo-500 text-white"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isEnabled
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-xs truncate">
                          {isFr ? `Exercice ${idx + 1} : ${lesson.lessonFr}` : `التمرين ${idx + 1} : ${lesson.lessonAr}`}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{lesson.weight || 4} ن</span>
                          {isEnabled ? (
                            <span className="text-emerald-400 font-bold">
                              · {isFr ? "QR Activé" : "QR مفعل"}
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              · {isFr ? "Désactivé" : "غير مفعل"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalMap((prev) => ({
                          ...prev,
                          [exId]: {
                            ...prev[exId],
                            enabled: !isEnabled,
                          },
                        }));
                      }}
                      className={`px-2 py-1 rounded-md text-[10.5px] font-bold transition shrink-0 cursor-pointer ${
                        isEnabled
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {isEnabled ? (isFr ? "Actif" : "مفعل") : isFr ? "Activer" : "تفعيل"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* العمود الرئيسي: لوحة التخصيص والمعاينة الحية للـ QR */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-black text-white">
                    {isFr ? currentConfig.exerciseTitleFr : currentConfig.exerciseTitleAr}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isFr
                      ? "Configuration de la destination et du badge imprimé"
                      : "تحديد وجهة الرابط وشكل الشارة في ورقة الامتحان المطبوعة"}
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-300">
                    {isFr ? "Activer QR" : "تفعيل رمز الـ QR :"}
                  </span>
                  <input
                    type="checkbox"
                    checked={currentConfig.enabled}
                    onChange={(e) => handleToggleCurrent(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>

              {/* اختيار وجهة الـ QR */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  {isFr ? "Type de Destination de la Solution :" : "نوع الوجهة التفاعلية للحل :"}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleUpdateCurrent({ targetType: "BUILTIN_INTERACTIVE" })}
                    className={`p-2.5 rounded-xl border text-right transition flex items-start gap-2 ${
                      currentConfig.targetType === "BUILTIN_INTERACTIVE"
                        ? "bg-indigo-950 border-indigo-500 text-white shadow-xs"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-200">
                        {isFr ? "Solution Interactive App" : "الحل النموذجي التفاعلي بالتطبيق"}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {isFr ? "Visualiseur KaTeX instantané" : "عرض حل خطوات التمرين بصيغة KaTeX"}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateCurrent({ targetType: "EXTERNAL_URL" })}
                    className={`p-2.5 rounded-xl border text-right transition flex items-start gap-2 ${
                      currentConfig.targetType === "EXTERNAL_URL"
                        ? "bg-indigo-950 border-indigo-500 text-white shadow-xs"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Link2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-200">
                        {isFr ? "Lien Externe (Drive/YouTube)" : "رابط خارجي (Drive/YouTube)"}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {isFr ? "PDF en ligne ou vidéo de correction" : "ملف تصحيح PDF أو فيديو شرح"}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateCurrent({ targetType: "CUSTOM_TEXT_SOLUTION" })}
                    className={`p-2.5 rounded-xl border text-right transition flex items-start gap-2 ${
                      currentConfig.targetType === "CUSTOM_TEXT_SOLUTION"
                        ? "bg-indigo-950 border-indigo-500 text-white shadow-xs"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-200">
                        {isFr ? "Note & Barème Personnalisé" : "ملاحظة أو حل نصي مخصص"}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {isFr ? "Texte scanné directement" : "نص مباشر يُعرض فور مسح الرمز"}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateCurrent({ targetType: "GEOGEBRA_3D" })}
                    className={`p-2.5 rounded-xl border text-right transition flex items-start gap-2 ${
                      currentConfig.targetType === "GEOGEBRA_3D"
                        ? "bg-indigo-950 border-indigo-500 text-white shadow-xs"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Compass className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-200">
                        {isFr ? "Modèle GeoGebra 3D / 2D" : "مجسم GeoGebra تفاعلي"}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {isFr ? "Applet de simulation dynamique" : "فتح الشكل الهندسي المتحرك"}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* حقل الرابط الخارجي إذا تم اختياره */}
              {currentConfig.targetType === "EXTERNAL_URL" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    {isFr ? "URL de la Solution (Google Drive / YouTube / Cloud) :" : "رابط الحل المخصص (Google Drive / YouTube / المنصة المدرسية) :"}
                  </label>
                  <input
                    type="url"
                    value={currentConfig.customUrl || ""}
                    onChange={(e) => handleUpdateCurrent({ customUrl: e.target.value })}
                    placeholder="https://drive.google.com/file/d/... أو https://youtu.be/..."
                    dir="ltr"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                  />
                </div>
              )}

              {/* حقل النص المخصص إذا تم اختياره */}
              {currentConfig.targetType === "CUSTOM_TEXT_SOLUTION" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    {isFr ? "Texte de la Solution ou Indications Pédagogiques :" : "نص الحل أو التوجيهات الديداكتيكية المباشرة :"}
                  </label>
                  <textarea
                    value={currentConfig.customSolutionText || ""}
                    onChange={(e) => handleUpdateCurrent({ customSolutionText: e.target.value })}
                    placeholder="اكتب هنا الحل النهائي، خطوات البرهان المختصرة، أو إرشادات حل التمرين..."
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 h-20 resize-none font-sans"
                  />
                </div>
              )}

              {/* موضع وحجم الشارة في الورقة المطبوعة */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">
                    {isFr ? "Emplacement dans l'Épreuve :" : "موضع الرمز في ورقة الامتحان :"}
                  </label>
                  <select
                    value={currentConfig.badgePosition}
                    onChange={(e) =>
                      handleUpdateCurrent({
                        badgePosition: e.target.value as ExerciseQrBadgePosition,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="BOTTOM_BANNER">
                      {isFr ? "Bandeau élégant sous l'exercice" : "شريط أفقي أنيق في أسفل التمرين"}
                    </option>
                    <option value="HEADER_RIGHT">
                      {isFr ? "Dans l'en-tête du titre de l'exercice" : "بجانب عنوان التمرين في الترويسة"}
                    </option>
                    <option value="INLINE_CALLOUT">
                      {isFr ? "Boîte d'appel latérale intégrée" : "مربع نداء مميز جانبي"}
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 block">
                    {isFr ? "Taille d'Impression du QR :" : "حجم الرمز في الطباعة :"}
                  </label>
                  <select
                    value={currentConfig.badgeSize}
                    onChange={(e) =>
                      handleUpdateCurrent({
                        badgeSize: e.target.value as ExerciseQrBadgeSize,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  >
                    <option value="COMPACT_16MM">
                      {isFr ? "Compact (16×16 mm) - Discret" : "مدمج (16×16 mm) - توفير المساحة"}
                    </option>
                    <option value="STANDARD_22MM">
                      {isFr ? "Standard (22×22 mm) - Recommandé" : "قياسي (22×22 mm) - موصى به"}
                    </option>
                    <option value="PROMINENT_28MM">
                      {isFr ? "Large (28×28 mm) - Très visible" : "بارز (28×28 mm) - فائق الوضوح"}
                    </option>
                  </select>
                </div>
              </div>

              {/* نص التسمية المخصصة */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  {isFr ? "Texte de la Légende Imprimée :" : "نص العبارة التوجيهية بجانب الرمز :"}
                </label>
                <input
                  type="text"
                  value={
                    isFr
                      ? currentConfig.customLabelFr || ""
                      : currentConfig.customLabelAr || ""
                  }
                  onChange={(e) =>
                    handleUpdateCurrent(
                      isFr
                        ? { customLabelFr: e.target.value }
                        : { customLabelAr: e.target.value }
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs px-3 py-1.5 rounded-lg focus:outline-none"
                />
              </div>

              {/* المعاينة الحية لرمز الـ QR واختبار المسح */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className="bg-white p-2 rounded-lg border-2 border-slate-300 shadow-sm shrink-0 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: currentSvg }}
                  />
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isFr ? "Aperçu Direct du QR Code" : "معاينة حية لرمز الـ QR"}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 font-mono" dir="ltr">
                      {currentUrl}
                    </div>
                    <div className="text-[10px] text-amber-300 mt-1 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-amber-400" />
                      <span>
                        {isFr
                          ? "Pointez votre téléphone pour tester la redirection"
                          : "وجه كاميرا هاتفك لتجربة فتح الرابط والتأكد من دقته"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{isFr ? "Tester le Lien" : "تجربة الرابط"}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(currentUrl)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedUrl === currentUrl ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">
                          {isFr ? "Copié !" : "تم النسخ"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{isFr ? "Copier" : "نسخ الرابط"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* الشريط السفلي للحفظ والتطبيق */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {isFr
                ? "Les QR codes sont intégrés sous forme de vecteurs nets dans les épreuves imprimées (PDF & Papier)."
                : "تُدرج الرموز كرسومات متجهة عالية النقاء (Vector SVG) لضمان المسح السريع حتى مع الطباعة العادية."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-bold transition cursor-pointer"
            >
              {isFr ? "Annuler" : "إلغاء"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-5 py-2 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isFr ? "Appliquer aux Épreuves" : "تطبيق وحفظ الرموز في ورقة الطباعة"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
