import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  Download,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Building2,
  User,
  Award,
  RotateCcw,
  FileDown,
  Layers,
  MapPin,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

export type DayId = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export type TimeSlotId =
  | "M1_0830_0930"
  | "M2_0930_1030"
  | "M3_1030_1130"
  | "M4_1130_1230"
  | "A1_1430_1530"
  | "A2_1530_1630"
  | "A3_1630_1730"
  | "A4_1730_1830";

export type SessionPedagogicalType =
  | "COURS"
  | "TD_EXERCICES"
  | "DEVOIR_SURVEILLE"
  | "SOUTIEN"
  | "COORDINATION";

export interface TimetableSessionCell {
  day: DayId;
  slot: TimeSlotId;
  classLabel: string;
  trackCode: string;
  room: string;
  sessionType: SessionPedagogicalType;
  topicNote?: string;
}

interface WeeklyTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  profName: string;
  schoolName: string;
  academyName: string;
  directionName: string;
  academicYear: string;
  currentTrackCode: string;
  isMission?: boolean;
  onNotify?: (type: "success" | "error" | "info", text: string) => void;
}

const DAYS_LIST: Array<{ id: DayId; labelAr: string; labelFr: string }> = [
  { id: "MON", labelAr: "الاثنين", labelFr: "Lundi" },
  { id: "TUE", labelAr: "الثلاثاء", labelFr: "Mardi" },
  { id: "WED", labelAr: "الأربعاء", labelFr: "Mercredi" },
  { id: "THU", labelAr: "الخميس", labelFr: "Jeudi" },
  { id: "FRI", labelAr: "الجمعة", labelFr: "Vendredi" },
  { id: "SAT", labelAr: "السبت", labelFr: "Samedi" },
];

const TIME_SLOTS: Array<{
  id: TimeSlotId;
  label: string;
  period: "MORNING" | "AFTERNOON";
}> = [
  { id: "M1_0830_0930", label: "08:00 - 09:00", period: "MORNING" },
  { id: "M2_0930_1030", label: "09:00 - 10:00", period: "MORNING" },
  { id: "M3_1030_1130", label: "10:00 - 11:00", period: "MORNING" },
  { id: "M4_1130_1230", label: "11:00 - 12:00", period: "MORNING" },
  { id: "A1_1430_1530", label: "14:00 - 15:00", period: "AFTERNOON" },
  { id: "A2_1530_1630", label: "15:00 - 16:00", period: "AFTERNOON" },
  { id: "A3_1630_1730", label: "16:00 - 17:00", period: "AFTERNOON" },
  { id: "A4_1730_1830", label: "17:00 - 18:00", period: "AFTERNOON" },
];

const SESSION_TYPE_META: Record<
  SessionPedagogicalType,
  {
    labelAr: string;
    labelFr: string;
    badgeBg: string;
    printBg: string;
    printBorder: string;
    printText: string;
  }
> = {
  COURS: {
    labelAr: "درس رسمي (Cours)",
    labelFr: "Cours Magistral",
    badgeBg: "bg-indigo-500/20 text-indigo-200 border-indigo-500/40",
    printBg: "#eef2ff",
    printBorder: "#6366f1",
    printText: "#1e1b4b",
  },
  TD_EXERCICES: {
    labelAr: "تمارين وتطبيقات (TD)",
    labelFr: "Travaux Dirigés",
    badgeBg: "bg-cyan-500/20 text-cyan-200 border-cyan-500/40",
    printBg: "#ecfeff",
    printBorder: "#06b6d4",
    printText: "#083344",
  },
  DEVOIR_SURVEILLE: {
    labelAr: "فرض محروس (DS)",
    labelFr: "Devoir Surveillé",
    badgeBg: "bg-rose-500/20 text-rose-200 border-rose-500/40",
    printBg: "#fff1f2",
    printBorder: "#f43f5e",
    printText: "#4c0519",
  },
  SOUTIEN: {
    labelAr: "دعم ومعالجة (Soutien)",
    labelFr: "Soutien Pédagogique",
    badgeBg: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
    printBg: "#ecfdf5",
    printBorder: "#10b981",
    printText: "#064e3b",
  },
  COORDINATION: {
    labelAr: "تنسيق / مختبر التخصص",
    labelFr: "Coordination",
    badgeBg: "bg-amber-500/20 text-amber-200 border-amber-500/40",
    printBg: "#fffbeb",
    printBorder: "#f59e0b",
    printText: "#451a03",
  },
};

