// Saf oyun mantığı — React'ten bağımsız, test edilebilir.

export const SIZE = 8;
export const PALETTE_COUNT = 8;

// Şekiller string ızgara olarak tanımlanır; '1' dolu hücre.
const SHAPE_STRINGS = [
  ['1'],
  ['11'], ['1', '1'],
  ['111'], ['1', '1', '1'],
  ['1111'], ['1', '1', '1', '1'],
  ['11111'], ['1', '1', '1', '1', '1'],
  ['11', '11'],
  ['111', '111'], ['11', '11', '11'],
  ['111', '111', '111'],
  // küçük L (3 hücre, 4 dönüş)
  ['11', '10'], ['11', '01'], ['10', '11'], ['01', '11'],
  // büyük L (5 hücre, 4 dönüş)
  ['100', '100', '111'], ['111', '100', '100'], ['111', '001', '001'], ['001', '001', '111'],
  // T (4 hücre, 4 dönüş)
  ['111', '010'], ['010', '111'], ['10', '11', '10'], ['01', '11', '01'],
  // S / Z (4 hücre)
  ['011', '110'], ['110', '011'], ['10', '11', '01'], ['01', '11', '10'],
];

export const SHAPES = SHAPE_STRINGS.map((rows, idx) => {
  const cells = [];
  rows.forEach((row, r) => {
    row.split('').forEach((ch, c) => {
      if (ch === '1') cells.push([r, c]);
    });
  });
  return { key: idx, cells, h: rows.length, w: rows[0].length };
});

export function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

let pieceSeq = 0;
export function randomPiece(rng = Math.random) {
  const shape = SHAPES[Math.floor(rng() * SHAPES.length)];
  return {
    id: `p${++pieceSeq}`,
    cells: shape.cells,
    w: shape.w,
    h: shape.h,
    color: Math.floor(rng() * PALETTE_COUNT),
  };
}

export function randomTray(rng = Math.random) {
  return [randomPiece(rng), randomPiece(rng), randomPiece(rng)];
}

export function canPlace(board, piece, row, col) {
  return piece.cells.every(([r, c]) => {
    const rr = row + r;
    const cc = col + c;
    return rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && board[rr][cc] === null;
  });
}

export function anyPlacement(board, piece) {
  for (let r = 0; r <= SIZE - piece.h; r++) {
    for (let c = 0; c <= SIZE - piece.w; c++) {
      if (canPlace(board, piece, r, c)) return true;
    }
  }
  return false;
}

export function placePiece(board, piece, row, col) {
  const next = board.map((r) => r.slice());
  piece.cells.forEach(([r, c]) => {
    next[row + r][col + c] = piece.color;
  });
  return next;
}

export function fullLines(board) {
  const rows = [];
  const cols = [];
  for (let r = 0; r < SIZE; r++) {
    if (board[r].every((v) => v !== null)) rows.push(r);
  }
  for (let c = 0; c < SIZE; c++) {
    let full = true;
    for (let r = 0; r < SIZE; r++) {
      if (board[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) cols.push(c);
  }
  return { rows, cols, count: rows.length + cols.length };
}

export function clearLines(board, lines) {
  const next = board.map((r) => r.slice());
  lines.rows.forEach((r) => {
    for (let c = 0; c < SIZE; c++) next[r][c] = null;
  });
  lines.cols.forEach((c) => {
    for (let r = 0; r < SIZE; r++) next[r][c] = null;
  });
  return next;
}

// Puan: yerleştirilen hücre başına 1; satır/sütun temizliğinde
// 10 * (1+2+..+n) taban puanı, üst üste temizlik serisinde (combo) çarpan.
export function scoreFor(cellsPlaced, linesCleared, combo) {
  let pts = cellsPlaced;
  if (linesCleared > 0) {
    const base = 10 * ((linesCleared * (linesCleared + 1)) / 2);
    const mult = Math.max(1, Math.min(combo, 6));
    pts += base * mult;
  }
  return pts;
}

export function isGameOver(board, pieces) {
  const remaining = pieces.filter(Boolean);
  if (remaining.length === 0) return false;
  return remaining.every((p) => !anyPlacement(board, p));
}
