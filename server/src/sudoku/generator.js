// generator.js (ESM)
// API: generatePuzzle(difficulty = 'easy', symmetry = 'paired')
// Trả về { board: number[81], solution: number[81] } với 0 là ô trống.

const DIFFICULTY = {
  easy:   { minClues: 36, maxRemoveTries: 200 },
  medium: { minClues: 30, maxRemoveTries: 260 },
  hard:   { minClues: 26, maxRemoveTries: 320 },
  expert: { minClues: 22, maxRemoveTries: 420 }
};

// ============ Helpers ============
const ROW = (i) => Math.floor(i / 9);
const COL = (i) => i % 9;
const BOX = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);
const NUMS = [1,2,3,4,5,6,7,8,9];

function randChoice(arr) {
  return arr[(Math.random() * arr.length) | 0];
}
function shuffled(arr) {
  const a = arr.slice();
  for (let i=a.length-1; i>0; i--) {
    const j = (Math.random() * (i+1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============ Bitmask helpers ============
const MASK_ALL = 0b1111111110; // bits 1..9 set (bit 0 unused)
const BIT = n => 1 << n;

function bitCandidates(rowMask, colMask, boxMask, r, c) {
  // allowed = ~(row|col|box) & MASK_ALL
  const used = rowMask[r] | colMask[c] | boxMask[BOX(r,c)];
  return (~used) & MASK_ALL;
}
function pickFromMask(mask) {
  const opts = [];
  for (let n=1; n<=9; n++) if (mask & BIT(n)) opts.push(n);
  return randChoice(opts);
}

// ============ Full grid generator ============
function generateFullGrid() {
  const grid = new Array(81).fill(0);
  const rowMask = Array(9).fill(0);
  const colMask = Array(9).fill(0);
  const boxMask = Array(9).fill(0);

  // order cells using randomized boxes then cells (giúp sinh nhanh & đa dạng)
  const order = [];
  const boxes = shuffled([0,1,2,3,4,5,6,7,8]);
  for (const b of boxes) {
    const r0 = Math.floor(b / 3) * 3;
    const c0 = (b % 3) * 3;
    const cells = shuffled([
      [r0+0,c0+0],[r0+0,c0+1],[r0+0,c0+2],
      [r0+1,c0+0],[r0+1,c0+1],[r0+1,c0+2],
      [r0+2,c0+0],[r0+2,c0+1],[r0+2,c0+2],
    ]);
    for (const [r,c] of cells) order.push(r*9+c);
  }

  function dfs(idx) {
    if (idx === 81) return true;
    const i = order[idx];
    const r = ROW(i), c = COL(i), b = BOX(r,c);
    let candMask = bitCandidates(rowMask, colMask, boxMask, r, c);

    // randomize trying order
    const nums = [];
    for (let n=1; n<=9; n++) if (candMask & BIT(n)) nums.push(n);
    const tryOrder = shuffled(nums);

    for (const n of tryOrder) {
      grid[i] = n;
      rowMask[r] |= BIT(n);
      colMask[c] |= BIT(n);
      boxMask[b] |= BIT(n);

      if (dfs(idx+1)) return true;

      rowMask[r] &= ~BIT(n);
      colMask[c] &= ~BIT(n);
      boxMask[b] &= ~BIT(n);
      grid[i] = 0;
    }
    return false;
  }

  dfs(0);
  return grid;
}

// ============ Solver (đếm nghiệm tối đa 2 để kiểm tra unique) ============
function countSolutions(board, limit = 2) {
  const grid = board.slice();
  const rowMask = Array(9).fill(0);
  const colMask = Array(9).fill(0);
  const boxMask = Array(9).fill(0);

  // init masks
  for (let i=0; i<81; i++) {
    const n = grid[i];
    if (n) {
      const r = ROW(i), c = COL(i), b = BOX(r,c);
      if (rowMask[r] & BIT(n) || colMask[c] & BIT(n) || boxMask[b] & BIT(n)) {
        return 0; // invalid given board
      }
      rowMask[r] |= BIT(n);
      colMask[c] |= BIT(n);
      boxMask[b] |= BIT(n);
    }
  }

  // choose cell with minimum candidates (MRV)
  function nextCell() {
    let bestIdx = -1, bestCount = 10, bestMask = 0;
    for (let i=0; i<81; i++) {
      if (grid[i] === 0) {
        const r = ROW(i), c = COL(i);
        const mask = bitCandidates(rowMask, colMask, boxMask, r, c);
        if (mask === 0) return { idx: i, count: 0, mask: 0 };
        let cnt = 0;
        for (let n=1; n<=9; n++) if (mask & BIT(n)) cnt++;
        if (cnt < bestCount) {
          bestCount = cnt; bestIdx = i; bestMask = mask;
          if (cnt === 1) break;
        }
      }
    }
    return { idx: bestIdx, count: bestCount, mask: bestMask };
  }

  let solutions = 0;
  function dfs() {
    if (solutions >= limit) return; // early stop
    // find next
    let { idx, count, mask } = nextCell();
    if (idx === -1) { // solved
      solutions++;
      return;
    }
    if (count === 0) return;

    // try candidates — to avoid bias, randomize a bit
    const candidates = [];
    for (let n=1; n<=9; n++) if (mask & BIT(n)) candidates.push(n);
    // no need to shuffle for counting unique; but still okay
    for (const n of candidates) {
      const r = ROW(idx), c = COL(idx), b = BOX(r,c);
      grid[idx] = n;
      rowMask[r] |= BIT(n); colMask[c] |= BIT(n); boxMask[b] |= BIT(n);

      dfs();

      rowMask[r] &= ~BIT(n); colMask[c] &= ~BIT(n); boxMask[b] &= ~BIT(n);
      grid[idx] = 0;
      if (solutions >= limit) return;
    }
  }
  dfs();
  return solutions;
}

function hasUniqueSolution(board) {
  return countSolutions(board, 2) === 1;
}

// ============ Puncher (đục lỗ theo độ khó + đối xứng) ============
function pairedIndex(i) {
  // đối xứng qua tâm
  return 80 - i;
}

function makePuzzleFromFull(full, difficulty, symmetry = 'paired') {
  const { minClues, maxRemoveTries } = DIFFICULTY[difficulty] || DIFFICULTY.easy;
  let puzzle = full.slice();
  let clues = 81;
  let tries = 0;

  // thứ tự xoá: random 0..80
  const order = shuffled([...Array(81).keys()]);

  for (let k = 0; k < order.length && tries < maxRemoveTries; k++) {
    const i = order[k];
    if (puzzle[i] === 0) continue;

    const j = (symmetry === 'paired') ? pairedIndex(i)
            : (symmetry === 'none') ? i
            : pairedIndex(i); // default paired

    const toRemove = (i === j) ? [i] : [i, j];

    // kiểm tra còn đủ clues?
    const need = toRemove.reduce((acc, idx) => acc + (puzzle[idx] ? 1 : 0), 0);
    if (clues - need < minClues) continue;

    // thử xoá tạm
    const backup = toRemove.map(idx => puzzle[idx]);
    toRemove.forEach(idx => puzzle[idx] = 0);

    if (hasUniqueSolution(puzzle)) {
      clues -= need; // giữ xoá
    } else {
      // hoàn lại
      toRemove.forEach((idx, t) => puzzle[idx] = backup[t]);
    }
    tries++;
  }

  return puzzle;
}

// ============ Public API ============
export function generatePuzzle(difficulty = 'easy', symmetry = 'paired') {
  const solution = generateFullGrid();             // full valid grid
  const board = makePuzzleFromFull(solution, difficulty, symmetry); // punch holes w/ uniqueness
  return { board, solution };
}
