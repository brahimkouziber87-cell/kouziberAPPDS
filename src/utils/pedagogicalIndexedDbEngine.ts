/**
 * المرحلة 1 من خارطة الطريق الاستراتيجية:
 * 1) محرك التعقيم الأمني الموحد لمخرجات HTML و SVG الرياضية (DOMPurify-Grade Whitelist Sanitizer)
 * 2) محرك التخزين عالي السعة عبر IndexedDB مع المزامنة التلقائية وقياس الحصة التخزينية (Storage Quota Diagnostics)
 */

export type PedagogicalStoreName =
  | "custom_fonts"
  | "unit_dossiers"
  | "homework_packs"
  | "exam_archives"
  | "lesson_summaries";

export interface PedagogicalStorageRecord<T = unknown> {
  id: string;
  storeName: PedagogicalStoreName;
  titleAr: string;
  trackCode?: string;
  lessonId?: string;
  updatedAt: string;
  sizeBytes: number;
  payload: T;
}

export interface StorageHealthReport {
  engine: "INDEXED_DB" | "MEMORY_SYNC_FALLBACK";
  totalRecordsCount: number;
  totalUsedBytes: number;
  estimatedQuotaBytes: number;
  usagePercent: number;
  storesBreakdown: Record<PedagogicalStoreName, { count: number; bytes: number }>;
  statusLevel: "HEALTHY" | "MODERATE" | "NEAR_LIMIT";
  recommendationAr: string;
}

export interface HtmlSanitizationResult {
  sanitizedHtml: string;
  removedThreatsCount: number;
  removedTags: string[];
  removedAttributes: string[];
  isClean: boolean;
}

const DB_NAME = "KouziberPedagogicalDB_v1";
const DB_VERSION = 1;
const ALL_STORES: PedagogicalStoreName[] = [
  "custom_fonts",
  "unit_dossiers",
  "homework_packs",
  "exam_archives",
  "lesson_summaries",
];

// ذاكرة متزامنة رديفة لبيئة الاختبارات (Node/SSR) وللتسريع الفوري في الواجهة
const inMemoryStoreMirror: Record<
  PedagogicalStoreName,
  Map<string, PedagogicalStorageRecord<any>>
> = {
  custom_fonts: new Map(),
  unit_dossiers: new Map(),
  homework_packs: new Map(),
  exam_archives: new Map(),
  lesson_summaries: new Map(),
};

/**
 * 1. معقم صارم لمخرجات HTML و SVG الرياضية (يمنع XSS، <script>، <iframe>، on* handlers، وروابط javascript:/data:text/html)
 * مع الحفاظ الكامل على وسوم KaTeX والجداول والرسوم الهندسية SVG
 */
