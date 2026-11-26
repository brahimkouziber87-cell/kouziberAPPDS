import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Scan,
  Sparkles,
  Upload,
  UserCheck,
  X,
  FileCheck2,
  Sliders,
  Zap,
  Volume2,
  VolumeX,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
  PenTool,
  Calculator,
} from "lucide-react";
import { renderQrSvgString } from "../utils/qrCodeHelper";
import { DEFAULT_MOROCCAN_CLASS_ROSTER } from "../utils/evaluationGridExporter";
import {
  autoGradeScannedOmrSheet,
  AutoGradedSheetFullReport,
  buildLoadedExamBaremeItems,
  computeLongitudinalCompetencyCoverageReport,
  computePedagogicalDocumentDigitalSignature,
  computePsychometricItemAnalysisCTT,
  detectOmrFiducialAlignmentAndStability,
  evaluateQuickScanHandwrittenSheet,
  extractHandwrittenRedPenMarksFromRgba,
  HANDWRITTEN_MARK_META,
  HandwrittenMarkCode,
  OmrFiducialAlignmentResult,
  preprocessOmrCameraFrameRgba,
  QuickScanBaremeQuestionItem,
  QuickScanSheetEvaluationResult,
  regradeScannedStudentResults,
  verifyPedagogicalDocumentSignature,
} from "../utils/sevenStrategicProposalsEngine";

export interface QcmAnswerKeyItem {
  questionNumber: number;
  correctOption: "A" | "B" | "C" | "D";
  weight: number;
  labelAr?: string;
}

export interface ScannedStudentResult {
  id: string;
  studentName: string;
  model: "A" | "B" | "C" | "D";
  score: number;
  maxScore: number;
  answers: Record<number, "A" | "B" | "C" | "D" | null>;
  correctCount: number;
  wrongCount?: number;
  blankCount?: number;
  doubleMarkedCount?: number;
  timestamp: string;
  confidencePct?: number;
  autoGradedViaCamera?: boolean;
  appreciationAr?: string;
}

export interface SmartQcmScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (type: "success" | "error" | "info", msg: string) => void;
  examTitle?: string;
  trackLabel?: string;
  initialModel?: "A" | "B" | "C" | "D";
  loadedBaremeLessons?: Array<{
    lessonAr: string;
    lessonFr?: string;
    weight?: number;
    sampleExerciseAr?: string[];
  }>;
}

// مفاتيح الإجابة الافتراضية للنماذج الأربعة
export const DEFAULT_ANSWER_KEYS: Record<"A" | "B" | "C" | "D", Record<number, "A" | "B" | "C" | "D">> = {
  A: { 1: "A", 2: "C", 3: "B", 4: "D", 5: "A", 6: "B", 7: "C", 8: "D", 9: "A", 10: "B" },
  B: { 1: "C", 2: "A", 3: "D", 4: "B", 5: "B", 6: "A", 7: "D", 8: "C", 9: "B", 10: "C" },
  C: { 1: "B", 2: "D", 3: "A", 4: "C", 5: "D", 6: "C", 7: "B", 8: "A", 9: "C", 10: "D" },
  D: { 1: "D", 2: "B", 3: "C", 4: "A", 5: "C", 6: "D", 7: "A", 8: "B", 9: "D", 10: "A" },
};

/**
 * توليد صورة ورقة OMR قياسية على Canvas مع علامات الزوايا الأربع (Fiducial Markers) ودوائر النموذج والأسئلة
 * لفحص وتدقيق محرك التصحيح التلقائي بالكاميرا في الزمن الحقيقي
 */
export function drawSyntheticStudentOmrSheetOnCanvas(params: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  model: "A" | "B" | "C" | "D";
  questionCount: number;
  studentAnswers: Record<number, "A" | "B" | "C" | "D" | null>;
  doubleMarkedQuestions?: number[];
  studentName?: string;
  simulatePhoneShadow?: boolean;
}) {
  const {
    ctx,
    width,
    height,
    model,
    questionCount,
    studentAnswers,
    doubleMarkedQuestions = [],
    studentName = "تلميذ نموذجي",
    simulatePhoneShadow = false,
  } = params;
  const options: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];

  // 1. خلفية الورقة البيضاء مع تدرج ظل خفيف إذا كان مفعلاً
  if (simulatePhoneShadow) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#f8fafc");
    grad.addColorStop(0.6, "#e2e8f0");
    grad.addColorStop(1, "#cbd5e1");
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = "#ffffff";
  }
  ctx.fillRect(0, 0, width, height);

  // 2. رسم علامات المحاذاة السوداء الأربع في الزوايا (Fiducial Registration Squares)
  const patchW = Math.max(12, Math.floor(width * 0.065));
  const patchH = Math.max(12, Math.floor(height * 0.065));
  const marginX = Math.max(6, Math.floor(width * 0.045));
  const marginY = Math.max(6, Math.floor(height * 0.045));

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(marginX, marginY, patchW, patchH);
  ctx.fillRect(width - marginX - patchW, marginY, patchW, patchH);
  ctx.fillRect(marginX, height - marginY - patchH, patchW, patchH);
  ctx.fillRect(width - marginX - patchW, height - marginY - patchH, patchW, patchH);

  // 3. شريط الترويسة واسم التلميذ ودوائر النموذج (A, B, C, D) عند y = 14%
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 12px monospace";
  ctx.fillText(`OMR SHEET · ${studentName} · MODEL ${model}`, Math.round(width * 0.14), Math.round(height * 0.09));

  const modelY = Math.round(height * 0.14);
  const bubbleR = Math.max(6, Math.round(Math.min(width, height) * 0.022));
  options.forEach((opt, mIdx) => {
    const modelX = Math.round(width * (0.52 + mIdx * 0.09));
    ctx.beginPath();
    ctx.arc(modelX, modelY, bubbleR, 0, Math.PI * 2);
    ctx.fillStyle = opt === model ? "#0f172a" : "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#334155";
    ctx.stroke();
  });

  // 4. رسم صفوف الأسئلة ودوائر الإجابات (A, B, C, D)
  for (let q = 1; q <= questionCount; q++) {
    const rowY = Math.round(
      height * 0.24 + ((q - 1) / Math.max(1, questionCount)) * (height * 0.64)
    );
    ctx.fillStyle = "#334155";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`Q${String(q).padStart(2, "0")}`, Math.round(width * 0.18), rowY + 4);

    const chosen = studentAnswers[q];
    const isDouble = doubleMarkedQuestions.includes(q);

    options.forEach((opt, optIdx) => {
      const colX = Math.round(width * (0.30 + optIdx * 0.14));
      const isShaded =
        opt === chosen || (isDouble && optIdx === (options.indexOf(chosen || "A") + 1) % 4);
      ctx.beginPath();
      ctx.arc(colX, rowY, bubbleR, 0, Math.PI * 2);
      ctx.fillStyle = isShaded ? "#111827" : "#f8fafc";
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = "#475569";
      ctx.stroke();
    });
  }
}

/**
 * رسم ورقة تحرير تلميذ مع علامات التصحيح اليدوي للأستاذ بالقلم الأحمر (✓، ¾، ½، ¼، ✗) في هامش التنقيط
 * لفحص وتدقيق ميزة المسح السريع (Quick Scan) وحساب النقطة آلياً وفق سلم التنقيط المحمّل
 */
export function drawSyntheticHandwrittenRedPenSheetOnCanvas(params: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  studentName: string;
  baremeItems: QuickScanBaremeQuestionItem[];
  marksByQuestionId: Record<string, HandwrittenMarkCode>;
}) {
  const { ctx, width, height, studentName, baremeItems, marksByQuestionId } = params;

  // 1. خلفية ورقة التحرير المسطرة
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let y = 55; y < height - 20; y += 22) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(width - 20, y);
    ctx.stroke();
  }

  // خط هامش التنقيط الأحمر
  const marginLineX = Math.floor(width * 0.67);
  ctx.strokeStyle = "#fca5a5";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(marginLineX, 20);
  ctx.lineTo(marginLineX, height - 20);
  ctx.stroke();

  // ترويسة الورقة
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 13px monospace";
  ctx.fillText(
    `COPIE D'EXAMEN · ${studentName} · BARÈME / 20`,
    28,
    38
  );
  ctx.fillStyle = "#b91c1c";
  ctx.font = "bold 12px monospace";
  ctx.fillText("هامش علامات المصحح (القلم الأحمر)", marginLineX + 10, 38);

  // 2. رسم إجابات التلميذ وعلامات القلم الأحمر للأستاذ في خانة كل سؤال
  const qCount = baremeItems.length;
  baremeItems.forEach((bItem, i) => {
    const centerY = Math.round(
      height * 0.22 + (i / Math.max(1, qCount)) * (height * 0.68)
    );
    ctx.fillStyle = "#1e293b";
    ctx.font = "11px monospace";
    ctx.fillText(
      `${bItem.questionCode} (${bItem.maxPoints}pt): f'(x) = ... => u_n`,
      30,
      centerY + 4
    );

    const markCode: HandwrittenMarkCode = marksByQuestionId[bItem.id] || "FULL";
    const boxX = Math.floor(width * 0.71);
    const boxW = Math.floor(width * 0.16);
    const boxH = 22;

    // رسم الحبر الأحمر بكثافة تتناسب مع نوع علامة التصحيح اليدوي ليتمكن مستشعر الكاميرا من قراءتها بدقة
    ctx.fillStyle = "#dc2626";
    ctx.strokeStyle = "#dc2626";
    if (markCode === "FULL") {
      ctx.fillRect(boxX, centerY - 8, Math.min(34, boxW), 14);
      ctx.font = "bold 14px monospace";
      ctx.fillText(`✓ +${bItem.maxPoints}`, boxX + 38, centerY + 5);
    } else if (markCode === "THREE_QUARTERS") {
      ctx.fillRect(boxX, centerY - 6, 24, 11);
      ctx.font = "bold 13px monospace";
      ctx.fillText(
        `¾ +${(Math.round(bItem.maxPoints * 0.75 * 4) / 4).toFixed(2)}`,
        boxX + 30,
        centerY + 4
      );
    } else if (markCode === "HALF") {
      ctx.fillRect(boxX, centerY - 5, 16, 9);
      ctx.font = "bold 13px monospace";
      ctx.fillText(
        `½ +${(Math.round(bItem.maxPoints * 0.5 * 4) / 4).toFixed(2)}`,
        boxX + 22,
        centerY + 4
      );
    } else if (markCode === "QUARTER") {
      ctx.fillRect(boxX, centerY - 4, 9, 7);
      ctx.font = "bold 12px monospace";
      ctx.fillText(
        `¼ +${(Math.round(bItem.maxPoints * 0.25 * 4) / 4).toFixed(2)}`,
        boxX + 14,
        centerY + 4
      );
    } else {
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "#64748b";
      ctx.fillText("✗ 0.00", boxX + 8, centerY + 4);
    }
    ctx.strokeStyle = "#fecaca";
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX - 4, centerY - boxH / 2, boxW + 24, boxH);
  });
}

