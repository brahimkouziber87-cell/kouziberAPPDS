import type { NextFunction, Request, Response } from "express";
import zlib from "zlib";

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  labelAr?: string;
}

export interface OcrPayloadValidationResult {
  valid: boolean;
  statusCode?: number;
  errorAr?: string;
  payloadBytes?: number;
}

const ALLOWED_OCR_MIME_PREFIXES = ["image/", "application/pdf"];
const MAX_OCR_PAYLOAD_BYTES = 12 * 1024 * 1024; // 12 MB max base64 payload

/**
 * التحقق الصارم من سلامة حمولات المسح الضوئي (OCR) من حيث الحجم ونوع الملف قبل معالجتها
 */
export function validateOcrPayload(body: any): OcrPayloadValidationResult {
  if (!body || typeof body !== "object") {
    return {
      valid: false,
      statusCode: 400,
      errorAr: "جسم الطلب غير صالح (JSON غير مكتمل).",
    };
  }

  const { fileBase64, fileMimeType } = body;

  if (fileMimeType && typeof fileMimeType === "string") {
    const normalizedMime = fileMimeType.toLowerCase().trim();
    const allowed = ALLOWED_OCR_MIME_PREFIXES.some((prefix) =>
      normalizedMime.startsWith(prefix)
    );
    if (!allowed) {
      return {
        valid: false,
        statusCode: 400,
        errorAr: `صيغة الملف (${fileMimeType}) غير مدعومة في الـ OCR. الصيغ المقبولة: صور (PNG/JPG/WebP) أو PDF.`,
      };
    }
  }

  if (typeof fileBase64 === "string" && fileBase64.length > 0) {
    const rawLength = Buffer.byteLength(fileBase64, "utf8");
    if (rawLength > MAX_OCR_PAYLOAD_BYTES) {
      return {
        valid: false,
        statusCode: 413,
        errorAr: "حجم الوثيقة الممسوحة يتجاوز الحد الأقصى المسموح به (12 ميغابايت). يرجى تقليص الدقة ثم المحاولة مجدداً.",
        payloadBytes: rawLength,
      };
    }
    return { valid: true, payloadBytes: rawLength };
  }

  return { valid: true, payloadBytes: 0 };
}

/**
 * محدد معدل الطلبات (Sliding Window Rate Limiter) لحماية نقاط نهاية الذكاء الاصطناعي والـ OCR
 */
export function createApiRateLimiter(options: RateLimiterOptions) {
  const { windowMs, maxRequests, labelAr = "واجهة الذكاء الاصطناعي" } = options;
  const buckets = new Map<string, number[]>();

  const cleanupOldTimestamps = (timestamps: number[], cutoff: number) =>
    timestamps.filter((t) => t > cutoff);

  const middleware = (req: Request, res: Response, next: NextFunction) => {
    const clientIp =
      (typeof req.headers["x-forwarded-for"] === "string"
        ? req.headers["x-forwarded-for"].split(",")[0].trim()
        : undefined) ||
      req.ip ||
      req.socket?.remoteAddress ||
      "local";

    const now = Date.now();
    const cutoff = now - windowMs;
    const recent = cleanupOldTimestamps(buckets.get(clientIp) || [], cutoff);

    if (recent.length >= maxRequests) {
      const oldest = recent[0] ?? now;
      const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSec));
      res.setHeader("X-RateLimit-Limit", String(maxRequests));
      res.setHeader("X-RateLimit-Remaining", "0");
      return res.status(429).json({
        success: false,
        error: `تم تجاوز الحد المسموح به من الطلبات على ${labelAr}. يرجى الانتظار ${retryAfterSec} ثانية ثم إعادة المحاولة.`,
        retryAfterSeconds: retryAfterSec,
      });
    }

    recent.push(now);
    buckets.set(clientIp, recent);
    if (buckets.size > 1000) {
      // حماية الذاكرة من التضخم طويل الأمد
      for (const [key, list] of buckets.entries()) {
        if (cleanupOldTimestamps(list, cutoff).length === 0) {
          buckets.delete(key);
        }
      }
    }

    res.setHeader("X-RateLimit-Limit", String(maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, maxRequests - recent.length)));
    return next();
  };

  middleware.reset = () => buckets.clear();
  middleware.getTrackedClientsCount = () => buckets.size;
  return middleware;
}

/**
 * وسيط الأمان وضغط الاستجابات JSON عبر zlib.gzip (بدون X-Frame-Options: DENY للحفاظ على توافق iframe)
 */
export function securityAndCompressionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: blob: https:; connect-src 'self' https: ws: wss:; object-src 'none'; base-uri 'self'; frame-ancestors *;"
  );

  const acceptEncoding = String(req.headers["accept-encoding"] || "");
  if (!acceptEncoding.includes("gzip")) {
    return next();
  }

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    try {
      const jsonStr = JSON.stringify(body);
      if (jsonStr && jsonStr.length >= 2048 && !res.headersSent) {
        const compressed = zlib.gzipSync(Buffer.from(jsonStr, "utf8"));
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Vary", "Accept-Encoding");
        return res.status(res.statusCode || 200).send(compressed);
      }
    } catch {
      // الرجوع إلى res.json القياسي عند أي طارئ
    }
    return originalJson(body);
  }) as Response["json"];

  return next();
}
