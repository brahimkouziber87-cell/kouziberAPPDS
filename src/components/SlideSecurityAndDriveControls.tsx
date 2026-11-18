import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Cloud,
  FileUp,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Link2,
  X,
  FileText,
  Sparkles,
  Scissors,
} from "lucide-react";
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  listDrivePdfAndPresentationFiles,
  downloadDriveFileAsArrayBuffer,
  uploadPdfFileToDrive,
  extractDriveFileIdFromInput,
  DriveFileItem,
} from "../services/googleDrive";

const TEACHER_LOCK_PWD_STORAGE_KEY = "math_studio_teacher_lock_pwd_v1";
const SLIDE_LOCK_ACTIVE_STORAGE_KEY = "math_studio_slide_lock_active_v1";

export interface UseSlideDigitalLockReturn {
  isSlideLocked: boolean;
  setIsSlideLocked: React.Dispatch<React.SetStateAction<boolean>>;
  openLockModal: () => void;
  closeLockModal: () => void;
  isLockModalOpen: boolean;
  teacherPasswordHash: string;
  handleLockWithPassword: (newPwd: string) => void;
  handleUnlockWithPassword: (enteredPwd: string) => boolean;
}

/**
 * خطاف مشترك (Hook) لإدارة القفل الرقمي للشرائح بكلمة مرور خاصة بالأستاذ
 * يمنع تكرار منطق التحقق من كلمة المرور بين العرض التقديمي Beamer وعارض شرائح PDF المقطّعة
 */
export function useSlideDigitalLock(): UseSlideDigitalLockReturn {
  const [teacherPasswordHash, setTeacherPasswordHash] = useState<string>(() => {
    try {
      return localStorage.getItem(TEACHER_LOCK_PWD_STORAGE_KEY) || "2026";
    } catch {
      return "2026";
    }
  });

  const [isSlideLocked, setIsSlideLocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SLIDE_LOCK_ACTIVE_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [isLockModalOpen, setIsLockModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        SLIDE_LOCK_ACTIVE_STORAGE_KEY,
        isSlideLocked ? "true" : "false"
      );
    } catch {
      // ignore storage errors
    }
  }, [isSlideLocked]);

  const openLockModal = useCallback(() => {
    setIsLockModalOpen(true);
  }, []);

  const closeLockModal = useCallback(() => {
    setIsLockModalOpen(false);
  }, []);

  const handleLockWithPassword = useCallback((newPwd: string) => {
    const clean = newPwd.trim() || "2026";
    setTeacherPasswordHash(clean);
    try {
      localStorage.setItem(TEACHER_LOCK_PWD_STORAGE_KEY, clean);
    } catch {
      // ignore
    }
    setIsSlideLocked(true);
    setIsLockModalOpen(false);
  }, []);

  const handleUnlockWithPassword = useCallback(
    (enteredPwd: string): boolean => {
      if (enteredPwd.trim() === teacherPasswordHash) {
        setIsSlideLocked(false);
        setIsLockModalOpen(false);
        return true;
      }
      return false;
    },
    [teacherPasswordHash]
  );

  return {
    isSlideLocked,
    setIsSlideLocked,
    openLockModal,
    closeLockModal,
    isLockModalOpen,
    teacherPasswordHash,
    handleLockWithPassword,
    handleUnlockWithPassword,
  };
}

interface SlideDigitalLockModalProps {
  isOpen: boolean;
  isSlideLocked: boolean;
  currentSavedPassword: string;
  onClose: () => void;
  onLock: (password: string) => void;
  onUnlock: (password: string) => boolean;
}

