"use client";

import { motion } from "framer-motion";
import { Wand2, FileCode2 } from "lucide-react";
import ToolTabs from "@app/components/ToolTabs";
import AssetGenerator from "@app/components/AssetGenerator";
import MetadataGenerator from "@app/components/MetadataGenerator";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-12 pt-12 sm:px-6 lg:px-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/70 px-3 py-1 text-xs uppercase tracking-wide text-zinc-300">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Meta & PWA toolkit
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            MetaForge
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-400 sm:text-base">
            Generate pixel-perfect favicons and PWA icons, then craft a complete
            Next.js <code className="rounded bg-zinc-900/80 px-1.5 py-0.5">metadata.ts</code> and{" "}
            <code className="rounded bg-zinc-900/80 px-1.5 py-0.5">site.webmanifest</code> from one place.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 shadow-xl shadow-black/40"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500">
            <Wand2 className="h-5 w-5 text-black" />
          </div>
          <div className="text-xs text-zinc-300 sm:text-sm">
            <div className="font-medium text-zinc-100">
              2 tools, 1 workflow
            </div>
            <div className="text-zinc-400">
              Assets first, then metadata & manifest.
            </div>
          </div>
        </motion.div>
      </motion.header>

      <ToolTabs
        tabs={[
          {
            id: "assets",
            label: "1. Metadata Assets",
            description: "Generate favicon & PWA icons from a 512×512 source.",
            icon: <Wand2 className="h-4 w-4" />,
            content: <AssetGenerator />,
          },
          {
            id: "metadata",
            label: "2. Metadata & Manifest",
            description:
              "Create a complete metadata.ts + site.webmanifest configuration.",
            icon: <FileCode2 className="h-4 w-4" />,
            content: <MetadataGenerator />,
          },
        ]}
      />
    </div>
  );
}
