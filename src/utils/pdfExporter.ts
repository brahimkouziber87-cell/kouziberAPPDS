import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

export type PrintMarginPreset = "NARROW" | "STANDARD" | "OFFICIAL_EXAM";
export type PrintColorMode = "FULL_COLOR" | "LASER_MONO";
export type PrintDpiQuality = "STANDARD_150" | "HIGH_300" | "ULTRA_PRINT";

export interface ExportPDFOptions {
  elementId?: string;
  fileName: string;
  orientation?: "portrait" | "landscape";
  showPageNumbers?: boolean;
  docTitle?: string;
  headerMeta?: string;
  marginPreset?: PrintMarginPreset;
  colorMode?: PrintColorMode;
  dpiQuality?: PrintDpiQuality;
  isMission?: boolean;
  isFrench?: boolean;
}

/**
 * دالة ذكية لتحديد نقاط القطع البيداغوجية المتجانسة بين الصفحات
 * لمنع قطع التمارين أو الصيغ الرياضية أو الجداول أو الأشكال الهندسية في منتصف السطر
 */
function calculateSmartPageSlices(
  element: HTMLElement,
  imgWidth: number,
  imgHeight: number,
  maxSliceHeightPx: number
): number[] {
  const elementRect = element.getBoundingClientRect();
  const scale = imgWidth / Math.max(1, elementRect.width);

  // فرض فواصل صفحات صريحة للعناصر الحاملة لفئة .page-break
  const explicitBreaks = Array.from(element.querySelectorAll(".page-break"))
    .map((el) => {
      const r = el.getBoundingClientRect();
      return Math.floor((r.top - elementRect.top) * scale);
    })
    .filter((y) => y > 80 && y < imgHeight - 40)
    .sort((a, b) => a - b);

  // البحث عن العناصر البنائية التي يجب تفادي قطعها في منتصفها
  const breakElements = Array.from(
    element.querySelectorAll(
      ".avoid-break, .a4-page, .exercise-card, h2, h3, h4, table, tr, ol > li, .inserted-figure-card, .border, .rounded-2xl, .rounded-xl, .p-4, .p-5, .katex-display-block, .math-display"
    )
  );

  const safeCutLinesPx: number[] = [];
  breakElements.forEach((el) => {
    const r = el.getBoundingClientRect();
    const topPx = Math.floor((r.top - elementRect.top) * scale);
    const bottomPx = Math.ceil((r.bottom - elementRect.top) * scale);
    if (topPx > 0 && topPx < imgHeight) safeCutLinesPx.push(topPx);
    if (bottomPx > 0 && bottomPx < imgHeight) safeCutLinesPx.push(bottomPx);
  });

  safeCutLinesPx.sort((a, b) => a - b);

  const sliceOffsets: number[] = [0];
  let currentY = 0;

  while (currentY + maxSliceHeightPx < imgHeight) {
    const theoreticalCut = currentY + maxSliceHeightPx;

    // 1. إذا كان هناك فاصل صفحة صريح (.page-break) ضمن الصفحة الحالية، نقطع عنده مباشرة
    const explicitInPage = explicitBreaks.find(
      (brk) => brk > currentY + 120 && brk <= theoreticalCut
    );
    if (explicitInPage !== undefined) {
      sliceOffsets.push(explicitInPage);
      currentY = explicitInPage;
      continue;
    }

    // 2. البحث عن أقرب نقطة قطع آمنة تقع قبل القطع النظري بهامش أمان (حتى 28% من الصفحة)
    const minAcceptableCut = currentY + maxSliceHeightPx * 0.7;
    const candidateCuts = safeCutLinesPx.filter(
      (cut) => cut >= minAcceptableCut && cut <= theoreticalCut - 10
    );

    let bestCut = theoreticalCut;
    if (candidateCuts.length > 0) {
      bestCut = candidateCuts[candidateCuts.length - 1];
    }

    sliceOffsets.push(bestCut);
    currentY = bestCut;
  }

  sliceOffsets.push(imgHeight);
  return sliceOffsets;
}

/**
 * تحويل لوحة Canvas إلى تدرج رمادي عالي التباين للطباعة الليزرية الاقتصادية (Laser Monochrome)
 */
function applyLaserMonochromeFilter(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // معادلة النصوع القياسية مع تعزيز طفيف للتباين لطباعة الليزر
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < 245) {
      lum = Math.max(0, Math.min(255, (lum - 128) * 1.08 + 122));
    }
    data[i] = lum;
    data[i + 1] = lum;
    data[i + 2] = lum;
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * رسم الترويسة الجارية للصفحات الموالية والتذييل الرسمي المشكّل بالعربية والفرنسية بدقة Canvas
 * (يتفادى مشكلة تشوه الحروف العربية في خطوط jsPDF الافتراضية)
 */
