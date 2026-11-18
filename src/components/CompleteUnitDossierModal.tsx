import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  BookOpen,
  FileText,
  Layers,
  Download,
  CheckCircle2,
  Database,
  ShieldCheck,
  Sparkles,
  BrainCircuit,
  GraduationCap,
  Sliders,
  ArrowUp,
  ArrowDown,
  Split,
  Plus,
  Minus,
  CreditCard,
} from "lucide-react";
import { LessonItem, TrackData } from "../data/curriculum";
import {
  generateStandaloneLessonSummary,
  buildCompletePedagogicalUnitDossier,
  LessonSummaryTemplateType,
} from "../utils/lessonSummaryEngine";
import {
  buildThreeTierDifferentiatedSeries,
  generateParameterizedHomeworkVariants,
} from "../utils/seriesGenerator";
import { FichePedagogicalFormat } from "../utils/ficheGenerator";
import {
  savePedagogicalRecord,
  computeStorageHealthReport,
  sanitizeTrustedSvgMarkup,
  StorageHealthReport,
} from "../utils/pedagogicalIndexedDbEngine";
import {
  adjustSubQuestionBaremeStep025,
  buildA6RectoVersoFlashcardsSheet,
  buildFoldedA5RevisionBooklet,
  buildNationalExamenBlanc20PtsDossier,
  createEditableSubQuestionTree,
  EditableExerciseSubQuestionTree,
  moveSubQuestionOrder,
  splitSubQuestionInTwo,
  updateSubQuestionText,
} from "../utils/nextGenRoadmapEngine";
import { computeModularArchitectureDiagnostics } from "../hooks/useModularStudioArchitecture";
import { MathText } from "./MathRenderer";

export interface CompleteUnitDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: TrackData;
  lessons: LessonItem[];
}

