import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Languages,
  Sparkles,
  Check,
  Trash2,
  Volume2,
  AlertCircle,
  CornerDownLeft,
  Wand2,
  Compass,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  FileText,
  Command,
} from "lucide-react";

export type DictationLang = "ar-MA" | "fr-FR";

export type DictationTargetField =
  | "DOCUMENT_CURSOR"
  | "HEADER_INSTRUCTIONS"
  | "PEDAGOGICAL_NOTES"
  | "DOC_TITLE";

export interface VoiceLessonNavOption {
  index: number;
  lessonAr: string;
  lessonFr: string;
}

export interface ParsedVoiceDictationCommandResult {
  matched: boolean;
  actionType:
    | "NEXT_LESSON"
    | "PREV_LESSON"
    | "FIRST_LESSON"
    | "LAST_LESSON"
    | "SELECT_LESSON_BY_INDEX"
    | "SELECT_LESSON_BY_TITLE"
    | "INSERT_QUICK_NOTE"
    | "INSERT_HEADER_INSTRUCTION"
    | "SET_DOC_TITLE"
    | "CLEAR_DRAFT"
    | "NONE";
  lessonIndex?: number;
  extractedText?: string;
  feedbackAr: string;
  feedbackFr: string;
}

const ARABIC_ORDINALS_MAP: Array<{ pattern: RegExp; index: number }> = [
  { pattern: /(?:الدرس|درس|التمرين|تمرين)\s*(?:الأول|الاول|رقم\s*1|1)(?=\s|$|[،,.؛])/i, index: 0 },
  { pattern: /(?:الدرس|درس|التمرين|تمرين)\s*(?:الثاني|رقم\s*2|2)(?=\s|$|[،,.؛])/i, index: 1 },
  { pattern: /(?:الدرس|درس|التمرين|تمرين)\s*(?:الثالث|رقم\s*3|3)(?=\s|$|[،,.؛])/i, index: 2 },
  { pattern: /(?:الدرس|درس|التمرين|تمرين)\s*(?:الرابع|رقم\s*4|4)(?=\s|$|[،,.؛])/i, index: 3 },
  { pattern: /(?:الدرس|درس|التمرين|تمرين)\s*(?:الخامس|رقم\s*5|5)(?=\s|$|[،,.؛])/i, index: 4 },
  { pattern: /(?:الدرس|درس|التمرين|تمرين)\s*(?:السادس|رقم\s*6|6)(?=\s|$|[،,.؛])/i, index: 5 },
  { pattern: /(?:الدرس|درس|التمرين|تمرين)\s*(?:السابع|رقم\s*7|7)(?=\s|$|[،,.؛])/i, index: 6 },
  { pattern: /(?:الدرس|درس|التمرين|تمرين)\s*(?:الثامن|رقم\s*8|8)(?=\s|$|[،,.؛])/i, index: 7 },
  { pattern: /(?:الدرس|درس|التمرين|تمرين)\s*(?:التاسع|رقم\s*9|9)(?=\s|$|[،,.؛])/i, index: 8 },
  { pattern: /(?:الدرس|درس|التمرين|تمرين)\s*(?:العاشر|رقم\s*10|10)(?=\s|$|[،,.؛])/i, index: 9 },
];

const FRENCH_ORDINALS_MAP: Array<{ pattern: RegExp; index: number }> = [
  { pattern: /\b(?:leçon|cours|chapitre|exercice)\s*(?:premier|première|numéro\s*1|1)\b/i, index: 0 },
  { pattern: /\b(?:leçon|cours|chapitre|exercice)\s*(?:deuxième|second|numéro\s*2|2)\b/i, index: 1 },
  { pattern: /\b(?:leçon|cours|chapitre|exercice)\s*(?:troisième|numéro\s*3|3)\b/i, index: 2 },
  { pattern: /\b(?:leçon|cours|chapitre|exercice)\s*(?:quatrième|numéro\s*4|4)\b/i, index: 3 },
  { pattern: /\b(?:leçon|cours|chapitre|exercice)\s*(?:cinquième|numéro\s*5|5)\b/i, index: 4 },
  { pattern: /\b(?:leçon|cours|chapitre|exercice)\s*(?:sixième|numéro\s*6|6)\b/i, index: 5 },
];

/**
 * محرك تحليل الأوامر الصوتية في استوديو الإملاء الصوتي (Web Speech API)
 * يدعم التنقل بين الدروس (التالي، السابق، الأول، الأخير، بالرقم أو باسم الدرس)
 * وإدراج ملاحظات بيداغوجية سريعة أو تعليمات الترويسة أو عنوان الوثيقة مباشرة بالصوت.
 */
