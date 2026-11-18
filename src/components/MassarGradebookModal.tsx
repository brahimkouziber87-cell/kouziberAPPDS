import React, { useState, useMemo } from "react";
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  UserCheck,
  AlertTriangle,
  Award,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  FileText,
  Printer,
  Sparkles,
  ShieldCheck,
  Search,
} from "lucide-react";
import { LessonItem, TrackData } from "../data/curriculum";

export interface StudentScoreRecord {
  id: string;
  massarCode: string;
  fullName: string;
  exerciseScores: number[]; // e.g. [3.5, 4.0, 5.0, 2.5]
  totalScore: number;       // out of 20
  appreciation: string;
}

export interface MassarGradebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: LessonItem[];
  track: TrackData;
  school: string;
  prof: string;
  year: string;
  dsNumber: string;
  isFr?: boolean;
}

export const MassarGradebookModal: React.FC<MassarGradebookModalProps> = ({
  isOpen,
  onClose,
  lessons = [],
  track,
  school,
  prof,
  year,
  dsNumber,
  isFr = false,
}) => {
  const [activeTab, setActiveTab] = useState<"ROSTER_SCORES" | "REMEDIATION_MATRIX">("ROSTER_SCORES");
  const [searchFilter, setSearchFilter] = useState("");

  // Default Moroccan class roster template (30 students)
  const [students, setStudents] = useState<StudentScoreRecord[]>(() => {
    const defaultRoster = [
      { id: "1", massarCode: "G134567891", fullName: "أمين التازي (Amine TAZI)", base: 16.5 },
      { id: "2", massarCode: "G134567892", fullName: "سلمى الإدريسي (Salma IDRISSI)", base: 18.0 },
      { id: "3", massarCode: "G134567893", fullName: "ياسين برادة (Yassine BERRADA)", base: 11.5 },
      { id: "4", massarCode: "G134567894", fullName: "فاطمة الزهراء العلمي (Fatima Zahra ALAMI)", base: 14.5 },
      { id: "5", massarCode: "G134567895", fullName: "حمزة بنجلون (Hamza BENJELLOUN)", base: 8.5 },
      { id: "6", massarCode: "G134567896", fullName: "مريم الشرايبي (Meriem CHRAIBI)", base: 17.0 },
      { id: "7", massarCode: "G134567897", fullName: "عمر الفاسي (Omar FASSI)", base: 9.0 },
      { id: "8", massarCode: "G134567898", fullName: "هدى المنصوري (Houda MANSOURI)", base: 15.0 },
      { id: "9", massarCode: "G134567899", fullName: "أيوب الصقلي (Ayoub SEKKALI)", base: 12.0 },
      { id: "10", massarCode: "G134567900", fullName: "زينب بنكيران (Zineb BENKIRANE)", base: 7.5 },
    ];

    return defaultRoster.map((item) => {
      // Decompose base into scores per exercise proportionally
      const exScores = lessons.map((l) => {
        const maxPts = (l.weight * 20) / 100;
        const ratio = item.base / 20;
        return Number((maxPts * ratio).toFixed(2));
      });
      const total = Number(exScores.reduce((acc, curr) => acc + curr, 0).toFixed(2));
      const apprec =
        total >= 16 ? "ممتاز (Très Bien)" : total >= 13 ? "حسن (Bien)" : total >= 10 ? "مستحسن (Assez Bien)" : "دون المتوسط (À consolider)";
      return {
        id: item.id,
        massarCode: item.massarCode,
        fullName: item.fullName,
        exerciseScores: exScores,
        totalScore: total,
        appreciation: apprec,
      };
    });
  });

  const handleScoreChange = (studentId: string, exIdx: number, val: number) => {
    const maxPts = ((lessons[exIdx]?.weight || 5) * 20) / 100;
    const clamped = Math.max(0, Math.min(maxPts, Number(val) || 0));

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const nextScores = [...s.exerciseScores];
        nextScores[exIdx] = clamped;
        const nextTotal = Number(nextScores.reduce((acc, curr) => acc + curr, 0).toFixed(2));
        const apprec =
          nextTotal >= 16
            ? "ممتاز (Très Bien)"
            : nextTotal >= 13
            ? "حسن (Bien)"
            : nextTotal >= 10
            ? "مستحسن (Assez Bien)"
            : "دون المتوسط (À consolider)";
        return {
          ...s,
          exerciseScores: nextScores,
          totalScore: nextTotal,
          appreciation: apprec,
        };
      })
    );
  };

  const classAverage = useMemo(() => {
    if (students.length === 0) return 0;
    const sum = students.reduce((acc, curr) => acc + curr.totalScore, 0);
    return Number((sum / students.length).toFixed(2));
  }, [students]);

  const remediationGroups = useMemo(() => {
    const belowTen = students.filter((s) => s.totalScore < 10);
    const averageGroup = students.filter((s) => s.totalScore >= 10 && s.totalScore < 14);
    const excellenceGroup = students.filter((s) => s.totalScore >= 14);
    return { belowTen, averageGroup, excellenceGroup };
  }, [students]);

  const exportMassarCsv = () => {
    const header = [
      "Code Massar",
      "Nom & Prénom",
      ...lessons.map((_, i) => `Exercice ${i + 1}`),
      "Note Globale /20",
      "Appréciation",
    ].join(",");

    const rows = students.map((s) =>
      [
        s.massarCode,
        `"${s.fullName}"`,
        ...s.exerciseScores.map((sc) => sc.toString()),
        s.totalScore.toString(),
        `"${s.appreciation}"`,
      ].join(",")
    );

    const csvContent = "\uFEFF" + [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Notes_Massar_${track.code}_DS${dsNumber}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
      dir={isFr ? "ltr" : "rtl"}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* شريط العنوان التفاعلي */}
        <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 px-5 py-3.5 border-b border-teal-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">
                  {isFr
                    ? "Passerelle Massar & Matrice de Remédiation Ciblée"
                    : "جسر نقط مسار الرسمي (Massar MEN) ومصفوفة المعالجة البيداغوجية"}
                </h3>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  {track.code} · DS {dsNumber}
                </span>
              </div>
              <p className="text-xs text-teal-200/80">
                {isFr
                  ? "Saisie des notes par exercice, export conforme Massar (CSV/Excel) et diagnostic automatisé des compétences"
                  : "تدوين نقط كل تمرين، استخراج ملف مسار المطابق للمنظومة، واستخراج بطاقات الدعم الفردية"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* شريط التبويبات والمؤشرات السريعة */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("ROSTER_SCORES")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "ROSTER_SCORES"
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isFr ? "1. Saisie des Notes Massar" : "1. شبكة النقط ومسار"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("REMEDIATION_MATRIX")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "REMEDIATION_MATRIX"
                  ? "bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFr ? "2. Diagnostic & Groupes de Soutien" : "2. مصفوفة الدعم والمعالجة"}</span>
            </button>
          </div>

          {/* معدل القسم وأزرار التصدير */}
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400">{isFr ? "Moyenne : " : "معدل القسم: "}</span>
              <strong className={classAverage >= 10 ? "text-emerald-400" : "text-rose-400"}>
                {classAverage} / 20
              </strong>
            </div>

            <button
              type="button"
              onClick={exportMassarCsv}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isFr ? "Exporter CSV Massar" : "تحميل ملف مسار (CSV)"}</span>
            </button>
          </div>
        </div>

        {/* محتوى التبويب المختار */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-950/60">
          {activeTab === "ROSTER_SCORES" ? (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px] font-bold">
                    <tr>
                      <th className="p-2.5 text-center w-12">#</th>
                      <th className="p-2.5 text-start">{isFr ? "Code Massar" : "رمز مسار"}</th>
                      <th className="p-2.5 text-start">{isFr ? "Nom & Prénom" : "الاسم الكامل للتلميذ"}</th>
                      {lessons.map((l, idx) => (
                        <th key={idx} className="p-2.5 text-center min-w-[90px]">
                          <div>{isFr ? `Ex ${idx + 1}` : `ت ${idx + 1}`}</div>
                          <div className="font-mono text-[9px] text-teal-400">
                            / {((l.weight * 20) / 100).toFixed(1)}p
                          </div>
                        </th>
                      ))}
                      <th className="p-2.5 text-center min-w-[90px] text-cyan-300">
                        {isFr ? "Note / 20" : "النقطة الإجمالية"}
                      </th>
                      <th className="p-2.5 text-start">{isFr ? "Appréciation" : "الملاحظة التقديرية"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {students.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-800/40">
                        <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                        <td className="p-2 text-slate-400 font-bold">{student.massarCode}</td>
                        <td className="p-2 text-white font-bold font-sans">{student.fullName}</td>
                        {student.exerciseScores.map((sc, exIdx) => {
                          const max = ((lessons[exIdx]?.weight || 5) * 20) / 100;
                          return (
                            <td key={exIdx} className="p-1.5 text-center">
                              <input
                                type="number"
                                min={0}
                                max={max}
                                step={0.25}
                                value={sc}
                                onChange={(e) =>
                                  handleScoreChange(student.id, exIdx, Number(e.target.value))
                                }
                                className="w-16 bg-slate-950 border border-slate-700 rounded-lg p-1 text-center text-xs font-bold text-teal-300 focus:outline-none focus:border-teal-400"
                              />
                            </td>
                          );
                        })}
                        <td className="p-2 text-center font-black">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              student.totalScore >= 10
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "bg-rose-950 text-rose-300 border border-rose-800"
                            }`}
                          >
                            {student.totalScore}
                          </span>
                        </td>
                        <td className="p-2 text-[11px] font-sans text-slate-300">
                          {student.appreciation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* تبويب مصفوفة الدعم والمعالجة البيداغوجية المستهدفة */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* فئة الدعم المركز */}
                <div className="bg-rose-950/30 border border-rose-800/60 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-rose-300 text-xs font-black">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{isFr ? "Groupe Remédiation (< 10)" : "فئة الدعم المكثف (أقل من 10)"}</span>
                    </span>
                    <span className="bg-rose-900 text-white font-mono px-2 py-0.5 rounded text-[10px]">
                      {remediationGroups.belowTen.length} {isFr ? "élèves" : "تلاميذ"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isFr
                      ? "Consolidation des automatismes fondamentaux (calcul de limites, règles de dérivation directes)."
                      : "تثبيت المكتسبات الأساسية: حساب النهايات المباشرة، تقنيات إزالة الأشكال غير المحددة، وضبط قواعد الاشتقاق."}
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto font-sans text-xs pt-1">
                    {remediationGroups.belowTen.map((s) => (
                      <div key={s.id} className="bg-slate-900/80 p-1.5 rounded flex justify-between font-bold">
                        <span>{s.fullName}</span>
                        <span className="font-mono text-rose-400">{s.totalScore}/20</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* فئة التمكين المتوسط */}
                <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-amber-300 text-xs font-black">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>{isFr ? "Groupe Maîtrise (10 - 14)" : "فئة التمكين والترسيخ (10 إلى 14)"}</span>
                    </span>
                    <span className="bg-amber-900 text-white font-mono px-2 py-0.5 rounded text-[10px]">
                      {remediationGroups.averageGroup.length} {isFr ? "élèves" : "تلاميذ"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isFr
                      ? "Travail sur la rigueur de rédaction, les justifications du TVI et les interprétations géométriques."
                      : "تحسين صياغة الاستدلال، التدريب على توظيف مبرهنة القيم الوسيطية، والتأويل الهندسي للمقاربات."}
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto font-sans text-xs pt-1">
                    {remediationGroups.averageGroup.map((s) => (
                      <div key={s.id} className="bg-slate-900/80 p-1.5 rounded flex justify-between font-bold">
                        <span>{s.fullName}</span>
                        <span className="font-mono text-amber-400">{s.totalScore}/20</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* فئة التميز والتفوق */}
                <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-emerald-300 text-xs font-black">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>{isFr ? "Groupe Excellence (≥ 14)" : "فئة التميز والتعميق (14 فما فوق)"}</span>
                    </span>
                    <span className="bg-emerald-900 text-white font-mono px-2 py-0.5 rounded text-[10px]">
                      {remediationGroups.excellenceGroup.length} {isFr ? "élèves" : "تلاميذ"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isFr
                      ? "Résolution de problèmes d'olympiades, suites récurrentes non linéaires et optimisation spatiale."
                      : "تمارين استمثال متقدمة، متتاليات تراجعية لا خطية، ومسائل من نمط الأولمبياد وامتحانات التميز."}
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto font-sans text-xs pt-1">
                    {remediationGroups.excellenceGroup.map((s) => (
                      <div key={s.id} className="bg-slate-900/80 p-1.5 rounded flex justify-between font-bold">
                        <span>{s.fullName}</span>
                        <span className="font-mono text-emerald-400">{s.totalScore}/20</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
