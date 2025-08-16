import React, { useMemo, useState } from "react";

export default function Board({ board, locks = [], onLock, onUnlock, onMove, wrongCell }) {
  if (!board) return null;

  const grid = useMemo(
    () => Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => board[r * 9 + c])),
    [board]
  );

  const [editing, setEditing] = useState(null);
  const [localValues, setLocalValues] = useState({});

  const isLocked = (r, c) => locks?.some((l) => l.r === r && l.c === c);

  const handleFocus = (r, c) => {
    setEditing(`${r}-${c}`);
    onLock && onLock(r, c);
  };

  const handleBlur = (r, c) => {
    setEditing(null);
    onUnlock && onUnlock(r, c);
    // clear local input state for this cell
    setLocalValues((s) => {
      const key = `${r}-${c}`;
      if (!s[key]) return s;
      const ns = { ...s };
      delete ns[key];
      return ns;
    });
  };

  const handleChange = (r, c, e) => {
    const raw = (e.target.value || "").trim().slice(0, 1);
    const key = `${r}-${c}`;
    setLocalValues((s) => ({ ...s, [key]: raw }));
    if (/^[1-9]$/.test(raw)) {
      const v = Number(raw);
      onMove && onMove(r, c, v);
      // keep local shown until server state arrives; clear editing to release lock
      // Optionally blur after entry:
      // e.target.blur();
    }
    if (raw === "") {
      // allow clearing local display only (do not send zero by default)
      setLocalValues((s) => {
        const ns = { ...s };
        delete ns[key];
        return ns;
      });
    }
  };

  const [wr, wc] = wrongCell ? [wrongCell.r, wrongCell.c] : [-1, -1];
  const [hr, hc] = editing ? editing.split("-").map(Number) : [-1, -1];

  const sameBox = (r, c, r2, c2) =>
    Math.floor(r / 3) === Math.floor(r2 / 3) && Math.floor(c / 3) === Math.floor(c2 / 3);

  return (
    <div className="board" role="grid" aria-label="sudoku-board">
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const key = `${r}-${c}`;
          const locked = isLocked(r, c);
          const isWrong = cell?.wrong === true;
          const localKey = `${r}-${c}`;
          const localValue = localValues[localKey];
          const displayValue =
            typeof localValue !== "undefined"
              ? localValue
              : cell?.value && cell.value !== 0
              ? String(cell.value)
              : "";
          const isHighlight = hr > -1 && (r === hr || c === hc || sameBox(r, c, hr, hc));

          const classes = [
            "cell",
            cell?.fixed ? "fixed" : "",
            locked ? "locked" : "",
            isWrong ? "wrong" : "",
            isHighlight ? "highlight" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={key}
              role="gridcell"
              aria-label={`cell-${r}-${c}`}
              data-row={r}
              data-col={c}
              className={classes}
            >
              {cell?.fixed ? (
                <div className="cell-value" aria-hidden>
                  {cell.value}
                </div>
              ) : (
                <input
                  inputMode="numeric"
                  maxLength={1}
                  value={displayValue}
                  onFocus={() => handleFocus(r, c)}
                  onBlur={() => handleBlur(r, c)}
                  onChange={(e) => handleChange(r, c, e)}
                  readOnly={locked}
                  aria-label={`input-${r}-${c}`}
                  style={isWrong ? { color: 'var(--cell-wrong-text)' } : {}}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
