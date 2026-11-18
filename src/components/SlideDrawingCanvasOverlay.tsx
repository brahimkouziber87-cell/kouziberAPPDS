import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Pen,
  Highlighter,
  Eraser,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff,
  Minus,
  Lock,
} from "lucide-react";

export interface SlideDrawingCanvasOverlayProps {
  /** Unique ID for the current slide to isolate and persist drawings per slide */
  slideId: string;
  /** Whether the drawing mode is currently enabled */
  isDrawingActive: boolean;
  /** Callback to toggle drawing mode from parent if needed */
  onToggleDrawingActive?: (active: boolean) => void;
  /** Whether the slide is digitally locked by the teacher password */
  isSlideLocked?: boolean;
  /** Theme context: dark or light */
  theme?: "dark" | "light";
  /** Optional custom container class name */
  className?: string;
  /** Custom notification or feedback callback */
  onNotify?: (message: string) => void;
}

interface StrokePoint {
  /** Normalized coordinates [0..1] so drawings scale accurately on fullscreen/resize */
  nx: number;
  ny: number;
  pressure?: number;
}

interface Stroke {
  tool: "PEN" | "HIGHLIGHTER" | "ERASER";
  color: string;
  width: number;
  points: StrokePoint[];
}

const SESSION_DRAWINGS_KEY = "math_studio_slide_drawings_v2";

const PRESET_COLORS = [
  { name: "أصفر مضيء", hex: "#facc15" },
  { name: "سماوي ساطع", hex: "#38bdf8" },
  { name: "أخضر زمردي", hex: "#34d399" },
  { name: "وردي قرمزي", hex: "#fb7185" },
  { name: "أبيض ناصع", hex: "#ffffff" },
  { name: "برتقالي", hex: "#fb923c" },
];

const PRESET_WIDTHS = [
  { label: "دقيق", size: 2.5 },
  { label: "متوسط", size: 5 },
  { label: "عريض", size: 10 },
];