const STORAGE_KEY_TIMETABLE = "math_pedagogy_weekly_timetable_v1";

const DEFAULT_21H_PRESET: TimetableSessionCell[] = [
  // الاثنين (4 ساعات صباحاً)
  {
    day: "MON",
    slot: "M1_0830_0930",
    classLabel: "2BAC PC 1",
    trackCode: "2BAC_PC",
    room: "قاعة 12",
    sessionType: "COURS",
    topicNote: "الاتصال والاشتقاق",
  },
  {
    day: "MON",
    slot: "M2_0930_1030",
    classLabel: "2BAC PC 1",
    trackCode: "2BAC_PC",
    room: "قاعة 12",
    sessionType: "TD_EXERCICES",
    topicNote: "تطبيقات مبرهنة القيم الوسيطية",
  },
  {
    day: "MON",
    slot: "M3_1030_1130",
    classLabel: "1BAC SX 2",
    trackCode: "1BAC_SX",
    room: "قاعة 08",
    sessionType: "COURS",
    topicNote: "المنطق الرياضي",
  },
  {
    day: "MON",
    slot: "M4_1130_1230",
    classLabel: "1BAC SX 2",
    trackCode: "1BAC_SX",
    room: "قاعة 08",
    sessionType: "TD_EXERCICES",
    topicNote: "الاستدلال بالترجع",
  },
  // الثلاثاء (4 ساعات زوالاً)
  {
    day: "TUE",
    slot: "A1_1430_1530",
    classLabel: "TCS 3",
    trackCode: "TC_SCI",
    room: "قاعة 04",
    sessionType: "COURS",
    topicNote: "المجموعات والحسابيات في IN",
  },
  {
    day: "TUE",
    slot: "A2_1530_1630",
    classLabel: "TCS 3",
    trackCode: "TC_SCI",
    room: "قاعة 04",
    sessionType: "TD_EXERCICES",
  },
  {
    day: "TUE",
    slot: "A3_1630_1730",
    classLabel: "2BAC PC 2",
    trackCode: "2BAC_PC",
    room: "قاعة 14",
    sessionType: "COURS",
    topicNote: "المتتاليات العددية",
  },
  {
    day: "TUE",
    slot: "A4_1730_1830",
    classLabel: "2BAC PC 2",
    trackCode: "2BAC_PC",
    room: "قاعة 14",
    sessionType: "TD_EXERCICES",
  },
  // الأربعاء (4 ساعات صباحاً)
  {
    day: "WED",
    slot: "M1_0830_0930",
    classLabel: "2BAC PC 1",
    trackCode: "2BAC_PC",
    room: "قاعة 12",
    sessionType: "COURS",
  },
  {
    day: "WED",
    slot: "M2_0930_1030",
    classLabel: "2BAC PC 1",
    trackCode: "2BAC_PC",
    room: "قاعة 12",
    sessionType: "TD_EXERCICES",
  },
  {
    day: "WED",
    slot: "M3_1030_1130",
    classLabel: "TCS 3",
    trackCode: "TC_SCI",
    room: "قاعة 04",
    sessionType: "COURS",
  },
  {
    day: "WED",
    slot: "M4_1130_1230",
    classLabel: "TCS 3",
    trackCode: "TC_SCI",
    room: "قاعة 04",
    sessionType: "SOUTIEN",
    topicNote: "معالجة تعثرات الحساب الحرفي",
  },
  // الخميس (4 ساعات صباحاً)
  {
    day: "THU",
    slot: "M1_0830_0930",
    classLabel: "1BAC SX 2",
    trackCode: "1BAC_SX",
    room: "قاعة 08",
    sessionType: "COURS",
  },
  {
    day: "THU",
    slot: "M2_0930_1030",
    classLabel: "1BAC SX 2",
    trackCode: "1BAC_SX",
    room: "قاعة 08",
    sessionType: "TD_EXERCICES",
  },
  {
    day: "THU",
    slot: "M3_1030_1130",
    classLabel: "2BAC PC 2",
    trackCode: "2BAC_PC",
    room: "قاعة 14",
    sessionType: "COURS",
  },
  {
    day: "THU",
    slot: "M4_1130_1230",
    classLabel: "2BAC PC 2",
    trackCode: "2BAC_PC",
    room: "قاعة 14",
    sessionType: "TD_EXERCICES",
  },
  // الجمعة (3 ساعات صباحاً)
  {
    day: "FRI",
    slot: "M1_0830_0930",
    classLabel: "2BAC PC 1",
    trackCode: "2BAC_PC",
    room: "قاعة 12",
    sessionType: "SOUTIEN",
    topicNote: "تحضير الفرض المحروس رقم 1",
  },
  {
    day: "FRI",
    slot: "M2_0930_1030",
    classLabel: "1BAC SX 2",
    trackCode: "1BAC_SX",
    room: "قاعة 08",
    sessionType: "COURS",
  },
  {
    day: "FRI",
    slot: "M3_1030_1130",
    classLabel: "TCS 3",
    trackCode: "TC_SCI",
    room: "قاعة 04",
    sessionType: "COURS",
  },
  // السبت (ساعتان صباحاً = 21 ساعة قانونية)
  {
    day: "SAT",
    slot: "M1_0830_0930",
    classLabel: "2BAC PC 2",
    trackCode: "2BAC_PC",
    room: "قاعة 14",
    sessionType: "DEVOIR_SURVEILLE",
    topicNote: "فرض محروس (ساعتان)",
  },
  {
    day: "SAT",
    slot: "M2_0930_1030",
    classLabel: "2BAC PC 2",
    trackCode: "2BAC_PC",
    room: "قاعة 14",
    sessionType: "DEVOIR_SURVEILLE",
    topicNote: "تتمة الفرض المحروس",
  },
];

