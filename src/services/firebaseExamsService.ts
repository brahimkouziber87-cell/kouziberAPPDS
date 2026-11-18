import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { LessonItem } from "../data/curriculum";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const firebaseAuth = getAuth(app);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth.currentUser?.uid,
      email: firebaseAuth.currentUser?.email,
      emailVerified: firebaseAuth.currentUser?.emailVerified,
      isAnonymous: firebaseAuth.currentUser?.isAnonymous,
      tenantId: firebaseAuth.currentUser?.tenantId,
      providerInfo:
        firebaseAuth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let connectionTested = false;
export async function testFirestoreConnection(): Promise<boolean> {
  if (connectionTested) return true;
  try {
    await getDocFromServer(doc(firestoreDb, "test", "connection"));
    connectionTested = true;
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.error("Please check your Firebase configuration.");
      return false;
    }
    connectionTested = true;
    return true;
  }
}

export type SavedExamDocumentType =
  | "DS_142_08"
  | "DM_SERIE"
  | "FICHE_OP2007"
  | "DIAGNOSTIC"
  | "EXAMEN_BLANC"
  | "IMPORTED_TEX";

export type SavedExamSourceOrigin =
  | "STUDIO_GENERATED"
  | "IMPORTED_TEX"
  | "EXAMEN_BLANC";

export interface SavedExamRecord {
  id: string;
  ownerId: string;
  ownerEmail: string;
  titleAr: string;
  titleFr: string;
  documentType: SavedExamDocumentType;
  trackCode: string;
  trackLabelAr: string;
  semester: 1 | 2;
  examKey: string;
  examModel: "A" | "B";
  duration: string;
  totalPoints: number;
  totalQuestions: number;
  totalSubQuestions: number;
  n1: number;
  n2: number;
  n3: number;
  school: string;
  professor: string;
  academicYear: string;
  latexSource: string;
  lessonsJson: string;
  isFavorite: boolean;
  sourceOrigin: SavedExamSourceOrigin;
  createdAtIso: string;
  updatedAtIso: string;
  syncedToCloud?: boolean;
}

const LOCAL_MIRROR_KEY = "math_platform_firebase_exams_mirror_v1";

export function loadLocalSavedExamsMirror(): SavedExamRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_MIRROR_KEY);
    if (!raw) return getDefaultSeedExams();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getDefaultSeedExams();
    }
    return parsed;
  } catch {
    return getDefaultSeedExams();
  }
}

export function saveLocalSavedExamsMirror(exams: SavedExamRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_MIRROR_KEY, JSON.stringify(exams));
  } catch {
    // ignore storage quota errors
  }
}

