"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Tab = {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

interface ToolTabsProps {
  tabs: Tab[];
}

export default function ToolTabs({ tabs }: ToolTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex flex-wrap gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-2 backdrop-blur-md">
        {tabs.map((tab) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              className={[
                "relative flex flex-1 items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition-all sm:text-sm",
                "border border-transparent",
                selected
                  ? "text-zinc-50"
                  : "text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/70",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                {tab.icon && (
                  <span
                    className={
                      selected ? "text-emerald-400" : "text-zinc-500"
                    }
                  >
                    {tab.icon}
                  </span>
                )}
                <span className="font-medium">{tab.label}</span>
              </div>
              {tab.description && (
                <span className="hidden text-[11px] text-zinc-500 sm:block">
                  {tab.description}
                </span>
              )}

              {selected && (
                <motion.div
                  layoutId="tabHighlight"
                  className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-sky-500/10 to-fuchsia-500/10 shadow-[0_0_40px_rgba(16,185,129,0.45)]"
                  transition={{ type: "spring", stiffness: 250, damping: 24 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab?.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-2xl shadow-black/50 sm:p-6"
        >
          {activeTab?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
