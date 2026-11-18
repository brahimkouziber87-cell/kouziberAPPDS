/**
 * وحدة إدارة المفضلة البيداغوجية للنماذج الجاهزة والتمارين المخصصة
 * Pedagogical Favorites & Blueprint Vault (وفق المنهاج المغربي والمذكرة 142-08)
 */

import { LessonItem } from "../data/curriculum";

export type FavoriteItemType = "EXAM_BLUEPRINT" | "CUSTOM_EXERCISE" | "EVAL_TEMPLATE";

export interface FavoritePedagogicalItem {
  id: string;
  type: FavoriteItemType;
  titleAr: string;
  titleFr: string;
  subtitleAr?: string;
  trackCode?: string;
  trackLabelAr?: string;
  trackLabelFr?: string;
  semester?: "S1" | "S2";
  dsKey?: string;
  tags: string[];
  addedAt?: string;
  createdAt?: string;
  /** بيانات مخصصة للنموذج الكامل للفرض */
  blueprintData?: {
    trackCode?: string;
    semester?: "S1" | "S2";
    dsKey?: string;
    dsStructureMode?: string;
    totalDurationMinutes?: number;
    lessons?: Array<{
      lessonAr: string;
      lessonFr: string;
      weight: number;
      category?: string;
      subCategory?: string;
      capacitiesAr?: string[];
      capacitiesFr?: string[];
    }>;
    n1Percentage?: number;
    n2Percentage?: number;
    n3Percentage?: number;
  };
  /** بيانات التمرين المخصص */
  exerciseData?: {
    lessonAr: string;
    lessonFr: string;
    category?: string;
    weight: number;
    capacitiesAr?: string[];
    capacitiesFr?: string[];
    sampleExerciseAr?: string[];
    sampleExerciseFr?: string[];
    defaultBareme?: number;
    targetSkills?: { n1: number; n2: number; n3: number };
  };
  /** بيانات النموذج أو التمرين المخزنة لإعادة التطبيق الفوري بضغطة زر */
  payload?: {
    lessonData?: LessonItem;
    exercises?: any[];
    weightsMap?: Record<string, number>;
    customQuestionsAr?: string[];
    customQuestionsFr?: string[];
    customBaremes?: number[];
    templateId?: string;
    descriptionAr?: string;
  };
}

const FAVORITES_STORAGE_KEY = "prof_math_pedagogical_favorites_v1";

/**
 * النماذج والتمارين الافتراضية المفضلة الجاهزة للاستخدام الفوري
 */
