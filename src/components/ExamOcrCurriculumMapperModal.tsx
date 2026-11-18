import React, { useState, useEffect } from "react";
import {
  X,
  Scan,
  FileText,
  FileCode2,
  CheckCircle2,
  Upload,
  Sparkles,
  Copy,
  Check,
  Download,
  Layers,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Award,
  AlertTriangle,
  Printer,
  PenTool,
  BookOpen,
  Sliders,
  Wand2,
  Eye,
  Camera,
  Languages,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  OCR_ENHANCE_PRESETS,
  enhanceImageDataUrlOnCanvas,
  OcrEnhancePreset,
  OcrImageEnhancementOptions,
  OcrEnhancementDiagnostics,
} from "../utils/ocrImageEnhancer";
import {
  ARABIC_MATH_NOTATION_DICTIONARY,
  ArabicMathNotationMode,
  ArabicMathOcrDiagnostics,
  OcrMappingValidationSummary,
  sanitizeOcrMathString,
  transpileArabicMathNotationToLatex,
  validateAndSanitizeGradingReport,
  validateAndSanitizeOcrMapping,
} from "../utils/ocrLatexSanitizer";
import {
  AlgebraicChainVerificationResult,
  verifyAlgebraicStepEquivalenceChain,
} from "../utils/mathjsValidator";

export interface ExamOcrScanResult {
  extractedRawText: string;
  confidenceScore: number;
  documentMeta: {
    titleAr: string;
    titleFr: string;
    schoolOrigin?: string;
    detectedTrackCode?: string;
    detectedCycle?: string;
    detectedSemester?: string;
    detectedDsKey?: string;
    durationAr?: string;
    durationFr?: string;
    totalPoints?: number;
    exerciseCount?: number;
  };
  suggestedCurriculumMapping: {
    trackCode: string;
    cycle?: string;
    semester: string;
    dsKey: string;
    cognitiveBalance?: {
      n1Percent: number;
      n2Percent: number;
      n3Percent: number;
    };
    detectedLessons?: Array<{
      lessonAr: string;
      lessonFr: string;
      weight: number;
      category?: string;
    }>;
    exercises: Array<{
      id: string;
      titleAr: string;
      titleFr: string;
      category: string;
      subCategory?: string;
      subCategoryFr?: string;
      points: number;
      cognitiveLevel?: "N1" | "N2" | "N3";
      capacitiesAr: string[];
      capacitiesFr: string[];
      questionsAr: string[];
      questionsFr: string[];
      questionBaremes?: number[];
      solutionsAr?: string[];
      solutionsFr?: string[];
    }>;
  };
  modelUsed?: string;
}

export interface GradedQuestionItem {
  questionRef: string;
  exerciseTitleAr: string;
  studentAnswerLatex: string;
  referenceSolutionLatex: string;
  status: "CORRECT" | "PARTIAL" | "INCORRECT";
  awardedPoints: number;
  maxPoints: number;
  errorTypeLabelAr: string;
  redPenCommentAr: string;
  redPenCommentFr: string;
}

export interface OcrStudentGradingReport {
  studentCopyCode: string;
  targetTrackCode: string;
  fileName: string;
  totalAwardedPoints: number;
  totalMaxPoints: number;
  confidenceScore: number;
  generalAppreciationAr: string;
  generalAppreciationFr: string;
  transcribedStudentLatex: string;
  gradedItems: GradedQuestionItem[];
  printableRemediationSheet: {
    sheetTitleAr: string;
    sheetTitleFr: string;
    diagnosedGapsAr: string[];
    remediationExercises: Array<{
      titleAr: string;
      titleFr: string;
      questionsAr: string[];
      questionsFr: string[];
      solutionHintAr: string;
    }>;
  };
}

interface ExamOcrCurriculumMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTrackCode: string;
  onApplyCurriculumMapping: (
    mapping: ExamOcrScanResult["suggestedCurriculumMapping"]
  ) => void;
  onNotify?: (type: "success" | "error" | "info", msg: string) => void;
  initialStudioMode?: "STUDENT_PAPER_AUTO_GRADER" | "EXAM_CURRICULUM_MAPPER";
  schoolName?: string;
  profName?: string;
  academicYear?: string;
}

export const ExamOcrCurriculumMapperModal: React.FC<
  ExamOcrCurriculumMapperModalProps
