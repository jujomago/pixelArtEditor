const colorMap = {
  0: "#ffffff",
  1: "#000000",
  2: "#ff595e",
  3: "#ffca3a",
  4: "#8ac926",
  5: "#1982c4",
  6: "#6a4c93",
  7: "#ff924c",
  8: "#00c2a8",
  9: "#c1121f"
};

const pixelArt = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const editor = document.getElementById("matrix-editor");
const pixelArtGrid = document.getElementById("pixel-art");
const legend = document.getElementById("legend");

const selectedCells = new Set();
let isDraggingSelection = false;

function clampCellValue(value) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue)) {
    return 0;
  }

  return Math.max(0, Math.min(9, parsedValue));
}

function getEditableValue(rawText) {
  const onlyDigits = String(rawText).replace(/\D/g, "");
  if (onlyDigits.length === 0) {
    return 0;
  }

  return clampCellValue(onlyDigits[onlyDigits.length - 1]);
}

function getCellKey(rowIndex, columnIndex) {
  return `${rowIndex}:${columnIndex}`;
}

function getCellElement(rowIndex, columnIndex) {
  return editor.querySelector(`[data-row="${rowIndex}"][data-column="${columnIndex}"]`);
}

function clearSelection() {
  selectedCells.forEach((key) => {
    const [rowIndex, columnIndex] = key.split(":");
    const cell = getCellElement(rowIndex, columnIndex);
    if (cell) {
      cell.classList.remove("cell-input--selected");
    }
  });

  selectedCells.clear();
}

function selectCell(rowIndex, columnIndex) {
  const key = getCellKey(rowIndex, columnIndex);
  if (selectedCells.has(key)) {
    return;
  }

  const cell = getCellElement(rowIndex, columnIndex);
  if (!cell) {
    return;
  }

  selectedCells.add(key);
  cell.classList.add("cell-input--selected");
}

function applyValueToSelection(nextValue) {
  selectedCells.forEach((key) => {
    const [rowString, columnString] = key.split(":");
    const rowIndex = Number.parseInt(rowString, 10);
    const columnIndex = Number.parseInt(columnString, 10);

    pixelArt[rowIndex][columnIndex] = nextValue;

    const cell = getCellElement(rowIndex, columnIndex);
    if (cell) {
      cell.textContent = String(nextValue);
    }

    updatePixel(rowIndex, columnIndex, nextValue);
  });
}

function renderLegend() {
  const fragment = document.createDocumentFragment();

  Object.entries(colorMap).forEach(([value, color]) => {
    const item = document.createElement("div");
    item.className = "legend__item";

    const swatch = document.createElement("span");
    swatch.className = "legend__color";
    swatch.style.backgroundColor = color;

    const label = document.createElement("span");
    label.textContent = `${value} = ${color}`;

    item.append(swatch, label);
    fragment.appendChild(item);
  });

  legend.appendChild(fragment);
}

function renderEditor() {
  const fragment = document.createDocumentFragment();

  pixelArt.forEach((row, rowIndex) => {
    row.forEach((cellValue, columnIndex) => {
      const cell = document.createElement("div");
      cell.className = "cell-input";
      cell.contentEditable = "true";
      cell.textContent = String(cellValue);
      cell.dataset.row = String(rowIndex);
      cell.dataset.column = String(columnIndex);
      cell.setAttribute("role", "textbox");
      cell.setAttribute("aria-label", `Fila ${rowIndex + 1}, columna ${columnIndex + 1}`);

      cell.addEventListener("mousedown", (event) => {
        if (event.button !== 0) {
          return;
        }

        event.preventDefault();
        isDraggingSelection = true;
        clearSelection();
        selectCell(rowIndex, columnIndex);
      });

      cell.addEventListener("mouseover", () => {
        if (!isDraggingSelection) {
          return;
        }

        selectCell(rowIndex, columnIndex);
      });

      cell.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
        }
      });

      cell.addEventListener("input", () => {
        const nextValue = getEditableValue(cell.textContent);
        pixelArt[rowIndex][columnIndex] = nextValue;
        cell.textContent = String(nextValue);
        updatePixel(rowIndex, columnIndex, nextValue);
      });

      cell.addEventListener("blur", () => {
        const nextValue = getEditableValue(cell.textContent);
        pixelArt[rowIndex][columnIndex] = nextValue;
        cell.textContent = String(nextValue);
        updatePixel(rowIndex, columnIndex, nextValue);
      });

      fragment.appendChild(cell);
    });
  });

  editor.appendChild(fragment);
}

function createPixel(rowIndex, columnIndex, value) {
  const pixel = document.createElement("div");
  pixel.className = "pixel";
  pixel.dataset.row = String(rowIndex);
  pixel.dataset.column = String(columnIndex);
  pixel.style.backgroundColor = colorMap[value];
  return pixel;
}

function renderPixelArt() {
  const fragment = document.createDocumentFragment();

  pixelArt.forEach((row, rowIndex) => {
    row.forEach((cellValue, columnIndex) => {
      fragment.appendChild(createPixel(rowIndex, columnIndex, cellValue));
    });
  });

  pixelArtGrid.appendChild(fragment);
}

function updatePixel(rowIndex, columnIndex, value) {
  const pixel = pixelArtGrid.querySelector(
    `[data-row="${rowIndex}"][data-column="${columnIndex}"]`
  );

  if (pixel) {
    pixel.style.backgroundColor = colorMap[value];
  }
}

document.addEventListener("mouseup", () => {
  isDraggingSelection = false;
});

document.addEventListener("mousedown", (event) => {
  if (!editor.contains(event.target)) {
    clearSelection();
  }
});

document.addEventListener("keydown", (event) => {
  if (!/^[0-9]$/.test(event.key)) {
    return;
  }

  if (selectedCells.size === 0) {
    return;
  }

  event.preventDefault();
  applyValueToSelection(Number.parseInt(event.key, 10));
});

renderLegend();
renderEditor();
renderPixelArt();
