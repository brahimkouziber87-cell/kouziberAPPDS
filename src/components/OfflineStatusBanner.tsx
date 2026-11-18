import React, { useEffect, useState } from "react";
import { WifiOff, Database } from "lucide-react";

/**
 * مؤشر ذكي للعمل دون إنترنت (Offline-First Indicator) وفق متطلبات PWA
 * يظهر فقط عند انقطاع الاتصال بالإنترنت لطمأنة الأستاذ بحفظ وثائقه محلياً واستمرار التوليد الرياضي.
 */
export const OfflineStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      dir="rtl"
      role="status"
      aria-live="polite"
      className="no-print fixed bottom-16 lg:bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl border border-amber-400/50 bg-slate-950/95 px-3.5 py-2 text-xs text-amber-200 shadow-xl backdrop-blur-md"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <div className="leading-snug">
        <span className="font-black text-amber-300">وضع العمل دون إنترنت (Offline)</span>
        <span className="block text-[10.5px] text-slate-300 flex items-center gap-1 mt-0.5">
          <Database className="w-3 h-3 text-emerald-400 inline" />
          <span>المحرك الرياضي والتخزين المحلي (LocalStorage) يعملان بكفاءة تامة.</span>
        </span>
      </div>
    </div>
  );
};