function getDefaultSeedExams(): SavedExamRecord[] {
  const nowIso = new Date().toISOString();
  const sampleLessons: LessonItem[] = [
    {
      lessonAr: "الاتصال والاشتقاق ودراسة الدوال",
      lessonFr: "Continuité, dérivabilité et étude de fonctions",
      hours: "14h",
      weight: 60,
      capacitiesAr: [
        "دراسة اتصال دالة عددية على مجال وحساب النهايات",
        "توظيف مبرهنة القيم الوسيطية والاشتقاق في تأطير الحلول",
      ],
      capacitiesFr: [
        "Étudier la continuité sur un intervalle",
        "Appliquer le TVI et la dérivabilité",
      ],
      sampleExerciseAr: [
        "1) نعتبر الدالة $f(x) = x^3 - 3x + 1$ المعرفة على $\\mathbb{R}$. أ) أحسب النهايتين عند $+\\infty$ و$-\\infty$. ب) أدرس تغيرات $f$ وضع جدول تغيراتها.",
        "2) أ) بين أن المعادلة $f(x)=0$ تقبل حلاً وحيداً $\\alpha$ في المجال $]0,1[$. ب) استنتج إشارة $f(x)$ على المجال $[0,+\\infty[$.",
      ],
      sampleExerciseFr: [
        "1) Soit $f(x) = x^3 - 3x + 1$ sur $\\mathbb{R}$. a) Calculer les limites en $\\pm\\infty$. b) Dresser le tableau de variations de $f$.",
        "2) a) Montrer que $f(x)=0$ admet une unique solution $\\alpha \\in ]0,1[$. b) En déduire le signe de $f(x)$.",
      ],
    },
    {
      lessonAr: "المتتاليات العددية",
      lessonFr: "Suites numériques",
      hours: "10h",
      weight: 40,
      capacitiesAr: [
        "البرهان بالترجع ودراسة رتابة متتالية ترجعية",
        "تحديد نهاية متتالية مرتبطة بدالة متصلة $u_{n+1}=f(u_n)$",
      ],
      capacitiesFr: [
        "Raisonnement par récurrence et monotonie",
        "Limite d'une suite récurrente $u_{n+1}=f(u_n)$",
      ],
      sampleExerciseAr: [
        "1) لتكن $(u_n)$ المتتالية المعرفة بـ $u_0 = \\frac{1}{2}$ و $u_{n+1} = f(u_n)$. أ) بين بالترجع أن $0 < u_n < 1$ لكل $n \\in \\mathbb{N}$.",
        "2) أ) بين أن المتتالية $(u_n)$ تناقصية قطعا. ب) استنتج أنها متقاربة وحدد نهايتها.",
      ],
      sampleExerciseFr: [
        "1) Soit $(u_n)$ définie par $u_0 = \\frac{1}{2}$ et $u_{n+1} = f(u_n)$. a) Montrer par récurrence que $0 < u_n < 1$.",
        "2) a) Montrer que $(u_n)$ est décroissante. b) En déduire qu'elle converge et déterminer sa limite.",
      ],
    },
  ];

  return [
    {
      id: "exam_seed_2bac_pc_s1_f1",
      ownerId: "local_teacher",
      ownerEmail: "teacher@men.gov.ma",
      titleAr: "الفرض المحروس رقم 1 - الدورة الأولى (نموذج مرجعي 142-08)",
      titleFr: "Devoir Surveillé N°1 - Semestre 1 (Modèle 142-08)",
      documentType: "DS_142_08",
      trackCode: "2BAC_PC",
      trackLabelAr: "الثانية باكالوريا علوم فيزيائية (2BAC PC)",
      semester: 1,
      examKey: "S1_F1",
      examModel: "A",
      duration: "2h",
      totalPoints: 20,
      totalQuestions: 4,
      totalSubQuestions: 8,
      n1: 30,
      n2: 50,
      n3: 20,
      school: "الثانوية التأهيلية محمد الخامس",
      professor: "ذ. إبراهيم كوزيبر",
      academicYear: "2025/2026",
      latexSource: `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb,tcolorbox}
\\begin{document}
\\section*{الفرض المحروس رقم 1 - الدورة الأولى (2BAC PC)}
\\begin{exoBox}{التمرين الأول: الاتصال والاشتقاق (12 ن)}
\\item[\\textbf{أ)}] أحسب النهايتين عند $+\\infty$ و$-\\infty$ للدالة $f(x) = x^3 - 3x + 1$. \\hfill{\\small\\textbf{(1.5 ن)}}
\\item[\\textbf{ب)}] أدرس تغيرات الدالة $f$ وضع جدول تغيراتها على $\\mathbb{R}$. \\hfill{\\small\\textbf{(2.5 ن)}}
\\end{exoBox}
\\end{document}`,
      lessonsJson: JSON.stringify(sampleLessons),
      isFavorite: true,
      sourceOrigin: "STUDIO_GENERATED",
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
      syncedToCloud: false,
    },
  ];
}

export function sanitizeExamId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
  return cleaned || `exam_${Date.now()}`;
}

export interface CreateSavedExamInput {
  id?: string;
  titleAr: string;
  titleFr: string;
  documentType: SavedExamDocumentType;
  trackCode: string;
  trackLabelAr: string;
  semester: 1 | 2;
  examKey: string;
  examModel: "A" | "B";
  duration: string;
  totalPoints: number;
  totalQuestions: number;
  totalSubQuestions: number;
  n1: number;
  n2: number;
  n3: number;
  school: string;
  professor: string;
  academicYear: string;
  latexSource: string;
  lessons: LessonItem[];
  isFavorite?: boolean;
  sourceOrigin: SavedExamSourceOrigin;
}

