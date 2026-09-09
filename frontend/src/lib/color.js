// Convierte un hex (#rrggbb) a "r, g, b" para poder armar rgba() dinámicamente.
export function hexToRgbTriplet(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
