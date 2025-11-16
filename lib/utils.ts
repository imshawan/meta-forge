
export function hexToRgba(hex: string, alpha: number) {
    if (!hex) {
        return "rgba(16, 185, 129, 0.45)"
    }
  const c = hex.replace("#", "");
  const bigint = parseInt(c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
