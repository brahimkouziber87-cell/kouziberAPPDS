import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Compass,
  Navigation,
  PlusCircle,
  CheckCircle2,
  Clock,
  X,
  Command,
  Languages,
  Play,
  FileText,
  Printer,
  Maximize2,
  HelpCircle,
  Wand2,
} from "lucide-react";
import {
  DocLanguage,
  ExamModel,
  InsertedFigure,
  ModuleType,
  DMSubType,
} from "../data/curriculum";
import { generateGeoGebraTemplateSvgDataUrl } from "./GeoGebraTemplatesLibraryModal";

export interface VoiceCommandActionCallbacks {
  onSelectModule: (mod: ModuleType) => void;
  onSelectDMSubType: (sub: DMSubType) => void;
  onChangeFicheLevel: (level: "FULL_WITH_PROOFS" | "SYNTHETIC_OFFICIAL") => void;
  onChangeDocLang: (lang: DocLanguage) => void;
  onChangeExamModel: (model: ExamModel) => void;
  onToggleSolutions: (val?: boolean) => void;
  onToggleWorkspace: (val?: boolean) => void;
  onOpenWeeklyTimetable: () => void;
  onOpenLessonPresentation: () => void;
  onOpenGeoGebraLibrary: () => void;
  onOpenOcrScanner: () => void;
  onOpenExportDashboard: () => void;
  onInsertMathSnippet: (latexSnippet: string, labelAr: string) => void;
  onInsertFigureToExam: (figure: InsertedFigure) => void;
  onAppendDictatedQuestionToExercise: (
    exerciseIdx: number,
    questionTextAr: string,
    questionTextFr: string
  ) => void;
  onTriggerExportPDF: () => void;
  onNavigateLesson?: (
    directionOrIndex: "NEXT" | "PREV" | "FIRST" | "LAST" | number
  ) => string;
  onInsertQuickPedagogicalNote?: (noteText: string) => void;
  onInsertQuickHeaderInstruction?: (instrText: string) => void;
  activeLessonTitleAr?: string;
  totalLessonsCount?: number;
  onNotify?: (type: "success" | "error" | "info", msg: string) => void;
}

export interface VoiceCommandDefinition {
  id: string;
  category: "NAVIGATION" | "INSERT_MATH" | "INSERT_FIGURE" | "DOCUMENT_CTRL";
  titleAr: string;
  voiceTriggersAr: string[];
  voiceTriggersFr: string[];
  descriptionAr: string;
  badgeText: string;
  execute: (callbacks: VoiceCommandActionCallbacks) => string;
}

export interface ExecutedVoiceCommandLog {
  id: string;
  transcript: string;
  matchedTitleAr: string;
  resultMessage: string;
  timestamp: string;
}