> = ({
  isOpen,
  onClose,
  targetTrackCode,
  onApplyCurriculumMapping,
  onNotify,
  initialStudioMode = "STUDENT_PAPER_AUTO_GRADER",
  schoolName = "الثانوية التأهيلية",
  profName = "أستاذ الرياضيات",
  academicYear = "2025/2026",
}) => {
  const [studioMode, setStudioMode] = useState<
    "STUDENT_PAPER_AUTO_GRADER" | "EXAM_CURRICULUM_MAPPER"
  >(initialStudioMode);

  const [activeTab, setActiveTab] = useState<
    "CURRICULUM_MAPPING" | "RAW_TEXT" | "JSON_SCHEMA"
  >("CURRICULUM_MAPPING");

  const [fileInfo, setFileInfo] = useState<{
    name: string;
    sizeKb: number;
    mimeType: string;
    base64?: string;
  } | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ExamOcrScanResult | null>(null);
  const [editableOcrText, setEditableOcrText] = useState("");

  // حالة المصحح التلقائي لأوراق التلاميذ الممسوحة ضوئياً وإنتاج وثيقة التصحيح
  const [studentCopyCode, setStudentCopyCode] = useState("COPIE-2BAC-01");
  const [gradingReport, setGradingReport] =
    useState<OcrStudentGradingReport | null>(null);
  const [gradingModelUsed, setGradingModelUsed] = useState<string>("");
  const [isExportingGradingPdf, setIsExportingGradingPdf] = useState(false);

  // حالة محرك تعزيز وتحسين الصور الضوئية قبل استخراج النصوص الرياضية (OCR Pre-Processing)
  const [enhanceOptions, setEnhanceOptions] = useState<OcrImageEnhancementOptions>(
    OCR_ENHANCE_PRESETS.AUTO_SMART
  );
  const [enhancedBase64, setEnhancedBase64] = useState<string | null>(null);
  const [enhanceDiagnostics, setEnhanceDiagnostics] =
    useState<OcrEnhancementDiagnostics | null>(null);
  const [isEnhancingImage, setIsEnhancingImage] = useState(false);
  const [mathSyntaxSummary, setMathSyntaxSummary] =
    useState<OcrMappingValidationSummary | null>(null);

  // حالة محرك OCR المتخصص في الترميز الرياضي العربي والوثائق التراثية الممسوحة بالكاميرا
  const [arabicNotationMode, setArabicNotationMode] =
    useState<ArabicMathNotationMode>("CONVERT_TO_STANDARD_LATEX");
  const [arabicMathDiagnostics, setArabicMathDiagnostics] =
    useState<ArabicMathOcrDiagnostics | null>(() =>
      transpileArabicMathNotationToLatex(
        "نعتبر الدالة د(س) = س² + لو(س) + جا(س) لكل س ∈ ح*+ والمتتالية (ح_ن) حيث ح_٠ = ٢ ونها_{س ← +∞} د(س) = +∞",
        "CONVERT_TO_STANDARD_LATEX"
      )
    );
  const [liveArabicTestSnippet, setLiveArabicTestSnippet] = useState<string>(
    "لتكن د(س) = جذر(س + ١) + جا(س) - لو(س) لكل س ∈ ح*+ ، أحسب نها_{س ← +∞} د(س) وحدد ح_ن بدلالة ن حيث ح_٠ = ٣"
  );
  const [isLegacyCameraOpen, setIsLegacyCameraOpen] = useState<boolean>(false);
  const legacyVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const legacyStreamRef = React.useRef<MediaStream | null>(null);

  // حالة المرحلة 2 من خارطة الطريق: المحرك الجبري الرمزي المحلي لتكافؤ الخطوات الاستدلالية وحساب النقط الجزئية (CAS Step Verifier)
  const [casRefLatex, setCasRefLatex] = useState<string>(
    "f'(x) = 2*(x^2 + 2*x + 1)"
  );
  const [casStepsText, setCasStepsText] = useState<string>(
    "f'(x) = 2*(x + 1)^2\nf'(x) = 2*(x^2 + 2*x + 2)\nf'(x) = 2*x^2 + 4*x + 4"
  );
  const [casMaxPoints, setCasMaxPoints] = useState<number>(2.0);
  const casVerificationResult: AlgebraicChainVerificationResult = React.useMemo(
    () =>
      verifyAlgebraicStepEquivalenceChain({
        referenceLatex: casRefLatex,
        studentStepsLatex: casStepsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        maxPoints: casMaxPoints,
      }),
    [casRefLatex, casStepsText, casMaxPoints]
  );

  const stopLegacyCamera = React.useCallback(() => {
    if (legacyStreamRef.current) {
      legacyStreamRef.current.getTracks().forEach((t) => t.stop());
      legacyStreamRef.current = null;
    }
    setIsLegacyCameraOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStudioMode(initialStudioMode);
    } else {
      stopLegacyCamera();
    }
    return () => {
      stopLegacyCamera();
    };
  }, [isOpen, initialStudioMode, stopLegacyCamera]);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
    onNotify?.("success", "تم نسخ المحتوى بنجاح إلى الحافظة");
  };

  const handleDownloadJson = () => {
    if (!scanResult) return;
    const jsonStr = JSON.stringify(
      scanResult.suggestedCurriculumMapping,
      null,
      2
    );
    const blob = new Blob([jsonStr], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Curriculum_Mapping_${
      scanResult.suggestedCurriculumMapping.trackCode || "2BAC"
    }_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify?.("success", "تم تحميل ملف المنهاج (.json) بنجاح");
  };

  const runImageEnhancement = async (
    rawDataUrl: string,
    opts: OcrImageEnhancementOptions
  ): Promise<string> => {
    setIsEnhancingImage(true);
    try {
      const result = await enhanceImageDataUrlOnCanvas(rawDataUrl, opts);
      setEnhancedBase64(result.enhancedDataUrl);
      setEnhanceDiagnostics(result.diagnostics);
      return result.enhancedDataUrl;
    } catch {
      setEnhancedBase64(rawDataUrl);
      setEnhanceDiagnostics(null);
      return rawDataUrl;
    } finally {
      setIsEnhancingImage(false);
    }
  };

  useEffect(() => {
    if (fileInfo?.base64 && fileInfo.mimeType.startsWith("image/")) {
      void runImageEnhancement(fileInfo.base64, enhanceOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enhanceOptions]);

  const executeOcrScan = async (
    base64Data?: string,
    mime?: string,
    name?: string,
    enhancementApplied?: boolean,
    rawTextFallbackOverride?: string
  ) => {
    setIsScanning(true);
    setScanStep(1);

    const stepTimer1 = setTimeout(() => setScanStep(2), 600);
    const stepTimer2 = setTimeout(() => setScanStep(3), 1200);

    try {
      const payloadImage = base64Data || enhancedBase64 || fileInfo?.base64;
      const isEnhanced =
        enhancementApplied ?? (enhanceOptions.preset !== "ORIGINAL" && Boolean(enhancedBase64 || base64Data));
      const response = await fetch("/api/ocr-scan-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: payloadImage,
          fileMimeType: mime || fileInfo?.mimeType || "image/png",
          fileName: name || fileInfo?.name || "exam_document.png",
          rawTextFallback: rawTextFallbackOverride,
          targetTrackCode,
          enhancementApplied: isEnhanced,
          enhancementDiagnostics: enhanceDiagnostics,
          arabicNotationMode,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "فشل المسح الضوئي للمستند");
      }

      const combinedSourceForArabicDiag = `${rawTextFallbackOverride || ""}\n${data.extractedRawText || ""}`;
      const localArabicDiag =
        data.arabicMathDiagnostics ||
        transpileArabicMathNotationToLatex(
          combinedSourceForArabicDiag,
          arabicNotationMode
        );
      setArabicMathDiagnostics(localArabicDiag);

      const rawTextClean = sanitizeOcrMathString(
        data.extractedRawText || "",
        false,
        arabicNotationMode
      );
      const mappingValidation = data.suggestedCurriculumMapping
        ? validateAndSanitizeOcrMapping(
            data.suggestedCurriculumMapping,
            arabicNotationMode
          )
        : null;

      const sanitizedScanData: ExamOcrScanResult = {
        ...data,
        extractedRawText: rawTextClean.sanitized,
        suggestedCurriculumMapping:
          mappingValidation?.sanitizedMapping || data.suggestedCurriculumMapping,
      };
      const summary = mappingValidation?.summary || data.mathSyntaxValidation || null;
      setMathSyntaxSummary(summary);
      setScanResult(sanitizedScanData);
      setEditableOcrText(sanitizedScanData.extractedRawText || "");
      onNotify?.(
        "success",
        `تم مسح الوثيقة بمحرك الترميز الرياضي العربي (${localArabicDiag.detectedArabicMathTokensCount} رمز عربي معالج) بنسبة ثقة ${data.confidenceScore}%`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "حدث خطأ أثناء المسح الضوئي";
      onNotify?.("error", message);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsScanning(false);
      setScanStep(0);
    }
  };

  // تشغيل كاميرا الجهاز لمسح الوثائق الورقية والتراثية بالترميز الرياضي العربي
  const startLegacyDocumentCamera = async () => {
    try {
      stopLegacyCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      legacyStreamRef.current = stream;
      setIsLegacyCameraOpen(true);
      setTimeout(() => {
        if (legacyVideoRef.current) {
          legacyVideoRef.current.srcObject = stream;
          void legacyVideoRef.current.play();
        }
      }, 80);
      onNotify?.(
        "info",
        "تم تشغيل كاميرا مسح الوثائق التراثية: وجّه العدسة نحو الفرض الورقي واضغط «التقاط ومسح بالترميز العربي»."
      );
    } catch {
      onNotify?.(
        "info",
        "الكاميرا الفعلية غير متاحة حالياً؛ جاري توليد ورقمنة وثيقة تراثية بالترميز الرياضي العربي عبر المحاكي البصري."
      );
      await handleScanLegacyArabicDocumentViaCameraSimulator();
    }
  };

  // توليد صورة وثيقة فرض مغربي تراثي بالترميز الرياضي العربي الأصيل (نها، جا، جتا، لو، د(س)، ح_ن) ومسحها بالكاميرا
  const handleScanLegacyArabicDocumentViaCameraSimulator = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 620;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (
        isLegacyCameraOpen &&
        legacyVideoRef.current &&
        legacyVideoRef.current.readyState >= 2
      ) {
        ctx.drawImage(legacyVideoRef.current, 0, 0, canvas.width, canvas.height);
        stopLegacyCamera();
      } else {
        // خلفية وثيقة ورقية تراثية مع تدرج إضاءة كاميرا واقعي
        const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGrad.addColorStop(0, "#fefce8");
        bgGrad.addColorStop(0.5, "#f8fafc");
        bgGrad.addColorStop(1, "#e2e8f0");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 2;
        ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(
          "المملكة المغربية - فرض محروس بالترميز الرياضي العربي الأصيل (أرشيف البكالوريا)",
          80,
          68
        );
        ctx.font = "bold 17px monospace";
        const lines = [
          "التمرين الأول (٧ نقط): دراسة دالة عددية بالترميز العربي د(س)",
          "نعتبر الدالة د المعرفة لكل س ∈ ح*+ بـ: د(س) = س - ١ + لو(س) + جا(س)",
          "١) أحسب نها_{س ← +∞} د(س) و نها_{س ← ٠} جتا(س)",
          "٢) أحسب الدالة المشتقة د'(س) لكل س ∈ ح*+ وأدرس إشارتها.",
          "التمرين الثاني (٦ نقط): المتتالية العددية (ح_ن) حيث ن ∈ ط",
          "لتكن (ح_ن) متتالية معرفة بـ: ح_٠ = ٢ و ح_{ن+١} = جذر(ح_ن + ٣)",
          "١) أحسب ح_١ و ح_٢ ثم برهن بالترجع أن ح_ن ∈ ح+ لكل ن ∈ ط.",
        ];
        lines.forEach((line, idx) => {
          ctx.fillText(line, 60, 125 + idx * 62);
        });
      }
    }

    const rawDataUrl = canvas.toDataURL("image/png");
    const legacyArabicRawSource = `المملكة المغربية — وزارة التربية الوطنية
الفرض المحروس رقم ١ في مادة الرياضيات (وثيقة تراثية ممسوحة بالكاميرا بالترميز الرياضي العربي)
التمرين الأول (٧ نقط): الدوال اللوغاريتمية والمثلثية
نعتبر الدالة $د(س) = س - ١ + لو(س) + جا(س)$ لكل $س ∈ ح*+$.
١. أحسب $نها_{س ← +∞} د(س)$ ثم أحسب $نها_{س ← ٠} جتا(س)$.
٢. أحسب الدالة المشتقة $د'(س)$ لكل $س ∈ ح*+$ ثم ضع جدول تغيرات $د(س)$.
التمرين الثاني (٦ نقط): المتتاليات العددية
نعتبر المتتالية $(ح_ن)$ المعرفة لكل $ن ∈ ط$ بـ: $ح_٠ = ٢$ و $ح_{ن+١} = جذر(ح_ن + ٣)$.
١. أحسب $ح_١$ و $ح_٢$ ثم بين بالترجع أن $ح_ن ≥ ٢$ لكل $ن ∈ ط$.
٢. أدرس رتابة المتتالية $(ح_ن)$ واستنتج أنها متقاربة.`;

    setFileInfo({
      name: "Camera_Scan_Legacy_Arabic_Math_Exam.png",
      sizeKb: 168,
      mimeType: "image/png",
      base64: rawDataUrl,
    });

    const enhancedUrl = await runImageEnhancement(
      rawDataUrl,
      OCR_ENHANCE_PRESETS.PRINTED_DESKEW
    );

    if (studioMode === "STUDENT_PAPER_AUTO_GRADER") {
      await executeStudentPaperAutoGrading(
        enhancedUrl,
        "image/png",
        "Camera_Scan_Legacy_Arabic_Math_Exam.png",
        "COPIE-AR-LEGACY-01",
        true
      );
    } else {
      await executeOcrScan(
        enhancedUrl,
        "image/png",
        "Camera_Scan_Legacy_Arabic_Math_Exam.png",
        true,
        legacyArabicRawSource
      );
    }
  };

  const executeStudentPaperAutoGrading = async (
    base64Data?: string,
    mime?: string,
    name?: string,
    customCopyCode?: string,
    enhancementApplied?: boolean
  ) => {
    setIsScanning(true);
    setScanStep(1);

    const stepTimer1 = setTimeout(() => setScanStep(2), 600);
    const stepTimer2 = setTimeout(() => setScanStep(3), 1200);

    try {
      const payloadImage = base64Data || enhancedBase64 || fileInfo?.base64 || "";
      const isEnhanced =
        enhancementApplied ?? (enhanceOptions.preset !== "ORIGINAL" && Boolean(enhancedBase64 || base64Data));
      const response = await fetch("/api/ocr-grade-student-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: payloadImage,
          fileMimeType: mime || fileInfo?.mimeType || "image/png",
          fileName: name || fileInfo?.name || "Copie_Eleve_Scan.png",
          targetTrackCode,
          studentCopyCode: customCopyCode || studentCopyCode,
          enhancementApplied: isEnhanced,
          enhancementDiagnostics: enhanceDiagnostics,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.report) {
        throw new Error(data.error || "تعذر إتمام التصحيح الآلي للورقة");
      }

      const sanitizedReportRes = validateAndSanitizeGradingReport(data.report);
      setMathSyntaxSummary(sanitizedReportRes.summary);
      setGradingReport(sanitizedReportRes.sanitizedReport);
      setGradingModelUsed(data.modelUsed || "Gemini 3.8 Flash Auto-Grader");
      onNotify?.(
        "success",
        `تم تصحيح الورقة (${data.report.studentCopyCode})${isEnhanced ? " بالصورة المعزّزة" : ""} آلياً! النقطة: ${data.report.totalAwardedPoints}/20 (سلامة LaTeX: ${sanitizedReportRes.summary.integrityScorePct}%)`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "حدث خطأ أثناء التصحيح الآلي";
      onNotify?.("error", message);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsScanning(false);
      setScanStep(0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024);
    const mime =
      file.type ||
      (file.name.endsWith(".pdf") ? "application/pdf" : "image/png");

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setFileInfo({
        name: file.name,
        sizeKb,
        mimeType: mime,
        base64: dataUrl,
      });

      let processedDataUrl = dataUrl;
      let applied = false;
      let effectiveMime = mime;
      if (mime.startsWith("image/") && dataUrl) {
        processedDataUrl = await runImageEnhancement(dataUrl, enhanceOptions);
        applied = enhanceOptions.preset !== "ORIGINAL";
        effectiveMime = "image/png";
      } else {
        setEnhancedBase64(null);
        setEnhanceDiagnostics(null);
      }

      if (studioMode === "STUDENT_PAPER_AUTO_GRADER") {
        await executeStudentPaperAutoGrading(
          processedDataUrl,
          effectiveMime,
          file.name,
          undefined,
          applied
        );
      } else {
        await executeOcrScan(processedDataUrl, effectiveMime, file.name, applied);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleLoadSampleExam = async (type: "2BAC_SM" | "2BAC_PC" | "1BAC") => {
    setFileInfo({
      name: `Exemple_${type}_Devoir_Surveille.png`,
      sizeKb: 142,
      mimeType: "image/png",
    });
    await executeOcrScan(
      undefined,
      "image/png",
      `Exemple_${type}_Devoir_Surveille.png`
    );
  };

  const handleLoadSampleStudentPaper = async (
    sampleCode: string,
    labelFile: string
  ) => {
    setStudentCopyCode(sampleCode);
    setFileInfo({
      name: labelFile,
      sizeKb: 185,
      mimeType: "image/png",
    });
    await executeStudentPaperAutoGrading(
      undefined,
      "image/png",
      labelFile,
      sampleCode
    );
  };

  const handleExportGradingSheetPdf = async () => {
    const node = document.getElementById("printable-ocr-student-grading-sheet");
    if (!node || !gradingReport) return;

    setIsExportingGradingPdf(true);
    try {
      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2.4,
        backgroundColor: "#ffffff",
        skipFonts: true,
        fontEmbedCSS: "",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageW = 210;
      const pageH = 297;
      pdf.addImage(dataUrl, "PNG", 6, 6, pageW - 12, pageH - 12);
      pdf.save(
        `Fiche_Correction_OCR_${gradingReport.studentCopyCode}_${targetTrackCode}.pdf`
      );
      onNotify?.(
        "success",
        "تم إنتاج وتصدير وثيقة التصحيح المفصل والدعم بصيغة PDF (A4) جاهزة للطباعة!"
      );
    } catch {
      onNotify?.("error", "تعذر تصدير ملف PDF، يرجى المحاولة مجدداً.");
    } finally {
      setIsExportingGradingPdf(false);
    }
  };

  const handleInjectRemediationIntoMainDocument = () => {
    if (!gradingReport) return;
    const remEx = gradingReport.printableRemediationSheet.remediationExercises;
    onApplyCurriculumMapping({
      trackCode: targetTrackCode,
      semester: "S1",
      dsKey: "DS1",
      exercises: [
        {
          id: "ocr_graded_remediation_1",
          titleAr:
            remEx[0]?.titleAr ||
            "تمرين دعم استدراكي مبني على تصحيح الأوراق الممسوحة ضوئياً",
          titleFr:
            remEx[0]?.titleFr ||
            "Exercice de remédiation ciblée issu de la correction OCR",
          category: "تحليل ودوال",
          points: 10,
          cognitiveLevel: "N2",
          capacitiesAr: gradingReport.printableRemediationSheet.diagnosedGapsAr,
          capacitiesFr: [
            "Maîtrise des hypothèses du TVI et dérivée d'un quotient",
          ],
          questionsAr: remEx[0]?.questionsAr || [
            "1) أحسب مشتقة الدالة f(x) مع تعليل قاعدة خارج قسمة دالتين.",
            "2) بين أن المعادلة f(x)=0 تقبل حلاً وحيداً مع ذكر جميع شروط مبرهنة القيم الوسيطية.",
          ],
          questionsFr: remEx[0]?.questionsFr || [
            "1) Calculer la dérivée f'(x) en justifiant la règle du quotient.",
            "2) Démontrer l'existence et l'unicité de la solution par le TVI.",
          ],
          solutionsAr: gradingReport.gradedItems.map(
            (g) => `${g.questionRef}: ${g.referenceSolutionLatex} (${g.redPenCommentAr})`
          ),
        },
      ],
    });
    onNotify?.(
      "success",
      "تم إنتاج وإدراج وثيقة التصحيح وتمرين الاستدراك الموجه مباشرة في محرر الوثائق الرئيسي!"
    );
    onClose();
  };

  const handleApplyToActiveExam = () => {
    if (!scanResult) return;
    onApplyCurriculumMapping(scanResult.suggestedCurriculumMapping);
    onNotify?.(
      "success",
      "تم تطبيق الفرض الممسوح وتحديث محرر الفروض المحروسة بالكامل!"
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print"
      dir="rtl"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in duration-200">
        {/* الترويسة العليا للمودال مع مبدل نمط إنتاج الوثائق عبر OCR */}
        <div className="bg-gradient-to-l from-indigo-950 via-slate-900 to-slate-950 px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Scan className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  أستوديو التصحيح التلقائي للأوراق الممسوحة ضوئياً (OCR) وإنتاج وثائق التقويم
                </h2>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  AI OCR Auto-Grader · إنتاج الوثائق
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تصحيح آلي لأوراق التلاميذ الممسوحة ضوئياً بالذكاء الاصطناعي وإنتاج فوري لوثيقة التصحيح المفصل وشبكة التنقيط والدعم (PDF A4)
              </p>
            </div>
          </div>

          {/* مبدل الوظيفة داخل الأستوديو */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStudioMode("STUDENT_PAPER_AUTO_GRADER")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition ${
                  studioMode === "STUDENT_PAPER_AUTO_GRADER"
                    ? "bg-gradient-to-l from-emerald-500 to-teal-600 text-slate-950 shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>1. التصحيح التلقائي لأوراق التلاميذ (OCR)</span>
              </button>
              <button
                type="button"
                onClick={() => setStudioMode("EXAM_CURRICULUM_MAPPER")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition ${
                  studioMode === "EXAM_CURRICULUM_MAPPER"
                    ? "bg-gradient-to-l from-cyan-500 to-indigo-600 text-white shadow-md"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>2. مسح موضوع فرض ومطابقة المنهاج</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* جسم النافذة الرئيسي */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 studio-scroll">
          {/* =====================================================================
              شريط تعزيز وتحسين الصور الممسوحة ضوئياً (OCR Image Enhancement Pipeline)
             ===================================================================== */}
          <div className="bg-slate-950/95 border border-cyan-500/30 rounded-2xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">
                    محرك تعزيز جودة الصور قبل الاستخراج الرياضي (OCR Image Enhancement)
                  </h3>
                  <p className="text-[10.5px] text-slate-400">
                    رفع التباين، شحذ الحواف والأسس، إزالة مربعات الدفتر، تعديل الميلان، والثنائية التكيفية قبل المطابقة مع المنهاج
                  </p>
                </div>
              </div>

              {enhanceDiagnostics && (
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    تباين: {enhanceDiagnostics.contrastBeforePct}% ← {enhanceDiagnostics.contrastAfterPct}% (+{enhanceDiagnostics.contrastGainPct}%)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    حدة: +{enhanceDiagnostics.sharpnessGainPct}%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    حبر: {enhanceDiagnostics.foregroundInkRatioPct}%
                  </span>
                </div>
              )}
            </div>

            {/* أزرار القوالب الجاهزة لتحسين الصورة */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(Object.keys(OCR_ENHANCE_PRESETS) as OcrEnhancePreset[]).map(
                (presetKey) => {
                  const p = OCR_ENHANCE_PRESETS[presetKey];
                  const active = enhanceOptions.preset === presetKey;
                  return (
                    <button
                      key={presetKey}
                      type="button"
                      onClick={() =>
                        setEnhanceOptions({
                          preset: p.preset,
                          contrastFactor: p.contrastFactor,
                          sharpnessAmount: p.sharpnessAmount,
                          adaptiveBinarization: p.adaptiveBinarization,
                          suppressGridLines: p.suppressGridLines,
                          deskewAngleDeg: p.deskewAngleDeg,
                        })
                      }
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                        active
                          ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-xs"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
                      }`}
                      title={p.descAr}
                    >
                      {p.labelAr}
                    </button>
                  );
                }
              )}
            </div>

            {/* الضوابط الدقيقة للصورة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center text-[11px] bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
              <label className="space-y-1 block">
                <span className="text-slate-300 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-cyan-400" />
                    التباين
                  </span>
                  <span className="font-mono text-cyan-300">
                    {enhanceOptions.contrastFactor.toFixed(2)}×
                  </span>
                </span>
                <input
                  type="range"
                  min={1.0}
                  max={2.6}
                  step={0.05}
                  value={enhanceOptions.contrastFactor}
                  onChange={(e) =>
                    setEnhanceOptions((prev) => ({
                      ...prev,
                      preset: "AUTO_SMART",
                      contrastFactor: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-cyan-400"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-slate-300 font-bold flex items-center justify-between">
                  <span>شحذ الرموز</span>
                  <span className="font-mono text-cyan-300">
                    {enhanceOptions.sharpnessAmount}%
                  </span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={enhanceOptions.sharpnessAmount}
                  onChange={(e) =>
                    setEnhanceOptions((prev) => ({
                      ...prev,
                      preset: "AUTO_SMART",
                      sharpnessAmount: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-cyan-400"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-slate-300 font-bold flex items-center justify-between">
                  <span>تعديل الميلان</span>
                  <span className="font-mono text-cyan-300" dir="ltr">
                    {enhanceOptions.deskewAngleDeg}°
                  </span>
                </span>
                <input
                  type="range"
                  min={-15}
                  max={15}
                  step={0.5}
                  value={enhanceOptions.deskewAngleDeg}
                  onChange={(e) =>
                    setEnhanceOptions((prev) => ({
                      ...prev,
                      deskewAngleDeg: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-cyan-400"
                />
              </label>

              <label className="flex items-center gap-2 text-slate-200 font-bold cursor-pointer px-1">
                <input
                  type="checkbox"
                  checked={enhanceOptions.adaptiveBinarization}
                  onChange={(e) =>
                    setEnhanceOptions((prev) => ({
                      ...prev,
                      preset: "AUTO_SMART",
                      adaptiveBinarization: e.target.checked,
                    }))
                  }
                  className="accent-emerald-400 w-3.5 h-3.5"
                />
                <span>ثنائية تكيفية (إزالة الظل)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-200 font-bold cursor-pointer px-1">
                <input
                  type="checkbox"
                  checked={enhanceOptions.suppressGridLines}
                  onChange={(e) =>
                    setEnhanceOptions((prev) => ({
                      ...prev,
                      preset: "HANDWRITTEN_PENCIL",
                      suppressGridLines: e.target.checked,
                    }))
                  }
                  className="accent-emerald-400 w-3.5 h-3.5"
                />
                <span>إزالة مربعات الدفتر الزرقاء</span>
              </label>
            </div>

            {/* معاينة مقارنة الصورة الأصلية مقابل الصورة المعزّزة + زر إعادة المسح الفوري */}
            {fileInfo?.base64 && fileInfo.mimeType.startsWith("image/") && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                <div className="md:col-span-4 flex items-center gap-2">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 bg-white shrink-0">
                    <img
                      src={fileInfo.base64}
                      alt="الصورة الأصلية"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[11px]">
                    <div className="font-bold text-slate-300 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>الأصلية المرفوعة</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {fileInfo.sizeKb} KB
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 flex items-center gap-2">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-emerald-500/60 bg-white shrink-0">
                    <img
                      src={enhancedBase64 || fileInfo.base64}
                      alt="الصورة المعززة للـ OCR"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[11px]">
                    <div className="font-black text-emerald-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>
                        {isEnhancingImage ? "جاري المعالجة..." : "المعزّزة الجاهزة للـ OCR"}
                      </span>
                    </div>
                    {enhanceDiagnostics && (
                      <div className="text-[10px] text-emerald-400 font-mono">
                        {enhanceDiagnostics.width}×{enhanceDiagnostics.height}px PNG
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="button"
                    disabled={isScanning || isEnhancingImage}
                    onClick={async () => {
                      const imgToUse = enhancedBase64 || fileInfo.base64;
                      const applied = enhanceOptions.preset !== "ORIGINAL";
                      if (studioMode === "STUDENT_PAPER_AUTO_GRADER") {
                        await executeStudentPaperAutoGrading(
                          imgToUse,
                          "image/png",
                          fileInfo.name,
                          studentCopyCode,
                          applied
                        );
                      } else {
                        await executeOcrScan(
                          imgToUse,
                          "image/png",
                          fileInfo.name,
                          applied
                        );
                      }
                    }}
                    className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-gradient-to-l from-cyan-500 to-emerald-500 hover:brightness-105 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                    <span>تشغيل المسح/التصحيح بالصورة المعزّزة</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =====================================================================
              محرك OCR المتخصص في الترميز الرياضي العربي والوثائق التراثية الممسوحة بالكاميرا
             ===================================================================== */}
          <div className="bg-slate-950/95 border border-amber-500/35 rounded-2xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                  <Languages className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-black text-white">
                      محرك OCR المتخصص في الترميز الرياضي العربي ورقمنة الوثائق التراثية عبر الكاميرا
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      Arabic Math OCR · نها · جا · جتا · لو · د(س) · (ح_ن)
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400">
                    مدرّب خصيصاً للتعرف على الرموز الرياضية العربية التراثية والمعربة في الوثائق الممسوحة بالكاميرا وتحويلها آلياً إلى LaTeX قياسي ومنهاج JSON
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {!isLegacyCameraOpen ? (
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={startLegacyDocumentCamera}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>فتح الكاميرا لمسح وثيقة ورقية/تراثية</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={handleScanLegacyArabicDocumentViaCameraSimulator}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>التقاط ورقمنة بالترميز العربي الآن</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopLegacyCamera}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] cursor-pointer"
                    >
                      إغلاق الكاميرا
                    </button>
                  </>
                )}

                <button
                  type="button"
                  disabled={isScanning}
                  onClick={handleScanLegacyArabicDocumentViaCameraSimulator}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 font-black text-[11px] flex items-center gap-1.5 cursor-pointer transition"
                  title="توليد ومسح فرض مغربي تراثي بالترميز الرياضي العربي الأصيل عبر الكاميرا"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>مسح وثيقة تراثية بالترميز العربي (محاكاة الكاميرا)</span>
                </button>
              </div>
            </div>

            {isLegacyCameraOpen && (
              <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/60 bg-black max-h-56 flex items-center justify-center">
                <video
                  ref={legacyVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-h-56 object-contain"
                />
                <div className="absolute bottom-2 right-2 bg-slate-950/85 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-[10.5px] text-emerald-300 font-bold">
                  عدسة الكاميرا نشطة — وجّه الكاميرا نحو الفرض الورقي بالترميز العربي أو الفرنسي
                </div>
              </div>
            )}

            {/* أنماط تحويل الترميز الرياضي العربي + المحول التفاعلي الفوري */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start bg-slate-900/75 p-3 rounded-xl border border-slate-800">
              <div className="lg:col-span-5 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  نمط معالجة الرموز الرياضية العربية المستخرجة:
                </span>
                <div className="flex flex-col gap-1.5">
                  {[
                    {
                      id: "CONVERT_TO_STANDARD_LATEX" as ArabicMathNotationMode,
                      label: "تحويل الترميز العربي التراثي إلى LaTeX دولي قياسي (BIOF / LaTeX)",
                      desc: "يحول: نهـا ← \\lim ، جا ← \\sin ، لو ← \\ln ، د(س) ← f(x) ، ح_ن ← u_n ، ح ← \\mathbb{R}",
                    },
                    {
                      id: "DUAL_BILINGUAL_BRIDGE" as ArabicMathNotationMode,
                      label: "جسر مزدوج عربي/فرنسي (ربط المصطلح التراثي بـ LaTeX القياسي)",
                      desc: "يحافظ على السياق العربي للتمرين مع توليد الصيغ الرياضية القياسية والترجمة الفرنسية",
                    },
                    {
                      id: "PRESERVE_ARABIC_MATH_SCRIPT" as ArabicMathNotationMode,
                      label: "الحفاظ على الترميز الرياضي العربي الأصيل وتطبيع الأرقام والجذور",
                      desc: "يحول الأرقام المشرقية ٠-٩ إلى 0-9 والجذور مع إبقاء المتغيرات العربية كما هي",
                    },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setArabicNotationMode(m.id);
                        setArabicMathDiagnostics(
                          transpileArabicMathNotationToLatex(liveArabicTestSnippet, m.id)
                        );
                      }}
                      className={`text-right p-2 rounded-xl border transition cursor-pointer ${
                        arabicNotationMode === m.id
                          ? "bg-amber-500/15 border-amber-400 text-white"
                          : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-[11px] font-black flex items-center justify-between">
                        <span>{m.label}</span>
                        {arabicNotationMode === m.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-300">
                    مختبر التحويل الفوري للترميز الرياضي العربي (اختبر أي عبارة تراثية):
                  </span>
                  {arabicMathDiagnostics && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      رموز عربية مرصودة: {arabicMathDiagnostics.detectedArabicMathTokensCount} · تعزيز الدقة: +{arabicMathDiagnostics.notationConfidenceBoostPct}%
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={liveArabicTestSnippet}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLiveArabicTestSnippet(val);
                    setArabicMathDiagnostics(
                      transpileArabicMathNotationToLatex(val, arabicNotationMode)
                    );
                  }}
                  placeholder="أدخل معادلة بالترميز الرياضي العربي مثل: نها_{س ← 0} جا(س)/س = 1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-medium"
                />

                {arabicMathDiagnostics && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="text-slate-400 font-bold">النتيجة المحولة إلى LaTeX قياسي:</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            arabicMathDiagnostics.transpiledText,
                            "arabic_latex_out"
                          )
                        }
                        className="text-cyan-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>نسخ الصيغة</span>
                      </button>
                    </div>
                    <div
                      dir="ltr"
                      className="font-mono text-xs text-emerald-300 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 overflow-x-auto"
                    >
                      {arabicMathDiagnostics.transpiledText}
                    </div>

                    {arabicMathDiagnostics.convertedTokensLog.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {arabicMathDiagnostics.convertedTokensLog.map((tok, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-900 border border-amber-500/30 text-[10px] text-amber-200 font-mono"
                            title={tok.descriptionAr}
                          >
                            {tok.arabicToken} → {tok.latexReplacement} (×{tok.occurrences})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* قاموس الرموز الرياضية العربية المدعومة */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  {ARABIC_MATH_NOTATION_DICTIONARY.slice(0, 8).map((entry) => (
                    <span
                      key={entry.id}
                      className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                      title={entry.descriptionAr}
                    >
                      {entry.arabicDisplay} = {entry.standardLatex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              المرحلة 2 من خارطة الطريق الاستراتيجية:
              المحرك الجبري الرمزي المحلي لتكافؤ الخطوات الاستدلالية وحساب النقط الجزئية (CAS Step Verifier)
             ===================================================================== */}
          <div className="bg-slate-950/95 border border-indigo-500/35 rounded-2xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-400/40 text-indigo-300 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-black text-white">
                      المحرك الجبري الرمزي المحلي لتكافؤ الخطوات الاستدلالية وحساب النقط الجزئية (CAS Step-Equivalence Verifier)
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      Roadmap Phase 2 · MathJS Symbolic & Follow-Through Credit
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400">
                    يفحص تكافؤ كل سطر جبري مع السطر السابق ومع الحل المرجعي، ويمنح نقطة التمشي الجزئية (المذكرة 142-08) حتى عند وقوع خطأ حسابي عابر
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black">
                  النقطة المقترحة آلياً: {casVerificationResult.recommendedAwardedPoints.toFixed(2)} / {casVerificationResult.maxPoints.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start bg-slate-900/75 p-3 rounded-xl border border-slate-800">
              <div className="lg:col-span-5 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-slate-300">
                    الصيغة المرجعية للحل (LaTeX / MathJS):
                  </label>
                  <select
                    value={casMaxPoints}
                    onChange={(e) => setCasMaxPoints(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 font-mono text-amber-300 font-bold text-[11px]"
                  >
                    {[1, 1.5, 2, 2.5, 3].map((pts) => (
                      <option key={pts} value={pts}>
                        السلم: {pts} ن
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  dir="ltr"
                  value={casRefLatex}
                  onChange={(e) => setCasRefLatex(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-emerald-300"
                />

                <label className="font-bold text-slate-300 block pt-1">
                  خطوات التلميذ المتتالية (سطر لكل مرحلة تحرير):
                </label>
                <textarea
                  dir="ltr"
                  rows={3}
                  value={casStepsText}
                  onChange={(e) => setCasStepsText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-xs text-white"
                />
              </div>

              <div className="lg:col-span-7 space-y-1.5">
                <div className="text-[11px] font-bold text-indigo-300">
                  {casVerificationResult.reasoningVerdictAr}
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {casVerificationResult.steps.map((st) => (
                    <div
                      key={st.stepIndex}
                      className={`p-2 rounded-lg border text-[11px] flex flex-wrap items-center justify-between gap-2 ${
                        st.status === "EQUIVALENT_TO_REF"
                          ? "bg-emerald-950/35 border-emerald-500/40 text-emerald-200"
                          : st.status === "FOLLOW_THROUGH_VALID"
                          ? "bg-amber-950/35 border-amber-500/40 text-amber-200"
                          : "bg-rose-950/35 border-rose-500/40 text-rose-200"
                      }`}
                    >
                      <span className="font-semibold">{st.diagnosticCommentAr}</span>
                      <span dir="ltr" className="font-mono text-[10.5px] bg-slate-950/80 px-2 py-0.5 rounded">
                        {st.rawStepLatex} → {st.simplifiedForm}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              الوضع الأول: التصحيح التلقائي للأوراق الممسوحة ضوئياً وإنتاج وثيقة التصحيح
             ===================================================================== */}
          {studioMode === "STUDENT_PAPER_AUTO_GRADER" && (
            <div className="space-y-4">
              {/* منطقة رفع ورقة التلميذ الممسوحة أو اختبار ورقة جاهزة */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-7 bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-center items-center text-center transition group relative">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    disabled={isScanning}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    title="ارفع صورة أو PDF لورقة إجابة التلميذ الممسوحة ضوئياً"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-black text-white">
                    ارفع صورة أو PDF لورقة إجابة التلميذ الممسوحة ضوئياً للتصحيح التلقائي
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    يقرأ الذكاء الاصطناعي خط اليد والمعادلات الرياضية، يقارنها بسلم التنقيط (142-08)، وينتج وثيقة التصحيح المؤشرة باللون الأحمر جاهزة للطباعة
                  </p>
                  {fileInfo && (
                    <div className="mt-2.5 px-3 py-1 bg-slate-900 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {fileInfo.name} ({fileInfo.sizeKb} KB)
                      </span>
                    </div>
                  )}
                </div>

                {/* إعداد رمز الورقة ونماذج الأوراق الممسوحة الجاهزة للتجربة الفورية */}
                <div className="md:col-span-5 bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-300">
                      رمز ورقة التحرير (لتوثيق المطبوع):
                    </label>
                    <input
                      type="text"
                      value={studentCopyCode}
                      onChange={(e) => setStudentCopyCode(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-mono text-cyan-300 w-36 text-left"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تجربة التصحيح التلقائي وإنتاج الوثيقة فوراً:</span>
                    </span>
                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={() =>
                        handleLoadSampleStudentPaper(
                          "COPIE-2BAC-PC-01",
                          "Copie_Eleve_2BAC_PC_Suites_Fonctions.png"
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between transition cursor-pointer"
                    >
                      <span>تصحيح ورقة 2BAC علوم فيزيائية (متتاليات ودوال)</span>
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                        تصحيح فوري →
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={() =>
                        handleLoadSampleStudentPaper(
                          "COPIE-2BAC-SM-04",
                          "Copie_Eleve_2BAC_SM_Analyse.png"
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between transition cursor-pointer"
                    >
                      <span>تصحيح ورقة 2BAC علوم رياضية (تحليل وتكامل)</span>
                      <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">
                        تصحيح فوري →
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* شريط التقدم أثناء القراءة الضوئية والتصحيح */}
              {isScanning && (
                <div className="bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-4 space-y-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {scanStep === 1 &&
                        "1/3 جاري قراءة خط اليد واستخراج المعادلات الرياضية عبر OCR..."}
                      {scanStep === 2 &&
                        "2/3 مطابقة خطوات الاستدلال مع سلم التنقيط الرسمي (142-08) وحساب النقط الجزئية..."}
                      {scanStep === 3 &&
                        "3/3 توليد ملاحظات المصحح باللون الأحمر وإعداد وثيقة التصحيح والدعم للطباعة..."}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {scanStep === 1 ? "35%" : scanStep === 2 ? "72%" : "96%"}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
                      style={{
                        width:
                          scanStep === 1
                            ? "35%"
                            : scanStep === 2
                            ? "72%"
                            : "96%",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* عرض نتائج التصحيح التلقائي والوثيقة الرسمية الجاهزة للطباعة */}
              {gradingReport && !isScanning && (
                <div className="space-y-4">
                  {/* شريط الإجراءات العليا لإنتاج وتصدير وثيقة التصحيح */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center">
                        <span className="text-[10px] text-emerald-300 block font-bold">
                          النقطة النهائية المقترحة
                        </span>
                        <span className="text-xl font-black text-white font-mono">
                          {gradingReport.totalAwardedPoints}{" "}
                          <span className="text-xs text-emerald-300">
                            / {gradingReport.totalMaxPoints}
                          </span>
                        </span>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                          <span>
                            وثيقة التصحيح الآلي المؤشرة للورقة ({gradingReport.studentCopyCode})
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            دقة التعرف: {gradingReport.confidenceScore}%
                          </span>
                          {mathSyntaxSummary && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              سلامة LaTeX: {mathSyntaxSummary.integrityScorePct}%
                              {mathSyntaxSummary.fixesAppliedCount > 0
                                ? ` · إصلاحات آلية: ${mathSyntaxSummary.fixesAppliedCount}`
                                : ""}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {gradingModelUsed} · وثيقة جاهزة للطباعة والتسليم أو الإدراج في محرر الوثائق
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isExportingGradingPdf}
                        onClick={handleExportGradingSheetPdf}
                        className="px-4 py-2 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition"
                      >
                        <Printer className="w-4 h-4" />
                        <span>
                          {isExportingGradingPdf
                            ? "جاري توليد PDF..."
                            : "تصدير وطباعة وثيقة التصحيح المؤشرة (PDF A4)"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleInjectRemediationIntoMainDocument}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer transition shadow-md"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>إدراج وثيقة الاستدراك والتصحيح في المحرر</span>
                      </button>
                    </div>
                  </div>

                  {/* معاينة الوثيقة الرسمية المطبوعة (A4 Printable Annotated Correction & Remediation Sheet) */}
                  <div className="bg-slate-950 p-3 sm:p-5 rounded-2xl border border-slate-800 overflow-x-auto">
                    <div
                      id="printable-ocr-student-grading-sheet"
                      dir="rtl"
                      className="bg-white text-slate-900 rounded-xl p-6 max-w-4xl mx-auto shadow-xl border border-slate-300 space-y-4"
                    >
                      {/* ترويسة وثيقة التصحيح المطبوعة */}
                      <div className="flex flex-wrap items-center justify-between border-b-2 border-slate-900 pb-3 gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-black text-slate-950">
                            المملكة المغربية · وزارة التربية الوطنية والتعليم الأولي والرياضة
                          </div>
                          <div className="font-bold text-slate-700">
                            المؤسسة: {schoolName} · الأستاذ(ة): {profName}
                          </div>
                          <div className="text-slate-600">
                            الموسم الدراسي: {academicYear} · المسلك: {targetTrackCode}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="inline-block px-3.5 py-1 rounded-lg bg-slate-900 text-white font-black text-xs sm:text-sm">
                            وثيقة التصحيح الآلي المفصل وبطاقة استدراك الأخطاء (OCR)
                          </div>
                          <div className="text-[11px] font-mono font-bold text-slate-600 mt-1">
                            رمز الورقة الممسوحة: {gradingReport.studentCopyCode}
                          </div>
                        </div>

                        <div className="border-2 border-rose-700 bg-rose-50/70 rounded-xl px-4 py-2 text-center">
                          <div className="text-[10px] font-bold text-rose-900">
                            النقطة النهائية الممنوحة
                          </div>
                          <div className="text-xl font-black font-mono text-rose-700">
                            {gradingReport.totalAwardedPoints} / {gradingReport.totalMaxPoints}
                          </div>
                        </div>
                      </div>

                      {/* الملاحظة التربوية العامة على الورقة */}
                      <div className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs space-y-1">
                        <div className="font-black text-slate-900 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-indigo-700" />
                          <span>التقدير البيداغوجي العام للورقة الممسوحة ضوئياً:</span>
                        </div>
                        <p className="text-slate-800 font-medium leading-relaxed">
                          {gradingReport.generalAppreciationAr}
                        </p>
                      </div>

                      {/* جدول تفصيل التنقيط وملاحظات المصحح باللون الأحمر */}
                      <div className="space-y-2">
                        <h4 className="font-black text-xs sm:text-sm text-slate-950 flex items-center gap-1.5">
                          <PenTool className="w-4 h-4 text-rose-600" />
                          <span>
                            أولاً: جدول تفصيل الإجابات الممسوحة ضوئياً، سلم التنقيط الجزئي، وملاحظات المصحح:
                          </span>
                        </h4>

                        <table className="w-full border-collapse border border-slate-400 text-[11px]">
                          <thead>
                            <tr className="bg-slate-900 text-white font-bold">
                              <th className="border border-slate-700 p-2 w-24">السؤال</th>
                              <th className="border border-slate-700 p-2">
                                إجابة التلميذ المستخرجة عبر OCR (LaTeX)
                              </th>
                              <th className="border border-slate-700 p-2">
                                عناصر الإجابة المرجعية وملاحظة المصحح (بالأحمر)
                              </th>
                              <th className="border border-slate-700 p-2 w-20 text-center">
                                النقطة
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {gradingReport.gradedItems.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-300 align-top">
                                <td className="border border-slate-300 p-2 font-bold text-slate-900 bg-slate-50">
                                  <div>{item.questionRef}</div>
                                  <span
                                    className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                                      item.status === "CORRECT"
                                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                        : item.status === "PARTIAL"
                                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                                        : "bg-rose-100 text-rose-900 border border-rose-300"
                                    }`}
                                  >
                                    {item.status === "CORRECT"
                                      ? "جواب سليم"
                                      : item.status === "PARTIAL"
                                      ? "نقطة جزئية"
                                      : "جواب خاطئ"}
                                  </span>
                                </td>

                                <td className="border border-slate-300 p-2 font-mono text-[10.5px] text-slate-800 bg-white">
                                  <div dir="ltr" className="text-left break-words">
                                    {item.studentAnswerLatex}
                                  </div>
                                </td>

                                <td className="border border-slate-300 p-2 space-y-1">
                                  <div
                                    dir="ltr"
                                    className="font-mono text-[10px] text-teal-900 bg-teal-50/70 p-1.5 rounded border border-teal-200 text-left"
                                  >
                                    Réf: {item.referenceSolutionLatex}
                                  </div>
                                  <div
                                    className={`font-bold text-[10.5px] p-1.5 rounded ${
                                      item.status === "CORRECT"
                                        ? "text-emerald-800 bg-emerald-50/60"
                                        : "text-rose-700 bg-rose-50/80 border border-rose-200"
                                    }`}
                                  >
                                    {item.redPenCommentAr}
                                  </div>
                                </td>

                                <td className="border border-slate-300 p-2 text-center font-mono font-black text-xs">
                                  <span
                                    className={
                                      item.status === "CORRECT"
                                        ? "text-emerald-700"
                                        : "text-rose-700"
                                    }
                                  >
                                    {item.awardedPoints}
                                  </span>{" "}
                                  <span className="text-slate-500 text-[10px]">
                                    / {item.maxPoints}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* بطاقة استدراك الأخطاء المرصودة وتمرين الدعم الموجه للطباعة */}
                      <div className="border-2 border-indigo-900 rounded-xl p-4 bg-indigo-50/30 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between border-b border-indigo-200 pb-1.5">
                          <span className="font-black text-indigo-950 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span>
                              ثانياً: بطاقة تشخيص الأخطاء المرصودة في الورقة وتمرين الاستدراك الموجه:
                            </span>
                          </span>
                          <span className="text-[10px] font-mono bg-indigo-950 text-amber-300 px-2 py-0.5 rounded font-bold">
                            دعم فردي مخصص (Note 142-08)
                          </span>
                        </div>

                        <div>
                          <span className="font-bold text-slate-900 block mb-1">
                            التعثرات المنهجية المرصودة في هذه الورقة:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-rose-900 font-semibold text-[11px]">
                            {gradingReport.printableRemediationSheet.diagnosedGapsAr.map(
                              (gap, gIdx) => (
                                <li key={gIdx}>{gap}</li>
                              )
                            )}
                          </ul>
                        </div>

                        {gradingReport.printableRemediationSheet.remediationExercises.map(
                          (rem, rIdx) => (
                            <div
                              key={rIdx}
                              className="bg-white border border-indigo-200 rounded-lg p-3 space-y-1.5 text-[11px]"
                            >
                              <div className="font-black text-indigo-950">
                                ✍️ {rem.titleAr}
                              </div>
                              <div className="space-y-1 text-slate-800 font-medium">
                                {rem.questionsAr.map((q, qIdx) => (
                                  <div key={qIdx}>{q}</div>
                                ))}
                              </div>
                              <div className="text-[10.5px] text-teal-900 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 font-semibold">
                                💡 إرشاد التحرير السليم: {rem.solutionHintAr}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              الوضع الثاني: مسح موضوع فرض (OCR) ومطابقته مع المنهاج بصيغة JSON
             ===================================================================== */}
          {studioMode === "EXAM_CURRICULUM_MAPPER" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-8 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 flex flex-col justify-center items-center text-center transition group relative">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    disabled={isScanning}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    title="اضغط لرفع صورة أو وثيقة PDF لفرض محروس"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    اضغط هنا أو اسحب صورة موضوع الفرض (PNG / JPG / WebP) أو وثيقة PDF
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    استخراج نص وتمارين الفرض وتحويلها آلياً إلى صيغة المنهاج الرسمي (JSON) لإنتاج وثيقة جديدة
                  </p>
                  {fileInfo && (
                    <div className="mt-2.5 px-3 py-1 bg-slate-900 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {fileInfo.name} ({fileInfo.sizeKb} KB)
                      </span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>نماذج جاهزة للاختبار الفوري:</span>
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLoadSampleExam("2BAC_SM")}
                      disabled={isScanning}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-950/70 border border-slate-800 text-[11px] font-bold text-slate-200 hover:text-white flex items-center justify-between transition cursor-pointer text-right"
                    >
                      <span>فرض 2BAC علوم رياضية (متتاليات ودوال)</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleExam("2BAC_PC")}
                      disabled={isScanning}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-950/70 border border-slate-800 text-[11px] font-bold text-slate-200 hover:text-white flex items-center justify-between transition cursor-pointer text-right"
                    >
                      <span>فرض 2BAC علوم تجريبية (اتصال واشتقاق)</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleExam("1BAC")}
                      disabled={isScanning}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-950/70 border border-slate-800 text-[11px] font-bold text-slate-200 hover:text-white flex items-center justify-between transition cursor-pointer text-right"
                    >
                      <span>فرض 1BAC علوم (منطق ودوال ومرجح)</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                    </button>
                  </div>
                </div>
              </div>

              {scanResult && !isScanning && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 border border-slate-800 rounded-2xl p-2.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab("CURRICULUM_MAPPING")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          activeTab === "CURRICULUM_MAPPING"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "bg-slate-900 text-slate-300 hover:text-white"
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>المطابقة مع المنهاج التربوي</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("RAW_TEXT")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          activeTab === "RAW_TEXT"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "bg-slate-900 text-slate-300 hover:text-white"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>النص المستخرج عبر الـ OCR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("JSON_SCHEMA")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          activeTab === "JSON_SCHEMA"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "bg-slate-900 text-slate-300 hover:text-white"
                        }`}
                      >
                        <FileCode2 className="w-3.5 h-3.5" />
                        <span>كود المنهاج بصيغة JSON</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        دقة المسح: {scanResult.confidenceScore}%
                      </span>
                      {mathSyntaxSummary && (
                        <span className="font-mono px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          سلامة الصيغ الرياضية: {mathSyntaxSummary.integrityScorePct}%
                          {mathSyntaxSummary.fixesAppliedCount > 0
                            ? ` · إصلاحات آلية: ${mathSyntaxSummary.fixesAppliedCount}`
                            : ""}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleApplyToActiveExam}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>اعتماد وتطبيق الفرض في المحرر</span>
                      </button>
                    </div>
                  </div>

                  {activeTab === "CURRICULUM_MAPPING" && (
                    <div className="space-y-2">
                      {scanResult.suggestedCurriculumMapping.exercises.map(
                        (ex, idx) => (
                          <div
                            key={ex.id || idx}
                            className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs sm:text-sm font-bold text-white">
                                {idx + 1}. {ex.titleAr} ({ex.titleFr})
                              </h4>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30 text-[10.5px] font-mono font-bold">
                                {ex.points} نقط
                              </span>
                            </div>
                            <div className="bg-slate-900/90 rounded-xl p-2.5 space-y-1 text-[11px] text-slate-200">
                              {ex.questionsAr.map((q, qIdx) => (
                                <div key={qIdx}>{q}</div>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {activeTab === "RAW_TEXT" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>النص المستخرج (LaTeX / Markdown):</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(editableOcrText, "ocr_raw")}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedField === "ocr_raw" ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>نسخ النص</span>
                        </button>
                      </div>
                      <textarea
                        value={editableOcrText}
                        onChange={(e) => setEditableOcrText(e.target.value)}
                        rows={10}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 font-mono"
                      />
                    </div>
                  )}

                  {activeTab === "JSON_SCHEMA" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-mono text-cyan-300">
                          Curriculum Schema (JSON):
                        </span>
                        <button
                          type="button"
                          onClick={handleDownloadJson}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer border border-amber-400/30"
                        >
                          <Download className="w-3 h-3" />
                          <span>تحميل .json</span>
                        </button>
                      </div>
                      <pre className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-72">
                        {JSON.stringify(
                          scanResult.suggestedCurriculumMapping,
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
