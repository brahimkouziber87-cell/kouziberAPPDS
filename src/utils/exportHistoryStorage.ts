import { ExamModel, ModuleType, SemesterType, TrackData } from "../data/curriculum";

export type ExportFileCategory =
  | "PDF"
  | "OVERLEAF_ZIP"
  | "LATEX_TYPST"
  | "EXCEL_CSV"
  | "HTML_JSON";

export interface BatchPrintSharedConfig {
  selectedDocIds: string[];
  copies: number;
  orientation: "PORTRAIT" | "LANDSCAPE" | "AUTO";
  pageRange: "ALL" | "PAGE_1" | "PAGES_1_2" | "CUSTOM";
  customPageRange?: string;
  paperFormat: "A4_STANDARD" | "A5_BOOKLET_FOLDED";
  duplex: "DUPLEX_RECTO_VERSO" | "SIMPLEX_ONE_SIDED";
  includeWorkspace?: boolean;
  workspaceStyle?: string;
  includeCorrectionKey?: boolean;
}

export interface ExportHistoryEntry {
  id: string;
  fileName: string;
  formatLabel: string;
  category: ExportFileCategory;
  trackCode: string;
  trackLabelAr: string;
  semester: SemesterType;
  moduleType: ModuleType;
  modelCode: ExamModel | string;
  fileSizeKb: number;
  createdAtIso: string;
  status: "COMPLETED" | "GENERATING" | "READY";
  dpiOrCompiler: string;
  includedFiles?: string[];
  includeAnswerWorkspace?: boolean;
  includeDetailedSolutions?: boolean;
  cachedContent?: string;
}

export const EXPORT_HISTORY_STORAGE_KEY = "prof_math_export_dashboard_history_v1";

export function getInitialSeededExportHistory(
  track?: TrackData,
  sem: SemesterType = "S1"
): ExportHistoryEntry[] {
  const now = Date.now();
  const trackCode = track?.code || "2BAC_SM";
  const trackLabelAr = track?.labelAr || "الثانية بكالوريا علوم رياضية (أ & ب)";

  return [
    {
      id: "exp_overleaf_latest",
      fileName: `Overleaf_${trackCode}_${sem}_DS1_Complet.zip`,
      formatLabel: "Overleaf Project (.zip)",
      category: "OVERLEAF_ZIP",
      trackCode,
      trackLabelAr,
      semester: sem,
      moduleType: "DS_142_08",
      modelCode: "BOTH",
      fileSizeKb: 48.6,
      createdAtIso: new Date(now - 4 * 60 * 1000).toISOString(),
      status: "COMPLETED",
      dpiOrCompiler: "XeLaTeX · TeX Live 2025",
      includedFiles: ["main.tex", "preamble.tex", "README_OVERLEAF.md"],
      includeAnswerWorkspace: true,
      includeDetailedSolutions: true,
    },
    {
      id: "exp_pdf_latest",
      fileName: `DS1_${trackCode}_${sem}_Cahier_Eleve_Et_Corrige.pdf`,
      formatLabel: "PDF Vectoriel (A4)",
      category: "PDF",
      trackCode,
      trackLabelAr,
      semester: sem,
      moduleType: "DS_142_08",
      modelCode: "BOTH",
      fileSizeKb: 312.4,
      createdAtIso: new Date(now - 14 * 60 * 1000).toISOString(),
      status: "COMPLETED",
      dpiOrCompiler: "300 DPI · Vector Math",
      includeAnswerWorkspace: true,
      includeDetailedSolutions: true,
    },
    {
      id: "exp_overleaf_serie",
      fileName: `Overleaf_${trackCode}_${sem}_Serie_TD_Bac.zip`,
      formatLabel: "Overleaf Project (.zip)",
      category: "OVERLEAF_ZIP",
      trackCode,
      trackLabelAr,
      semester: sem,
      moduleType: "DM_SERIE",
      modelCode: "A",
      fileSizeKb: 42.1,
      createdAtIso: new Date(now - 52 * 60 * 1000).toISOString(),
      status: "COMPLETED",
      dpiOrCompiler: "XeLaTeX · tcolorbox + TikZ",
      includedFiles: ["main.tex", "preamble.tex", "README_OVERLEAF.md"],
      includeAnswerWorkspace: true,
      includeDetailedSolutions: true,
    },
    {
      id: "exp_latex_source",
      fileName: `${trackCode}_DS_142_08_${sem}_main.tex`,
      formatLabel: "LaTeX (.tex)",
      category: "LATEX_TYPST",
      trackCode,
      trackLabelAr,
      semester: sem,
      moduleType: "DS_142_08",
      modelCode: "A",
      fileSizeKb: 26.8,
      createdAtIso: new Date(now - 2 * 3600 * 1000).toISOString(),
      status: "COMPLETED",
      dpiOrCompiler: "UTF-8 · Polyglossia / Babel",
      includeAnswerWorkspace: true,
      includeDetailedSolutions: true,
    },
    {
      id: "exp_massar_bareme",
      fileName: `Grille_Bareme_Massar_${trackCode}_${sem}.xls`,
      formatLabel: "Excel / Massar (.xls)",
      category: "EXCEL_CSV",
      trackCode,
      trackLabelAr,
      semester: sem,
      moduleType: "DS_142_08",
      modelCode: "A",
      fileSizeKb: 19.4,
      createdAtIso: new Date(now - 5 * 3600 * 1000).toISOString(),
      status: "COMPLETED",
      dpiOrCompiler: "Note 142-08 · N1/N2/N3",
    },
  ];
}

export function loadExportHistory(
  track?: TrackData,
  sem: SemesterType = "S1"
): ExportHistoryEntry[] {
  try {
    const raw = localStorage.getItem(EXPORT_HISTORY_STORAGE_KEY);
    if (!raw) {
      const seeded = getInitialSeededExportHistory(track, sem);
      localStorage.setItem(EXPORT_HISTORY_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const seeded = getInitialSeededExportHistory(track, sem);
    localStorage.setItem(EXPORT_HISTORY_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return getInitialSeededExportHistory(track, sem);
  }
}

export function recordExportHistoryEntry(
  entry: Omit<ExportHistoryEntry, "id" | "createdAtIso" | "status"> & {
    id?: string;
    createdAtIso?: string;
    status?: "COMPLETED" | "GENERATING" | "READY";
  }
): ExportHistoryEntry[] {
  try {
    const current = loadExportHistory();
    const newItem: ExportHistoryEntry = {
      ...entry,
      id: entry.id || `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAtIso: entry.createdAtIso || new Date().toISOString(),
      status: entry.status || "COMPLETED",
    };
    const updated = [newItem, ...current.filter((e) => e.fileName !== newItem.fileName)]
      .slice(0, 25)
      .map((item, idx) => {
        // الاحتفاظ بالكود المصدري الكامل فقط لآخر 5 ملفات لتفادي امتلاء ذاكرة المتصفح (LocalStorage Quota)
        if (idx >= 5 && item.cachedContent) {
          const { cachedContent: _unused, ...rest } = item;
          return rest;
        }
        return item;
      });
    localStorage.setItem(EXPORT_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
