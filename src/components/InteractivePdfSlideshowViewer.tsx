import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  FileUp,
  MessageSquarePlus,
  Trash2,
  Eye,
  EyeOff,
  Scissors,
  Layers,
  Sparkles,
  PenTool,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Pin,
  X,
  Download,
  Pen,
  Lock,
  Unlock,
  Cloud,
} from "lucide-react";
import { MathText } from "./MathRenderer";
import { SlideDrawingCanvasOverlay } from "./SlideDrawingCanvasOverlay";
import {
  useSlideDigitalLock,
  SlideDigitalLockModal,
  GoogleDrivePdfImporterModal,
} from "./SlideSecurityAndDriveControls";

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
} catch {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export type SlideCommentCategory =
  | "EXPLANATION"
  | "RULE_REMINDER"
  | "STUDENT_QUESTION"
  | "WARNING";

export interface SlideTextComment {
  id: string;
  slideId: string;
  text: string;
  category: SlideCommentCategory;
  createdAt: string;
  /** Optional normalized coordinates [0..1] if pinned directly on the PDF slide canvas */
  pinX?: number;
  pinY?: number;
}

export interface SlicedPdfSlide {
  id: string;
  slideNumber: number;
  sourcePageNumber: number;
  sliceType: "FULL_PAGE" | "SECTION_SLICE";
  sliceIndexInPage: number;
  totalSlicesInPage: number;
  titleAr: string;
  titleFr: string;
  badgeLabel: string;
  imageDataUrl: string;
  extractedText: string;
  guidedPromptAr: string;
  guidedCheckQuestionAr: string;
}

export interface InteractivePdfSlideshowViewerProps {
  initialPdfFile?: {
    name: string;
    base64?: string;
    arrayBuffer?: ArrayBuffer;
  } | null;
  lessonTitleAr?: string;
  lessonTitleFr?: string;
  trackLabelAr?: string;
  profName?: string;
  schoolName?: string;
  isEmbeddedInModal?: boolean;
  onClose?: () => void;
  onConvertToBeamer?: () => void;
  externalIsSlideLocked?: boolean;
  onRequestOpenLockModal?: () => void;
}

const SLIDE_COMMENTS_STORAGE_KEY = "math_studio_pdf_slide_comments_v1";
const SLIDE_NOTES_STORAGE_KEY = "math_studio_pdf_slide_notes_v1";

const BUILTIN_GUIDED_SECTIONS = [
  {
    pageNumber: 1,
    headerFr:
      "Royaume du Maroc · Devoir Surveillé & Leçon Guidée — 2BAC Sciences Mathématiques / PC",
    headerAr:
      "المملكة المغربية · الدرس المحروس التفاعلي والفرض النموذجي — الثانية بكالوريا",
    sections: [
      {
        id: "sec_p1_1",
        badge: "المقطع 1 · المتتاليات العددية (5 ن)",
        titleAr: "الفقرة الأولى: دراسة متتالية ترجعية والبرهان بالترجع",
        titleFr: " Partie 1 : Suite récurrente homographique & Récurrence",
        linesFr: [
          "Soit (u_n) la suite définie par u_0 = 2 et u_{n+1} = (4u_n - 1)/(u_n + 2) pour tout n ∈ ℕ.",
          "1) Calculer u_1 et u_2, puis montrer par récurrence que (∀n ∈ ℕ) u_n > 1. (1.5 pt)",
          "2) Étudier la monotonie de (u_n) et en déduire qu'elle est convergente. (1.5 pt)",
          "3) On pose v_n = 1/(u_n - 1). Montrer que (v_n) est arithmétique de raison r = 1/3 et calculer lim u_n. (2 pts)",
        ],
        linesAr: [
          "نعتبر المتتالية العددية (u_n) المعرفة بـ u_0 = 2 و u_{n+1} = (4u_n - 1)/(u_n + 2) لكل n من N.",
          "1) أحسب u_1 و u_2 ثم بين بالترجع أن u_n > 1 لكل n من N. (1.5 ن)",
          "2) أدرس رتابة المتتالية (u_n) واستنتج أنها متقاربة. (1.5 ن)",
          "3) نضع v_n = 1/(u_n - 1). بين أن (v_n) متتالية حسابية أساسها r = 1/3 ثم أحسب lim u_n. (2 ن)",
        ],
        guidedPromptAr:
          "توجيه الأستاذ أثناء الشرح: ابدأ بمساءلة التلاميذ حول خطوات البرهان بالترجع (التحقق من أجل n=0، افتراض الصحة، ثم البرهان من أجل n+1 عن طريق دراسة إشارة الفرق u_{n+1} - 1).",
        guidedCheckQuestionAr:
          "سؤال تفاعلي للقسم: لماذا ندرس إشارة الفرق u_{n+1} - u_n بتوحيد المقامات بدل القسمة المباشرة؟",
        nyStart: 0.13,
        nyEnd: 0.42,
      },
      {
        id: "sec_p1_2",
        badge: "المقطع 2 · الأعداد العقدية (5 ن)",
        titleAr: "الفقرة الثانية: المعادلات في ℂ والتحويلات النقطية (الدوران)",
        titleFr: "Partie 2 : Nombres complexes, Forme exponentielle et Rotation",
        linesFr: [
          "1) Résoudre dans l'ensemble ℂ l'équation : z² - 2√3 z + 4 = 0. (1.5 pt)",
          "2) Dans le plan complexe rapporté à un repère orthonormé direct (O, u, v), on considère A(√3 + i), B(√3 - i) et C(2i).",
          "   Écrire a et b sous forme trigonométrique et exponentielle. (1.75 pt)",
          "3) Montrer que C est l'image de A par la rotation R(O, π/3) et en déduire la nature du triangle OAC. (1.75 pt)",
        ],
        linesAr: [
          "1) حل في مجموعة الأعداد العقدية C المعادلة: z² - 2√3 z + 4 = 0. (1.5 ن)",
          "2) نعتبر في المستوى العقدي النقط A(√3 + i) و B(√3 - i) و C(2i). أكتب a و b على الشكل المثلثي والأسي. (1.75 ن)",
          "3) بين أن C صورة A بالدوران R الذي مركزه O وزاويته π/3 واستنتج طبيعة المثلث OAC. (1.75 ن)",
        ],
        guidedPromptAr:
          "توجيه الأستاذ أثناء الشرح: ذكّر التلاميذ بالصيغة العقدية للدوران z' - ω = e^{iθ}(z - ω) وكيفية استنتاج أن المثلث OAC متساوي الأضلاع.",
        guidedCheckQuestionAr:
          "سؤال تفاعلي للقسم: ما هو معيار وعمدة العدد العقدي c/a وماذا يمثل هندسياً؟",
        nyStart: 0.44,
        nyEnd: 0.69,
      },
      {
        id: "sec_p1_3",
        badge: "المقطع 3 · التحليل والتكامل (10 ن)",
        titleAr: "الفقرة الثالثة: دراسة دالة لوغاريتمية وحساب المساحة بالتكامل",
        titleFr: "Partie 3 : Étude de fonction logarithme & Calcul d'aire",
        linesFr: [
          "Soit f la fonction définie sur ]0, +∞[ par : f(x) = x - 1 + ln(x)/x et (C_f) sa courbe (||i|| = 2 cm).",
          "1) Calculer lim_{x→0+} f(x) et lim_{x→+∞} f(x). Montrer que (Δ): y = x - 1 est asymptote oblique à (C_f). (3 pts)",
          "2) Calculer f'(x) sur ]0, +∞[ et dresser le tableau de variations complet de f. (3.5 pts)",
          "3) Calculer I = ∫_1^e (ln(x)/x) dx et en déduire l'aire du domaine plan compris entre (C_f), (Δ), x=1 et x=e. (3.5 pts)",
        ],
        linesAr: [
          "نعتبر الدالة العددية f المعرفة على ]0, +∞[ بـ: f(x) = x - 1 + ln(x)/x ومنحناها (C_f) (||i|| = 2 cm).",
          "1) أحسب النهايتين عند 0+ وعند +∞ وبين أن المستقيم (Δ): y = x - 1 مقارب مائل للمنحنى (C_f). (3 ن)",
          "2) أحسب المشتقة f'(x) على ]0, +∞[ وضع جدول تغيرات الدالة f. (3.5 ن)",
          "3) أحسب التكامل I = ∫_1^e (ln(x)/x) dx واستنتج بـ cm² مساحة الحيز المحصور بين (C_f) و (Δ) و x=1 و x=e. (3.5 ن)",
        ],
        guidedPromptAr:
          "توجيه الأستاذ أثناء الشرح: ركز على ملاحظة أن التعبير ln(x)/x يكتب على شكل u'(x)·u(x) حيث u(x) = ln(x)، ومنه الدالة الأصلية هي ½(ln x)².",
        guidedCheckQuestionAr:
          "سؤال تفاعلي للقسم: لماذا نضرب نتيجة التكامل في 4 cm² عند حساب مساحة الحيز الهندسي؟",
        nyStart: 0.71,
        nyEnd: 0.96,
      },
    ],
  },
  {
    pageNumber: 2,
    headerFr:
      "Page 2/2 · Géométrie dans l'Espace & Calcul des Probabilités — Leçon Guidée",
    headerAr:
      "الصفحة 2/2 · الهندسة الفضائية وحساب الاحتمالات — شرائح الدرس المحروس",
    sections: [
      {
        id: "sec_p2_1",
        badge: "المقطع 4 · الهندسة الفضائية (5 ن)",
        titleAr: "الفقرة الرابعة: الفلكة والمستوى وتقاطعهما في الفضاء",
        titleFr: "Partie 4 : Sphère, Plan et intersection suivant un cercle",
        linesFr: [
          "Dans l'espace rapporté à un repère orthonormé direct (O, i, j, k), on considère le plan (P): 2x - y + 2z - 3 = 0",
          "et la sphère (S) d'équation : x² + y² + z² - 2x + 2y - 4z - 3 = 0.",
          "1) Déterminer le centre Ω et le rayon R de la sphère (S), puis calculer la distance d(Ω, (P)). (2 pts)",
          "2) Montrer que le plan (P) coupe la sphère (S) suivant un cercle (Γ) dont on précisera le rayon r et le centre H. (3 pts)",
        ],
        linesAr: [
          "في الفضاء المنسوب إلى معلم متعامد ممنظم مباشر (O, i, j, k)، نعتبر المستوى (P): 2x - y + 2z - 3 = 0",
          "والفلكة (S) التي معادلتها: x² + y² + z² - 2x + 2y - 4z - 3 = 0.",
          "1) حدد المركز Ω والشعاع R للفلكة (S)، ثم أحسب مسافة المركز Ω عن المستوى (P). (2 ن)",
          "2) بين أن المستوى (P) يقطع الفلكة (S) وفق دائرة (Γ) محدداً شعاعها r ومثلث إحداثيات مركزها H. (3 ن)",
        ],
        guidedPromptAr:
          "توجيه الأستاذ أثناء الشرح: وضح للتلاميذ مقارنة المسافة d(Ω,(P)) مع الشعاع R، وكيف نطبق مبرهنة فيثاغورس الفضائية r = √(R² - d²).",
        guidedCheckQuestionAr:
          "سؤال تفاعلي للقسم: كيف نحدد التمثيل البارامتري للمستقيم (Δ) المار من Ω والعمودي على المستوى (P)؟",
        nyStart: 0.14,
        nyEnd: 0.52,
      },
      {
        id: "sec_p2_2",
        badge: "المقطع 5 · حساب الاحتمالات (5 ن)",
        titleAr: "الفقرة الخامسة: السحب الآني والمتغير العشوائي والأمل الرياضي",
        titleFr: "Partie 5 : Tirage simultané, Loi de probabilité et Espérance",
        linesFr: [
          "Une urne contient 5 boules blanches et 3 boules noires indiscernables au toucher. On tire simultanément 3 boules.",
          "1) Montrer que le nombre de tirages possibles est Card(Ω) = C_8^3 = 56. (1 pt)",
          "2) Calculer la probabilité de A : « Obtenir 3 boules de même couleur » et B : « Au moins une boule blanche ». (2 pts)",
          "3) Soit X la variable aléatoire égale au nombre de boules noires tirées. Déterminer la loi de X et son espérance E(X). (2 pts)",
        ],
        linesAr: [
          "يحتوي صندوق على 5 كرات بيضاء و 3 كرات سوداء. نسحب عشوائياً وفي آن واحد 3 كرات.",
          "1) بين أن عدد السحبات الممكنة هو Card(Ω) = 56. (1 ن)",
          "2) أحسب احتمال الحدث A: «سحب 3 كرات من نفس اللون» والحدث B: «سحب كرة بيضاء على الأقل». (2 ن)",
          "3) ليكن X المتغير العشوائي الذي يربط كل سحبة بعدد الكرات السوداء المسحوبة. حدد قانون احتمال X وأمله الرياضي E(X). (2 ن)",
        ],
        guidedPromptAr:
          "توجيه الأستاذ أثناء الشرح: نبه التلاميذ إلى استعمال الحدث المضاد B̄ عند حساب احتمال «كرة بيضاء على الأقل» لتفادي تكرار الحالات.",
        guidedCheckQuestionAr:
          "سؤال تفاعلي للقسم: ما هو الشرط اللازم للتحقق من صحة جدول قانون احتمال المتغير العشوائي X؟",
        nyStart: 0.55,
        nyEnd: 0.94,
      },
    ],
  },
];

export const InteractivePdfSlideshowViewer: React.FC<
  InteractivePdfSlideshowViewerProps
> = ({
  initialPdfFile,
  lessonTitleAr = "الدرس المحروس التفاعلي",
  trackLabelAr = "الثانية بكالوريا علوم",
  profName = "أستاذ المادة",
  schoolName = "الثانوية التأهيلية",
  isEmbeddedInModal = false,
  onClose,
  onConvertToBeamer,
  externalIsSlideLocked,
  onRequestOpenLockModal,
}) => {
  const {
    isSlideLocked: internalIsSlideLocked,
    openLockModal,
    closeLockModal,
    isLockModalOpen,
    teacherPasswordHash,
    handleLockWithPassword,
    handleUnlockWithPassword,
  } = useSlideDigitalLock();

  const effectiveIsSlideLocked =
    externalIsSlideLocked !== undefined
      ? externalIsSlideLocked
      : internalIsSlideLocked;

  const handleTriggerLockModal = () => {
    if (onRequestOpenLockModal) {
      onRequestOpenLockModal();
    } else {
      openLockModal();
    }
  };

  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  // وضع تقطيع صفحات الـ PDF: تقطيع ذكي إلى مقاطع/تمارين (SECTION_SLICES) أو تقطيع صفحة بصفحة (FULL_PAGES)
  const [slicingMode, setSlicingMode] = useState<"SECTION_SLICES" | "FULL_PAGES">(
    "SECTION_SLICES"
  );
  const [sectionsPerUploadedPage, setSectionsPerUploadedPage] = useState<
    2 | 3
  >(3);
  const [pdfFileName, setPdfFileName] = useState<string>(
    initialPdfFile?.name || "Sujet_Cours_Surveille_2BAC.pdf"
  );
  const [isSlicingPdf, setIsSlicingPdf] = useState<boolean>(false);
  const [rawPagesCanvasData, setRawPagesCanvasData] = useState<
    Array<{
      pageNumber: number;
      fullPageDataUrl: string;
      width: number;
      height: number;
      extractedText: string;
      slices: Array<{
        sliceIdx: number;
        totalSlices: number;
        dataUrl: string;
        sliceText: string;
      }>;
    }>
  >([]);
  const [isUsingBuiltinPdf, setIsUsingBuiltinPdf] = useState<boolean>(
    !initialPdfFile
  );

  // التنقل بين الشرائح ووضع ملء الشاشة والتكبير
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [slideZoom, setSlideZoom] = useState<number>(100);
  const [showAnnotationsOnSlide, setShowAnnotationsOnSlide] =
    useState<boolean>(true);
  const [pinPlacementMode, setPinPlacementMode] = useState<boolean>(false);
  const [pendingPinCoords, setPendingPinCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // لوحة الرسم التفاعلية (Canvas) فوق كل شريحة للرسم والكتابة اليدوية بالقلم الرقمي أو الماوس
  const [isDrawingActive, setIsDrawingActive] = useState<boolean>(false);

  // التعليقات النصية الخاصة بكل شريحة (محفوظة في localStorage)
  const [slideComments, setSlideComments] = useState<SlideTextComment[]>(() => {
    try {
      const saved = localStorage.getItem(SLIDE_COMMENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: "init_comment_1",
        slideId: "builtin_slice_1_0",
        text: "تذكير للتلاميذ: في البرهان بالترجع، يجب التصريح الواضح بافتراض الترجع من أجل n ثابت من ℕ قبل المرور إلى n+1.",
        category: "RULE_REMINDER",
        createdAt: "08:05",
        pinX: 0.82,
        pinY: 0.28,
      },
      {
        id: "init_comment_2",
        slideId: "builtin_slice_1_0",
        text: "تنبيه منهجي: لدراسة رتابة المتتالية (u_n)، نوحد المقامات في الفرق u_{n+1} - u_n ونستعمل نتيجة السؤال 1 (u_n > 1).",
        category: "WARNING",
        createdAt: "08:12",
        pinX: 0.78,
        pinY: 0.62,
      },
    ];
  });

  // ملاحظة المعلم النصية المستمرة لكل شريحة (مسودة الشرح الخاصة بالشريحة)
  const [perSlideTeacherNotes, setPerSlideTeacherNotes] = useState<
    Record<string, string>
  >(() => {
    try {
      const saved = localStorage.getItem(SLIDE_NOTES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      builtin_slice_1_0:
        "• خطة شرح الشريحة (08:00 - 08:15):\n1) حساب الحدود الأولى u_1 = 7/4 و u_2 = 24/15.\n2) كتابة فرق u_{n+1} - 1 = 3(u_n - 1)/(u_n + 2) > 0.\n3) استنتاج التناقص والتقارب نحو النهاية l = 1.",
    };
  });

  const [newCommentText, setNewCommentText] = useState<string>("");
  const [newCommentCategory, setNewCommentCategory] =
    useState<SlideCommentCategory>("EXPLANATION");

  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slideImageWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        SLIDE_COMMENTS_STORAGE_KEY,
        JSON.stringify(slideComments)
      );
    } catch {
      // ignore
    }
  }, [slideComments]);

  useEffect(() => {
    try {
      localStorage.setItem(
        SLIDE_NOTES_STORAGE_KEY,
        JSON.stringify(perSlideTeacherNotes)
      );
    } catch {
      // ignore
    }
  }, [perSlideTeacherNotes]);

  // رسم وتقطيع صفحات ملف الـ PDF النموذجي المدمج إلى شرائح مرئية عالية الدقة
  const generateBuiltinPdfCanvasData = useCallback(() => {
    const pagesResult: typeof rawPagesCanvasData = [];

    BUILTIN_GUIDED_SECTIONS.forEach((pageDef) => {
      const baseW = 920;
      const baseH = 1120;
      const fullCanvas = document.createElement("canvas");
      fullCanvas.width = baseW;
      fullCanvas.height = baseH;
      const ctx = fullCanvas.getContext("2d");
      if (!ctx) return;

      // خلفية الورقة الأكاديمية
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, baseW, baseH);

      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(18, 18, baseW - 36, baseH - 36);

      // الترويسة الرسمية للصفحة
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(30, 30, baseW - 60, 82);
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(30, 30, baseW - 60, 82);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 14px 'Times New Roman', serif";
      ctx.textAlign = "left";
      ctx.fillText(pageDef.headerFr, 44, 58);

      ctx.fillStyle = "#1e1b4b";
      ctx.font = "bold 15px 'Cairo', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(pageDef.headerAr, baseW - 44, 88);

      const pageSlices: Array<{
        sliceIdx: number;
        totalSlices: number;
        dataUrl: string;
        sliceText: string;
      }> = [];

      pageDef.sections.forEach((sec, idx) => {
        const yTop = Math.round(sec.nyStart * baseH);
        const yBottom = Math.round(sec.nyEnd * baseH);
        const boxH = yBottom - yTop;

        ctx.fillStyle = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
        ctx.fillRect(34, yTop, baseW - 68, boxH);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(34, yTop, baseW - 68, boxH);

        // شريط عنوان التمرين/الفقرة
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(34, yTop, baseW - 68, 34);

        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 13.5px 'Times New Roman', serif";
        ctx.textAlign = "left";
        ctx.fillText(sec.titleFr, 48, yTop + 22);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px 'Cairo', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(sec.titleAr, baseW - 48, yTop + 22);

        let curY = yTop + 58;
        ctx.fillStyle = "#0f172a";
        ctx.font = "14px 'Times New Roman', serif";
        ctx.textAlign = "left";
        sec.linesFr.forEach((line) => {
          ctx.fillText(line, 48, curY, baseW - 96);
          curY += 25;
        });

        curY += 6;
        ctx.strokeStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.moveTo(48, curY - 10);
        ctx.lineTo(baseW - 48, curY - 10);
        ctx.stroke();

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 14.5px 'Cairo', sans-serif";
        ctx.textAlign = "right";
        sec.linesAr.forEach((line) => {
          ctx.fillText(line, baseW - 48, curY, baseW - 96);
          curY += 27;
        });

        // اقتطاع هذا المقطع كشريحة مستقلة (Sliced Section Image)
        const sliceCanvas = document.createElement("canvas");
        const sliceW = baseW - 48;
        const sliceH = boxH + 16;
        sliceCanvas.width = sliceW;
        sliceCanvas.height = sliceH;
        const sCtx = sliceCanvas.getContext("2d");
        if (sCtx) {
          sCtx.fillStyle = "#ffffff";
          sCtx.fillRect(0, 0, sliceW, sliceH);
          sCtx.drawImage(
            fullCanvas,
            24,
            Math.max(0, yTop - 8),
            sliceW,
            sliceH,
            0,
            0,
            sliceW,
            sliceH
          );
        }

        pageSlices.push({
          sliceIdx: idx,
          totalSlices: pageDef.sections.length,
          dataUrl: sliceCanvas.toDataURL("image/png"),
          sliceText: [...sec.linesAr, ...sec.linesFr].join("\n"),
        });
      });

      pagesResult.push({
        pageNumber: pageDef.pageNumber,
        fullPageDataUrl: fullCanvas.toDataURL("image/png"),
        width: baseW,
        height: baseH,
        extractedText: pageDef.sections
          .map((s) => `${s.titleAr}\n${s.linesAr.join("\n")}`)
          .join("\n\n"),
        slices: pageSlices,
      });
    });

    setRawPagesCanvasData(pagesResult);
  }, []);

  // معالجة وتقطيع أي ملف PDF مرفوع إلى صفحات وشرائح مقطّعة
  const sliceUploadedPdfBuffer = useCallback(
    async (uint8: Uint8Array, fileName: string, sliceCountPerPage: 2 | 3) => {
      setIsSlicingPdf(true);
      try {
        const loadingTask = pdfjsLib.getDocument({ data: uint8 });
        const pdfDoc = await loadingTask.promise;
        const maxPages = Math.min(pdfDoc.numPages, 15);
        const pagesList: typeof rawPagesCanvasData = [];

        for (let p = 1; p <= maxPages; p++) {
          const page = await pdfDoc.getPage(p);
          const viewport = page.getViewport({ scale: 1.75 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport } as any).promise;
          }

          const textContent = await page.getTextContent();
          const allItems = textContent.items
            .map((it: any) => ("str" in it ? it.str : ""))
            .filter(Boolean);
          const pageText = allItems.join(" ");

          // تقطيع الصفحة عمودياً إلى شرائح أفقية (2 أو 3 شرائح لكل صفحة PDF) لتسهيل العرض التدريجي أثناء الدرس
          const slices: Array<{
            sliceIdx: number;
            totalSlices: number;
            dataUrl: string;
            sliceText: string;
          }> = [];

          const bandHeight = Math.floor(canvas.height / sliceCountPerPage);
          const overlapPx = Math.floor(canvas.height * 0.03);

          for (let s = 0; s < sliceCountPerPage; s++) {
            const sy = Math.max(0, s * bandHeight - (s > 0 ? overlapPx : 0));
            const sh = Math.min(
              canvas.height - sy,
              bandHeight + (s > 0 ? overlapPx : 0) + overlapPx
            );

            const sliceCanvas = document.createElement("canvas");
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = sh;
            const sCtx = sliceCanvas.getContext("2d");
            if (sCtx) {
              sCtx.fillStyle = "#ffffff";
              sCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
              sCtx.drawImage(
                canvas,
                0,
                sy,
                canvas.width,
                sh,
                0,
                0,
                canvas.width,
                sh
              );
            }

            const chunkLen = Math.ceil(allItems.length / sliceCountPerPage);
            const sliceWords = allItems
              .slice(s * chunkLen, (s + 1) * chunkLen)
              .join(" ");

            slices.push({
              sliceIdx: s,
              totalSlices: sliceCountPerPage,
              dataUrl: sliceCanvas.toDataURL("image/jpeg", 0.9),
              sliceText:
                sliceWords ||
                `مقطع الشريحة ${s + 1} من الصفحة ${p} — الوثيقة ${fileName}`,
            });
          }

          pagesList.push({
            pageNumber: p,
            fullPageDataUrl: canvas.toDataURL("image/jpeg", 0.9),
            width: canvas.width,
            height: canvas.height,
            extractedText: pageText,
            slices,
          });
        }

        setRawPagesCanvasData(pagesList);
        setPdfFileName(fileName);
        setIsUsingBuiltinPdf(false);
        setCurrentSlideIdx(0);
      } catch {
        generateBuiltinPdfCanvasData();
        setIsUsingBuiltinPdf(true);
      } finally {
        setIsSlicingPdf(false);
      }
    },
    [generateBuiltinPdfCanvasData]
  );

  // تحميل الملف الأولي إن وجد أو توليد شرائح الملف النموذجي
  useEffect(() => {
    if (initialPdfFile && (initialPdfFile.arrayBuffer || initialPdfFile.base64)) {
      let uint8: Uint8Array | null = null;
      if (initialPdfFile.arrayBuffer) {
        uint8 = new Uint8Array(initialPdfFile.arrayBuffer);
      } else if (initialPdfFile.base64) {
        const commaIdx = initialPdfFile.base64.indexOf(",");
        const raw =
          commaIdx !== -1
            ? initialPdfFile.base64.slice(commaIdx + 1)
            : initialPdfFile.base64;
        try {
          const bin = atob(raw);
          uint8 = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) {
            uint8[i] = bin.charCodeAt(i);
          }
        } catch {
          uint8 = null;
        }
      }
      if (uint8) {
        sliceUploadedPdfBuffer(
          uint8,
          initialPdfFile.name,
          sectionsPerUploadedPage
        );
        return;
      }
    }
    generateBuiltinPdfCanvasData();
  }, [
    initialPdfFile,
    sectionsPerUploadedPage,
    sliceUploadedPdfBuffer,
    generateBuiltinPdfCanvasData,
  ]);

  // بناء قائمة الشرائح النهائية بناءً على وضع التقطيع المختار (SECTION_SLICES أو FULL_PAGES)
  const slides = useMemo<SlicedPdfSlide[]>(() => {
    const result: SlicedPdfSlide[] = [];
    let counter = 1;

    rawPagesCanvasData.forEach((pageObj) => {
      if (slicingMode === "FULL_PAGES") {
        const builtinPage = BUILTIN_GUIDED_SECTIONS.find(
          (b) => b.pageNumber === pageObj.pageNumber
        );
        result.push({
          id: isUsingBuiltinPdf
            ? `builtin_page_${pageObj.pageNumber}`
            : `pdf_${pdfFileName}_page_${pageObj.pageNumber}`,
          slideNumber: counter++,
          sourcePageNumber: pageObj.pageNumber,
          sliceType: "FULL_PAGE",
          sliceIndexInPage: 0,
          totalSlicesInPage: 1,
          titleAr:
            builtinPage?.headerAr ||
            `الصفحة الكاملة ${pageObj.pageNumber} — ${pdfFileName}`,
          titleFr:
            builtinPage?.headerFr ||
            `Page complète ${pageObj.pageNumber} — ${pdfFileName}`,
          badgeLabel: `صفحة ${pageObj.pageNumber} كاملة`,
          imageDataUrl: pageObj.fullPageDataUrl,
          extractedText: pageObj.extractedText,
          guidedPromptAr:
            "اعرض الصفحة كاملة للتلاميذ لأخذ نظرة شمولية على هيكلة الدرس أو الفرض المحروس قبل التفصيل في كل فقرة.",
          guidedCheckQuestionAr:
            "ما هي المفاهيم الرياضية الأساسية الموظفة في تمارين هذه الصفحة؟",
        });
      } else {
        const builtinPage = BUILTIN_GUIDED_SECTIONS.find(
          (b) => b.pageNumber === pageObj.pageNumber
        );
        pageObj.slices.forEach((sl) => {
          const builtinSec = builtinPage?.sections[sl.sliceIdx];
          result.push({
            id: isUsingBuiltinPdf
              ? `builtin_slice_${pageObj.pageNumber}_${sl.sliceIdx}`
              : `pdf_${pdfFileName}_p${pageObj.pageNumber}_s${sl.sliceIdx}`,
            slideNumber: counter++,
            sourcePageNumber: pageObj.pageNumber,
            sliceType: "SECTION_SLICE",
            sliceIndexInPage: sl.sliceIdx,
            totalSlicesInPage: sl.totalSlices,
            titleAr:
              builtinSec?.titleAr ||
              `الشريحة المقطّعة (${sl.sliceIdx + 1}/${sl.totalSlices}) من الصفحة ${
                pageObj.pageNumber
              }`,
            titleFr:
              builtinSec?.titleFr ||
              `Section (${sl.sliceIdx + 1}/${sl.totalSlices}) — Page ${
                pageObj.pageNumber
              }`,
            badgeLabel:
              builtinSec?.badge ||
              `ص ${pageObj.pageNumber} · مقطع ${sl.sliceIdx + 1}/${sl.totalSlices}`,
            imageDataUrl: sl.dataUrl,
            extractedText: sl.sliceText,
            guidedPromptAr:
              builtinSec?.guidedPromptAr ||
              `توجيه الدرس المحروس (المقطع ${sl.sliceIdx + 1} من الصفحة ${
                pageObj.pageNumber
              }): ناقش مع التلاميذ المعطيات الرياضية الواردة في هذه الشريحة المقطّعة ودوّن ملاحظاتك في لوحة التعليقات الجانبية.`,
            guidedCheckQuestionAr:
              builtinSec?.guidedCheckQuestionAr ||
              "اطلب من أحد التلاميذ قراءة المعطيات وتحديد المبرهنة أو الخاصية المناسبة للحل.",
          });
        });
      }
    });

    return result;
  }, [rawPagesCanvasData, slicingMode, isUsingBuiltinPdf, pdfFileName]);

  const currentSlide = slides[currentSlideIdx] || slides[0];

  const currentSlideComments = useMemo(() => {
    if (!currentSlide) return [];
    return slideComments.filter((c) => c.slideId === currentSlide.id);
  }, [slideComments, currentSlide]);

  const currentSlideNoteText = currentSlide
    ? perSlideTeacherNotes[currentSlide.id] || ""
    : "";

  const handleUpdateCurrentSlideNote = (val: string) => {
    if (!currentSlide || effectiveIsSlideLocked) return;
    setPerSlideTeacherNotes((prev) => ({
      ...prev,
      [currentSlide.id]: val,
    }));
  };

  // رفع ملف PDF جديد من جهاز المعلم وتقطيعه فوراً إلى شرائح
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    await sliceUploadedPdfBuffer(
      new Uint8Array(buf),
      file.name,
      sectionsPerUploadedPage
    );
    e.target.value = "";
  };

  const handleNextSlide = useCallback(() => {
    setCurrentSlideIdx((prev) => Math.min(slides.length - 1, prev + 1));
    setPendingPinCoords(null);
  }, [slides.length]);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlideIdx((prev) => Math.max(0, prev - 1));
    setPendingPinCoords(null);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await viewerContainerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  // اختصارات لوحة المفاتيح للتنقل بين شرائح الـ PDF (التالي/السابق وملء الشاشة)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT"
      ) {
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "PageDown") {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === "ArrowRight" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        setIsDrawingActive((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNextSlide, handlePrevSlide, toggleFullscreen]);

  // إضافة تعليق نصي جديد على الشريحة الحالية
  const handleAddSlideComment = () => {
    if (!currentSlide || !newCommentText.trim() || effectiveIsSlideLocked) return;
    const nowTime = new Date().toLocaleTimeString("ar-MA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newComment: SlideTextComment = {
      id: `cmt_${Date.now()}`,
      slideId: currentSlide.id,
      text: newCommentText.trim(),
      category: newCommentCategory,
      createdAt: nowTime,
      pinX: pendingPinCoords?.x,
      pinY: pendingPinCoords?.y,
    };
    setSlideComments((prev) => [...prev, newComment]);
    setNewCommentText("");
    setPendingPinCoords(null);
    setPinPlacementMode(false);
  };

  const handleDeleteComment = (id: string) => {
    if (effectiveIsSlideLocked) return;
    setSlideComments((prev) => prev.filter((c) => c.id !== id));
  };

  // النقر على صورة شريحة الـ PDF لتحديد موضع تثبيت تعليق نصي مرقم
  const handleSlideCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (effectiveIsSlideLocked || !pinPlacementMode || !slideImageWrapperRef.current)
      return;
    const rect = slideImageWrapperRef.current.getBoundingClientRect();
    const nx = Math.max(
      0.04,
      Math.min(0.96, (e.clientX - rect.left) / Math.max(1, rect.width))
    );
    const ny = Math.max(
      0.04,
      Math.min(0.96, (e.clientY - rect.top) / Math.max(1, rect.height))
    );
    setPendingPinCoords({ x: nx, y: ny });
  };

  // تصدير جميع ملاحظات وتعليقات الأستاذ على شرائح الـ PDF في ملف نصي/أكاديمي
  const handleExportTeacherNotes = () => {
    const lines: string[] = [
      `===================================================================`,
      `ملخص شرائح الدرس المحروس وتعليقات الأستاذ النصية — ${pdfFileName}`,
      `المؤسسة: ${schoolName} | الأستاذ(ة): ${profName} | المستوى: ${trackLabelAr}`,
      `===================================================================\n`,
    ];

    slides.forEach((sl) => {
      const note = perSlideTeacherNotes[sl.id];
      const cmts = slideComments.filter((c) => c.slideId === sl.id);
      lines.push(
        `--- [الشريحة ${sl.slideNumber}/${slides.length}: ${sl.titleAr}] ---`
      );
      if (note) {
        lines.push(`• مسودة شرح الشريحة:\n${note}`);
      }
      if (cmts.length > 0) {
        lines.push(`• التعليقات النصية المثبتة على الشريحة:`);
        cmts.forEach((c, idx) => {
          lines.push(`   (${idx + 1}) [${c.createdAt}] ${c.text}`);
        });
      }
      if (!note && cmts.length === 0) {
        lines.push(`• (لا توجد ملاحظات مدونة لهذه الشريحة)`);
      }
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Notes_Slideshow_${pdfFileName.replace(/\.pdf$/i, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryMeta = (cat: SlideCommentCategory) => {
    switch (cat) {
      case "RULE_REMINDER":
        return {
          label: "تذكير بالقاعدة",
          badgeCls:
            "bg-amber-500/20 text-amber-300 border-amber-500/40",
          pinCls: "bg-amber-500 text-slate-950 border-amber-200",
          icon: <Lightbulb className="w-3.5 h-3.5" />,
        };
      case "STUDENT_QUESTION":
        return {
          label: "سؤال للتلاميذ",
          badgeCls:
            "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          pinCls: "bg-emerald-500 text-slate-950 border-emerald-200",
          icon: <HelpCircle className="w-3.5 h-3.5" />,
        };
      case "WARNING":
        return {
          label: "تنبيه منهجي",
          badgeCls: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          pinCls: "bg-rose-500 text-white border-rose-200",
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: "إيضاح وشرح",
          badgeCls: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          pinCls: "bg-cyan-500 text-slate-950 border-cyan-200",
          icon: <BookOpen className="w-3.5 h-3.5" />,
        };
    }
  };

  if (!currentSlide) return null;

  return (
    <div
      ref={viewerContainerRef}
      dir="rtl"
      className={`flex flex-col bg-slate-950 text-slate-100 select-none ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen"
          : isEmbeddedInModal
          ? "flex-1 overflow-hidden"
          : "rounded-3xl border-2 border-cyan-500/40 shadow-2xl overflow-hidden min-h-[760px]"
      }`}
    >
      {/* مدخل رفع ملف PDF لتقطيعه إلى شرائح */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 1. الشريط العلوي للتحكم في عرض شرائح الـ PDF المقطّعة */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Interactive PDF Slideshow · أسلوب الدرس المحروس
              </span>
              <h3 className="text-sm sm:text-base font-black text-white truncate max-w-md">
                {pdfFileName}
              </h3>
              <span className="text-xs font-mono text-cyan-300 bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                شريحة {currentSlideIdx + 1} من {slides.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              تقطيع تلقائي لصفحات الـ PDF إلى شرائح مستقلة مع تدوين التعليقات النصية الخاصة بكل شريحة أثناء الشرح
            </p>
          </div>
        </div>

        {/* أزرار التحكم: رفع ملف PDF، استيراد من Google Drive، القفل الرقمي، نمط التقطيع، ملء الشاشة */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSlicingPdf}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition"
          >
            <FileUp className="w-4 h-4" />
            <span>
              {isSlicingPdf
                ? "جاري تقطيع صفحات الـ PDF..."
                : "إرفاق ملف PDF محلي"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsDriveModalOpen(true)}
            disabled={isSlicingPdf}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-l from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition"
            title="استيراد ملفات الـ PDF مباشرة من Google Drive وتحويلها إلى شرائح تفاعلية"
          >
            <Cloud className="w-4 h-4" />
            <span>استيراد PDF من Google Drive</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerLockModal}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 border cursor-pointer transition ${
              effectiveIsSlideLocked
                ? "bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40"
            }`}
            title="القفل الرقمي للشرائح بكلمة مرور الأستاذ لمنع التعديلات غير المصرح بها أثناء الدرس"
          >
            {effectiveIsSlideLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>الشرائح مقفلة (فك القفل)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>قفل الشرائح رقمياً</span>
              </>
            )}
          </button>

          {/* التبديل بين تقطيع المقاطع/التمارين أو عرض الصفحات الكاملة */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setSlicingMode("SECTION_SLICES");
                setCurrentSlideIdx(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition ${
                slicingMode === "SECTION_SLICES"
                  ? "bg-cyan-500 text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
              title="تقطيع كل صفحة PDF إلى شرائح تمارين/فقرات منفصلة للتركيز التدريجي مع التلاميذ"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>تقطيع إلى فقرات ({rawPagesCanvasData.length * (isUsingBuiltinPdf ? 2.5 : sectionsPerUploadedPage)} شرائح)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSlicingMode("FULL_PAGES");
                setCurrentSlideIdx(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition ${
                slicingMode === "FULL_PAGES"
                  ? "bg-indigo-600 text-white font-black"
                  : "text-slate-400 hover:text-white"
              }`}
              title="عرض كل صفحة PDF كاملة في شريحة مستقلة"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>صفحة كاملة ({rawPagesCanvasData.length})</span>
            </button>
          </div>

          {onConvertToBeamer && (
            <button
              type="button"
              onClick={onConvertToBeamer}
              className="px-3 py-1.5 rounded-xl bg-fuchsia-950/90 hover:bg-fuchsia-900 text-fuchsia-200 border border-fuchsia-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              title="تحويل نفس الوثيقة إلى كتل LaTeX Beamer المهيكلة"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span className="hidden xl:inline">عرض كتل Beamer</span>
            </button>
          )}

          {/* زر وضع ملء الشاشة */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
            <span>{isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة (F)"}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. شريط الشرائح المصغر (Slide Strip) للتنقل السريع بين الشرائح المقطّعة */}
      <div className="px-4 py-2 bg-slate-900/75 border-b border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          {slides.map((sl, idx) => {
            const isActive = idx === currentSlideIdx;
            const slideCmtCount =
              slideComments.filter((c) => c.slideId === sl.id).length +
              (perSlideTeacherNotes[sl.id]?.trim() ? 1 : 0);

            return (
              <button
                key={sl.id}
                type="button"
                onClick={() => {
                  setCurrentSlideIdx(idx);
                  setPendingPinCoords(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 border transition cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-l from-amber-500 to-orange-500 text-slate-950 border-amber-300 font-black shadow-md"
                    : "bg-slate-800/90 text-slate-300 hover:text-white border-slate-700"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-950/30 flex items-center justify-center font-mono text-[11px]">
                  {idx + 1}
                </span>
                <span>{sl.badgeLabel}</span>
                {slideCmtCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? "bg-slate-950 text-amber-300"
                        : "bg-cyan-500/20 text-cyan-300"
                    }`}
                    title={`عدد الملاحظات والتعليقات المسجلة على هذه الشريحة: ${slideCmtCount}`}
                  >
                    💬 {slideCmtCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* أزرار التكبير وإظهار/إخفاء الدبابيس على الشريحة ولوحة الرسم */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* زر تفعيل قلم الرسم والكتابة اليدوية على الشريحة */}
          <button
            type="button"
            onClick={() => setIsDrawingActive((v) => !v)}
            className={`px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer transition ${
              isDrawingActive
                ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300 shadow-md shadow-amber-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
            }`}
            title="تفعيل لوحة الرسم الحر والكتابة بالقلم الرقمي أو الماوس مباشرة فوق الشريحة (D)"
          >
            <Pen className="w-3.5 h-3.5" />
            <span>{isDrawingActive ? "قلم الرسم نشط" : "رسم على الشريحة (D)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAnnotationsOnSlide((v) => !v)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1 cursor-pointer ${
              showAnnotationsOnSlide
                ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            {showAnnotationsOnSlide ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span>
              {showAnnotationsOnSlide
                ? "التعليقات ظاهرة على الشريحة"
                : "التعليقات مخفية"}
            </span>
          </button>

          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setSlideZoom((z) => Math.max(75, z - 15))}
              className="p-1 hover:bg-slate-700 rounded cursor-pointer"
              title="تصغير الشريحة"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px]">{slideZoom}%</span>
            <button
              type="button"
              onClick={() => setSlideZoom((z) => Math.min(160, z + 15))}
              className="p-1 hover:bg-slate-700 rounded cursor-pointer"
              title="تكبير الشريحة"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSlideZoom(100)}
              className="p-1 hover:bg-slate-700 rounded cursor-pointer"
              title="إعادة الضبط"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. المساحة الوسطى: يسار/يمين — عارض الشريحة المقطّعة مع أزرار (السابق/التالي) + لوحة التعليقات النصية الخاصة بالشريحة */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-800">
        {/* ====================================================================
            العمود الأيمن (8 أعمدة): عرض شريحة الـ PDF المقطّعة + التوجيه التفاعلي
           ==================================================================== */}
        <div className="lg:col-span-8 flex flex-col overflow-y-auto p-4 sm:p-6 bg-slate-950/90 space-y-4 studio-scroll">
          {/* رأس الشريحة الحالية مع أزرار السابق/التالي المدمجة */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {currentSlide.badgeLabel}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  (الصفحة الأصلية {currentSlide.sourcePageNumber} من الوثيقة)
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white mt-1">
                {currentSlide.titleAr}
              </h2>
            </div>

            {/* أزرار تحكم سريعة ومباشرة (السابق / التالي) في أعلى الشريحة */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevSlide}
                disabled={currentSlideIdx === 0}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-black flex items-center gap-1.5 border border-slate-700 cursor-pointer transition"
              >
                <ChevronRight className="w-4 h-4 text-amber-400" />
                <span>الشريحة السابقة</span>
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                disabled={currentSlideIdx === slides.length - 1}
                className="px-4 py-2 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition"
              >
                <span>الشريحة التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* لوحة عرض صورة الشريحة المقطّعة من الـ PDF مع الدبابيس والتعليقات المرئية */}
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/60 border-2 border-slate-800 rounded-3xl p-3 sm:p-6 overflow-auto relative min-h-[340px]">
            {pinPlacementMode && (
              <div className="mb-3 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-bold flex items-center gap-2 animate-pulse">
                <Pin className="w-4 h-4 text-amber-400" />
                <span>
                  انقر في أي موضع على شريحة الـ PDF أدناه لتثبيت دبوس التعليق النصي في ذلك المكان بالضبط!
                </span>
              </div>
            )}

            <div
              ref={slideImageWrapperRef}
              onClick={handleSlideCanvasClick}
              style={{ width: `${slideZoom}%` }}
              className={`relative max-w-full transition-all duration-200 rounded-2xl overflow-hidden shadow-2xl border-2 ${
                pinPlacementMode
                  ? "cursor-crosshair border-amber-400 ring-4 ring-amber-500/20"
                  : "border-slate-700"
              }`}
            >
              <img
                src={currentSlide.imageDataUrl}
                alt={currentSlide.titleAr}
                className="w-full h-auto block bg-white"
              />

              {/* لوحة الرسم التفاعلية (Canvas) والكتابة اليدوية بالقلم الرقمي أو الماوس فوق الشريحة */}
              <SlideDrawingCanvasOverlay
                slideId={currentSlide.id}
                isDrawingActive={isDrawingActive}
                onToggleDrawingActive={setIsDrawingActive}
                isSlideLocked={effectiveIsSlideLocked}
                theme="dark"
              />

              {/* عرض دبابيس التعليقات النصية المثبتة مباشرة فوق شريحة الـ PDF */}
              {showAnnotationsOnSlide &&
                currentSlideComments.map((cmt, idx) => {
                  if (cmt.pinX === undefined || cmt.pinY === undefined) {
                    return null;
                  }
                  const meta = getCategoryMeta(cmt.category);
                  return (
                    <div
                      key={cmt.id}
                      style={{
                        left: `${cmt.pinX * 100}%`,
                        top: `${cmt.pinY * 100}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                    >
                      <div
                        className={`px-2.5 py-1 rounded-full text-xs font-black border-2 shadow-lg flex items-center gap-1 cursor-pointer ${meta.pinCls}`}
                      >
                        <Pin className="w-3 h-3" />
                        <span>ملاحظة #{idx + 1}</span>
                      </div>
                      <div className="mt-1 w-64 p-2.5 rounded-xl bg-slate-950/95 text-white border border-amber-400/60 shadow-2xl text-xs leading-relaxed">
                        <div className="font-bold text-amber-300 mb-0.5 flex items-center justify-between">
                          <span>{meta.label}</span>
                          <span className="font-mono text-[10px] opacity-75">
                            {cmt.createdAt}
                          </span>
                        </div>
                        <MathText text={cmt.text} />
                      </div>
                    </div>
                  );
                })}

              {/* معاينة الدبوس قيد التثبيت */}
              {pendingPinCoords && (
                <div
                  style={{
                    left: `${pendingPinCoords.x * 100}%`,
                    top: `${pendingPinCoords.y * 100}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                >
                  <div className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs border-2 border-white shadow-xl animate-bounce">
                    📍 موضع التعليق الجديد
                  </div>
                </div>
              )}
            </div>

            {/* شريط التعليقات النصية المعروض أسفل الشريحة مباشرة للتلاميذ على المسلاط */}
            {showAnnotationsOnSlide &&
              (currentSlideNoteText.trim() ||
                currentSlideComments.length > 0) && (
                <div className="w-full mt-4 bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-4 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-cyan-400" />
                      <span>
                        تعليقات وملاحظات الأستاذ المعروضة على الشريحة #{currentSlide.slideNumber}:
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      مرتبطة تلقائياً بهذه الشريحة
                    </span>
                  </div>

                  {currentSlideNoteText.trim() && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-200 text-sm sm:text-base whitespace-pre-wrap leading-relaxed font-medium">
                      <MathText text={currentSlideNoteText} />
                    </div>
                  )}

                  {currentSlideComments.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentSlideComments.map((cmt, cIdx) => {
                        const meta = getCategoryMeta(cmt.category);
                        return (
                          <div
                            key={cmt.id}
                            className={`p-3 rounded-xl border text-xs sm:text-sm leading-relaxed ${meta.badgeCls}`}
                          >
                            <div className="flex items-center justify-between font-black mb-1">
                              <span className="flex items-center gap-1.5">
                                {meta.icon}
                                <span>
                                  تعليق #{cIdx + 1} · {meta.label}
                                </span>
                              </span>
                              <span className="font-mono text-[10px] opacity-80">
                                {cmt.createdAt}
                              </span>
                            </div>
                            <div className="text-white font-medium">
                              <MathText text={cmt.text} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* بطاقة سيناريو الدرس المحروس والتفاعل الصفي مع التلاميذ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
              <div className="text-xs font-black text-indigo-300 flex items-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>توجيه سيناريو الدرس المحروس لهذه الشريحة:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {currentSlide.guidedPromptAr}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>سؤال تحفيز التفاعل مع التلاميذ أثناء العرض:</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-medium">
                {currentSlide.guidedCheckQuestionAr}
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================================
            العمود الأيسر (4 أعمدة): لوحة تدوين التعليقات النصية والملاحظات لكل شريحة
           ==================================================================== */}
        <div className="lg:col-span-4 bg-slate-900 flex flex-col overflow-y-auto p-4 gap-4 studio-scroll">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-black text-white">
                  تعليقات وملاحظات الشريحة #{currentSlide.slideNumber}
                </h3>
                <p className="text-[11px] text-slate-400">
                  تُحفظ تلقائياً لكل شريحة على حدة أثناء تنقلك في الدرس
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportTeacherNotes}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              title="تصدير جميع ملاحظات وتعليقات الأستاذ على الشرائح"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير الملاحظات</span>
            </button>
          </div>

          {effectiveIsSlideLocked && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  القفل الرقمي مفعل: التعديلات محمية بكلمة مرور الأستاذ.
                </span>
              </div>
              <button
                type="button"
                onClick={handleTriggerLockModal}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black cursor-pointer shrink-0"
              >
                فك القفل
              </button>
            </div>
          )}

          {/* 1. مسودة الشرح النصية المباشرة الخاصة بالشريحة الحالية */}
          <div className="space-y-2 bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5" />
                <span>
                  مذكرة الشرح النصية للشريحة ({currentSlide.slideNumber} /{" "}
                  {slides.length}):
                </span>
              </label>
              {currentSlideNoteText && !effectiveIsSlideLocked && (
                <button
                  type="button"
                  onClick={() => handleUpdateCurrentSlideNote("")}
                  className="text-[10.5px] text-slate-400 hover:text-rose-300 cursor-pointer"
                >
                  مسح مذكرة الشريحة
                </button>
              )}
            </div>

            {/* أزرار إدراج سريع للرموز الرياضية في تعليق الشريحة */}
            <div className="flex flex-wrap gap-1">
              {[
                "∀n ∈ ℕ",
                "u_{n+1} - u_n",
                "⇔",
                "⇒",
                "lim_{x→+∞}",
                "f'(x) ≥ 0",
                "∫_a^b",
              ].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  dir="ltr"
                  disabled={effectiveIsSlideLocked}
                  onClick={() =>
                    handleUpdateCurrentSlideNote(
                      `${currentSlideNoteText}${
                        currentSlideNoteText ? " " : ""
                      }${sym} `
                    )
                  }
                  className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-indigo-600 disabled:opacity-40 text-cyan-300 hover:text-white font-mono text-[11px] border border-slate-800 cursor-pointer"
                >
                  {sym}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              readOnly={effectiveIsSlideLocked}
              value={currentSlideNoteText}
              onChange={(e) => handleUpdateCurrentSlideNote(e.target.value)}
              placeholder={
                effectiveIsSlideLocked
                  ? "الشريحة مقفلة رقمياً بكلمة مرور الأستاذ..."
                  : `دوّن هنا ملاحظاتك وشرحك الخاص بالشريحة رقم ${currentSlide.slideNumber} (يظهر مباشرة أسفل الشريحة ويبقى محفوظاً لها)...`
              }
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs sm:text-sm text-emerald-100 leading-relaxed focus:outline-none focus:border-emerald-500 resize-none read-only:opacity-60"
            />
          </div>

          {/* 2. إضافة بطاقة تعليق نصي مصنف أو مثبت بدبوس على الشريحة */}
          <div className="space-y-2.5 bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-xs font-black text-amber-300 flex items-center justify-between">
              <span>إضافة تعليق نصي أو دبوس إيضاح على الشريحة:</span>
              <button
                type="button"
                onClick={() => setPinPlacementMode((v) => !v)}
                className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 border cursor-pointer transition ${
                  pinPlacementMode
                    ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                    : "bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800"
                }`}
              >
                <Pin className="w-3 h-3" />
                <span>
                  {pinPlacementMode
                    ? "انقر على الشريحة لتحديد الموضع"
                    : "تثبيت بدبوس على الشريحة"}
                </span>
              </button>
            </div>

            {/* تصنيف التعليق النصي */}
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "EXPLANATION", label: "إيضاح وشرح" },
                  { id: "RULE_REMINDER", label: "تذكير بالقاعدة" },
                  { id: "STUDENT_QUESTION", label: "سؤال للتلاميذ" },
                  { id: "WARNING", label: "تنبيه منهجي" },
                ] as Array<{ id: SlideCommentCategory; label: string }>
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNewCommentCategory(cat.id)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border text-center cursor-pointer transition ${
                    newCommentCategory === cat.id
                      ? "bg-indigo-600 text-white border-indigo-400 font-black"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="اكتب تعليقاً نصياً لإضافته على هذه الشريحة (مثال: انتبه لتغيير الإشارة عند الضرب في عدد سالب)..."
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white leading-relaxed focus:outline-none focus:border-amber-400 resize-none"
            />

            <button
              type="button"
              onClick={handleAddSlideComment}
              disabled={!newCommentText.trim()}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>
                {pendingPinCoords
                  ? "إضافة التعليق وتثبيته في الموضع المحدد على الشريحة"
                  : `إضافة التعليق النصي للشريحة #${currentSlide.slideNumber}`}
              </span>
            </button>
          </div>

          {/* 3. قائمة التعليقات النصية المسجلة على الشريحة الحالية */}
          <div className="flex-1 space-y-2">
            <div className="text-xs font-black text-slate-300 flex items-center justify-between">
              <span>
                التعليقات المسجلة على هذه الشريحة ({currentSlideComments.length}):
              </span>
            </div>

            {currentSlideComments.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center text-xs text-slate-400">
                لا توجد بطاقات تعليقات مضافة لهذه الشريحة بعد. يمكنك كتابة تعليق بالأعلى أو تدوين الشرح في مذكرة الشريحة.
              </div>
            ) : (
              <div className="space-y-2">
                {currentSlideComments.map((cmt, idx) => {
                  const meta = getCategoryMeta(cmt.category);
                  return (
                    <div
                      key={cmt.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-black border flex items-center gap-1 ${meta.badgeCls}`}
                        >
                          {meta.icon}
                          <span>
                            #{idx + 1} · {meta.label}
                          </span>
                          {cmt.pinX !== undefined && (
                            <span className="text-[10px] opacity-90">📍 مثبت</span>
                          )}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500">
                            {cmt.createdAt}
                          </span>
                          {!effectiveIsSlideLocked && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(cmt.id)}
                              className="text-slate-500 hover:text-rose-400 cursor-pointer"
                              title="حذف التعليق"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed">
                        <MathText text={cmt.text} />
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. الشريط السفلي الواضح للتنقل السلس بين الشرائح (السابق / التالي) */}
      <div className="px-4 sm:px-8 py-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrevSlide}
          disabled={currentSlideIdx === 0}
          className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs sm:text-sm font-black flex items-center gap-2 border border-slate-700 cursor-pointer transition"
        >
          <ChevronRight className="w-4 h-4 text-amber-400" />
          <span>الشريحة السابقة (السهم الأيمن)</span>
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="font-mono font-bold text-amber-300">
            الشريحة {currentSlideIdx + 1} / {slides.length}
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">
            استعمل الأسهم (يمين/يسار) للتمرير بين شرائح الـ PDF المقطّعة أو (F) لملء الشاشة
          </span>
        </div>

        <button
          type="button"
          onClick={handleNextSlide}
          disabled={currentSlideIdx === slides.length - 1}
          className="px-6 py-2 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition"
        >
          <span>الشريحة التالية (السهم الأيسر)</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* نافذة القفل الرقمي للشرائح بكلمة مرور الأستاذ */}
      <SlideDigitalLockModal
        isOpen={isLockModalOpen}
        isSlideLocked={effectiveIsSlideLocked}
        currentSavedPassword={teacherPasswordHash}
        onClose={closeLockModal}
        onLock={handleLockWithPassword}
        onUnlock={handleUnlockWithPassword}
      />

      {/* نافذة استيراد ملفات PDF مباشرة من Google Drive */}
      <GoogleDrivePdfImporterModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        defaultTargetMode="PDF_SLIDESHOW"
        onImportPdfBuffer={async (fileName, arrayBuffer, targetMode) => {
          await sliceUploadedPdfBuffer(
            new Uint8Array(arrayBuffer),
            fileName,
            sectionsPerUploadedPage
          );
          if (targetMode === "PDF_BEAMER" && onConvertToBeamer) {
            onConvertToBeamer();
          }
        }}
      />
    </div>
  );
};
