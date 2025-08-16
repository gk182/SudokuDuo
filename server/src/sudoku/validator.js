export const toIndex = (r, c) => r * 9 + c;

export function isMoveValid(board, r, c, value) {
  if (value < 1 || value > 9) return false;
  // row
  for (let j = 0; j < 9; j++) {
    const v = board[toIndex(r, j)].value;
    if (j !== c && v === value) return false;
  }
  // col
  for (let i = 0; i < 9; i++) {
    const v = board[toIndex(i, c)].value;
    if (i !== r && v === value) return false;
  }
  // box
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      const v = board[toIndex(i, j)].value;
      if (!(i === r && j === c) && v === value) return false;
    }
  }
  return true;
}
