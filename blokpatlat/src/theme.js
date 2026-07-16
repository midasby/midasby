// Koyu lacivert zemin + canlı "şeker" blok paleti (Block Blast estetiği).

export const colors = {
  bg: '#171A3B',
  boardBg: '#10122B',
  cellEmpty: '#1E2148',
  cellBorder: '#282C5C',
  text: '#FFFFFF',
  textDim: '#8F94C4',
  gold: '#FFD335',
  overlay: 'rgba(10, 11, 30, 0.88)',
};

// engine.PALETTE_COUNT ile aynı uzunlukta olmalı.
export const blockPalette = [
  '#FF5A5F', // kırmızı
  '#FFA033', // turuncu
  '#FFD335', // sarı
  '#4CE05B', // yeşil
  '#35D5E5', // camgöbeği
  '#4D8DFF', // mavi
  '#9B5BFF', // mor
  '#FF5BD0', // pembe
];

export function lighten(hex, amt = 0.35) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + Math.round(255 * amt));
  const g = Math.min(255, ((n >> 8) & 255) + Math.round(255 * amt));
  const b = Math.min(255, (n & 255) + Math.round(255 * amt));
  return `rgb(${r},${g},${b})`;
}

export function darken(hex, amt = 0.35) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * (1 - amt));
  const g = Math.round(((n >> 8) & 255) * (1 - amt));
  const b = Math.round((n & 255) * (1 - amt));
  return `rgb(${r},${g},${b})`;
}