export const WeeklyTimetableModal: React.FC<WeeklyTimetableModalProps> = ({
  isOpen,
  onClose,
  profName,
  schoolName,
  academyName,
  directionName,
  academicYear,
  currentTrackCode,
  onNotify,
}) => {
  const [sessions, setSessions] = useState<TimetableSessionCell[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TIMETABLE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage error
    }
    return DEFAULT_21H_PRESET;
  });

  const [pprNumber, setPprNumber] = useState<string>("1489205");
  const [teacherGrade, setTeacherGrade] = useState<string>(
    "أستاذ التعليم الثانوي التأهيلي - الدرجة الممتازة"
  );
  const [selectedCell, setSelectedCell] = useState<{
    day: DayId;
    slot: TimeSlotId;
  } | null>(null);

  // محرر الخلية النشطة
  const [editClassLabel, setEditClassLabel] = useState<string>("2BAC PC 1");
  const [editRoom, setEditRoom] = useState<string>("قاعة 12");
  const [editSessionType, setEditSessionType] =
    useState<SessionPedagogicalType>("COURS");
  const [editTopicNote, setEditTopicNote] = useState<string>("");
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TIMETABLE, JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  const sessionMap = useMemo(() => {
    const map = new Map<string, TimetableSessionCell>();
    sessions.forEach((s) => {
      map.set(`${s.day}_${s.slot}`, s);
    });
    return map;
  }, [sessions]);

  // إحصائيات تدبير الزمن التربوي للأستاذ
  const stats = useMemo(() => {
    const totalHours = sessions.length;
    const morningHours = sessions.filter((s) => s.slot.startsWith("M")).length;
    const afternoonHours = sessions.filter((s) => s.slot.startsWith("A")).length;

    const classesMap: Record<string, number> = {};
    sessions.forEach((s) => {
      classesMap[s.classLabel] = (classesMap[s.classLabel] || 0) + 1;
    });

    // حساب أنصاف الأيام الفارغة للتحضير والتصحيح (من أصل 12 نصف يوم)
    let freeHalfDays = 0;
    DAYS_LIST.forEach((d) => {
      const hasMorning = sessions.some(
        (s) => s.day === d.id && s.slot.startsWith("M")
      );
      const hasAfternoon = sessions.some(
        (s) => s.day === d.id && s.slot.startsWith("A")
      );
      if (!hasMorning) freeHalfDays++;
      if (!hasAfternoon) freeHalfDays++;
    });

    return {
      totalHours,
      morningHours,
      afternoonHours,
      classesList: Object.entries(classesMap),
      freeHalfDays,
      statutoryLimit: 21,
    };
  }, [sessions]);

  if (!isOpen) return null;

  const handleOpenCellEditor = (day: DayId, slot: TimeSlotId) => {
    setSelectedCell({ day, slot });
    const existing = sessionMap.get(`${day}_${slot}`);
    if (existing) {
      setEditClassLabel(existing.classLabel);
      setEditRoom(existing.room);
      setEditSessionType(existing.sessionType);
      setEditTopicNote(existing.topicNote || "");
    } else {
      setEditClassLabel(currentTrackCode.replace("_", " ") + " 1");
      setEditRoom("قاعة 12");
      setEditSessionType("COURS");
      setEditTopicNote("");
    }
  };

  const handleSaveCell = () => {
    if (!selectedCell) return;
    if (!editClassLabel.trim()) return;

    const newCell: TimetableSessionCell = {
      day: selectedCell.day,
      slot: selectedCell.slot,
      classLabel: editClassLabel.trim(),
      trackCode: currentTrackCode,
      room: editRoom.trim() || "قاعة الرياضيات",
      sessionType: editSessionType,
      topicNote: editTopicNote.trim() || undefined,
    };

    setSessions((prev) => {
      const filtered = prev.filter(
        (s) => !(s.day === selectedCell.day && s.slot === selectedCell.slot)
      );
      return [...filtered, newCell];
    });
    setSelectedCell(null);
  };

  const handleDeleteCell = (day: DayId, slot: TimeSlotId) => {
    setSessions((prev) =>
      prev.filter((s) => !(s.day === day && s.slot === slot))
    );
    if (selectedCell?.day === day && selectedCell?.slot === slot) {
      setSelectedCell(null);
    }
  };

  const handleExportTimetablePDF = async () => {
    const printNode = document.getElementById("printable-weekly-timetable-sheet");
    if (!printNode) return;

    setIsExportingPdf(true);
    try {
      const dataUrl = await toPng(printNode, {
        quality: 1,
        pixelRatio: 2.5,
        backgroundColor: "#ffffff",
        skipFonts: true,
        fontEmbedCSS: "",
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageW = 297;
      const pageH = 210;
      pdf.addImage(dataUrl, "PNG", 6, 6, pageW - 12, pageH - 12);
      pdf.save(`Emploi_du_Temps_${profName.replace(/\s+/g, "_")}_${academicYear}.pdf`);

      onNotify?.(
        "success",
        "تم تصدير جدول الحصص الأسبوعي الرسمي بصيغة PDF (A4 Landscape) جاهز للطباعة والتوقيع!"
      );
    } catch (err) {
      console.error("Failed to export timetable PDF:", err);
      onNotify?.("error", "تعذر تصدير ملف PDF، يرجى المحاولة مجدداً.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* رأس النافذة */}
        <div className="px-5 py-4 bg-gradient-to-l from-indigo-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  جدول الحصص الأسبوعي وتدبير الزمن البيداغوجي للأستاذ (Emploi du Temps)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  21h Max · A4 PDF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تخطيط الحصص الرسمية، حصص الدعم والتقويم، حساب أنصاف الأيام الفارغة، والتصدير الفوري بصيغة PDF الرسمية
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSessions(DEFAULT_21H_PRESET);
                onNotify?.(
                  "info",
                  "تم استرجاع جدول الحصص النموذجي للتعليم الثانوي التأهيلي (21 ساعة)."
                );
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>جدول نموذجي (21س)</span>
            </button>

            <button
              type="button"
              onClick={() => setSessions([])}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>تفريغ الجدول</span>
            </button>

            <button
              type="button"
              disabled={isExportingPdf}
              onClick={handleExportTimetablePDF}
              className="px-4 py-2 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>
                {isExportingPdf
                  ? "جاري توليد جدول PDF..."
                  : "تصدير جدول الحصص بصيغة PDF"}
              </span>
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

        {/* جسم النافذة القابل للتمرير */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 studio-scroll">
          {/* 1. بطاقات التحليل الكمي لوقت الأستاذ والنصاب القانوني */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">
                  النصاب الأسبوعي الإجمالي
                </span>
                <span className="text-xl font-black text-white font-mono">
                  {stats.totalHours}h{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    / {stats.statutoryLimit}h
                  </span>
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">
                  {stats.totalHours === 21
                    ? "نصاب قانوني مكتمل للتأهيلي"
                    : stats.totalHours < 21
                    ? `أقل بـ ${21 - stats.totalHours} ساعات عن النصاب الأقصى`
                    : `ساعات إضافية (+${stats.totalHours - 21}h)`}
                </span>
              </div>
              <Clock className="w-8 h-8 text-indigo-400 opacity-80" />
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">
                  توزيع الصباح / الزوال
                </span>
                <span className="text-lg font-black text-cyan-300 font-mono">
                  {stats.morningHours}h صباحاً · {stats.afternoonHours}h زوالاً
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  توازن الإيقاع الزمني للأستاذ
                </span>
              </div>
              <Sparkles className="w-8 h-8 text-cyan-400 opacity-80" />
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">
                  أنصاف الأيام الفارغة للتحضير
                </span>
                <span className="text-xl font-black text-amber-300 font-mono">
                  {stats.freeHalfDays}{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    نصف يوم
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  مخصصة للتحضير الديداكتيكي والتصحيح
                </span>
              </div>
              <BookOpen className="w-8 h-8 text-amber-400 opacity-80" />
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">
                  الأقسام المسندة ({stats.classesList.length})
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {stats.classesList.map(([cls, hrs]) => (
                    <span
                      key={cls}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-bold"
                    >
                      {cls}: {hrs}h
                    </span>
                  ))}
                </div>
              </div>
              <Layers className="w-8 h-8 text-emerald-400 opacity-80 shrink-0" />
            </div>
          </div>

          {/* 2. شريط البيانات الإدارية التكميلية للوثيقة المطبوعة */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                رقم التأجير (PPR / SOM)
              </label>
              <input
                type="text"
                value={pprNumber}
                onChange={(e) => setPprNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                placeholder="مثال: 1489205"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                الإطار والدرجة الإدارية
              </label>
              <input
                type="text"
                value={teacherGrade}
                onChange={(e) => setTeacherGrade(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="text-xs text-slate-300 bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-2.5">
              💡 <span className="font-bold text-indigo-200">إرشاد سريع:</span>{" "}
              انقر على أي خلية زمنية في الجدول أدناه لإضافة أو تعديل حصة دراسية،
              قاعة، أو تحديد موعد فرض محروس أو حصة دعم.
            </div>
          </div>

          {/* 3. نافذة تحرير الخلية عند النقر عليها */}
          {selectedCell && (
            <div className="bg-indigo-950/60 border border-indigo-400/50 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-indigo-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs sm:text-sm font-black text-white">
                    تخصيص الحصة الزمنية:{" "}
                    <span className="text-cyan-300">
                      {DAYS_LIST.find((d) => d.id === selectedCell.day)?.labelAr} (
                      {TIME_SLOTS.find((t) => t.id === selectedCell.slot)?.label})
                    </span>
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCell(null)}
                  className="text-xs text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
                >
                  إلغاء ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    القسم المسند (مثال: 2BAC PC 1)
                  </label>
                  <input
                    type="text"
                    value={editClassLabel}
                    onChange={(e) => setEditClassLabel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    القاعة الدراسية (Salle)
                  </label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    طبيعة الحصة البيداغوجية
                  </label>
                  <select
                    value={editSessionType}
                    onChange={(e) =>
                      setEditSessionType(e.target.value as SessionPedagogicalType)
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                  >
                    {Object.entries(SESSION_TYPE_META).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.labelAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    ملاحظة ديداكتيكية / محور الدرس
                  </label>
                  <input
                    type="text"
                    value={editTopicNote}
                    onChange={(e) => setEditTopicNote(e.target.value)}
                    placeholder="اختياري: الاتصال، المتتاليات..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteCell(selectedCell.day, selectedCell.slot)
                  }
                  className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/50 text-xs font-bold cursor-pointer"
                >
                  حذف الحصة من هذه الخانة
                </button>
                <button
                  type="button"
                  onClick={handleSaveCell}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تثبيت الحصة في الجدول</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. الوثيقة الرسمية القابلة للطباعة والتصدير المباشر إلى PDF */}
          <div className="bg-slate-950 p-3 sm:p-5 rounded-2xl border border-slate-800 overflow-x-auto">
            <div
              id="printable-weekly-timetable-sheet"
              dir="rtl"
              className="bg-white text-slate-900 rounded-xl p-5 min-w-[980px] shadow-xl border border-slate-300"
            >
              {/* الترويسة الرسمية لجدول الحصص */}
              <div className="grid grid-cols-3 items-center border-b-2 border-slate-800 pb-3 mb-3 text-xs">
                <div className="space-y-0.5 text-right">
                  <div className="font-black text-slate-900">
                    المملكة المغربية · وزارة التربية الوطنية والتعليم الأولي والرياضة
                  </div>
                  <div className="font-bold text-slate-700">{academyName}</div>
                  <div className="text-slate-600">{directionName}</div>
                  <div className="font-bold text-indigo-900">
                    المؤسسة: {schoolName}
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="inline-block px-4 py-1 rounded-lg bg-slate-900 text-white font-black text-sm tracking-wide">
                    جدول الحصص الأسبوعي الرسمي · Emploi du Temps
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    المادة: الرياضيات (Mathématiques) · الموسم الدراسي:{" "}
                    <span className="font-mono">{academicYear}</span>
                  </div>
                </div>

                <div className="space-y-0.5 text-left" dir="ltr">
                  <div className="font-black text-slate-900">
                    Professeur: {profName}
                  </div>
                  <div className="text-slate-700 font-mono text-[11px]">
                    PPR / SOM: {pprNumber}
                  </div>
                  <div className="text-slate-600 text-[11px]">{teacherGrade}</div>
                  <div className="font-bold text-emerald-800 text-[11px]">
                    Charge Hebdomadaire: {stats.totalHours}h / {stats.statutoryLimit}h
                  </div>
                </div>
              </div>

              {/* شبكة جدول الحصص الأسبوعي */}
              <table className="w-full border-collapse border-2 border-slate-800 text-center">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px]">
                    <th className="border border-slate-700 py-2 px-2 w-24 font-black">
                      الأيام / الحصص
                    </th>
                    {TIME_SLOTS.slice(0, 4).map((slot) => (
                      <th
                        key={slot.id}
                        className="border border-slate-700 py-2 px-1.5 font-mono font-bold bg-indigo-950"
                      >
                        <div>الفترة الصباحية</div>
                        <div className="text-cyan-300 text-xs">{slot.label}</div>
                      </th>
                    ))}
                    <th className="border border-slate-700 py-2 px-1 w-7 bg-amber-900/90 text-amber-100 font-bold text-[10px]">
                      استراحة الزوال
                    </th>
                    {TIME_SLOTS.slice(4, 8).map((slot) => (
                      <th
                        key={slot.id}
                        className="border border-slate-700 py-2 px-1.5 font-mono font-bold bg-slate-800"
                      >
                        <div>الفترة المسائية</div>
                        <div className="text-amber-300 text-xs">{slot.label}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS_LIST.map((day) => (
                    <tr key={day.id} className="h-16">
                      <td className="border-2 border-slate-800 bg-slate-100 font-black text-xs text-slate-900 px-2">
                        <div>{day.labelAr}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {day.labelFr}
                        </div>
                      </td>

                      {/* حصص الصباح */}
                      {TIME_SLOTS.slice(0, 4).map((slot) => {
                        const cell = sessionMap.get(`${day.id}_${slot.id}`);
                        const isSelected =
                          selectedCell?.day === day.id &&
                          selectedCell?.slot === slot.id;
                        const meta = cell
                          ? SESSION_TYPE_META[cell.sessionType]
                          : null;

                        return (
                          <td
                            key={slot.id}
                            onClick={() => handleOpenCellEditor(day.id, slot.id)}
                            style={
                              cell && meta
                                ? {
                                    backgroundColor: meta.printBg,
                                    borderColor: meta.printBorder,
                                    color: meta.printText,
                                  }
                                : undefined
                            }
                            className={`border border-slate-300 p-1.5 align-middle cursor-pointer transition hover:bg-indigo-50/70 ${
                              isSelected ? "ring-2 ring-cyan-500" : ""
                            }`}
                          >
                            {cell ? (
                              <div className="space-y-0.5">
                                <div className="font-black text-xs font-mono">
                                  {cell.classLabel}
                                </div>
                                <div className="text-[10px] font-bold opacity-90">
                                  {cell.room} ·{" "}
                                  {cell.sessionType === "COURS"
                                    ? "درس"
                                    : cell.sessionType === "TD_EXERCICES"
                                    ? "تمارين"
                                    : cell.sessionType === "DEVOIR_SURVEILLE"
                                    ? "فرض محروس"
                                    : cell.sessionType === "SOUTIEN"
                                    ? "دعم"
                                    : "تنسيق"}
                                </div>
                                {cell.topicNote && (
                                  <div className="text-[9px] truncate max-w-[105px] mx-auto opacity-75">
                                    {cell.topicNote}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-300 hover:text-slate-500">
                                + إضافة
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* فاصل منتصف النهار */}
                      <td className="border-2 border-slate-800 bg-slate-200/80 text-[9px] font-bold text-slate-600 px-0.5">
                        12:00
                        <br />—<br />
                        14:00
                      </td>

                      {/* حصص المساء */}
                      {TIME_SLOTS.slice(4, 8).map((slot) => {
                        const cell = sessionMap.get(`${day.id}_${slot.id}`);
                        const isSelected =
                          selectedCell?.day === day.id &&
                          selectedCell?.slot === slot.id;
                        const meta = cell
                          ? SESSION_TYPE_META[cell.sessionType]
                          : null;

                        return (
                          <td
                            key={slot.id}
                            onClick={() => handleOpenCellEditor(day.id, slot.id)}
                            style={
                              cell && meta
                                ? {
                                    backgroundColor: meta.printBg,
                                    borderColor: meta.printBorder,
                                    color: meta.printText,
                                  }
                                : undefined
                            }
                            className={`border border-slate-300 p-1.5 align-middle cursor-pointer transition hover:bg-indigo-50/70 ${
                              isSelected ? "ring-2 ring-cyan-500" : ""
                            }`}
                          >
                            {cell ? (
                              <div className="space-y-0.5">
                                <div className="font-black text-xs font-mono">
                                  {cell.classLabel}
                                </div>
                                <div className="text-[10px] font-bold opacity-90">
                                  {cell.room} ·{" "}
                                  {cell.sessionType === "COURS"
                                    ? "درس"
                                    : cell.sessionType === "TD_EXERCICES"
                                    ? "تمارين"
                                    : cell.sessionType === "DEVOIR_SURVEILLE"
                                    ? "فرض محروس"
                                    : cell.sessionType === "SOUTIEN"
                                    ? "دعم"
                                    : "تنسيق"}
                                </div>
                                {cell.topicNote && (
                                  <div className="text-[9px] truncate max-w-[105px] mx-auto opacity-75">
                                    {cell.topicNote}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-300 hover:text-slate-500">
                                + إضافة
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ذيل الوثيقة وخانات التوقيع الإداري والتربوي */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-slate-300 text-xs">
                <div className="border border-slate-300 rounded-lg p-2.5 h-20 flex flex-col justify-between">
                  <span className="font-bold text-slate-800">
                    توقيع الأستاذ(ة) المعني(ة):
                  </span>
                  <span className="text-[10px] text-slate-500">
                    التاريخ: .... / .... / {academicYear.split("/")[0]}
                  </span>
                </div>

                <div className="border border-slate-300 rounded-lg p-2.5 h-20 flex flex-col justify-between">
                  <span className="font-bold text-slate-800">
                    توقيع وخاتم السيد(ة) مدير(ة) المؤسسة:
                  </span>
                  <span className="text-[10px] text-slate-500">
                    مصادقة الإدارة التربوية
                  </span>
                </div>

                <div className="border border-slate-300 rounded-lg p-2.5 h-20 flex flex-col justify-between">
                  <span className="font-bold text-slate-800">
                    تأشيرة السيد(ة) المفتش(ة) التربوي(ة):
                  </span>
                  <span className="text-[10px] text-slate-500">
                    التوجيهات التربوية الرسمية لمادة الرياضيات
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. سجل دفتر النصوص الرسمي المتزامن مع الحصص الأسبوعية (ينطلق 08:00 صباحاً) */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs sm:text-sm font-black text-white">
                  سجل دفتر النصوص الرسمي المتزامن مع جدول الحصص (Cahier de Textes — انطلاقاً من 08:00 صباحاً)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-700/40 px-2.5 py-0.5 rounded-lg font-bold">
                مرتب زمنياً من 08:00 صباحاً إلى 18:00 مساءً · {sessions.length} حصة
              </span>
            </div>

            <div className="overflow-x-auto studio-scroll border border-slate-800 rounded-xl">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-200 border-b border-slate-800 text-[11px]">
                    <th className="p-2.5 border-l border-slate-800">اليوم والتوقيت الرسمي</th>
                    <th className="p-2.5 border-l border-slate-800">القسم والقاعة</th>
                    <th className="p-2.5 border-l border-slate-800">طبيعة الحصة</th>
                    <th className="p-2.5 border-l border-slate-800">مضامين الحصة المدونة في دفتر النصوص</th>
                    <th className="p-2.5">التكليف المنزلي والتوقيع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-[11px]">
                  {DAYS_LIST.flatMap((d) =>
                    TIME_SLOTS.map((sl) => {
                      const s = sessionMap.get(`${d.id}_${sl.id}`);
                      if (!s) return null;
                      const meta = SESSION_TYPE_META[s.sessionType];
                      return (
                        <tr
                          key={`${d.id}_${sl.id}`}
                          className="hover:bg-slate-900/60 transition-colors"
                        >
                          <td className="p-2.5 border-l border-slate-800 font-mono whitespace-nowrap">
                            <span className="font-bold text-white">{d.labelAr}</span>{" "}
                            <span className="text-cyan-300 font-bold">({sl.label})</span>
                          </td>
                          <td className="p-2.5 border-l border-slate-800 whitespace-nowrap">
                            <span className="font-mono font-black text-indigo-300">
                              {s.classLabel}
                            </span>{" "}
                            <span className="text-slate-400">· {s.room}</span>
                          </td>
                          <td className="p-2.5 border-l border-slate-800 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded border text-[10px] font-bold ${meta.badgeBg}`}
                            >
                              {meta.labelAr}
                            </span>
                          </td>
                          <td className="p-2.5 border-l border-slate-800 text-slate-300">
                            {s.topicNote
                              ? `إنجاز محور: « ${s.topicNote} » مع تدوين الملخص الرسمي والأمثلة التطبيقية.`
                              : s.sessionType === "COURS"
                              ? "بناء المفاهيم ومأسسة التعاريف والمبرهنات المقررة وتدوين الملخص بدفتر الدروس."
                              : s.sessionType === "TD_EXERCICES"
                              ? "حل وتصحيح تمارين تطبيقية وتوليفية على السبورة مع التركيز على منهجية التحرير."
                              : s.sessionType === "DEVOIR_SURVEILLE"
                              ? "إجراء فرض محروس رقمي/ورقي وفق الأطر المرجعية والمذكرة الوزارية 142-08."
                              : "حصة دعم ومعالجة مركزة لتجاوز الصعوبات التشخيصية وتثبيت التعلمات."}
                          </td>
                          <td className="p-2.5 text-slate-400">
                            {s.sessionType === "DEVOIR_SURVEILLE"
                              ? "مراجعة عناصر الإجابة وتحضير التصحيح الجماعي."
                              : "إنجاز التمارين المحددة بسلسلة الدرس · توقيع الأستاذ(ة) ✓"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
