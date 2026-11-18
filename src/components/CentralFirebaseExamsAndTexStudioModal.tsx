import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  Cloud,
  CloudUpload,
  Code2,
  Copy,
  Database,
  Download,
  Eye,
  FileCode2,
  FilePlus2,
  FileText,
  Filter,
  FolderOpen,
  Layers,
  Play,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  CURRICULUM_DB,
  LessonItem,
  ModuleType,
  SemesterType,
} from "../data/curriculum";

type TrackData = (typeof CURRICULUM_DB)[string];
import {
  decodeTexArrayBufferWithAutoEncoding,
  LatexImportMergeMode,
  mergeImportedLatexIntoSource,
  normalizeExternalTexToPlatformSystem,
  PlatformNormalizedTexBundle,
  PlatformTexNormalizationOptions,
} from "../utils/latexImporterAndSeyesEngine";
import {
  CreateSavedExamInput,
  deleteSavedExamFromFirebase,
  firebaseAuth,
  SavedExamDocumentType,
  SavedExamRecord,
  saveExamToFirebaseFirestore,
  signInToFirebaseForExams,
  subscribeToUserSavedExams,
  syncAllLocalExamsToFirebase,
  toggleSavedExamFavorite,
} from "../services/firebaseExamsService";

export type CentralHubTabId = "FIREBASE_DASHBOARD" | "TEX_DIRECT_IMPORTER";

export interface CentralFirebaseExamsAndTexStudioModalProps {
  isOpen: boolean;
  initialTab?: CentralHubTabId;
  onClose: () => void;
  currentTrack: TrackData;
  semester: SemesterType;
  dsKey: string;
  examModel: "A" | "B";
  activeModule: ModuleType;
  school: string;
  prof: string;
  year: string;
  totalPoints: number;
  totalQuestions: number;
  n1: number;
  n2: number;
  n3: number;
  currentLessons: LessonItem[];
  currentLatexSource: string;
  onLoadExamIntoStudio: (payload: {
    trackCode: string;
    semester: SemesterType;
    dsKey: string;
    examModel: "A" | "B";
    moduleType: ModuleType;
    titleAr: string;
    lessons: LessonItem[];
    latexSource: string;
    n1: number;
    n2: number;
    n3: number;
  }) => void;
  onApplyNormalizedTexToStudio: (payload: {
    mergedLatexSource: string;
    extractedLessons: LessonItem[];
    fileName: string;
    summaryAr: string;
  }) => void;
  onNotify?: (type: "success" | "info" | "warning", text: string) => void;
}

const SAMPLE_EXTERNAL_TEX_TEMPLATES: Array<{
  id: string;
  labelAr: string;
  fileName: string;
  rawTex: string;
}> = [
  {
    id: "sample_ds_2bac_pc",
    labelAr: "نموذج فرض محروس خارجي (تحليل ومتتاليات - 2BAC)",
    fileName: "devoir_surveille_analyse_2bac.tex",
    rawTex: `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb}
\\begin{document}

\\begin{exercise}{دراسة دالة عددية وحساب التكامل (12 نقطة)}
نعتبر الدالة العددية $f$ المعرفة على $]0,+\\infty[$ بما يلي:
$$f(x) = x - 1 + \\frac{\\ln(x)}{x}$$
\\begin{enumerate}
\\item[a)] أحسب $\\lim_{x \\to 0^+} f(x)$ و $\\lim_{x \\to +\\infty} f(x)$ ثم أول النتيجتين هندسيا. (2 pts)
\\item[b)] بين أن لكل $x \\in ]0,+\\infty[$ لدينا $f'(x) = \\frac{x^2 + 1 - \\ln(x)}{x^2}$. (2.5 pts)
\\item[c)] استنتج أن الدالة $f$ تزايدية قطعا على المجال $]0,+\\infty[$ وضع جدول تغيراتها. (2 pts)
\\item[d)] أحسب باستعمال المكاملة بالأجزاء التكامل $I = \\int_1^e \\frac{\\ln(x)}{x^2} dx$. (2.5 pts)
\\end{enumerate}
\\end{exercise}

\\begin{exercise}{المتتاليات العددية الترجعية (8 نقط)}
نعتبر المتتالية العددية $(u_n)$ المعرفة بـ $u_0 = 2$ و $u_{n+1} = \\frac{3u_n + 2}{u_n + 2}$ لكل $n \\in \\mathbb{N}$.
\\begin{enumerate}
\\item[a)] بين بالترجع أن $u_n > 1$ لكل $n \\in \\mathbb{N}$. (2 pts)
\\item[b)] أدرس رتابة المتتالية $(u_n)$ واستنتج أنها متقاربة. (3 pts)
\\item[c)] نضع $v_n = \\frac{u_n - 2}{u_n + 1}$. بين أن $(v_n)$ هندسية محددا أساسها ونهاية $(u_n)$. (3 pts)
\\end{enumerate}
\\end{exercise}

\\end{document}`,
  },
  {
    id: "sample_complex_space",
    labelAr: "نموذج سلسلة الأعداد العقدية والهندسة الفضائية (.tex)",
    fileName: "serie_complexes_geometrie_3d.tex",
    rawTex: `\\documentclass[11pt,a4paper]{article}
\\usepackage{amsmath,amssymb}
\\begin{document}

\\begin{problem}{الأعداد العقدية والتحويلات النقطية (10 نقط)}
في المستوى العقدي المنسوب إلى معلم متعامد ممنظم مباشر $(O,\\vec{u},\\vec{v})$، نعتبر النقط $A(1+i\\sqrt{3})$ و $B(2i)$ و $C(-1+i\\sqrt{3})$.
\\begin{enumerate}
\\item[a)] أكتب العددين $z_A$ و $z_C$ على الشكل المثلثي والشكلي الأسي. (2.5 pts)
\\item[b)] أحسب النسبة $\\frac{z_C - z_B}{z_A - z_B}$ واستنتج طبيعة المثلث $ABC$. (2.5 pts)
\\item[c)] حدد الكتابة العقدية للدوران $R$ الذي مركزه $B$ وزاويته $\\frac{\\pi}{3}$. (2.5 pts)
\\end{enumerate}
\\end{problem}

\\begin{problem}{الهندسة الفضائية والفلكة (10 نقط)}
في الفضاء المنسوب إلى معلم متعامد ممنظم مباشر $(O,\\vec{i},\\vec{j},\\vec{k})$، نعتبر الفلكة $(S): x^2 + y^2 + z^2 - 2x + 4y - 6z + 5 = 0$ والمستوى $(P): 2x - y + 2z - 3 = 0$.
\\begin{enumerate}
\\item[a)] حدد المركز $\\Omega$ والشعاع $R$ للفلكة $(S)$. (2 pts)
\\item[b)] أحسب المسافة $d(\\Omega, (P))$ واستنتج أن المستوى $(P)$ يقطع الفلكة $(S)$ وفق دائرة $(C)$. (3 pts)
\\item[c)] حدد مثلوث إحداثيات مركز الدائرة $(C)$ وشعاعها $r$. (2.5 pts)
\\end{enumerate}
\\end{problem}

\\end{document}`,
  },
];