export const VOICE_COMMANDS_CATALOG: VoiceCommandDefinition[] = [
  // 1. أوامر التنقل بين الوحدات والتبويبات
  {
    id: "nav_ds_142_08",
    category: "NAVIGATION",
    titleAr: "الانتقال إلى وحدة الفروض المحروسة (142-08)",
    voiceTriggersAr: ["الفروض المحروسة", "فرض محروس", "افتح الفروض"],
    voiceTriggersFr: ["devoir surveillé", "ouvrir devoir surveillé", "examen"],
    descriptionAr: "تفعيل وحدة إنتاج الفروض المحروسة وسلم التنقيط الرسمي",
    badgeText: "تبويب: الفروض المحروسة",
    execute: (cb) => {
      cb.onSelectModule("DS_142_08");
      return "تم الانتقال صوتياً إلى وحدة الفروض المحروسة (المذكرة 142-08).";
    },
  },
  {
    id: "nav_dm_homework",
    category: "NAVIGATION",
    titleAr: "الانتقال إلى الفروض المنزلية (Devoir Maison)",
    voiceTriggersAr: ["الفروض المنزلية", "فرض منزلي", "افتح فرض منزلي"],
    voiceTriggersFr: ["devoir maison", "ouvrir devoir maison"],
    descriptionAr: "فتح محرر الفروض المنزلية المستقلة",
    badgeText: "تبويب: الفروض المنزلية",
    execute: (cb) => {
      cb.onSelectModule("DM_SERIE");
      cb.onSelectDMSubType("DEVOIR_MAISON");
      return "تم الانتقال صوتياً إلى وحدة الفروض المنزلية.";
    },
  },
  {
    id: "nav_serie_td",
    category: "NAVIGATION",
    titleAr: "الانتقال إلى سلاسل التمارين والدعم (Séries TD)",
    voiceTriggersAr: ["سلاسل التمارين", "سلسلة تمارين", "تمارين الدعم"],
    voiceTriggersFr: ["série d'exercices", "travaux dirigés", "série td"],
    descriptionAr: "فتح وحدة سلاسل التمارين المصنفة حسب مستويات الصعوبة",
    badgeText: "تبويب: السلاسل",
    execute: (cb) => {
      cb.onSelectModule("DM_SERIE");
      cb.onSelectDMSubType("SERIE_TD");
      return "تم الانتقال صوتياً إلى وحدة سلاسل التمارين.";
    },
  },
  {
    id: "nav_fiche_op2007",
    category: "NAVIGATION",
    titleAr: "الانتقال إلى الجذاذات التربوية (OP 2007)",
    voiceTriggersAr: ["الجذاذات", "جذاذة تربوية", "جذاذة الدرس"],
    voiceTriggersFr: ["fiche pédagogique", "ouvrir fiche"],
    descriptionAr: "فتح السيناريو الديداكتيكي الكامل للجذاذة مع الأنشطة والبراهين",
    badgeText: "تبويب: الجذاذات",
    execute: (cb) => {
      cb.onSelectModule("FICHE_OP2007");
      cb.onChangeFicheLevel("FULL_WITH_PROOFS");
      return "تم فتح وحدة الجذاذات التربوية المفصلة (OP 2007).";
    },
  },
  {
    id: "nav_resume_cours",
    category: "NAVIGATION",
    titleAr: "الانتقال إلى ملخصات الدروس الرسمية",
    voiceTriggersAr: ["ملخصات الدروس", "ملخص الدرس", "ملخص رسمي"],
    voiceTriggersFr: ["résumé de cours", "fiche mémo"],
    descriptionAr: "فتح الملخص المركز للتعاريف والخاصيات والمبرهنات",
    badgeText: "تبويب: ملخص الدرس",
    execute: (cb) => {
      cb.onSelectModule("FICHE_OP2007");
      cb.onChangeFicheLevel("SYNTHETIC_OFFICIAL");
      return "تم الانتقال صوتياً إلى وحدة ملخصات الدروس.";
    },
  },
  {
    id: "nav_repartition",
    category: "NAVIGATION",
    titleAr: "الانتقال إلى التوزيع السنوي (Progression Annuelle)",
    voiceTriggersAr: ["التوزيع السنوي", "توزيع الدروس", "التخطيط السنوي"],
    voiceTriggersFr: ["progression annuelle", "répartition"],
    descriptionAr: "عرض جدول التوزيع السنوي للأسابيع التربوية ومحطات الفروض",
    badgeText: "تبويب: التوزيع السنوي",
    execute: (cb) => {
      cb.onSelectModule("REPARTITION_CERTIF");
      return "تم الانتقال صوتياً إلى التوزيع السنوي.";
    },
  },
  {
    id: "nav_diagnostic",
    category: "NAVIGATION",
    titleAr: "الانتقال إلى التقويم التشخيصي (Diagnostic)",
    voiceTriggersAr: ["التشخيص", "الرائز التشخيصي", "تقويم تشخيصي"],
    voiceTriggersFr: ["diagnostic", "test diagnostique"],
    descriptionAr: "فتح رائز تشخيص المكتسبات القبلية وشبكة التفريغ",
    badgeText: "تبويب: التشخيص",
    execute: (cb) => {
      cb.onSelectModule("DIAGNOSTIC");
      return "تم الانتقال صوتياً إلى وحدة الروائز التشخيصية.";
    },
  },
  {
    id: "nav_weekly_timetable",
    category: "NAVIGATION",
    titleAr: "فتح جدول الحصص الأسبوعي للأستاذ (PDF)",
    voiceTriggersAr: ["جدول الحصص", "استعمال الزمن", "جدول الاسبوع"],
    voiceTriggersFr: ["emploi du temps", "horaire hebdomadaire"],
    descriptionAr: "فتح نافذة إنشاء جدول الحصص الأسبوعي وتصديره بصيغة PDF",
    badgeText: "نافذة: جدول الحصص",
    execute: (cb) => {
      cb.onOpenWeeklyTimetable();
      return "تم فتح جدول الحصص الأسبوعي للأستاذ.";
    },
  },
  {
    id: "nav_lesson_presentation",
    category: "NAVIGATION",
    titleAr: "تشغيل العرض التقديمي التفاعلي للدرس (ملء الشاشة)",
    voiceTriggersAr: ["العرض التفاعلي", "عرض الدرس", "وضع المسلاط", "ملء الشاشة"],
    voiceTriggersFr: ["mode présentation", "plein écran", "beamer"],
    descriptionAr: "تشغيل وضع المسلاط للتنقل بين فقرات الدرس في ملء الشاشة",
    badgeText: "نافذة: مسلاط القسم",
    execute: (cb) => {
      cb.onOpenLessonPresentation();
      return "تم تشغيل العرض التقديمي التفاعلي للدرس في وضع ملء الشاشة.";
    },
  },
  {
    id: "nav_geogebra_library",
    category: "NAVIGATION",
    titleAr: "فتح مكتبة قوالب GeoGebra التفاعلية",
    voiceTriggersAr: ["مكتبة جيوجبرا", "مكتبة الأشكال", "قوالب هندسية"],
    voiceTriggersFr: ["bibliothèque geogebra", "figures géométriques"],
    descriptionAr: "فتح لوحة إدارة قوالب GeoGebra وإدراج الأشكال مع معاينة مصغرة",
    badgeText: "نافذة: مكتبة GeoGebra",
    execute: (cb) => {
      cb.onOpenGeoGebraLibrary();
      return "تم فتح مكتبة قوالب GeoGebra التفاعلية.";
    },
  },
  {
    id: "nav_ocr_scanner",
    category: "NAVIGATION",
    titleAr: "فتح المسح الضوئي الذكي (OCR) ومطابقة المنهاج",
    voiceTriggersAr: ["المسح الضوئي", "مسح فرض", "تحويل صورة الى نص"],
    voiceTriggersFr: ["scanner ocr", "numériser examen"],
    descriptionAr: "فتح أداة مسح الفروض وتحويلها إلى منهاج JSON",
    badgeText: "نافذة: المسح الضوئي OCR",
    execute: (cb) => {
      cb.onOpenOcrScanner();
      return "تم فتح استوديو المسح الضوئي الذكي (OCR).";
    },
  },
  {
    id: "nav_next_lesson",
    category: "NAVIGATION",
    titleAr: "الانتقال إلى الدرس التالي في المسلك (Web Speech API)",
    voiceTriggersAr: ["الدرس التالي", "انتقل إلى الدرس التالي", "الدرس الموالي"],
    voiceTriggersFr: ["leçon suivante", "cours suivant", "chapitre suivant"],
    descriptionAr: "التنقل الصوتي المباشر إلى الدرس الموالي في برنامج المسلك الدراسي النشط",
    badgeText: "تنقل: الدرس التالي",
    execute: (cb) => {
      const msg = cb.onNavigateLesson?.("NEXT");
      return msg || "تم الانتقال صوتياً إلى الدرس التالي في المسلك.";
    },
  },
  {
    id: "nav_prev_lesson",
    category: "NAVIGATION",
    titleAr: "الرجوع إلى الدرس السابق في المسلك (Web Speech API)",
    voiceTriggersAr: ["الدرس السابق", "انتقل إلى الدرس السابق", "ارجع للدرس السابق"],
    voiceTriggersFr: ["leçon précédente", "cours précédent", "chapitre précédent"],
    descriptionAr: "الرجوع الصوتي المباشر إلى الدرس السابق في برنامج المسلك الدراسي النشط",
    badgeText: "تنقل: الدرس السابق",
    execute: (cb) => {
      const msg = cb.onNavigateLesson?.("PREV");
      return msg || "تم الرجوع صوتياً إلى الدرس السابق في المسلك.";
    },
  },
  {
    id: "nav_first_lesson",
    category: "NAVIGATION",
    titleAr: "الانتقال إلى الدرس الأول في المسلك",
    voiceTriggersAr: ["الدرس الأول", "الدرس الاول", "أول درس"],
    voiceTriggersFr: ["première leçon", "premier cours"],
    descriptionAr: "الانتقال الصوتي الفوري إلى أول درس في لائحة دروس المسلك",
    badgeText: "تنقل: الدرس الأول",
    execute: (cb) => {
      const msg = cb.onNavigateLesson?.("FIRST");
      return msg || "تم الانتقال صوتياً إلى الدرس الأول في المسلك.";
    },
  },
  {
    id: "ins_quick_note_14208",
    category: "DOCUMENT_CTRL",
    titleAr: "إدراج ملاحظة بيداغوجية سريعة في الوثيقة (المذكرة 142-08)",
    voiceTriggersAr: ["ملاحظة سريعة", "أدرج ملاحظة", "ملاحظة بيداغوجية"],
    voiceTriggersFr: ["note rapide", "insérer note", "note pédagogique"],
    descriptionAr: "إدراج ملاحظة تربوية وتوجيهية سريعة في حقل الملاحظات البيداغوجية وترويسة الفرض",
    badgeText: "إدراج: ملاحظة سريعة",
    execute: (cb) => {
      const note =
        "يُراعى التدرج الديداكتيكي للأسئلة (N1 → N2 → N3) وتفكيك الأسئلة المركبة ومنع العقاب المزدوج طبقاً للمذكرة 142-08.";
      cb.onInsertQuickPedagogicalNote?.(note);
      return `تم إدراج الملاحظة البيداغوجية السريعة: « ${note} »`;
    },
  },

  // 2. أوامر إدراج الرموز والعناصر الرياضية بالصوت
  {
    id: "ins_math_limit",
    category: "INSERT_MATH",
    titleAr: "إدراج نهاية دالة عددية (Limite)",
    voiceTriggersAr: ["أدرج نهاية", "احسب النهاية", "نهاية دالة"],
    voiceTriggersFr: ["insérer limite", "calculer la limite"],
    descriptionAr: "يدرج صيغة النهاية \\lim_{x \\to +\\infty} f(x) في التمرين النشط",
    badgeText: "إدراج: lim f(x)",
    execute: (cb) => {
      const snippet = "\\lim_{x \\to +\\infty} f(x) = +\\infty";
      cb.onInsertMathSnippet(snippet, "نهاية دالة عددية");
      return "تم إدراج صيغة النهاية الرياضية في المحرر.";
    },
  },
  {
    id: "ins_math_integral",
    category: "INSERT_MATH",
    titleAr: "إدراج تكامل ومكاملة بالأجزاء (Intégrale)",
    voiceTriggersAr: ["أدرج تكامل", "حساب التكامل", "تكامل دالة"],
    voiceTriggersFr: ["insérer intégrale", "calcul intégral"],
    descriptionAr: "يدرج صيغة التكامل المحدد \\int_{a}^{b} f(x)\\,dx",
    badgeText: "إدراج: ∫ f(x)dx",
    execute: (cb) => {
      const snippet = "I = \\int_{1}^{e} x^2 \\ln(x)\\,dx";
      cb.onInsertMathSnippet(snippet, "تكامل محدد");
      return "تم إدراج عبارة التكامل المحدد في المحرر.";
    },
  },
  {
    id: "ins_math_sequence",
    category: "INSERT_MATH",
    titleAr: "إدراج متتالية عددية ترجعية (Suite Récurrente)",
    voiceTriggersAr: ["أدرج متتالية", "متتالية عددية", "الاستدلال بالترجع"],
    voiceTriggersFr: ["insérer suite", "suite numérique", "récurrence"],
    descriptionAr: "يدرج تعريف متتالية ترجعية (u_n) مع سؤال البرهان بالترجع",
    badgeText: "إدراج: (u_n)",
    execute: (cb) => {
      const snippet =
        "(\\forall n \\in \\mathbb{N}) \\quad u_{n+1} = \\frac{2u_n + 3}{u_n + 4} \\quad ; \\quad u_0 = 1";
      cb.onInsertMathSnippet(snippet, "متتالية عددية ترجعية");
      return "تم إدراج صيغة المتتالية الترجعية في التمرين.";
    },
  },
  {
    id: "ins_math_complex",
    category: "INSERT_MATH",
    titleAr: "إدراج معادلة في مجموعة الأعداد العقدية ℂ",
    voiceTriggersAr: ["أدرج عدد عقدي", "الأعداد العقدية", "الشكل المثلثي"],
    voiceTriggersFr: ["insérer complexe", "nombres complexes"],
    descriptionAr: "يدرج صيغة عدد عقدي ومعادلة من الدرجة الثانية في ℂ",
    badgeText: "إدراج: z ∈ ℂ",
    execute: (cb) => {
      const snippet =
        "z \\in \\mathbb{C} \\quad ; \\quad z^2 - 2\\sqrt{3}z + 4 = 0 \\quad ; \\quad z = 2e^{i\\frac{\\pi}{6}}";
      cb.onInsertMathSnippet(snippet, "الأعداد العقدية");
      return "تم إدراج صيغة الأعداد العقدية في التمرين.";
    },
  },

  // 3. أوامر إدراج الأشكال الهندسية مباشرة بالصوت
  {
    id: "ins_fig_sphere_3d",
    category: "INSERT_FIGURE",
    titleAr: "إدراج شكل هندسي: تقاطع فلكة ومستوى في الفضاء 3D",
    voiceTriggersAr: ["أدرج شكل فلكة", "أدرج فلكة ومستوى", "شكل هندسة فضائية"],
    voiceTriggersFr: ["insérer sphère", "figure géométrie espace"],
    descriptionAr: "ينشئ ويدرج شكل تقاطع فلكة ومستوى 3D مباشرة في التمرين الأول",
    badgeText: "شكل: فلكة 3D",
    execute: (cb) => {
      const svgUrl = generateGeoGebraTemplateSvgDataUrl("SPHERE_PLANE_3D", {
        showGrid: true,
        colorScheme: "ACADEMIC_BLUE",
      });
      cb.onInsertFigureToExam({
        id: `voice_fig_sphere_${Date.now()}`,
        exerciseId: "ex_0",
        titleAr: "تقاطع فلكة (S) ومستوى (P) في الفضاء 3D",
        titleFr: "Intersection Sphère (S) et Plan (P) en 3D",
        dataUrl: svgUrl,
        widthPercent: 60,
        alignment: "center",
        caption: "الشكل: تقاطع الفلكة (S) والمستوى (P) وفق الدائرة (Γ)",
        showCaption: true,
        borderStyle: "academic",
        qrUrl: "https://www.geogebra.org/m/r8k9vxpc",
      });
      return "تم إدراج شكل تقاطع الفلكة والمستوى (3D) مباشرة في التمرين الأول!";
    },
  },
  {
    id: "ins_fig_curve_asymptote",
    category: "INSERT_FIGURE",
    titleAr: "إدراج شكل مبياني: المنحنى (Cf) والمقارب المائل (Δ)",
    voiceTriggersAr: ["أدرج منحنى", "أدرج مبيان دالة", "منحنى ومقارب"],
    voiceTriggersFr: ["insérer courbe", "courbe asymptote"],
    descriptionAr: "يدرج مبيان الدالة (Cf) مع المستقيم المقارب المائل في التمرين الأول",
    badgeText: "شكل: منحنى (Cf)",
    execute: (cb) => {
      const svgUrl = generateGeoGebraTemplateSvgDataUrl(
        "FUNCTION_TANGENT_ASYMPTOTE",
        {
          showGrid: true,
          colorScheme: "ACADEMIC_BLUE",
        }
      );
      cb.onInsertFigureToExam({
        id: `voice_fig_curve_${Date.now()}`,
        exerciseId: "ex_0",
        titleAr: "المنحنى الممثل للدالة (Cf) والمقارب المائل (Δ)",
        titleFr: "Courbe représentative (Cf) et asymptote oblique (Δ)",
        dataUrl: svgUrl,
        widthPercent: 60,
        alignment: "center",
        caption: "الشكل: المنحنى (Cf) والمستقيم المقارب المائل (Δ) في معلم متعامد ممنظم",
        showCaption: true,
        borderStyle: "academic",
      });
      return "تم إدراج المنحنى المبياني (Cf) والمقارب المائل في التمرين الأول!";
    },
  },
  {
    id: "ins_fig_trigo_circle",
    category: "INSERT_FIGURE",
    titleAr: "إدراج شكل الدائرة المثلثية (Cercle Trigonométrique)",
    voiceTriggersAr: ["أدرج دائرة مثلثية", "الدائرة المثلثية"],
    voiceTriggersFr: ["insérer cercle trigonométrique", "cercle trigo"],
    descriptionAr: "يدرج شكل الدائرة المثلثية الموجهة مباشرة في التمرين",
    badgeText: "شكل: دائرة مثلثية",
    execute: (cb) => {
      const svgUrl = generateGeoGebraTemplateSvgDataUrl("TRIGO_UNIT_CIRCLE", {
        showGrid: true,
        colorScheme: "ACADEMIC_BLUE",
      });
      cb.onInsertFigureToExam({
        id: `voice_fig_trigo_${Date.now()}`,
        exerciseId: "ex_0",
        titleAr: "الدائرة المثلثية والأفاصيل المنحنية",
        titleFr: "Cercle Trigonométrique Orienté",
        dataUrl: svgUrl,
        widthPercent: 60,
        alignment: "center",
        caption: "الشكل: الدائرة المثلثية الموجهة وتمثيل الحلول على [-π, π]",
        showCaption: true,
        borderStyle: "academic",
      });
      return "تم إدراج شكل الدائرة المثلثية مباشرة في التمرين!";
    },
  },

  // 4. أوامر التحكم في لغة الوثيقة، النماذج، الحلول، والتصدير
  {
    id: "ctrl_lang_fr",
    category: "DOCUMENT_CTRL",
    titleAr: "تحويل لغة الوثيقة إلى المسلك الدولي (Français BIOF)",
    voiceTriggersAr: ["اللغة الفرنسية", "خيار فرنسية", "مسلك دولي"],
    voiceTriggersFr: ["langue française", "mode français", "biof"],
    descriptionAr: "تبديل لغة تحرير الوثيقة إلى الفرنسية للمسالك الدولية",
    badgeText: "لغة: Français",
    execute: (cb) => {
      cb.onChangeDocLang("FR");
      return "تم تحويل لغة الوثيقة إلى الفرنسية (BIOF).";
    },
  },
  {
    id: "ctrl_lang_bilingual",
    category: "DOCUMENT_CTRL",
    titleAr: "تفعيل العرض المزدوج (عربي / فرنسي جنباً إلى جنب)",
    voiceTriggersAr: ["ثنائي اللغة", "مزدوج اللغة", "عربي فرنسي"],
    voiceTriggersFr: ["mode bilingue", "arabe français"],
    descriptionAr: "عرض الوثيقة باللغتين العربية والفرنسية في آن واحد",
    badgeText: "لغة: مزدوج AR/FR",
    execute: (cb) => {
      cb.onChangeDocLang("BILINGUAL");
      return "تم تفعيل الوضع المزدوج اللغوي (عربي / فرنسي).";
    },
  },
  {
    id: "ctrl_show_solutions",
    category: "DOCUMENT_CTRL",
    titleAr: "إظهار عناصر الإجابة وسلم التنقيط المفصل",
    voiceTriggersAr: ["إظهار الحلول", "أظهر التصحيح", "عناصر الإجابة"],
    voiceTriggersFr: ["afficher le corrigé", "afficher solutions"],
    descriptionAr: "تضمين عناصر الإجابة وسلم التنقيط التفصيلي في الوثيقة",
    badgeText: "خيار: إظهار الحلول",
    execute: (cb) => {
      cb.onToggleSolutions(true);
      return "تم تفعيل إظهار عناصر الإجابة وسلم التنقيط المفصل.";
    },
  },
  {
    id: "ctrl_model_both",
    category: "DOCUMENT_CTRL",
    titleAr: "توليد النموذجين المتكافئين (A و B) لمنع الغش",
    voiceTriggersAr: ["النموذجين معا", "نموذج أ وب", "منع الغش"],
    voiceTriggersFr: ["modèle a et b", "deux modèles"],
    descriptionAr: "تفعيل النموذجين A و B في نفس الوثيقة",
    badgeText: "نموذج: A + B",
    execute: (cb) => {
      cb.onChangeExamModel("BOTH");
      return "تم تفعيل النموذجين المتكافئين (A + B) في الوثيقة.";
    },
  },
  {
    id: "ctrl_export_pdf",
    category: "DOCUMENT_CTRL",
    titleAr: "تصدير الوثيقة الحالية بصيغة PDF فوراً",
    voiceTriggersAr: ["تصدير بي دي اف", "حمل الوثيقة", "طباعة الوثيقة"],
    voiceTriggersFr: ["exporter pdf", "télécharger pdf", "imprimer"],
    descriptionAr: "إطلاق عملية توليد وتصدير الوثيقة بصيغة PDF عالية الدقة",
    badgeText: "أمر: تصدير PDF",
    execute: (cb) => {
      cb.onTriggerExportPDF();
      return "تم إطلاق أمر تصدير الوثيقة بصيغة PDF.";
    },
  },
];