export const SlideDigitalLockModal: React.FC<SlideDigitalLockModalProps> = ({
  isOpen,
  isSlideLocked,
  currentSavedPassword,
  onClose,
  onLock,
  onUnlock,
}) => {
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setPasswordInput(isSlideLocked ? "" : currentSavedPassword);
      setErrorMsg("");
    }
  }, [isOpen, isSlideLocked, currentSavedPassword]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSlideLocked) {
      const ok = onUnlock(passwordInput);
      if (!ok) {
        setErrorMsg("كلمة مرور الأستاذ غير صحيحة! يرجى المحاولة من جديد.");
      }
    } else {
      if (passwordInput.trim().length < 3) {
        setErrorMsg("يرجى اختيار كلمة مرور للأستاذ تتكون من 3 رموز على الأقل.");
        return;
      }
      onLock(passwordInput);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                isSlideLocked
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              }`}
            >
              {isSlideLocked ? (
                <Lock className="w-5 h-5" />
              ) : (
                <KeyRound className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {isSlideLocked
                  ? "فك القفل الرقمي للشرائح"
                  : "تفعيل القفل الرقمي للشرائح"}
              </h3>
              <p className="text-[11px] text-slate-400">
                حماية الشرائح والرسومات والتعليقات بكلمة مرور خاصة بالأستاذ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1.5">
            {isSlideLocked ? (
              <div className="flex items-start gap-2 text-rose-200">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  الشرائح محمية حالياً ضد أي تعديل غير مصرح به (الرسم، المسح، أو تعديل/حذف التعليقات). أدخل كلمة مرور الأستاذ لاستئناف التحرير.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-amber-100">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  عند تفعيل القفل الرقمي، يستمر التمرير بين الشرائح وكشف الحلول كالمعتاد، لكن يُمنع تعديل أو مسح الرسومات والملاحظات إلا بكلمة مرور الأستاذ.
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-amber-300 mb-1.5">
              {isSlideLocked
                ? "أدخل كلمة مرور الأستاذ لفك القفل:"
                : "تعيين كلمة مرور الأستاذ للقفل الرقمي:"}
            </label>
            <input
              type="password"
              dir="ltr"
              autoFocus
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setErrorMsg("");
              }}
              placeholder="••••"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-2.5 text-center font-mono text-base tracking-widest text-white focus:outline-none focus:border-amber-400"
            />
            {!isSlideLocked && (
              <p className="text-[11px] text-slate-400 mt-1">
                يمكنك الاحتفاظ بالرمز الافتراضي المحفوظ ({currentSavedPassword}) أو إدخال رمز سري جديد خاص بك.
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg ${
                isSlideLocked
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  : "bg-amber-500 hover:bg-amber-400 text-slate-950"
              }`}
            >
              {isSlideLocked ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>فك قفل الشرائح</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>قفل الشرائح الآن</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface GoogleDrivePdfImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportPdfBuffer: (
    fileName: string,
    arrayBuffer: ArrayBuffer,
    targetMode: "PDF_SLIDESHOW" | "PDF_BEAMER"
  ) => Promise<void> | void;
  defaultTargetMode?: "PDF_SLIDESHOW" | "PDF_BEAMER";
}

export const GoogleDrivePdfImporterModal: React.FC<
  GoogleDrivePdfImporterModalProps