function drawCanvasRunningHeaderAndFooter(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  headerHeightPx: number,
  footerHeightPx: number,
  pageIndex: number,
  totalPages: number,
  options: {
    docTitle?: string;
    headerMeta?: string;
    isMission?: boolean;
    isFrench?: boolean;
  }
) {
  const scaleFactor = Math.max(1, canvasWidth / 1200);
  const fontSizePx = Math.round(15 * scaleFactor);
  const smallFontPx = Math.round(13 * scaleFactor);

  // 1. الترويسة الجارية للصفحات الثانية فما فوق
  if (headerHeightPx > 0 && pageIndex > 0) {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, headerHeightPx);

    // خط فاصل سفلي للترويسة الجارية
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = Math.max(1, Math.round(1.2 * scaleFactor));
    ctx.beginPath();
    ctx.moveTo(0, headerHeightPx - Math.round(8 * scaleFactor));
    ctx.lineTo(canvasWidth, headerHeightPx - Math.round(8 * scaleFactor));
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.font = `bold ${smallFontPx}px 'Cairo', 'IBM Plex Sans Arabic', sans-serif`;
    ctx.textBaseline = "middle";
    const headerY = Math.round((headerHeightPx - 8 * scaleFactor) / 2);

    // يمين الترويسة
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    const rightHeaderText = options.isFrench
      ? `Suite de l'épreuve · ${options.docTitle || "Mathématiques"}`
      : `تابع الموضوع · ${options.docTitle || "فرض محروس في الرياضيات"}`;
    ctx.fillText(rightHeaderText, canvasWidth - 8, headerY);

    // يسار الترويسة
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.fillText(
      `Page ${pageIndex + 1} / ${totalPages}${options.headerMeta ? ` · ${options.headerMeta}` : ""}`,
      8,
      headerY
    );
    ctx.restore();
  }

  // 2. التذييل الرسمي السفلي لكل صفحة
  if (footerHeightPx > 0) {
    const footerTopY = canvasHeight - footerHeightPx;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, footerTopY, canvasWidth, footerHeightPx);

    // خط علوي رفيع للتذييل
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = Math.max(1, Math.round(1.2 * scaleFactor));
    ctx.beginPath();
    ctx.moveTo(0, footerTopY + Math.round(8 * scaleFactor));
    ctx.lineTo(canvasWidth, footerTopY + Math.round(8 * scaleFactor));
    ctx.stroke();

    const textY = footerTopY + Math.round(footerHeightPx * 0.58);

    // وسط التذييل: رقم الصفحة المزدوج
    ctx.fillStyle = "#0f172a";
    ctx.font = `bold ${fontSizePx}px 'Cairo', 'IBM Plex Sans Arabic', sans-serif`;
    ctx.textBaseline = "middle";
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    const pageBadge = options.isFrench
      ? `— Page ${pageIndex + 1} sur ${totalPages} —`
      : `— الصفحة ${pageIndex + 1} من ${totalPages} (Page ${pageIndex + 1}/${totalPages}) —`;
    ctx.fillText(pageBadge, Math.round(canvasWidth / 2), textY);

    // يمين التذييل: الهوية الأكاديمية
    ctx.fillStyle = "#475569";
    ctx.font = `600 ${smallFontPx}px 'Cairo', 'IBM Plex Sans Arabic', sans-serif`;
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    const rightFooter = options.isMission
      ? "Enseignement Français au Maroc (AEFE / OSUI)"
      : options.isFrench
      ? "Royaume du Maroc · Ministère de l'Éducation Nationale"
      : "المملكة المغربية · وزارة التربية الوطنية والتعليم الأولي والرياضة";
    ctx.fillText(rightFooter, canvasWidth - 8, textY);

    // يسار التذييل: مرجع الوثيقة والسنة
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    const leftFooter = [options.docTitle, options.headerMeta]
      .filter(Boolean)
      .join(" · ") || "Mathématiques · Format Officiel A4";
    ctx.fillText(leftFooter, 8, textY);

    ctx.restore();
  }
}

/**
 * تصدير مباشر للوثيقة المعاينة إلى ملف PDF بحجم A4 مع الحفاظ الكامل على التنسيق والخطوط والشعارات
 * وتقسيم ذكي يراعي حدود التمارين والفقرات (Smart Pagination) وتذييل عربي/فرنسي سليم 100%
 */
