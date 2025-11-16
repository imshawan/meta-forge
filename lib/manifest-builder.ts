export function buildManifest(
  appName: string,
  slug: string,
  themeColor: string,
  backgroundColor: string,
  basePath = ""
): string {
  const iconBase = `${basePath.replace(/\/$/, "")}/icons/${slug}`;

  const sizes = [192, 256, 384, 512];

  const icons = sizes.map((s) => ({
    src: `${iconBase}-icon-${s}x${s}.png`,
    sizes: `${s}x${s}`,
    type: "image/png",
    purpose: "any maskable",
  }));

  const manifest = {
    name: appName,
    short_name: appName,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: backgroundColor,
    theme_color: themeColor,
    icons,
  };

  return JSON.stringify(manifest, null, 2);
}