export const DEFAULT_PRESET_FAVORITES: FavoritePedagogicalItem[] = [
  {
    id: "fav_preset_2bac_pc_ds1",
    type: "EXAM_BLUEPRINT",
    titleAr: "نموذج الفرض المحروس 1 — الدورة الأولى (2 باك ع.ف / SVT)",
    titleFr: "Devoir Surveillé N°1 — 2BAC PC & SVT (Semestre 1)",
    subtitleAr: "المتتاليات العددية + الدوال العددية والاتصال والاشتقاق (20.0 ن)",
    trackCode: "2BAC_PC",
    trackLabelAr: "الثانية باكلوريا علوم فيزيائية وعلوم الحياة والأرض",
    semester: "S1",
    dsKey: "DS1",
    tags: ["فرض محروس", "2BAC", "متتاليات", "اتصال"],
    addedAt: "2026-09-15T08:00:00.000Z",
    createdAt: "2026-09-15T08:00:00.000Z",
    blueprintData: {
      trackCode: "2BAC_PC",
      semester: "S1",
      dsKey: "DS1",
      dsStructureMode: "STANDARD_142_08",
      totalDurationMinutes: 120,
      n1Percentage: 35,
      n2Percentage: 45,
      n3Percentage: 20,
      lessons: [
        {
          lessonAr: "المتتاليات العددية",
          lessonFr: "Suites numériques",
          weight: 35,
          category: "Analysis",
          capacitiesAr: ["دراسة تقارب متتالية ترجعية بواسطة دالة u_{n+1}=f(u_n)"],
        },
        {
          lessonAr: "الاتصال والاشتقاق ودراسة الدوال",
          lessonFr: "Continuité, dérivation et étude de fonctions",
          weight: 65,
          category: "Analysis",
          capacitiesAr: ["تطبيق مبرهنة القيم الوسيطية ورسم المقاربات والمماسات"],
        },
      ],
    },
    payload: {
      descriptionAr: "نموذج نموذجي متوازن وفق المذكرة 142-08 (45% N1 · 35% N2 · 20% N3)",
    },
  },
  {
    id: "fav_preset_2bac_sm_arithmetic",
    type: "CUSTOM_EXERCISE",
    titleAr: "مسألة توليفية رائدة في الحسابيات ومبرهنة فيرما الصغرى",
    titleFr: "Problème d'arithmétique dans ℤ — Petit théorème de Fermat",
    subtitleAr: "تمرين تمايز وإتقان (N3) مخصص للشعب الرياضية 2BAC SM",
    trackCode: "2BAC_SM",
    trackLabelAr: "الثانية باكلوريا علوم رياضية (أ) و (ب)",
    semester: "S1",
    dsKey: "DS2",
    tags: ["تمرين مخصص", "2BAC SM", "حسابيات", "N3"],
    addedAt: "2026-10-01T10:30:00.000Z",
    createdAt: "2026-10-01T10:30:00.000Z",
    exerciseData: {
      lessonAr: "الحسابيات في مجموعة الأعداد الصحيحة النسبية (ℤ)",
      lessonFr: "Arithmétique dans l'ensemble des entiers relatifs ℤ",
      category: "Algebra",
      weight: 35,
      defaultBareme: 7.0,
      capacitiesAr: [
        "توظيف خوارزمية أقليدس ومبرهنة بوزو لحل المعادلات الديوفانتية",
        "تطبيق مبرهنة فيرما واستعمال الترديد modulo p لحل المسائل التركيبية",
      ],
      sampleExerciseAr: [
        "1. حدد حسب قيم العدد الصحيح الطبيعي n باقي القسمة الإقليدية للعدد 3^n على 7.",
        "2. بين أنه لكل n من ℕ، العدد A_n = 3^(2n+1) + 2^(n+2) يقبل القسمة على 7.",
        "3. نعتبر في ℤ² المعادلة (E) : 17x - 7y = 3. حل المعادلة (E) باستعمال مبرهنة غوص وبوزو.",
        "4. ليكن p عدداً أولياً أكبر قطعا من 3. بين أن p² ≡ 1 [24]، واستنتج قابلية قسمة p^4 - 1 على 240 إذا كان p لا يقسم 5.",
      ],
      targetSkills: { n1: 1, n2: 3, n3: 3 },
    },
    payload: {
      lessonData: {
        lessonAr: "الحسابيات في مجموعة الأعداد الصحيحة النسبية (ℤ)",
        lessonFr: "Arithmétique dans l'ensemble des entiers relatifs ℤ",
        hours: "18h",
        weight: 35,
        category: "Algebra",
        subCategory: "جبر",
        subCategoryFr: "Algèbre & Arithmétique",
        capacitiesAr: [
          "توظيف خوارزمية أقليدس ومبرهنة بوزو لحل المعادلات الديوفانتية",
          "تطبيق مبرهنة فيرما واستعمال الترديد modulo p لحل المسائل التركيبية",
        ],
        capacitiesFr: [
          "Appliquer l'algorithme d'Euclide et le théorème de Bézout dans ℤ",
          "Utiliser les congruences et le petit théorème de Fermat",
        ],
        customQuestionBaremes: [1.0, 1.5, 2.0, 2.5],
        customQuestionLevels: ["N1", "N2", "N3", "N3"],
      },
      customQuestionsAr: [
        "1. حدد حسب قيم العدد الصحيح الطبيعي n باقي القسمة الإقليدية للعدد 3^n على 7.",
        "2. بين أنه لكل n من ℕ، العدد A_n = 3^(2n+1) + 2^(n+2) يقبل القسمة على 7.",
        "3. نعتبر في ℤ² المعادلة (E) : 17x - 7y = 3. حل المعادلة (E) باستعمال مبرهنة غوص وبوزو.",
        "4. ليكن p عدداً أولياً أكبر قطعا من 3. بين أن p² ≡ 1 [24]، واستنتج قابلية قسمة p^4 - 1 على 240 إذا كان p لا يقسم 5.",
      ],
      customQuestionsFr: [
        "1. Déterminer suivant les valeurs de n ∈ ℕ le reste de la division euclidienne de 3^n par 7.",
        "2. Démontrer que pour tout n ∈ ℕ, l'entier A_n = 3^(2n+1) + 2^(n+2) est divisible par 7.",
        "3. Résoudre dans ℤ² l'équation diophantienne (E) : 17x - 7y = 3 à l'aide des théorèmes de Bézout et Gauss.",
        "4. Soit p un nombre premier strictement supérieur à 3. Montrer que p² ≡ 1 [24]. En déduire la divisibilité de p^4 - 1 par 240 lorsque 5 ne divise pas p.",
      ],
      customBaremes: [1.0, 1.5, 2.0, 2.5],
    },
  },
  {
    id: "fav_preset_1bac_sm_logic",
    type: "CUSTOM_EXERCISE",
    titleAr: "تمرين نوعي في مبادئ المنطق والاستدلال بفصل الحالات والخلف",
    titleFr: "Exercice structurant de logique mathématique et raisonnements",
    subtitleAr: "تأسيس الاستدلال الرياضي الدقيق لتلاميذ الأولى باكالوريا",
    trackCode: "1BAC_SM",
    trackLabelAr: "الأولى باكلوريا علوم رياضية",
    semester: "S1",
    dsKey: "DS1",
    tags: ["تمرين مخصص", "منطق", "استدلال بالخلف", "1BAC SM"],
    addedAt: "2026-10-10T14:15:00.000Z",
    createdAt: "2026-10-10T14:15:00.000Z",
    exerciseData: {
      lessonAr: "مبادئ في المنطق الرياضي والاستدلال",
      lessonFr: "Notions de logique mathématique et raisonnements",
      category: "Logic",
      weight: 30,
      defaultBareme: 6.0,
      capacitiesAr: [
        "استعمال الاستدلال بالخلف والاستدلال بالاستلزام العكسي",
        "صياغة براهين رياضية دقيقة بالترجع وفصل الحالات",
      ],
      targetSkills: { n1: 1, n2: 3, n3: 2 },
    },
    payload: {
      lessonData: {
        lessonAr: "مبادئ في المنطق الرياضي والاستدلال",
        lessonFr: "Notions de logique mathématique et raisonnements",
        hours: "14h",
        weight: 30,
        category: "Logic",
        subCategory: "جبر",
        subCategoryFr: "Logique & Ensembles",
        capacitiesAr: [
          "استعمال الاستدلال بالخلف والاستدلال بالاستلزام العكسي",
          "صياغة براهين رياضية دقيقة بالترجع وفصل الحالات",
        ],
        capacitiesFr: [
          "Maîtriser les raisonnements par l'absurde et par contraposée",
          "Formuler des démonstrations rigoureuses par récurrence et disjonction",
        ],
        customQuestionBaremes: [1.0, 1.5, 1.5, 2.0],
        customQuestionLevels: ["N1", "N2", "N2", "N3"],
      },
      customQuestionsAr: [
        "1. بين بالخلف أنه لكل x و y من ℝ⁺ : إذا كان x/(1+y) = y/(1+x) فإن x = y.",
        "2. بين باستعمال الاستلزام المضاد للعكس أنه لكل a و b من ℝ : إذا كان a + b ≠ 4 فإن a ≠ 2 أو b ≠ 2.",
        "3. حل في ℝ المعادلة : √(x + 3) + √(x - 1) = 2 بعد تحديد مجموعة التعريف وفصل الحالات الممكنة.",
        "4. بين بالترجع أنه لكل n من ℕ* : 1² + 2² + 3² + ... + n² = n(n + 1)(2n + 1) / 6.",
      ],
      customQuestionsFr: [
        "1. Démontrer par l'absurde que pour tous réels positifs x et y : si x/(1+y) = y/(1+x) alors x = y.",
        "2. Démontrer par contraposition que pour tous a, b ∈ ℝ : si a + b ≠ 4 alors a ≠ 2 ou b ≠ 2.",
        "3. Résoudre dans ℝ l'équation √(x + 3) + √(x - 1) = 2 par disjonction de cas rigoureuse.",
        "4. Démontrer par récurrence que pour tout n ∈ ℕ* : ∑_{k=1}^n k² = n(n+1)(2n+1)/6.",
      ],
      customBaremes: [1.0, 1.5, 1.5, 2.0],
    },
  },
  {
    id: "fav_preset_tcs_vectors",
    type: "EXAM_BLUEPRINT",
    titleAr: "نموذج فرض محروس محروس رقم 2 — الجذع المشترك العلمي (الحساب المتجهي)",
    titleFr: "Devoir Surveillé N°2 — Tronc Commun Scientifique (Calcul Vectoriel)",
    subtitleAr: "الإسقاط + الحساب المتجهي في المستوى ومجموع المتجهات (20/20)",
    trackCode: "TCS",
    trackLabelAr: "الجذع المشترك العلمي والتكنولوجي",
    semester: "S1",
    dsKey: "DS2",
    tags: ["فرض محروس", "TCS", "متجهات", "إسقاط"],
    addedAt: "2026-11-01T09:00:00.000Z",
    createdAt: "2026-11-01T09:00:00.000Z",
    blueprintData: {
      trackCode: "TCS",
      semester: "S1",
      dsKey: "DS2",
      dsStructureMode: "STANDARD_142_08",
      totalDurationMinutes: 120,
      n1Percentage: 40,
      n2Percentage: 45,
      n3Percentage: 15,
      lessons: [
        {
          lessonAr: "الحساب المتجهي في المستوى",
          lessonFr: "Calcul vectoriel dans le plan",
          weight: 60,
          category: "Geometry",
          capacitiesAr: ["إنشاء متجهات مجموع وتطبيق علاقة شال واستقامية ثلاث نقط"],
        },
        {
          lessonAr: "الإسقاط في المستوى",
          lessonFr: "Projection dans le plan",
          weight: 40,
          category: "Geometry",
          capacitiesAr: ["توظيف خاصية الحفاظ على معامل الاستقامية لحساب مسافات"],
        },
      ],
    },
    payload: {
      descriptionAr: "فرض محروس متوازن وفق المقرر الوزاري للجذع المشترك العلمي",
    },
  },
];