export async function exportPreviewToPDF({
  elementId = "printable-document-sheet",
  fileName,
  orientation = "portrait",
  showPageNumbers = true,
  docTitle,
  headerMeta,
  marginPreset = "STANDARD",
  colorMode = "FULL_COLOR",
  dpiQuality = "HIGH_300",
  isMission = false,
  isFrench = false,
}: ExportPDFOptions): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("تعذر العثور على نافذة المعاينة لتصدير ملف PDF.");
  }

  // انتظار تحميل جميع الخطوط لضمان جودة عرض الحروف العربية والرموز الرياضية
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const pixelRatio =
    dpiQuality === "ULTRA_PRINT" ? 3.0 : dpiQuality === "STANDARD_150" ? 1.8 : 2.5;

  // استبعاد جميع أزرار وشرائط الأدوات التي تحمل الفئة .no-print داخل الورقة أثناء التصدير
  const dataUrl = await toPng(element, {
    quality: 1.0,
    pixelRatio,
    backgroundColor: "#ffffff",
    cacheBust: true,
    filter: (node: Node) => {
      if (node instanceof HTMLElement && node.classList.contains("no-print")) {
        return false;
      }
      return true;
    },
    style: {
      transform: "none",
      margin: "0",
      boxShadow: "none",
      borderRadius: "0",
      border: "none",
    },
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("تعذر معالجة صورة الوثيقة لتوليد ملف PDF."));
    img.src = dataUrl;
  });

  const pdf = new jsPDF({
    orientation: orientation,
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidthMm = pdf.internal.pageSize.getWidth(); // 210mm (Portrait) أو 297mm (Landscape)
  const pageHeightMm = pdf.internal.pageSize.getHeight(); // 297mm (Portrait) أو 210mm (Landscape)

  const marginMm =
    marginPreset === "NARROW" ? 6 : marginPreset === "OFFICIAL_EXAM" ? 11 : 8.5;
  const footerHeightMm = showPageNumbers ? 8.5 : 0;
  const runningHeaderMm = showPageNumbers ? 6.5 : 0;

  const contentWidthMm = pageWidthMm - marginMm * 2;
  const firstPageBodyMm = pageHeightMm - marginMm * 2 - footerHeightMm;

  const pxPerMm = img.width / contentWidthMm;
  const maxSliceHeightPx = Math.floor((firstPageBodyMm - runningHeaderMm) * pxPerMm);
  const footerHeightPx = Math.round(footerHeightMm * pxPerMm);
  const runningHeaderPx = Math.round(runningHeaderMm * pxPerMm);

  const cuts = calculateSmartPageSlices(element, img.width, img.height, maxSliceHeightPx);
  const totalPages = Math.max(1, cuts.length - 1);

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) {
      pdf.addPage();
    }

    const startY = cuts[i];
    const endY = cuts[i + 1];
    const sliceHeightPx = endY - startY;

    if (sliceHeightPx <= 0) continue;

    const currentHeaderPx = i > 0 ? runningHeaderPx : 0;
    const totalCanvasHeightPx = currentHeaderPx + sliceHeightPx + footerHeightPx;

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = totalCanvasHeightPx;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // رسم محتوى الشريحة
      ctx.drawImage(
        img,
        0,
        startY,
        img.width,
        sliceHeightPx,
        0,
        currentHeaderPx,
        img.width,
        sliceHeightPx
      );

      // رسم الترويسة الجارية والتذييل بالعربية والفرنسية السليمة
      if (showPageNumbers) {
        drawCanvasRunningHeaderAndFooter(
          ctx,
          canvas.width,
          canvas.height,
          currentHeaderPx,
          footerHeightPx,
          i,
          totalPages,
          {
            docTitle,
            headerMeta,
            isMission,
            isFrench,
          }
        );
      }

      if (colorMode === "LASER_MONO") {
        applyLaserMonochromeFilter(ctx, canvas.width, canvas.height);
      }

      const sliceDataUrl = canvas.toDataURL("image/png", 0.98);
      const totalSliceMm = totalCanvasHeightPx / pxPerMm;

      pdf.addImage(
        sliceDataUrl,
        "PNG",
        marginMm,
        marginMm,
        contentWidthMm,
        Math.min(totalSliceMm, pageHeightMm - marginMm * 2),
        undefined,
        "FAST"
      );
    }
  }

  const cleanFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  pdf.save(cleanFileName);
}

/**
 * تنظيف نسخة DOM المستنسخة قبل تصديرها إلى HTML أو Word
 * في وضع Word يتم حذف شجرة .katex-mathml المخفية لتفادي تكرار الصيغ الرياضية مرتين في برنامج Microsoft Word
 */