export function parseSpokenLessonAndNoteVoiceCommand(
  rawTranscript: string,
  lessons: VoiceLessonNavOption[] = [],
  currentLessonIndex: number = 0
): ParsedVoiceDictationCommandResult {
  const clean = (rawTranscript || "").trim();
  if (!clean) {
    return {
      matched: false,
      actionType: "NONE",
      feedbackAr: "",
      feedbackFr: "",
    };
  }

  const lower = clean.toLowerCase();

  // 1. أمر مسح المسودة الصوتية
  if (
    /^(?:امسح النص|مسح النص|إفراغ النص|effacer le texte|vider le texte)$/i.test(
      clean
    )
  ) {
    return {
      matched: true,
      actionType: "CLEAR_DRAFT",
      feedbackAr: "تم مسح مسودة الإملاء الصوتي.",
      feedbackFr: "Brouillon vocal effacé.",
    };
  }

  // 2. التنقل إلى الدرس التالي
  if (
    /(?:الدرس التالي|انتقل إلى الدرس التالي|انتقل الى الدرس التالي|الدرس الموالي|التمرين التالي|leçon suivante|cours suivant|chapitre suivant|suivant)/i.test(
      lower
    )
  ) {
    const total = Math.max(1, lessons.length);
    const nextIdx = (currentLessonIndex + 1) % total;
    const target = lessons[nextIdx];
    return {
      matched: true,
      actionType: "NEXT_LESSON",
      lessonIndex: nextIdx,
      feedbackAr: target
        ? `تم الانتقال صوتياً إلى الدرس التالي (${nextIdx + 1}/${total}): « ${target.lessonAr} »`
        : "تم الانتقال صوتياً إلى الدرس التالي.",
      feedbackFr: target
        ? `Navigation vocale vers la leçon suivante (${nextIdx + 1}/${total}) : « ${target.lessonFr} »`
        : "Navigation vocale vers la leçon suivante.",
    };
  }

  // 3. التنقل إلى الدرس السابق
  if (
    /(?:الدرس السابق|انتقل إلى الدرس السابق|انتقل الى الدرس السابق|ارجع إلى الدرس السابق|التمرين السابق|leçon précédente|cours précédent|chapitre précédent|précédent)/i.test(
      lower
    )
  ) {
    const total = Math.max(1, lessons.length);
    const prevIdx = (currentLessonIndex - 1 + total) % total;
    const target = lessons[prevIdx];
    return {
      matched: true,
      actionType: "PREV_LESSON",
      lessonIndex: prevIdx,
      feedbackAr: target
        ? `تم الرجوع صوتياً إلى الدرس السابق (${prevIdx + 1}/${total}): « ${target.lessonAr} »`
        : "تم الرجوع صوتياً إلى الدرس السابق.",
      feedbackFr: target
        ? `Navigation vocale vers la leçon précédente (${prevIdx + 1}/${total}) : « ${target.lessonFr} »`
        : "Navigation vocale vers la leçon précédente.",
    };
  }

  // 4. الدرس الأخير
  if (
    /(?:الدرس الأخير|الدرس الاخير|آخر درس|اخر درس|dernière leçon|dernier cours|dernier chapitre)/i.test(
      lower
    )
  ) {
    const lastIdx = Math.max(0, lessons.length - 1);
    const target = lessons[lastIdx];
    return {
      matched: true,
      actionType: "LAST_LESSON",
      lessonIndex: lastIdx,
      feedbackAr: target
        ? `تم الانتقال صوتياً إلى الدرس الأخير (${lastIdx + 1}): « ${target.lessonAr} »`
        : "تم الانتقال صوتياً إلى الدرس الأخير.",
      feedbackFr: target
        ? `Navigation vocale vers la dernière leçon (${lastIdx + 1}) : « ${target.lessonFr} »`
        : "Navigation vocale vers la dernière leçon.",
    };
  }

  // 5. الانتقال إلى درس محدد بالرتبة أو الرقم (الدرس الأول، الدرس الثاني...)
  for (const ord of [...ARABIC_ORDINALS_MAP, ...FRENCH_ORDINALS_MAP]) {
    if (ord.pattern.test(clean)) {
      const clampedIdx =
        lessons.length > 0
          ? Math.min(ord.index, lessons.length - 1)
          : ord.index;
      const target = lessons[clampedIdx];
      if (clampedIdx === 0 && /(?:الأول|الاول|premier|première)/i.test(clean)) {
        return {
          matched: true,
          actionType: "FIRST_LESSON",
          lessonIndex: 0,
          feedbackAr: target
            ? `تم الانتقال صوتياً إلى الدرس الأول: « ${target.lessonAr} »`
            : "تم الانتقال صوتياً إلى الدرس الأول.",
          feedbackFr: target
            ? `Navigation vocale vers la première leçon : « ${target.lessonFr} »`
            : "Navigation vocale vers la première leçon.",
        };
      }
      return {
        matched: true,
        actionType: "SELECT_LESSON_BY_INDEX",
        lessonIndex: clampedIdx,
        feedbackAr: target
          ? `تم اختيار الدرس رقم ${clampedIdx + 1} صوتياً: « ${target.lessonAr} »`
          : `تم اختيار الدرس رقم ${clampedIdx + 1} صوتياً.`,
        feedbackFr: target
          ? `Leçon N° ${clampedIdx + 1} sélectionnée par voix : « ${target.lessonFr} »`
          : `Leçon N° ${clampedIdx + 1} sélectionnée par voix.`,
      };
    }
  }

  // 6. إدراج ملاحظة سريعة بالصوت ("ملاحظة سريعة: ..." أو "أدرج ملاحظة: ..." أو "note rapide : ...")
  const quickNoteMatch = clean.match(
    /^(?:ملاحظة سريعة|أدرج ملاحظة|ادرج ملاحظة|أضف ملاحظة|اضف ملاحظة|سجل ملاحظة|ملاحظة بيداغوجية|note rapide|insérer note|ajouter note|note pédagogique)[:\s\-،,]*(.+)$/i
  );
  if (quickNoteMatch && quickNoteMatch[1]?.trim()) {
    const noteBody = convertSpokenMathAndPedagogyTerms(
      quickNoteMatch[1].trim(),
      true
    );
    return {
      matched: true,
      actionType: "INSERT_QUICK_NOTE",
      extractedText: noteBody,
      feedbackAr: `تم إدراج الملاحظة السريعة صوتياً: « ${noteBody} »`,
      feedbackFr: `Note rapide insérée par voix : « ${noteBody} »`,
    };
  }

  // 7. إدراج تعليمة ترويسة بالصوت ("تعليمة الفرض: ..." أو "ملاحظة الترويسة: ..." أو "consigne : ...")
  const headerInstrMatch = clean.match(
    /^(?:تعليمة الفرض|تعليمة سريعة|أدرج تعليمة|ادرج تعليمة|ملاحظة الترويسة|consigne rapide|insérer consigne|consigne)[:\s\-،,]*(.+)$/i
  );
  if (headerInstrMatch && headerInstrMatch[1]?.trim()) {
    const instrBody = convertSpokenMathAndPedagogyTerms(
      headerInstrMatch[1].trim(),
      true
    );
    return {
      matched: true,
      actionType: "INSERT_HEADER_INSTRUCTION",
      extractedText: instrBody,
      feedbackAr: `تم إدراج تعليمة الترويسة صوتياً: « ${instrBody} »`,
      feedbackFr: `Consigne d'en-tête insérée par voix : « ${instrBody} »`,
    };
  }

  // 8. تغيير عنوان الوثيقة بالصوت ("عنوان الوثيقة: ..." أو "titre du document : ...")
  const titleMatch = clean.match(
    /^(?:عنوان الوثيقة|غير العنوان|تغيير العنوان|titre du document|changer titre)[:\s\-،,]*(.+)$/i
  );
  if (titleMatch && titleMatch[1]?.trim()) {
    const newTitle = titleMatch[1].trim();
    return {
      matched: true,
      actionType: "SET_DOC_TITLE",
      extractedText: newTitle,
      feedbackAr: `تم تحديث عنوان الوثيقة صوتياً إلى: « ${newTitle} »`,
      feedbackFr: `Titre du document mis à jour par voix : « ${newTitle} »`,
    };
  }

  // 9. الانتقال إلى درس بالاسم أو الكلمة المفتاحية ("انتقل إلى درس الاتصال"، "افتح درس المتتاليات"، "aller au cours limites")
  const lessonByTitleTrigger = clean.match(
    /^(?:انتقل إلى درس|انتقل الى درس|افتح درس|اختر درس|درس|aller à la leçon|aller au cours|ouvrir leçon|choisir leçon)[:\s\-،,]*(.+)$/i
  );
  if (lessonByTitleTrigger && lessonByTitleTrigger[1]?.trim() && lessons.length > 0) {
    const query = lessonByTitleTrigger[1].trim().toLowerCase();
    const found = lessons.find(
      (l) =>
        l.lessonAr.toLowerCase().includes(query) ||
        l.lessonFr.toLowerCase().includes(query) ||
        query.includes(l.lessonAr.toLowerCase()) ||
        query.includes(l.lessonFr.toLowerCase())
    );
    if (found) {
      return {
        matched: true,
        actionType: "SELECT_LESSON_BY_TITLE",
        lessonIndex: found.index,
        feedbackAr: `تم الانتقال صوتياً إلى درس: « ${found.lessonAr} »`,
        feedbackFr: `Navigation vocale vers la leçon : « ${found.lessonFr} »`,
      };
    }
  }

  return {
    matched: false,
    actionType: "NONE",
    feedbackAr: "",
    feedbackFr: "",
  };
}

