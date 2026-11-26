import React, { useMemo, useState } from "react";
import {
  Bookmark,
  Layers,
  Play,
  Plus,
  Search,
  Sparkles,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import {
  FavoriteItemType,
  FavoritePedagogicalItem,
} from "../utils/pedagogicalFavorites";

export interface PedagogicalFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoritePedagogicalItem[];
  onRemoveFavorite?: (id: string) => void;
  onDeleteFavorite?: (id: string) => void;
  onApplyFavoriteBlueprint?: (fav: FavoritePedagogicalItem) => void;
  onApplyBlueprint?: (blueprintOrFav: any) => void;
  onInsertFavoriteExercise?: (fav: FavoritePedagogicalItem) => void;
  onInsertExercise?: (exerciseOrFav: any) => void;
  currentTrackCode?: string;
  currentSemester?: "S1" | "S2";
  isFr?: boolean;
  onNotify?: (type: "success" | "error" | "info", msg: string) => void;
}

export const PedagogicalFavoritesModal: React.FC<PedagogicalFavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onDeleteFavorite,
  onApplyFavoriteBlueprint,
  onApplyBlueprint,
  onInsertFavoriteExercise,
  onInsertExercise,
  currentTrackCode,
  currentSemester,
  isFr = false,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"ALL" | FavoriteItemType>("ALL");
  const [filterTrack, setFilterTrack] = useState<"ALL" | "CURRENT">("ALL");

  const filteredItems = useMemo(() => {
    return favorites.filter((item) => {
      if (filterType !== "ALL" && item.type !== filterType) return false;
      if (
        filterTrack === "CURRENT" &&
        currentTrackCode &&
        item.trackCode &&
        item.trackCode !== currentTrackCode
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const haystack = [
          item.titleAr,
          item.titleFr,
          item.subtitleAr || "",
          item.trackLabelAr || "",
          ...(item.tags || []),
          item.payload?.descriptionAr || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [favorites, filterType, filterTrack, currentTrackCode, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      dir={isFr ? "ltr" : "rtl"}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border-2 border-amber-400/80 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-950 text-white p-5 flex items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 text-amber-300 border border-white/25 flex items-center justify-center font-black shadow-inner">
              <Star className="w-6 h-6 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  مكتبة النماذج والتمارين المفضلة (Bibliothèque des Favoris)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[11px] font-black">
                  {favorites.length} عناصر
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                حفظ سريع للنماذج المعتمدة والتمارين التوليفية النموذجية للرجوع إليها وإعادة إدراجها بضغطة زر واحدة.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Filter Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالعنوان، الدرس، المسلك أو الوسوم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-white border border-slate-300 font-bold focus:outline-none focus:border-amber-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200/90 text-xs font-black shadow-2xs">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterType === "ALL"
                    ? "bg-amber-400 text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                الكل ({favorites.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("EXAM_BLUEPRINT")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  filterType === "EXAM_BLUEPRINT"
                    ? "bg-indigo-950 text-amber-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3 h-3 text-amber-400" />
                <span>نماذج الفروض</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType("CUSTOM_EXERCISE")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  filterType === "CUSTOM_EXERCISE"
                    ? "bg-indigo-950 text-amber-300 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>تمارين مخصصة</span>
              </button>
            </div>
          </div>

          {currentTrackCode && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold">تصفية حسب المسلك الحالي:</span>
              <button
                type="button"
                onClick={() =>
                  setFilterTrack((v) => (v === "CURRENT" ? "ALL" : "CURRENT"))
                }
                className={`px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer ${
                  filterTrack === "CURRENT"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-black"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                {filterTrack === "CURRENT" ? "✓ " : ""}
                فقط مسلك ({currentTrackCode})
              </button>
            </div>
          )}
        </div>

        {/* Favorites List */}
        <div className="flex-1 overflow-y-auto studio-scroll p-4 sm:p-5 space-y-3.5">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-400 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
                <Bookmark className="w-7 h-7 stroke-1" />
              </div>
              <h3 className="text-sm font-black text-slate-800">
                لا توجد عناصر مطابقة في قائمة المفضلة
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                يمكنك الضغط على رمز النجمة ★ بجانب أي نموذج فرض أو تمرين لإضافته فوراً إلى هذه القائمة والرجوع إليه لاحقاً.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isBlueprint = item.type === "EXAM_BLUEPRINT";
              return (
                <div
                  key={item.id}
                  className="bg-white hover:bg-slate-50/70 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isBlueprint
                            ? "bg-indigo-100 text-indigo-900 border border-indigo-200"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        }`}
                      >
                        {isBlueprint ? (
                          <Layers className="w-3 h-3 text-indigo-700" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-emerald-700" />
                        )}
                        <span>{isBlueprint ? "نموذج فرض كامل" : "تمرين مخصص"}</span>
                      </span>

                      {item.trackCode && (
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-black font-mono">
                          {item.trackCode} {item.dsKey ? `· ${item.dsKey}` : ""}
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.addedAt || item.createdAt || Date.now()).toLocaleDateString("ar-MA")}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 leading-snug">
                      {isFr ? item.titleFr : item.titleAr}
                    </h4>

                    {item.subtitleAr && (
                      <p className="text-xs text-slate-600 font-medium">
                        {item.subtitleAr}
                      </p>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-amber-700" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                    {isBlueprint ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (onApplyBlueprint) {
                            onApplyBlueprint(item.blueprintData || item);
                          } else if (onApplyFavoriteBlueprint) {
                            onApplyFavoriteBlueprint(item);
                          }
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-amber-300 border border-indigo-700 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="تطبيق هذا النموذج فوراً على بيئة العمل الحالية"
                      >
                        <Play className="w-3.5 h-3.5 fill-amber-300" />
                        <span>تطبيق الفرض</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (onInsertExercise) {
                            onInsertExercise(item.exerciseData || item.payload?.lessonData || item);
                          } else if (onInsertFavoriteExercise) {
                            onInsertFavoriteExercise(item);
                          }
                          onClose();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-800 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="إدراج هذا التمرين المفضل في ورقة المعاينة الحالية"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إدراج في الفرض</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteFavorite) onDeleteFavorite(item.id);
                        else if (onRemoveFavorite) onRemoveFavorite(item.id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                      title="إزالة من المفضلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-500 font-semibold shrink-0">
          <div className="flex items-center gap-1.5 text-amber-900">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            <span>
              يتم حفظ المفضلات تلقائياً في ذاكرة المتصفح المحلية لتظل متاحة في جميع الجلسات.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