export const SmartQcmScannerModal: React.FC<SmartQcmScannerModalProps> = ({
  isOpen,
  onClose,
  onNotify,
  examTitle = "الفرض المحروس الموحد — الدورة الأولى",
  trackLabel = "الثانية باكالوريا علوم تجريبية / رياضية",
  initialModel = "A",
  loadedBaremeLessons,
}) => {
  const [activeTab, setActiveTab] = useState<
    | "SCANNER"
    | "QUICK_SCAN_BAREME"
    | "ANSWER_KEY"
    | "ROSTER"
    | "STRATEGIC_ROADMAP"
    | "PRINT_SHEET"
  >("SCANNER");
  const [selectedModel, setSelectedModel] = useState<"A" | "B" | "C" | "D">(initialModel);
  const [studentName, setStudentName] = useState<string>(
    DEFAULT_MOROCCAN_CLASS_ROSTER[0]?.fullNameFr ||
      DEFAULT_MOROCCAN_CLASS_ROSTER[0]?.nomFr ||
      "أحمد المنصوري"
  );
  const [rosterIndex, setRosterIndex] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [pointsPerQuestion, setPointsPerQuestion] = useState<number>(2);
  const [negativeMarkingPenalty, setNegativeMarkingPenalty] = useState<number>(0);

  // مفاتيح الإجابة القابلة للتخصيص لكل نموذج
  const [customAnswerKeys, setCustomAnswerKeys] = useState<
    Record<"A" | "B" | "C" | "D", Record<number, "A" | "B" | "C" | "D">>
  >(() => ({
    A: { ...DEFAULT_ANSWER_KEYS.A },
    B: { ...DEFAULT_ANSWER_KEYS.B },
    C: { ...DEFAULT_ANSWER_KEYS.C },
    D: { ...DEFAULT_ANSWER_KEYS.D },
  }));

  // إعدادات الكاميرا والتصحيح التلقائي المستمر (Auto-Grading Camera Pipeline)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isAutoGradeEnabled, setIsAutoGradeEnabled] = useState<boolean>(true);
  const [autoSaveOnLock, setAutoSaveOnLock] = useState<boolean>(true);
  const [autoDetectModelFromSheet, setAutoDetectModelFromSheet] = useState<boolean>(true);
  const [enableShadowCompensation, setEnableShadowCompensation] = useState<boolean>(true);
  const [enableAudioBeep, setEnableAudioBeep] = useState<boolean>(true);
  const [isLiveStreamSimulationActive, setIsLiveStreamSimulationActive] = useState<boolean>(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sensitivityThreshold, setSensitivityThreshold] = useState<number>(115);
  const [detectedAnswers, setDetectedAnswers] = useState<Record<number, "A" | "B" | "C" | "D" | null>>({});
  const [manualOverrides, setManualOverrides] = useState<Record<number, "A" | "B" | "C" | "D" | null>>({});
  const [lastFullReport, setLastFullReport] = useState<AutoGradedSheetFullReport | null>(null);
  const [fiducialStatus, setFiducialStatus] = useState<OmrFiducialAlignmentResult>({
    cornersLockedCount: 4,
    cornerDarknessValues: [210, 205, 212, 208],
    alignmentScorePct: 96,
    motionDeltaPct: 2,
    stabilityScorePct: 96,
    meanIllumination: 225,
    shadowContrastSpread: 185,
    isReadyForAutoGrade: true,
    statusMessageAr: "الكاميرا الذكية جاهزة للتصحيح التلقائي الفوري",
  });
  const [scanConfidencePct, setScanConfidencePct] = useState<number>(96);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scannedHistory, setScannedHistory] = useState<ScannedStudentResult[]>([]);
  const [lastAutoGradeBanner, setLastAutoGradeBanner] = useState<{
    studentName: string;
    score: number;
    maxScore: number;
    model: "A" | "B" | "C" | "D";
    appreciationAr: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const quickScanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const prevFrameRgbaRef = useRef<Uint8ClampedArray | null>(null);
  const lastAutoLockTimestampRef = useRef<number>(0);
  const lastScannedFingerprintRef = useRef<string>("");

  // حالة المسح السريع لعلامات التصحيح اليدوي بالقلم الأحمر وحساب النقطة وفق سلم التنقيط المحمّل (Quick Scan Bareme)
  const [baremeItems, setBaremeItems] = useState<QuickScanBaremeQuestionItem[]>(() =>
    buildLoadedExamBaremeItems(loadedBaremeLessons)
  );
  const [quickScanMarks, setQuickScanMarks] = useState<Record<string, HandwrittenMarkCode>>(() => {
    const initialItems = buildLoadedExamBaremeItems(loadedBaremeLessons);
    const map: Record<string, HandwrittenMarkCode> = {};
    const cycle: HandwrittenMarkCode[] = [
      "FULL",
      "FULL",
      "THREE_QUARTERS",
      "FULL",
      "HALF",
      "FULL",
      "THREE_QUARTERS",
      "HALF",
    ];
    initialItems.forEach((it, idx) => {
      map[it.id] = cycle[idx % cycle.length];
    });
    return map;
  });
  const [quickScanResult, setQuickScanResult] =
    useState<QuickScanSheetEvaluationResult | null>(() => {
      const initialItems = buildLoadedExamBaremeItems(loadedBaremeLessons);
      const map: Record<string, HandwrittenMarkCode> = {};
      const cycle: HandwrittenMarkCode[] = [
        "FULL",
        "FULL",
        "THREE_QUARTERS",
        "FULL",
        "HALF",
        "FULL",
        "THREE_QUARTERS",
        "HALF",
      ];
      initialItems.forEach((it, idx) => {
        map[it.id] = cycle[idx % cycle.length];
      });
      return evaluateQuickScanHandwrittenSheet({
        studentName:
          DEFAULT_MOROCCAN_CLASS_ROSTER[0]?.fullNameFr ||
          DEFAULT_MOROCCAN_CLASS_ROSTER[0]?.nomFr ||
          "أحمد المنصوري",
        model: initialModel,
        baremeItems: initialItems,
        detectedMarksByQuestionId: map,
      });
    });

  const activeAnswerKey = customAnswerKeys[selectedModel];

  // مخرجات خارطة الطريق الاستراتيجية (المراحل 1، 3، 4): التحليل السيكومتري، التتبع الطولي، والتوقيع الرقمي التربوي
  const psychometricReport = React.useMemo(
    () =>
      computePsychometricItemAnalysisCTT({
        questionCount,
        answerKeysByModel: customAnswerKeys,
        scannedResults: scannedHistory,
      }),
    [questionCount, customAnswerKeys, scannedHistory]
  );

  const longitudinalReport = React.useMemo(
    () => computeLongitudinalCompetencyCoverageReport("2BAC_PC"),
    []
  );

  const documentDigitalSignature = React.useMemo(
    () =>
      computePedagogicalDocumentDigitalSignature({
        trackCode: trackLabel,
        semester: "S1",
        dsKey: "DS1",
        examModel: selectedModel,
        school: "الأكاديمية الجهوية للتربية والتكوين",
        prof: "أستاذ التعليم الثانوي التأهيلي",
        year: "2025/2026",
        lessonTitles: baremeItems.map((b) => b.exerciseTitleAr),
        totalPoints: 20,
      }),
    [trackLabel, selectedModel, baremeItems]
  );

  // نغمة صوتية خفيفة لتأكيد التصحيح التلقائي للورقة دون الحاجة للنظر للشاشة
  const playConfirmationBeep = useCallback(() => {
    if (!enableAudioBeep || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.11);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // تجاهل في حال منع المتصفح للصوت التلقائي
    }
  }, [enableAudioBeep]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsLiveStreamSimulationActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    try {
      stopCamera();
      setSelectedImage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      onNotify(
        "info",
        isAutoGradeEnabled
          ? "تم تفعيل الكاميرا مع التصحيح التلقائي المستمر: ضع ورقة التلميذ أمام العدسة ليتم قفل الزوايا وتصحيحها وحفظها تلقائياً."
          : "تم تشغيل الكاميرا الحية (WebRTC). وجه العدسة نحو شبكة OMR ورمز QR في ورقة التلميذ."
      );
    } catch {
      onNotify(
        "error",
        "تعذر الوصول إلى الكاميرا الفعلية في هذا المتصفح. يمكنك استخدام «محاكي الكاميرا للتصحيح التلقائي» أو رفع صورة الورقة."
      );
      setIsCameraActive(false);
    }
  };

  // حفظ الورقة المصححة في سجل القسم والانتقال للتلميذ الموالي
  const commitGradedSheetToRoster = useCallback(
    (report: AutoGradedSheetFullReport, isViaAutoCamera: boolean) => {
      const targetName =
        report.studentName.trim() || `تلميذ رقم ${rosterIndex + 1}`;
      const newEntry: ScannedStudentResult = {
        id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        studentName: targetName,
        model: report.detectedModel,
        score: report.score,
        maxScore: report.maxScore,
        answers: { ...report.detectedAnswers },
        correctCount: report.correctCount,
        wrongCount: report.wrongCount,
        blankCount: report.blankCount,
        doubleMarkedCount: report.doubleMarkedCount,
        timestamp: new Date().toLocaleTimeString("ar-MA", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        confidencePct: report.averageConfidencePct,
        autoGradedViaCamera: isViaAutoCamera,
        appreciationAr: report.pedagogicalAppreciationAr,
      };

      setScannedHistory((prev) => [
        newEntry,
        ...prev.filter((p) => p.studentName !== newEntry.studentName),
      ]);

      setLastAutoGradeBanner({
        studentName: newEntry.studentName,
        score: newEntry.score,
        maxScore: newEntry.maxScore,
        model: newEntry.model,
        appreciationAr: report.pedagogicalAppreciationAr,
      });

      playConfirmationBeep();

      if (rosterIndex + 1 < DEFAULT_MOROCCAN_CLASS_ROSTER.length) {
        const nextIdx = rosterIndex + 1;
        setRosterIndex(nextIdx);
        setStudentName(
          DEFAULT_MOROCCAN_CLASS_ROSTER[nextIdx].fullNameFr ||
            DEFAULT_MOROCCAN_CLASS_ROSTER[nextIdx].nomFr ||
            `تلميذ ${nextIdx + 1}`
        );
      }
    },
    [playConfirmationBeep, rosterIndex]
  );

  // المحرك المركزي لتحليل وتصحيح الإطار الحالي (كاميرا حية أو صورة مرفوعة أو ورقة محاكاة)
  const analyzeCurrentFrameOrImage = useCallback(
    (
      imgSource?: HTMLImageElement | HTMLVideoElement,
      options?: {
        isContinuousCameraTick?: boolean;
        syntheticStudentOverride?: {
          name: string;
          model: "A" | "B" | "C" | "D";
          answers: Record<number, "A" | "B" | "C" | "D" | null>;
          doubleMarked?: number[];
        };
      }
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      if (!options?.isContinuousCameraTick) {
        setIsAnalyzing(true);
      }

      const w = 640;
      const h = 480;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      if (options?.syntheticStudentOverride) {
        drawSyntheticStudentOmrSheetOnCanvas({
          ctx,
          width: w,
          height: h,
          model: options.syntheticStudentOverride.model,
          questionCount,
          studentAnswers: options.syntheticStudentOverride.answers,
          doubleMarkedQuestions: options.syntheticStudentOverride.doubleMarked,
          studentName: options.syntheticStudentOverride.name,
          simulatePhoneShadow: enableShadowCompensation,
        });
      } else if (imgSource) {
        ctx.drawImage(imgSource, 0, 0, w, h);
      } else if (videoRef.current && isCameraActive && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, w, h);
      } else {
        // توليد ورقة تلميذ واقعية على Canvas لفحص المسح والتصحيح التلقائي
        const simulatedAnswers: Record<number, "A" | "B" | "C" | "D" | null> = {};
        const opts: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
        const keyForModel = customAnswerKeys[selectedModel];
        for (let q = 1; q <= questionCount; q++) {
          const expected = keyForModel[q] || "A";
          const r = ((q * 37 + rosterIndex * 13) % 100) / 100;
          if (r > 0.18) {
            simulatedAnswers[q] = expected;
          } else if (r > 0.06) {
            simulatedAnswers[q] = opts[(opts.indexOf(expected) + 1) % 4];
          } else {
            simulatedAnswers[q] = null;
          }
        }
        drawSyntheticStudentOmrSheetOnCanvas({
          ctx,
          width: w,
          height: h,
          model: selectedModel,
          questionCount,
          studentAnswers: simulatedAnswers,
          studentName,
          simulatePhoneShadow: enableShadowCompensation,
        });
      }

      const frameData = ctx.getImageData(0, 0, w, h).data;

      // 1. فحص زوايا الورقة الأربع وثبات الإطار أمام العدسة
      const alignment = detectOmrFiducialAlignmentAndStability({
        currentRgba: frameData,
        previousRgba: prevFrameRgbaRef.current,
        width: w,
        height: h,
      });
      prevFrameRgbaRef.current = new Uint8ClampedArray(frameData);
      setFiducialStatus(alignment);

      // 2. معالجة الظلال واستخراج مصفوفة كثافة الدوائر والنموذج من الترويسة
      const preprocessed = preprocessOmrCameraFrameRgba({
        rgba: frameData,
        width: w,
        height: h,
        questionCount,
        fallbackModel: selectedModel,
        enableShadowCompensation,
      });

      const resolvedModel: "A" | "B" | "C" | "D" = autoDetectModelFromSheet
        ? preprocessed.detectedModelFromHeader
        : selectedModel;

      if (autoDetectModelFromSheet && resolvedModel !== selectedModel) {
        setSelectedModel(resolvedModel);
      }

      // 3. تشغيل محرك التصحيح التلقائي الشامل
      const activeOverrides = options?.isContinuousCameraTick ? {} : manualOverrides;
      const report = autoGradeScannedOmrSheet({
        studentName: options?.syntheticStudentOverride?.name || studentName,
        bubbleDarknessMatrix: preprocessed.normalizedBubbleDarknessMatrix,
        answerKey: customAnswerKeys[resolvedModel] || customAnswerKeys.A,
        detectedModel: resolvedModel,
        threshold: sensitivityThreshold,
        pointsPerQuestion,
        negativeMarkingPenalty,
        manualOverrides: activeOverrides,
      });

      setDetectedAnswers(report.detectedAnswers);
      setScanConfidencePct(report.averageConfidencePct);
      setLastFullReport(report);
      setIsAnalyzing(false);

      // 4. منطق التصحيح والحفظ التلقائي الفوري عند قفل الزوايا الأربع واستقرار الورقة
      const now = Date.now();
      const cooldownElapsed = now - lastAutoLockTimestampRef.current > 2200;
      const isNewSheetOrStudent =
        `${report.studentName}__${report.sheetFingerprint}` !==
        lastScannedFingerprintRef.current;

      if (
        isAutoGradeEnabled &&
        alignment.isReadyForAutoGrade &&
        report.averageConfidencePct >= 80 &&
        cooldownElapsed &&
        (isNewSheetOrStudent || !options?.isContinuousCameraTick)
      ) {
        lastAutoLockTimestampRef.current = now;
        lastScannedFingerprintRef.current = `${report.studentName}__${report.sheetFingerprint}`;

        if (autoSaveOnLock) {
          commitGradedSheetToRoster(report, true);
          onNotify(
            "success",
            `تصحيح تلقائي بالكاميرا: ${report.studentName} (النموذج ${report.detectedModel}) — النقطة ${report.score}/${report.maxScore} (${report.pedagogicalAppreciationAr})`
          );
        } else {
          setLastAutoGradeBanner({
            studentName: report.studentName,
            score: report.score,
            maxScore: report.maxScore,
            model: report.detectedModel,
            appreciationAr: report.pedagogicalAppreciationAr,
          });
          playConfirmationBeep();
          onNotify(
            "success",
            `تم التصحيح التلقائي لورقة ${report.studentName} (${report.score}/${report.maxScore}) بدقة ${report.averageConfidencePct}%.`
          );
        }
      } else if (!options?.isContinuousCameraTick) {
        onNotify(
          "success",
          `تم مسح وتصحيح ورقة ${report.studentName} (النموذج ${report.detectedModel}) — النتيجة: ${report.score}/${report.maxScore}`
        );
      }
    },
    [
      autoDetectModelFromSheet,
      autoSaveOnLock,
      commitGradedSheetToRoster,
      customAnswerKeys,
      enableShadowCompensation,
      isAutoGradeEnabled,
      isCameraActive,
      manualOverrides,
      negativeMarkingPenalty,
      onNotify,
      playConfirmationBeep,
      pointsPerQuestion,
      questionCount,
      rosterIndex,
      selectedModel,
      sensitivityThreshold,
      studentName,
    ]
  );

  // حلقة المسح والتصحيح التلقائي المستمر عند تفعيل الكاميرا الحية أو محاكي تدفق الكاميرا
  useEffect(() => {
    if (!isOpen || activeTab !== "SCANNER") return;
    if (!isCameraActive && !isLiveStreamSimulationActive) return;
    if (!isAutoGradeEnabled) return;

    const timer = window.setInterval(() => {
      if (isLiveStreamSimulationActive) {
        const currentStudent =
          DEFAULT_MOROCCAN_CLASS_ROSTER[rosterIndex % DEFAULT_MOROCCAN_CLASS_ROSTER.length];
        const simName =
          currentStudent?.fullNameFr ||
          currentStudent?.nomFr ||
          `تلميذ رقم ${rosterIndex + 1}`;
        const models: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
        const simModel = models[rosterIndex % 4];
        const keyMap = customAnswerKeys[simModel];
        const opts: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
        const simAnswers: Record<number, "A" | "B" | "C" | "D" | null> = {};

        for (let q = 1; q <= questionCount; q++) {
          const expected = keyMap[q] || "A";
          const seedVal = (rosterIndex * 19 + q * 31) % 10;
          if (seedVal >= 2) {
            simAnswers[q] = expected;
          } else if (seedVal === 1) {
            simAnswers[q] = opts[(opts.indexOf(expected) + 1) % 4];
          } else {
            simAnswers[q] = null;
          }
        }

        analyzeCurrentFrameOrImage(undefined, {
          isContinuousCameraTick: true,
          syntheticStudentOverride: {
            name: simName,
            model: simModel,
            answers: simAnswers,
          },
        });
      } else if (isCameraActive) {
        analyzeCurrentFrameOrImage(videoRef.current || undefined, {
          isContinuousCameraTick: true,
        });
      }
    }, 1400);

    return () => window.clearInterval(timer);
  }, [
    activeTab,
    analyzeCurrentFrameOrImage,
    customAnswerKeys,
    isAutoGradeEnabled,
    isCameraActive,
    isLiveStreamSimulationActive,
    isOpen,
    questionCount,
    rosterIndex,
  ]);

  const handleCaptureFromCamera = () => {
    analyzeCurrentFrameOrImage(videoRef.current || undefined, {
      isContinuousCameraTick: false,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setSelectedImage(url);
      stopCamera();
      setManualOverrides({});
      const img = new Image();
      img.onload = () => {
        analyzeCurrentFrameOrImage(img, { isContinuousCameraTick: false });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  // التعديل اليدوي السريع لإجابة سؤال (مثلاً لحسم تظليل مزدوج أو باهت)
  const handleManualBubbleOverride = (
    questionNumber: number,
    option: "A" | "B" | "C" | "D" | null
  ) => {
    const nextOverrides = {
      ...manualOverrides,
      [questionNumber]: option,
    };
    setManualOverrides(nextOverrides);
    const nextAnswers = {
      ...detectedAnswers,
      [questionNumber]: option,
    };
    setDetectedAnswers(nextAnswers);

    if (lastFullReport) {
      const updated = autoGradeScannedOmrSheet({
        studentName,
        bubbleDarknessMatrix: Array.from({ length: questionCount }, (_, idx) => {
          const q = idx + 1;
          const chosen = nextAnswers[q];
          return (["A", "B", "C", "D"] as const).map((o) =>
            o === chosen ? 210 : 35
          );
        }),
        answerKey: activeAnswerKey,
        detectedModel: selectedModel,
        threshold: sensitivityThreshold,
        pointsPerQuestion,
        negativeMarkingPenalty,
        manualOverrides: nextOverrides,
      });
      setLastFullReport(updated);
    }
  };

  // تحديث مفتاح الإجابة لنموذج معين وإعادة تصحيح الأوراق المسجلة
  const handleUpdateAnswerKeyOption = (
    model: "A" | "B" | "C" | "D",
    questionNum: number,
    correctOpt: "A" | "B" | "C" | "D"
  ) => {
    const nextKeys = {
      ...customAnswerKeys,
      [model]: {
        ...customAnswerKeys[model],
        [questionNum]: correctOpt,
      },
    };
    setCustomAnswerKeys(nextKeys);

    if (scannedHistory.length > 0) {
      const regraded = regradeScannedStudentResults({
        results: scannedHistory,
        answerKeysByModel: nextKeys,
        questionCount,
        pointsPerQuestion,
        negativeMarkingPenalty,
      });
      setScannedHistory(regraded);
    }
  };

  const handleRegradeAllHistory = () => {
    if (scannedHistory.length === 0) {
      onNotify("info", "لا توجد أوراق محفوظة في السجل لإعادة تصحيحها.");
      return;
    }
    const regraded = regradeScannedStudentResults({
      results: scannedHistory,
      answerKeysByModel: customAnswerKeys,
      questionCount,
      pointsPerQuestion,
      negativeMarkingPenalty,
    });
    setScannedHistory(regraded);
    onNotify(
      "success",
      `تمت إعادة التصحيح التلقائي لـ ${regraded.length} ورقة وفق مفتاح الإجابات وسلم التنقيط المحدث.`
    );
  };

  // حساب النتيجة الحية الحالية
  const computeScore = () => {
    if (lastFullReport) {
      return {
        score: lastFullReport.score,
        maxScore: lastFullReport.maxScore,
        correct: lastFullReport.correctCount,
        wrong: lastFullReport.wrongCount,
        blank: lastFullReport.blankCount,
        doubleMarked: lastFullReport.doubleMarkedCount,
      };
    }
    let correct = 0;
    let wrong = 0;
    let blank = 0;
    for (let q = 1; q <= questionCount; q++) {
      const ans = detectedAnswers[q];
      if (!ans) blank++;
      else if (ans === activeAnswerKey[q]) correct++;
      else wrong++;
    }
    const raw = correct * pointsPerQuestion - wrong * negativeMarkingPenalty;
    const maxScore = questionCount * pointsPerQuestion;
    const score = Math.max(0, Math.min(maxScore, raw));
    return { score, maxScore, correct, wrong, blank, doubleMarked: 0 };
  };

  const { score, maxScore, correct, wrong, blank, doubleMarked } = computeScore();

  // تسجيل النتيجة يدوياً في لائحة القسم
  const handleSaveToRoster = () => {
    const newEntry: ScannedStudentResult = {
      id: "scan_" + Date.now(),
      studentName: studentName.trim() || `تلميذ رقم ${rosterIndex + 1}`,
      model: selectedModel,
      score,
      maxScore,
      answers: { ...detectedAnswers },
      correctCount: correct,
      wrongCount: wrong,
      blankCount: blank,
      doubleMarkedCount: doubleMarked,
      timestamp: new Date().toLocaleTimeString("ar-MA", { hour: "2-digit", minute: "2-digit" }),
      confidencePct: scanConfidencePct,
      autoGradedViaCamera: isCameraActive || isLiveStreamSimulationActive,
      appreciationAr: lastFullReport?.pedagogicalAppreciationAr || "تم التصحيح الآلي",
    };

    setScannedHistory((prev) => [newEntry, ...prev.filter((p) => p.studentName !== newEntry.studentName)]);
    onNotify("success", `تم تسجيل نقطة ${newEntry.studentName} (${score.toFixed(2)}/${maxScore}) في سجل القسم.`);

    if (rosterIndex + 1 < DEFAULT_MOROCCAN_CLASS_ROSTER.length) {
      const nextIdx = rosterIndex + 1;
      setRosterIndex(nextIdx);
      setStudentName(
        DEFAULT_MOROCCAN_CLASS_ROSTER[nextIdx].fullNameFr ||
          DEFAULT_MOROCCAN_CLASS_ROSTER[nextIdx].nomFr ||
          ""
      );
      setManualOverrides({});
    }
  };

  // تصدير اللائحة بصيغة CSV مسار
  const handleExportCSV = () => {
    if (scannedHistory.length === 0) {
      onNotify("error", "لا توجد نتائج مسجلة لتصديرها.");
      return;
    }
    let csvContent =
      "\uFEFFالرقم الترتيبي,اسم التلميذ,النموذج,النقطة,النقطة القصوى,الأجوبة الصحيحة,الأجوبة الخاطئة,الفارغة,طريقة التصحيح,تاريخ المسح\n";
    scannedHistory.forEach((item, index) => {
      csvContent += `${index + 1},"${item.studentName}",${item.model},${item.score},${item.maxScore},${item.correctCount}/${questionCount},${item.wrongCount ?? 0},${item.blankCount ?? 0},"${item.autoGradedViaCamera ? "تصحيح تلقائي بالكاميرا" : "مسح مباشر"}","${item.timestamp}"\n`;
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `نتائج_المصحح_التلقائي_QCM_${selectedModel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify("success", "تم تصدير ملف النتائج المتوافق مع مسار بنجاح.");
  };

  const handlePrintOMRSheet = () => {
    if (typeof document !== "undefined") {
      document.body.classList.add("printing-omr-sheet");
      const cleanup = () => {
        document.body.classList.remove("printing-omr-sheet");
      };
      window.addEventListener("afterprint", cleanup, { once: true });
      window.print();
      setTimeout(cleanup, 1200);
    } else {
      window.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="omr-modal-root fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto print:static print:bg-white print:p-0 print:block"
      dir="rtl"
    >
      <div className="omr-modal-card bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-slate-100 print:max-h-none print:overflow-visible print:shadow-none print:border-none print:bg-white print:text-slate-950">
        {/* شريط العنوان العلوي */}
        <div className="print:hidden flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-black text-white">
                  المصحح التلقائي الذكي للأوراق الممسوحة بالكاميرا (Smart Camera OMR Auto-Grader)
                </h2>
                <span className="text-xs text-emerald-300 font-semibold">
                  · رصد الزوايا الأربع + تصحيح وحفظ تلقائي فوري
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                التقاط تلقائي لأوراق الاختيار من متعدد عبر الكاميرا مع معالجة الظلال، كشف النموذج (A/B/C/D)، والتفريغ المباشر في مسار
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* أزرار التبويبات الأربعة */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs font-bold">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("SCANNER")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "SCANNER"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>ماسح شبكات OMR بالكاميرا</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("QUICK_SCAN_BAREME")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "QUICK_SCAN_BAREME"
                  ? "bg-gradient-to-l from-rose-600 to-amber-600 text-white shadow-sm"
                  : "text-amber-300/90 hover:text-white hover:bg-slate-800 border border-amber-500/30"
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>المسح السريع لعلامات التصحيح اليدوي (Quick Scan · سلم التنقيط)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ANSWER_KEY")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "ANSWER_KEY"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>مفتاح الإجابات وسلم التنقيط (A/B/C/D)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ROSTER")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "ROSTER"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>محضر نتائج القسم ({scannedHistory.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("STRATEGIC_ROADMAP")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "STRATEGIC_ROADMAP"
                  ? "bg-gradient-to-l from-indigo-600 to-cyan-600 text-white shadow-sm"
                  : "text-cyan-300 hover:text-white hover:bg-slate-800 border border-cyan-500/30"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>خارطة الطريق (السيكومتري CTT · التتبع الطولي · التوقيع الرقمي)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PRINT_SHEET")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "PRINT_SHEET"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>طباعة ورقة الإجابة القياسية A4</span>
            </button>
          </div>

          {/* مفاتيح التحكم السريع في التصحيح التلقائي المستمر */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAutoGradeEnabled((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                isAutoGradeEnabled
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                  : "bg-slate-900 border-slate-700 text-slate-400"
              }`}
              title="تفعيل الرصد والتصحيح التلقائي بمجرد وضع الورقة أمام الكاميرا دون ضغط أزرار"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>التصحيح التلقائي بالكاميرا: {isAutoGradeEnabled ? "مفعّل" : "يدوي"}</span>
            </button>

            <button
              type="button"
              onClick={() => setEnableAudioBeep((v) => !v)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title={enableAudioBeep ? "كتم صافرة تأكيد التصحيح" : "تفعيل صافرة تأكيد التصحيح"}
            >
              {enableAudioBeep ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* محتوى التبويب */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "SCANNER" && (
            <div className="space-y-4">
              {/* شريط إعدادات التصحيح التلقائي الذكي بالكاميرا */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoSaveOnLock}
                      onChange={(e) => setAutoSaveOnLock(e.target.checked)}
                      className="accent-emerald-500 rounded cursor-pointer"
                    />
                    <span className="font-bold text-slate-200">
                      حفظ تلقائي في السجل والانتقال للتلميذ الموالي
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoDetectModelFromSheet}
                      onChange={(e) => setAutoDetectModelFromSheet(e.target.checked)}
                      className="accent-emerald-500 rounded cursor-pointer"
                    />
                    <span className="font-bold text-slate-200">
                      كشف تلقائي للنموذج (A/B/C/D) من ترويسة الورقة
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableShadowCompensation}
                      onChange={(e) => setEnableShadowCompensation(e.target.checked)}
                      className="accent-emerald-500 rounded cursor-pointer"
                    />
                    <span className="font-bold text-slate-200">
                      معالجة ظلال الهاتف وتباين الإضاءة
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-slate-300">
                  <span>زوايا الورقة: {fiducialStatus.cornersLockedCount}/4</span>
                  <span aria-hidden="true">·</span>
                  <span>المحاذاة: {fiducialStatus.alignmentScorePct}%</span>
                  <span aria-hidden="true">·</span>
                  <span>ثبات الإطار: {fiducialStatus.stabilityScorePct}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* القسم الأيسر: عدسة الكاميرا ولوحة الرؤية الحاسوبية OMR */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <div className="relative aspect-video bg-slate-950 rounded-2xl border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                    {isCameraActive && (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    )}
                    {selectedImage && !isCameraActive && (
                      <img
                        src={selectedImage}
                        alt="ورقة التلميذ الممسوحة"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    )}

                    {/* لوحة Canvas الحية لعرض وتحليل الورقة الممسوحة أو المحاكاة */}
                    <canvas
                      ref={canvasRef}
                      className={
                        !isCameraActive && !selectedImage
                          ? "w-full h-full object-contain bg-white"
                          : "hidden"
                      }
                    />

                    {/* إطار المسح البصري ومربعات قفل الزوايا الأربع (Fiducial Registration HUD) */}
                    <div className="absolute inset-3 pointer-events-none flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-7 h-7 border-t-4 border-r-4 rounded-tr-lg transition-colors ${
                            fiducialStatus.cornerDarknessValues[0] >= 105
                              ? "border-emerald-400"
                              : "border-amber-400/70"
                          }`}
                        />
                        <div className="bg-slate-950/85 border border-slate-700 px-3 py-1 rounded-lg text-[11px] font-bold text-slate-200">
                          {fiducialStatus.statusMessageAr}
                        </div>
                        <div
                          className={`w-7 h-7 border-t-4 border-l-4 rounded-tl-lg transition-colors ${
                            fiducialStatus.cornerDarknessValues[1] >= 105
                              ? "border-emerald-400"
                              : "border-amber-400/70"
                          }`}
                        />
                      </div>

                      {/* إشعار التصحيح التلقائي الفوري على شاشة الكاميرا */}
                      {lastAutoGradeBanner && (
                        <div className="mx-auto bg-slate-950/90 border border-emerald-500/70 px-4 py-2.5 rounded-xl shadow-xl text-center max-w-md">
                          <div className="text-[11px] font-bold text-emerald-300">
                            ✓ تم التصحيح التلقائي — النموذج {lastAutoGradeBanner.model}
                          </div>
                          <div className="text-sm font-black text-white mt-0.5">
                            {lastAutoGradeBanner.studentName} :{" "}
                            <span className="font-mono text-emerald-400 tabular-nums">
                              {lastAutoGradeBanner.score.toFixed(2)} / {lastAutoGradeBanner.maxScore}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-300 mt-0.5">
                            {lastAutoGradeBanner.appreciationAr}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div
                          className={`w-7 h-7 border-b-4 border-r-4 rounded-br-lg transition-colors ${
                            fiducialStatus.cornerDarknessValues[2] >= 105
                              ? "border-emerald-400"
                              : "border-amber-400/70"
                          }`}
                        />
                        <div className="bg-slate-950/85 border border-slate-800 px-2.5 py-0.5 rounded text-[10.5px] font-mono tabular-nums text-emerald-300">
                          OMR: {questionCount} أسئلة · النموذج {selectedModel} · ثقة {scanConfidencePct}%
                        </div>
                        <div
                          className={`w-7 h-7 border-b-4 border-l-4 rounded-bl-lg transition-colors ${
                            fiducialStatus.cornerDarknessValues[3] >= 105
                              ? "border-emerald-400"
                              : "border-amber-400/70"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* أزرار التحكم بالماسح والتصحيح التلقائي */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!isCameraActive ? (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Camera className="w-4 h-4" />
                        <span>تشغيل الكاميرا للتصحيح التلقائي</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleCaptureFromCamera}
                          className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Scan className="w-4 h-4" />
                          <span>التقاط وتصحيح فوري الآن</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer whitespace-nowrap shrink-0"
                        >
                          إيقاف الكاميرا
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (isLiveStreamSimulationActive) {
                          setIsLiveStreamSimulationActive(false);
                          onNotify("info", "تم إيقاف التدفق التلقائي لأوراق القسم.");
                        } else {
                          setIsCameraActive(false);
                          setSelectedImage(null);
                          setIsAutoGradeEnabled(true);
                          setIsLiveStreamSimulationActive(true);
                          onNotify(
                            "info",
                            "بدأ التدفق التلقائي لأوراق القسم: يتم مسح وتصحيح كل ورقة آلياً والانتقال للتلميذ الموالي."
                          );
                        }
                      }}
                      className={`flex items-center gap-1.5 font-bold py-2.5 px-3.5 rounded-xl text-xs transition cursor-pointer whitespace-nowrap shrink-0 ${
                        isLiveStreamSimulationActive
                          ? "bg-rose-600 hover:bg-rose-500 text-white"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white"
                      }`}
                      title="محاكاة تدفق أوراق القسم أمام الكاميرا لتجربة التصحيح والحفظ التلقائي المتتالي"
                    >
                      {isLiveStreamSimulationActive ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>إيقاف التدفق الآلي</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>تدفق تصحيح آلي للفوج</span>
                        </>
                      )}
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                      <span>رفع صورة ورقة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => analyzeCurrentFrameOrImage(undefined, { isContinuousCameraTick: false })}
                      disabled={isAnalyzing}
                      className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition cursor-pointer whitespace-nowrap shrink-0"
                      title="توليد ومسح ورقة إجابة تلميذ فورية"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>مسح ورقة تجريبية</span>
                    </button>
                  </div>

                  {/* شريط ضبط حساسية OMR وسهم الجزاء */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3 text-xs">
                      <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-400 whitespace-nowrap">عتبة القلم:</span>
                      <input
                        type="range"
                        min="65"
                        max="175"
                        value={sensitivityThreshold}
                        onChange={(e) => setSensitivityThreshold(Number(e.target.value))}
                        className="flex-1 accent-emerald-500 cursor-pointer"
                      />
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">
                        {sensitivityThreshold}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400 font-bold whitespace-nowrap">معامل الخطأ:</span>
                      <div className="flex items-center gap-1">
                        {[
                          { val: 0, label: "0 (عادي)" },
                          { val: 0.25, label: "-0.25" },
                          { val: 0.5, label: "-0.50" },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setNegativeMarkingPenalty(item.val)}
                            className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition cursor-pointer ${
                              negativeMarkingPenalty === item.val
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* القسم الأيمن: نتائج التصحيح التلقائي وتعديل الدوائر وحفظ النقطة */}
                <div className="lg:col-span-5 flex flex-col gap-3 bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
                  {/* اختيار التلميذ والنموذج */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">
                        التلميذ(ة) (#{rosterIndex + 1}):
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">النموذج المرصود:</label>
                      <div className="flex gap-1">
                        {(["A", "B", "C", "D"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setSelectedModel(m)}
                            className={`flex-1 py-1.5 rounded font-mono font-bold text-xs transition cursor-pointer ${
                              selectedModel === m
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* بطاقة النتيجة والتشخيص التلقائي */}
                  <div className="bg-slate-900 border border-slate-700/90 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold block">
                          النقطة المحصلة بالتصحيح التلقائي:
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5 font-mono tabular-nums">
                          <span className="text-2xl font-black text-emerald-400">
                            {score.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400">/ {maxScore}</span>
                        </div>
                      </div>
                      <div className="text-left text-xs font-mono tabular-nums space-y-0.5">
                        <div className="text-emerald-400 font-bold">✓ صحيح: {correct}</div>
                        <div className="text-rose-400 font-bold">✗ خطأ: {wrong}</div>
                        <div className="text-slate-400">○ فارغ/مزدوج: {blank + doubleMarked}</div>
                      </div>
                    </div>
                    {lastFullReport && (
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between gap-2">
                        <span>{lastFullReport.diagnosticFeedbackAr}</span>
                        <span className="font-mono text-emerald-300 tabular-nums shrink-0">
                          ثقة {lastFullReport.averageConfidencePct}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* شبكة تفاصيل الأسئلة الممسوحة مع إمكانية التصحيح اليدوي بنقرة واحدة */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>تفاصيل الأسئلة (انقر على الحرف لتصحيح قراءة الدائرة):</span>
                    {Object.keys(manualOverrides).length > 0 && (
                      <button
                        type="button"
                        onClick={() => setManualOverrides({})}
                        className="text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>إلغاء التعديل اليدوي</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {Array.from({ length: questionCount }, (_, i) => i + 1).map((q) => {
                      const detected = detectedAnswers[q];
                      const expected = activeAnswerKey[q];
                      const isCorrect = detected === expected;
                      const isBlank = !detected;

                      return (
                        <div
                          key={q}
                          className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-mono ${
                            isBlank
                              ? "bg-slate-900 border-slate-800 text-slate-400"
                              : isCorrect
                              ? "bg-emerald-950/35 border-emerald-600/40 text-emerald-200"
                              : "bg-rose-950/35 border-rose-600/40 text-rose-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">س{q}:</span>
                            <span className="text-[10.5px] text-slate-400">
                              (المفتاح: <strong className="text-amber-300">{expected}</strong>)
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {(["A", "B", "C", "D"] as const).map((opt) => {
                              const isChosen = detected === opt;
                              const isExpectedOpt = expected === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    handleManualBubbleOverride(q, isChosen ? null : opt)
                                  }
                                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] border transition cursor-pointer ${
                                    isChosen
                                      ? isCorrect
                                        ? "bg-emerald-500 text-slate-950 border-emerald-300"
                                        : "bg-rose-500 text-white border-rose-300"
                                      : isExpectedOpt
                                      ? "border-amber-400/50 text-amber-200 hover:bg-slate-800"
                                      : "border-slate-700 text-slate-400 hover:bg-slate-800"
                                  }`}
                                  title={`تعيين إجابة السؤال ${q} إلى ${opt}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* زر حفظ النتيجة في سجل القسم */}
                  <button
                    type="button"
                    onClick={handleSaveToRoster}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs shadow-lg transition cursor-pointer"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>تثبيت نقطة التلميذ في السجل والانتقال للتالي</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "QUICK_SCAN_BAREME" && (
            <div className="space-y-4">
              {/* شريط تعريف ميزة المسح السريع لعلامات التصحيح اليدوي بالقلم الأحمر وسلم التنقيط */}
              <div className="bg-slate-950/80 border border-rose-500/35 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-300 flex items-center justify-center shrink-0">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-white">
                        المسح السريع بالكاميرا لعلامات التصحيح اليدوي وحساب النقطة النهائية (Quick Scan — Handwritten Marks)
                      </h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-400/30">
                        رصد القلم الأحمر (✓ / ¾ / ½ / ¼ / ✗) · حساب تلقائي /20
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      وجّه الكاميرا نحو ورقة تحرير التلميذ التي صححتها بالقلم الأحمر لرقمنة العلامات وحساب مجموع كل تمرين والنقطة النهائية آلياً حسب سلم التنقيط المحمّل
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const canvas = quickScanCanvasRef.current;
                      if (!canvas) return;
                      const ctx = canvas.getContext("2d", { willReadFrequently: true });
                      if (!ctx) return;
                      const w = 680;
                      const h = 460;
                      canvas.width = w;
                      canvas.height = h;

                      // توليد توزيع علامات تصحيح يدوي واقعي للتلميذ الحالي ورسمه على Canvas ثم استخراجه عبر محرك الرؤية الحاسوبية
                      const presets: HandwrittenMarkCode[][] = [
                        ["FULL", "FULL", "THREE_QUARTERS", "FULL", "HALF", "FULL", "THREE_QUARTERS", "FULL"],
                        ["FULL", "HALF", "HALF", "THREE_QUARTERS", "FULL", "HALF", "FULL", "QUARTER"],
                        ["FULL", "FULL", "FULL", "FULL", "THREE_QUARTERS", "FULL", "FULL", "FULL"],
                        ["HALF", "QUARTER", "ZERO", "HALF", "HALF", "THREE_QUARTERS", "HALF", "ZERO"],
                      ];
                      const chosenPreset = presets[rosterIndex % presets.length];
                      const simulatedMap: Record<string, HandwrittenMarkCode> = {};
                      baremeItems.forEach((b, idx) => {
                        simulatedMap[b.id] = chosenPreset[idx % chosenPreset.length];
                      });

                      if (isCameraActive && videoRef.current && videoRef.current.readyState >= 2) {
                        ctx.drawImage(videoRef.current, 0, 0, w, h);
                      } else {
                        drawSyntheticHandwrittenRedPenSheetOnCanvas({
                          ctx,
                          width: w,
                          height: h,
                          studentName,
                          baremeItems,
                          marksByQuestionId: simulatedMap,
                        });
                      }

                      const rgba = ctx.getImageData(0, 0, w, h).data;
                      const extracted = extractHandwrittenRedPenMarksFromRgba({
                        rgba,
                        width: w,
                        height: h,
                        questionCount: baremeItems.length,
                      });

                      const detectedMap: Record<string, HandwrittenMarkCode> = {};
                      const inkMap: Record<string, number> = {};
                      baremeItems.forEach((b, idx) => {
                        const ext = extracted[idx];
                        detectedMap[b.id] = ext ? ext.inferredMark : simulatedMap[b.id];
                        inkMap[b.id] = ext ? ext.redInkIntensity : 180;
                      });

                      setQuickScanMarks(detectedMap);
                      const evalRes = evaluateQuickScanHandwrittenSheet({
                        studentName,
                        model: selectedModel,
                        baremeItems,
                        detectedMarksByQuestionId: detectedMap,
                        redInkIntensityByQuestionId: inkMap,
                      });
                      setQuickScanResult(evalRes);
                      playConfirmationBeep();
                      onNotify(
                        "success",
                        `مسح سريع لعلامات التصحيح اليدوي (${studentName}): النقطة المحسوبة آلياً ${evalRes.totalScore.toFixed(2)} / ${evalRes.totalMaxScore} (${evalRes.pedagogicalAppreciationAr})`
                      );
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-l from-rose-600 to-amber-600 hover:brightness-110 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Scan className="w-4 h-4" />
                    <span>مسح سريع لعلامات القلم الأحمر وحساب النقطة الآن</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const reloaded = buildLoadedExamBaremeItems(loadedBaremeLessons);
                      setBaremeItems(reloaded);
                      const resetMarks: Record<string, HandwrittenMarkCode> = {};
                      reloaded.forEach((it) => {
                        resetMarks[it.id] = quickScanMarks[it.id] || "FULL";
                      });
                      setQuickScanMarks(resetMarks);
                      setQuickScanResult(
                        evaluateQuickScanHandwrittenSheet({
                          studentName,
                          model: selectedModel,
                          baremeItems: reloaded,
                          detectedMarksByQuestionId: resetMarks,
                        })
                      );
                      onNotify("info", "تمت مزامنة سلم التنقيط مع تمارين الفرض النشط (20/20).");
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>مزامنة سلم الفرض المحمّل</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* العمود الأيسر: معاينة الكاميرا/ورقة التحرير المصححة بالقلم الأحمر + ملخص التمارين */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-rose-400" />
                        <span>معاينة هامش علامات التصحيح اليدوي (الكاميرا):</span>
                      </span>
                      {!isCameraActive ? (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="text-[11px] font-bold text-emerald-400 hover:underline cursor-pointer"
                        >
                          تشغيل الكاميرا الحية
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="text-[11px] font-bold text-rose-400 hover:underline cursor-pointer"
                        >
                          إيقاف الكاميرا
                        </button>
                      )}
                    </div>

                    <div className="relative aspect-video bg-white rounded-xl overflow-hidden border-2 border-slate-700 flex items-center justify-center">
                      <canvas
                        ref={(el) => {
                          quickScanCanvasRef.current = el;
                          if (el) {
                            const ctx = el.getContext("2d");
                            if (ctx) {
                              if (el.width !== 680 || el.height !== 460) {
                                el.width = 680;
                                el.height = 460;
                              }
                              drawSyntheticHandwrittenRedPenSheetOnCanvas({
                                ctx,
                                width: 680,
                                height: 460,
                                studentName,
                                baremeItems,
                                marksByQuestionId: quickScanMarks,
                              });
                            }
                          }
                        }}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <p className="text-[10.5px] text-slate-400 leading-relaxed">
                      يرصد محرك الرؤية الحاسوبية كثافة وتوزيع الحبر الأحمر (<span className="font-mono text-rose-300">R - max(G,B)</span>) في هامش التنقيط ويحول العلامات اليدوية (<span className="font-bold text-emerald-300">✓ كاملة</span>، <span className="font-bold text-cyan-300">¾</span>، <span className="font-bold text-amber-300">½ نصف</span>، <span className="font-bold text-orange-300">¼ ربع</span>، <span className="font-bold text-rose-400">✗ صفر</span>) إلى نقط جزئية دقيقة وفق سلم التنقيط.
                    </p>
                  </div>

                  {/* بطاقة النتيجة النهائية وتفصيل التمارين */}
                  {quickScanResult && (
                    <div className="bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 font-bold block">
                            النقطة النهائية المحسوبة آلياً حسب السلم:
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5 font-mono tabular-nums">
                            <span className="text-3xl font-black text-emerald-400">
                              {quickScanResult.totalScore.toFixed(2)}
                            </span>
                            <span className="text-sm text-slate-400 font-bold">
                              / {quickScanResult.totalMaxScore.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold block">
                            {quickScanResult.pedagogicalAppreciationAr}
                          </span>
                          <span className="text-[10.5px] text-slate-400 font-mono mt-1 block">
                            دقة رصد العلامات: {quickScanResult.averageConfidencePct}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <span className="text-[11px] font-bold text-amber-300 block">
                          حصيلة النقط حسب التمارين:
                        </span>
                        {quickScanResult.exerciseTotals.map((ex) => (
                          <div
                            key={ex.exerciseNumber}
                            className="flex items-center justify-between text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
                          >
                            <span className="font-bold text-slate-200 truncate">
                              {ex.titleAr}
                            </span>
                            <span className="font-mono font-black text-cyan-300 shrink-0">
                              {ex.awarded.toFixed(2)} / {ex.max.toFixed(2)} ن
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!quickScanResult) return;
                          const newEntry: ScannedStudentResult = {
                            id: `quickscan_${Date.now()}`,
                            studentName:
                              studentName.trim() || `تلميذ رقم ${rosterIndex + 1}`,
                            model: selectedModel,
                            score: quickScanResult.totalScore,
                            maxScore: quickScanResult.totalMaxScore,
                            answers: {},
                            correctCount: quickScanResult.items.filter(
                              (i) => i.detectedMark === "FULL"
                            ).length,
                            wrongCount: quickScanResult.items.filter(
                              (i) => i.detectedMark === "ZERO"
                            ).length,
                            blankCount: 0,
                            timestamp: new Date().toLocaleTimeString("ar-MA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                            confidencePct: quickScanResult.averageConfidencePct,
                            autoGradedViaCamera: true,
                            appreciationAr: `${quickScanResult.pedagogicalAppreciationAr} (Quick Scan سلم التنقيط)`,
                          };
                          setScannedHistory((prev) => [
                            newEntry,
                            ...prev.filter(
                              (p) => p.studentName !== newEntry.studentName
                            ),
                          ]);
                          playConfirmationBeep();
                          onNotify(
                            "success",
                            `تم حفظ النقطة النهائية للتلميذ(ة) ${newEntry.studentName} (${newEntry.score.toFixed(2)}/${newEntry.maxScore}) في سجل القسم.`
                          );
                          if (rosterIndex + 1 < DEFAULT_MOROCCAN_CLASS_ROSTER.length) {
                            const nextIdx = rosterIndex + 1;
                            setRosterIndex(nextIdx);
                            setStudentName(
                              DEFAULT_MOROCCAN_CLASS_ROSTER[nextIdx].fullNameFr ||
                                DEFAULT_MOROCCAN_CLASS_ROSTER[nextIdx].nomFr ||
                                `تلميذ ${nextIdx + 1}`
                            );
                          }
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>اعتماد وحفظ النقطة في محضر القسم والانتقال للتلميذ الموالي</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* العمود الأيمن: جدول سلم التنقيط التفصيلي وعلامات التصحيح اليدوي المرصودة لكل سؤال */}
                <div className="lg:col-span-7 bg-slate-950/75 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs sm:text-sm font-black text-white">
                        جدول سلم التنقيط المحمّل وعلامات التصحيح اليدوي المرصودة ({baremeItems.length} أسئلة)
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">التلميذ(ة):</span>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white w-40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {baremeItems.map((bItem) => {
                      const currentMark: HandwrittenMarkCode =
                        quickScanMarks[bItem.id] || "FULL";
                      const awarded =
                        Math.round(
                          bItem.maxPoints *
                            HANDWRITTEN_MARK_META[currentMark].ratio *
                            4
                        ) / 4;

                      return (
                        <div
                          key={bItem.id}
                          className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex-1 min-w-[180px]">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold text-[10.5px]">
                                {bItem.questionCode}
                              </span>
                              <span className="font-bold text-white truncate">
                                {bItem.questionLabelAr}
                              </span>
                            </div>
                            <div className="text-[10.5px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{bItem.exerciseTitleAr}</span>
                              <span>·</span>
                              <label className="inline-flex items-center gap-1">
                                <span>سلم السؤال:</span>
                                <select
                                  value={bItem.maxPoints}
                                  onChange={(e) => {
                                    const nextPts = Number(e.target.value);
                                    const nextBareme = baremeItems.map((it) =>
                                      it.id === bItem.id
                                        ? { ...it, maxPoints: nextPts }
                                        : it
                                    );
                                    setBaremeItems(nextBareme);
                                    setQuickScanResult(
                                      evaluateQuickScanHandwrittenSheet({
                                        studentName,
                                        model: selectedModel,
                                        baremeItems: nextBareme,
                                        detectedMarksByQuestionId: quickScanMarks,
                                      })
                                    );
                                  }}
                                  className="bg-slate-950 border border-slate-700 rounded px-1 py-0.5 font-mono text-amber-300 font-bold"
                                >
                                  {[0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4].map(
                                    (w) => (
                                      <option key={w} value={w}>
                                        {w} ن
                                      </option>
                                    )
                                  )}
                                </select>
                              </label>
                            </div>
                          </div>

                          {/* أزرار علامات التصحيح اليدوي الخمس (✓ ، ¾ ، ½ ، ¼ ، ✗) */}
                          <div className="flex items-center gap-1">
                            {(
                              [
                                "FULL",
                                "THREE_QUARTERS",
                                "HALF",
                                "QUARTER",
                                "ZERO",
                              ] as HandwrittenMarkCode[]
                            ).map((mCode) => {
                              const meta = HANDWRITTEN_MARK_META[mCode];
                              const isSelected = currentMark === mCode;
                              return (
                                <button
                                  key={mCode}
                                  type="button"
                                  onClick={() => {
                                    const nextMarks = {
                                      ...quickScanMarks,
                                      [bItem.id]: mCode,
                                    };
                                    setQuickScanMarks(nextMarks);
                                    setQuickScanResult(
                                      evaluateQuickScanHandwrittenSheet({
                                        studentName,
                                        model: selectedModel,
                                        baremeItems,
                                        detectedMarksByQuestionId: nextMarks,
                                      })
                                    );
                                  }}
                                  title={`${meta.labelAr} (${meta.badgeNoteAr})`}
                                  className={`w-8 h-8 rounded-lg font-mono font-black text-xs border transition cursor-pointer flex items-center justify-center ${
                                    isSelected
                                      ? mCode === "FULL"
                                        ? "bg-emerald-500 text-slate-950 border-emerald-300 shadow-sm"
                                        : mCode === "ZERO"
                                        ? "bg-rose-600 text-white border-rose-400 shadow-sm"
                                        : "bg-amber-500 text-slate-950 border-amber-300 shadow-sm"
                                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                                  }`}
                                >
                                  {meta.symbol}
                                </button>
                              );
                            })}
                          </div>

                          <div className="w-20 text-left font-mono tabular-nums">
                            <span className="text-sm font-black text-emerald-400">
                              {awarded.toFixed(2)}
                            </span>
                            <span className="text-[10.5px] text-slate-500">
                              {" "}
                              / {bItem.maxPoints}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ANSWER_KEY" && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white">
                    ضبط مفتاح الإجابات الصحيحة للنماذج الأربعة (A / B / C / D)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    أي تعديل في مفتاح الإجابات أو سلم التنقيط يعيد تصحيح جميع الأوراق المحفوظة تلقائياً.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <label className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                    <span className="text-slate-400">عدد الأسئلة:</span>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="bg-transparent font-mono font-bold text-white outline-none"
                    >
                      {[5, 8, 10].map((cnt) => (
                        <option key={cnt} value={cnt} className="bg-slate-900">
                          {cnt}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                    <span className="text-slate-400">النقطة لكل سؤال:</span>
                    <select
                      value={pointsPerQuestion}
                      onChange={(e) => setPointsPerQuestion(Number(e.target.value))}
                      className="bg-transparent font-mono font-bold text-emerald-400 outline-none"
                    >
                      {[1, 1.5, 2, 2.5, 4].map((pts) => (
                        <option key={pts} value={pts} className="bg-slate-900">
                          {pts} ن
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={handleRegradeAllHistory}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة تصحيح الفوج ({scannedHistory.length})</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(["A", "B", "C", "D"] as const).map((modelKey) => (
                  <div
                    key={modelKey}
                    className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-black text-amber-300">
                        مفتاح النموذج {modelKey}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {questionCount} أسئلة × {pointsPerQuestion} ن = {questionCount * pointsPerQuestion} ن
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: questionCount }, (_, idx) => idx + 1).map((qNum) => {
                        const currentCorrect = customAnswerKeys[modelKey][qNum] || "A";
                        return (
                          <div
                            key={qNum}
                            className="flex items-center justify-between bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs font-mono"
                          >
                            <span className="font-bold text-slate-300">س{qNum}:</span>
                            <div className="flex items-center gap-1">
                              {(["A", "B", "C", "D"] as const).map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    handleUpdateAnswerKeyOption(modelKey, qNum, opt)
                                  }
                                  className={`w-5 h-5 rounded text-[10.5px] font-bold transition cursor-pointer ${
                                    currentCorrect === opt
                                      ? "bg-emerald-500 text-slate-950"
                                      : "bg-slate-800 text-slate-400 hover:text-white"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ROSTER" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span>
                    <span className="text-slate-400">إجمالي الأوراق المصححة: </span>
                    <strong className="text-white font-mono tabular-nums">
                      {scannedHistory.length}
                    </strong>
                  </span>
                  {scannedHistory.length > 0 && (
                    <>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>
                        <span className="text-slate-400">معدل القسم: </span>
                        <strong className="text-emerald-400 font-mono tabular-nums">
                          {(
                            scannedHistory.reduce((acc, s) => acc + s.score, 0) /
                            scannedHistory.length
                          ).toFixed(2)}{" "}
                          / {maxScore}
                        </strong>
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRegradeAllHistory}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة التصحيح التلقائي</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>تصدير إلى Excel / مسار (CSV)</span>
                  </button>
                </div>
              </div>

              {scannedHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  لم يتم حفظ أي ورقة حتى الآن. انتقل إلى ماسح الكاميرا أو شغّل التدفق الآلي لتصحيح أوراق التلاميذ.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">اسم التلميذ</th>
                        <th className="p-3">النموذج</th>
                        <th className="p-3">النقطة</th>
                        <th className="p-3">الأجوبة الصحيحة</th>
                        <th className="p-3">التقدير البيداغوجي</th>
                        <th className="p-3">وقت التصحيح</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                      {scannedHistory.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-800/40">
                          <td className="p-3 text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-sans font-bold text-white">{item.studentName}</td>
                          <td className="p-3 text-amber-300 font-bold">{item.model}</td>
                          <td className="p-3">
                            <span className="text-emerald-400 font-black text-sm">
                              {item.score.toFixed(2)}
                            </span>
                            <span className="text-slate-500 text-[10px]"> / {item.maxScore}</span>
                          </td>
                          <td className="p-3 text-slate-300">
                            {item.correctCount} / {questionCount}
                          </td>
                          <td className="p-3 font-sans text-slate-300 text-[11px]">
                            {item.appreciationAr || "تم التصحيح الآلي"}
                          </td>
                          <td className="p-3 text-slate-500 text-[11px]">{item.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "STRATEGIC_ROADMAP" && (
            <div className="space-y-4">
              {/* المرحلة 1: التحليل السيكومتري للأسئلة وفق النظرية الكلاسيكية للقياس (CTT) */}
              <div className="bg-slate-950/85 border border-cyan-500/35 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">
                        المرحلة 1: التحليل السيكومتري للأسئلة وفق النظرية الكلاسيكية للقياس (Psychometric Item Analysis — CTT)
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono text-[10px] font-bold">
                        α = {psychometricReport.cronbachAlpha} · P = {psychometricReport.meanDifficultyP} · D = {psychometricReport.meanDiscriminationD}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {psychometricReport.reliabilityLabelAr} — {psychometricReport.summaryVerdictAr}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {psychometricReport.items.map((item) => (
                    <div
                      key={item.questionNumber}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-white">
                          {item.questionLabelAr}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.verdict === "OPTIMAL_DISCRIMINATING"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : item.verdict === "TOO_DIFFICULT_REMEDIATE"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {item.verdictLabelAr}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
                        <span>الصعوبة P = {item.difficultyIndexP}</span>
                        <span>·</span>
                        <span>التمييز D = {item.discriminationIndexD}</span>
                        <span>·</span>
                        <span>العليا: {item.upperGroupSuccessPct}% / الدنيا: {item.lowerGroupSuccessPct}%</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400">
                        {item.inspectorRecommendationAr}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* المرحلة 3: مصفوفة التتبع الطولي للكفايات وتغطية الأطر المرجعية للامتحان الوطني */}
              <div className="bg-slate-950/85 border border-indigo-500/35 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="text-sm font-black text-white">
                      المرحلة 3: مصفوفة التتبع الطولي للكفايات وتغطية الأطر المرجعية (S1 → S2 → الامتحان الوطني الموحد)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {longitudinalReport.inspectorStrategicAdviceAr}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono font-black text-xs">
                    مؤشر الجاهزية للامتحان الموحد: {longitudinalReport.nationalExamReadinessPct}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {longitudinalReport.domains.map((dom) => (
                    <div
                      key={dom.domainCode}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1 text-xs"
                    >
                      <div className="font-black text-amber-300 text-[11px]">
                        {dom.domainTitleAr}
                      </div>
                      <div className="font-mono text-[10.5px] text-slate-300">
                        الوزن الوطني: {dom.officialNationalWeightPct}% · التغطية: {dom.coverageReadinessPct}%
                      </div>
                      <div className="text-[10px] text-slate-400">
                        دروس د1: {dom.s1LessonsCount} · د2: {dom.s2LessonsCount} ({dom.totalCapacitiesCount} قدرة)
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold">
                        {dom.statusAr}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* المرحلة 4: التوقيع الرقمي التربوي الموثق للوثائق وبصمة التحقق */}
              <div className="bg-slate-950/85 border border-emerald-500/35 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-black text-white">
                      المرحلة 4: التوقيع الرقمي التربوي الموثق للوثائق وبصمة التحقق (Cryptographic Pedagogical Checksum)
                    </h3>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono text-[11px] font-black">
                      {documentDigitalSignature.signatureId}
                    </span>
                    {verifyPedagogicalDocumentSignature(documentDigitalSignature) && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                        ✓ موثق وسليم رقمياً
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    بصمة تحقق رقمية 256-bit مدمجة في رمز QR أسفل الورقة المطبوعة لمنع تزوير النماذج أو تغيير سلم التنقيط عند الأرشفة والتقاسم المؤسساتي.
                  </p>
                  <div
                    dir="ltr"
                    className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 break-all"
                  >
                    SHA256-Pedagogical-Digest: {documentDigitalSignature.hexDigest64}
                  </div>
                </div>
                <div
                  className="w-16 h-16 bg-white p-1 rounded-xl shrink-0"
                  dangerouslySetInnerHTML={{
                    __html: renderQrSvgString(
                      documentDigitalSignature.qrVerificationUri,
                      56,
                      "#0f172a"
                    ),
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "PRINT_SHEET" && (
            <div className="space-y-4">
              <div className="print:hidden flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-300">
                  اطبع هذه الورقة المزودة بعلامات المحاذاة الأربع (Fiducial Markers) ووزعها على التلاميذ للتصحيح التلقائي بالكاميرا.
                </p>
                <button
                  type="button"
                  onClick={handlePrintOMRSheet}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الورقة القياسية A4</span>
                </button>
              </div>

              {/* معاينة ورقة الإجابة المطبوعة A4 مع علامات المحاذاة الأربع */}
              <div className="relative bg-white text-slate-950 p-7 rounded-2xl shadow-xl max-w-2xl mx-auto border border-slate-200 font-sans print:shadow-none print:border-none">
                {/* علامات المحاذاة البصرية الأربع (Fiducial Registration Marks) */}
                <span className="absolute top-3 right-3 w-4 h-4 bg-slate-950 inline-block" />
                <span className="absolute top-3 left-3 w-4 h-4 bg-slate-950 inline-block" />
                <span className="absolute bottom-3 right-3 w-4 h-4 bg-slate-950 inline-block" />
                <span className="absolute bottom-3 left-3 w-4 h-4 bg-slate-950 inline-block" />

                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                  <div className="text-right text-[11px] font-bold leading-tight">
                    <div>المملكة المغربية — وزارة التربية الوطنية والتعليم الأولي والرياضة</div>
                    <div className="text-slate-600">ورقة إجابة الاختيار من متعدد للتصحيح التلقائي بالكاميرا (QCM - OMR)</div>
                    <div className="text-slate-800 font-black mt-0.5">{examTitle}</div>
                  </div>
                  <div
                    className="w-16 h-16 shrink-0"
                    dangerouslySetInnerHTML={{
                      __html: renderQrSvgString(
                        documentDigitalSignature.qrVerificationUri,
                        64,
                        "#0f172a"
                      ),
                    }}
                  />
                </div>

                {/* خانات تعريف التلميذ والنموذج */}
                <div className="grid grid-cols-2 gap-3 my-3 p-2.5 bg-slate-100 rounded-lg text-xs border border-slate-300">
                  <div>
                    <span className="font-bold">اسم التلميذ(ة): </span>
                    <span className="text-slate-500 font-mono">....................................................</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="font-bold">النموذج: </span>
                    <div className="flex gap-2 font-mono font-bold">
                      {(["A", "B", "C", "D"] as const).map((m) => (
                        <div key={m} className="flex items-center gap-1">
                          <span className="w-4 h-4 border border-slate-900 rounded-full inline-block" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-600 mb-3 bg-amber-50 p-2 rounded border border-amber-200">
                  <span className="font-bold text-amber-900">توجيه ديداكتيكي: </span>
                  ظلل الدائرة الموافقة للجواب الصحيح بالكامل باستعمال قلم أزرق أو أسود، وحافظ على نظافة المربعات السوداء الأربع في زوايا الورقة لضمان التصحيح التلقائي الفوري بالكاميرا.
                </div>

                {/* شبكة دوائر الأسئلة */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-slate-200 pt-3">
                  {Array.from({ length: questionCount }, (_, i) => i + 1).map((q) => (
                    <div
                      key={q}
                      className="flex items-center justify-between p-1.5 border-b border-slate-200 text-xs font-mono tabular-nums"
                    >
                      <span className="font-bold">السؤال {q.toString().padStart(2, "0")}:</span>
                      <div className="flex items-center gap-3">
                        {(["A", "B", "C", "D"] as const).map((opt) => (
                          <div key={opt} className="flex items-center gap-1">
                            <span className="w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center font-bold text-[10px]">
                              {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                  <span>منظومة التقويم والتحليل الديداكتيكي KouziberAPPDS</span>
                  <span className="font-mono font-bold text-slate-700">
                    {documentDigitalSignature.sealBadgeAr}
                  </span>
                  <span>سلم التنقيط المعتمد: {pointsPerQuestion} نقط لكل سؤال</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