/**
 * التحقق من صحة حمولة الفرض قبل إرسالها إلى Firestore لضمان التطابق التام مع firestore.rules
 */
export function buildValidatedFirestoreExamPayload(
  input: CreateSavedExamInput,
  uid: string,
  email: string
): {
  id: string;
  record: SavedExamRecord;
} {
  const examId = sanitizeExamId(
    input.id ||
      `exam_${input.trackCode}_${input.examKey}_${Date.now().toString(36)}`
  );
  const nowIso = new Date().toISOString();
  const safeLessonsJson = JSON.stringify(input.lessons || []).slice(0, 240000);
  const safeLatex = (
    input.latexSource?.trim() || "% Empty LaTeX Document"
  ).slice(0, 240000);

  const record: SavedExamRecord = {
    id: examId,
    ownerId: uid,
    ownerEmail: (email || "teacher@men.gov.ma").slice(0, 250),
    titleAr: (input.titleAr?.trim() || "فرض محروس في الرياضيات").slice(0, 290),
    titleFr: (input.titleFr?.trim() || "Devoir Surveillé de Mathématiques").slice(
      0,
      290
    ),
    documentType: input.documentType || "DS_142_08",
    trackCode: (input.trackCode?.trim() || "2BAC_PC").slice(0, 38),
    trackLabelAr: (input.trackLabelAr?.trim() || "الثانية باكالوريا").slice(
      0,
      155
    ),
    semester: input.semester === 2 ? 2 : 1,
    examKey: (input.examKey?.trim() || "S1_F1").slice(0, 38),
    examModel: input.examModel === "B" ? "B" : "A",
    duration: (input.duration?.trim() || "2h").slice(0, 28),
    totalPoints: Math.min(100, Math.max(0, Number(input.totalPoints) || 20)),
    totalQuestions: Math.min(
      200,
      Math.max(0, Number(input.totalQuestions) || 1)
    ),
    totalSubQuestions: Math.min(
      500,
      Math.max(0, Number(input.totalSubQuestions) || 0)
    ),
    n1: Math.min(100, Math.max(0, Number(input.n1) || 30)),
    n2: Math.min(100, Math.max(0, Number(input.n2) || 50)),
    n3: Math.min(100, Math.max(0, Number(input.n3) || 20)),
    school: (input.school || "الثانوية التأهيلية").slice(0, 195),
    professor: (input.professor || "أستاذ المادة").slice(0, 195),
    academicYear: (input.academicYear || "2025/2026").slice(0, 28),
    latexSource: safeLatex,
    lessonsJson: safeLessonsJson.length >= 2 ? safeLessonsJson : "[]",
    isFavorite: Boolean(input.isFavorite),
    sourceOrigin: input.sourceOrigin || "STUDIO_GENERATED",
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    syncedToCloud: Boolean(firebaseAuth.currentUser),
  };

  return { id: examId, record };
}

/**
 * حفظ فرض منجز أو مستورد في قاعدة بيانات Firebase Firestore (مع نسخة محلية احتياطية فورية)
 */
