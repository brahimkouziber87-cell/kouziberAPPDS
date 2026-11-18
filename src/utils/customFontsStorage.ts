/**
 * محرك رفع وتخزين الخطوط المخصصة (.ttf / .otf) محلياً لترويسة وعناوين الفروض والوثائق
 * يدعم التحقق من الترويسة الثنائية لملفات TrueType / OpenType، التخزين المحلي، وحقن قواعد @font-face ديناميكياً.
 */

export const CUSTOM_UPLOADED_FONTS_STORAGE_KEY =
  "pedagogical_custom_title_fonts_v1";

export const CUSTOM_UPLOADED_FONTS_STYLE_ELEMENT_ID =
  "custom-uploaded-title-fonts-stylesheet";

export const MAX_CUSTOM_FONT_FILE_BYTES = 4 * 1024 * 1024; // 4 MB max per font file
export const MAX_STORED_CUSTOM_FONTS = 8;

export type CustomFontFormat = "truetype" | "opentype";

export interface CustomUploadedFontItem {
  id: string;
  name: string;
  fontFamilyCssName: string;
  fileName: string;
  format: CustomFontFormat;
  mimeType: string;
  dataUrl: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface CustomFontValidationResult {
  valid: boolean;
  format?: CustomFontFormat;
  mimeType?: string;
  sanitizedDisplayName?: string;
  errorAr?: string;
}

/**
 * استخراج اسم عرض نظيف ومقروء من اسم ملف الخط (.ttf أو .otf)
 */
export function deriveCleanFontDisplayName(
  fileName: string,
  customLabel?: string
): string {
  if (customLabel && customLabel.trim().length > 0) {
    return customLabel.trim().slice(0, 60);
  }
  const withoutExt = (fileName || "CustomFont")
    .replace(/\.(ttf|otf)$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return (withoutExt || "خط مخصص").slice(0, 60);
}

/**
 * التحقق من امتداد وتوقيع ملف الخط (.ttf أو .otf) وحجمه قبل تخزينه محلياً
 */
export function validateCustomFontFile(params: {
  fileName: string;
  sizeBytes: number;
  headerBytes?: Uint8Array;
  dataUrl?: string;
}): CustomFontValidationResult {
  const { fileName, sizeBytes, headerBytes, dataUrl } = params;
  const trimmedName = (fileName || "").trim();

  if (!trimmedName) {
    return {
      valid: false,
      errorAr: "يرجى اختيار ملف خط صالح بصيغة .ttf أو .otf.",
    };
  }

  const lower = trimmedName.toLowerCase();
  const isTtf = lower.endsWith(".ttf");
  const isOtf = lower.endsWith(".otf");

  if (!isTtf && !isOtf) {
    return {
      valid: false,
      errorAr: `صيغة الملف «${trimmedName}» غير مدعومة. يرجى رفع ملف خط بصيغة TrueType (.ttf) أو OpenType (.otf) فقط.`,
    };
  }

  if (sizeBytes <= 0) {
    return {
      valid: false,
      errorAr: "ملف الخط المختار فارغ (0 بايت).",
    };
  }

  if (sizeBytes > MAX_CUSTOM_FONT_FILE_BYTES) {
    const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      errorAr: `حجم ملف الخط (${sizeMb} ميغابايت) يتجاوز الحد الأقصى للتخزين المحلي (4 ميغابايت). يرجى اختيار نسخة خط أخف حجماً.`,
    };
  }

  // التحقق من البصمة الثنائية (Magic Bytes) لملفات TTF و OTF إن توفرت
  if (headerBytes && headerBytes.length >= 4) {
    const b0 = headerBytes[0];
    const b1 = headerBytes[1];
    const b2 = headerBytes[2];
    const b3 = headerBytes[3];

    // TrueType: 0x00 0x01 0x00 0x00 أو 'true' (0x74 0x72 0x75 0x65)
    const isTrueTypeSig =
      (b0 === 0x00 && b1 === 0x01 && b2 === 0x00 && b3 === 0x00) ||
      (b0 === 0x74 && b1 === 0x72 && b2 === 0x75 && b3 === 0x65);

    // OpenType CFF: 'OTTO' (0x4F 0x54 0x54 0x4F)
    const isOpenTypeSig =
      b0 === 0x4f && b1 === 0x54 && b2 === 0x54 && b3 === 0x4f;

    if (!isTrueTypeSig && !isOpenTypeSig) {
      return {
        valid: false,
        errorAr:
          "البنية الداخلية للملف لا تطابق توقيع خطوط TrueType (.ttf) أو OpenType (.otf) القياسية.",
      };
    }
  }

  if (dataUrl && !dataUrl.startsWith("data:")) {
    return {
      valid: false,
      errorAr: "بيانات ملف الخط المرمزة (Data URL) غير صالحة.",
    };
  }

  const format: CustomFontFormat = isOtf ? "opentype" : "truetype";
  const mimeType = isOtf ? "font/otf" : "font/ttf";

  return {
    valid: true,
    format,
    mimeType,
    sanitizedDisplayName: deriveCleanFontDisplayName(trimmedName),
  };
}

// مخزن احتياطي في الذاكرة لبيئة الاختبار (Node/SSR) عند عدم توفر localStorage
let memoryFallbackFontsStore: CustomUploadedFontItem[] = [];

/**
 * تحميل قائمة الخطوط المخصصة المخزنة محلياً في المتصفح
 */
export function loadCustomUploadedFonts(): CustomUploadedFontItem[] {
  try {
    if (typeof localStorage === "undefined") {
      return [...memoryFallbackFontsStore];
    }
    const raw = localStorage.getItem(CUSTOM_UPLOADED_FONTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CustomUploadedFontItem =>
        Boolean(
          item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.fontFamilyCssName === "string" &&
            typeof item.dataUrl === "string" &&
            (item.format === "truetype" || item.format === "opentype")
        )
    );
  } catch {
    return [...memoryFallbackFontsStore];
  }
}

/**
 * حفظ قائمة الخطوط المخصصة في التخزين المحلي مع حماية سعة localStorage
 */
export function saveCustomUploadedFonts(
  fonts: CustomUploadedFontItem[]
): boolean {
  const capped = fonts.slice(0, MAX_STORED_CUSTOM_FONTS);
  memoryFallbackFontsStore = [...capped];
  try {
    if (typeof localStorage === "undefined") {
      return true;
    }
    localStorage.setItem(
      CUSTOM_UPLOADED_FONTS_STORAGE_KEY,
      JSON.stringify(capped)
    );
    return true;
  } catch {
    // في حال امتلاء سعة التخزين المحلي، نحتفظ بأحدث الخطوط المرفوعة
    try {
      if (typeof localStorage !== "undefined" && fonts.length > 1) {
        const reduced = fonts.slice(0, Math.max(1, fonts.length - 1));
        memoryFallbackFontsStore = [...reduced];
        localStorage.setItem(
          CUSTOM_UPLOADED_FONTS_STORAGE_KEY,
          JSON.stringify(reduced)
        );
        return true;
      }
    } catch {
      // ignore quota fallback error
    }
    return false;
  }
}

/**
 * إضافة ملف خط مخصص جديد (.ttf أو .otf) وتخزينه محلياً
 */
export function addCustomUploadedFont(params: {
  fileName: string;
  customDisplayName?: string;
  dataUrl: string;
  sizeBytes: number;
  headerBytes?: Uint8Array;
}): {
  success: boolean;
  font?: CustomUploadedFontItem;
  fonts: CustomUploadedFontItem[];
  errorAr?: string;
} {
  const existing = loadCustomUploadedFonts();
  const validation = validateCustomFontFile({
    fileName: params.fileName,
    sizeBytes: params.sizeBytes,
    headerBytes: params.headerBytes,
    dataUrl: params.dataUrl,
  });

  if (!validation.valid || !validation.format || !validation.mimeType) {
    return {
      success: false,
      fonts: existing,
      errorAr: validation.errorAr || "ملف الخط غير صالح.",
    };
  }

  const displayName = deriveCleanFontDisplayName(
    params.fileName,
    params.customDisplayName
  );
  const uniqueToken = `${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
  const id = `custom_font_${uniqueToken}`;
  const fontFamilyCssName = `KouziberCustomTitleFont_${uniqueToken}`;

  const newFont: CustomUploadedFontItem = {
    id,
    name: displayName,
    fontFamilyCssName,
    fileName: params.fileName.trim(),
    format: validation.format,
    mimeType: validation.mimeType,
    dataUrl: params.dataUrl,
    sizeBytes: params.sizeBytes,
    uploadedAt: new Date().toISOString(),
  };

  // إذا كان هناك خط بنفس اسم الملف، نستبدله بالنسخة المحدثة
  const deduplicated = existing.filter(
    (f) => f.fileName.toLowerCase() !== newFont.fileName.toLowerCase()
  );
  const nextList = [newFont, ...deduplicated].slice(0, MAX_STORED_CUSTOM_FONTS);
  const saved = saveCustomUploadedFonts(nextList);

  if (!saved && typeof localStorage !== "undefined") {
    return {
      success: false,
      fonts: existing,
      errorAr:
        "تعذر حفظ ملف الخط في التخزين المحلي بسبب امتلاء المساحة. يرجى حذف بعض الخطوط المرفوعة سابقاً.",
    };
  }

  return {
    success: true,
    font: newFont,
    fonts: nextList,
  };
}

/**
 * قراءة كائن File (.ttf أو .otf) مباشرة من مدخل المتصفح والتحقق من ترويسته وحفظه محلياً
 */
export async function readAndAddCustomFontFile(
  file: File,
  customDisplayName?: string
): Promise<{
  success: boolean;
  font?: CustomUploadedFontItem;
  fonts: CustomUploadedFontItem[];
  errorAr?: string;
}> {
  try {
    const headerBuffer = await file.slice(0, 16).arrayBuffer();
    const headerBytes = new Uint8Array(headerBuffer);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("تعذر قراءة ملف الخط."));
      reader.readAsDataURL(file);
    });
    return addCustomUploadedFont({
      fileName: file.name,
      customDisplayName,
      dataUrl,
      sizeBytes: file.size,
      headerBytes,
    });
  } catch {
    return {
      success: false,
      fonts: loadCustomUploadedFonts(),
      errorAr: "حدث خطأ أثناء قراءة ملف الخط من الجهاز.",
    };
  }
}

/**
 * حذف خط مخصص من التخزين المحلي
 */
export function deleteCustomUploadedFont(
  fontId: string
): CustomUploadedFontItem[] {
  const existing = loadCustomUploadedFonts();
  const filtered = existing.filter((f) => f.id !== fontId);
  saveCustomUploadedFonts(filtered);
  return filtered;
}

/**
 * بناء شيفرة CSS لقواعد @font-face والمتغير الجذري --custom-uploaded-title-font
 */
export function buildCustomFontsStylesheetCss(
  fonts: CustomUploadedFontItem[],
  activeFontId?: string
): string {
  if (!Array.isArray(fonts) || fonts.length === 0) {
    return `:root { --custom-uploaded-title-font: 'Amiri', 'Cairo', serif; }`;
  }

  const activeFont =
    (activeFontId ? fonts.find((f) => f.id === activeFontId) : null) ||
    fonts[0];

  const fontFaceRules = fonts
    .map((f) => {
      const safeFamily = f.fontFamilyCssName.replace(/[^a-zA-Z0-9_-]/g, "");
      return `@font-face {
  font-family: '${safeFamily}';
  src: url('${f.dataUrl}') format('${f.format}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: '${safeFamily}';
  src: url('${f.dataUrl}') format('${f.format}');
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}`;
    })
    .join("\n\n");

  const activeSafeFamily = activeFont.fontFamilyCssName.replace(
    /[^a-zA-Z0-9_-]/g,
    ""
  );

  return `${fontFaceRules}

:root {
  --custom-uploaded-title-font: '${activeSafeFamily}', 'Amiri', 'Cairo', serif;
}`;
}

/**
 * حقن وتحديث الخطوط المخصصة في وثيقة DOM الحالية لتظهر فوراً في المعاينة والطباعة A4
 */
export function injectCustomUploadedFontsToDocument(
  fonts: CustomUploadedFontItem[],
  activeFontId?: string
): { injectedCount: number; activeFontFamilyCss: string } {
  const cssContent = buildCustomFontsStylesheetCss(fonts, activeFontId);
  const activeFont =
    (activeFontId ? fonts.find((f) => f.id === activeFontId) : null) ||
    fonts[0];
  const activeFontFamilyCss = activeFont
    ? `'${activeFont.fontFamilyCssName}', 'Amiri', 'Cairo', serif`
    : `'Amiri', 'Cairo', serif`;

  if (typeof document === "undefined") {
    return {
      injectedCount: fonts.length,
      activeFontFamilyCss,
    };
  }

  let styleEl = document.getElementById(
    CUSTOM_UPLOADED_FONTS_STYLE_ELEMENT_ID
  ) as HTMLStyleElement | null;

  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = CUSTOM_UPLOADED_FONTS_STYLE_ELEMENT_ID;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = cssContent;

  return {
    injectedCount: fonts.length,
    activeFontFamilyCss,
  };
}