interface VoiceCommandStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListeningGlobal: boolean;
  onToggleListeningGlobal: () => void;
  callbacks: VoiceCommandActionCallbacks;
}

export const VoiceCommandStudioModal: React.FC<VoiceCommandStudioModalProps> = ({
  isOpen,
  onClose,
  isListeningGlobal,
  onToggleListeningGlobal,
  callbacks,
}) => {
  const [recognitionLang, setRecognitionLang] = useState<"ar-MA" | "fr-FR">(
    "ar-MA"
  );
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [manualCommandInput, setManualCommandInput] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<
    "ALL" | "NAVIGATION" | "INSERT_MATH" | "INSERT_FIGURE" | "DOCUMENT_CTRL"
  >("ALL");
  const [dictatedQuestionInput, setDictatedQuestionInput] =
    useState<string>("");
  const [targetExerciseIdx, setTargetExerciseIdx] = useState<number>(0);
  const [commandLogs, setCommandLogs] = useState<ExecutedVoiceCommandLog[]>([]);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  interface ModalSpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: {
      resultIndex: number;
      results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
    }) => void) | null;
    onerror: (() => void) | null;
    start: () => void;
    stop: () => void;
  }
  const recognitionRef = useRef<ModalSpeechRecognition | null>(null);
  const callbacksRef = useRef<VoiceCommandActionCallbacks>(callbacks);
  callbacksRef.current = callbacks;
  const targetExerciseIdxRef = useRef<number>(targetExerciseIdx);
  targetExerciseIdxRef.current = targetExerciseIdx;

  const processSpokenTranscript = useCallback(
    (rawText: string) => {
      const clean = rawText.trim().toLowerCase();
      if (!clean) return;

      const currentCallbacks = callbacksRef.current;
      const currentIdx = targetExerciseIdxRef.current;

      // 1. فحص ما إذا كان الأمر يبدأ بـ "أدرج سؤال" أو "سؤال جديد" للإملاء المباشر
      if (
        clean.startsWith("أدرج سؤال") ||
        clean.startsWith("اضف سؤال") ||
        clean.startsWith("سؤال جديد")
      ) {
        const questionBody = rawText
          .replace(/^(أدرج سؤال|اضف سؤال|سؤال جديد)[:\s]*/i, "")
          .trim();
        const finalQ =
          questionBody ||
          "بين أن الدالة f متصلة وقابلة للاشتقاق على المجال المدروس ثم ضع جدول تغيراتها.";
        currentCallbacks.onAppendDictatedQuestionToExercise(
          currentIdx,
          finalQ,
          `Montrer que la fonction f est continue et dérivable sur l'intervalle étudié : ${finalQ}`
        );
        const msg = `تم إملاء وإدراج السؤال الجديد في التمرين ${
          currentIdx + 1
        }: « ${finalQ} »`;
        currentCallbacks.onNotify?.("success", msg);
        setCommandLogs((prev) => [
          {
            id: `log_${Date.now()}`,
            transcript: rawText,
            matchedTitleAr: "إملاء سؤال رياضي مباشر بالصوت",
            resultMessage: msg,
            timestamp: new Date().toLocaleTimeString("ar-MA"),
          },
          ...prev.slice(0, 9),
        ]);
        return;
      }

      // 1-ب. فحص ما إذا كان الأمر يبدأ بـ "ملاحظة سريعة:" أو "أدرج ملاحظة:" لإدراج ملاحظة مخصصة بالصوت
      const quickNoteMatch = rawText.match(
        /^(?:ملاحظة سريعة|أدرج ملاحظة|ادرج ملاحظة|أضف ملاحظة|ملاحظة بيداغوجية|note rapide|insérer note)[:\s\-،,]*(.+)$/i
      );
      if (quickNoteMatch && quickNoteMatch[1]?.trim()) {
        const noteText = quickNoteMatch[1].trim();
        currentCallbacks.onInsertQuickPedagogicalNote?.(noteText);
        const msg = `تم إدراج الملاحظة السريعة صوتياً: « ${noteText} »`;
        currentCallbacks.onNotify?.("success", `🎙️ ${msg}`);
        setCommandLogs((prev) => [
          {
            id: `log_${Date.now()}`,
            transcript: rawText,
            matchedTitleAr: "إدراج ملاحظة بيداغوجية سريعة بالصوت",
            resultMessage: msg,
            timestamp: new Date().toLocaleTimeString("ar-MA"),
          },
          ...prev.slice(0, 9),
        ]);
        return;
      }

      // 1-ج. فحص ما إذا كان الأمر يبدأ بـ "تعليمة الفرض:" أو "ملاحظة الترويسة:"
      const headerNoteMatch = rawText.match(
        /^(?:تعليمة الفرض|تعليمة سريعة|ملاحظة الترويسة|consigne rapide|consigne)[:\s\-،,]*(.+)$/i
      );
      if (headerNoteMatch && headerNoteMatch[1]?.trim()) {
        const instrText = headerNoteMatch[1].trim();
        currentCallbacks.onInsertQuickHeaderInstruction?.(instrText);
        const msg = `تم إدراج تعليمة الترويسة صوتياً: « ${instrText} »`;
        currentCallbacks.onNotify?.("success", `🎙️ ${msg}`);
        setCommandLogs((prev) => [
          {
            id: `log_${Date.now()}`,
            transcript: rawText,
            matchedTitleAr: "إدراج تعليمة ترويسة سريعة بالصوت",
            resultMessage: msg,
            timestamp: new Date().toLocaleTimeString("ar-MA"),
          },
          ...prev.slice(0, 9),
        ]);
        return;
      }

      // 2. مطابقة الأمر الصوتي مع كتالوج الأوامر الذكي
      const matchedCmd = VOICE_COMMANDS_CATALOG.find((cmd) => {
        const allTriggers = [...cmd.voiceTriggersAr, ...cmd.voiceTriggersFr];
        return allTriggers.some(
          (trig) =>
            clean.includes(trig.toLowerCase()) ||
            trig.toLowerCase().includes(clean)
        );
      });

      if (matchedCmd) {
        const resultMsg = matchedCmd.execute(currentCallbacks);
        currentCallbacks.onNotify?.("success", `🎙️ أمر صوتي منفذ: ${resultMsg}`);
        setCommandLogs((prev) => [
          {
            id: `log_${Date.now()}`,
            transcript: rawText,
            matchedTitleAr: matchedCmd.titleAr,
            resultMessage: resultMsg,
            timestamp: new Date().toLocaleTimeString("ar-MA"),
          },
          ...prev.slice(0, 9),
        ]);
      } else {
        currentCallbacks.onNotify?.(
          "info",
          `تم التقاط العبارة الصوتية: "${rawText}". جرب قول: "افتح الفروض المحروسة" أو "أدرج شكل فلكة" أو "جدول الحصص".`
        );
      }
    },
    []
  );

  // إعداد محرك التعرف الصوتي للمتصفح (Web Speech API)
  useEffect(() => {
    const speechWindow = window as Window & {
      SpeechRecognition?: new () => ModalSpeechRecognition;
      webkitSpeechRecognition?: new () => ModalSpeechRecognition;
    };
    const SpeechRecognitionAPI =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = recognitionLang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const tr = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += tr;
        } else {
          interim += tr;
        }
      }

      if (interim) {
        setLiveTranscript(interim);
      }
      if (finalTranscript) {
        setLiveTranscript(finalTranscript);
        processSpokenTranscript(finalTranscript);
      }
    };

    recognition.onerror = () => {
      // في حال حظر الميكروفون داخل iframe، تظل المحاكاة الفورية والأزرار الصوتية متاحة
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [recognitionLang, processSpokenTranscript]);

  useEffect(() => {
    if (!recognitionRef.current) return;
    try {
      if (isListeningGlobal) {
        recognitionRef.current.lang = recognitionLang;
        recognitionRef.current.start();
      } else {
        recognitionRef.current.stop();
      }
    } catch {
      // ignore already started error
    }
  }, [isListeningGlobal, recognitionLang]);

  const filteredCommands = useMemo(() => {
    if (selectedCategory === "ALL") return VOICE_COMMANDS_CATALOG;
    return VOICE_COMMANDS_CATALOG.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  if (!isOpen) return null;

  const handleTriggerCommandDirectly = (cmd: VoiceCommandDefinition) => {
    const sampleTrigger =
      recognitionLang === "fr-FR"
        ? cmd.voiceTriggersFr[0]
        : cmd.voiceTriggersAr[0];
    setLiveTranscript(sampleTrigger);
    const resultMsg = cmd.execute(callbacks);
    callbacks.onNotify?.("success", `🎙️ ${resultMsg}`);
    setCommandLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        transcript: sampleTrigger,
        matchedTitleAr: cmd.titleAr,
        resultMessage: resultMsg,
        timestamp: new Date().toLocaleTimeString("ar-MA"),
      },
      ...prev.slice(0, 9),
    ]);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* 1. رأس نافذة التحكم الصوتي والوصول الشامل */}
        <div className="px-5 py-4 bg-gradient-to-l from-rose-950/80 via-slate-900 to-indigo-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner transition ${
                isListeningGlobal
                  ? "bg-rose-500/25 border-rose-400 text-rose-300 animate-pulse"
                  : "bg-indigo-500/20 border-indigo-400/40 text-indigo-300"
              }`}
            >
              {isListeningGlobal ? (
                <Mic className="w-6 h-6 text-rose-400" />
              ) : (
                <Command className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  مركز الأوامر الصوتية الذكية والإملاء الرياضي (Voice Command & Accessibility)
                </h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  AR / FR Speech Control
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تنقل بين وحدات التطبيق، أدرج الصيغ الرياضية وأشكال GeoGebra الهندسية، أو أملِ أسئلة التمارين بالصوت مباشرة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* اختيار لغة التعرف الصوتي */}
            <button
              type="button"
              onClick={() =>
                setRecognitionLang((l) => (l === "ar-MA" ? "fr-FR" : "ar-MA"))
              }
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Languages className="w-4 h-4" />
              <span>
                {recognitionLang === "ar-MA"
                  ? "اللغة: العربية (ar-MA)"
                  : "Langue : Français (fr-FR)"}
              </span>
            </button>

            {/* زر تشغيل / إيقاف الميكروفون الحي */}
            <button
              type="button"
              onClick={onToggleListeningGlobal}
              className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition shadow-lg ${
                isListeningGlobal
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                  : "bg-gradient-to-l from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white"
              }`}
            >
              {isListeningGlobal ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>إيقاف الاستماع الصوتي</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>تفعيل الميكروفون والأوامر الصوتية</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. جسم النافذة القابل للتمرير */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5 studio-scroll">
          {/* شريط الالتقاط الصوتي المباشر والمحاكاة السريعة */}
          <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isListeningGlobal
                      ? "bg-rose-500 animate-ping"
                      : "bg-emerald-400"
                  }`}
                />
                <span className="text-xs font-black text-white">
                  {isListeningGlobal
                    ? "جاري الاستماع لأوامرك الصوتية... انطق الأمر بوضوح:"
                    : "محلل الأوامر الصوتية والوصول السريع جاهز:"}
                </span>
              </div>
              {!speechSupported && (
                <span className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-700/50 px-2.5 py-0.5 rounded-lg">
                  يدعم المتصفح الحالي التنفيذ الفوري للأوامر بالنقر أو الإدخال المباشر
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={manualCommandInput || liveTranscript}
                  onChange={(e) => setManualCommandInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualCommandInput.trim()) {
                      processSpokenTranscript(manualCommandInput);
                      setManualCommandInput("");
                    }
                  }}
                  placeholder='انطق أو اكتب أمراً صوتياً مثل: "افتح الفروض المحروسة" أو "أدرج شكل فلكة" أو "جدول الحصص"...'
                  className="w-full bg-transparent text-xs sm:text-sm text-cyan-200 placeholder-slate-500 focus:outline-none font-bold"
                />
                {liveTranscript && (
                  <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                    تم الالتقاط ✓
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const textToRun = manualCommandInput.trim() || liveTranscript;
                  if (textToRun) {
                    processSpokenTranscript(textToRun);
                    setManualCommandInput("");
                  }
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>تنفيذ الأمر فوراً</span>
              </button>
            </div>
          </div>

          {/* قسم الإملاء الصوتي المباشر لأسئلة التمارين */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                <span>
                  الإملاء الصوتي المباشر لإدراج سؤال جديد داخل التمرين (Voice Dictation to Exercise)
                </span>
              </h3>
              <select
                value={targetExerciseIdx}
                onChange={(e) => setTargetExerciseIdx(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-xs text-white font-bold"
              >
                <option value={0}>إدراج في التمرين الأول (Exercice 1)</option>
                <option value={1}>إدراج في التمرين الثاني (Exercice 2)</option>
                <option value={2}>إدراج في التمرين الثالث (Exercice 3)</option>
                <option value={3}>إدراج في التمرين الرابع (Exercice 4)</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={dictatedQuestionInput}
                onChange={(e) => setDictatedQuestionInput(e.target.value)}
                placeholder="قل 'أدرج سؤال...' أو اكتب نص السؤال الرياضي لإضافته فوراً إلى التمرين المحدد..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => {
                  const q =
                    dictatedQuestionInput.trim() ||
                    "بين أن المستقيم (Δ) مقارب مائل للمنحنى (Cf) بجوار +∞ ثم ادرس الوضع النسبي.";
                  processSpokenTranscript(`أدرج سؤال ${q}`);
                  setDictatedQuestionInput("");
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>إدراج السؤال في التمرين {targetExerciseIdx + 1}</span>
              </button>
            </div>
          </div>

          {/* تصفية كتالوج الأوامر الصوتية المدعومة */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    {
                      id: "ALL",
                      label: `جميع الأوامر الصوتية (${VOICE_COMMANDS_CATALOG.length})`,
                    },
                    { id: "NAVIGATION", label: "التنقل بين الوحدات والنوافذ" },
                    { id: "INSERT_MATH", label: "إدراج الصيغ الرياضية بالصوت" },
                    { id: "INSERT_FIGURE", label: "إدراج أشكال GeoGebra بالصوت" },
                    { id: "DOCUMENT_CTRL", label: "ضبط اللغة والحلول والتصدير" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedCategory === tab.id
                        ? "bg-indigo-600 text-white font-black shadow"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* شبكة بطاقات الأوامر الصوتية القابلة للتشغيل الفوري بالصوت أو النقر */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCommands.map((cmd) => (
                <div
                  key={cmd.id}
                  onClick={() => handleTriggerCommandDirectly(cmd)}
                  className="bg-slate-950/90 hover:bg-indigo-950/40 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 cursor-pointer transition group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                        {cmd.badgeText}
                      </span>
                      <Volume2 className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                    </div>
                    <h4 className="text-xs font-black text-white mb-1">
                      {cmd.titleAr}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {cmd.descriptionAr}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {cmd.voiceTriggersAr.map((trig, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-emerald-300 border border-slate-700 font-bold"
                        >
                          🎙️ &quot;{trig}&quot;
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1" dir="ltr">
                      {cmd.voiceTriggersFr.map((trig, i) => (
                        <span
                          key={i}
                          className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-indigo-300 border border-slate-800"
                        >
                          &quot;{trig}&quot;
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* سجل الأوامر الصوتية المنفذة خلال الجلسة */}
          {commandLogs.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <h4 className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>سجل الأوامر الصوتية المنفذة ({commandLogs.length})</span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto studio-scroll">
                {commandLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded">
                        &quot;{log.transcript}&quot;
                      </span>
                      <span className="text-slate-300 font-bold">
                        ← {log.resultMessage}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
