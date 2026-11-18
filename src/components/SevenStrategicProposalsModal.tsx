import React, { useState, useMemo, useRef } from "react";
import {
  X,
  Compass,
  Search,
  Columns,
  Presentation,
  Camera,
  Cpu,
  Download,
  Copy,
  Check,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { InsertedFigure, LessonItem, SemesterType, TrackData } from "../data/curriculum";
import {
  buildPedagogicalDomainStoreSnapshot,
  computeDualModelABComparison,
  designCurveFromInteractiveControlPoints,
  evaluateOmrBubbleDensities,
  generateBeamerPresentationAndSlides,
  IndexedQuestionBankEntry,
  InteractiveCurveControlPoint,
  searchCurriculumQuestionBank,
} from "../utils/sevenStrategicProposalsEngine";
import { MemoizedDualModelABComparisonView } from "../context/PedagogicalStudioContext";
import { MathText } from "./MathRenderer";

export type StrategicProposalTabId =
  | "CURVE_DESIGNER"
  | "QUESTION_BANK"
  | "DUAL_AB_SPLIT"
  | "BEAMER_SLIDES"
  | "CAMERA_OMR"
  | "ARCHITECTURE_STORE";

interface SevenStrategicProposalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: StrategicProposalTabId;
  track: TrackData;
  sem: SemesterType;
  dsKey: string;
  school: string;
  prof: string;
  year: string;
  academy: string;
  direction: string;
  lessons: LessonItem[];
  n1: number;
  n2: number;
  n3: number;
  isFr: boolean;
  isMission: boolean;
  showDualABInPreview: boolean;
  onToggleDualABInPreview: () => void;
  onInsertFigureToExam: (figure: InsertedFigure) => void;
  onInsertLessonFromBank: (entry: IndexedQuestionBankEntry) => void;
  onOpenSmartQcmScanner: () => void;
  onNotify: (type: "success" | "info" | "error", text: string) => void;
}

export const SevenStrategicProposalsModal: React.FC<
  SevenStrategicProposalsModalProps
