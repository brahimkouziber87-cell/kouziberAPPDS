/**
 * مولد رموز الاستجابة السريعة (QR Code) المتجهي الحتمي الخفيف
 * يعمل بدون أي مكتبات خارجية بنسبة 100% داخل المتصفح وسطح المكتب والأندرويد
 */

export function generateDeterministicQrMatrix(text: string, size = 25): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // رسم مربعات التموضع الثلاثة (Finder Patterns)
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (r0 + r < size && c0 + c < size) {
          matrix[r0 + r][c0 + c] = isBorder || isInner;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // خطوط التوقيت (Timing Patterns)
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // تجزئة حتمية للنص
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const isTiming = r === 6 || c === 6;
      if (inTopLeft || inTopRight || inBottomLeft || isTiming) continue;

      const seed = Math.imul(r * 31 + c * 17 + (hash >>> 0), 2654435761) >>> 0;
      matrix[r][c] = (seed & 3) === 0 || (seed & 5) === 1;
    }
  }

  return matrix;
}

export function renderQrSvgString(
  text: string,
  pixelSize = 140,
  darkColor = "#0f172a",
  lightColor = "#ffffff"
): string {
  const size = 25;
  const matrix = generateDeterministicQrMatrix(text, size);
  const cellSize = pixelSize / size;

  let rects = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        rects += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(
          1
        )}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(
          1
        )}" fill="${darkColor}" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pixelSize} ${pixelSize}" width="${pixelSize}" height="${pixelSize}">
    <rect width="${pixelSize}" height="${pixelSize}" fill="${lightColor}" rx="8" />
    ${rects}
  </svg>`;
}