export const CompleteUnitDossierModal: React.FC<CompleteUnitDossierModalProps> = ({
  isOpen,
  onClose,
  track,
  lessons,
}) => {
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<
    | "SUMMARY_STUDIO"
    | "SERIES_3TIER"
    | "DM_PARAMETERIZED"
    | "FICHE_V2"
    | "EXAMEN_BLANC_NATIONAL"
    | "INLINE_SUBQ_EDITOR"
    | "POCKET_BOOKLET_FLASHCARDS"
    | "FULL_DOSSIER_5IN1"
  >("SUMMARY_STUDIO");
  const [summaryTemplate, setSummaryTemplate] =
    useState<LessonSummaryTemplateType>("CHEAT_SHEET_1PAGE");
  const [ficheFormat, setFicheFormat] = useState<FichePedagogicalFormat>("COURSE_BUILD");
  const [activeDmGroup, setActiveDmGroup] = useState<"A" | "B" | "C" | "D">("A");
  const [examenBlancModel, setExamenBlancModel] = useState<"A" | "B">("A");
  const [flippedCardIndices, setFlippedCardIndices] = useState<Record<number, boolean>>({});
  const [storageReport, setStorageReport] = useState<StorageHealthReport | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const activeLesson = lessons[selectedLessonIdx] || lessons[0];

  const [editableSubQTree, setEditableSubQTree] =
    useState<EditableExerciseSubQuestionTree | null>(() =>
      activeLesson ? createEditableSubQuestionTree(activeLesson, 6) : null
    );

  useEffect(() => {
    if (activeLesson) {
      setEditableSubQTree(createEditableSubQuestionTree(activeLesson, 6));
    }
  }, [activeLesson]);

  const standaloneSummary = useMemo(() => {
    if (!activeLesson) return null;
    return generateStandaloneLessonSummary(activeLesson, track, summaryTemplate);
  }, [activeLesson, track, summaryTemplate]);

  const threeTierSeries = useMemo(() => {
    if (!activeLesson) return [];
    return buildThreeTierDifferentiatedSeries([activeLesson], "A");
  }, [activeLesson]);

  const parameterizedHomework = useMemo(() => {
    if (!activeLesson) return null;
    return generateParameterizedHomeworkVariants([activeLesson], "PREPARATOIRE_DS");
  }, [activeLesson]);

  const nationalExamenBlanc = useMemo(() => {
    return buildNationalExamenBlanc20PtsDossier({
      track,
      examModel: examenBlancModel,
    });
  }, [track, examenBlancModel]);

  const foldedA5Booklet = useMemo(() => {
    if (!activeLesson) return null;
    return buildFoldedA5RevisionBooklet(activeLesson, track);
  }, [activeLesson, track]);

  const flashcardsA6 = useMemo(() => {
    if (!activeLesson) return [];
    return buildA6RectoVersoFlashcardsSheet(activeLesson, track);
  }, [activeLesson, track]);

  const systemHealthReport = useMemo(() => {
    if (!activeLesson) return null;
    return computeModularArchitectureDiagnostics(track, activeLesson);
  }, [track, activeLesson]);

  const completeDossier = useMemo(() => {
    if (!activeLesson) return null;
    return buildCompletePedagogicalUnitDossier({
      lesson: activeLesson,
      track,
      ficheFormat,
      summaryTemplate,
    });
  }, [activeLesson, track, ficheFormat, summaryTemplate]);

  if (!isOpen || !activeLesson || !completeDossier || !standaloneSummary) return null;

  const handleSaveToIndexedDbAndDownload = async () => {
    const enrichedPayload = {
      ...completeDossier,
      nextGenPhases: {
        phase2_nationalExamenBlanc: nationalExamenBlanc,
        phase3_editableSubQuestionTree: editableSubQTree,
        phase4_foldedA5Booklet: foldedA5Booklet,
        phase4_flashcardsA6: flashcardsA6,
        phase5_systemHealthReport: systemHealthReport,
      },
    };
    await savePedagogicalRecord({
      storeName: "unit_dossiers",
      id: completeDossier.dossierId,
      titleAr: `حقيبة الدرس الشاملة: ${activeLesson.lessonAr}`,
      trackCode: track.code,
      lessonId: completeDossier.lessonId,
      payload: enrichedPayload,
    });
    const report = await computeStorageHealthReport();
    setStorageReport(report);
    setSavedNotice(
      `تم حفظ الحقيبة الشاملة (شاملة المراحل 1 إلى 5) في IndexedDB (${report.totalRecordsCount} سجل) وتحميل الملف المتكامل بنجاح.`
    );

    const blob = new Blob([JSON.stringify(enrichedPayload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Complete_Unit_Dossier_AllPhases_${track.code}_${completeDossier.lessonId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-l from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>استوديو الوثائق التربوية المتكاملة وخارطة الطريق المتقدمة (8 وحدات)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  جاهزية المكونات: {systemHealthReport?.readinessScorePercent || 100}%
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ملخصات + سلاسل فارقية + فروض منزلية (A/B/C/D) + جذاذات v2 + امتحان تجريبي وطني (Examen Blanc) + محرر الأسئلة الفرعية (أ/ب/ج) + مطوية A5 وبطاقات A6
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLessonIdx}
              onChange={(e) => setSelectedLessonIdx(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5"
            >
              {lessons.map((l, idx) => (
                <option key={l.lessonFr || idx} value={idx}>
                  الدرس {idx + 1}: {l.lessonAr}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSaveToIndexedDbAndDownload}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير وحفظ الحقيبة الشاملة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 py-2 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center gap-1.5">
          {[
            {
              id: "SUMMARY_STUDIO",
              label: "1. ملخصات الدروس + SVG",
              icon: BookOpen,
            },
            {
              id: "SERIES_3TIER",
              label: "2. السلسلة الفارقية (N1/N2/N3)",
              icon: Layers,
            },
            {
              id: "DM_PARAMETERIZED",
              label: "3. الفرض المنزلي (A/B/C/D)",
              icon: Sparkles,
            },
            {
              id: "FICHE_V2",
              label: "4. الجذاذة v2 + السبورة",
              icon: FileText,
            },
            {
              id: "EXAMEN_BLANC_NATIONAL",
              label: "5. الامتحان التجريبي الموحد (Examen Blanc)",
              icon: GraduationCap,
            },
            {
              id: "INLINE_SUBQ_EDITOR",
              label: "6. محرر الفروع (أ، ب، ج) والتنقيط (0.25)",
              icon: Sliders,
            },
            {
              id: "POCKET_BOOKLET_FLASHCARDS",
              label: "7. مطوية A5 وبطاقات الاستذكار A6",
              icon: CreditCard,
            },
            {
              id: "FULL_DOSSIER_5IN1",
              label: "8. الفحص الشامل للمكونات والبنية المعمارية",
              icon: ShieldCheck,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {savedNotice && (
          <div className="mx-5 mt-3 px-3.5 py-2 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {savedNotice}
            </span>
            <button
              type="button"
              onClick={() => setSavedNotice(null)}
              className="text-[11px] underline cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === "SUMMARY_STUDIO" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div className="text-xs font-bold text-indigo-200">
                  اختر قالب ملخص الدرس المستقل:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      {
                        id: "CHEAT_SHEET_1PAGE",
                        label: "بطاقة المراجعة المكثفة (1-Page Cheat Sheet)",
                      },
                      {
                        id: "METHOD_SHEETS_HOWTO",
                        label: "بطاقات الطرائق المنهجية (كيف أبرهن على...؟)",
                      },
                      {
                        id: "MIND_MAP_BIOF_LEXICON",
                        label: "الخريطة الذهنية البصرية SVG + معجم BIOF",
                      },
                    ] as const
                  ).map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSummaryTemplate(tpl.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                        summaryTemplate === tpl.id
                          ? "bg-amber-500/20 border-amber-400 text-amber-200"
                          : "bg-slate-900 border-slate-700 text-slate-300"
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mind Map SVG */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-indigo-300 mb-2">
                  الخريطة الذهنية المفاهيمية للدرس (SVG Vector Mind Map):
                </div>
                <div
                  className="w-full max-w-3xl mx-auto rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeTrustedSvgMarkup(standaloneSummary.mindMapSvgMarkup),
                  }}
                />
              </div>

              {/* Method How-To Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {standaloneSummary.methodHowToCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-300">
                        {card.examQuestionPromptAr}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                        {card.difficultyBadge}
                      </span>
                    </div>
                    <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                      {card.methodStepsAr.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-center text-xs">
                      <MathText text={`$${card.keyFormulaLatex}$`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pitfalls & BIOF Lexicon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3.5">
                  <div className="text-xs font-extrabold text-rose-300 mb-2">
                    احذر هذه الأخطاء الـ 5 الشائعة في الامتحان:
                  </div>
                  <ul className="space-y-1 text-[11px] text-rose-100/90 list-decimal list-inside">
                    {standaloneSummary.topFivePitfallsAr.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-teal-950/20 border border-teal-500/30 rounded-xl p-3.5">
                  <div className="text-xs font-extrabold text-teal-300 mb-2">
                    معجم التناوب اللغوي الرسمي (Lexique Mathématique BIOF AR ↔ FR):
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    {standaloneSummary.biofLexicon.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 bg-slate-900/70 px-2.5 py-1 rounded border border-slate-800"
                      >
                        <span className="font-bold text-slate-200">{item.termAr}</span>
                        <span className="text-teal-300 font-mono text-[10px]" dir="ltr">
                          {item.termFr}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "SERIES_3TIER" && (
            <div className="space-y-3">
              {threeTierSeries.map((tier) => (
                <div
                  key={tier.tierCode}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-indigo-300">
                        {tier.tierTitleAr}
                      </h3>
                      <p className="text-[11px] text-slate-400">{tier.teacherBoardHintAr}</p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 font-bold">
                      {tier.usageBadgeAr}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {tier.exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5"
                      >
                        <div className="text-xs font-bold text-white">{ex.badgeAr}</div>
                        <ul className="text-[11px] text-slate-300 space-y-1">
                          {ex.questionsAr.map((q, qIdx) => (
                            <li key={qIdx}>
                              <MathText text={q} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "DM_PARAMETERIZED" && parameterizedHomework && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div className="text-xs font-bold text-emerald-300">
                  النسخ المفرّدة بالمعاملات للحد من النقل الآلي (Anti-Copie Groups):
                </div>
                <div className="flex gap-1.5">
                  {(["A", "B", "C", "D"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setActiveDmGroup(g)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                        activeDmGroup === g
                          ? "bg-emerald-600 text-white border-emerald-400"
                          : "bg-slate-900 text-slate-300 border-slate-700"
                      }`}
                    >
                      الفوج {g}
                    </button>
                  ))}
                </div>
              </div>

              {parameterizedHomework.groups
                .filter((g) => g.groupId === activeDmGroup)
                .map((grp) => (
                  <div
                    key={grp.groupId}
                    className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="text-xs font-extrabold text-emerald-300">
                      {grp.groupLabelAr}
                    </div>
                    {grp.exercises.map((ex) => (
                      <div
                        key={ex.exerciseNum}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2"
                      >
                        <div className="text-xs font-bold text-white">
                          التمرين {ex.exerciseNum}: {ex.lessonTitleAr}
                        </div>
                        <ul className="text-[11px] text-slate-200 space-y-1">
                          {ex.questionsAr.map((q, qIdx) => (
                            <li key={qIdx}>
                              <MathText text={q} />
                            </li>
                          ))}
                        </ul>
                        <div className="p-2 rounded bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 space-y-1">
                          {ex.guidedScaffoldingHintsAr.map((h, hIdx) => (
                            <div key={hIdx}>💡 {h}</div>
                          ))}
                        </div>
                        <div className="text-[11px] text-emerald-300 font-semibold">
                          ✓ {ex.answerKeySummaryAr}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          )}

          {activeTab === "FICHE_V2" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <span className="text-xs font-bold text-indigo-200">
                  نمط الجذاذة البيداغوجية التخصصية (OP 2007 v2):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "COURSE_BUILD", label: "جذاذة بناء المفهوم والدرس" },
                      { id: "TD_REMEDIATION", label: "جذاذة التمارين والدعم" },
                      { id: "TICE_LAB", label: "جذاذة إدماج TICE و Python" },
                      { id: "BLACKBOARD_CAHIER", label: "مخطط السبورة الثلاثية ودفتر النصوص" },
                    ] as const
                  ).map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setFicheFormat(fmt.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                        ficheFormat === fmt.id
                          ? "bg-indigo-600 text-white border-indigo-400"
                          : "bg-slate-900 text-slate-300 border-slate-700"
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* STEM Extensions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(completeDossier.components["1_pedagogicalFicheOp2007"].stemExtensions || []).map(
                  (ext, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl p-3.5 space-y-1.5"
                    >
                      <div className="text-xs font-extrabold text-cyan-300">
                        امتداد تخصصي STEM: {ext.disciplineAr}
                      </div>
                      <div className="text-xs font-bold text-white">{ext.applicationTitleAr}</div>
                      <p className="text-[11px] text-slate-300">{ext.didacticLinkAr}</p>
                      <div className="p-2 rounded bg-slate-950/70 text-center text-xs">
                        <MathText text={`$${ext.mathematicalModelLatex}$`} />
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Blackboard & Cahier de Texte */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-extrabold text-amber-300">
                  مخطط السبورة الثلاثية (Tableau Noir) وملخص دفتر النصوص حصة بحصة:
                </div>
                <div className="space-y-2">
                  {(
                    completeDossier.components["1_pedagogicalFicheOp2007"]
                      .blackboardPlansPerSession || []
                  )
                    .slice(0, 3)
                    .map((plan) => (
                      <div
                        key={plan.sessionNum}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] space-y-1"
                      >
                        <div className="font-bold text-indigo-300">
                          الحصة {plan.sessionNum}: {plan.sessionTitleAr}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-slate-300">
                          <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                            {plan.rightWingActivitiesAr}
                          </div>
                          <div className="p-2 rounded bg-slate-950/70 border border-indigo-500/30">
                            {plan.centerWingCourseAr}
                          </div>
                          <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                            {plan.leftWingExercisesAr}
                          </div>
                        </div>
                        <div className="text-emerald-300 font-semibold pt-1">
                          📘 دفتر النصوص: {plan.cahierDeTexteEntryAr}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* المرحلة 2: استوديو الامتحان التجريبي الوطني الموحد (Examen Blanc National 3h/4h) */}
          {activeTab === "EXAMEN_BLANC_NATIONAL" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-l from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-extrabold text-amber-300">
                    {nationalExamenBlanc.confidentialityHeaderBanner.ministryHeaderAr}
                  </div>
                  <div className="text-sm font-black text-white mt-0.5">
                    الامتحان التجريبي الموحد للبكالوريا — {nationalExamenBlanc.trackLabelAr} (المعامل:{" "}
                    {nationalExamenBlanc.officialCoefficient} · المدة:{" "}
                    {nationalExamenBlanc.officialDurationLabelAr})
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-1">
                    ✓ {nationalExamenBlanc.nationalGradingSummary.inspectorComplianceBadgeAr}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {(["A", "B"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setExamenBlancModel(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                        examenBlancModel === m
                          ? "bg-amber-500 text-slate-950 border-amber-300"
                          : "bg-slate-900 text-slate-300 border-slate-700"
                      }`}
                    >
                      النموذج الوطني {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {nationalExamenBlanc.exercisesAndProblem.map((ex) => (
                  <div
                    key={ex.exerciseNumber}
                    className={`rounded-xl p-4 border space-y-2.5 ${
                      ex.isMajorSynthesisProblem
                        ? "bg-indigo-950/25 border-indigo-500/40"
                        : "bg-slate-950/60 border-slate-800"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="text-xs font-extrabold text-white">
                        {ex.titleAr}
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {ex.allocatedPoints} نقط · {ex.recommendedMinutes} دقيقة
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ex.subQuestions.map((sq, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs text-slate-100">
                              <strong className="text-amber-300 ml-1.5">{sq.codeAr}</strong>
                              <MathText text={sq.statementAr} />
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                              {sq.points} ن ({sq.skillLevel})
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-400 pr-3 border-r-2 border-indigo-500/40 space-y-0.5">
                            {sq.nationalGradingStepsAr.map((step, sIdx) => (
                              <div key={sIdx}>• {step}</div>
                            ))}
                            <div className="text-teal-300">
                              ↺ بديل مقبول في التصحيح: {sq.acceptedAlternativeMethodAr}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* المرحلة 3: المحرر التفاعلي للأسئلة الفرعية (أ، ب، ج) وسلم التنقيط (0.25 ن) */}
          {activeTab === "INLINE_SUBQ_EDITOR" && editableSubQTree && (
            <div className="space-y-4">
              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-extrabold text-indigo-300">
                    المحرر المباشر للأسئلة الفرعية (أ، ب، ج) وسلم التنقيط الجزئي (0.25 نقطة)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    يمكنك تعديل نص كل فرع، رفع أو خفض تنقيطه بخطوة 0.25 ن، تغيير ترتيبه، أو شطره إلى فرعين مستقلين.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-black font-mono">
                  مجموع التمرين: {editableSubQTree.totalExercisePoints} ن
                </span>
              </div>

              <div className="space-y-3">
                {editableSubQTree.questions.map((mainQ, mIdx) => (
                  <div
                    key={mIdx}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300 border-b border-slate-800 pb-2">
                      <span>السؤال الرئيسي رقم {mIdx + 1}</span>
                      <span className="font-mono">{mainQ.parentPoints} نقط</span>
                    </div>

                    <div className="space-y-2">
                      {mainQ.subQuestions.map((sq, sIdx) => (
                        <div
                          key={sq.id}
                          className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                            <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-black text-xs shrink-0">
                              {sq.labelAr}) / {sq.labelFr})
                            </span>
                            <input
                              type="text"
                              value={sq.textAr}
                              onChange={(e) =>
                                setEditableSubQTree((prev) =>
                                  prev
                                    ? updateSubQuestionText(
                                        prev,
                                        mIdx,
                                        sIdx,
                                        e.target.value
                                      )
                                    : prev
                                )
                              }
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setEditableSubQTree((prev) =>
                                  prev
                                    ? adjustSubQuestionBaremeStep025(
                                        prev,
                                        mIdx,
                                        sIdx,
                                        -0.25
                                      )
                                    : prev
                                )
                              }
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 cursor-pointer"
                              title="إنقاص 0.25 نقطة"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono text-xs font-black text-emerald-300 px-2">
                              {sq.points.toFixed(2)} ن
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setEditableSubQTree((prev) =>
                                  prev
                                    ? adjustSubQuestionBaremeStep025(
                                        prev,
                                        mIdx,
                                        sIdx,
                                        0.25
                                      )
                                    : prev
                                )
                              }
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 cursor-pointer"
                              title="إضافة 0.25 نقطة"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditableSubQTree((prev) =>
                                  prev
                                    ? moveSubQuestionOrder(prev, mIdx, sIdx, "UP")
                                    : prev
                                )
                              }
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                              title="تحريك لأعلى"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditableSubQTree((prev) =>
                                  prev
                                    ? moveSubQuestionOrder(prev, mIdx, sIdx, "DOWN")
                                    : prev
                                )
                              }
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                              title="تحريك لأسفل"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditableSubQTree((prev) =>
                                  prev
                                    ? splitSubQuestionInTwo(prev, mIdx, sIdx)
                                    : prev
                                )
                              }
                              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                              title="تفكيك هذا الفرع إلى فرعين متتاليين"
                            >
                              <Split className="w-3 h-3" />
                              <span>شطر الفرع</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* المرحلة 4: مطوية المراجعة الجيبية (A5 Duplex) وبطاقات الاستذكار (A6 Flashcards) */}
          {activeTab === "POCKET_BOOKLET_FLASHCARDS" && foldedA5Booklet && (
            <div className="space-y-4">
              {/* Folded A5 Booklet Duplex Imposition */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-amber-300">
                      1. مطوية المراجعة الجيبية (Folded A5 Pocket Revision Booklet — 4 صفحات على ورقة A4)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {foldedA5Booklet.foldingInstructionsAr}
                    </p>
                  </div>
                  <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
                    Imposition: [ص4 | ص1] ↔ [ص2 | ص3]
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[...foldedA5Booklet.outerSheetPages, ...foldedA5Booklet.innerSheetPages].map(
                    (pg) => (
                      <div
                        key={pg.pageNumber}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5"
                      >
                        <div className="text-xs font-extrabold text-indigo-300">
                          {pg.titleAr}
                        </div>
                        <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                          {pg.contentItemsAr.slice(0, 4).map((it, i) => (
                            <li key={i}>
                              <MathText text={it} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* A6 Recto/Verso Flashcards */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-extrabold text-teal-300">
                  2. بطاقات الاستذكار السريع (A6 Recto/Verso Flashcards — انقر على البطاقة لقلب الوجه/الظهر):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {flashcardsA6.map((card) => {
                    const isFlipped = Boolean(flippedCardIndices[card.cardNumber]);
                    return (
                      <button
                        key={card.cardNumber}
                        type="button"
                        onClick={() =>
                          setFlippedCardIndices((prev) => ({
                            ...prev,
                            [card.cardNumber]: !prev[card.cardNumber],
                          }))
                        }
                        className={`text-right p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[145px] ${
                          isFlipped
                            ? "bg-emerald-950/40 border-emerald-500/40"
                            : "bg-slate-900 border-slate-800 hover:border-indigo-500/40"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-amber-300">بطاقة #{card.cardNumber}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {isFlipped ? "الظهر (الجواب)" : "الوجه (السؤال)"}
                          </span>
                        </div>
                        {!isFlipped ? (
                          <div className="text-xs font-bold text-white my-2">
                            {card.rectoQuestionAr}
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-200 space-y-1 my-2">
                            {card.versoStepsAr.map((st, sIdx) => (
                              <div key={sIdx}>✓ {st}</div>
                            ))}
                            <div className="pt-1 text-center">
                              <MathText text={`$${card.versoFormulaLatex}$`} />
                            </div>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          {card.categoryBadgeAr}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "FULL_DOSSIER_5IN1" && systemHealthReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-300 mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>مؤشر جاهزية المنظومة الشامل</span>
                  </div>
                  <p className="text-lg font-black text-white">
                    {systemHealthReport.healthyComponentsCount} /{" "}
                    {systemHealthReport.totalComponentsInspected} مكونات نشطة (
                    {systemHealthReport.readinessScorePercent}%)
                  </p>
                  {storageReport && (
                    <div className="mt-1 text-[11px] text-indigo-300 font-bold">
                      IndexedDB: {storageReport.totalRecordsCount} سجل محفوظ ({storageReport.statusLevel})
                    </div>
                  )}
                </div>

                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 mb-1">
                    <BrainCircuit className="w-4 h-4" />
                    <span>الأسئلة الفرعية (أ، ب، ج) والامتحان الوطني</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    أسئلة الدرس: {completeDossier.components["5_supervisedExamSectionDS"].mainQuestionsCount} ← مفككة إلى{" "}
                    {completeDossier.components["5_supervisedExamSectionDS"].decomposedSubQuestionsCount} فرعاً · والامتحان التجريبي: 80 خطوة تصحيح من فئة 0.25 ن.
                  </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-300 mb-1">
                    <Database className="w-4 h-4" />
                    <span>البنية المعمارية المفككة (Phase 5)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    نطاقات Curriculum + Typography + Export Orchestrator + LessonLogEngine تعمل بتكامل تام.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-extrabold text-teal-300 mb-2">
                  سجل الفحص الآلي لجميع مراحل خارطة الطريق ومكونات التطبيق:
                </div>
                <div className="space-y-2">
                  {systemHealthReport.components.map((comp) => (
                    <div
                      key={comp.componentId}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{comp.componentNameAr}</span>
                      </div>
                      <span className="text-[11px] text-emerald-300 font-mono">
                        {comp.verificationMetricsAr}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteUnitDossierModal;