const SPOKEN_MATH_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string }> = [
  // Arabic spoken math & pedagogical terms
  { pattern: /زائد ما لا نهاية|زائد مالانهاية/gi, replacement: "+∞" },
  { pattern: /ناقص ما لا نهاية|ناقص مالانهاية/gi, replacement: "-∞" },
  { pattern: /ما لا نهاية|مالانهاية/gi, replacement: "∞" },
  { pattern: /جذر مربع|الجذر المربع لـ?/gi, replacement: "√" },
  { pattern: /تكامل من|رمز التكامل|تكامل/gi, replacement: "∫" },
  { pattern: /مجموع من|رمز المجموع/gi, replacement: "∑" },
  { pattern: /ينتمي إلى|ينتمي الى/gi, replacement: "∈" },
  { pattern: /لا ينتمي إلى|لا ينتمي الى/gi, replacement: "∉" },
  { pattern: /مهما يكن|لكل/gi, replacement: "∀" },
  { pattern: /يوجد على الأقل/gi, replacement: "∃" },
  { pattern: /أكبر من أو يساوي|اكبر من او يساوي/gi, replacement: "≥" },
  { pattern: /أصغر من أو يساوي|اصغر من او يساوي/gi, replacement: "≤" },
  { pattern: /يخالف|لا يساوي/gi, replacement: "≠" },
  { pattern: /يستلزم/gi, replacement: "⇒" },
  { pattern: /يكافئ/gi, replacement: "⇔" },
  { pattern: /مجموعة الأعداد الحقيقية/gi, replacement: "ℝ" },
  { pattern: /مجموعة الأعداد العقدية/gi, replacement: "ℂ" },
  { pattern: /اللوغاريتم النبيري/gi, replacement: "ln(x)" },
  { pattern: /الدالة الأسية/gi, replacement: "eˣ" },
  { pattern: /إف بريم ل إكس|مشتقة الدالة إف/gi, replacement: "f'(x)" },

  // French spoken math & pedagogical terms
  { pattern: /\bplus l'infini\b/gi, replacement: "+∞" },
  { pattern: /\bmoins l'infini\b/gi, replacement: "-∞" },
  { pattern: /\bl'infini\b/gi, replacement: "∞" },
  { pattern: /\bracine carrée de\b|\bracine carrée\b/gi, replacement: "√" },
  { pattern: /\bintégrale de\b|\bintégrale\b/gi, replacement: "∫" },
  { pattern: /\bsomme de\b/gi, replacement: "∑" },
  { pattern: /\bappartient à\b/gi, replacement: "∈" },
  { pattern: /\bn'appartient pas à\b/gi, replacement: "∉" },
  { pattern: /\bpour tout\b|\bquel que soit\b/gi, replacement: "∀" },
  { pattern: /\bil existe\b/gi, replacement: "∃" },
  { pattern: /\bsupérieur ou égal à\b/gi, replacement: "≥" },
  { pattern: /\binférieur ou égal à\b/gi, replacement: "≤" },
  { pattern: /\bdifférent de\b/gi, replacement: "≠" },
  { pattern: /\bimplique\b/gi, replacement: "⇒" },
  { pattern: /\béquivaut à\b|\bsi et seulement si\b/gi, replacement: "⇔" },
  { pattern: /\bensemble des réels\b/gi, replacement: "ℝ" },
  { pattern: /\bensemble des complexes\b/gi, replacement: "ℂ" },
  { pattern: /\blogarithme népérien de x\b|\blogarithme népérien\b/gi, replacement: "ln(x)" },
  { pattern: /\bf prime de x\b|\bdérivée de f\b/gi, replacement: "f'(x)" },
  { pattern: /\bدمج شارة نصف نقطة\b|\bdemi point\b/gi, replacement: "[0.50 pt]" },
  { pattern: /\bنقطة واحدة\b|\bun point\b/gi, replacement: "[1.00 pt]" },
];

export function convertSpokenMathAndPedagogyTerms(
  input: string,
  enableSmartMath: boolean = true
): string {
  if (!input || !enableSmartMath) return input;
  let result = input;
  for (const rule of SPOKEN_MATH_REPLACEMENTS) {
    result = result.replace(rule.pattern, rule.replacement);
  }
  return result;
}

interface WebSpeechRecognitionResultAlternative {
  transcript: string;
  confidence?: number;
}

interface WebSpeechRecognitionResultItem {
  isFinal: boolean;
  0: WebSpeechRecognitionResultAlternative;
}

interface WebSpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<WebSpeechRecognitionResultItem>;
}

interface WebSpeechRecognitionErrorEventLike {
  error?: string;
}

interface WebSpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: WebSpeechRecognitionEventLike) => void) | null;
  onerror: ((event: WebSpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type WebSpeechRecognitionCtor = new () => WebSpeechRecognitionInstance;

interface WindowWithWebSpeech extends Window {
  SpeechRecognition?: WebSpeechRecognitionCtor;
  webkitSpeechRecognition?: WebSpeechRecognitionCtor;
  webkitAudioContext?: typeof AudioContext;
}

function getSpeechRecognitionConstructor(): WebSpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as WindowWithWebSpeech;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface InlineVoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  defaultLang?: DictationLang;
  title?: string;
  compact?: boolean;
  smartMathConversion?: boolean;
  className?: string;
}

export const InlineVoiceDictationButton: React.FC<
  InlineVoiceDictationButtonProps
> = ({
  onTranscript,
  defaultLang = "ar-MA",
  title = "إملاء صوتي مباشر عبر الميكروفون (Voice-to-Text)",
  compact = false,
  smartMathConversion = true,
  className = "",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState<DictationLang>(defaultLang);
  const [interimText, setInterimText] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<WebSpeechRecognitionInstance | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    setLang(defaultLang);
  }, [defaultLang]);

  const stopAudioMeter = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const startAudioMeter = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const AudioCtx =
        window.AudioContext || (window as WindowWithWebSpeech).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 140) * 100)));
        rafRef.current = requestAnimationFrame(updateMeter);
      };
      rafRef.current = requestAnimationFrame(updateMeter);
    } catch {
      // SpeechRecognition will handle its own permission error if blocked
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    stopAudioMeter();
    setIsListening(false);
    setInterimText("");
  }, [stopAudioMeter]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const toggleListening = async () => {
    setErrorMsg(null);
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      setErrorMsg(
        lang === "fr-FR"
          ? "Navigateur non compatible avec la reconnaissance vocale Web Speech."
          : "المتصفح الحالي لا يدعم ميزة التعرف الصوتي المباشر (يرجى استخدام Chrome أو Edge)."
      );
      return;
    }

    try {
      await startAudioMeter();
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: WebSpeechRecognitionEventLike) => {
        let interim = "";
        let finalChunk = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript + " ";
          } else {
            interim += transcript;
          }
        }
        if (finalChunk.trim()) {
          const processed = convertSpokenMathAndPedagogyTerms(
            finalChunk.trim(),
            smartMathConversion
          );
          onTranscriptRef.current(processed);
        }
        setInterimText(interim);
      };

      recognition.onerror = (event: WebSpeechRecognitionErrorEventLike) => {
        const code = event?.error;
        if (code === "not-allowed" || code === "service-not-allowed") {
          setErrorMsg(
            lang === "fr-FR"
              ? "Accès au microphone refusé. Veuillez autoriser le microphone dans votre navigateur."
              : "تم رفض إذن الوصول إلى الميكروفون. يرجى السماح للمتصفح باستخدام الميكروفون."
          );
        } else if (code !== "aborted" && code !== "no-speech") {
          setErrorMsg(
            lang === "fr-FR"
              ? `Erreur microphone (${code})`
              : `تنبيه الميكروفون (${code})`
          );
        }
        stopListening();
      };

      recognition.onend = () => {
        stopAudioMeter();
        setIsListening(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setErrorMsg(
        lang === "fr-FR"
          ? "Impossible de démarrer la dictée vocale."
          : "تعذر تشغيل الإملاء الصوتي عبر الميكروفون."
      );
      stopListening();
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 relative ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        title={`${title} (${lang === "ar-MA" ? "العربية" : "Français"})`}
        className={`inline-flex items-center justify-center gap-1 rounded-lg font-black transition cursor-pointer border ${
          compact ? "px-2 py-1 text-[10.5px]" : "px-2.5 py-1.5 text-xs"
        } ${
          isListening
            ? "bg-rose-600 text-white border-rose-500 shadow-sm shadow-rose-500/40 animate-pulse"
            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200"
        }`}
      >
        {isListening ? (
          <>
            <MicOff className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === "fr-FR" ? "Arrêter" : "إيقاف الإملاء"}</span>
            <span
              className="w-1.5 h-3 rounded-full bg-white/40 overflow-hidden inline-flex items-end"
              title="مستوى الصوت المباشر"
            >
              <span
                style={{ height: `${Math.max(20, audioLevel)}%` }}
                className="w-full bg-amber-300 transition-all duration-75"
              />
            </span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
            <span>{compact ? "إملاء صوتي" : "إملاء بالميكروفون"}</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          const nextLang: DictationLang = lang === "ar-MA" ? "fr-FR" : "ar-MA";
          setLang(nextLang);
          if (isListening) {
            stopListening();
          }
        }}
        title="تبديل لغة الإملاء الصوتي (العربية / Français)"
        className="px-1.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-mono text-[10px] font-bold transition cursor-pointer"
      >
        {lang === "ar-MA" ? "AR" : "FR"}
      </button>

      {isListening && interimText && (
        <div className="absolute bottom-full mb-1.5 left-0 z-40 max-w-xs bg-slate-950 text-cyan-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-cyan-500/40 shadow-lg whitespace-nowrap truncate pointer-events-none">
          🎙️ {interimText}...
        </div>
      )}

      {errorMsg && (
        <div className="absolute bottom-full mb-1.5 left-0 z-40 max-w-xs bg-rose-950 text-rose-100 text-[10.5px] font-bold px-2.5 py-1 rounded-lg border border-rose-500/50 shadow-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export interface DocumentVoiceDictationStudioProps {
  isFr?: boolean;
  onInsertAtCursor: (text: string) => void;
  onAppendHeaderInstruction?: (text: string) => void;
  onAppendPedagogicalNote?: (text: string) => void;
  onUpdateDocTitle?: (text: string) => void;
  onEnsureInlineEditable?: () => void;
  lessons?: VoiceLessonNavOption[];
  currentLessonIndex?: number;
  onSelectLessonIndex?: (index: number) => void;
  onOpenFullVoiceCommandCenter?: () => void;
}

const QUICK_PEDAGOGICAL_VOICE_SNIPPETS = [
  {
    labelAr: "تعليمة الآلة الحاسبة (142-08)",
    labelFr: "Calculatrice non programmable",
    textAr: "يُسمح باستعمال الآلة الحاسبة العلمية غير القابلة للبرمجة طبقاً للمذكرة 142-08.",
    textFr: "L'usage de la calculatrice scientifique non programmable est autorisé.",
  },
  {
    labelAr: "تعليمة تعليل الأجوبة (0.50 ن)",
    labelFr: "Rigueur & justification",
    textAr: "يجب تعليل جميع النتائج الرياضية بدقة، ويُؤخذ تنظيم الورقة بعين الاعتبار (0.50 ن).",
    textFr: "Toute réponse doit être soigneusement justifiée ; la présentation est notée sur 0,50 pt.",
  },
  {
    labelAr: "استمرارية المسألة ومنع العقاب المزدوج",
    labelFr: "Admettre un résultat intermédiaire",
    textAr: "في حالة تعذر إثبات سؤال مرحلي، يُمكن للمترشح قبول نتيجته ومواصلة إنجاز التمرين.",
    textFr: "Le candidat peut admettre le résultat d'une question pour traiter la suite du problème.",
  },
  {
    labelAr: "ملاحظة دفتر النصوص (استثمار الفرض)",
    labelFr: "Note Cahier de textes (Remédiation)",
    textAr: "تم رصد تعثرات المتعلمين في الأسئلة الاستنتاجية N2 وبرمجة حصة دعم معيارية.",
    textFr: "Séance de correction et remédiation ciblée programmée suite à l'analyse des copies.",
  },
];

export const DocumentVoiceDictationStudio: React.FC<
  DocumentVoiceDictationStudioProps
> = ({
  isFr = false,
  onInsertAtCursor,
  onAppendHeaderInstruction,
  onAppendPedagogicalNote,
  onUpdateDocTitle,
  onEnsureInlineEditable,
  lessons = [],
  currentLessonIndex = 0,
  onSelectLessonIndex,
  onOpenFullVoiceCommandCenter,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [dictationLang, setDictationLang] = useState<DictationLang>(
    isFr ? "fr-FR" : "ar-MA"
  );
  const [targetField, setTargetField] = useState<DictationTargetField>(
    "DOCUMENT_CURSOR"
  );
  const [smartMathEnabled, setSmartMathEnabled] = useState(true);
  const [autoStreamToTarget, setAutoStreamToTarget] = useState(true);
  const [enableVoiceCommandsMode, setEnableVoiceCommandsMode] = useState(true);
  const [draftTranscript, setDraftTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [lastExecutedVoiceCmd, setLastExecutedVoiceCmd] = useState<string | null>(
    null
  );
  const [statusNote, setStatusNote] = useState<{
    type: "info" | "error" | "success";
    text: string;
  } | null>(null);

  const recognitionRef = useRef<WebSpeechRecognitionInstance | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const dispatchTextToTarget = useCallback(
    (rawText: string, overrideTarget?: DictationTargetField) => {
      const cleaned = rawText.trim();
      if (!cleaned) return;
      const effectiveTarget = overrideTarget || targetField;
      if (
        effectiveTarget === "HEADER_INSTRUCTIONS" &&
        onAppendHeaderInstruction
      ) {
        onAppendHeaderInstruction(cleaned);
      } else if (
        effectiveTarget === "PEDAGOGICAL_NOTES" &&
        onAppendPedagogicalNote
      ) {
        onAppendPedagogicalNote(cleaned);
      } else if (effectiveTarget === "DOC_TITLE" && onUpdateDocTitle) {
        onUpdateDocTitle(cleaned);
      } else {
        onEnsureInlineEditable?.();
        onInsertAtCursor(cleaned + " ");
      }
    },
    [
      targetField,
      onAppendHeaderInstruction,
      onAppendPedagogicalNote,
      onUpdateDocTitle,
      onEnsureInlineEditable,
      onInsertAtCursor,
    ]
  );

  const tryExecuteSpokenVoiceCommand = useCallback(
    (spokenChunk: string): boolean => {
      if (!enableVoiceCommandsMode) return false;
      const parsed = parseSpokenLessonAndNoteVoiceCommand(
        spokenChunk,
        lessons,
        currentLessonIndex
      );
      if (!parsed.matched) return false;

      if (
        (parsed.actionType === "NEXT_LESSON" ||
          parsed.actionType === "PREV_LESSON" ||
          parsed.actionType === "FIRST_LESSON" ||
          parsed.actionType === "LAST_LESSON" ||
          parsed.actionType === "SELECT_LESSON_BY_INDEX" ||
          parsed.actionType === "SELECT_LESSON_BY_TITLE") &&
        typeof parsed.lessonIndex === "number"
      ) {
        onSelectLessonIndex?.(parsed.lessonIndex);
      } else if (
        parsed.actionType === "INSERT_QUICK_NOTE" &&
        parsed.extractedText
      ) {
        if (onAppendPedagogicalNote) {
          onAppendPedagogicalNote(parsed.extractedText);
        } else {
          dispatchTextToTarget(parsed.extractedText, "PEDAGOGICAL_NOTES");
        }
      } else if (
        parsed.actionType === "INSERT_HEADER_INSTRUCTION" &&
        parsed.extractedText
      ) {
        if (onAppendHeaderInstruction) {
          onAppendHeaderInstruction(parsed.extractedText);
        } else {
          dispatchTextToTarget(parsed.extractedText, "HEADER_INSTRUCTIONS");
        }
      } else if (
        parsed.actionType === "SET_DOC_TITLE" &&
        parsed.extractedText
      ) {
        onUpdateDocTitle?.(parsed.extractedText);
      } else if (parsed.actionType === "CLEAR_DRAFT") {
        setDraftTranscript("");
      }

      const msg =
        dictationLang === "fr-FR" ? parsed.feedbackFr : parsed.feedbackAr;
      setLastExecutedVoiceCmd(msg);
      setStatusNote({
        type: "success",
        text: `🎙️ ${msg}`,
      });
      return true;
    },
    [
      enableVoiceCommandsMode,
      lessons,
      currentLessonIndex,
      onSelectLessonIndex,
      onAppendPedagogicalNote,
      onAppendHeaderInstruction,
      onUpdateDocTitle,
      dispatchTextToTarget,
      dictationLang,
    ]
  );

  const stopAudioAnalyzer = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const startAudioAnalyzer = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      const AudioCtx =
        window.AudioContext || (window as WindowWithWebSpeech).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      const freqData = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(freqData);
        let sum = 0;
        for (let i = 0; i < freqData.length; i++) sum += freqData[i];
        const avg = sum / freqData.length;
        setAudioLevel(Math.min(100, Math.round((avg / 135) * 100)));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      // handled by recognition.onerror
    }
  }, []);

  const stopDictation = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    stopAudioAnalyzer();
    setIsListening(false);
    setInterimTranscript("");
  }, [stopAudioAnalyzer]);

  useEffect(() => {
    return () => {
      stopDictation();
    };
  }, [stopDictation]);

  const handleToggleMicrophone = async () => {
    if (isListening) {
      stopDictation();
      setStatusNote({
        type: "info",
        text: isFr
          ? "Enregistrement vocal arrêté."
          : "تم إيقاف التسجيل الصوتي.",
      });
      return;
    }

    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (!SpeechRecognition) {
      setStatusNote({
        type: "error",
        text: isFr
          ? "La reconnaissance vocale Web Speech n'est pas prise en charge par ce navigateur (utilisez Chrome ou Edge). Vous pouvez utiliser les commandes rapides ci-dessous."
          : "ميزة التعرف الصوتي المباشر (Web Speech API) غير مدعومة في هذا المتصفح (يُنصح بـ Chrome أو Edge). يمكنك تنفيذ الأوامر الصوتية أو إدراج الملاحظات مباشرة من الأزرار أدناه.",
      });
      return;
    }

    try {
      await startAudioAnalyzer();
      const recognition = new SpeechRecognition();
      recognition.lang = dictationLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusNote({
          type: "info",
          text:
            dictationLang === "fr-FR"
              ? "🎙️ Web Speech API actif — Dites « leçon suivante », « note rapide : ... » ou dictez vos formules..."
              : "🎙️ محرك Web Speech API نشط — قل « الدرس التالي » أو « ملاحظة سريعة: ... » أو أملِ الصيغ الرياضية...",
        });
      };

      recognition.onresult = (event: WebSpeechRecognitionEventLike) => {
        let interim = "";
        let finalChunk = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += t + " ";
          } else {
            interim += t;
          }
        }

        if (finalChunk.trim()) {
          const rawTrimmed = finalChunk.trim();
          const wasCommandExecuted = tryExecuteSpokenVoiceCommand(rawTrimmed);
          if (!wasCommandExecuted) {
            const converted = convertSpokenMathAndPedagogyTerms(
              rawTrimmed,
              smartMathEnabled
            );
            setDraftTranscript((prev) =>
              prev ? `${prev} ${converted}` : converted
            );
            if (autoStreamToTarget) {
              dispatchTextToTarget(converted);
            }
          }
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event: WebSpeechRecognitionErrorEventLike) => {
        const errCode = event?.error;
        if (errCode === "not-allowed" || errCode === "service-not-allowed") {
          setStatusNote({
            type: "error",
            text: isFr
              ? "Accès au microphone refusé. Veuillez autoriser l'accès au microphone dans les paramètres du navigateur."
              : "تم حجب إذن الميكروفون. يرجى السماح للمتصفح بالوصول إلى الميكروفون أو استخدام أزرار الأوامر الصوتية الفورية أدناه.",
          });
        } else if (errCode !== "aborted" && errCode !== "no-speech") {
          setStatusNote({
            type: "error",
            text: isFr
              ? `Erreur de reconnaissance vocale : ${errCode}`
              : `تنبيه أثناء التعرف الصوتي: ${errCode}`,
          });
        }
        stopDictation();
      };

      recognition.onend = () => {
        stopAudioAnalyzer();
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setStatusNote({
        type: "error",
        text: isFr
          ? "Impossible d'initialiser le microphone."
          : "تعذر تهيئة الميكروفون للإملاء الصوتي.",
      });
      stopDictation();
    }
  };

  const currentLesson = lessons[currentLessonIndex] || lessons[0];

  return (
    <div className="rounded-xl bg-slate-950/95 border border-cyan-500/30 p-3.5 text-white space-y-3 shadow-inner">
      {/* الصف العلوي: زر الميكروفون، مؤشر الصوت، خيار تفعيل الأوامر الصوتية (Web Speech API)، واختيار حقل الإدراج */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleMicrophone}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer border whitespace-nowrap shrink-0 ${
              isListening
                ? "bg-rose-600 hover:bg-rose-700 text-white border-rose-400 shadow-md shadow-rose-600/30"
                : "bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 text-slate-950 border-cyan-300 hover:brightness-105"
            }`}
          >
            {isListening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <MicOff className="w-4 h-4 shrink-0" />
                <span>
                  {isFr ? "Arrêter Web Speech" : "إيقاف الإملاء والأوامر الصوتية"}
                </span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 shrink-0" />
                <span>
                  {isFr
                    ? "Activer Web Speech API (Mic & Commandes)"
                    : "تفعيل Web Speech API (إملاء وأوامر صوتية)"}
                </span>
              </>
            )}
          </button>

          {/* مقياس مستوى الصوت المباشر (Live Audio Waveform Meter) */}
          {isListening && (
            <div
              className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-rose-500/40"
              title="مؤشر تردد الصوت المباشر من الميكروفون"
            >
              <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <div className="flex items-end gap-0.5 h-3.5">
                {[0.4, 0.7, 1.0, 0.85, 0.55, 0.9, 0.6].map((factor, idx) => {
                  const barHeight = Math.max(
                    22,
                    Math.min(100, Math.round(audioLevel * factor))
                  );
                  return (
                    <span
                      key={idx}
                      style={{ height: `${barHeight}%` }}
                      className="w-1 rounded-full bg-gradient-to-t from-rose-500 via-amber-400 to-emerald-300 transition-all duration-75"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* اختيار لغة الإملاء الصوتي */}
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-[11px] font-bold">
            <Languages className="w-3.5 h-3.5 text-cyan-400 mx-1 shrink-0" />
            <button
              type="button"
              onClick={() => {
                setDictationLang("ar-MA");
                if (isListening) stopDictation();
              }}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                dictationLang === "ar-MA"
                  ? "bg-cyan-400 text-slate-950 font-black"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              العربية (AR)
            </button>
            <button
              type="button"
              onClick={() => {
                setDictationLang("fr-FR");
                if (isListening) stopDictation();
              }}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                dictationLang === "fr-FR"
                  ? "bg-cyan-400 text-slate-950 font-black"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Français (FR)
            </button>
          </div>

          {onOpenFullVoiceCommandCenter && (
            <button
              type="button"
              onClick={onOpenFullVoiceCommandCenter}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/90 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/40 text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
              title="فتح مركز الأوامر الصوتية الشامل (18 أمراً صوتياً للتنقل وإدراج الأشكال والصيغ)"
            >
              <Command className="w-3.5 h-3.5 text-indigo-400" />
              <span>مركز الأوامر الصوتية الشامل</span>
            </button>
          )}
        </div>

        {/* وجهة الإدراج المباشر وخيارات Web Speech API */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <label
            className="flex items-center gap-1.5 cursor-pointer text-cyan-300 font-bold bg-slate-900/90 px-2.5 py-1 rounded-lg border border-cyan-500/30"
            title="تمكين الأوامر الصوتية عبر Web Speech API للتنقل بين الدروس ('الدرس التالي'، 'الدرس السابق'، 'الدرس الأول') وإدراج ملاحظات سريعة ('ملاحظة سريعة: ...')"
          >
            <input
              type="checkbox"
              checked={enableVoiceCommandsMode}
              onChange={(e) => setEnableVoiceCommandsMode(e.target.checked)}
              className="rounded accent-cyan-400 w-3.5 h-3.5"
            />
            <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              {isFr
                ? "Commandes vocales (Navigation & Notes)"
                : "أوامر التنقل بين الدروس والملاحظات الصوتية"}
            </span>
          </label>

          <label className="flex items-center gap-1.5 text-slate-300 font-bold">
            <span>{isFr ? "Cible :" : "الوجهة:"}</span>
            <select
              value={targetField}
              onChange={(e) =>
                setTargetField(e.target.value as DictationTargetField)
              }
              className="bg-slate-900 text-cyan-200 border border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-cyan-400"
            >
              <option value="DOCUMENT_CURSOR">
                {isFr
                  ? "Curseur dans la feuille A4"
                  : "موضع المؤشر داخل ورقة A4"}
              </option>
              <option value="HEADER_INSTRUCTIONS">
                {isFr
                  ? "Consignes d'en-tête de l'épreuve"
                  : "تعليمات وملاحظة ترويسة الفرض"}
              </option>
              <option value="PEDAGOGICAL_NOTES">
                {isFr
                  ? "Notes didactiques & pédagogiques"
                  : "التوجيهات والملاحظات البيداغوجية"}
              </option>
              <option value="DOC_TITLE">
                {isFr
                  ? "Titre principal du document"
                  : "العنوان الرئيسي للوثيقة"}
              </option>
            </select>
          </label>

          <label
            className="flex items-center gap-1.5 cursor-pointer text-amber-300 font-bold bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800"
            title="تحويل العبارات الرياضية المنطوقة مثل 'تكامل' أو 'جذر مربع' تلقائياً إلى رموز رياضية (∫, √, ∀, ∈, ∞)"
          >
            <input
              type="checkbox"
              checked={smartMathEnabled}
              onChange={(e) => setSmartMathEnabled(e.target.checked)}
              className="rounded accent-amber-400 w-3.5 h-3.5"
            />
            <Wand2 className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{isFr ? "Symboles Math Auto" : "تحويل الرموز (∫ √ ∞)"}</span>
          </label>

          <label
            className="flex items-center gap-1.5 cursor-pointer text-emerald-300 font-bold bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800"
            title="إدراج الجمل المسجلة فوراً في الوثيقة بمجرد نطقها"
          >
            <input
              type="checkbox"
              checked={autoStreamToTarget}
              onChange={(e) => setAutoStreamToTarget(e.target.checked)}
              className="rounded accent-emerald-400 w-3.5 h-3.5"
            />
            <span>{isFr ? "Insertion directe" : "إدراج فوري"}</span>
          </label>
        </div>
      </div>

      {/* شريط التنقل الصوتي بين الدروس والأوامر الصوتية المباشرة (Web Speech Lesson Navigation & Quick Note Bar) */}
      {enableVoiceCommandsMode && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-cyan-300 font-black flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isFr
                  ? "Navigation vocale des leçons :"
                  : "التنقل الصوتي بين الدروس:"}
              </span>
            </span>

            {lessons.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    tryExecuteSpokenVoiceCommand(
                      dictationLang === "fr-FR"
                        ? "leçon précédente"
                        : "الدرس السابق"
                    )
                  }
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  title='أمر صوتي: قل "الدرس السابق" أو "leçon précédente"'
                >
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isFr ? "Précédent" : "الدرس السابق"}</span>
                </button>

                <select
                  value={currentLessonIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    onSelectLessonIndex?.(idx);
                    const target = lessons[idx];
                    if (target) {
                      setStatusNote({
                        type: "success",
                        text: isFr
                          ? `Leçon active : « ${target.lessonFr} »`
                          : `تم الانتقال إلى الدرس (${idx + 1}/${lessons.length}): « ${target.lessonAr} »`,
                      });
                    }
                  }}
                  className="bg-slate-950 text-amber-300 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-black max-w-[260px] truncate"
                >
                  {lessons.map((l, idx) => (
                    <option key={l.index ?? idx} value={idx}>
                      {idx + 1}. {isFr ? l.lessonFr : l.lessonAr}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    tryExecuteSpokenVoiceCommand(
                      dictationLang === "fr-FR"
                        ? "leçon suivante"
                        : "الدرس التالي"
                    )
                  }
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  title='أمر صوتي: قل "الدرس التالي" أو "leçon suivante"'
                >
                  <span>{isFr ? "Suivant" : "الدرس التالي"}</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </>
            ) : (
              <span className="text-slate-400">
                {isFr
                  ? "Dites « leçon suivante » ou « leçon numéro 1 »"
                  : 'قل "الدرس التالي" أو "الدرس الأول" أو "الدرس الثاني"'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
            <span className="text-slate-400 font-semibold">
              {isFr ? "Exemples vocaux :" : "أوامر صوتية مدعومة:"}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-300 border border-slate-800 font-mono">
              &quot;{isFr ? "leçon suivante" : "الدرس التالي"}&quot;
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 font-mono">
              &quot;{isFr ? "note rapide : ..." : "ملاحظة سريعة: ..."}&quot;
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 font-mono">
              &quot;{isFr ? "consigne : ..." : "تعليمة الفرض: ..."}&quot;
            </span>
          </div>
        </div>
      )}

      {/* حقل النص المفرغ بالصوت أو الأمر الصوتي مع إمكانية التعديل والتنفيذ الفوري */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={
              interimTranscript
                ? `${draftTranscript} ${interimTranscript}`.trim()
                : draftTranscript
            }
            onChange={(e) => setDraftTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draftTranscript.trim()) {
                e.preventDefault();
                if (!tryExecuteSpokenVoiceCommand(draftTranscript)) {
                  dispatchTextToTarget(draftTranscript);
                  setStatusNote({
                    type: "success",
                    text: isFr
                      ? "Texte inséré dans le document !"
                      : "تم إدراج النص في الوثيقة بنجاح!",
                  });
                }
              }
            }}
            placeholder={
              dictationLang === "fr-FR"
                ? "Parlez (ex: « leçon suivante », « note rapide : vérifier la continuité », ou dictez une formule)..."
                : "تحدث في الميكروفون (مثال: « الدرس التالي »، « ملاحظة سريعة: التركيز على الاتصال والاشتقاق »، أو أملِ نصاً رياضياً)..."
            }
            className="w-full bg-slate-900/95 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {enableVoiceCommandsMode && (
            <button
              type="button"
              disabled={!draftTranscript.trim()}
              onClick={() => {
                const handled = tryExecuteSpokenVoiceCommand(draftTranscript);
                if (!handled) {
                  dispatchTextToTarget(
                    draftTranscript,
                    "PEDAGOGICAL_NOTES"
                  );
                  setStatusNote({
                    type: "success",
                    text: isFr
                      ? "Inséré comme note pédagogique rapide !"
                      : "تم إدراج النص كملاحظة بيداغوجية سريعة!",
                  });
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
              title="تنفيذ النص كأمر صوتي (تنقل بين الدروس) أو إدراجه كملاحظة بيداغوجية سريعة"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>{isFr ? "Exécuter / Note" : "تنفيذ أمر / ملاحظة سريعة"}</span>
            </button>
          )}

          <button
            type="button"
            disabled={!draftTranscript.trim()}
            onClick={() => {
              if (!tryExecuteSpokenVoiceCommand(draftTranscript)) {
                dispatchTextToTarget(draftTranscript);
                setStatusNote({
                  type: "success",
                  text: isFr
                    ? "Texte dicté inséré dans le document avec succès !"
                    : "تم إدراج النص المسجل صوتياً في الوثيقة بنجاح!",
                });
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <CornerDownLeft className="w-3.5 h-3.5 shrink-0" />
            <span>{isFr ? "Insérer" : "إدراج في الوثيقة"}</span>
          </button>

          {draftTranscript && (
            <button
              type="button"
              onClick={() => setDraftTranscript("")}
              title={isFr ? "Effacer le texte" : "مسح النص المؤقت"}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* قوالب صوتية/تربوية سريعة الإدراج بضغطة واحدة */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/90 text-[10.5px]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{isFr ? "Notes & consignes rapides :" : "ملاحظات وتعليمات سريعة:"}</span>
          </span>
          {QUICK_PEDAGOGICAL_VOICE_SNIPPETS.map((snip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const txt = dictationLang === "fr-FR" ? snip.textFr : snip.textAr;
                setDraftTranscript((prev) => (prev ? `${prev} ${txt}` : txt));
                dispatchTextToTarget(txt);
                setStatusNote({
                  type: "success",
                  text: isFr
                    ? `Note rapide insérée : ${snip.labelFr}`
                    : `تم إدراج الملاحظة السريعة: ${snip.labelAr}`,
                });
              }}
              className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-cyan-200 border border-slate-700/80 font-semibold transition cursor-pointer"
            >
              + {dictationLang === "fr-FR" ? snip.labelFr : snip.labelAr}
            </button>
          ))}
        </div>

        {(statusNote || lastExecutedVoiceCmd) && (
          <div
            className={`flex items-center gap-1 font-bold ${
              statusNote?.type === "error"
                ? "text-rose-400"
                : statusNote?.type === "success"
                ? "text-emerald-400"
                : "text-cyan-300"
            }`}
          >
            {statusNote?.type === "success" ? (
              <Check className="w-3 h-3 shrink-0" />
            ) : (
              <AlertCircle className="w-3 h-3 shrink-0" />
            )}
            <span>
              {statusNote?.text ||
                (currentLesson
                  ? `الدرس النشط: ${currentLesson.lessonAr}`
                  : "")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
