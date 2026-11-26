import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Command,
  ArrowRight,
  X,
} from "lucide-react";

export interface CommandItem {
  id: string;
  category: "EXPORT" | "LAYOUT_PRINT" | "CLASSROOM_DIDACTIC" | "MODE_SETTINGS" | "NAVIGATION";
  titleAr: string;
  titleFr: string;
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string[];
}

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFr?: boolean;
  commands: CommandItem[];
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  isFr = false,
  commands,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCommands = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((cmd) => {
      const matchAr = cmd.titleAr.toLowerCase().includes(q);
      const matchFr = cmd.titleFr.toLowerCase().includes(q);
      const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchAr || matchFr || matchKeywords;
    });
  }, [commands, searchQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  const categoryLabels = {
    EXPORT: { ar: "التصدير والطباعة", fr: "Export & Reprographie" },
    LAYOUT_PRINT: { ar: "هندسة الورقة والهوامش A4", fr: "Mise en page & Marges A4" },
    CLASSROOM_DIDACTIC: { ar: "العرض بالقسم والديداكتيك", fr: "Projection en Classe & Didactique" },
    MODE_SETTINGS: { ar: "أنماط العمل والإعدادات", fr: "Modes d'interface & Réglages" },
    NAVIGATION: { ar: "التنقل السريع", fr: "Navigation Rapide" },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
        dir={isFr ? "ltr" : "rtl"}
        onKeyDown={handleKeyDown}
      >
        {/* حقل البحث السريع */}
        <div className="relative flex items-center border-b border-slate-800 px-4 py-3 bg-slate-950">
          <Command className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isFr
                ? "Tapez une commande ou recherchez (ex: PDF, Marges, Projection, Modèle B)..."
                : "اكتب أمراً أو ابحث (مثال: تصدير PDF، عرض بالقسم، مسار، هوامش، نموذج B)..."
            }
            className="w-full bg-transparent border-0 px-3 text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block font-mono text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* قائمة النتائج المصنفة */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-bold">
                {isFr ? "Aucune commande trouvée" : "لم يتم العثور على أي أمر مطابق للبحث"}
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;
              const catLabel = isFr
                ? categoryLabels[cmd.category]?.fr
                : categoryLabels[cmd.category]?.ar;

              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition text-xs ${
                    isSelected
                      ? "bg-cyan-600/25 border border-cyan-500/50 text-white shadow-sm"
                      : "hover:bg-slate-800/80 text-slate-300 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-cyan-500 text-slate-950 font-bold"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold truncate text-white">
                        {isFr ? cmd.titleFr : cmd.titleAr}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {catLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <span className="font-mono text-[10px] bg-slate-950 border border-slate-700 text-cyan-300 px-1.5 py-0.5 rounded">
                        {cmd.shortcut}
                      </span>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* الشريط السفلي للمعلومات والاختصارات */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              ↑↓ <strong className="text-slate-300">{isFr ? "Naviguer" : "تنقل"}</strong>
            </span>
            <span>
              ↵ <strong className="text-slate-300">{isFr ? "Exécuter" : "تنفيذ"}</strong>
            </span>
          </div>
          <span className="font-mono text-[10px] text-cyan-300">
            {filteredCommands.length} {isFr ? "actions prêtes" : "أمراً متاحاً"}
          </span>
        </div>
      </div>
    </div>
  );
};
