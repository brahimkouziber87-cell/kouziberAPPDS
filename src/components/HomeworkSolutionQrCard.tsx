import React, { useMemo, useState } from "react";
import {
  QrCode,
  ExternalLink,
  Copy,
  Check,
  FileCheck2,
  Calendar,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  HomeworkSolutionLinkParams,
  buildHomeworkSolutionLink,
  generateHomeworkAssignmentVerificationCode,
  generateIsoQrMatrix,
} from "../utils/qrCodeHelper";

export interface HomeworkSolutionQrCardProps {
  homeworkId: string;
  dmNumber: string;
  titleAr?: string;
  dueDate: string;
  trackCode: string;
  trackTitleAr: string;
  trackTitleFr: string;
  semester: "S1" | "S2";
  moroccanDMType?: string;
  docLang: "AR" | "FR";
  variationSeed?: number;
  lessonIndices?: number[];
  system?: string;
  compactHeaderBadge?: boolean;
  onOpenSolutionPage?: () => void;
}

export const HomeworkSolutionQrCard: React.FC<HomeworkSolutionQrCardProps> = ({
  homeworkId,
  dmNumber,
  titleAr,
  dueDate,
  trackCode,
  trackTitleAr,
  trackTitleFr,
  semester,
  moroccanDMType = "RECHERCHE_SYNTHESE",
  docLang,
  variationSeed = 0,
  lessonIndices = [],
  system = "MAROC_NATIONAL",
  compactHeaderBadge = false,
  onOpenSolutionPage,
}) => {
  const [copied, setCopied] = useState(false);
  const isAr = docLang === "AR";

  const linkParams = useMemo<HomeworkSolutionLinkParams>(
    () => ({
      homeworkId,
      dmNumber,
      titleAr,
      dueDate,
      system,
      trackCode,
      semester,
      moroccanDMType,
      docLang,
      variationSeed,
      lessonIndices,
    }),
    [
      homeworkId,
      dmNumber,
      titleAr,
      dueDate,
      system,
      trackCode,
      semester,
      moroccanDMType,
      docLang,
      variationSeed,
      lessonIndices,
    ]
  );

  const solutionUrl = useMemo(
    () => buildHomeworkSolutionLink(linkParams),
    [linkParams]
  );

  const verificationCode = useMemo(
    () => generateHomeworkAssignmentVerificationCode(linkParams),
    [linkParams]
  );

  const qrMatrix = useMemo(
    () => generateIsoQrMatrix(solutionUrl, "M"),
    [solutionUrl]
  );

  const margin = 2;
  const viewBoxSize = qrMatrix.length + margin * 2;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!solutionUrl) return;
    navigator.clipboard.writeText(solutionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (compactHeaderBadge) {
    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="inline-flex items-center gap-2.5 bg-white border-2 border-emerald-800 rounded-xl p-2 shadow-2xs avoid-break"
        title={
          isAr
            ? `رمز QR فريد للولوج المباشر لصفحة حل الفرض المنزلي (${dmNumber})`
            : `QR Code unique vers la page du corrigé du Devoir Maison (${dmNumber})`
        }
      >
        <div className="bg-white p-1 rounded border border-slate-300 shrink-0">
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            width="54"
            height="54"
            shapeRendering="crispEdges"
            className="block"
            aria-label={`Homework Solution QR ${verificationCode}`}
          >
            <rect
              x="0"
              y="0"
              width={viewBoxSize}
              height={viewBoxSize}
              fill="#ffffff"
            />
            {qrMatrix.map((row, rIdx) =>
              row.map((cell, cIdx) =>
                cell ? (
                  <rect
                    key={`${rIdx}-${cIdx}`}
                    x={cIdx + margin}
                    y={rIdx + margin}
                    width={1}
                    height={1}
                    fill="#064e3b"
                  />
                ) : null
              )
            )}
          </svg>
        </div>

        <div className="space-y-0.5 text-[10px]">
          <div className="font-black text-emerald-950 flex items-center gap-1">
            <QrCode className="w-3 h-3 text-emerald-700 shrink-0" />
            <span>
              {isAr
                ? `رابط الحل النموذجي (${dmNumber})`
                : `Corrigé Direct (${dmNumber})`}
            </span>
          </div>
          <div className="font-mono text-[8.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded inline-block">
            {verificationCode}
          </div>
          {onOpenSolutionPage && (
            <div className="no-print pt-0.5">
              <button
                type="button"
                onClick={onOpenSolutionPage}
                className="text-[9.5px] font-extrabold text-indigo-700 hover:text-indigo-900 underline cursor-pointer flex items-center gap-0.5"
              >
                <span>{isAr ? "فتح صفحة الحل" : "Voir Corrigé"}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      data-homework-qr-id={homeworkId}
      data-homework-verification-pin={verificationCode}
      className="avoid-break mt-4 border-2 border-emerald-900 rounded-xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-3.5 shadow-2xs text-slate-900 select-none overflow-hidden max-w-full"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* مصفوفة رمز QR الفريد الخاص بالفرض المنزلي */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="relative bg-white p-2 rounded-xl border-2 border-emerald-900 shadow-2xs flex flex-col items-center justify-center"
            title={
              isAr
                ? "امسح رمز الاستجابة السريعة لفتح صفحة الحل النموذجي المفصل لهذا الفرض المنزلي"
                : "Scannez ce QR Code unique pour ouvrir directement la page du corrigé détaillé de ce Devoir Maison"
            }
          >
            <svg
              viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              width="88"
              height="88"
              shapeRendering="crispEdges"
              className="block"
              aria-label={`Unique Homework Solution QR Code ${verificationCode}`}
            >
              <rect
                x="0"
                y="0"
                width={viewBoxSize}
                height={viewBoxSize}
                fill="#ffffff"
              />
              {qrMatrix.map((row, rIdx) =>
                row.map((cell, cIdx) =>
                  cell ? (
                    <rect
                      key={`${rIdx}-${cIdx}`}
                      x={cIdx + margin}
                      y={rIdx + margin}
                      width={1}
                      height={1}
                      fill="#064e3b"
                    />
                  ) : null
                )
              )}
            </svg>
            <span className="mt-1 text-[8px] font-mono font-black tracking-wider text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
              {verificationCode}
            </span>
          </div>

          {/* تفاصيل الفرض المنزلي وتوجيهات المسح الضوئي لصفحة الحل */}
          <div className={`space-y-1 ${isAr ? "text-right" : "text-left"}`}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-900 text-white text-[10px] font-black tracking-wide">
                <QrCode className="w-3 h-3 text-amber-300" />
                {isAr
                  ? `رمز QR فريد لصفحة حل الفرض المنزلي (${dmNumber})`
                  : `QR Code Unique — Page Corrigé du Devoir Maison (${dmNumber})`}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-100 text-teal-950 border border-teal-300 text-[9px] font-bold font-mono">
                <ShieldCheck className="w-3 h-3 text-teal-700" />
                ID: {homeworkId}
              </span>
            </div>

            <p className="text-[11px] font-bold text-slate-800 leading-snug max-w-xl">
              {isAr
                ? `يولد هذا الرمز رابطاً فريداً مخصصاً للفرض المنزلي (${
                    titleAr || dmNumber
                  }) يوجه التلميذ(ة) مباشرةً إلى صفحة عناصر الإجابة والتصحيح النموذجي المفصل وسلم التنقيط.`
                : `Ce QR Code unique dédié au Devoir Maison (${dmNumber}) redirige directement l'élève vers la page complète du corrigé détaillé et du barème de notation.`}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[9.5px] font-bold text-slate-700">
              <span className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded">
                {isAr ? trackTitleAr : trackTitleFr}
              </span>
              <span className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded font-mono flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5 text-emerald-700" />
                <span>
                  {isAr
                    ? `تاريخ الإرجاع: ${dueDate}`
                    : `À rendre le : ${dueDate}`}
                </span>
              </span>
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded font-mono">
                PIN: {verificationCode}
              </span>
            </div>
          </div>
        </div>

        {/* الجانب الأيسر/الأيمن: الرابط الفريد + أزرار المعاينة والنسخ الفورية (.no-print) */}
        <div className="flex flex-col items-stretch sm:items-end justify-between gap-2 w-full sm:w-auto max-w-full min-w-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
          <div
            className="text-[9px] text-slate-700 font-mono bg-white/90 border border-emerald-300 rounded-lg px-2.5 py-1.5 max-w-full sm:max-w-[230px] truncate text-left"
            dir="ltr"
          >
            <div className="flex items-center gap-1 text-[8.5px] font-sans font-bold text-emerald-800 mb-0.5">
              <Smartphone className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
              <span>
                {isAr
                  ? "رابط الولوج المباشر لصفحة الحل النموذجي:"
                  : "Lien direct vers la page du corrigé :"}
              </span>
            </div>
            <span className="text-slate-900 font-semibold">{solutionUrl}</span>
          </div>

          <div className="no-print flex flex-wrap items-center gap-1.5">
            {onOpenSolutionPage && (
              <button
                type="button"
                onClick={onOpenSolutionPage}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                title={
                  isAr
                    ? "الانتقال المباشر لصفحة الحل النموذجي المفصل لهذا الفرض المنزلي"
                    : "Ouvrir directement la page du corrigé détaillé de ce Devoir Maison"
                }
              >
                <FileCheck2 className="w-3 h-3" />
                <span>
                  {isAr ? "فتح صفحة الحل مباشرة" : "Ouvrir Page Corrigé"}
                </span>
                <ExternalLink className="w-2.5 h-2.5 opacity-80" />
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-bold transition-colors cursor-pointer"
              title={
                isAr
                  ? "نسخ رابط صفحة الحل النموذجي الخاص بهذا الفرض المنزلي"
                  : "Copier le lien direct vers la page du corrigé"
              }
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-emerald-700" />
              )}
              <span>
                {copied
                  ? isAr
                    ? "تم نسخ رابط الحل!"
                    : "Lien copié !"
                  : isAr
                  ? "نسخ رابط الحل"
                  : "Copier le lien"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