/**
 * جلب قائمة المفضلات من LocalStorage مع دمج النماذج الافتراضية
 */
export function loadPedagogicalFavorites(): FavoritePedagogicalItem[] {
  try {
    if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
      const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) {
        savePedagogicalFavorites(DEFAULT_PRESET_FAVORITES);
        return DEFAULT_PRESET_FAVORITES;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    // ignore
  }
  return DEFAULT_PRESET_FAVORITES;
}

/**
 * حفظ قائمة المفضلات في LocalStorage
 */
export function savePedagogicalFavorites(favorites: FavoritePedagogicalItem[]): void {
  try {
    if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  } catch (err) {
    // ignore
  }
}

/**
 * التحقق مما إذا كان عنصر معيناً مفضلاً
 * يدعم الاستدعاء الثنائي: isItemInFavorites(favs, id)
 * أو الثلاثي: isItemInFavorites(favs, type, id)
 */
export function isItemInFavorites(
  favorites: FavoritePedagogicalItem[],
  typeOrId: string,
  maybeId?: string
): boolean {
  if (!Array.isArray(favorites)) return false;
  const targetId = maybeId || typeOrId;
  const targetType = maybeId ? typeOrId : undefined;

  return favorites.some((f) => {
    if (targetType && f.type !== targetType) return false;
    if (f.id === targetId) return true;
    if (f.exerciseData && `EX_${f.trackCode}_${f.exerciseData.lessonFr}` === targetId) return true;
    if (f.blueprintData && `BP_${f.trackCode}_${f.semester}_${f.blueprintData.dsKey || f.dsKey}` === targetId) return true;
    if (f.payload?.lessonData?.lessonFr === targetId) return true;
    if (`${f.trackCode}_${f.semester}_${f.dsKey}` === targetId) return true;
    return false;
  });
}