export const SlideDrawingCanvasOverlay: React.FC<SlideDrawingCanvasOverlayProps> = ({
  slideId,
  isDrawingActive,
  onToggleDrawingActive,
  isSlideLocked = false,
  theme = "dark",
  className = "",
  onNotify,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cssSizeRef = useRef<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  // Storage of strokes keyed by slideId in memory + sessionStorage
  const allSlidesStrokesRef = useRef<Record<string, Stroke[]>>((() => {
    try {
      const saved = sessionStorage.getItem(SESSION_DRAWINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  })());

  const persistStrokes = useCallback(() => {
    try {
      sessionStorage.setItem(
        SESSION_DRAWINGS_KEY,
        JSON.stringify(allSlidesStrokesRef.current)
      );
    } catch {
      // ignore quota errors
    }
  }, []);

  // Current active tool state
  const [activeTool, setActiveTool] = useState<"PEN" | "HIGHLIGHTER" | "ERASER">("PEN");
  const [selectedColor, setSelectedColor] = useState<string>("#facc15");
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isCanvasVisible, setIsCanvasVisible] = useState<boolean>(true);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState<boolean>(false);
  const [strokeCount, setStrokeCount] = useState<number>(0);

  // Active stroke being recorded
  const currentStrokeRef = useRef<Stroke | null>(null);

  // Redraw all strokes for the current slide using normalized coordinates
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width: cssW, height: cssH } = cssSizeRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isCanvasVisible || cssW <= 0 || cssH <= 0) return;

    const currentStrokes = allSlidesStrokesRef.current[slideId] || [];

    currentStrokes.forEach((stroke) => {
      if (stroke.points.length < 1) return;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.tool === "ERASER") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = stroke.width * 2.5;
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else if (stroke.tool === "HIGHLIGHTER") {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = stroke.width * 2.8;
        ctx.strokeStyle = stroke.color;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = stroke.width;
        ctx.strokeStyle = stroke.color;
      }

      ctx.beginPath();
      const first = stroke.points[0];
      const fx = first.nx * cssW;
      const fy = first.ny * cssH;
      ctx.moveTo(fx, fy);

      if (stroke.points.length === 1) {
        ctx.arc(fx, fy, stroke.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
      } else {
        for (let i = 1; i < stroke.points.length; i++) {
          const pt = stroke.points[i];
          const prev = stroke.points[i - 1];
          const px = prev.nx * cssW;
          const py = prev.ny * cssH;
          const cx = pt.nx * cssW;
          const cy = pt.ny * cssH;
          const midX = (px + cx) / 2;
          const midY = (py + cy) / 2;
          ctx.quadraticCurveTo(px, py, midX, midY);
        }
        const last = stroke.points[stroke.points.length - 1];
        ctx.lineTo(last.nx * cssW, last.ny * cssH);
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [slideId, isCanvasVisible]);

  // Adjust canvas size to match parent container with devicePixelRatio for ultra-sharp stylus rendering
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const targetW = Math.max(280, Math.floor(rect.width));
    const targetH = Math.max(180, Math.floor(rect.height));

    cssSizeRef.current = { width: targetW, height: targetH };

    if (canvas.width !== targetW * dpr || canvas.height !== targetH * dpr) {
      canvas.width = targetW * dpr;
      canvas.height = targetH * dpr;
      canvas.style.width = `${targetW}px`;
      canvas.style.height = `${targetH}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      redrawCanvas();
    }
  }, [redrawCanvas]);

  // When slideId changes, resize and redraw the saved strokes for this slide
  useEffect(() => {
    resizeCanvas();
    const curStrokes = allSlidesStrokesRef.current[slideId] || [];
    setStrokeCount(curStrokes.length);
    redrawCanvas();
  }, [slideId, resizeCanvas, redrawCanvas]);

  // Watch for window resize
  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
    };
    window.addEventListener("resize", handleResize);
    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [resizeCanvas]);

  // Pointer event helpers for stylus, mouse, and touch drawing
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>): StrokePoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { nx: 0, ny: 0 };
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / w));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / h));
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    return { nx, ny, pressure };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingActive || !isCanvasVisible || isSlideLocked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const point = getCanvasCoords(e);
    const adjustedWidth = strokeWidth * (point.pressure ? 0.6 + point.pressure * 0.8 : 1);

    const newStroke: Stroke = {
      tool: activeTool,
      color: selectedColor,
      width: adjustedWidth,
      points: [point],
    };

    currentStrokeRef.current = newStroke;

    const currentSlideStrokes = allSlidesStrokesRef.current[slideId] || [];
    allSlidesStrokesRef.current[slideId] = [...currentSlideStrokes, newStroke];
    setStrokeCount(allSlidesStrokesRef.current[slideId].length);

    const { width: cssW, height: cssH } = cssSizeRef.current;
    const px = point.nx * cssW;
    const py = point.ny * cssH;

    // Draw single point immediately
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    if (activeTool === "ERASER") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(px, py, strokeWidth * 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = activeTool === "HIGHLIGHTER" ? 0.4 : 1.0;
      ctx.beginPath();
      ctx.arc(px, py, adjustedWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = selectedColor;
      ctx.fill();
    }
    ctx.restore();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current || !isDrawingActive || isSlideLocked)
      return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const point = getCanvasCoords(e);
    const stroke = currentStrokeRef.current;
    const prevPoint = stroke.points[stroke.points.length - 1];
    stroke.points.push(point);

    const { width: cssW, height: cssH } = cssSizeRef.current;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (stroke.tool === "ERASER") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = stroke.width * 2.5;
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else if (stroke.tool === "HIGHLIGHTER") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = stroke.width * 2.8;
      ctx.strokeStyle = stroke.color;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = stroke.width;
      ctx.strokeStyle = stroke.color;
    }

    ctx.beginPath();
    ctx.moveTo(prevPoint.nx * cssW, prevPoint.ny * cssH);
    ctx.lineTo(point.nx * cssW, point.ny * cssH);
    ctx.stroke();
    ctx.restore();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    currentStrokeRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    persistStrokes();
    redrawCanvas();
  };

  // Actions: Undo, Clear, Visibility
  const handleUndo = () => {
    if (isSlideLocked) return;
    const curStrokes = allSlidesStrokesRef.current[slideId] || [];
    if (curStrokes.length === 0) return;
    allSlidesStrokesRef.current[slideId] = curStrokes.slice(0, -1);
    setStrokeCount(allSlidesStrokesRef.current[slideId].length);
    persistStrokes();
    redrawCanvas();
  };

  const handleClearSlideDrawing = () => {
    if (isSlideLocked) return;
    allSlidesStrokesRef.current[slideId] = [];
    setStrokeCount(0);
    persistStrokes();
    redrawCanvas();
    onNotify?.("تم مسح الرسم والكتابة اليدوية عن هذه الشريحة.");
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-30 pointer-events-none overflow-hidden select-none ${className}`}
    >
      {/* 1. الطبقة التفاعلية للرسم الحر (HTML5 Canvas) */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: isDrawingActive && !isSlideLocked ? "none" : "auto" }}
        className={`absolute inset-0 w-full h-full ${
          isDrawingActive && !isSlideLocked
            ? "pointer-events-auto cursor-crosshair"
            : "pointer-events-none"
        }`}
      />

      {/* 2. شريط أدوات الرسم العائم (Floating Digital Pen & Whiteboard Toolbar) */}
      <div
        dir="rtl"
        className={`absolute top-3 left-4 z-40 pointer-events-auto transition-all duration-200 ${
          isToolbarCollapsed ? "opacity-85 hover:opacity-100" : ""
        }`}
      >
        <div
          className={`flex items-center gap-1.5 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md border ${
            theme === "light"
              ? "bg-white/95 text-slate-800 border-slate-300"
              : "bg-slate-900/95 text-white border-cyan-500/40"
          }`}
        >
          {isSlideLocked ? (
            <div
              className="px-3 py-1.5 rounded-xl bg-rose-950/90 text-rose-200 border border-rose-500/40 text-xs font-black flex items-center gap-1.5"
              title="الشريحة مقفلة رقمياً بكلمة مرور الأستاذ لمنع أي تعديل أو مسح غير مصرح به"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>الرسم محمي بالقفل الرقمي</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onToggleDrawingActive?.(!isDrawingActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                isDrawingActive
                  ? "bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
              title={
                isDrawingActive
                  ? "إيقاف وضع الرسم للتنقل وتحديد النصوص"
                  : "تفعيل قلم الرسم والشرح اليدوي على الشريحة"
              }
            >
              <Pen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isDrawingActive ? "وضع الرسم نشط" : "قلم الشرح (رسم)"}
              </span>
            </button>
          )}

          {/* عناصر تحكم الأدوات تظهر فقط عند تفعيل وضع الرسم وعندما لا تكون الشريحة مقفلة */}
          {isDrawingActive && !isSlideLocked && !isToolbarCollapsed && (
            <>
              <div className="h-5 w-[1px] bg-slate-700/60 mx-0.5" />

              {/* اختيار نوع الأداة (قلم حبر، قلم تظليل شفاف، ممحاة) */}
              <div className="flex items-center gap-1 bg-slate-950/60 p-0.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTool("PEN")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    activeTool === "PEN"
                      ? "bg-cyan-500 text-slate-950 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  title="قلم كتابة حبر دقيق"
                >
                  <Pen className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden md:inline">قلم</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool("HIGHLIGHTER")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    activeTool === "HIGHLIGHTER"
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  title="قلم تظليل فوسفوري شفاف"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden md:inline">تظليل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTool("ERASER")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    activeTool === "ERASER"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  title="ممحاة للرسم اليدوي"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden md:inline">ممحاة</span>
                </button>
              </div>

              {/* لوحة اختيار الألوان السريعة */}
              {activeTool !== "ERASER" && (
                <div className="flex items-center gap-1 px-1">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setSelectedColor(col.hex)}
                      style={{ backgroundColor: col.hex }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedColor === col.hex
                          ? "scale-115 border-white ring-2 ring-cyan-400 shadow-md"
                          : "border-slate-800 opacity-80 hover:opacity-100 hover:scale-105"
                      }`}
                      title={col.name}
                    />
                  ))}
                </div>
              )}

              {/* اختيار سماكة القلم */}
              <div className="flex items-center bg-slate-950/60 p-0.5 rounded-xl border border-slate-800 text-[11px]">
                {PRESET_WIDTHS.map((w) => (
                  <button
                    key={w.size}
                    type="button"
                    onClick={() => setStrokeWidth(w.size)}
                    className={`px-2 py-1 rounded-lg font-bold cursor-pointer transition ${
                      strokeWidth === w.size
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              <div className="h-5 w-[1px] bg-slate-700/60 mx-0.5" />

              {/* التراجع عن الخطوة السابقة */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={strokeCount === 0}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 cursor-pointer transition"
                title="تراجع عن آخر رسم (Undo)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* مسح جميع رسومات الشريحة الحالية */}
              <button
                type="button"
                onClick={handleClearSlideDrawing}
                disabled={strokeCount === 0}
                className="p-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 disabled:opacity-30 text-rose-300 border border-rose-800/60 cursor-pointer transition flex items-center gap-1 text-[11px]"
                title="مسح جميع الرسومات والكتابة اليدوية على هذه الشريحة"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">مسح الرسم</span>
              </button>

              {/* إظهار / إخفاء الرسومات مؤقتاً */}
              <button
                type="button"
                onClick={() => setIsCanvasVisible((v) => !v)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer transition"
                title={isCanvasVisible ? "إخفاء الرسومات" : "إظهار الرسومات"}
              >
                {isCanvasVisible ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          )}

          {/* زر طي / توسيع شريط أدوات القلم */}
          {isDrawingActive && !isSlideLocked && (
            <button
              type="button"
              onClick={() => setIsToolbarCollapsed((v) => !v)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title={isToolbarCollapsed ? "توسيع شريط الأدوات" : "طي شريط الأدوات"}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}

          {strokeCount > 0 && (!isDrawingActive || isSlideLocked) && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ✏️ {strokeCount} خطوط
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