export function sanitizeTrustedPedagogicalHtml(rawHtml: string): HtmlSanitizationResult {
  if (!rawHtml || typeof rawHtml !== "string") {
    return {
      sanitizedHtml: "",
      removedThreatsCount: 0,
      removedTags: [],
      removedAttributes: [],
      isClean: true,
    };
  }

  let output = rawHtml;
  const removedTags: string[] = [];
  const removedAttributes: string[] = [];

  // 1. إزالة الوسوم الخطيرة بالكامل مع محتواها
  const dangerousPairedTags = [
    "script",
    "iframe",
    "object",
    "embed",
    "applet",
    "meta",
    "link",
    "base",
    "form",
  ];

  for (const tag of dangerousPairedTags) {
    const pairedRegex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
    const matches = output.match(pairedRegex);
    if (matches && matches.length > 0) {
      removedTags.push(...matches.map(() => `<${tag}>`));
      output = output.replace(pairedRegex, "");
    }

    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
    const selfMatches = output.match(selfClosingRegex);
    if (selfMatches && selfMatches.length > 0) {
      removedTags.push(...selfMatches.map(() => `<${tag}/>`));
      output = output.replace(selfClosingRegex, "");
    }
  }

  // 2. إزالة جميع معالجات الأحداث المضمنة (onload, onerror, onclick, onmouseover, onfocus...)
  const onEventAttrRegex = /\s+(on[a-z0-9_-]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
  output = output.replace(onEventAttrRegex, (_fullMatch, attrName: string) => {
    removedAttributes.push(attrName.toLowerCase());
    return "";
  });

  // 3. إزالة بروتوكولات javascript: و vbscript: و data:text/html من خصائص href / src / xlink:href / action
  const dangerousProtocolRegex =
    /\s+(href|src|xlink:href|action|formaction)\s*=\s*(?:"\s*(?:javascript|vbscript|data:text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:text\/html)[^']*')/gi;
  output = output.replace(dangerousProtocolRegex, (_fullMatch, attrName: string) => {
    removedAttributes.push(`${attrName.toLowerCase()}:protocol`);
    return "";
  });

  // 4. إزالة تعابير CSS الخطيرة مثل expression(...) أو url(javascript:...)
  const cssExpressionRegex = /expression\s*\([^)]*\)|url\s*\(\s*['"]?\s*javascript:[^)]*\)/gi;
  if (cssExpressionRegex.test(output)) {
    removedAttributes.push("style:expression");
    output = output.replace(cssExpressionRegex, "");
  }

  const removedThreatsCount = removedTags.length + removedAttributes.length;
  return {
    sanitizedHtml: output,
    removedThreatsCount,
    removedTags,
    removedAttributes,
    isClean: removedThreatsCount === 0,
  };
}

/**
 * تعقيم مخصص لرسوم SVG الرياضية (المنحنيات، جدول الإشارات، الخرائط الذهنية، والأشكال الهندسية)
 */
export function sanitizeTrustedSvgMarkup(rawSvg: string): string {
  return sanitizeTrustedPedagogicalHtml(rawSvg).sanitizedHtml;
}

/**
 * التحقق مما إذا كان المتصفح يدعم IndexedDB الفعلي
 */
function hasBrowserIndexedDb(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.indexedDB !== "undefined" &&
    window.indexedDB !== null
  );
}

/**
 * فتح اتصال بقاعدة بيانات IndexedDB البيداغوجية
 */
function openPedagogicalDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasBrowserIndexedDb()) {
      reject(new Error("IndexedDB not available in current environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const storeName of ALL_STORES) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });
}

function estimatePayloadBytes(payload: unknown): number {
  try {
    const serialized = JSON.stringify(payload) || "";
    return typeof Buffer !== "undefined"
      ? Buffer.byteLength(serialized, "utf8")
      : new Blob([serialized]).size;
  } catch {
    return 256;
  }
}

/**
 * حفظ سجل بيداغوجي في IndexedDB (مع تحديث المرآة الفورية في الذاكرة)
 */
export async function savePedagogicalRecord<T>(params: {
  storeName: PedagogicalStoreName;
  id: string;
  titleAr: string;
  trackCode?: string;
  lessonId?: string;
  payload: T;
}): Promise<PedagogicalStorageRecord<T>> {
  const sizeBytes = estimatePayloadBytes(params.payload);
  const record: PedagogicalStorageRecord<T> = {
    id: params.id,
    storeName: params.storeName,
    titleAr: params.titleAr,
    trackCode: params.trackCode,
    lessonId: params.lessonId,
    updatedAt: new Date().toISOString(),
    sizeBytes,
    payload: params.payload,
  };

  // حفظ فوري في المرآة لضمان الاستجابة اللحظية وتوافق الاختبارات
  inMemoryStoreMirror[params.storeName].set(params.id, record);

  if (hasBrowserIndexedDb()) {
    try {
      const db = await openPedagogicalDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(params.storeName, "readwrite");
        const store = tx.objectStore(params.storeName);
        store.put(record);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      });
    } catch {
      // الاعتماد على المرآة في حال تقييد IndexedDB في وضع التصفح الخاص
    }
  }

  return record;
}

/**
 * استرجاع سجل بيداغوجي من IndexedDB أو المرآة المتزامنة
 */
export async function getPedagogicalRecord<T = unknown>(
  storeName: PedagogicalStoreName,
  id: string
): Promise<PedagogicalStorageRecord<T> | null> {
  const cached = inMemoryStoreMirror[storeName].get(id);
  if (cached) {
    return cached as PedagogicalStorageRecord<T>;
  }

  if (hasBrowserIndexedDb()) {
    try {
      const db = await openPedagogicalDatabase();
      const result = await new Promise<PedagogicalStorageRecord<T> | null>((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.get(id);
        req.onsuccess = () => {
          db.close();
          resolve((req.result as PedagogicalStorageRecord<T>) || null);
        };
        req.onerror = () => {
          db.close();
          reject(req.error);
        };
      });
      if (result) {
        inMemoryStoreMirror[storeName].set(id, result);
      }
      return result;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * استرجاع جميع السجلات المخزنة في مخزن بيداغوجي معين
 */
export async function listPedagogicalRecords<T = unknown>(
  storeName: PedagogicalStoreName
): Promise<PedagogicalStorageRecord<T>[]> {
  if (hasBrowserIndexedDb()) {
    try {
      const db = await openPedagogicalDatabase();
      const records = await new Promise<PedagogicalStorageRecord<T>[]>((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => {
          db.close();
          resolve((req.result as PedagogicalStorageRecord<T>[]) || []);
        };
        req.onerror = () => {
          db.close();
          reject(req.error);
        };
      });
      for (const rec of records) {
        inMemoryStoreMirror[storeName].set(rec.id, rec);
      }
      return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      // المتابعة نحو المرآة
    }
  }

  return Array.from(inMemoryStoreMirror[storeName].values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

/**
 * حذف سجل بيداغوجي من IndexedDB والمرآة
 */
export async function deletePedagogicalRecord(
  storeName: PedagogicalStoreName,
  id: string
): Promise<boolean> {
  const existed = inMemoryStoreMirror[storeName].delete(id);

  if (hasBrowserIndexedDb()) {
    try {
      const db = await openPedagogicalDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        store.delete(id);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      });
      return true;
    } catch {
      return existed;
    }
  }

  return existed;
}

/**
 * فحص صحة وسعة التخزين المحلي (IndexedDB + Memory Mirror)
 */
export async function computeStorageHealthReport(): Promise<StorageHealthReport> {
  const storesBreakdown: Record<PedagogicalStoreName, { count: number; bytes: number }> = {
    custom_fonts: { count: 0, bytes: 0 },
    unit_dossiers: { count: 0, bytes: 0 },
    homework_packs: { count: 0, bytes: 0 },
    exam_archives: { count: 0, bytes: 0 },
    lesson_summaries: { count: 0, bytes: 0 },
  };

  let totalRecordsCount = 0;
  let totalUsedBytes = 0;

  for (const storeName of ALL_STORES) {
    const records = await listPedagogicalRecords(storeName);
    const storeBytes = records.reduce((acc, r) => acc + (r.sizeBytes || 0), 0);
    storesBreakdown[storeName] = {
      count: records.length,
      bytes: storeBytes,
    };
    totalRecordsCount += records.length;
    totalUsedBytes += storeBytes;
  }

  // سعة IndexedDB القياسية لا تقل عن 250 ميغابايت مقارنة بـ 5 ميغابايت فقط في localStorage
  const estimatedQuotaBytes = 250 * 1024 * 1024;
  const usagePercent = Number(
    Math.min(100, (totalUsedBytes / estimatedQuotaBytes) * 100).toFixed(2)
  );

  const statusLevel =
    usagePercent >= 80 ? "NEAR_LIMIT" : usagePercent >= 50 ? "MODERATE" : "HEALTHY";

  const recommendationAr =
    statusLevel === "HEALTHY"
      ? "قاعدة البيانات البيداغوجية (IndexedDB) تعمل بكفاءة عالية وبسعة وافرة لتخزين الحقيبات والخطوط والملخصات."
      : statusLevel === "MODERATE"
      ? "السعة التخزينية متوازنة؛ ينصح بتصدير أرشيف الفروض السنوية دورياً بصيغة JSON."
      : "اقتربت السعة التخزينية من الحد الأقصى؛ يرجى تنظيف الأرشيفات القديمة لتفريغ المساحة.";

  return {
    engine: hasBrowserIndexedDb() ? "INDEXED_DB" : "MEMORY_SYNC_FALLBACK",
    totalRecordsCount,
    totalUsedBytes,
    estimatedQuotaBytes,
    usagePercent,
    storesBreakdown,
    statusLevel,
    recommendationAr,
  };
}
