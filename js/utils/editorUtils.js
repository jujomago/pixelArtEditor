export function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function getCellKey(rowIndex, columnIndex) {
  return `${rowIndex}:${columnIndex}`;
}

export function parseCellKey(key) {
  const [rowString, columnString] = key.split(":");
  return {
    rowIndex: Number.parseInt(rowString, 10),
    columnIndex: Number.parseInt(columnString, 10),
  };
}

export function hexToRgba(hexColor, alpha) {
  const normalized = String(hexColor).replace("#", "");
  const safeHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const red = Number.parseInt(safeHex.slice(0, 2), 16);
  const green = Number.parseInt(safeHex.slice(2, 4), 16);
  const blue = Number.parseInt(safeHex.slice(4, 6), 16);

  if ([red, green, blue].some((value) => Number.isNaN(value))) {
    return "rgba(255, 255, 255, 0.2)";
  }

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
