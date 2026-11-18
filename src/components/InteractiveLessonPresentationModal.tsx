import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Layers,
  Award,
  Clock,
  X,
  PenTool,
  Languages,
  Sun,
  Moon,
  ListOrdered,
  Target,
  Lightbulb,
  HelpCircle,
  FileUp,
  FileCode2,
  Download,
  Copy,
  RefreshCw,
  FileText,
  Scissors,
  MessageSquarePlus,
  Trash2,
  Pen,
  Lock,
  Unlock,
  Cloud,
} from "lucide-react";
import { LessonItem, TrackData, DocLanguage } from "../data/curriculum";
import { MathText } from "./MathRenderer";
import { InteractivePdfSlideshowViewer } from "./InteractivePdfSlideshowViewer";
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

interface InteractiveLessonPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: LessonItem[];
  track: TrackData;
  profName: string;
  schoolName: string;
  academicYear: string;
  docLang: DocLanguage;
  isMission?: boolean;
}

type PresentationTheme = "BEAMER_DARK" | "WHITEBOARD_LIGHT" | "CHALKBOARD_GREEN";

interface SlideParagraphBlock {
  id: string;
  badgeAr: string;
  badgeFr: string;
  titleAr: string;
  titleFr: string;
  contentAr: string[];
  contentFr: string[];
  revealSolutionAr?: string;
  revealSolutionFr?: string;
  blockType: "CONCEPT" | "THEOREM" | "ACTIVITY" | "QUESTION" | "WARNING";
}

interface LessonSlide {
  id: string;
  sectionLabelAr: string;
  sectionLabelFr: string;
  slideTitleAr: string;
  slideTitleFr: string;
  blocks: SlideParagraphBlock[];
}

interface ImportedPdfMetadata {
  fileName: string;
  pageCount: number;
  deckTitleAr: string;
  deckTitleFr: string;
  detectedTrackLabel: string;
  pedagogicalSummaryAr: string;
}

export const InteractiveLessonPresentationModal: React.FC<
  InteractiveLessonPresentationModalProps