export async function saveExamToFirebaseFirestore(
  input: CreateSavedExamInput
): Promise<SavedExamRecord> {
  const currentUser = firebaseAuth.currentUser;
  const uid = currentUser?.uid || "local_teacher";
  const email = currentUser?.email || "teacher@men.gov.ma";

  const { id, record } = buildValidatedFirestoreExamPayload(input, uid, email);

  // تحديث المرآة المحلية فوراً لضمان سرعة الاستجابة
  const localList = loadLocalSavedExamsMirror();
  const filtered = localList.filter((item) => item.id !== id);
  const updatedLocal = [record, ...filtered];
  saveLocalSavedExamsMirror(updatedLocal);

  if (!currentUser) {
    return { ...record, syncedToCloud: false };
  }

  const docPath = `saved_exams/${id}`;
  const docRef = doc(firestoreDb, "saved_exams", id);
  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      await updateDoc(docRef, {
        titleAr: record.titleAr,
        titleFr: record.titleFr,
        documentType: record.documentType,
        trackCode: record.trackCode,
        trackLabelAr: record.trackLabelAr,
        semester: record.semester,
        examKey: record.examKey,
        examModel: record.examModel,
        duration: record.duration,
        totalPoints: record.totalPoints,
        totalQuestions: record.totalQuestions,
        totalSubQuestions: record.totalSubQuestions,
        n1: record.n1,
        n2: record.n2,
        n3: record.n3,
        school: record.school,
        professor: record.professor,
        academicYear: record.academicYear,
        latexSource: record.latexSource,
        lessonsJson: record.lessonsJson,
        isFavorite: record.isFavorite,
        sourceOrigin: record.sourceOrigin,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        id: record.id,
        ownerId: record.ownerId,
        ownerEmail: record.ownerEmail,
        titleAr: record.titleAr,
        titleFr: record.titleFr,
        documentType: record.documentType,
        trackCode: record.trackCode,
        trackLabelAr: record.trackLabelAr,
        semester: record.semester,
        examKey: record.examKey,
        examModel: record.examModel,
        duration: record.duration,
        totalPoints: record.totalPoints,
        totalQuestions: record.totalQuestions,
        totalSubQuestions: record.totalSubQuestions,
        n1: record.n1,
        n2: record.n2,
        n3: record.n3,
        school: record.school,
        professor: record.professor,
        academicYear: record.academicYear,
        latexSource: record.latexSource,
        lessonsJson: record.lessonsJson,
        isFavorite: record.isFavorite,
        sourceOrigin: record.sourceOrigin,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    const syncedRecord = { ...record, syncedToCloud: true };
    saveLocalSavedExamsMirror([
      syncedRecord,
      ...loadLocalSavedExamsMirror().filter((x) => x.id !== id),
    ]);
    return syncedRecord;
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.WRITE,
      docPath
    );
  }
}

/**
 * تبديل حالة المفضلة لفرض محفوظ في Firebase Firestore
 */
