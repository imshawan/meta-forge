"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileOutput, Copy, Download } from "lucide-react";
import { buildMetadataTs, type MetadataFormValues } from "@/lib/metadata-builder";
import { buildManifest } from "@/lib/manifest-builder";

export default function MetadataGenerator() {
  const [values, setValues] = useState<MetadataFormValues>({
    appName: "MetaForge",
    baseUrl: "https://example.com",
    titleDefault: "MetaForge",
    titleTemplate: "%s | MetaForge",
    absoluteTitle: "",
    description:
      "Generate Next.js metadata.ts and site.webmanifest files with complete SEO and PWA fields.",
    keywords: "nextjs, metadata, manifest, seo, pwa",
    authorName: "Your Name",
    authorUrl: "",
    creator: "",
    publisher: "",
    themeColor: "#0f172a",
    primaryColor: "#22c55e",
    twitterHandle: "@yourhandle",
    ogImagePath: "/meta-og.png",
    slug: "metaforge",
  });

  // sync primary theme + accent colors from step 1 (AssetGenerator)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = window.localStorage.getItem("metaforge-themeColor");
    const storedPrimary = window.localStorage.getItem("metaforge-primaryColor");
    if (!storedTheme && !storedPrimary) return;

    setValues((v) => ({
      ...v,
      themeColor: storedTheme ?? v.themeColor,
      primaryColor: storedPrimary ?? v.primaryColor,
    }));
  }, []);

  const metadataSource = buildMetadataTs(values);
  const manifestSource = buildManifest(
    values.appName,
    values.slug,
    values.themeColor,
    "#020617",
    ""
  );

  const update = (patch: Partial<MetadataFormValues>) =>
    setValues((v) => ({ ...v, ...patch }));

  const copyToClipboard = (text: string) =>
    navigator.clipboard?.writeText(text).catch(() => {});

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)]">
      {/* Form */}
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">
            Metadata & manifest blueprint
          </h2>
          <p className="text-xs text-zinc-400 sm:text-sm">
            Fill in your app details, and we’ll generate a{" "}
            <code className="rounded bg-zinc-900 px-1 py-0.5">metadata.ts</code>{" "}
            that aligns with the full <code>Metadata</code> interface, plus a
            ready-to-use <code>site.webmanifest</code>. Use the assets generated in
            the first tab (<code>/favicon.ico</code>, icons, and OG images) to wire
            everything together.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Application name"
            value={values.appName}
            onChange={(v) => update({ appName: v })}
          />
          <Field
            label="Slug (used in icon paths)"
            value={values.slug}
            onChange={(v) => update({ slug: v })}
          />
          <Field
            label="Base URL"
            value={values.baseUrl}
            onChange={(v) => update({ baseUrl: v })}
            placeholder="https://example.com"
          />
          <Field
            label="Title default"
            value={values.titleDefault}
            onChange={(v) => update({ titleDefault: v })}
          />
          <Field
            label="Title template"
            value={values.titleTemplate}
            onChange={(v) => update({ titleTemplate: v })}
            placeholder="%s | My App"
          />
          <Field
            label="Absolute title (optional)"
            value={values.absoluteTitle ?? ""}
            onChange={(v) => update({ absoluteTitle: v })}
            placeholder="Overrides template when set"
          />
          <Field
            label="Primary theme color"
            type="color"
            value={values.themeColor}
            onChange={(v) => update({ themeColor: v })}
            className="h-10"
            
          />
          <Field
            label="Accent / primary color"
            type="color"
            value={values.primaryColor}
            onChange={(v) => update({ primaryColor: v })}
            className="h-10"
          />
        </div>

        <Field
          label="Description"
          textarea
          value={values.description}
          onChange={(v) => update({ description: v })}
        />

        <Field
          label="Keywords (comma-separated)"
          value={values.keywords}
          onChange={(v) => update({ keywords: v })}
        />

        <div className="grid gap-4 sm:grid-cols-3 mt-3">
          <Field
            label="Author name"
            value={values.authorName}
            onChange={(v) => update({ authorName: v })}
          />
          <Field
            label="Author URL"
            value={values.authorUrl ?? ""}
            onChange={(v) => update({ authorUrl: v })}
          />
          <Field
            label="Twitter handle"
            value={values.twitterHandle ?? ""}
            onChange={(v) => update({ twitterHandle: v })}
            placeholder="@username"
          />
        </div>

        <Field
          label="Open Graph image path (relative)"
          value={values.ogImagePath ?? ""}
          onChange={(v) => update({ ogImagePath: v })}
          placeholder="/og-image.png"
        />
      </div>

      {/* Outputs */}
      <div className="space-y-5">
        <OutputCard
          title="metadata.ts"
          subtitle="Next.js Metadata object"
          content={metadataSource}
          onCopy={() => copyToClipboard(metadataSource)}
          onDownload={() => downloadFile("metadata.ts", metadataSource)}
        />

        <OutputCard
          title="site.webmanifest"
          subtitle="PWA manifest file"
          content={manifestSource}
          onCopy={() => copyToClipboard(manifestSource)}
          onDownload={() => downloadFile("site.webmanifest", manifestSource)}
        />
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
  className?: string;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  type = "text",
  className = ""
}: FieldProps) {
  return (
    <label className="space-y-1.5 text-xs sm:text-sm">
      <span className="font-medium text-zinc-200">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={
            `w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-emerald-500/60 focus:ring-1 ${className}`
          }
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={
            `w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-emerald-500/60 focus:ring-1 ${className}`
          }
        />
      )}
    </label>
  );
}

type OutputCardProps = {
  title: string;
  subtitle: string;
  content: string;
  onCopy: () => void;
  onDownload: () => void;
};

function OutputCard({
  title,
  subtitle,
  content,
  onCopy,
  onDownload,
}: OutputCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[360px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/90"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900">
            <FileOutput className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-100">
              {title}
            </div>
            <div className="text-[11px] text-zinc-500">{subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>
          <button
            onClick={onDownload}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[11px] font-medium text-black hover:bg-emerald-400"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
        </div>
      </div>
      <pre className="scrollbar-thin scrollbar-thumb-zinc-700/80 scrollbar-track-transparent h-full overflow-auto bg-gradient-to-b from-zinc-950 to-black px-3 py-3 text-[11px] leading-relaxed text-zinc-200">
        <code>{content}</code>
      </pre>
    </motion.div>
  );
}