> = ({
  isOpen,
  onClose,
  lessons,
  track,
  profName,
  schoolName,
  academicYear,
  docLang,
  isMission = false,
}) => {
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);
  const [focusedParagraphIdx, setFocusedParagraphIdx] = useState<number>(0);
  const [revealedSolutions, setRevealedSolutions] = useState<
    Record<string, boolean>
  >({});
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [theme, setTheme] = useState<PresentationTheme>("BEAMER_DARK");
  const [langMode, setLangMode] = useState<"AR" | "FR" | "BILINGUAL">(
    isMission || docLang === "FR"
      ? "FR"
      : docLang === "BILINGUAL"
      ? "BILINGUAL"
      : "AR"
  );
  const [fontScale, setFontScale] = useState<number>(100);

  // مؤقت الحصة التفاعلي (55 دقيقة افتراضياً — ينطلق من الحصة الصباحية 08:00 - 09:00)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [spotlightMode, setSpotlightMode] = useState<boolean>(false);

  // سبورة الشرح السريع (Scratchpad)
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [scratchpadNotes, setScratchpadNotes] = useState<string>("");

  // حالة استيراد ملف PDF وتحويله إلى عرض Beamer تفاعلي أو شرائح صفحات PDF مقطّعة (Interactive Slideshow)
  const [deckSourceMode, setDeckSourceMode] = useState<
    "CURRICULUM" | "PDF_BEAMER" | "PDF_SLIDESHOW"
  >("CURRICULUM");
  const [uploadedPdfForSlideshow, setUploadedPdfForSlideshow] = useState<{
    name: string;
    arrayBuffer: ArrayBuffer;
  } | null>(null);
  const [importedPdfSlides, setImportedPdfSlides] = useState<LessonSlide[]>([]);
  const [importedPdfMeta, setImportedPdfMeta] = useState<ImportedPdfMetadata | null>(null);
  const [customLatexBeamerCode, setCustomLatexBeamerCode] = useState<string>("");
  const [isConvertingPdf, setIsConvertingPdf] = useState<boolean>(false);
  const [pdfImportStatusMsg, setPdfImportStatusMsg] = useState<string>("");
  const [showBeamerLatexModal, setShowBeamerLatexModal] = useState<boolean>(false);
  const [copiedLatex, setCopiedLatex] = useState<boolean>(false);

  // التعليقات النصية الخاصة بكل شريحة في وضع Beamer ليتمكن المعلم من تدوين ملاحظاته أثناء الشرح
  const [perSlideTeacherComments, setPerSlideTeacherComments] = useState<
    Record<string, string[]>
  >({});
  const [draftSlideComment, setDraftSlideComment] = useState<string>("");

  // لوحة الرسم التفاعلية (Canvas) فوق كل شريحة للرسم والكتابة اليدوية بالقلم الرقمي أو الماوس
  const [isSlideDrawingActive, setIsSlideDrawingActive] = useState<boolean>(false);

  // القفل الرقمي للشرائح بكلمة مرور الأستاذ + نافذة استيراد PDF من Google Drive
  const {
    isSlideLocked,
    openLockModal,
    closeLockModal,
    isLockModalOpen,
    teacherPasswordHash,
    handleLockWithPassword,
    handleUnlockWithPassword,
  } = useSlideDigitalLock();
  const [isDriveImportModalOpen, setIsDriveImportModalOpen] =
    useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const activeLesson: LessonItem | undefined =
    lessons[selectedLessonIdx] || lessons[0];

  const currentDidacticPhase = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    if (mins < 10) {
      return {
        slot: "08:00 - 08:10",
        labelAr: "تشخيص المكتسبات والتعاقد الديداكتيكي",
        labelFr: "Diagnostic des prérequis & Contrat didactique",
      };
    }
    if (mins < 25) {
      return {
        slot: "08:10 - 08:25",
        labelAr: "النشاط البنائي واستكشاف المظنونات",
        labelFr: "Activité constructive & Conjectures",
      };
    }
    if (mins < 40) {
      return {
        slot: "08:25 - 08:40",
        labelAr: "مأسسة التعاريف والمبرهنات وتدوين الملخص",
        labelFr: "Institutionnalisation du cours & Théorèmes",
      };
    }
    if (mins < 50) {
      return {
        slot: "08:40 - 08:50",
        labelAr: "الترييض وإنجاز التطبيق النموذجي",
        labelFr: "Application résolue & Fiches méthodes",
      };
    }
    return {
      slot: "08:50 - 09:00",
      labelAr: "تقويم تكويني وتدوين دفتر النصوص (08:00-09:00)",
      labelFr: "Bilan formatif & Consignation au Cahier de Textes",
    };
  }, [elapsedSeconds]);

  useEffect(() => {
    if (!isOpen || !isTimerRunning) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isTimerRunning]);

  // بناء شرائح وفقرات الدرس التفاعلية بذكاء من بيانات المنهاج والجذاذة
  const curriculumSlides = useMemo<LessonSlide[]>(() => {
    if (!activeLesson) return [];

    const capAr =
      activeLesson.capacitiesAr && activeLesson.capacitiesAr.length > 0
        ? activeLesson.capacitiesAr
        : [
            `ضبط المفاهيم والمبرهنات الأساسية لدرس ${activeLesson.lessonAr}`,
            "توظيف التقنيات الجبرية والتحليلية في حل مسائل التوليف",
          ];

    const capFr =
      activeLesson.capacitiesFr && activeLesson.capacitiesFr.length > 0
        ? activeLesson.capacitiesFr
        : [
            `Maîtriser les concepts fondamentaux de : ${activeLesson.lessonFr}`,
            "Mobiliser les propriétés et théorèmes dans la résolution de problèmes",
          ];

    const questionsAr =
      activeLesson.sampleExerciseAr && activeLesson.sampleExerciseAr.length > 0
        ? activeLesson.sampleExerciseAr
        : [
            `1) حدد مجموعة تعريف الدالة أو المتتالية المرتبطة بدرس ${activeLesson.lessonAr} وادرس اتصالها.`,
            `2) بين بالتفصيل الخاصية الجبرية أو الهندسية المطلوبة ثم استنتج التأويل المبياني.`,
            `3) حل في المجموعة المدروسة المعادلة أو المتراجحة المرتبطة بالوضع النسبي.`,
          ];

    const questionsFr =
      activeLesson.sampleExerciseFr && activeLesson.sampleExerciseFr.length > 0
        ? activeLesson.sampleExerciseFr
        : [
            `1) Déterminer le domaine de définition et étudier la continuité dans le cadre de : ${activeLesson.lessonFr}.`,
            `2) Démontrer la propriété principale puis interpréter géométriquement le résultat obtenu.`,
            `3) En déduire l'encadrement ou la résolution de l'équation sur l'intervalle considéré.`,
          ];

    const solutionsAr =
      activeLesson.sampleSolutionAr && activeLesson.sampleSolutionAr.length > 0
        ? activeLesson.sampleSolutionAr
        : questionsAr.map(
            (_, idx) =>
              `عناصر الإجابة للسؤال (${
                idx + 1
              }): نطبق التعريف الرسمي ومبرهنات درس « ${
                activeLesson.lessonAr
              } » مع التحقق من شروط القابلية والاتصال على المجال المحدد.`
          );

    const solutionsFr =
      activeLesson.sampleSolutionFr && activeLesson.sampleSolutionFr.length > 0
        ? activeLesson.sampleSolutionFr
        : questionsFr.map(
            (_, idx) =>
              `Éléments de réponse (${
                idx + 1
              }) : En appliquant directement le théorème du chapitre « ${
                activeLesson.lessonFr
              } » et en vérifiant les hypothèses sur l'intervalle.`
          );

    const fiche = activeLesson.ficheDidactique;

    return [
      // الشريحة 1: التقديم والقدرات المنتظرة
      {
        id: "slide_intro_capacities",
        sectionLabelAr: "المحطة 1: التأطير الديداكتيكي والقدرات المنتظرة",
        sectionLabelFr: "Étape 1 : Cadrage Didactique & Capacités Attendues",
        slideTitleAr: activeLesson.lessonAr,
        slideTitleFr: activeLesson.lessonFr,
        blocks: [
          {
            id: "blk_ident",
            badgeAr: "البطاقة التقنية للدرس",
            badgeFr: "Fiche d'identité du chapitre",
            titleAr: `المستوى: ${track.labelAr} · الغلاف الزمني: ${
              activeLesson.hours || "10h"
            }`,
            titleFr: `Filière : ${track.labelFr} · Volume horaire : ${
              activeLesson.hours || "10h"
            }`,
            contentAr: [
              `يندرج درس « ${activeLesson.lessonAr} » ضمن المكونات المهيكلة لبرنامج الرياضيات بالسلك الثانوي التأهيلي وفق التوجيهات التربوية الرسمية (2007).`,
            ],
            contentFr: [
              `Le chapitre « ${activeLesson.lessonFr} » s'inscrit dans le programme officiel de mathématiques du cycle secondaire qualifiant (Orientations Pédagogiques 2007).`,
            ],
            blockType: "CONCEPT",
          },
          {
            id: "blk_capacities",
            badgeAr: "القدرات المنتظرة (OP 2007)",
            badgeFr: "Capacités Attendues Officiellement",
            titleAr: "الأهداف التعلمية والمهارات المستهدفة في نهاية الدرس",
            titleFr: "Objectifs d'apprentissage et compétences visées",
            contentAr: capAr,
            contentFr: capFr,
            blockType: "THEOREM",
          },
        ],
      },

      // الشريحة 2: المكتسبات القبلية والنشاط البنائي
      {
        id: "slide_activity_prereq",
        sectionLabelAr: "المحطة 2: تشخيص المكتسبات والوضعية المشكلة",
        sectionLabelFr: "Étape 2 : Prérequis & Activité Constructive",
        slideTitleAr: `الوضعية الانطلاقية لبناء مفهوم: ${activeLesson.lessonAr}`,
        slideTitleFr: `Activité d'approche : ${activeLesson.lessonFr}`,
        blocks: [
          {
            id: "blk_prereq",
            badgeAr: "المكتسبات القبلية اللازمة",
            badgeFr: "Prérequis Fondamentaux",
            titleAr: "تذكير بالمفاهيم السابقة الضرورية لبناء الدرس",
            titleFr: "Rappel des notions antérieures indispensables",
            contentAr:
              fiche?.prerequisAr && fiche.prerequisAr.length > 0
                ? fiche.prerequisAr
                : [
                    "تقنيات الحساب الجبري والعددي ومجموعة تعريف الدوال المرجعية.",
                    "قواعد الإشارة، التعميل، والعمليات على المتفاوتات في $\\mathbb{R}$.",
                    "التأويل الهندسي للميل والمماس والتمثيل المبياني في معلم متعامد ممنظم $(O,\\vec{i},\\vec{j})$.",
                  ],
            contentFr:
              fiche?.prerequisFr && fiche.prerequisFr.length > 0
                ? fiche.prerequisFr
                : [
                    "Techniques de calcul algébrique et domaine de définition des fonctions usuelles.",
                    "Étude de signe, factorisation et opérations sur les inégalités dans $\\mathbb{R}$.",
                    "Interprétation graphique dans un repère orthonormé $(O,\\vec{i},\\vec{j})$.",
                  ],
            blockType: "CONCEPT",
          },
          {
            id: "blk_activity",
            badgeAr: "نشاط بنائي استكشافي",
            badgeFr: "Activité de Découverte",
            titleAr: "وضعية مشكلة مقترحة للتفاعل الجماعي في القسم",
            titleFr: "Situation-problème pour le débat mathématique en classe",
            contentAr: [
              fiche?.activiteIntroAr ||
                `نعتبر الوضعية الرياضية المؤطرة لمفهوم « ${activeLesson.lessonAr} ». الهدف هو استكشاف العلاقة بين التمثيل المبياني والصياغة التحليلية واستنتاج الخاصية المميزة.`,
              "1) أنجز التمثيل أو الحساب الأولي لحالات خاصة بسيطة.",
              "2) صُغ مظنونة (Conjecture) عامة ثم برهن عليها باستعمال التعاريف القبلية.",
            ],
            contentFr: [
              fiche?.activiteIntroFr ||
                `Considérons une situation modélisant « ${activeLesson.lessonFr} ». L'objectif est de dégager le lien entre l'intuition géométrique et la formulation analytique rigoureuse.`,
              "1) Tester la propriété sur des cas particuliers simples.",
              "2) Formuler une conjecture générale et établir sa démonstration.",
            ],
            revealSolutionAr:
              "خلاصة النشاط: تفضي المناقشة الجماعية إلى صياغة التعريف الرسمي وضبط الشروط الكافية واللازمة لتطبيق المبرهنة.",
            revealSolutionFr:
              "Bilan de l'activité : La mise en commun conduit à l'énoncé formel de la définition et des conditions d'application du théorème.",
            blockType: "ACTIVITY",
          },
        ],
      },

      // الشريحة 3: ملخص الدرس والمبرهنات الأساسية
      {
        id: "slide_core_theorems",
        sectionLabelAr: "المحطة 3: البناء المفاهيمي والمبرهنات الأساسية",
        sectionLabelFr: "Étape 3 : Institutionnalisation & Théorèmes Clés",
        slideTitleAr: `فقرات الدرس والخاصيات المرجعية — ${activeLesson.lessonAr}`,
        slideTitleFr: `Synthèse du Cours & Propriétés — ${activeLesson.lessonFr}`,
        blocks: [
          {
            id: "blk_def",
            badgeAr: "فقرة 1: التعريف الرياضي",
            badgeFr: "Paragraphe 1 : Définition Fondamentale",
            titleAr: "الصياغة الأكاديمية المضبوطة للمفهوم",
            titleFr: "Énoncé formel et notations canoniques",
            contentAr: [
              fiche?.resumeCoursAr ||
                `ليكن العنصر الرياضي المدروس ضمن درس « ${activeLesson.lessonAr} » محققاً للشروط القبلية على مجاله.`,
              `• الشرط الأساسي: التحقق الدقيق من الانتماء إلى مجموعة التعريف $D_f$ قبل إجراء أي تحويل جبري أو تحليلي.`,
            ],
            contentFr: [
              fiche?.resumeCoursFr ||
                `Soit l'objet mathématique étudié dans le chapitre « ${activeLesson.lessonFr} » vérifiant les hypothèses sur son domaine.`,
              `• Condition essentielle : Vérifier systématiquement le domaine de validité $D_f$ avant toute transformation.`,
            ],
            blockType: "CONCEPT",
          },
          {
            id: "blk_thm",
            badgeAr: "فقرة 2: المبرهنة والنتائج",
            badgeFr: "Paragraphe 2 : Théorème & Corollaires",
            titleAr: "الخاصيات الإجرائية وتطبيقاتها المباشرة",
            titleFr: "Propriétés opératoires et conséquences directes",
            contentAr: capAr.map((c, i) => `خاصية (${i + 1}): ${c}`),
            contentFr: capFr.map((c, i) => `Propriété (${i + 1}) : ${c}`),
            blockType: "THEOREM",
          },
          {
            id: "blk_err",
            badgeAr: "فقرة 3: تنبيهات منهجية",
            badgeFr: "Paragraphe 3 : Vigilance Didactique",
            titleAr: "الأخطاء الشائعة لدى التلاميذ وسبل تفاديها",
            titleFr: "Erreurs fréquentes des élèves et remédiation",
            contentAr:
              fiche?.erreursFrequentesAr && fiche.erreursFrequentesAr.length > 0
                ? fiche.erreursFrequentesAr
                : [
                    "تطبيق المبرهنة دون التصريح الصريح بتحقق الشروط القبلية (كالاتصال أو قابلية الاشتقاق أو قطعية الرتابة).",
                    "الخلط بين الشرط اللازم والشرط الكافي أثناء الاستدلال بالاستلزام $\\Rightarrow$ أو التكافؤ $\\Leftrightarrow$.",
                  ],
            contentFr:
              fiche?.erreursFrequentesFr && fiche.erreursFrequentesFr.length > 0
                ? fiche.erreursFrequentesFr
                : [
                    "Omission de la vérification explicite des hypothèses du théorème (continuité, dérivabilité, monotonie stricte).",
                    "Confusion entre implication simple ($\\Rightarrow$) et équivalence logique ($\\Leftrightarrow$).",
                  ],
            blockType: "WARNING",
          },
        ],
      },

      // الشريحة 4: التمرين التطبيقي مع الحل التدريجي
      {
        id: "slide_application_exercise",
        sectionLabelAr: "المحطة 4: التمرين التطبيقي والتقويم المرحلي",
        sectionLabelFr: "Étape 4 : Exercice d'Application & Corrigé Progressif",
        slideTitleAr: `تطبيق شامل على السبورة: ${activeLesson.lessonAr}`,
        slideTitleFr: `Exercice d'application résolu : ${activeLesson.lessonFr}`,
        blocks: questionsAr.map((qAr, idx) => ({
          id: `blk_q_${idx}`,
          badgeAr: `السؤال التطبيقي ${idx + 1}`,
          badgeFr: `Question d'application ${idx + 1}`,
          titleAr: `الفقرة التطبيقية رقم ${idx + 1}`,
          titleFr: `Sous-question ${idx + 1}`,
          contentAr: [qAr],
          contentFr: [questionsFr[idx] || qAr],
          revealSolutionAr: solutionsAr[idx],
          revealSolutionFr: solutionsFr[idx],
          blockType: "QUESTION" as const,
        })),
      },

      // الشريحة 5: بطاقة الطرائق المنهجية وتدوين دفتر النصوص (08:00 - 09:00)
      {
        id: "slide_methods_and_cahier",
        sectionLabelAr: "المحطة 5: بطاقة الطرائق وتدوين دفتر النصوص",
        sectionLabelFr: "Étape 5 : Fiches Méthodes & Cahier de Textes",
        slideTitleAr: `منهجية التحرير الرياضي السليم وتلخيص الحصة — ${activeLesson.lessonAr}`,
        slideTitleFr: `Fiches Méthodes, Rédaction Type & Bilan — ${activeLesson.lessonFr}`,
        blocks: [
          {
            id: "blk_method_card",
            badgeAr: "بطاقة الطرائق المنهجية (Fiche Méthode)",
            badgeFr: "Fiche Méthode — Comment rédiger au DS & Bac ?",
            titleAr: "كيف نحرر جواباً رياضياً كاملاً يضمن النقطة الكاملة؟",
            titleFr: "Protocole de rédaction rigoureuse pour l'examen",
            contentAr: [
              `1) التصريح الصريح بمجموعة التعريف والتحقق من الشروط القبلية للمبرهنة المستعملة في درس « ${activeLesson.lessonAr} ».`,
              "2) ربط المعطيات بالنتيجة عبر روابط منطقية سليمة (تكافؤ $\\Leftrightarrow$ في المعادلات، استلزام $\\Rightarrow$ في الاستنتاجات).",
              "3) تأطير النتيجة النهائية وإرفاقها بالتأويل الهندسي أو المبياني المطلوب.",
            ],
            contentFr: [
              `1) Citer explicitement le domaine de validité et vérifier les hypothèses du théorème de « ${activeLesson.lessonFr} ».`,
              "2) Enchaîner les étapes avec les connecteurs logiques appropriés ($\\Leftrightarrow$ ou $\\Rightarrow$).",
              "3) Encadrer le résultat final et formuler l'interprétation graphique.",
            ],
            blockType: "THEOREM",
          },
          {
            id: "blk_quick_check",
            badgeAr: "رائز الفهم الفوري (Quiz Minute)",
            badgeFr: "Question Flash de Vérification",
            titleAr: "سؤال شفهي سريع لقياس استيعاب القسم قبل ختام الحصة",
            titleFr: "Vérification rapide des acquis de la séance",
            contentAr: [
              `سؤال للتفكير السريع: هل تبقى الخاصية الأساسية في درس « ${activeLesson.lessonAr} » صحيحة إذا اختل أحد شروطها الحدّية على المجال المدروس؟ أعطِ مثالاً مضاداً (Contre-exemple).`,
            ],
            contentFr: [
              `Question Flash : La propriété principale de « ${activeLesson.lessonFr} » reste-t-elle vraie si l'une des hypothèses aux bornes est omise ? Proposer un contre-exemple.`,
            ],
            revealSolutionAr:
              "الجواب المنهجي: لا، إغفال أحد شروط المبرهنة يبطل الاستنتاج العام؛ ويكفي إنشاء مثال مضاد بسيط (دالة غير متصلة في نقطة أو متتالية غير مكبورة) لإثبات عدم صحة الاستلزام العكسي.",
            revealSolutionFr:
              "Réponse méthodologique : Non, l'omission d'une hypothèse invalide la conclusion. Un contre-exemple simple sur un intervalle ouvert ou une fonction discontinue suffit à le démontrer.",
            blockType: "QUESTION",
          },
          {
            id: "blk_cahier_closure",
            badgeAr: "دفتر النصوص الرسمي (08:00 - 09:00)",
            badgeFr: "Consignation au Cahier de Textes (08:00 - 09:00)",
            titleAr: "ملخص ما يُدوَّن في دفتر النصوص والتكليف المنزلي للحصة المقبلة",
            titleFr: "Synthèse officielle à consigner et travail à faire",
            contentAr: [
              `• الحصة المنجزة (08:00 - 09:00): بناء ومأسسة مفاهيم درس « ${activeLesson.lessonAr} » وإنجاز التطبيق النموذجي.`,
              "• العمل المنزلي المستقل: إنجاز التمارين 1 و 2 و 3 من سلسلة التمارين الرسمية للدرس استعداداً لحصة الترييض المقبلة.",
            ],
            contentFr: [
              `• Séance réalisée (08:00 - 09:00) : Institutionnalisation des notions de « ${activeLesson.lessonFr} » et exercice d'application.`,
              "• Travail personnel à faire : Chercher les exercices 1, 2 et 3 de la série TD pour la prochaine séance.",
            ],
            blockType: "CONCEPT",
          },
        ],
      },
    ];
  }, [activeLesson, track]);

  const slides = useMemo<LessonSlide[]>(() => {
    if (deckSourceMode === "PDF_BEAMER" && importedPdfSlides.length > 0) {
      return importedPdfSlides;
    }
    return curriculumSlides;
  }, [deckSourceMode, importedPdfSlides, curriculumSlides]);

  const currentSlide = slides[currentSlideIdx] || slides[0];

  // توليد كود LaTeX Beamer القياسي للشرائح النشطة تلقائياً إذا لم يكن مستورداً
  const activeLatexBeamerSource = useMemo(() => {
    if (deckSourceMode === "PDF_BEAMER" && customLatexBeamerCode.trim().length > 0) {
      return customLatexBeamerCode;
    }
    const framesTex = slides
      .map((s, sIdx) => {
        const blocksTex = s.blocks
          .map((b) => {
            const env =
              b.blockType === "WARNING"
                ? "alertblock"
                : b.blockType === "ACTIVITY" || b.blockType === "QUESTION"
                ? "exampleblock"
                : "block";
            const items = b.contentFr
              .map((line) => `      \\item ${line}`)
              .join("\n");
            const solPart = b.revealSolutionFr
              ? `\n    \\pause\n    \\vspace{0.2cm}\n    \\textbf{Corrigé / Preuve :} ${b.revealSolutionFr}`
              : "";
            return `  \\begin{${env}}{${b.badgeFr} --- ${b.titleFr}}\n    \\begin{itemize}\n${items}\n    \\end{itemize}${solPart}\n  \\end{${env}}\n  \\pause`;
          })
          .join("\n\n");

        return `% --- Frame ${sIdx + 1}: ${s.sectionLabelFr} ---\n\\section{${s.sectionLabelFr}}\n\\begin{frame}{${s.slideTitleFr}}\n${blocksTex}\n\\end{frame}`;
      })
      .join("\n\n");

    return `\\documentclass[aspectratio=169,11pt]{beamer}
\\usetheme{Madrid}
\\usecolortheme{whale}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{amsmath,amssymb,amsfonts,amsthm}

\\title[${activeLesson?.lessonFr || "Mathématiques"}]{${
      activeLesson?.lessonFr || "Cours de Mathématiques"
    }}
\\subtitle{Filière : ${track.labelFr} --- Année Scolaire ${academicYear}}
\\author{Prof. ${profName}}
\\institute{${schoolName}}
\\date{\\today}

\\begin{document}

\\begin{frame}
  \\titlepage
\\end{frame}

\\begin{frame}{Plan de la séance (08:00 -- 09:00)}
  \\tableofcontents
\\end{frame}

${framesTex}

\\end{document}`;
  }, [
    deckSourceMode,
    customLatexBeamerCode,
    slides,
    activeLesson,
    track.labelFr,
    academicYear,
    profName,
    schoolName,
  ]);

  // دالة موحدة لمعالجة أي ملف PDF (سواء من الجهاز أو مستورد مباشرة من Google Drive) دون تكرار العمليات
  const processPdfArrayBuffer = useCallback(
    async (
      fileName: string,
      arrayBuffer: ArrayBuffer,
      targetMode: "PDF_BEAMER" | "PDF_SLIDESHOW" = "PDF_BEAMER"
    ) => {
      setUploadedPdfForSlideshow({
        name: fileName,
        arrayBuffer: arrayBuffer.slice(0),
      });

      if (targetMode === "PDF_SLIDESHOW") {
        setDeckSourceMode("PDF_SLIDESHOW");
        setPdfImportStatusMsg("");
        return;
      }

      setIsConvertingPdf(true);
      setPdfImportStatusMsg(
        `جاري قراءة ملف PDF « ${fileName} » واستخراج البنية الرياضية...`
      );

      try {
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer.slice(0),
        });
        const pdfDoc = await loadingTask.promise;
        const numPages = pdfDoc.numPages;

        let fullExtractedText = "";
        let firstPageImageBase64 = "";

        const maxPagesToParse = Math.min(numPages, 12);
        for (let pageNum = 1; pageNum <= maxPagesToParse; pageNum++) {
          setPdfImportStatusMsg(
            `جاري تحليل الصفحة ${pageNum} من ${maxPagesToParse} واستخراج الصيغ الرياضية...`
          );
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => ("str" in item ? item.str : ""))
            .join(" ");
          fullExtractedText += `\n--- [Page ${pageNum}] ---\n${pageText}\n`;

          // التقاط صورة الصفحة الأولى لدعم الرؤية الحاسوبية (Vision OCR) عند الحاجة
          if (pageNum === 1) {
            try {
              const viewport = page.getViewport({ scale: 1.4 });
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (ctx) {
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: ctx, viewport } as any)
                  .promise;
                firstPageImageBase64 = canvas.toDataURL("image/jpeg", 0.8);
              }
            } catch {
              // تجاهل خطأ الرسم إن تعذر
            }
          }
        }

        setPdfImportStatusMsg(
          "جاري هيكلة شرائح العرض التقديمي Beamer وتوليد كود LaTeX الرسمي..."
        );

        const response = await fetch("/api/convert-pdf-to-beamer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfFileName: fileName,
            pageCount: numPages,
            extractedText: fullExtractedText,
            firstPageImageBase64,
            targetTrackCode: track.code,
            lessonTitleAr: activeLesson?.lessonAr || "درس الرياضيات",
            lessonTitleFr: activeLesson?.lessonFr || "Cours de Mathématiques",
            profName,
            schoolName,
          }),
        });

        if (!response.ok) {
          throw new Error("تعذر الاتصال بمحرك تحويل PDF إلى Beamer");
        }

        const data = await response.json();
        if (Array.isArray(data.slides) && data.slides.length > 0) {
          setImportedPdfSlides(data.slides);
          setImportedPdfMeta({
            fileName,
            pageCount: numPages,
            deckTitleAr: data.deckTitleAr || `عرض Beamer: ${fileName}`,
            deckTitleFr:
              data.deckTitleFr || `Présentation Beamer : ${fileName}`,
            detectedTrackLabel: data.detectedTrackLabel || track.labelAr,
            pedagogicalSummaryAr:
              data.pedagogicalSummaryAr ||
              "تم تحويل مستند PDF بنجاح إلى شرائح Beamer تفاعلية مع فصل التعاريف والمبرهنات والتمارين وحلولها التدريجية.",
          });
          if (typeof data.latexBeamerSource === "string") {
            setCustomLatexBeamerCode(data.latexBeamerSource);
          }
          setDeckSourceMode("PDF_BEAMER");
          setCurrentSlideIdx(0);
          setFocusedParagraphIdx(0);
          setRevealedSolutions({});
          setPdfImportStatusMsg("");
        }
      } catch (err: any) {
        setPdfImportStatusMsg(
          err?.message ||
            "حدث خطأ أثناء قراءة ملف PDF وتحويله إلى عرض Beamer."
        );
      } finally {
        setIsConvertingPdf(false);
      }
    },
    [track.code, track.labelAr, activeLesson, profName, schoolName]
  );

  // استيراد ملف PDF محلي وتحويله إلى عرض Beamer
  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    await processPdfArrayBuffer(file.name, arrayBuffer, "PDF_BEAMER");
    if (pdfFileInputRef.current) {
      pdfFileInputRef.current.value = "";
    }
  };

  // تحويل فوري لنموذج PDF تجريبي إلى عرض Beamer بضغطة زر
  const handleLoadSamplePdfBeamer = async () => {
    if (!activeLesson) return;
    setIsConvertingPdf(true);
    setPdfImportStatusMsg(
      "جاري تحويل وثيقة PDF النموذجية للدرس إلى عرض Beamer تفاعلي..."
    );
    try {
      const sampleExtractedText = `
        Royaume du Maroc - Ministère de l'Éducation Nationale
        Lycée Qualifiant: ${schoolName} | Professeur: ${profName}
        Filière: ${track.labelFr} (${track.labelAr})
        Chapitre: ${activeLesson.lessonFr} (${activeLesson.lessonAr})
        ---
        1. Capacités attendues:
        ${(activeLesson.capacitiesFr || []).join("\n")}
        ${(activeLesson.capacitiesAr || []).join("\n")}
        ---
        2. Résumé du cours & Théorèmes fondamentaux:
        ${activeLesson.ficheDidactique?.resumeCoursFr || ""}
        ${activeLesson.ficheDidactique?.resumeCoursAr || ""}
        ---
        3. Exercice d'application & Corrigé:
        Questions: ${(activeLesson.sampleExerciseFr || []).join(" | ")}
        Corrigé: ${(activeLesson.sampleSolutionFr || []).join(" | ")}
      `;

      const response = await fetch("/api/convert-pdf-to-beamer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfFileName: `${activeLesson.lessonFr.replace(/\s+/g, "_") || "Cours"}_Document_Officiel.pdf`,
          pageCount: 4,
          extractedText: sampleExtractedText,
          targetTrackCode: track.code,
          lessonTitleAr: activeLesson.lessonAr,
          lessonTitleFr: activeLesson.lessonFr,
          profName,
          schoolName,
        }),
      });

      const data = await response.json();
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        setImportedPdfSlides(data.slides);
        setImportedPdfMeta({
          fileName: `${activeLesson.lessonFr.replace(/\s+/g, "_")}.pdf`,
          pageCount: 4,
          deckTitleAr: data.deckTitleAr || `عرض Beamer: ${activeLesson.lessonAr}`,
          deckTitleFr: data.deckTitleFr || `Beamer : ${activeLesson.lessonFr}`,
          detectedTrackLabel: data.detectedTrackLabel || track.labelAr,
          pedagogicalSummaryAr:
            data.pedagogicalSummaryAr ||
            "تم توليد عرض Beamer من وثيقة PDF النموذجية للدرس بنجاح.",
        });
        if (typeof data.latexBeamerSource === "string") {
          setCustomLatexBeamerCode(data.latexBeamerSource);
        }
        setDeckSourceMode("PDF_BEAMER");
        setCurrentSlideIdx(0);
        setFocusedParagraphIdx(0);
        setRevealedSolutions({});
      }
      setPdfImportStatusMsg("");
    } catch {
      setPdfImportStatusMsg("تعذر توليد عرض Beamer النموذجي.");
    } finally {
      setIsConvertingPdf(false);
    }
  };

  const handleDownloadBeamerTex = () => {
    const blob = new Blob([activeLatexBeamerSource], {
      type: "text/x-tex;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName =
      deckSourceMode === "PDF_BEAMER" && importedPdfMeta
        ? importedPdfMeta.fileName.replace(/\.pdf$/i, "")
        : activeLesson?.lessonFr?.replace(/[^a-zA-Z0-9_-]/g, "_") || "Cours_Maths";
    a.download = `Presentation_Beamer_${baseName}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyBeamerTex = async () => {
    try {
      await navigator.clipboard.writeText(activeLatexBeamerSource);
      setCopiedLatex(true);
      setTimeout(() => setCopiedLatex(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  // التنقل بين الفقرات أو الشرائح
  const handleNextStep = useCallback(() => {
    if (!currentSlide) return;
    if (focusedParagraphIdx < currentSlide.blocks.length - 1) {
      setFocusedParagraphIdx((prev) => prev + 1);
    } else if (currentSlideIdx < slides.length - 1) {
      setCurrentSlideIdx((prev) => prev + 1);
      setFocusedParagraphIdx(0);
    }
  }, [currentSlide, focusedParagraphIdx, currentSlideIdx, slides.length]);

  const handlePrevStep = useCallback(() => {
    if (!currentSlide) return;
    if (focusedParagraphIdx > 0) {
      setFocusedParagraphIdx((prev) => prev - 1);
    } else if (currentSlideIdx > 0) {
      const prevSlide = slides[currentSlideIdx - 1];
      setCurrentSlideIdx((prev) => prev - 1);
      setFocusedParagraphIdx(Math.max(0, (prevSlide?.blocks.length || 1) - 1));
    }
  }, [currentSlide, focusedParagraphIdx, currentSlideIdx, slides]);

  const toggleBrowserFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  // اختصارات لوحة المفاتيح للتنقل السلس بين الفقرات والشرائح
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT"
      ) {
        return;
      }
      if (e.key === "ArrowLeft" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === "ArrowRight" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevStep();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleBrowserFullscreen();
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        setIsSlideDrawingActive((prev) => !prev);
      } else if (e.key === "Escape" && !document.fullscreenElement) {
        if (showBeamerLatexModal) {
          setShowBeamerLatexModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    handleNextStep,
    handlePrevStep,
    toggleBrowserFullscreen,
    onClose,
    showBeamerLatexModal,
  ]);

  if (!isOpen || !activeLesson || !currentSlide) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const themeClasses =
    theme === "WHITEBOARD_LIGHT"
      ? "bg-slate-50 text-slate-900"
      : theme === "CHALKBOARD_GREEN"
      ? "bg-[#0b291e] text-emerald-50"
      : "bg-slate-950 text-slate-100";

  return (
    <div
      ref={containerRef}
      dir="rtl"
      className={`fixed inset-0 z-50 flex flex-col select-none transition-colors duration-300 ${themeClasses}`}
    >
      {/* مدخل ملف PDF المخفي للاستيراد والتحويل إلى عرض Beamer */}
      <input
        ref={pdfFileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handlePdfFileUpload}
        className="hidden"
      />

      {/* 1. الشريط العلوي للعرض التقديمي (Beamer Control Bar) */}
      <div className="px-4 sm:px-6 py-3 bg-slate-900/95 border-b border-slate-800 text-white flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-md">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                {deckSourceMode === "PDF_BEAMER"
                  ? "PDF → LaTeX Beamer"
                  : "Beamer Mode · مسلاط القسم"}
              </span>
              <h2 className="text-sm sm:text-base font-black text-white truncate max-w-md">
                {deckSourceMode === "PDF_BEAMER" && importedPdfMeta
                  ? importedPdfMeta.deckTitleAr
                  : activeLesson.lessonAr}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              {schoolName} · ذ. {profName} · {track.labelAr} ({academicYear})
            </p>
          </div>
        </div>

        {/* أزرار استيراد ملف PDF وتحويله إلى شرائح تفاعلية مقطّعة (Interactive Slideshow) أو عرض Beamer */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setDeckSourceMode((prev) =>
                prev === "PDF_SLIDESHOW" ? "CURRICULUM" : "PDF_SLIDESHOW"
              )
            }
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md border transition ${
              deckSourceMode === "PDF_SLIDESHOW"
                ? "bg-amber-400 text-slate-950 border-amber-300 shadow-amber-500/20"
                : "bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 border-amber-300/60"
            }`}
            title="تقطيع صفحات ملف الـ PDF المرفق إلى شرائح منفصلة بأسلوب الدرس المحروس مع تعليقات نصية لكل شريحة"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>
              {deckSourceMode === "PDF_SLIDESHOW"
                ? "وضع شرائح PDF المقطّعة نشط"
                : "تقطيع PDF إلى شرائح تفاعلية"}
            </span>
          </button>

          <button
            type="button"
            disabled={isConvertingPdf}
            onClick={() => pdfFileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-l from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md border border-fuchsia-400/40 transition"
            title="استيراد أي ملف PDF (درس، ملخص، أو سلسلة تمارين) وتحويله بالذكاء الاصطناعي إلى عرض Beamer تفاعلي"
          >
            {isConvertingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileUp className="w-3.5 h-3.5" />
            )}
            <span>
              {isConvertingPdf
                ? "جاري تحويل PDF إلى Beamer..."
                : "استيراد PDF ← عرض Beamer"}
            </span>
          </button>

          <button
            type="button"
            disabled={isConvertingPdf}
            onClick={() => setIsDriveImportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-l from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 disabled:opacity-50 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition"
            title="استيراد ملفات الـ PDF مباشرة من Google Drive وتحويلها إلى عرض تفاعلي"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>استيراد PDF من Google Drive</span>
          </button>

          <button
            type="button"
            disabled={isConvertingPdf}
            onClick={handleLoadSamplePdfBeamer}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-fuchsia-300 border border-fuchsia-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            title="تجربة فورية لتحويل وثيقة PDF للدرس الحالي إلى شرائح Beamer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">محاكاة PDF ← Beamer</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBeamerLatexModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 cursor-pointer transition"
            title="معاينة وتصدير كود المصدر LaTeX Beamer (.tex) الجاهز للترجمة على Overleaf أو TeXstudio"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>كود LaTeX Beamer (.tex)</span>
          </button>

          {(importedPdfSlides.length > 0 || deckSourceMode !== "CURRICULUM") && (
            <button
              type="button"
              onClick={() => {
                setDeckSourceMode((prev) =>
                  prev === "CURRICULUM"
                    ? importedPdfSlides.length > 0
                      ? "PDF_BEAMER"
                      : "PDF_SLIDESHOW"
                    : "CURRICULUM"
                );
                setCurrentSlideIdx(0);
                setFocusedParagraphIdx(0);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-bold cursor-pointer"
            >
              {deckSourceMode !== "CURRICULUM"
                ? "العودة لعرض المنهاج"
                : "فتح عرض PDF المستورد"}
            </button>
          )}
        </div>

        {/* اختيار الدرس النشط في حال تعدد الدروس */}
        {lessons.length > 1 && deckSourceMode === "CURRICULUM" && (
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400 font-bold">الدرس:</span>
            <select
              value={selectedLessonIdx}
              onChange={(e) => {
                setSelectedLessonIdx(Number(e.target.value));
                setCurrentSlideIdx(0);
                setFocusedParagraphIdx(0);
              }}
              className="bg-transparent text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer"
            >
              {lessons.map((l, idx) => (
                <option key={idx} value={idx} className="bg-slate-900 text-white">
                  {idx + 1}. {l.lessonAr}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* أدوات التحكم بالعرض والوقت والسمة */}
        <div className="flex flex-wrap items-center gap-2">
          {/* مؤقت الحصة الدراسية والمرحلة الديداكتيكية الجارية (انطلاقاً من 08:00) */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-bold">
              {formatTimer(elapsedSeconds)}
            </span>
            <span className="hidden 2xl:inline-block text-[10px] font-sans font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-700/40 px-2 py-0.5 rounded">
              {currentDidacticPhase.slot} · {currentDidacticPhase.labelAr}
            </span>
            <button
              type="button"
              onClick={() => setIsTimerRunning((v) => !v)}
              className="p-0.5 hover:text-cyan-300 cursor-pointer"
              title={isTimerRunning ? "إيقاف مؤقت" : "استئناف"}
            >
              {isTimerRunning ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setElapsedSeconds(0)}
              className="p-0.5 hover:text-rose-300 cursor-pointer"
              title="تصفير المؤقت"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* وضع التركيز الضوئي (Spotlight Mode) للمسلاط */}
          <button
            type="button"
            onClick={() => setSpotlightMode((v) => !v)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition ${
              spotlightMode
                ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md shadow-amber-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-amber-200 border-slate-700"
            }`}
            title="عزل بصري للفقرة النشطة فقط على شاشة العرض (Spotlight)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{spotlightMode ? "تركيز نشط" : "تركيز ضوئي"}</span>
          </button>

          {/* تبديل لغة العرض على المسلاط */}
          <button
            type="button"
            onClick={() =>
              setLangMode((prev) =>
                prev === "AR" ? "BILINGUAL" : prev === "BILINGUAL" ? "FR" : "AR"
              )
            }
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>
              {langMode === "AR"
                ? "عربي"
                : langMode === "FR"
                ? "Français"
                : "مزدوج AR/FR"}
            </span>
          </button>

          {/* حجم الخط للمسلاط */}
          <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFontScale((s) => Math.max(85, s - 10))}
              className="px-2 py-1 hover:bg-slate-700 rounded-lg font-bold cursor-pointer"
            >
              A-
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-300">
              {fontScale}%
            </span>
            <button
              type="button"
              onClick={() => setFontScale((s) => Math.min(140, s + 10))}
              className="px-2 py-1 hover:bg-slate-700 rounded-lg font-bold cursor-pointer"
            >
              A+
            </button>
          </div>

          {/* تبديل سمة السبورة */}
          <button
            type="button"
            onClick={() =>
              setTheme((t) =>
                t === "BEAMER_DARK"
                  ? "WHITEBOARD_LIGHT"
                  : t === "WHITEBOARD_LIGHT"
                  ? "CHALKBOARD_GREEN"
                  : "BEAMER_DARK"
              )
            }
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            {theme === "WHITEBOARD_LIGHT" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
            <span>
              {theme === "BEAMER_DARK"
                ? "ليلي Beamer"
                : theme === "WHITEBOARD_LIGHT"
                ? "سبورة بيضاء"
                : "سبورة خضراء"}
            </span>
          </button>

          {/* لوحة الرسم التفاعلية وقلم الشرح على الشريحة */}
          <button
            type="button"
            onClick={() => setIsSlideDrawingActive((v) => !v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer transition ${
              isSlideDrawingActive
                ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300 font-black shadow-md shadow-amber-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
            }`}
            title="تفعيل لوحة الرسم الحر والكتابة بالقلم الرقمي أو الماوس مباشرة فوق الشريحة (D)"
          >
            <Pen className="w-3.5 h-3.5" />
            <span>{isSlideDrawingActive ? "قلم الرسم نشط" : "رسم على الشريحة (D)"}</span>
          </button>

          {/* زر القفل الرقمي للشرائح بكلمة مرور الأستاذ */}
          <button
            type="button"
            onClick={openLockModal}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer transition ${
              isSlideLocked
                ? "bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40"
            }`}
            title="ميزة القفل الرقمي للشرائح بكلمة مرور خاصة بالأستاذ لمنع التعديلات غير المصرح بها أثناء الدرس"
          >
            {isSlideLocked ? (
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

          {/* سبورة الشرح الهامشية */}
          <button
            type="button"
            onClick={() => setShowScratchpad((v) => !v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition ${
              showScratchpad
                ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>مسودة الشرح</span>
          </button>

          {/* زر ملء الشاشة الفعلي للمتصفح */}
          <button
            type="button"
            onClick={toggleBrowserFullscreen}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
            <span>{isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة (F)"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 cursor-pointer"
            title="إغلاق العرض التقديمي"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* شريط إشعار حالة تحويل PDF إلى Beamer أو معلومات الملف المستورد */}
      {(pdfImportStatusMsg ||
        (deckSourceMode === "PDF_BEAMER" && importedPdfMeta)) && (
        <div className="px-4 sm:px-6 py-2 bg-fuchsia-950/60 border-b border-fuchsia-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          {pdfImportStatusMsg ? (
            <div className="flex items-center gap-2 text-fuchsia-200 font-bold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-fuchsia-400" />
              <span>{pdfImportStatusMsg}</span>
            </div>
          ) : (
            importedPdfMeta && (
              <div className="flex flex-wrap items-center gap-3 text-fuchsia-100">
                <span className="px-2 py-0.5 rounded-md bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300 font-mono font-bold">
                  PDF المستورد: {importedPdfMeta.fileName} (
                  {importedPdfMeta.pageCount} ص)
                </span>
                <span className="text-slate-300">
                  {importedPdfMeta.pedagogicalSummaryAr}
                </span>
              </div>
            )
          )}
        </div>
      )}

      {deckSourceMode === "PDF_SLIDESHOW" ? (
        <InteractivePdfSlideshowViewer
          initialPdfFile={uploadedPdfForSlideshow}
          lessonTitleAr={activeLesson.lessonAr}
          lessonTitleFr={activeLesson.lessonFr}
          trackLabelAr={track.labelAr}
          profName={profName}
          schoolName={schoolName}
          isEmbeddedInModal={true}
          externalIsSlideLocked={isSlideLocked}
          onRequestOpenLockModal={openLockModal}
          onConvertToBeamer={() =>
            setDeckSourceMode(
              importedPdfSlides.length > 0 ? "PDF_BEAMER" : "CURRICULUM"
            )
          }
        />
      ) : (
        <>
          {/* 2. شريط محطات وشرائح الدرس (Slide Progress Stepper) */}
          <div className="px-4 sm:px-6 py-2.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {slides.map((s, idx) => {
                const active = idx === currentSlideIdx;
                const cmtCount = (perSlideTeacherComments[s.id] || []).length;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setCurrentSlideIdx(idx);
                      setFocusedParagraphIdx(0);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer border ${
                      active
                        ? "bg-gradient-to-l from-cyan-500 to-indigo-600 text-white border-cyan-400 shadow-md"
                        : "bg-slate-800/80 text-slate-400 hover:text-white border-slate-700"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-950/50 flex items-center justify-center font-mono text-[11px]">
                      {idx + 1}
                    </span>
                    <span>
                      {langMode === "FR" ? s.sectionLabelFr : s.sectionLabelAr}
                    </span>
                    {cmtCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black">
                        💬 {cmtCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-mono text-cyan-300 shrink-0 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              الفقرة النشطة: {focusedParagraphIdx + 1} /{" "}
              {currentSlide.blocks.length}
            </div>
          </div>

          {/* 3. المساحة الرئيسية لعرض الفقرات والسبورة التفاعلية */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-6 studio-scroll relative min-h-[500px]">
            {/* لوحة الرسم التفاعلية والكتابة اليدوية بالقلم الرقمي أو الماوس فوق الشريحة */}
            <SlideDrawingCanvasOverlay
              slideId={currentSlide.id}
              isDrawingActive={isSlideDrawingActive}
              onToggleDrawingActive={setIsSlideDrawingActive}
              isSlideLocked={isSlideLocked}
              theme={theme === "WHITEBOARD_LIGHT" ? "light" : "dark"}
            />

            <div
              className="flex-1 max-w-6xl mx-auto w-full space-y-6"
              style={{ fontSize: `${fontScale}%` }}
            >
              {/* عنوان الشريحة الحالية مع أزرار تحكم سريعة (الشريحة السابقة / التالية) */}
              <div
                className={`p-5 rounded-3xl border shadow-xl ${
                  theme === "WHITEBOARD_LIGHT"
                    ? "bg-white border-slate-300"
                    : theme === "CHALKBOARD_GREEN"
                    ? "bg-[#0f3829] border-emerald-700/60"
                    : "bg-slate-900/90 border-indigo-500/30"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {langMode === "FR"
                      ? currentSlide.sectionLabelFr
                      : currentSlide.sectionLabelAr}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSlideIdx((prev) => Math.max(0, prev - 1));
                        setFocusedParagraphIdx(0);
                      }}
                      disabled={currentSlideIdx === 0}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>الشريحة السابقة</span>
                    </button>
                    <span className="text-xs font-mono opacity-75">
                      Frame {currentSlideIdx + 1} / {slides.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSlideIdx((prev) =>
                          Math.min(slides.length - 1, prev + 1)
                        );
                        setFocusedParagraphIdx(0);
                      }}
                      disabled={currentSlideIdx === slides.length - 1}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>الشريحة التالية</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {langMode !== "FR" && (
                  <h1 className="text-xl sm:text-3xl font-black leading-snug">
                    <MathText text={currentSlide.slideTitleAr} />
                  </h1>
                )}
                {langMode !== "AR" && (
                  <h2
                    dir="ltr"
                    className="text-lg sm:text-2xl font-bold opacity-90 mt-1 text-left font-serif"
                  >
                    <MathText text={currentSlide.slideTitleFr} />
                  </h2>
                )}
              </div>

              {/* قائمة الفقرات القابلة للتنقل والتركيز البصري (Beamer Blocks) */}
              <div className="space-y-5">
                {currentSlide.blocks.map((block, bIdx) => {
                  const isFocused = bIdx === focusedParagraphIdx;
                  const isPassed = bIdx < focusedParagraphIdx;
                  const isSolutionOpen = Boolean(revealedSolutions[block.id]);

                  return (
                    <div
                      key={block.id}
                      onClick={() => setFocusedParagraphIdx(bIdx)}
                      className={`rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 cursor-pointer ${
                        isFocused
                          ? theme === "WHITEBOARD_LIGHT"
                            ? "bg-white border-indigo-600 shadow-2xl scale-[1.01]"
                            : "bg-slate-900/95 border-cyan-400 shadow-2xl shadow-cyan-500/10 scale-[1.01]"
                          : spotlightMode
                          ? "opacity-15 blur-[1px] scale-[0.98]"
                          : isPassed
                          ? theme === "WHITEBOARD_LIGHT"
                            ? "bg-slate-100/90 border-slate-300 opacity-80"
                            : "bg-slate-900/50 border-slate-800 opacity-75"
                          : theme === "WHITEBOARD_LIGHT"
                          ? "bg-slate-100/50 border-slate-200 opacity-50"
                          : "bg-slate-900/30 border-slate-800/60 opacity-45"
                      }`}
                    >
                      {/* شارة الفقرة (Beamer Block Header) */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                              block.blockType === "THEOREM"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : block.blockType === "WARNING"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : block.blockType === "QUESTION"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                            }`}
                          >
                            {block.blockType === "THEOREM" ? (
                              <Award className="w-4 h-4" />
                            ) : block.blockType === "ACTIVITY" ? (
                              <Lightbulb className="w-4 h-4" />
                            ) : block.blockType === "QUESTION" ? (
                              <HelpCircle className="w-4 h-4" />
                            ) : (
                              <Target className="w-4 h-4" />
                            )}
                            <span>
                              {langMode === "FR" ? block.badgeFr : block.badgeAr}
                            </span>
                          </span>

                          <h3 className="text-base sm:text-xl font-black">
                            <MathText
                              text={
                                langMode === "FR" ? block.titleFr : block.titleAr
                              }
                            />
                          </h3>
                        </div>

                        {isFocused && (
                          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            Beamer Focus · الفقرة النشطة
                          </span>
                        )}
                      </div>

                      {/* محتوى الفقرة بالعربية مع دعم KaTeX */}
                      {langMode !== "FR" && (
                        <ul className="space-y-2.5 text-base sm:text-xl leading-relaxed pr-2">
                          {block.contentAr.map((line, lIdx) => (
                            <li key={lIdx} className="flex items-start gap-2.5">
                              <span className="text-cyan-400 font-black mt-1">◆</span>
                              <span className="font-medium">
                                <MathText text={line} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* محتوى الفقرة بالفرنسية مع دعم KaTeX */}
                      {langMode !== "AR" && (
                        <ul
                          dir="ltr"
                          className={`space-y-2.5 text-base sm:text-xl leading-relaxed pl-2 text-left font-serif ${
                            langMode === "BILINGUAL"
                              ? "mt-4 pt-3 border-t border-slate-700/50"
                              : ""
                          }`}
                        >
                          {block.contentFr.map((line, lIdx) => (
                            <li key={lIdx} className="flex items-start gap-2.5">
                              <span className="text-indigo-400 font-black mt-1">▸</span>
                              <span>
                                <MathText text={line} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* زر كشف الحل التدريجي للأنشطة والتمارين (\pause في Beamer) */}
                      {(block.revealSolutionAr || block.revealSolutionFr) && (
                        <div className="mt-4 pt-3 border-t border-slate-700/50">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRevealedSolutions((prev) => ({
                                ...prev,
                                [block.id]: !prev[block.id],
                              }));
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer transition"
                          >
                            {isSolutionOpen ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            <span>
                              {isSolutionOpen
                                ? "إخفاء عناصر الإجابة والبرهان (\\pause)"
                                : "إظهار عناصر الإجابة والبرهان على السبورة (\\pause)"}
                            </span>
                          </button>

                          {isSolutionOpen && (
                            <div className="mt-3 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-100 space-y-2 animate-in fade-in">
                              {langMode !== "FR" && block.revealSolutionAr && (
                                <p className="text-sm sm:text-lg font-bold leading-relaxed">
                                  ✓ <MathText text={block.revealSolutionAr} />
                                </p>
                              )}
                              {langMode !== "AR" && block.revealSolutionFr && (
                                <p
                                  dir="ltr"
                                  className="text-sm sm:text-lg font-serif leading-relaxed text-left text-emerald-200"
                                >
                                  ✓ <MathText text={block.revealSolutionFr} />
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* صندوق التعليقات النصية الخاصة بالشريحة الحالية (Per-Slide Teacher Annotations) */}
              <div
                className={`p-5 rounded-3xl border ${
                  theme === "WHITEBOARD_LIGHT"
                    ? "bg-amber-50/70 border-amber-300"
                    : "bg-slate-900/90 border-amber-500/30"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquarePlus className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-black">
                      تعليقات وملاحظات المعلم النصية على الشريحة #{currentSlideIdx + 1}
                    </h4>
                  </div>
                  {isSlideLocked ? (
                    <button
                      type="button"
                      onClick={openLockModal}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/30 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>الشريحة مقفلة رقمياً (اضغط لفك القفل بكلمة مرور الأستاذ)</span>
                    </button>
                  ) : (
                    <span className="text-xs opacity-70">
                      تدوين مباشر للملاحظات والشرح الإضافي الخاص بهذه الشريحة
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input
                    type="text"
                    readOnly={isSlideLocked}
                    value={draftSlideComment}
                    onChange={(e) => setDraftSlideComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        !isSlideLocked &&
                        e.key === "Enter" &&
                        draftSlideComment.trim()
                      ) {
                        e.preventDefault();
                        setPerSlideTeacherComments((prev) => ({
                          ...prev,
                          [currentSlide.id]: [
                            ...(prev[currentSlide.id] || []),
                            draftSlideComment.trim(),
                          ],
                        }));
                        setDraftSlideComment("");
                      }
                    }}
                    placeholder={
                      isSlideLocked
                        ? "التعليقات محمية بالقفل الرقمي..."
                        : `أضف تعليقاً نصياً أو ملاحظة منهجية على الشريحة ${
                            currentSlideIdx + 1
                          }...`
                    }
                    className="flex-1 rounded-xl bg-slate-950/90 border border-slate-700 px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 read-only:opacity-50"
                  />
                  <button
                    type="button"
                    disabled={isSlideLocked || !draftSlideComment.trim()}
                    onClick={() => {
                      if (isSlideLocked || !draftSlideComment.trim()) return;
                      setPerSlideTeacherComments((prev) => ({
                        ...prev,
                        [currentSlide.id]: [
                          ...(prev[currentSlide.id] || []),
                          draftSlideComment.trim(),
                        ],
                      }));
                      setDraftSlideComment("");
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>إضافة تعليق للشريحة</span>
                  </button>
                </div>

                {(perSlideTeacherComments[currentSlide.id] || []).length > 0 && (
                  <div className="space-y-2">
                    {(perSlideTeacherComments[currentSlide.id] || []).map(
                      (cmt, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-start justify-between gap-3 text-sm text-amber-100"
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-xs text-amber-400 font-black mt-0.5">
                              #{cIdx + 1}
                            </span>
                            <span className="leading-relaxed">
                              <MathText text={cmt} />
                            </span>
                          </div>
                          {!isSlideLocked && (
                            <button
                              type="button"
                              onClick={() =>
                                setPerSlideTeacherComments((prev) => ({
                                  ...prev,
                                  [currentSlide.id]: (
                                    prev[currentSlide.id] || []
                                  ).filter((_, idx) => idx !== cIdx),
                                }))
                              }
                              className="text-slate-400 hover:text-rose-400 cursor-pointer shrink-0"
                              title="حذف التعليق"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4. مسودة الشرح اللحظي للأستاذ (Interactive Teacher Scratchpad) */}
            {showScratchpad && (
              <div className="w-full lg:w-96 bg-slate-900 border border-slate-700 rounded-3xl p-4 flex flex-col gap-3 shadow-2xl shrink-0">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs sm:text-sm font-black text-white">
                      سبورة الشرح اللحظي والتعليقات
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScratchpadNotes("")}
                    className="text-[11px] text-slate-400 hover:text-rose-300 cursor-pointer"
                  >
                    مسح السبورة
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {[
                    "∀ x ∈ ℝ",
                    "∃! c ∈ ]a,b[",
                    "lim_{x→+∞} f(x) =",
                    "f'(x) ≥ 0",
                    "⇔",
                    "⇒",
                    "∫_a^b f(x)dx",
                    "∑_{k=0}^n u_k",
                  ].map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() =>
                        setScratchpadNotes((prev) => `${prev} ${sym} `)
                      }
                      dir="ltr"
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600 text-cyan-300 hover:text-white font-mono text-xs border border-slate-700 cursor-pointer"
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                <textarea
                  value={scratchpadNotes}
                  onChange={(e) => setScratchpadNotes(e.target.value)}
                  placeholder="اكتب خطوات البرهان الإضافية أو أمثلة عددية فورية للتلاميذ أثناء العرض..."
                  className="flex-1 min-h-[260px] bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm sm:text-base text-emerald-200 font-mono leading-relaxed focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            )}
          </div>

          {/* 6. الشريط السفلي للتنقل السريع بين الفقرات والشرائح */}
          <div className="px-4 sm:px-8 py-3 bg-slate-900/95 border-t border-slate-800 text-white flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentSlideIdx === 0 && focusedParagraphIdx === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer transition"
            >
              <ChevronRight className="w-4 h-4 text-cyan-400" />
              <span>السابق (السهم الأيمن)</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ListOrdered className="w-4 h-4 text-indigo-400" />
              <span>
                استعمل أزرار الأسهم أو مسطرة المسافة (Space) للتنقل التدريجي بين الشرائح والفقرات
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={
                currentSlideIdx === slides.length - 1 &&
                focusedParagraphIdx === currentSlide.blocks.length - 1
              }
              className="px-5 py-2 rounded-xl bg-gradient-to-l from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition"
            >
              <span>التالي (Space / السهم الأيسر)</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* 5. نافذة معاينة وتصدير كود LaTeX Beamer (.tex) */}
      {showBeamerLatexModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FileCode2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    كود المصدر الأكاديمي LaTeX Beamer (.tex)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    جاهز للترجمة المباشرة عبر Overleaf أو TeXstudio (سمة Madrid · شاشة عريضة 16:9 · أوامر \pause)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyBeamerTex}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLatex ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedLatex ? "تم النسخ!" : "نسخ كود Beamer"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBeamerTex}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل ملف .tex</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBeamerLatexModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-slate-950">
              <pre
                dir="ltr"
                className="text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap select-all p-4 rounded-2xl bg-slate-900/90 border border-slate-800"
              >
                {activeLatexBeamerSource}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 6. نافذة القفل الرقمي للشرائح بكلمة مرور الأستاذ */}
      <SlideDigitalLockModal
        isOpen={isLockModalOpen}
        isSlideLocked={isSlideLocked}
        currentSavedPassword={teacherPasswordHash}
        onClose={closeLockModal}
        onLock={handleLockWithPassword}
        onUnlock={handleUnlockWithPassword}
      />

      {/* 7. نافذة استيراد ملفات الـ PDF مباشرة من Google Drive */}
      <GoogleDrivePdfImporterModal
        isOpen={isDriveImportModalOpen}
        onClose={() => setIsDriveImportModalOpen(false)}
        defaultTargetMode={
          deckSourceMode === "PDF_SLIDESHOW" ? "PDF_SLIDESHOW" : "PDF_BEAMER"
        }
        onImportPdfBuffer={async (fileName, arrayBuffer, targetMode) => {
          await processPdfArrayBuffer(fileName, arrayBuffer, targetMode);
        }}
      />
    </div>
  );
};