function prepareCleanDocumentClone(
  element: HTMLElement,
  forWord: boolean = false
): HTMLElement {
  const cloned = element.cloneNode(true) as HTMLElement;
  cloned.querySelectorAll(".no-print").forEach((el) => el.remove());
  cloned.removeAttribute("contenteditable");
  cloned.querySelectorAll("[contenteditable]").forEach((el) => {
    el.removeAttribute("contenteditable");
  });
  if (forWord) {
    cloned.querySelectorAll(".katex-mathml, annotation").forEach((el) => el.remove());
    cloned.querySelectorAll("button, select, input[type='range']").forEach((el) => el.remove());
    cloned.querySelectorAll(".katex").forEach((el) => {
      (el as HTMLElement).setAttribute("dir", "ltr");
    });
  }
  return cloned;
}

/**
 * تصدير ملف HTML مستقل متكامل (Standalone Offline HTML)
 * مزود بشريط طباعة A4 مدمج وتنسيق جاهز للفتح بدون إنترنت
 */
export function exportStandaloneHTML(
  elementId: string = "printable-document-sheet",
  fileName: string = "Examen_Mathematiques.html",
  title: string = "وثيقة الرياضيات الرسمية"
): void {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("تعذر العثور على عنصر الوثيقة لتصدير HTML.");
  }

  const cloned = prepareCleanDocumentClone(element, false);
  const dirAttr = element.getAttribute("dir") || "rtl";

  const htmlContent = `<!DOCTYPE html>
<html lang="${dirAttr === "ltr" ? "fr" : "ar"}" dir="${dirAttr}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;900&family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=STIX+Two+Text:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    body {
      background-color: #e2e8f0;
      font-family: 'STIX Two Text', 'Amiri', 'Cairo', serif;
      color: #0f172a;
      margin: 0;
      padding: 24px 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .standalone-toolbar {
      max-width: 210mm;
      margin: 0 auto 16px auto;
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'Cairo', sans-serif;
    }
    .standalone-toolbar button {
      background: #06b6d4;
      color: #0f172a;
      font-weight: 800;
      padding: 6px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-size: 13px;
    }
    .print-sheet {
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 14mm 15mm;
      box-shadow: 0 12px 32px -4px rgb(15 23 42 / 0.15);
      border-radius: 8px;
    }
    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .standalone-toolbar, .no-print {
        display: none !important;
      }
      .print-sheet {
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="standalone-toolbar no-print" dir="rtl">
    <div>
      <strong>${title}</strong>
      <span style="font-size: 12px; color: #94a3b8; margin-right: 10px;">نسخة مستقلة جاهزة للطباعة A4</span>
    </div>
    <button onclick="window.print()">🖨️ طباعة الوثيقة A4 (Ctrl+P)</button>
  </div>
  <div class="print-sheet">
    ${cloned.innerHTML}
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".html") ? fileName : `${fileName}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * تصدير وثيقة Microsoft Word رسمية قابلة للتعديل المباشر (.doc)
 * مضبوطة الهوامش والأبعاد على مقاس A4 القياسي مع دعم العربية والفرنسية والجداول
 */
export function exportEditableWordDoc(
  elementId: string = "printable-document-sheet",
  fileName: string = "Examen_Mathematiques.doc",
  title: string = "وثيقة الرياضيات الرسمية",
  orientation: "portrait" | "landscape" = "portrait"
): void {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("تعذر العثور على عنصر الوثيقة لتصدير ملف Word.");
  }

  const cloned = prepareCleanDocumentClone(element, true);
  const dirAttr = element.getAttribute("dir") || "rtl";
  const pageSizePt =
    orientation === "landscape" ? "841.9pt 595.3pt" : "595.3pt 841.9pt";

  const wordDocumentContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40"
lang="${dirAttr === "ltr" ? "fr" : "ar"}" dir="${dirAttr}">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page WordSection1 {
      size: ${pageSizePt};
      margin: 28.35pt 34.0pt 28.35pt 34.0pt;
      mso-header-margin: 18.0pt;
      mso-footer-margin: 18.0pt;
    }
    div.WordSection1 {
      page: WordSection1;
      direction: ${dirAttr};
    }
    body {
      font-family: 'Amiri', 'Traditional Arabic', 'Times New Roman', serif;
      font-size: 11.5pt;
      color: #0f172a;
      line-height: 1.55;
    }
    .katex, .katex-html {
      direction: ltr !important;
      unicode-bidi: isolate !important;
      font-family: 'Cambria Math', 'STIX Two Math', 'Times New Roman', serif;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8pt 0;
    }
    th, td {
      border: 1pt solid #334155;
      padding: 5pt 7pt;
      font-size: 10.5pt;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
    }
    h1, h2, h3, h4 {
      color: #0f172a;
      margin-top: 8pt;
      margin-bottom: 4pt;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <div class="WordSection1" dir="${dirAttr}">
    ${cloned.innerHTML}
  </div>
</body>
</html>`;

  const blob = new Blob(["\ufeff", wordDocumentContent], {
    type: "application/msword;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".doc") ? fileName : `${fileName}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}