export async function toggleSavedExamFavorite(
  exam: SavedExamRecord
): Promise<SavedExamRecord> {
  const updated: SavedExamRecord = {
    ...exam,
    isFavorite: !exam.isFavorite,
    updatedAtIso: new Date().toISOString(),
  };

  const localList = loadLocalSavedExamsMirror().map((item) =>
    item.id === exam.id ? updated : item
  );
  saveLocalSavedExamsMirror(localList);

  const currentUser = firebaseAuth.currentUser;
  if (!currentUser || !exam.syncedToCloud) {
    return updated;
  }

  const docPath = `saved_exams/${exam.id}`;
  try {
    await updateDoc(doc(firestoreDb, "saved_exams", exam.id), {
      isFavorite: updated.isFavorite,
      updatedAt: serverTimestamp(),
    });
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * حذف فرض من قاعدة بيانات Firebase Firestore ومن المرآة المحلية
 */
export async function deleteSavedExamFromFirebase(
  examId: string
): Promise<void> {
  const localList = loadLocalSavedExamsMirror().filter(
    (item) => item.id !== examId
  );
  saveLocalSavedExamsMirror(localList);

  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) return;

  const docPath = `saved_exams/${examId}`;
  try {
    await deleteDoc(doc(firestoreDb, "saved_exams", examId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * مزامنة جميع الفروض المحفوظة محلياً إلى قاعدة بيانات Firebase Firestore بنقرة واحدة بعد تسجيل الدخول
 */
export async function syncAllLocalExamsToFirebase(): Promise<number> {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) return 0;

  const localExams = loadLocalSavedExamsMirror();
  let syncedCount = 0;

  for (const item of localExams) {
    let parsedLessons: LessonItem[] = [];
    try {
      parsedLessons = JSON.parse(item.lessonsJson || "[]");
    } catch {
      parsedLessons = [];
    }
    await saveExamToFirebaseFirestore({
      id: item.id,
      titleAr: item.titleAr,
      titleFr: item.titleFr,
      documentType: item.documentType,
      trackCode: item.trackCode,
      trackLabelAr: item.trackLabelAr,
      semester: item.semester,
      examKey: item.examKey,
      examModel: item.examModel,
      duration: item.duration,
      totalPoints: item.totalPoints,
      totalQuestions: item.totalQuestions,
      totalSubQuestions: item.totalSubQuestions,
      n1: item.n1,
      n2: item.n2,
      n3: item.n3,
      school: item.school,
      professor: item.professor,
      academicYear: item.academicYear,
      latexSource: item.latexSource,
      lessons: parsedLessons,
      isFavorite: item.isFavorite,
      sourceOrigin: item.sourceOrigin,
    });
    syncedCount++;
  }

  return syncedCount;
}

/**
 * الاشتراك الحي (Real-time Listener) في الفروض المحفوظة للمستخدم في Firebase Firestore
 */
export function subscribeToUserSavedExams(
  onUpdate: (exams: SavedExamRecord[], isCloudActive: boolean) => void,
  onError?: (errMessage: string) => void
): () => void {
  testFirestoreConnection().catch(() => {});

  let unsubscribeSnapshot: (() => void) | null = null;

  const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user: User | null) => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }

    if (!user) {
      onUpdate(loadLocalSavedExamsMirror(), false);
      return;
    }

    const examsQuery = query(
      collection(firestoreDb, "saved_exams"),
      where("ownerId", "==", user.uid)
    );

    unsubscribeSnapshot = onSnapshot(
      examsQuery,
      (snapshot) => {
        const cloudExams: SavedExamRecord[] = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            const createdTs = data.createdAt as Timestamp | undefined;
            const updatedTs = data.updatedAt as Timestamp | undefined;
            return {
              id: String(data.id || docSnap.id),
              ownerId: String(data.ownerId || user.uid),
              ownerEmail: String(data.ownerEmail || user.email || ""),
              titleAr: String(data.titleAr || "فرض محروس"),
              titleFr: String(data.titleFr || "Devoir Surveillé"),
              documentType:
                (data.documentType as SavedExamDocumentType) || "DS_142_08",
              trackCode: String(data.trackCode || "2BAC_PC"),
              trackLabelAr: String(data.trackLabelAr || "الثانية باكالوريا"),
              semester: (data.semester === 2 ? 2 : 1) as 1 | 2,
              examKey: String(data.examKey || "S1_F1"),
              examModel: (data.examModel === "B" ? "B" : "A") as "A" | "B",
              duration: String(data.duration || "2h"),
              totalPoints: Number(data.totalPoints ?? 20),
              totalQuestions: Number(data.totalQuestions ?? 1),
              totalSubQuestions: Number(data.totalSubQuestions ?? 0),
              n1: Number(data.n1 ?? 30),
              n2: Number(data.n2 ?? 50),
              n3: Number(data.n3 ?? 20),
              school: String(data.school || ""),
              professor: String(data.professor || ""),
              academicYear: String(data.academicYear || "2025/2026"),
              latexSource: String(data.latexSource || ""),
              lessonsJson: String(data.lessonsJson || "[]"),
              isFavorite: Boolean(data.isFavorite),
              sourceOrigin:
                (data.sourceOrigin as SavedExamSourceOrigin) ||
                "STUDIO_GENERATED",
              createdAtIso: createdTs?.toDate
                ? createdTs.toDate().toISOString()
                : new Date().toISOString(),
              updatedAtIso: updatedTs?.toDate
                ? updatedTs.toDate().toISOString()
                : new Date().toISOString(),
              syncedToCloud: true,
            };
          })
          .sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso));

        // دمج الفروض السحابية مع أي فروض محلية لم تتم مزامنتها بعد
        const localOnly = loadLocalSavedExamsMirror().filter(
          (loc) => !cloudExams.some((c) => c.id === loc.id)
        );
        const merged = [...cloudExams, ...localOnly];
        saveLocalSavedExamsMirror(merged);
        onUpdate(merged, true);
      },
      (err) => {
        console.error("Firestore subscription error:", err);
        if (onError) {
          onError(err.message);
        }
        onUpdate(loadLocalSavedExamsMirror(), false);
      }
    );
  });

  return () => {
    if (unsubscribeSnapshot) unsubscribeSnapshot();
    unsubscribeAuth();
  };
}

/**
 * تسجيل الدخول السريع بحساب Google للوصول إلى قاعدة بيانات Firebase Firestore
 */
export async function signInToFirebaseForExams(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(firebaseAuth, provider);
  return result.user;
}