/**
 * إضافة أو إزالة عنصر من المفضلة
 * يدعم الاستدعاء المرن:
 * 1) toggleFavoriteItem(item) -> يعيد قائمة العناصر المحدثة
 * 2) toggleFavoriteItem(currentFavorites, item) -> يعيد كائن يحتوي updatedFavorites و added
 */
export function toggleFavoriteItem(
  currentFavoritesOrItem: FavoritePedagogicalItem[] | Omit<FavoritePedagogicalItem, "addedAt">,
  maybeItem?: Omit<FavoritePedagogicalItem, "addedAt">
): any {
  let currentFavorites: FavoritePedagogicalItem[];
  let item: Omit<FavoritePedagogicalItem, "addedAt">;
  const isTwoArgs = Array.isArray(currentFavoritesOrItem) && maybeItem !== undefined;

  if (isTwoArgs) {
    currentFavorites = currentFavoritesOrItem as FavoritePedagogicalItem[];
    item = maybeItem as Omit<FavoritePedagogicalItem, "addedAt">;
  } else {
    currentFavorites = loadPedagogicalFavorites();
    item = currentFavoritesOrItem as Omit<FavoritePedagogicalItem, "addedAt">;
  }

  const existingIndex = currentFavorites.findIndex((f) => {
    if (f.id === item.id) return true;
    if (
      item.type === "EXAM_BLUEPRINT" &&
      f.type === "EXAM_BLUEPRINT" &&
      f.trackCode === item.trackCode &&
      f.semester === item.semester &&
      f.dsKey === item.dsKey
    ) {
      return true;
    }
    if (
      item.type === "CUSTOM_EXERCISE" &&
      f.type === "CUSTOM_EXERCISE" &&
      f.trackCode === item.trackCode &&
      (f.exerciseData?.lessonFr === item.exerciseData?.lessonFr ||
        f.payload?.lessonData?.lessonFr === item.payload?.lessonData?.lessonFr)
    ) {
      return true;
    }
    return false;
  });

  let updated: FavoritePedagogicalItem[];
  let added: boolean;

  if (existingIndex >= 0) {
    updated = currentFavorites.filter((_, idx) => idx !== existingIndex);
    added = false;
  } else {
    const newFav: FavoritePedagogicalItem = {
      ...item,
      addedAt: (item as any).addedAt || new Date().toISOString(),
      createdAt: (item as any).createdAt || new Date().toISOString(),
    };
    updated = [newFav, ...currentFavorites];
    added = true;
  }

  savePedagogicalFavorites(updated);

  if (isTwoArgs) {
    const result = [...updated] as any;
    result.updatedFavorites = updated;
    result.added = added;
    return result;
  }

  return updated;
}