export const CentralFirebaseExamsAndTexStudioModal: React.FC<
  CentralFirebaseExamsAndTexStudioModalProps
> = ({
  isOpen,
  initialTab = "FIREBASE_DASHBOARD",
  onClose,
  currentTrack,
  semester,
  dsKey,
  examModel,
  activeModule,
  school,
  prof,
  year,
  totalPoints,
  totalQuestions,
  n1,
  n2,
  n3,
  currentLessons,
  currentLatexSource,
  onLoadExamIntoStudio,
  onApplyNormalizedTexToStudio,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<CentralHubTabId>(initialTab);
  const [savedExams, setSavedExams] = useState<SavedExamRecord[]>([]);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [isSavingCurrent, setIsSavingCurrent] = useState<boolean>(false);
  const [firestoreErrorBanner, setFirestoreErrorBanner] = useState<string | null>(
    null
  );

  // Dashboard filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTrack, setFilterTrack] = useState<string>("ALL");
  const [filterSemester, setFilterSemester] = useState<"ALL" | "1" | "2">("ALL");
  const [filterDocType, setFilterDocType] = useState<string>("ALL");
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [previewLatexExamId, setPreviewLatexExamId] = useState<string | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Quick Save current exam form state
  const [draftTitleAr, setDraftTitleAr] = useState<string>(
    `الفرض المحروس (${dsKey}) — ${currentTrack.labelAr}`
  );
  const [draftDocType, setDraftDocType] = useState<SavedExamDocumentType>(
    activeModule === "DM_SERIE"
      ? "DM_SERIE"
      : activeModule === "FICHE_OP2007"
        ? "FICHE_OP2007"
        : "DS_142_08"
  );

  // Direct .tex Importer state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importedFileName, setImportedFileName] = useState<string>(
    SAMPLE_EXTERNAL_TEX_TEMPLATES[0].fileName
  );
  const [rawImportedTex, setRawImportedTex] = useState<string>(
    SAMPLE_EXTERNAL_TEX_TEMPLATES[0].rawTex
  );
  const [normTheme, setNormTheme] =
    useState<PlatformTexNormalizationOptions["targetTheme"]>("TCOLORBOX_ROYAL");
  const [subQuestionStyle, setSubQuestionStyle] =
    useState<PlatformTexNormalizationOptions["subQuestionStyle"]>("ARABIC_ABJAD");
  const [autoInjectPreamble, setAutoInjectPreamble] = useState<boolean>(true);
  const [normalizeBareme, setNormalizeBareme] = useState<boolean>(true);
  const [mergeMode, setMergeMode] =
    useState<LatexImportMergeMode>("REPLACE_ENTIRE_CODE");
  const [isSavingImportedToFirebase, setIsSavingImportedToFirebase] =
    useState<boolean>(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setDraftTitleAr(`الفرض المحروس (${dsKey}) — ${currentTrack.labelAr}`);
  }, [dsKey, currentTrack.labelAr]);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToUserSavedExams(
      (records, cloudActive) => {
        setSavedExams(records);
        setIsCloudConnected(cloudActive);
      },
      (errMsg) => {
        setFirestoreErrorBanner(errMsg);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  // Compute total sub-questions in current studio lessons
  const currentSubQuestionsCount = useMemo(() => {
    let count = 0;
    for (const lesson of currentLessons) {
      for (const q of lesson.sampleExerciseAr || []) {
        const matches = q.match(/(?:أ\)|ب\)|ج\)|د\)|a\)|b\)|c\)|d\))/g);
        count += matches ? matches.length : 2;
      }
    }
    return count;
  }, [currentLessons]);

  // Normalized .tex live bundle
  const normalizedBundle: PlatformNormalizedTexBundle = useMemo(() => {
    return normalizeExternalTexToPlatformSystem(
      importedFileName,
      rawImportedTex,
      {
        targetTheme: normTheme,
        subQuestionStyle,
        autoInjectPlatformPreamble: autoInjectPreamble,
        normalizeBaremePoints: normalizeBareme,
        schoolName: school,
        professorName: prof,
        trackLabelAr: currentTrack.labelAr,
        academicYear: year,
      }
    );
  }, [
    importedFileName,
    rawImportedTex,
    normTheme,
    subQuestionStyle,
    autoInjectPreamble,
    normalizeBareme,
    school,
    prof,
    currentTrack.labelAr,
    year,
  ]);

  // Filtered exams in dashboard
  const filteredExams = useMemo(() => {
    return savedExams.filter((item) => {
      if (onlyFavorites && !item.isFavorite) return false;
      if (filterTrack !== "ALL" && item.trackCode !== filterTrack) return false;
      if (
        filterSemester !== "ALL" &&
        String(item.semester) !== filterSemester
      ) {
        return false;
      }
      if (filterDocType !== "ALL" && item.documentType !== filterDocType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay =
          `${item.titleAr} ${item.titleFr} ${item.trackLabelAr} ${item.examKey} ${item.professor} ${item.school}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    savedExams,
    onlyFavorites,
    filterTrack,
    filterSemester,
    filterDocType,
    searchQuery,
  ]);

  // Dashboard KPI metrics
  const kpiStats = useMemo(() => {
    const total = savedExams.length;
    const synced = savedExams.filter((x) => x.syncedToCloud).length;
    const importedTexCount = savedExams.filter(
      (x) =>
        x.sourceOrigin === "IMPORTED_TEX" || x.documentType === "IMPORTED_TEX"
    ).length;
    const favCount = savedExams.filter((x) => x.isFavorite).length;
    const totalSubQ = savedExams.reduce(
      (acc, x) => acc + (Number(x.totalSubQuestions) || 0),
      0
    );
    return { total, synced, importedTexCount, favCount, totalSubQ };
  }, [savedExams]);

  if (!isOpen) return null;

  const handleFirebaseSignIn = async () => {
    setIsSigningIn(true);
    setFirestoreErrorBanner(null);
    try {
      const user = await signInToFirebaseForExams();
      if (user) {
        onNotify?.(
          "success",
          `تم تسجيل الدخول بنجاح (${user.email}) وتفعيل المزامنة المباشرة مع قاعدة بيانات Firebase Firestore!`
        );
      }
    } catch (err: any) {
      setFirestoreErrorBanner(
        err?.message || "تعذر تسجيل الدخول إلى Firebase حالياً."
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSyncLocalToCloud = async () => {
    setIsSyncingAll(true);
    setFirestoreErrorBanner(null);
    try {
      const count = await syncAllLocalExamsToFirebase();
      onNotify?.(
        "success",
        `تمت مزامنة ${count} فرضاً مع قاعدة بيانات Firebase Firestore بنجاح!`
      );
    } catch (err: any) {
      setFirestoreErrorBanner(err?.message || "حدث خطأ أثناء المزامنة السحابية.");
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleSaveCurrentStudioExam = async () => {
    setIsSavingCurrent(true);
    setFirestoreErrorBanner(null);
    try {
      const input: CreateSavedExamInput = {
        titleAr:
          draftTitleAr.trim() ||
          `الفرض المحروس (${dsKey}) — ${currentTrack.labelAr}`,
        titleFr: `Devoir Surveillé (${dsKey}) — ${currentTrack.labelFr}`,
        documentType: draftDocType,
        trackCode: currentTrack.code,
        trackLabelAr: currentTrack.labelAr,
        semester: semester === "S2" ? 2 : 1,
        examKey: dsKey,
        examModel: examModel === "B" ? "B" : "A",
        duration: "2h",
        totalPoints: totalPoints || 20,
        totalQuestions: totalQuestions || currentLessons.length * 2,
        totalSubQuestions: currentSubQuestionsCount,
        n1,
        n2,
        n3,
        school,
        professor: prof,
        academicYear: year,
        latexSource:
          currentLatexSource?.trim() ||
          normalizedBundle.platformFormattedTex,
        lessons: currentLessons,
        isFavorite: false,
        sourceOrigin: "STUDIO_GENERATED",
      };
      const saved = await saveExamToFirebaseFirestore(input);
      onNotify?.(
        "success",
        saved.syncedToCloud
          ? `تم حفظ «${saved.titleAr}» في قاعدة بيانات Firebase Firestore بنجاح!`
          : `تم حفظ «${saved.titleAr}» في الخزانة المحلية (سجل الدخول لمزامنته سحابياً مع Firebase).`
      );
    } catch (err: any) {
      setFirestoreErrorBanner(err?.message || "تعذر حفظ الفرض في قاعدة البيانات.");
    } finally {
      setIsSavingCurrent(false);
    }
  };

  const handleDuplicateExamVariant = async (exam: SavedExamRecord) => {
    setFirestoreErrorBanner(null);
    try {
      let parsedLessons: LessonItem[] = [];
      try {
        parsedLessons = JSON.parse(exam.lessonsJson || "[]");
      } catch {
        parsedLessons = currentLessons;
      }
      const nextModel: "A" | "B" = exam.examModel === "A" ? "B" : "A";
      const saved = await saveExamToFirebaseFirestore({
        titleAr: `${exam.titleAr} (نسخة النموذج ${nextModel})`,
        titleFr: `${exam.titleFr} (Variante ${nextModel})`,
        documentType: exam.documentType,
        trackCode: exam.trackCode,
        trackLabelAr: exam.trackLabelAr,
        semester: exam.semester,
        examKey: exam.examKey,
        examModel: nextModel,
        duration: exam.duration,
        totalPoints: exam.totalPoints,
        totalQuestions: exam.totalQuestions,
        totalSubQuestions: exam.totalSubQuestions,
        n1: exam.n1,
        n2: exam.n2,
        n3: exam.n3,
        school: exam.school,
        professor: exam.professor,
        academicYear: exam.academicYear,
        latexSource: exam.latexSource,
        lessons: parsedLessons,
        isFavorite: exam.isFavorite,
        sourceOrigin: exam.sourceOrigin,
      });
      onNotify?.(
        "success",
        `تم إنشاء وحفظ النموذج الموازي (${saved.examModel}) للفرض «${exam.titleAr}» بنجاح!`
      );
    } catch (err: any) {
      setFirestoreErrorBanner(err?.message || "تعذر تكرار الفرض.");
    }
  };

  const handleFileUploadFromDevice = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const buffer = ev.target?.result;
      if (buffer instanceof ArrayBuffer) {
        const decoded = decodeTexArrayBufferWithAutoEncoding(buffer);
        setImportedFileName(file.name);
        setRawImportedTex(decoded.text);
        onNotify?.(
          "info",
          `تم قراءة ملف «${file.name}» من جهازك بترميز ${decoded.detectedEncoding} وتنسيقه آلياً مع نظام المنصة.`
        );
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleApplyTexToStudio = () => {
    const mergedSource = mergeImportedLatexIntoSource(
      currentLatexSource,
      {
        ...normalizedBundle.processed,
        normalizedCode: normalizedBundle.platformFormattedTex,
      },
      mergeMode
    );
    onApplyNormalizedTexToStudio({
      mergedLatexSource: mergedSource,
      extractedLessons: normalizedBundle.extractedLessonItems,
      fileName: importedFileName,
      summaryAr: normalizedBundle.processed.summaryAr,
    });
    onNotify?.(
      "success",
      `تم تطبيق ملف «${importedFileName}» في محرر LaTeX وتوليد ${normalizedBundle.extractedLessonItems.length} تمارين في المعاينة التفاعلية A4!`
    );
    onClose();
  };

  const handleApplyAndSaveTexToFirebase = async () => {
    setIsSavingImportedToFirebase(true);
    setFirestoreErrorBanner(null);
    try {
      const mergedSource = mergeImportedLatexIntoSource(
        currentLatexSource,
        {
          ...normalizedBundle.processed,
          normalizedCode: normalizedBundle.platformFormattedTex,
        },
        mergeMode
      );
      onApplyNormalizedTexToStudio({
        mergedLatexSource: mergedSource,
        extractedLessons: normalizedBundle.extractedLessonItems,
        fileName: importedFileName,
        summaryAr: normalizedBundle.processed.summaryAr,
      });

      const saved = await saveExamToFirebaseFirestore({
        titleAr: `وثيقة LaTeX مستوردة: ${importedFileName.replace(/\.tex$/i, "")}`,
        titleFr: `Document LaTeX importé : ${importedFileName.replace(/\.tex$/i, "")}`,
        documentType: "IMPORTED_TEX",
        trackCode: currentTrack.code,
        trackLabelAr: currentTrack.labelAr,
        semester: semester === "S2" ? 2 : 1,
        examKey: dsKey,
        examModel: examModel === "B" ? "B" : "A",
        duration: "2h",
        totalPoints: normalizedBundle.detectedBaremePointsTotal || 20,
        totalQuestions: normalizedBundle.extractedLessonItems.reduce(
          (acc, l) => acc + (l.sampleExerciseAr?.length || 1),
          0
        ),
        totalSubQuestions: normalizedBundle.detectedSubQuestionsCount,
        n1,
        n2,
        n3,
        school,
        professor: prof,
        academicYear: year,
        latexSource: normalizedBundle.platformFormattedTex,
        lessons: normalizedBundle.extractedLessonItems,
        isFavorite: true,
        sourceOrigin: "IMPORTED_TEX",
      });

      onNotify?.(
        "success",
        `تم تنسيق ملف «${importedFileName}» وتطبيقه في الورقة A4 وحفظه في قاعدة بيانات Firebase (${saved.id})!`
      );
      setActiveTab("FIREBASE_DASHBOARD");
    } catch (err: any) {
      setFirestoreErrorBanner(
        err?.message || "حدث خطأ أثناء حفظ ملف LaTeX المستورد في Firebase."
      );
    } finally {
      setIsSavingImportedToFirebase(false);
    }
  };

  const downloadTexFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".tex") ? filename : `${filename}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[93vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-slate-950 via-indigo-950 to-slate-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  لوحة القيادة المركزية للفروض (Firebase) واستوديو استيراد ملفات{" "}
                  <span className="font-mono text-amber-300">.tex</span>
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isCloudConnected
                      ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                      : "bg-amber-500/20 border-amber-400/40 text-amber-200"
                  }`}
                >
                  {isCloudConnected
                    ? `متصل سحابياً بـ Firestore (${firebaseAuth.currentUser?.email})`
                    : "وضع المرآة المحلية الفورية (متصل بـ Firebase عند تسجيل الدخول)"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                إدارة شاملة لجميع الفروض المحروسة المنجزة والمحفوظة في قاعدة بيانات Firebase Firestore + استيراد وتنسيق ملفات LaTeX الخارجية (.tex)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!firebaseAuth.currentUser ? (
              <button
                type="button"
                onClick={handleFirebaseSignIn}
                disabled={isSigningIn}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>
                  {isSigningIn
                    ? "جاري الاتصال بـ Firebase..."
                    : "تسجيل الدخول لمزامنة Firebase"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSyncLocalToCloud}
                disabled={isSyncingAll}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncingAll ? "animate-spin" : ""}`}
                />
                <span>
                  {isSyncingAll
                    ? "جاري المزامنة..."
                    : "مزامنة الكل مع Firestore"}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-5 pt-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("FIREBASE_DASHBOARD")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-black flex items-center gap-2 border-t border-x transition cursor-pointer ${
                activeTab === "FIREBASE_DASHBOARD"
                  ? "bg-white text-indigo-950 border-slate-200 shadow-sm"
                  : "bg-slate-200/70 text-slate-600 border-transparent hover:bg-slate-200"
              }`}
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span>
                1. لوحة القيادة المركزية للفروض المحفوظة (Firebase Firestore)
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-mono">
                {savedExams.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("TEX_DIRECT_IMPORTER")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-black flex items-center gap-2 border-t border-x transition cursor-pointer ${
                activeTab === "TEX_DIRECT_IMPORTER"
                  ? "bg-white text-emerald-950 border-slate-200 shadow-sm"
                  : "bg-slate-200/70 text-slate-600 border-transparent hover:bg-slate-200"
              }`}
            >
              <FileCode2 className="w-4 h-4 text-emerald-600" />
              <span>
                2. استيراد ملفات .tex مباشرة من الجهاز وتنسيقها لنظام المنصة
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-mono">
                LaTeX Studio
              </span>
            </button>
          </div>

          <div className="text-[11px] font-bold text-slate-500 pb-2">
            المسلك النشط:{" "}
            <span className="text-slate-900 font-black">
              {currentTrack.labelAr}
            </span>{" "}
            | الدورة {semester}
          </div>
        </div>

        {/* Error banner if any */}
        {firestoreErrorBanner && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center justify-between text-xs text-rose-900 font-bold">
            <span>تنبيه قاعدة البيانات: {firestoreErrorBanner}</span>
            <button
              type="button"
              onClick={() => setFirestoreErrorBanner(null)}
              className="text-rose-700 hover:underline"
            >
              إخفاء
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/60">
          {activeTab === "FIREBASE_DASHBOARD" ? (
            <>
              {/* 1. KPI Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-500">
                    إجمالي الفروض المحفوظة
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                    {kpiStats.total}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                    جاهزة للاسترجاع الفوري
                  </div>
                </div>
                <div className="bg-white border border-indigo-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-bold text-indigo-700">
                    المزامنة في Firebase Cloud
                  </div>
                  <div className="text-2xl font-black text-indigo-950 mt-1 font-mono">
                    {kpiStats.synced} / {kpiStats.total}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-bold mt-0.5">
                    مجموعة saved_exams
                  </div>
                </div>
                <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-bold text-emerald-700">
                    وثائق .tex المستوردة
                  </div>
                  <div className="text-2xl font-black text-emerald-950 mt-1 font-mono">
                    {kpiStats.importedTexCount}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                    منسقة مع tcolorbox
                  </div>
                </div>
                <div className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-bold text-amber-700">
                    الفروض المميزة بالمفضلة
                  </div>
                  <div className="text-2xl font-black text-amber-900 mt-1 font-mono">
                    {kpiStats.favCount} ★
                  </div>
                  <div className="text-[10px] text-amber-700 font-bold mt-0.5">
                    نماذج مرجعية للأستاذ
                  </div>
                </div>
                <div className="bg-white border border-purple-200 rounded-xl p-3.5 shadow-xs">
                  <div className="text-[11px] font-bold text-purple-700">
                    مجموع الأسئلة الفرعية (أ، ب، ج)
                  </div>
                  <div className="text-2xl font-black text-purple-950 mt-1 font-mono">
                    {kpiStats.totalSubQ}
                  </div>
                  <div className="text-[10px] text-purple-700 font-bold mt-0.5">
                    مهيكلة بسلم تنقيط مفصل
                  </div>
                </div>
              </div>

              {/* 2. Save Active Studio Document to Firebase Bar */}
              <div className="bg-gradient-to-l from-indigo-50 via-white to-emerald-50 border border-indigo-200 rounded-xl p-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <CloudUpload className="w-4 h-4 text-indigo-700" />
                    <h3 className="text-xs sm:text-sm font-black text-indigo-950">
                      حفظ الفرض المحروس / الوثيقة النشطة حالياً في الاستوديو داخل قاعدة بيانات Firebase
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">
                    يتضمن {currentLessons.length} تمارين ({currentSubQuestionsCount}{" "}
                    أسئلة فرعية) • {totalPoints}/20 نقطة • النموذج {examModel}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                  <div className="md:col-span-6">
                    <input
                      type="text"
                      value={draftTitleAr}
                      onChange={(e) => setDraftTitleAr(e.target.value)}
                      placeholder="عنوان الفرض المحروس أو السلسلة للحفظ في قاعدة البيانات..."
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold bg-white text-slate-900"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <select
                      value={draftDocType}
                      onChange={(e) =>
                        setDraftDocType(e.target.value as SavedExamDocumentType)
                      }
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold bg-white text-slate-900"
                    >
                      <option value="DS_142_08">
                        فرض محروس رسمي (المذكرة 142-08)
                      </option>
                      <option value="DM_SERIE">
                        فرض منزلي / سلسلة تمارين ودعم
                      </option>
                      <option value="FICHE_OP2007">
                        جذاذة بيداغوجية وملخص درس (OP 2007)
                      </option>
                      <option value="EXAMEN_BLANC">
                        امتحان تجريبي موحد (Examen Blanc)
                      </option>
                      <option value="IMPORTED_TEX">
                        فرض مستورد ومنسق من ملف .tex
                      </option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="button"
                      onClick={handleSaveCurrentStudioExam}
                      disabled={isSavingCurrent}
                      className="w-full py-2 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <CloudUpload className="w-4 h-4" />
                      <span>
                        {isSavingCurrent
                          ? "جاري الحفظ في Firebase..."
                          : "حفظ الفرض الحالي في Firebase"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Search & Filters Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2.5">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بعنوان الفرض، المسلك، اسم الأستاذ، المؤسسة، أو رمز الفرض (S1_F1)..."
                    className="w-full border border-slate-300 rounded-xl pr-9 pl-3 py-1.5 text-xs font-bold bg-slate-50 text-slate-900"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={filterTrack}
                    onChange={(e) => setFilterTrack(e.target.value)}
                    className="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-slate-50 text-slate-800"
                  >
                    <option value="ALL">جميع المسالك</option>
                    <option value="TCS">الجذع المشترك العلمي (TCS)</option>
                    <option value="1BAC_SE">الأولى باك علوم تجريبية (1BAC SE)</option>
                    <option value="1BAC_SM">الأولى باك علوم رياضية (1BAC SM)</option>
                    <option value="2BAC_PC">الثانية باك علوم فيزيائية (2BAC PC)</option>
                    <option value="2BAC_SVT">الثانية باك علوم الحياة والأرض (2BAC SVT)</option>
                    <option value="2BAC_SM">الثانية باك علوم رياضية (2BAC SM)</option>
                  </select>

                  <select
                    value={filterSemester}
                    onChange={(e) =>
                      setFilterSemester(e.target.value as "ALL" | "1" | "2")
                    }
                    className="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-slate-50 text-slate-800"
                  >
                    <option value="ALL">الدورتان (S1 + S2)</option>
                    <option value="1">الدورة الأولى (S1)</option>
                    <option value="2">الدورة الثانية (S2)</option>
                  </select>

                  <select
                    value={filterDocType}
                    onChange={(e) => setFilterDocType(e.target.value)}
                    className="border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-slate-50 text-slate-800"
                  >
                    <option value="ALL">كل أنواع الوثائق</option>
                    <option value="DS_142_08">فروض محروسة (142-08)</option>
                    <option value="DM_SERIE">سلاسل وفروض منزلية</option>
                    <option value="IMPORTED_TEX">ملفات .tex مستوردة</option>
                    <option value="EXAMEN_BLANC">امتحانات تجريبية</option>
                    <option value="FICHE_OP2007">جذاذات بيداغوجية</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setOnlyFavorites((v) => !v)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1 transition cursor-pointer ${
                      onlyFavorites
                        ? "bg-amber-100 border-amber-400 text-amber-900"
                        : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        onlyFavorites ? "fill-amber-500 text-amber-500" : ""
                      }`}
                    />
                    <span>المفضلة فقط</span>
                  </button>
                </div>
              </div>

              {/* 4. Saved Exams Cards Grid */}
              {filteredExams.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
                  <FolderOpen className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-black text-slate-800">
                    لا توجد فروض مطابقة لمعايير البحث الحالية.
                  </p>
                  <p className="text-xs text-slate-500">
                    يمكنك حفظ الفرض الحالي من الشريط أعلاه أو استيراد ملف .tex من التبويب الثاني.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {filteredExams.map((exam) => {
                    let parsedLessons: LessonItem[] = [];
                    try {
                      parsedLessons = JSON.parse(exam.lessonsJson || "[]");
                    } catch {
                      parsedLessons = [];
                    }
                    const isPreviewOpen = previewLatexExamId === exam.id;
                    const isConfirmingDelete = confirmDeleteId === exam.id;

                    return (
                      <div
                        key={exam.id}
                        className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 shadow-xs transition space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await toggleSavedExamFavorite(exam);
                                  } catch (err: any) {
                                    setFirestoreErrorBanner(
                                      err?.message || "تعذر تحديث حالة المفضلة."
                                    );
                                  }
                                }}
                                className="p-1 rounded-lg hover:bg-amber-50 text-amber-500 cursor-pointer"
                                title="تبديل المفضلة"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    exam.isFavorite
                                      ? "fill-amber-400 text-amber-500"
                                      : "text-slate-400"
                                  }`}
                                />
                              </button>
                              <h4 className="text-sm font-black text-slate-900">
                                {exam.titleAr}
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10px] font-black">
                                {exam.trackLabelAr}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-mono font-bold">
                                S{exam.semester} • {exam.examKey} • النموذج{" "}
                                {exam.examModel}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  exam.sourceOrigin === "IMPORTED_TEX" ||
                                  exam.documentType === "IMPORTED_TEX"
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                    : "bg-amber-50 border-amber-200 text-amber-900"
                                }`}
                              >
                                {exam.sourceOrigin === "IMPORTED_TEX" ||
                                exam.documentType === "IMPORTED_TEX"
                                  ? "مستورد من ملف .tex"
                                  : exam.documentType === "DM_SERIE"
                                    ? "سلسلة / فرض منزلي"
                                    : exam.documentType === "FICHE_OP2007"
                                      ? "جذاذة درس"
                                      : "فرض محروس 142-08"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  exam.syncedToCloud
                                    ? "bg-emerald-100 text-emerald-900"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {exam.syncedToCloud
                                  ? "☁️ محفوظ في Firebase"
                                  : "💾 محفوظ محلياً"}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-semibold pr-6">
                              <span>
                                🏫 {exam.school} — 👨‍🏫 {exam.professor} ({exam.academicYear})
                              </span>
                              <span>•</span>
                              <span>
                                📊 الباريم: <strong>{exam.totalPoints}/20</strong> ({parsedLessons.length} تمارين، {exam.totalQuestions} أسئلة، {exam.totalSubQuestions} فرعية)
                              </span>
                              <span>•</span>
                              <span>
                                🎯 صنافة المذكرة: N1({exam.n1}%) / N2({exam.n2}%) / N3({exam.n3}%)
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onLoadExamIntoStudio({
                                  trackCode: exam.trackCode,
                                  semester: exam.semester === 2 ? "S2" : "S1",
                                  dsKey: exam.examKey,
                                  examModel: exam.examModel,
                                  moduleType:
                                    exam.documentType === "DM_SERIE"
                                      ? "DM_SERIE"
                                      : exam.documentType === "FICHE_OP2007"
                                        ? "FICHE_OP2007"
                                        : "DS_142_08",
                                  titleAr: exam.titleAr,
                                  lessons: parsedLessons,
                                  latexSource: exam.latexSource,
                                  n1: exam.n1,
                                  n2: exam.n2,
                                  n3: exam.n3,
                                });
                                onNotify?.(
                                  "success",
                                  `تم استرجاع وتحميل «${exam.titleAr}» في الاستوديو والمعاينة التفاعلية A4 بنجاح!`
                                );
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>فتح في الاستوديو (A4)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setPreviewLatexExamId(
                                  isPreviewOpen ? null : exam.id
                                )
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                            >
                              <Code2 className="w-3.5 h-3.5 text-indigo-700" />
                              <span>{isPreviewOpen ? "إخفاء .tex" : "كود .tex"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                downloadTexFile(
                                  `${exam.trackCode}_${exam.examKey}_${exam.examModel}.tex`,
                                  exam.latexSource
                                )
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                              title="تنزيل ملف .tex"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>.tex</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateExamVariant(exam)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                              title="توليد نسخة موازية A/B في Firebase"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>
                                نموذج {exam.examModel === "A" ? "B" : "A"}
                              </span>
                            </button>

                            {!isConfirmingDelete ? (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(exam.id)}
                                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                                title="حذف من Firebase"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 bg-rose-100 border border-rose-300 rounded-xl px-2 py-1">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await deleteSavedExamFromFirebase(exam.id);
                                      setConfirmDeleteId(null);
                                      onNotify?.(
                                        "info",
                                        `تم حذف الفرض «${exam.titleAr}» من قاعدة البيانات.`
                                      );
                                    } catch (err: any) {
                                      setFirestoreErrorBanner(
                                        err?.message || "تعذر حذف الفرض."
                                      );
                                    }
                                  }}
                                  className="text-[10px] font-black text-rose-800 hover:underline cursor-pointer"
                                >
                                  تأكيد الحذف
                                </button>
                                <span className="text-rose-300">|</span>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-[10px] font-bold text-slate-600 hover:underline cursor-pointer"
                                >
                                  إلغاء
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Lessons pills */}
                        {parsedLessons.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pr-6">
                            {parsedLessons.map((les, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10.5px] font-bold"
                              >
                                التمرين {idx + 1}: {les.lessonAr}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Expandable LaTeX code preview */}
                        {isPreviewOpen && (
                          <div className="mt-2 bg-slate-950 text-emerald-300 rounded-xl p-3 font-mono text-[11px] overflow-x-auto max-h-56 dir-ltr text-left border border-slate-800">
                            <pre className="whitespace-pre-wrap">
                              {exam.latexSource}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* TAB 2: DIRECT .TEX IMPORTER & PLATFORM NORMALIZER */
            <div className="space-y-4">
              {/* Top Upload & Preset Bar */}
              <div className="bg-gradient-to-l from-emerald-50 via-white to-teal-50 border border-emerald-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-emerald-700" />
                      <span>
                        استيراد ملف <code className="font-mono">.tex</code> مباشرة من جهازك وتنسيقه مع نظام LaTeX بالمنصة
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      يدعم الكشف التلقائي عن الترميز (UTF-8 / Windows-1256 العربي / Windows-1252 الفرنسي) وتحويل البيئات إلى صناديق{" "}
                      <code className="font-mono text-emerald-800">exoBox / tcolorbox</code>{" "}
                      واستخراج التمارين والأسئلة الفرعية للمعاينة الحية A4.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".tex,.sty,.cls,.txt"
                      onChange={handleFileUploadFromDevice}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-sm"
                    >
                      <Upload className="w-4 h-4" />
                      <span>اختيار ملف .tex من الجهاز...</span>
                    </button>

                    {SAMPLE_EXTERNAL_TEX_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setImportedFileName(tpl.fileName);
                          setRawImportedTex(tpl.rawTex);
                        }}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                          importedFileName === tpl.fileName
                            ? "bg-emerald-100 border-emerald-400 text-emerald-950"
                            : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {tpl.labelAr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Normalization Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-emerald-200/70 text-xs">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      قالب تنسيق LaTeX بالمنصة:
                    </label>
                    <select
                      value={normTheme}
                      onChange={(e) =>
                        setNormTheme(
                          e.target.value as PlatformTexNormalizationOptions["targetTheme"]
                        )
                      }
                      className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold bg-white text-slate-900"
                    >
                      <option value="TCOLORBOX_ROYAL">
                        صناديق tcolorbox الملكية (Royal Blue)
                      </option>
                      <option value="MOROCCAN_142_08">
                        النمط الرسمي المغربي (142-08 Teal)
                      </option>
                      <option value="FRENCH_BAC">
                        نمط الباكالوريا الدولية (BIOF Slate)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      تنسيق الأسئلة الفرعية:
                    </label>
                    <select
                      value={subQuestionStyle}
                      onChange={(e) =>
                        setSubQuestionStyle(
                          e.target.value as PlatformTexNormalizationOptions["subQuestionStyle"]
                        )
                      }
                      className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold bg-white text-slate-900"
                    >
                      <option value="ARABIC_ABJAD">
                        ترقيم أبجدي عربي مهيكل: أ) ، ب) ، ج)
                      </option>
                      <option value="LATIN_ABC">
                        ترقيم لاتيني دولي: a) , b) , c)
                      </option>
                      <option value="KEEP_ORIGINAL">
                        الحفاظ على ترقيم الملف الأصلي
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      طريقة الإدراج في محرر المنصة:
                    </label>
                    <select
                      value={mergeMode}
                      onChange={(e) =>
                        setMergeMode(e.target.value as LatexImportMergeMode)
                      }
                      className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold bg-white text-slate-900"
                    >
                      <option value="REPLACE_ENTIRE_CODE">
                        استبدال الكود بالكامل بالوثيقة المنسقة
                      </option>
                      <option value="SMART_MERGE_BODY">
                        دمج ذكي داخل \begin&#123;document&#125; الحالي
                      </option>
                      <option value="APPEND_TO_END">
                        إلحاق في نهاية كود المحرر
                      </option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-center gap-1.5 pt-2">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoInjectPreamble}
                        onChange={(e) => setAutoInjectPreamble(e.target.checked)}
                        className="rounded text-emerald-700"
                      />
                      <span>حقن ديباجة المنصة القياسية (tcolorbox + tkz-tab)</span>
                    </label>
                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={normalizeBareme}
                        onChange={(e) => setNormalizeBareme(e.target.checked)}
                        className="rounded text-emerald-700"
                      />
                      <span>توحيد محاذاة النقط تلقائياً (\hfill ن)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Diagnostics Strip */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-black">
                    الملف: {importedFileName}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">
                    الترميز: {normalizedBundle.processed.detectedEncoding}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 font-bold">
                    التمارين المستخلصة:{" "}
                    {normalizedBundle.extractedLessonItems.length}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 font-bold">
                    الأسئلة الفرعية المنسقة:{" "}
                    {normalizedBundle.detectedSubQuestionsCount}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold">
                    الرموز الرياضية المطبعة:{" "}
                    {normalizedBundle.processed.normalizedSymbolsCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    downloadTexFile(
                      `normalized_${importedFileName}`,
                      normalizedBundle.platformFormattedTex
                    )
                  }
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل الكود المنسق (.tex)</span>
                </button>
              </div>

              {/* Side-by-Side Comparison: Raw .tex Input vs Platform-Normalized Output + Extracted A4 Exercises */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Raw Input Editor */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      1. محتوى ملف .tex الأصلي (قابل للتعديل أو اللصق المباشر):
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Raw LaTeX Input
                    </span>
                  </div>
                  <textarea
                    value={rawImportedTex}
                    onChange={(e) => setRawImportedTex(e.target.value)}
                    rows={12}
                    dir="ltr"
                    className="w-full flex-1 font-mono text-[11px] bg-slate-900 text-slate-100 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Normalized Platform Output */}
                <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 space-y-2 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950">
                      2. كود LaTeX المنسق تلقائياً وفق نظام المنصة (exoBox + أ/ب/ج):
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                      Platform-Normalized LaTeX
                    </span>
                  </div>
                  <textarea
                    readOnly
                    value={normalizedBundle.platformFormattedTex}
                    rows={12}
                    dir="ltr"
                    className="w-full flex-1 font-mono text-[11px] bg-slate-950 text-emerald-300 rounded-xl p-3 border border-emerald-500/30"
                  />
                </div>
              </div>

              {/* Extracted Exercises Preview for Live A4 Sheet */}
              <div className="bg-white border border-indigo-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black text-indigo-950 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>
                      معاينة التمارين والأسئلة الفرعية المستخلصة للورقة التفاعلية A4 ({normalizedBundle.extractedLessonItems.length} تمارين)
                    </span>
                  </h4>
                  <span className="text-[11px] font-bold text-indigo-700">
                    تُدرج تلقائياً في المعاينة الحية عند النقر على «تطبيق في المحرر والمعاينة A4»
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {normalizedBundle.extractedLessonItems.map((les, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-950">
                          {les.lessonAr}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 text-[10px] font-mono font-bold">
                          الوزن: {les.weight}%
                        </span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-700 font-medium">
                        {(les.sampleExerciseAr || []).slice(0, 4).map((q, qIdx) => (
                          <li key={qIdx} className="truncate">
                            • {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer for .tex Importer */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleApplyTexToStudio}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    تطبيق في المحرر والمعاينة التفاعلية A4 ({normalizedBundle.extractedLessonItems.length} تمارين)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyAndSaveTexToFirebase}
                  disabled={isSavingImportedToFirebase}
                  className="px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>
                    {isSavingImportedToFirebase
                      ? "جاري الحفظ في Firebase..."
                      : "تطبيق وحفظ مباشر في قاعدة بيانات Firebase"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CentralFirebaseExamsAndTexStudioModal;