> = ({
  isOpen,
  onClose,
  onImportPdfBuffer,
  defaultTargetMode = "PDF_SLIDESHOW",
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState<boolean>(false);
  const [driveUrlInput, setDriveUrlInput] = useState<string>("");
  const [targetConversionMode, setTargetConversionMode] = useState<
    "PDF_SLIDESHOW" | "PDF_BEAMER"
  >(defaultTargetMode);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAccessToken().then((token) => {
      if (token) setAccessToken(token);
    });
    const unsub = initAuth((user, token) => {
      if (user) {
        setUserEmail(user.email);
      }
      if (token) setAccessToken(token);
    });
    return () => unsub();
  }, []);

  const fetchDrivePdfList = useCallback(async (token: string) => {
    setIsLoadingFiles(true);
    setErrorMessage("");
    try {
      const items = await listDrivePdfAndPresentationFiles(token);
      setDriveFiles(items);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "تعذر جلب قائمة ملفات الـ PDF من Google Drive."
      );
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && accessToken) {
      fetchDrivePdfList(accessToken);
    }
  }, [isOpen, accessToken, fetchDrivePdfList]);

  if (!isOpen) return null;

  const handleConnectGoogleDrive = async () => {
    setErrorMessage("");
    setStatusMessage("جاري الاتصال بحساب Google Drive...");
    try {
      const authResult = await googleSignIn();
      if (authResult) {
        setUserEmail(authResult.user.email);
        if (authResult.accessToken) {
          setAccessToken(authResult.accessToken);
          await fetchDrivePdfList(authResult.accessToken);
        }
      }
      setStatusMessage("");
    } catch (err: any) {
      setStatusMessage("");
      setErrorMessage(
        err?.message || "تعذر تسجيل الدخول إلى حساب Google Drive."
      );
    }
  };

  const handleSelectDriveFile = async (file: DriveFileItem) => {
    if (!accessToken) {
      setErrorMessage("يرجى تسجيل الدخول إلى Google Drive أولاً.");
      return;
    }
    setIsDownloadingId(file.id);
    setErrorMessage("");
    setStatusMessage(
      `جاري استيراد ملف « ${file.name} » مباشرة من Google Drive وتحويله إلى عرض تفاعلي...`
    );
    try {
      const buffer = await downloadDriveFileAsArrayBuffer(accessToken, file.id);
      await onImportPdfBuffer(file.name, buffer, targetConversionMode);
      setStatusMessage("");
      onClose();
    } catch (err: any) {
      setStatusMessage("");
      setErrorMessage(
        err?.message || "تعذر تنزيل ملف PDF من Google Drive."
      );
    } finally {
      setIsDownloadingId(null);
    }
  };

  const handleImportByDriveUrlOrId = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileId = extractDriveFileIdFromInput(driveUrlInput);
    if (!fileId) {
      setErrorMessage(
        "يرجى إدخال رابط ملف Google Drive صحيح أو معرف الملف (File ID)."
      );
      return;
    }
    if (!accessToken) {
      setErrorMessage("يرجى الاتصال بحساب Google Drive أولاً لاستيراد الملف.");
      return;
    }
    setIsDownloadingId(fileId);
    setErrorMessage("");
    setStatusMessage(
      "جاري جلب ملف الـ PDF من رابط Google Drive وتحويله إلى شرائح تفاعلية..."
    );
    try {
      const buffer = await downloadDriveFileAsArrayBuffer(accessToken, fileId);
      const inferredName = `Drive_Document_${fileId.slice(0, 6)}.pdf`;
      await onImportPdfBuffer(inferredName, buffer, targetConversionMode);
      setDriveUrlInput("");
      setStatusMessage("");
      onClose();
    } catch (err: any) {
      setStatusMessage("");
      setErrorMessage(
        err?.message ||
          "تعذر الوصول إلى الملف عبر هذا الرابط. تأكد من صلاحية الوصول في Google Drive."
      );
    } finally {
      setIsDownloadingId(null);
    }
  };

  const handleUploadLocalPdfToDriveAndImport = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!accessToken) {
      setErrorMessage("يرجى تسجيل الدخول إلى Google Drive أولاً.");
      return;
    }
    setIsUploadingToDrive(true);
    setErrorMessage("");
    setStatusMessage(
      `جاري حفظ « ${file.name} » في Google Drive واستيراده للعرض التقديمي التفاعلي...`
    );
    try {
      const localBuffer = await file.arrayBuffer();
      const uploadedItem = await uploadPdfFileToDrive({
        accessToken,
        file,
        description:
          "ملف درس أو فرض رياضيات مرفوع عبر منصة وثائق أستاذ الرياضيات للعرض التقديمي التفاعلي",
      });
      setDriveFiles((prev) => [uploadedItem, ...prev]);
      await onImportPdfBuffer(
        file.name,
        localBuffer.slice(0),
        targetConversionMode
      );
      setStatusMessage("");
      onClose();
    } catch (err: any) {
      setStatusMessage("");
      setErrorMessage(
        err?.message || "تعذر رفع ملف PDF إلى Google Drive."
      );
    } finally {
      setIsUploadingToDrive(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <input
        ref={uploadInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleUploadLocalPdfToDriveAndImport}
        className="hidden"
      />

      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                استيراد ملفات الـ PDF مباشرة من Google Drive
              </h3>
              <p className="text-[11px] text-slate-400">
                اختر ملف PDF من سحابة Google Drive لتحويله فوراً إلى شرائح درس محروس أو عرض Beamer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 studio-scroll">
          {/* اختيار وضع التحويل المطلوب بعد الاستيراد من Google Drive */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-black text-cyan-300 block">
              نمط التحويل التفاعلي بعد الاستيراد من Google Drive:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetConversionMode("PDF_SLIDESHOW")}
                className={`p-3 rounded-xl border text-right flex items-center gap-2.5 cursor-pointer transition ${
                  targetConversionMode === "PDF_SLIDESHOW"
                    ? "bg-amber-500/20 border-amber-400 text-amber-200 font-black"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Scissors className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-black">
                    تقطيع إلى شرائح تفاعلية (Slideshow)
                  </div>
                  <div className="text-[10.5px] opacity-80">
                    تقطيع صفحات الـ PDF إلى شرائح درس محروس مع الرسم والتعليقات
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetConversionMode("PDF_BEAMER")}
                className={`p-3 rounded-xl border text-right flex items-center gap-2.5 cursor-pointer transition ${
                  targetConversionMode === "PDF_BEAMER"
                    ? "bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-200 font-black"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <div>
                  <div className="text-xs font-black">
                    تحويل إلى كتل LaTeX Beamer
                  </div>
                  <div className="text-[10.5px] opacity-80">
                    استخراج المبرهنات والتمارين بالذكاء الاصطناعي وتوليد كود .tex
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* حالة الاتصال بحساب Google Drive */}
          {!accessToken ? (
            <div className="p-6 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-center space-y-3">
              <Cloud className="w-10 h-10 text-cyan-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white">
                  اربط حسابك في Google Drive لاستيراد ملفات الـ PDF
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  يتيح لك الربط الآمن استعراض ملفات الدروس والفروض بصيغة PDF المحفوظة في مجلد التطبيق على Google Drive وتحويلها مباشرة إلى شرائح تفاعلية.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConnectGoogleDrive}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-l from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 text-xs font-black inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Cloud className="w-4 h-4" />
                <span>تسجيل الدخول والاتصال بـ Google Drive</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* شريط الحساب المتصل + زر رفع PDF جديد إلى Drive */}
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">
                    متصل بـ Google Drive {userEmail ? `(${userEmail})` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploadingToDrive}
                    onClick={() => uploadInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>
                      {isUploadingToDrive
                        ? "جاري الرفع والاستيراد..."
                        : "رفع PDF إلى Drive واستيراده"}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoadingFiles}
                    onClick={() => fetchDrivePdfList(accessToken)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 cursor-pointer"
                    title="تحديث قائمة الملفات"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isLoadingFiles ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* استيراد عبر رابط Google Drive مباشر */}
              <form
                onSubmit={handleImportByDriveUrlOrId}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <label className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>
                    استيراد سريع عبر رابط ملف PDF في Google Drive أو معرف الملف:
                  </span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    value={driveUrlInput}
                    onChange={(e) => setDriveUrlInput(e.target.value)}
                    placeholder="https://drive.google.com/file/d/1A2B3C.../view"
                    className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={!driveUrlInput.trim() || Boolean(isDownloadingId)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black cursor-pointer shrink-0"
                  >
                    استيراد من الرابط
                  </button>
                </div>
              </form>

              {/* قائمة ملفات الـ PDF المحفوظة في مجلد Google Drive */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-300">
                  <span>ملفات الـ PDF المتاحة في Google Drive ({driveFiles.length}):</span>
                </div>

                {isLoadingFiles ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>جاري تحميل قائمة ملفات الـ PDF من Google Drive...</span>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-400">
                      لا توجد ملفات PDF محفوظة بعد في مجلد التطبيق على Google Drive.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      اضغط على «رفع PDF إلى Drive واستيراده» بالأعلى لحفظ أي ملف PDF في حسابك السحابي وتحويله فوراً إلى عرض تفاعلي.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 studio-scroll">
                    {driveFiles.map((df) => {
                      const isBusy = isDownloadingId === df.id;
                      return (
                        <div
                          key={df.id}
                          className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between gap-3 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-black text-white truncate">
                                {df.name}
                              </div>
                              <div className="text-[10.5px] text-slate-400 flex items-center gap-2">
                                {df.createdTime && (
                                  <span>
                                    تاريخ الحفظ:{" "}
                                    {new Date(df.createdTime).toLocaleDateString(
                                      "ar-MA"
                                    )}
                                  </span>
                                )}
                                {df.webViewLink && (
                                  <a
                                    href={df.webViewLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                                  >
                                    <span>معاينة في Drive</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={Boolean(isDownloadingId)}
                            onClick={() => handleSelectDriveFile(df)}
                            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            {isBusy ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>جاري التحويل...</span>
                              </>
                            ) : (
                              <>
                                <Cloud className="w-3.5 h-3.5" />
                                <span>استيراد للعرض</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-bold">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
