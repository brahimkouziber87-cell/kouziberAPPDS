import type { DocFontFamily, TraditionalTitleFontId } from "../data/curriculum";

export const CORE_PRELOADED_FONTS = [
  "Amiri",
  "Cairo",
  "IBM Plex Sans Arabic",
  "JetBrains Mono",
  "STIX Two Text",
] as const;

export const LAZY_CALLIGRAPHY_LINK_ID = "lazy-calligraphy-fonts-css";

/**
 * قائمة الخطوط الزخرفية وخطوط الكتابة اليدوية والخطوط العربية التقليدية (18 خطاً)
 * يتم تحميلها عند الحاجة فقط (On-Demand) لتسريع الإقلاع الأولي للتطبيق (FCP/LCP)
 */
export const DECORATIVE_CALLIGRAPHY_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Aref+Ruqaa+Ink:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=Caveat:wght@400;600;700&family=Cinzel:wght@600;700;800&family=Gulzar&family=Kalam:wght@400;700&family=Katibeh&family=Kufam:wght@400;600;700&family=Lateef:wght@400;600;700&family=Marhey:wght@400;600;700&family=Mirza:wght@400;600;700&family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Patrick+Hand&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Rakkas&family=Reem+Kufi:wght@400;600;700&family=Scheherazade+New:wght@400;700&display=swap";

export interface LazyFontLoadResult {
  injected: boolean;
  alreadyLoaded: boolean;
  offlineSkipped: boolean;
}

export function shouldLoadDecorativeFonts(params: {
  docFontFamily?: DocFontFamily;
  calligraphyFontId?: TraditionalTitleFontId;
  isCalligraphyModalOpen?: boolean;
}): boolean {
  const { docFontFamily, calligraphyFontId, isCalligraphyModalOpen } = params;
  if (isCalligraphyModalOpen) return true;
  if (docFontFamily && docFontFamily.startsWith("HANDWRITTEN_")) return true;
  if (calligraphyFontId && calligraphyFontId !== "DEFAULT_DOC") return true;
  return false;
}

export function loadCalligraphyFontsOnDemand(): LazyFontLoadResult {
  if (typeof document === "undefined") {
    return { injected: false, alreadyLoaded: false, offlineSkipped: false };
  }

  const existing = document.getElementById(LAZY_CALLIGRAPHY_LINK_ID);
  if (existing) {
    return { injected: false, alreadyLoaded: true, offlineSkipped: false };
  }

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { injected: false, alreadyLoaded: false, offlineSkipped: true };
  }

  const link = document.createElement("link");
  link.id = LAZY_CALLIGRAPHY_LINK_ID;
  link.rel = "stylesheet";
  link.crossOrigin = "anonymous";
  link.href = DECORATIVE_CALLIGRAPHY_FONTS_URL;
  document.head.appendChild(link);

  return { injected: true, alreadyLoaded: false, offlineSkipped: false };
}
