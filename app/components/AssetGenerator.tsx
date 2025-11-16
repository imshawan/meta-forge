"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ImageUp, Download } from "lucide-react";
import { hexToRgba } from "@/lib/utils";

const ICON_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512];

type GeneratedIcon = {
  size: number;
  filename: string;
  dataUrl: string;
};

export default function AssetGenerator() {
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [icons, setIcons] = useState<GeneratedIcon[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [appSlug, setAppSlug] = useState("app");

  const [faviconIcoUrl, setFaviconIcoUrl] = useState<string | null>(null);
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null);

  // primary theme + accent colors (shared via localStorage)
  const [themeColor, setThemeColor] = useState("#020617");
  const [primaryColor, setPrimaryColor] = useState("#22c55e");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // hydrate colors from localStorage on first load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = window.localStorage.getItem("metaforge-themeColor");
    const storedPrimary = window.localStorage.getItem("metaforge-primaryColor");
    if (storedTheme) setThemeColor(storedTheme);
    if (storedPrimary) setPrimaryColor(storedPrimary);
  }, []);

  // persist colors whenever they change (so MetadataGenerator can reuse)
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("metaforge-themeColor", themeColor);
  }, [themeColor]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("metaforge-primaryColor", primaryColor);
  }, [primaryColor]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSourcePreview(url);
    setIcons([]);
    setFaviconIcoUrl(null);
    setOgImageUrl(null);
  };

  // helper to build favicon.ico from a 32x32 PNG drawn on canvas
  const generateFaviconIco = (image: HTMLImageElement) => {
    const size = 32;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(image, 0, 0, size, size);

    const pngDataUrl = canvas.toDataURL("image/png");
    const pngBase64 = pngDataUrl.split(",")[1];
    if (!pngBase64) return;

    const pngBinary = atob(pngBase64);
    const pngBytes = new Uint8Array(pngBinary.length);
    for (let i = 0; i < pngBinary.length; i++) {
      pngBytes[i] = pngBinary.charCodeAt(i);
    }

    // ICO header (6 bytes) + 1 ICONDIRENTRY (16 bytes)
    const header = new ArrayBuffer(6 + 16);
    const dv = new DataView(header);

    // ICONDIR
    dv.setUint16(0, 0, true); // reserved
    dv.setUint16(2, 1, true); // type = icon
    dv.setUint16(4, 1, true); // count = 1

    // ICONDIRENTRY
    const widthOffset = 6;
    const heightOffset = 7;
    const colorCountOffset = 8;
    const reservedOffset = 9;
    const planesOffset = 10;
    const bitCountOffset = 12;
    const bytesInResOffset = 14;
    const imageOffsetOffset = 18;

    const headerBytes = new Uint8Array(header);
    headerBytes[widthOffset] = size; // width
    headerBytes[heightOffset] = size; // height
    headerBytes[colorCountOffset] = 0; // no palette
    headerBytes[reservedOffset] = 0;

    dv.setUint16(planesOffset, 1, true);
    dv.setUint16(bitCountOffset, 32, true);
    dv.setUint32(bytesInResOffset, pngBytes.length, true);
    dv.setUint32(imageOffsetOffset, 6 + 16, true); // header + entry

    const icoBytes = new Uint8Array(headerBytes.length + pngBytes.length);
    icoBytes.set(headerBytes, 0);
    icoBytes.set(pngBytes, headerBytes.length);

    const blob = new Blob([icoBytes], { type: "image/x-icon" });
    const url = URL.createObjectURL(blob);
    setFaviconIcoUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });
  };

  // helper to build a 1200x630 OG image using the base icon
  const generateOgImage = (image: HTMLImageElement) => {
    const width = 1200;
    const height = 630;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // background gradient using themeColor
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, themeColor || "#020617");
    gradient.addColorStop(0.4, "#0f172a");
    gradient.addColorStop(1, "#1e293b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // subtle overlay glow using primary color
    const overlayGradient = ctx.createRadialGradient(
      width * 0.2,
      height * 0.3,
      50,
      width * 0.3,
      height * 0.3,
      500
    );
    overlayGradient.addColorStop(0, hexToRgba(primaryColor, 0.45));

    overlayGradient.addColorStop(1, "transparent");
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 0, width, height);

    // icon card
    const iconSize = 256;
    const iconX = 96;
    const iconY = (height - iconSize) / 2;

    const radius = 48;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(iconX + radius, iconY);
    ctx.lineTo(iconX + iconSize - radius, iconY);
    ctx.quadraticCurveTo(
      iconX + iconSize,
      iconY,
      iconX + iconSize,
      iconY + radius
    );
    ctx.lineTo(iconX + iconSize, iconY + iconSize - radius);
    ctx.quadraticCurveTo(
      iconX + iconSize,
      iconY + iconSize,
      iconX + iconSize - radius,
      iconY + iconSize
    );
    ctx.lineTo(iconX + radius, iconY + iconSize);
    ctx.quadraticCurveTo(
      iconX,
      iconY + iconSize,
      iconX,
      iconY + iconSize - radius
    );
    ctx.lineTo(iconX, iconY + radius);
    ctx.quadraticCurveTo(iconX, iconY, iconX + radius, iconY);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = "#020617";
    ctx.fillRect(iconX, iconY, iconSize, iconSize);
    ctx.drawImage(image, iconX, iconY, iconSize, iconSize);
    ctx.restore();

    // simple text placeholders (using appSlug as title)
    ctx.fillStyle = "#e5e7eb";
    ctx.font =
      "700 52px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(appSlug || "your-app", iconX + iconSize + 72, iconY + 90);

    ctx.fillStyle = "#9ca3af";
    ctx.font =
      "400 26px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(
      "Beautiful metadata & icon generator",
      iconX + iconSize + 72,
      iconY + 140
    );

    ctx.fillStyle = primaryColor || "#6ee7b7";
    ctx.font =
      "500 22px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(
      "metaforge.dev / " + (appSlug || "your-app"),
      iconX + iconSize + 72,
      iconY + iconSize - 30
    );

    const dataUrl = canvas.toDataURL("image/png");
    setOgImageUrl(dataUrl);
  };

  const handleGenerate = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    const file = fileInputRef.current.files[0];

    setIsGenerating(true);
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsGenerating(false);
        return;
      }

      const generated: GeneratedIcon[] = [];

      ICON_SIZES.forEach((size) => {
        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(image, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/png");
        generated.push({
          size,
          filename: `${appSlug}-icon-${size}x${size}.png`,
          dataUrl,
        });
      });

      setIcons(generated);

      // generate favicon.ico and OG image in addition to the PNG sizes
      generateFaviconIco(image);
      generateOgImage(image);

      setIsGenerating(false);
    };
  };

  const handleDownloadFavicon = () => {
    if (!faviconIcoUrl && !faviconIcon) return;
    const a = document.createElement("a");
    a.href = faviconIcoUrl ?? faviconIcon!.dataUrl;
    a.download = faviconIcoUrl
      ? `${appSlug || "app"}-favicon.ico`
      : `${appSlug || "app"}-favicon-${faviconIcon!.size}x${
          faviconIcon!.size
        }.png`;
    a.click();
  };

  const handleDownloadOgImage = () => {
    if (!ogImageUrl && !ogPreviewIcon) return;
    const a = document.createElement("a");
    a.href = ogImageUrl ?? ogPreviewIcon!.dataUrl;
    a.download = `${appSlug || "app"}-og-image-1200x630.png`;
    a.click();
  };

  const handleDownloadAll = () => {
    icons.forEach((icon) => {
      const a = document.createElement("a");
      a.href = icon.dataUrl;
      a.download = icon.filename;
      a.click();
    });

    handleDownloadOgImage();
    handleDownloadFavicon();
  };

  // helper to get a specific icon size from the generated list
  const getIconBySize = (size: number) =>
    icons.find((icon) => icon.size === size) ?? null;

  const faviconIcon =
    getIconBySize(32) ?? getIconBySize(16) ?? icons[0] ?? null;
  const ogPreviewIcon =
    getIconBySize(512) ??
    getIconBySize(384) ??
    getIconBySize(256) ??
    icons[icons.length - 1] ??
    null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)]">
        {/* Left: base upload + controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-zinc-50">
                Base icon & app slug
              </h2>
              <p className="text-xs text-zinc-400 sm:text-sm">
                Upload a 512×512 logo, set a slug, and MetaForge will generate
                favicon & PWA icons in all required sizes.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            {/* Upload card */}
            <label className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/80 transition hover:border-emerald-500/80 hover:bg-zinc-900/70">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={handleFileChange}
              />
              {sourcePreview ? (
                <motion.img
                  src={sourcePreview}
                  alt="Source icon"
                  className="h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 px-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900/80">
                    <ImageUp className="h-5 w-5 text-zinc-400 group-hover:text-emerald-400" />
                  </div>
                  <div className="text-sm font-medium text-zinc-200">
                    Drop 512×512 icon
                  </div>
                  <div className="text-xs text-zinc-500">
                    PNG, JPG, or SVG. Prefer a transparent PNG for best results.
                  </div>
                </div>
              )}
            </label>

            {/* Slug + generate controls */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-zinc-300 sm:text-sm">
                App slug (used in file names)
              </label>
              <input
                type="text"
                value={appSlug}
                onChange={(e) => setAppSlug(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-emerald-500/60 ring-offset-0 focus:ring-1"
                placeholder="my-app"
              />

              {/* Primary theme color */}
              <label className="text-xs font-medium text-zinc-300 sm:text-sm">
                Primary theme color
              </label>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-1 outline-none ring-emerald-500/60 ring-offset-0 focus:ring-1"
              />

              {/* Accent / primary color */}
              <label className="text-xs font-medium text-zinc-300 sm:text-sm">
                Accent / primary color
              </label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 px-2 py-1 outline-none ring-emerald-500/60 ring-offset-0 focus:ring-1"
              />

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !fileInputRef.current?.files?.[0]}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2.5 text-sm font-medium text-black shadow-lg shadow-emerald-500/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ImageUp className="h-4 w-4" />
                {isGenerating ? "Generating icons..." : "Generate icons"}
              </button>

              <p className="mt-1 text-[11px] text-zinc-500">
                These icons will be referenced by{" "}
                <code className="rounded bg-zinc-900 px-1 py-0.5">
                  metadata.icons
                </code>{" "}
                and{" "}
                <code className="rounded bg-zinc-900 px-1 py-0.5">
                  site.webmanifest
                </code>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Right: big previews + gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-100 sm:text-base">
              Generated icons
            </h3>
            {icons.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 hover:bg-emerald-500/20"
              >
                <Download className="h-3.5 w-3.5" />
                Download all
              </button>
            )}
          </div>
          {/* Favicon + OG preview row */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Favicon preview */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-3"
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span className="font-medium text-zinc-100">
                  Favicon preview
                </span>
                <span>16×16 / 32×32</span>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950 px-3 py-2 text-xs text-zinc-300 shadow-inner">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-sm bg-zinc-800">
                    {faviconIcon || sourcePreview ? (
                      <img
                        src={faviconIcon?.dataUrl ?? sourcePreview ?? ""}
                        alt="Favicon preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] text-zinc-500">icon</span>
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <span className="font-medium">{appSlug || "your-app"}</span>
                    <span className="ml-1 text-zinc-500">– app</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="h-2 w-6 rounded-full bg-zinc-800" />
                    <span className="h-2 w-3 rounded-full bg-zinc-800" />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                This simulates how the generated favicon will appear in a
                browser tab. Click to download{" "}
                <code className="rounded bg-zinc-900 px-1 py-0.5">
                  favicon.ico
                </code>
                .
              </p>
              {icons.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadFavicon}
                  className="inline-flex items-center justify-center gap-1 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-zinc-800"
                >
                  <Download className="h-3 w-3" />
                  Download favicon
                </button>
              )}
            </motion.div>

            {/* OG image preview */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-3"
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span className="font-medium text-zinc-100">
                  Open Graph preview
                </span>
                <span>1200×630 (card)</span>
              </div>
              <div className="relative flex aspect-[1200/630] overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-fuchsia-500/10 p-3">
                <div className="flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-900">
                  {ogImageUrl || ogPreviewIcon || sourcePreview ? (
                    <img
                      src={
                        ogImageUrl ??
                        ogPreviewIcon?.dataUrl ??
                        sourcePreview ??
                        ""
                      }
                      alt="OG image preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-zinc-500">OG image</span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Uses your base 512×512 icon as the focal artwork for link
                previews. Click to download the{" "}
                <code className="rounded bg-zinc-900 px-1 py-0.5">
                  og-image-1200x630.png
                </code>
                .
              </p>
              {icons.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadOgImage}
                  className="inline-flex items-center justify-center gap-1 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-zinc-800"
                >
                  <Download className="h-3 w-3" />
                  Download OG image
                </button>
              )}
            </motion.div>
          </div>

          {/* Generated icons grid */}
          <div className="space-y-3">
            {icons.length === 0 ? (
              <div className="flex h-44 p-3 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/80 text-xs text-zinc-500 sm:h-52">
                <div className="">
                    No icons generated yet. Upload a base image and click{" "}
                    <span className="mx-1 font-medium text-emerald-400">
                      Generate icons
                    </span>
                    to preview sizes.
                </div>
              </div>
            ) : (
              <div className="grid max-h-[360px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
                {icons.map((icon) => {
                  const previewSize = Math.min(80, icon.size); // keep it readable
                  return (
                    <motion.div
                      key={icon.filename}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/90 p-3 text-center text-[11px] text-zinc-400"
                    >
                      <div className="flex items-center justify-center rounded-xl bg-zinc-900/80 p-2">
                        <img
                          src={icon.dataUrl}
                          alt={icon.filename}
                          className="rounded-md"
                          style={{
                            width: previewSize,
                            height: previewSize,
                          }}
                        />
                      </div>
                      <div className="font-medium text-zinc-200">
                        {icon.size}×{icon.size}
                      </div>
                      <button
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = icon.dataUrl;
                          a.download = icon.filename;
                          a.click();
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-emerald-300 hover:bg-zinc-800"
                      >
                        <Download className="h-3 w-3" />
                        {icon.size} png
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