> = ({
  isOpen,
  onClose,
  initialTab = "CURVE_DESIGNER",
  track,
  sem,
  dsKey,
  school,
  prof,
  year,
  academy,
  direction,
  lessons,
  n1,
  n2,
  n3,
  isFr,
  isMission,
  showDualABInPreview,
  onToggleDualABInPreview,
  onInsertFigureToExam,
  onInsertLessonFromBank,
  onOpenSmartQcmScanner,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<StrategicProposalTabId>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ============================================================================
  // Proposal 4 State: Interactive Drag-and-Drop Function Curve Designer
  // ============================================================================
  const [pointA, setPointA] = useState<InteractiveCurveControlPoint>({
    x: -1,
    y: 2,
    slope: 0,
  });
  const [pointB, setPointB] = useState<InteractiveCurveControlPoint>({
    x: 1,
    y: -2,
    slope: 0,
  });
  const [horizontalAsymptoteY, setHorizontalAsymptoteY] = useState<number | null>(null);
  const [draggingPoint, setDraggingPoint] = useState<"A" | "B" | null>(null);
  const svgCanvasRef = useRef<SVGSVGElement | null>(null);

  const designedCurve = useMemo(
    () =>
      designCurveFromInteractiveControlPoints({
        p1: pointA,
        p2: pointB,
        horizontalAsymptoteY,
      }),
    [pointA, pointB, horizontalAsymptoteY]
  );

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingPoint || !svgCanvasRef.current) return;
    const rect = svgCanvasRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    // ViewBox is 0 0 520 320, domain is [-4, 4] x [-4, 4]
    const mathX = Math.max(
      -3.5,
      Math.min(3.5, Math.round((-4 + relX * 8) * 2) / 2)
    );
    const mathY = Math.max(
      -3.5,
      Math.min(3.5, Math.round((4 - relY * 8) * 2) / 2)
    );

    if (draggingPoint === "A") {
      if (Math.abs(mathX - pointB.x) >= 0.5) {
        setPointA((prev) => ({ ...prev, x: mathX, y: mathY }));
      }
    } else if (draggingPoint === "B") {
      if (Math.abs(mathX - pointA.x) >= 0.5) {
        setPointB((prev) => ({ ...prev, x: mathX, y: mathY }));
      }
    }
  };

  const handleInsertDesignedCurveToExam = () => {
    const svgBase64 = `data:image/svg+xml;utf8,${encodeURIComponent(
      designedCurve.svgFullMarkup
    )}`;
    onInsertFigureToExam({
      id: `interactive_curve_${Date.now()}`,
      titleAr: `منحنى الدالة المصمم تفاعلياً: ${designedCurve.formulaLatex}`,
      titleFr: `Courbe C_f conçue interactivement : ${designedCurve.formulaLatex}`,
      caption: isFr
        ? `Extrema A(${pointA.x}; ${pointA.y}) et B(${pointB.x}; ${pointB.y}) — Point d'inflexion I(${designedCurve.inflectionPoint.x}; ${designedCurve.inflectionPoint.y})`
        : `المطارف A(${pointA.x}; ${pointA.y}) و B(${pointB.x}; ${pointB.y}) — نقطة الانعطاف I(${designedCurve.inflectionPoint.x}; ${designedCurve.inflectionPoint.y})`,
      dataUrl: svgBase64,
      widthPercent: 78,
      alignment: "center",
      exerciseId: "ex_0",
      borderStyle: "academic",
    });
    onNotify(
      "success",
      `✓ تم إدراج المنحنى التفاعلي (${designedCurve.formulaLatex}) مع كود TikZ وجدول التغيرات tkz-tab في الفرض الحالي!`
    );
  };

  // ============================================================================
  // Proposal 5 State: Searchable Moroccan & AEFE Exam Question Bank
  // ============================================================================
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bankTrackFilter, setBankTrackFilter] = useState<string>("ALL");
  const [bankBranchFilter, setBankBranchFilter] = useState<string>("ALL");
  const [bankLevelFilter, setBankLevelFilter] = useState<"ALL" | "N1" | "N2" | "N3">(
    "ALL"
  );

  const bankResults = useMemo(
    () =>
      searchCurriculumQuestionBank({
        query: searchQuery,
        trackFilter: bankTrackFilter,
        branchFilter: bankBranchFilter,
        cognitiveFilter: bankLevelFilter,
        maxResults: 36,
      }),
    [searchQuery, bankTrackFilter, bankBranchFilter, bankLevelFilter]
  );

  // ============================================================================
  // Proposal 6 State: Dual Model A/B Side-by-Side Comparison
  // ============================================================================
  const dualComparisonReport = useMemo(
    () => computeDualModelABComparison(lessons, isFr),
    [lessons, isFr]
  );

  // ============================================================================
  // Proposal 7 State: LaTeX Beamer & Classroom TBI Slides Deck
  // ============================================================================
  const [beamerTheme, setBeamerTheme] = useState<
    "Madrid" | "Warsaw" | "Boadilla" | "CambridgeUS"
  >("Madrid");
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [revealSlideSolution, setRevealSlideSolution] = useState<boolean>(true);

  const beamerPresentation = useMemo(
    () =>
      generateBeamerPresentationAndSlides({
        docTitle: `الفرض المحروس ${dsKey} (${sem})`,
        subtitle: track.labelAr,
        prof,
        school,
        year,
        trackLabel: isFr ? track.labelFr : track.labelAr,
        lessons,
        isFr,
        theme: beamerTheme,
      }),
    [dsKey, sem, track.labelAr, track.labelFr, prof, school, year, lessons, isFr, beamerTheme]
  );

  const activeSlide =
    beamerPresentation.slides[
      Math.min(currentSlideIndex, Math.max(0, beamerPresentation.slides.length - 1))
    ];

  const handleDownloadBeamerTex = () => {
    const blob = new Blob([beamerPresentation.beamerLatexCode], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = beamerPresentation.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify(
      "success",
      `✓ تم تحميل ملف العرض التفاعلي للسبورة (LaTeX Beamer — قالب ${beamerTheme}) جاهزاً للتصريف عبر XeLaTeX / Overleaf!`
    );
  };

  // ============================================================================
  // Proposal 3 State: OMR Pixel Density Live Diagnostic Simulator
  // ============================================================================
  const [simulatedBubbleDarkness, setSimulatedBubbleDarkness] = useState<
    Record<"A" | "B" | "C" | "D", number>
  >({
    A: 45,
    B: 192,
    C: 38,
    D: 41,
  });

  const omrDensityEval = useMemo(
    () =>
      evaluateOmrBubbleDensities({
        bubbleDarknessMatrix: [
          [
            simulatedBubbleDarkness.A,
            simulatedBubbleDarkness.B,
            simulatedBubbleDarkness.C,
            simulatedBubbleDarkness.D,
          ],
        ],
        threshold: 115,
        answerKey: { 1: "B" },
        pointsPerQuestion: 2,
      }),
    [simulatedBubbleDarkness]
  );

  // ============================================================================
  // Proposals 1 & 2 State: Domain Store Snapshot Inspector
  // ============================================================================
  const domainStoreSnapshot = useMemo(
    () =>
      buildPedagogicalDomainStoreSnapshot({
        school,
        prof,
        year,
        academy,
        direction,
        headerStyle: "MINISTRY_142_08",
        educationSystem: isMission ? "MISSION_FRANCAISE" : "MAROC_NATIONAL",
        trackCode: track.code,
        trackLabelAr: track.labelAr,
        semester: sem,
        dsKey,
        activeModule: "DS_142_08",
        examModel: "A",
        activeLessonsCount: lessons.length,
        n1,
        n2,
        n3,
        pageOrientation: "PORTRAIT",
        printPageSizePreset: "A4",
        docFontFamily: "ACADEMIC_SERIF",
        docFontSize: "NORMAL",
        latexPackageTheme: "TCOLORBOX",
        paperSurface: "PLAIN_WHITE",
        showA4LivePageBreaks: true,
        includeInteractiveQrFooter: true,
        includeDetailedSolutions: true,
        includeAnswerWorkspace: true,
        include2DSpecMatrix: true,
        includeOMRBubbleSheet: true,
        includeCustomEvalGridSheet: true,
      }),
    [
      school,
      prof,
      year,
      academy,
      direction,
      isMission,
      track.code,
      track.labelAr,
      sem,
      dsKey,
      lessons.length,
      n1,
      n2,
      n3,
    ]
  );

  if (!isOpen) return null;

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toSvgX = (x: number) => Number((((x + 4) / 8) * 460 + 30).toFixed(1));
  const toSvgY = (y: number) => Number((290 - ((y + 4) / 8) * 260).toFixed(1));

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print"
      dir="rtl"
    >
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[93vh] flex flex-col overflow-hidden">
        {/* ترويسة الاستوديو الاستراتيجي الموحد (المقترحات السبعة) */}
        <div className="bg-gradient-to-l from-slate-950 via-indigo-950 to-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono text-[10px] font-black">
                  7 ARCHITECTURAL & DIDACTIC PROPOSALS
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 font-mono text-[10px] font-bold">
                  {track.code} · {sem} · {dsKey}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                مركز الابتكارات الهندسية والديداكتيكية السبعة (تطوير معماري وبيداغوجي شامل)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-200 border border-white/15 transition cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* شريط التبويبات للابتكارات السبعة */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center gap-1.5">
          {[
            {
              id: "CURVE_DESIGNER" as StrategicProposalTabId,
              label: "4. مصمم المنحنيات بالسحب والإفلات",
              badge: "Interactive C_f",
              icon: Compass,
            },
            {
              id: "QUESTION_BANK" as StrategicProposalTabId,
              label: "5. محرك البحث في بنك الفروض (19 مسلكاً)",
              badge: "Search Bank",
              icon: Search,
            },
            {
              id: "DUAL_AB_SPLIT" as StrategicProposalTabId,
              label: "6. المقارنة المزدوجة A | B جنب-إلى-جنب",
              badge: "Dual A/B",
              icon: Columns,
            },
            {
              id: "BEAMER_SLIDES" as StrategicProposalTabId,
              label: "7. مصدر العروض التفاعلية LaTeX Beamer",
              badge: "TBI Slides",
              icon: Presentation,
            },
            {
              id: "CAMERA_OMR" as StrategicProposalTabId,
              label: "3. الماسح الضوئي الحي OMR & QR",
              badge: "WebRTC OMR",
              icon: Camera,
            },
            {
              id: "ARCHITECTURE_STORE" as StrategicProposalTabId,
              label: "1 & 2. معمارية الحالة والعزل React.memo",
              badge: "4 Domain Slices",
              icon: Cpu,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                  active
                    ? "bg-gradient-to-l from-amber-400 to-cyan-400 text-slate-950 shadow-sm"
                    : "bg-slate-800/90 text-slate-200 hover:bg-slate-800 border border-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className={`font-mono text-[9.5px] px-1.5 py-0.2 rounded ${
                    active
                      ? "bg-slate-950/20 text-slate-950 font-black"
                      : "bg-slate-950 text-cyan-300"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* محتوى التبويب النشط */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-5">
          {/* =====================================================================
              التبويب 4: مصمم المنحنيات البيانية التفاعلي بالسحب والإفلات
          ===================================================================== */}
          {activeTab === "CURVE_DESIGNER" && (
            <div className="space-y-4">
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-700" />
                    <span>
                      مصمم المنحنيات البيانية العكسي بالسحب والإفلات (Inverse Curve Designer: Control Points → f(x) + tkz-tab + TikZ)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    اسحب نقطتي المطراف <strong dir="ltr">A(x_A, y_A)</strong> و{" "}
                    <strong dir="ltr">B(x_B, y_B)</strong> مباشرة فوق المعلم المتعامد الممنظم، وسيقوم المحرك الجبري باستنتاج صيغة الدالة{" "}
                    <span dir="ltr">f(x)</span> ومشتقتها <span dir="ltr">f'(x)</span> وجدول التغيرات{" "}
                    <code dir="ltr">tkz-tab</code> تلقائياً!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleInsertDesignedCurveToExam}
                  className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-amber-300 font-black text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ إدراج المنحنى وجدول التغيرات في الفرض الحالي</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* لوحة الرسم التفاعلية بالسحب والإفلات */}
                <div className="lg:col-span-7 bg-white border border-slate-300 rounded-2xl p-4 space-y-3 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <span className="text-xs font-black text-slate-900">
                      لوحة المعلم التفاعلي (اسحب النقطتين A أو B بالفأرة أو اللمس):
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px]" dir="ltr">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold">
                        A({pointA.x}, {pointA.y})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold">
                        B({pointB.x}, {pointB.y})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 font-bold">
                        I({designedCurve.inflectionPoint.x}, {designedCurve.inflectionPoint.y})
                      </span>
                    </div>
                  </div>

                  {/* SVG Canvas Interactive */}
                  <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-2 select-none">
                    <svg
                      ref={svgCanvasRef}
                      viewBox="0 0 520 320"
                      className="w-full h-72 cursor-crosshair touch-none"
                      onPointerMove={handleSvgPointerMove}
                      onPointerUp={() => setDraggingPoint(null)}
                      onPointerLeave={() => setDraggingPoint(null)}
                    >
                      <defs>
                        <pattern
                          id="interactive_curve_grid"
                          width="57.5"
                          height="32.5"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 57.5 0 L 0 0 0 32.5"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="1"
                          />
                        </pattern>
                      </defs>
                      <rect
                        x="0"
                        y="0"
                        width="520"
                        height="320"
                        fill="url(#interactive_curve_grid)"
                        rx="10"
                      />
                      {/* Axes */}
                      <line
                        x1="30"
                        y1={toSvgY(0)}
                        x2="490"
                        y2={toSvgY(0)}
                        stroke="#334155"
                        strokeWidth="1.6"
                      />
                      <line
                        x1={toSvgX(0)}
                        y1="20"
                        x2={toSvgX(0)}
                        y2="300"
                        stroke="#334155"
                        strokeWidth="1.6"
                      />
                      {/* Horizontal Asymptote if enabled */}
                      {horizontalAsymptoteY !== null && (
                        <line
                          x1="30"
                          y1={toSvgY(horizontalAsymptoteY)}
                          x2="490"
                          y2={toSvgY(horizontalAsymptoteY)}
                          stroke="#e11d48"
                          strokeWidth="1.8"
                          strokeDasharray="6,4"
                        />
                      )}
                      {/* Curve Path */}
                      <path
                        d={designedCurve.svgPathD}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Tangent lines at A & B */}
                      <line
                        x1={toSvgX(pointA.x) - 32}
                        y1={toSvgY(pointA.y)}
                        x2={toSvgX(pointA.x) + 32}
                        y2={toSvgY(pointA.y)}
                        stroke="#10b981"
                        strokeWidth="2"
                      />
                      <line
                        x1={toSvgX(pointB.x) - 32}
                        y1={toSvgY(pointB.y)}
                        x2={toSvgX(pointB.x) + 32}
                        y2={toSvgY(pointB.y)}
                        stroke="#10b981"
                        strokeWidth="2"
                      />
                      {/* Inflection Point I */}
                      <circle
                        cx={toSvgX(designedCurve.inflectionPoint.x)}
                        cy={toSvgY(designedCurve.inflectionPoint.y)}
                        r="5.5"
                        fill="#7c3aed"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      {/* Draggable Control Point A */}
                      <g
                        className="cursor-grab active:cursor-grabbing"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setDraggingPoint("A");
                        }}
                      >
                        <circle
                          cx={toSvgX(pointA.x)}
                          cy={toSvgY(pointA.y)}
                          r="8.5"
                          fill="#f59e0b"
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                        <text
                          x={toSvgX(pointA.x) - 18}
                          y={toSvgY(pointA.y) - 12}
                          fontSize="11"
                          fontWeight="bold"
                          fill="#0f172a"
                        >
                          A({pointA.x};{pointA.y})
                        </text>
                      </g>
                      {/* Draggable Control Point B */}
                      <g
                        className="cursor-grab active:cursor-grabbing"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setDraggingPoint("B");
                        }}
                      >
                        <circle
                          cx={toSvgX(pointB.x)}
                          cy={toSvgY(pointB.y)}
                          r="8.5"
                          fill="#10b981"
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                        <text
                          x={toSvgX(pointB.x) - 18}
                          y={toSvgY(pointB.y) - 12}
                          fontSize="11"
                          fontWeight="bold"
                          fill="#0f172a"
                        >
                          B({pointB.x};{pointB.y})
                        </text>
                      </g>
                    </svg>
                  </div>

                  {/* أشرطة الضبط الدقيق للإحداثيات والمقارب الأفقي */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                      <div className="font-extrabold text-indigo-950 flex justify-between">
                        <span>النقطة A (x_A, y_A):</span>
                        <span className="font-mono" dir="ltr">
                          ({pointA.x}, {pointA.y})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono">x_A:</span>
                        <input
                          type="range"
                          min={-3.5}
                          max={0}
                          step={0.5}
                          value={pointA.x}
                          onChange={(e) =>
                            setPointA((p) => ({ ...p, x: Number(e.target.value) }))
                          }
                          className="w-full accent-indigo-700"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono">y_A:</span>
                        <input
                          type="range"
                          min={-3}
                          max={3}
                          step={0.5}
                          value={pointA.y}
                          onChange={(e) =>
                            setPointA((p) => ({ ...p, y: Number(e.target.value) }))
                          }
                          className="w-full accent-indigo-700"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                      <div className="font-extrabold text-emerald-950 flex justify-between">
                        <span>النقطة B (x_B, y_B):</span>
                        <span className="font-mono" dir="ltr">
                          ({pointB.x}, {pointB.y})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono">x_B:</span>
                        <input
                          type="range"
                          min={0.5}
                          max={3.5}
                          step={0.5}
                          value={pointB.x}
                          onChange={(e) =>
                            setPointB((p) => ({ ...p, x: Number(e.target.value) }))
                          }
                          className="w-full accent-emerald-700"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono">y_B:</span>
                        <input
                          type="range"
                          min={-3}
                          max={3}
                          step={0.5}
                          value={pointB.y}
                          onChange={(e) =>
                            setPointB((p) => ({ ...p, y: Number(e.target.value) }))
                          }
                          className="w-full accent-emerald-700"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                      <label className="font-extrabold text-rose-950 flex items-center justify-between cursor-pointer">
                        <span>مقارب أفقي y = L:</span>
                        <input
                          type="checkbox"
                          checked={horizontalAsymptoteY !== null}
                          onChange={(e) =>
                            setHorizontalAsymptoteY(e.target.checked ? 1 : null)
                          }
                          className="rounded accent-rose-600"
                        />
                      </label>
                      {horizontalAsymptoteY !== null ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-rose-800">
                            <span>المستقيم المقارب:</span>
                            <span dir="ltr">y = {horizontalAsymptoteY}</span>
                          </div>
                          <input
                            type="range"
                            min={-2.5}
                            max={2.5}
                            step={0.5}
                            value={horizontalAsymptoteY}
                            onChange={(e) =>
                              setHorizontalAsymptoteY(Number(e.target.value))
                            }
                            className="w-full accent-rose-600"
                          />
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-500">
                          فعّل الخيار لإدراج مستقيم مقارب أفقي <span dir="ltr">y = L</span> بجوار{" "}
                          <span dir="ltr">±∞</span>.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* المخرجات الجبرية المستنتجة آلياً: الدالة، المشتقة، الأسئلة، وكود tkz-tab */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2.5 border border-slate-800">
                    <div className="text-[11px] font-mono text-cyan-300 font-bold">
                      AUTO-DEDUCED ANALYTIC EXPRESSION (HERMITE INTERPOLATION)
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-sm text-amber-300" dir="ltr">
                      <div>{designedCurve.formulaLatex}</div>
                      <div className="text-xs text-cyan-300 mt-1">
                        {designedCurve.derivativeLatex}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">
                      نقطة الانعطاف المستنتجة جبرياً:{" "}
                      <strong className="font-mono text-amber-300" dir="ltr">
                        I({designedCurve.inflectionPoint.x};{" "}
                        {designedCurve.inflectionPoint.y})
                      </strong>
                    </p>
                  </div>

                  <div className="bg-white border border-slate-300 rounded-2xl p-4 space-y-2">
                    <div className="font-black text-xs text-slate-900">
                      الأسئلة الديداكتيكية المولدة تلقائياً من المنحنى المصمم:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                      {(isFr
                        ? designedCurve.pedagogicalExerciseQuestionsFr
                        : designedCurve.pedagogicalExerciseQuestionsAr
                      ).map((q: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">
                          <MathText text={q} inline />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-slate-300 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-900">
                        كود LaTeX المولد (tkz-tab + TikZ):
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            "curve_tikz",
                            `${designedCurve.tkzTabCode}\n\n${designedCurve.tikzPgfplotsCode}`
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "curve_tikz" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey === "curve_tikz" ? "تم النسخ" : "نسخ الكود"}</span>
                      </button>
                    </div>
                    <pre
                      dir="ltr"
                      className="bg-slate-950 text-cyan-200 rounded-xl p-3 text-[10.5px] font-mono overflow-x-auto max-h-40"
                    >
                      {designedCurve.tkzTabCode}
                      {"\n\n"}
                      {designedCurve.tikzPgfplotsCode}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              التبويب 5: محرك البحث الفوري في بنك الفروض والتمارين (19 مسلكاً)
          ===================================================================== */}
          {activeTab === "QUESTION_BANK" && (
            <div className="space-y-4">
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <Search className="w-4 h-4 text-indigo-700" />
                      <span>
                        محرك البحث الفوري في بنك الفروض والتمارين الوطنية والبعثة (19 مسلكاً · تصنيف المذكرة 142-08)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      ابحث بالكلمات المفتاحية (مثل: <strong className="text-indigo-900">ترجع، متتاليات، عقدية، تكامل، احتمال، اتصال، ln</strong>) وأدرج أي وحدة مباشرة في فرضك الحالي بضغطة واحدة.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-indigo-950 text-amber-300 font-mono text-xs font-black">
                    {bankResults.length} تمرين/وحدة مطابقة
                  </span>
                </div>

                {/* شريط البحث والفلاتر */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                  <div className="md:col-span-5 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث بالمهارة، الدرس، أو المفهوم (مثلاً: النهايات، الترجع، ln، suites)..."
                      className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-indigo-600 bg-slate-50"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <select
                      value={bankTrackFilter}
                      onChange={(e) => setBankTrackFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    >
                      <option value="ALL">جميع المسالك (19 مسلكاً)</option>
                      <option value="2BAC_SM">2 باك علوم رياضية A & B</option>
                      <option value="2BAC_PC">2 باك علوم فيزيائية (PC)</option>
                      <option value="2BAC_SVT_AGRO">2 باك علوم الحياة والأرض (SVT)</option>
                      <option value="1BAC_SM">1 باك علوم رياضية</option>
                      <option value="1BAC_SE">1 باك علوم تجريبية</option>
                      <option value="TCS">جذع مشترك علمي (TCS)</option>
                      <option value="TERM_SPE_FR">Terminale Spécialité (AEFE)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <select
                      value={bankBranchFilter}
                      onChange={(e) => setBankBranchFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    >
                      <option value="ALL">كل الفروع الرياضية</option>
                      <option value="ANALYSIS_BLUE">∫ التحليل (Analyse)</option>
                      <option value="ALGEBRA_AMBER">ℂ الجبر والعقدية</option>
                      <option value="GEOMETRY_GREEN">⌖ الهندسة الفضائية/المستوية</option>
                      <option value="PROBABILITY_PURPLE">ℙ الاحتمالات والإحصاء</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <select
                      value={bankLevelFilter}
                      onChange={(e) =>
                        setBankLevelFilter(
                          e.target.value as "ALL" | "N1" | "N2" | "N3"
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    >
                      <option value="ALL">كل المستويات (N1/N2/N3)</option>
                      <option value="N1">المستوى N1 (تطبيق مباشر)</option>
                      <option value="N2">المستوى N2 (استدلال مرحلي)</option>
                      <option value="N3">المستوى N3 (توليف ودمج)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* شبكة نتائج بنك التمارين */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bankResults.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-2xs transition"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200 font-mono text-[10px] font-bold">
                          {entry.trackCode} · {entry.semester} · {entry.dsKey}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[10px] font-extrabold">
                          {entry.branchLabelAr} · المستوى {entry.cognitiveLevel} ·{" "}
                          {entry.suggestedPoints} ن
                        </span>
                      </div>

                      <div className="font-black text-sm text-slate-950">
                        {entry.lessonAr} /{" "}
                        <span className="text-indigo-800">{entry.lessonFr}</span>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-1">
                        {entry.capacitiesAr[0] && (
                          <div className="font-bold text-slate-800">
                            القدرة المستهدفة:{" "}
                            <span className="font-normal">{entry.capacitiesAr[0]}</span>
                          </div>
                        )}
                        <div className="text-slate-700">
                          <MathText
                            text={
                              (isFr ? entry.questionsFr[0] : entry.questionsAr[0]) ||
                              entry.lessonAr
                            }
                            inline
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10.5px] font-bold text-slate-500">
                        {entry.trackLabelAr}
                      </span>
                      <button
                        type="button"
                        onClick={() => onInsertLessonFromBank(entry)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-extrabold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                        <span>إدراج هذا التمرين في الفرض الحالي</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              التبويب 6: المقارنة المزدوجة للنموذجين A و B جنب-إلى-جنب
          ===================================================================== */}
          {activeTab === "DUAL_AB_SPLIT" && (
            <div className="space-y-4">
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <Columns className="w-4 h-4 text-indigo-700" />
                    <span>
                      معاينة المقارنة المتزامنة للنموذجين المتوازيين (Sujet A | Sujet B Side-by-Side Inspector)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    فحص فوري للتكافؤ الديداكتيكي والوزني بين النموذج A والنموذج B المضاد للغش قبل الطباعة.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onToggleDualABInPreview();
                    onNotify(
                      "info",
                      showDualABInPreview
                        ? "تم إغلاق وضع المقارنة المزدوجة A | B داخل المعاينة الرئيسية."
                        : "✓ تم تفعيل وضع المقارنة المزدوجة (Sujet A | Sujet B) مباشرة أعلى ورقة المعاينة الحية!"
                    );
                  }}
                  className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition cursor-pointer ${
                    showDualABInPreview
                      ? "bg-emerald-700 text-white"
                      : "bg-indigo-950 text-amber-300 hover:bg-indigo-900"
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  <span>
                    {showDualABInPreview
                      ? "✓ المقارنة المزدوجة مفعّلة في المعاينة الرئيسية (اضغط للإخفاء)"
                      : "تثبيت المقارنة المزدوجة A | B فوق ورقة المعاينة الرئيسية"}
                  </span>
                </button>
              </div>

              <MemoizedDualModelABComparisonView
                lessons={lessons}
                isFr={isFr}
                school={school}
                prof={prof}
                year={year}
                trackLabel={isFr ? track.labelFr : track.labelAr}
              />

              <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-amber-300 font-black">
                    خلاصة المطابقة التربوية (Note 142-08):{" "}
                  </span>
                  <span>{dualComparisonReport.verdictAr}</span>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-black">
                  التكافؤ: {dualComparisonReport.isomorphismScorePct}%
                </span>
              </div>
            </div>
          )}

          {/* =====================================================================
              التبويب 7: مصدر العروض التفاعلية للسبورة (LaTeX Beamer & TBI Slides)
          ===================================================================== */}
          {activeTab === "BEAMER_SLIDES" && (
            <div className="space-y-4">
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <Presentation className="w-4 h-4 text-indigo-700" />
                    <span>
                      محرك العروض التفاعلية لحصة التصحيح الجماعي على السبورة التفاعلية (LaTeX Beamer & TBI Slide Deck)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    يحوّل تمارين الفرض الحالية تلقائياً إلى شرائح عرض تفاعلية (سؤال في كل شريحة مع إظهار/إخفاء الحل التدريجي <code dir="ltr">\pause</code>) وتصدير كود <code dir="ltr">Beamer .tex</code>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={beamerTheme}
                    onChange={(e) =>
                      setBeamerTheme(
                        e.target.value as
                          | "Madrid"
                          | "Warsaw"
                          | "Boadilla"
                          | "CambridgeUS"
                      )
                    }
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                  >
                    <option value="Madrid">قالب Beamer: Madrid (أكاديمي كلاسيكي)</option>
                    <option value="Warsaw">قالب Beamer: Warsaw (مفصل رسمي)</option>
                    <option value="Boadilla">قالب Beamer: Boadilla (مختصر أنيق)</option>
                    <option value="CambridgeUS">قالب Beamer: CambridgeUS (عنابي/ذهبي)</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleDownloadBeamerTex}
                    className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-amber-300 font-black text-xs flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل العرض LaTeX Beamer (.tex)</span>
                  </button>
                </div>
              </div>

              {/* مشغل شرائح السبورة التفاعلية (TBI Slide Player) */}
              {activeSlide && (
                <div className="bg-slate-950 text-white rounded-3xl p-6 border-2 border-indigo-500/40 shadow-xl space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono text-xs font-black">
                        شريحة {activeSlide.slideNumber} / {beamerPresentation.slides.length}
                      </span>
                      <span className="text-sm font-black text-amber-300">
                        {activeSlide.title}
                      </span>
                    </div>
                    <span className="font-mono text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg font-bold">
                      {activeSlide.pointsBadge || activeSlide.badgeAr} · Theme: {beamerTheme}
                    </span>
                  </div>

                  {/* نص الشريحة على السبورة التفاعلية */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2.5">
                    <div className="text-xs font-mono text-cyan-400 font-bold">
                      {activeSlide.subtitle}
                    </div>
                    {revealSlideSolution || activeSlide.type !== "SOLUTION_CORRIGE" ? (
                      <ul className="space-y-2 text-sm sm:text-base font-bold text-white list-disc list-inside leading-relaxed">
                        {activeSlide.bullets.map((b: string, i: number) => (
                          <li key={i}>
                            <MathText text={b} inline />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-amber-300 font-bold py-4">
                        عناصر الإجابة مخفية حالياً لإتاحة التفكير الجماعي للتلاميذ — اضغط على زر «إظهار عناصر الإجابة» أدناه.
                      </div>
                    )}
                  </div>

                  {/* تلميح بيداغوجي إضافي إن وجد */}
                  {activeSlide.pedagogicalHintAr && (
                    <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3.5 text-xs text-emerald-200">
                      <strong className="text-emerald-300">توجيه بيداغوجي على السبورة: </strong>
                      <MathText text={activeSlide.pedagogicalHintAr} inline />
                    </div>
                  )}

                  {/* أزرار التحكم في الشرائح */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentSlideIndex === 0}
                        onClick={() =>
                          setCurrentSlideIndex((idx) => Math.max(0, idx - 1))
                        }
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-black flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span>الشريحة السابقة</span>
                      </button>
                      <button
                        type="button"
                        disabled={
                          currentSlideIndex >= beamerPresentation.slides.length - 1
                        }
                        onClick={() =>
                          setCurrentSlideIndex((idx) =>
                            Math.min(beamerPresentation.slides.length - 1, idx + 1)
                          )
                        }
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-black flex items-center gap-1 cursor-pointer"
                      >
                        <span>الشريحة التالية</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRevealSlideSolution((v) => !v)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      {revealSlideSolution ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>إخفاء شرائح التصحيح (\pause)</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>إظهار شرائح التصحيح (\pause)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              التبويب 3: الماسح الضوئي الحي عبر الكاميرا (WebRTC OMR & QR Scanner)
          ===================================================================== */}
          {activeTab === "CAMERA_OMR" && (
            <div className="space-y-4">
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-700" />
                    <span>
                      الماسح البصري الحي عبر الكاميرا لأوراق OMR ورموز QR (Pixel-Luminance OMR & QR Reader)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    يعتمد خوارزمية قياس الكثافة الضوئية للبيكسلات (<code dir="ltr">ctx.getImageData</code>) للتمييز الآلي بين الدوائر المظللة والفارغة مع حساب معامل الثقة البصرية وتصدير النقط مباشرة إلى مسار (Massar).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSmartQcmScanner();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-2 shadow-sm cursor-pointer transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>تشغيل الكاميرا الحية وماسح OMR الكامل الآن</span>
                </button>
              </div>

              {/* مختبر معايرة حساسية البيكسلات OMR */}
              <div className="bg-white border border-slate-300 rounded-2xl p-4 space-y-3">
                <div className="font-black text-xs text-slate-900 flex items-center justify-between">
                  <span>
                    مختبر معايرة حساسية التظليل الضوئي (0 = أبيض فارغ · 255 = أسود داكن مظلل):
                  </span>
                  <span className="font-mono text-xs bg-indigo-950 text-amber-300 px-3 py-1 rounded-lg font-black">
                    الاختيار المكتشف: {omrDensityEval.detectedAnswers[1] || "فارغ"} · الثقة:{" "}
                    {omrDensityEval.averageConfidencePct}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" dir="ltr">
                  {(["A", "B", "C", "D"] as const).map((opt) => {
                    const darkness = simulatedBubbleDarkness[opt];
                    const isSelected = omrDensityEval.detectedAnswers[1] === opt;
                    return (
                      <div
                        key={opt}
                        className={`rounded-xl p-3 border space-y-2 ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-xs font-black">
                          <span>Bubble [{opt}]</span>
                          <span>Darkness: {darkness}/255</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={245}
                          value={darkness}
                          onChange={(e) =>
                            setSimulatedBubbleDarkness((prev) => ({
                              ...prev,
                              [opt]: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-indigo-700"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              التبويب 1 و 2: معمارية شرائح الحالة الأربع وعزل التصيير React.memo
          ===================================================================== */}
          {activeTab === "ARCHITECTURE_STORE" && (
            <div className="space-y-4">
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-700" />
                  <span>
                    معمارية السياق التربوي المهيكل (PedagogicalStudioContext — 4 Domain Slices + React.memo Isolation)
                  </span>
                </h3>
                <p className="text-xs text-slate-600">
                  تم تفكيك أكثر من {domainStoreSnapshot.performanceDiagnostics.legacyFlatPropCount} خاصية (Props) في التطبيق إلى 4 شرائح مجال مستقلة ومعزولة الأداء لمنع إعادة التصيير الكامل لورقة A4 (تقليص إعادة التصيير بنسبة{" "}
                  <strong>{domainStoreSnapshot.performanceDiagnostics.estimatedReRenderReductionPct}%</strong>).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="font-black text-indigo-950 flex items-center justify-between">
                    <span>1. شريحة الهوية المؤسساتية (identitySlice)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <pre
                    dir="ltr"
                    className="bg-slate-950 text-cyan-300 rounded-xl p-3 font-mono text-[10.5px] overflow-x-auto"
                  >
                    {JSON.stringify(domainStoreSnapshot.identitySlice, null, 2)}
                  </pre>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="font-black text-indigo-950 flex items-center justify-between">
                    <span>2. شريحة المقرر والأوزان (curriculumSlice)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <pre
                    dir="ltr"
                    className="bg-slate-950 text-amber-300 rounded-xl p-3 font-mono text-[10.5px] overflow-x-auto"
                  >
                    {JSON.stringify(domainStoreSnapshot.curriculumSlice, null, 2)}
                  </pre>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="font-black text-indigo-950 flex items-center justify-between">
                    <span>3. شريحة الطباعة والورقة (printLayoutSlice)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <pre
                    dir="ltr"
                    className="bg-slate-950 text-emerald-300 rounded-xl p-3 font-mono text-[10.5px] overflow-x-auto"
                  >
                    {JSON.stringify(domainStoreSnapshot.printLayoutSlice, null, 2)}
                  </pre>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="font-black text-indigo-950 flex items-center justify-between">
                    <span>4. شريحة الملاحق الديداكتيكية (pedagogicalAnnexesSlice)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <pre
                    dir="ltr"
                    className="bg-slate-950 text-purple-300 rounded-xl p-3 font-mono text-[10.5px] overflow-x-auto"
                  >
                    {JSON.stringify(
                      domainStoreSnapshot.pedagogicalAnnexesSlice,
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
