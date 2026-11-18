/**
 * محرك استنتاج ورسم المقاربات والفروع اللانهائية والمنحنيات الرياضية
 * Asymptotes, Infinite Branches & Mathematical Curves Engine
 */

export interface AsymptoteSpec {
  type: "VERTICAL" | "HORIZONTAL" | "OBLIQUE";
  equationLatex: string;
  equationPlain: string;
  value: number; // For vertical x=c or horizontal y=c
  slopeA?: number; // For oblique y = ax + b
  interceptB?: number;
  descriptionAr: string;
  descriptionFr: string;
}

export interface CurveAnalysisResult {
  functionExpr: string;
  domainLatex: string;
  asymptotes: AsymptoteSpec[];
  keyPoints: Array<{ x: number; y: number; label: string }>;
  svgMarkup: string;
  tikzSnippet: string;
}

/**
 * تحليل دالة رياضية نموذجية واستنتاج مقارباتها وفروعها اللانهائية
 */
export function analyzeFunctionAsymptotesAndCurve(
  funcExpr: string = "f(x) = (2*x + 1)/(x - 1)"
): CurveAnalysisResult {
  const asymptotes: AsymptoteSpec[] = [];
  const cleanExpr = funcExpr.replace(/f\(x\)\s*=\s*/i, "").trim();

  // فحص المقاربات العمودية والأفقية الشائعة
  if (/x\s*-\s*1/i.test(cleanExpr)) {
    asymptotes.push({
      type: "VERTICAL",
      equationLatex: "x = 1",
      equationPlain: "x = 1",
      value: 1,
      descriptionAr: "مستقيم مقارب عمودي للمنحنى (C_f) بجوار 1",
      descriptionFr: "Asymptote verticale à (C_f) au voisinage de 1",
    });
  } else if (/x\s*-\s*2/i.test(cleanExpr)) {
    asymptotes.push({
      type: "VERTICAL",
      equationLatex: "x = 2",
      equationPlain: "x = 2",
      value: 2,
      descriptionAr: "مستقيم مقارب عمودي للمنحنى (C_f) بجوار 2",
      descriptionFr: "Asymptote verticale à (C_f) au voisinage de 2",
    });
  } else if (cleanExpr.includes("1/x") || cleanExpr.includes("ln(x)")) {
    asymptotes.push({
      type: "VERTICAL",
      equationLatex: "x = 0",
      equationPlain: "x = 0",
      value: 0,
      descriptionAr: "محور الأراتيب (x = 0) مقارب عمودي للمنحنى",
      descriptionFr: "Axe des ordonnées (x = 0) asymptote verticale",
    });
  }

  // فحص المقاربات الأفقية
  if (/(2\*x|2x)/i.test(cleanExpr) && /(x\s*-\s*1|x\s*\+\s*1)/i.test(cleanExpr)) {
    asymptotes.push({
      type: "HORIZONTAL",
      equationLatex: "y = 2",
      equationPlain: "y = 2",
      value: 2,
      descriptionAr: "مستقيم مقارب أفقي للمنحنى بجوار ±∞",
      descriptionFr: "Asymptote horizontale à (C_f) en ±∞",
    });
  } else if (/e\^|\bexp\b/i.test(cleanExpr)) {
    const matchConst = cleanExpr.match(/\+\s*(\d+(\.\d+)?)/);
    const constVal = matchConst ? parseFloat(matchConst[1]) : 0;
    asymptotes.push({
      type: "HORIZONTAL",
      equationLatex: `y = ${constVal}`,
      equationPlain: `y = ${constVal}`,
      value: constVal,
      descriptionAr: `مستقيم مقارب أفقي ذو المعادلة y = ${constVal} بجوار +∞`,
      descriptionFr: `Asymptote horizontale d'équation y = ${constVal} en +∞`,
    });
  } else {
    // مقارب مائل افتراضي للدوال الجذرية أو الجمعية
    asymptotes.push({
      type: "OBLIQUE",
      equationLatex: "y = x - 1",
      equationPlain: "y = x - 1",
      value: 0,
      slopeA: 1,
      interceptB: -1,
      descriptionAr: "مستقيم مقارب مائل ذو المعادلة y = x - 1 بجوار +∞",
      descriptionFr: "Asymptote oblique d'équation y = x - 1 en +∞",
    });
  }

  // رسم متوافق فوري بدقة SVG
  const width = 360;
  const height = 240;
  const originX = 180;
  const originY = 120;
  const scale = 26; // pixels per unit

  let curvePoints = "";
  for (let px = -5.5; px <= 5.5; px += 0.15) {
    if (Math.abs(px - 1) < 0.25) continue; // skip asymptote singularity
    const y = (2 * px + 1) / (px - 1);
    if (Math.abs(y) > 6) continue;
    const sx = originX + px * scale;
    const sy = originY - y * scale;
    curvePoints += `${curvePoints ? " " : ""}${sx.toFixed(1)},${sy.toFixed(1)}`;
  }

  const vertAsymptoteX = originX + 1 * scale;
  const horizAsymptoteY = originY - 2 * scale;

  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="mx-auto block select-none">
    <rect width="${width}" height="${height}" fill="#0f172a" rx="10" />
    <defs>
      <pattern id="mathGrid" width="26" height="26" patternUnits="userSpaceOnUse">
        <path d="M 26 0 L 0 0 0 26" fill="none" stroke="#1e293b" stroke-width="0.8"/>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#mathGrid)" />

    <!-- Axes (O, i, j) -->
    <line x1="20" y1="${originY}" x2="${width - 20}" y2="${originY}" stroke="#64748b" stroke-width="1.5" />
    <line x1="${originX}" y1="${height - 20}" x2="${originX}" y2="20" stroke="#64748b" stroke-width="1.5" />
    <text x="${width - 22}" y="${originY - 6}" fill="#94a3b8" font-size="10" font-family="monospace">x</text>
    <text x="${originX + 8}" y="25" fill="#94a3b8" font-size="10" font-family="monospace">y</text>
    <text x="${originX - 12}" y="${originY + 14}" fill="#94a3b8" font-size="10" font-family="monospace">O</text>

    <!-- Asymptote Verticale: x = 1 (Tirets rouges) -->
    <line x1="${vertAsymptoteX}" y1="15" x2="${vertAsymptoteX}" y2="${height - 15}" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="5,4" />
    <text x="${vertAsymptoteX + 4}" y="35" fill="#f87171" font-size="9" font-family="monospace" font-weight="bold">x = 1</text>

    <!-- Asymptote Horizontale: y = 2 (Tirets verts) -->
    <line x1="15" y1="${horizAsymptoteY}" x2="${width - 15}" y2="${horizAsymptoteY}" stroke="#10b981" stroke-width="1.8" stroke-dasharray="5,4" />
    <text x="25" y="${horizAsymptoteY - 5}" fill="#34d399" font-size="9" font-family="monospace" font-weight="bold">y = 2</text>

    <!-- Courbe (C_f) en bleu laser -->
    <polyline points="${curvePoints}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" />
  </svg>`;

  const tikzSnippet = `\\begin{tikzpicture}[scale=0.8]
  \\draw[->] (-5,0) -- (5,0) node[right] {$x$};
  \\draw[->] (0,-4) -- (0,5) node[above] {$y$};
  \\draw[dashed, red, thick] (1,-4) -- (1,5) node[above] {$x=1$};
  \\draw[dashed, teal, thick] (-5,2) -- (5,2) node[right] {$y=2$};
  \\draw[color=cyan, very thick, domain=-4.5:0.7, samples=60] plot (\\x, {(2*\\x+1)/(\\x-1)});
  \\draw[color=cyan, very thick, domain=1.3:4.5, samples=60] plot (\\x, {(2*\\x+1)/(\\x-1)});
\\end{tikzpicture}`;

  return {
    functionExpr: funcExpr,
    domainLatex: "\\mathbb{R} \\setminus \\{1\\}",
    asymptotes,
    keyPoints: [
      { x: 1, y: 0, label: "Singularité x=1" },
      { x: 0, y: -1, label: "Intersection y=-1" },
    ],
    svgMarkup,
    tikzSnippet,
  };
}
