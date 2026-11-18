import {
  BilingualLayout,
  BranchColorGradientMode,
  DMSubType,
  DocFontFamily,
  DocFontSize,
  DocLanguage,
  DSQuestionDensity,
  EducationSystem,
  ExamModel,
  ExportFormat,
  HeaderStyle,
  LessonHeaderIconId,
  ModuleType,
  MoroccanDSStructureMode,
  SemesterType,
  SolutionDisplayMode,
} from "../data/curriculum";
import { LatexPackageTheme, PaperSurfaceTexture, StudentGridStyle } from "./latexPackagesAndMath";
import type { AppliedTitleCalligraphyConfig } from "../components/ArabicCalligraphySimulator";
import type { TeacherLogoVariant } from "../components/TeacherLogo";

export const DOCUMENT_PREFS_STORAGE_KEY = "pedagogical_math_prefs_v4";

export interface SavedPreferences {
  educationSystem: EducationSystem;
  school: string;
  prof: string;
  year: string;
  academy: string;
  direction: string;
  headerStyle: HeaderStyle;
  includeStudentBox: boolean;
  includeGradeBox: boolean;
  calculatorAllowed: boolean;
  includeCompetencies: boolean;
  examModel: ExamModel;
  shuffleQuestions: boolean;
  shuffleExercises: boolean;
  docLang: DocLanguage;
  bilingualLayout: BilingualLayout;
  exportFormat: ExportFormat;
  activeModule: ModuleType;
  selectedTrackCode: string;
  semester: SemesterType;
  dsKey: string;
  n1: number;
  n2: number;
  n3: number;
  fillBlanks: boolean;
  includeTICE: boolean;
  dmSubType: DMSubType;
  dmNumber: string;
  dmDueDate: string;
  includeHints: boolean;
  includeTeacherLogo: boolean;
  logoVariant: TeacherLogoVariant;
  includeLogoWatermark: boolean;
  customLogoUrl: string | null;
  docFontFamily: DocFontFamily;
  docFontSize: DocFontSize;
  includeDetailedSolutions?: boolean;
  solutionDisplayMode?: SolutionDisplayMode;
  showQuestionBareme?: boolean;
  includeAnswerWorkspace?: boolean;
  includeGradingScaleTable?: boolean;
  includeSelfEvalGrid?: boolean;
  serieExerciseCount?: number;
  isCustomLessonMode?: boolean;
  selectedLessonIndices?: number[];
  customWeightsMap?: Record<string, number>;
  customLessonIconsMap?: Record<string, LessonHeaderIconId>;
  dsStructureMode?: MoroccanDSStructureMode;
  dsQuestionDensity?: DSQuestionDensity;
  latexPackageTheme?: LatexPackageTheme;
  paperSurface?: PaperSurfaceTexture;
  enableBranchColorGradient?: boolean;
  branchColorMode?: BranchColorGradientMode;
  includeInteractiveQrFooter?: boolean;
  studentGridStyle?: StudentGridStyle;
  appliedTitleCalligraphy?: AppliedTitleCalligraphyConfig;
}

export const DEFAULT_PREFS: SavedPreferences = {
  educationSystem: "MAROC_NATIONAL",
  school: "ROOSEVELT SCHOOL 2",
  prof: "Prof. Brahim KOUZIBER",
  year: "2026-2027",
  academy: "الأكاديمية الجهوية للتربية والتكوين لجهة الدار البيضاء-سطات",
  direction: "المديرية الإقليمية أنفا",
  headerStyle: "OFFICIAL_AREF",
  includeStudentBox: true,
  includeGradeBox: true,
  calculatorAllowed: true,
  includeCompetencies: true,
  examModel: "A",
  shuffleQuestions: true,
  shuffleExercises: false,
  docLang: "FR",
  bilingualLayout: "SIDE_BY_SIDE",
  exportFormat: "PDF",
  activeModule: "DS_142_08",
  selectedTrackCode: "2BAC_PC",
  semester: "S1",
  dsKey: "DS1",
  n1: 35,
  n2: 45,
  n3: 20,
  fillBlanks: true,
  includeTICE: true,
  dmSubType: "DEVOIR_MAISON",
  dmNumber: "N° 1",
  dmDueDate: "2026-11-15",
  serieExerciseCount: 6,
  includeHints: true,
  includeTeacherLogo: true,
  logoVariant: "DOC2APP_MONO",
  includeLogoWatermark: false,
  customLogoUrl: null,
  docFontFamily: "ACADEMIC_SERIF",
  docFontSize: "NORMAL",
  includeDetailedSolutions: false,
  solutionDisplayMode: "SEPARATE_PAGE_ANNEXES",
  showQuestionBareme: true,
  includeAnswerWorkspace: false,
  includeGradingScaleTable: true,
  includeSelfEvalGrid: true,
  isCustomLessonMode: false,
  selectedLessonIndices: [0, 1],
  customWeightsMap: {},
  customLessonIconsMap: {},
  dsStructureMode: "EXERCICES_ET_PROBLEME",
  dsQuestionDensity: "INTENSIVE",
  latexPackageTheme: "TCOLORBOX",
  paperSurface: "PLAIN_WHITE",
  enableBranchColorGradient: true,
  branchColorMode: "AUTO_BY_LESSON",
  includeInteractiveQrFooter: true,
  studentGridStyle: "SEYES_FRENCH",
  appliedTitleCalligraphy: {
    fontId: "DEFAULT_DOC",
    scale: "BALANCED",
    ornament: "NONE",
    scope: "HEADER_TITLES",
    enableMoroccanHeaderOrnament: true,
    customLetterSpacingEm: 0.025,
  },
};

export function loadInitialPrefs(): SavedPreferences {
  try {
    if (typeof localStorage === "undefined") return DEFAULT_PREFS;
    const raw = localStorage.getItem(DOCUMENT_PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefsToStorage(prefs: SavedPreferences): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.setItem(DOCUMENT_PREFS_STORAGE_KEY, JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}
