import {
  CURRICULUM_DB,
  CycleType,
  EducationSystem,
  LessonItem,
  SemesterType,
  TrackData,
} from "../data/curriculum";

export interface CurriculumStatsSummary {
  totalTracks: number;
  totalLessons: number;
  tracksBySystem: Record<EducationSystem, number>;
  tracksByCycle: Record<string, number>;
}

const trackCache = new Map<string, TrackData>();
const tracksByCycleCache = new Map<string, TrackData[]>();
const flattenedLessonsCache = new Map<string, LessonItem[]>();
let cachedStatsSummary: CurriculumStatsSummary | null = null;

/**
 * استرجاع سريع ومخزن مؤقتاً لبيانات مسلك محدد مع دعم Fallback آمن
 */
export function getCurriculumTrackCached(trackCode: string): TrackData | undefined {
  if (!trackCode) return undefined;
  const hit = trackCache.get(trackCode);
  if (hit) return hit;

  const found = CURRICULUM_DB[trackCode];
  if (found) {
    trackCache.set(trackCode, found);
  }
  return found;
}

/**
 * فهرسة المسالك حسب النظام التربوي والسلك التعليمي مع تخزين النتيجة لتسريع التبديل بين المستويات
 */
export function getCurriculumTracksByCycleCached(
  educationSystem: EducationSystem,
  cycle: CycleType | "ALL" = "ALL"
): TrackData[] {
  const key = `${educationSystem}__${cycle}`;
  const hit = tracksByCycleCache.get(key);
  if (hit) return hit;

  const allTracks = Object.values(CURRICULUM_DB).filter(
    (t) => (t.system || "MAROC_NATIONAL") === educationSystem
  );
  const filtered =
    cycle === "ALL" ? allTracks : allTracks.filter((t) => t.cycle === cycle);

  tracksByCycleCache.set(key, filtered);
  return filtered;
}

/**
 * استرجاع الدروس المفلترة لمسلك ودورة معينة بصيغة مسطحة ومفهرسة (O(1) بعد أول استدعاء)
 */
export function getSemesterLessonsFlattenedCached(
  trackCode: string,
  semester?: SemesterType
): LessonItem[] {
  const key = `${trackCode}__${semester || "ALL"}`;
  const hit = flattenedLessonsCache.get(key);
  if (hit) return hit;

  const track = getCurriculumTrackCached(trackCode);
  if (!track) return [];

  const collectSemester = (semObj?: Record<string, LessonItem[]>) =>
    semObj ? Object.values(semObj).flat() : [];

  const lessons =
    semester === "S1"
      ? collectSemester(track.semesters.S1)
      : semester === "S2"
      ? collectSemester(track.semesters.S2)
      : [
          ...collectSemester(track.semesters.S1),
          ...collectSemester(track.semesters.S2),
        ];

  flattenedLessonsCache.set(key, lessons);
  return lessons;
}

/**
 * إحصائيات المنهاج الكلية المخزنة مؤقتاً
 */
export function getCurriculumStatsSummary(): CurriculumStatsSummary {
  if (cachedStatsSummary) return cachedStatsSummary;

  const tracks = Object.values(CURRICULUM_DB);
  const tracksBySystem: Record<EducationSystem, number> = {
    MAROC_NATIONAL: 0,
    MISSION_FRANCAISE: 0,
  };
  const tracksByCycle: Record<string, number> = {};
  let totalLessons = 0;

  for (const track of tracks) {
    const sys: EducationSystem = track.system || "MAROC_NATIONAL";
    tracksBySystem[sys] = (tracksBySystem[sys] || 0) + 1;
    tracksByCycle[track.cycle] = (tracksByCycle[track.cycle] || 0) + 1;
    for (const semKey of ["S1", "S2"] as const) {
      const semData = track.semesters[semKey];
      if (!semData) continue;
      for (const dsLessons of Object.values(semData)) {
        totalLessons += Array.isArray(dsLessons) ? dsLessons.length : 0;
      }
    }
  }

  cachedStatsSummary = {
    totalTracks: tracks.length,
    totalLessons,
    tracksBySystem,
    tracksByCycle,
  };
  return cachedStatsSummary;
}
