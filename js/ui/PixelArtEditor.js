import { PixelMatrix } from "../models/PixelMatrix.js";
import {
  delay,
  getCellKey,
  hexToRgba,
  parseCellKey,
} from "../utils/editorUtils.js";

export class PixelArtEditor {
  constructor(options) {
    this.colorMap = options.colorMap;
    this.matrix = options.matrix;
    this.templates = options.templates;

    this.editor = document.getElementById("matrix-editor");
    this.pixelArtGrid = document.getElementById("pixel-art");
    this.legend = document.getElementById("legend");
    this.templateSelector = document.getElementById("pixel-art-template");
    this.clearGridButton = document.getElementById("clear-grid-btn");
    this.exportGridButton = document.getElementById("export-grid-btn");
    this.exportImageButton = document.getElementById("export-image-btn");
    this.colorPickerInput = null;
    this.activeLegendValue = null;

    this.selectedCells = new Set();
    this.isDraggingSelection = false;
    this.dragFillValue = null;
    this.lastSingleEdit = null;
    this.templateAnimationToken = 0;
    this.isTemplateAnimating = false;
  }

  init() {
    this.bindGlobalEvents();
    this.bindThemeToggle();
    // this.bindPaletteSelector();
    this.bindTemplateSelector();
    this.bindActionButtons();
    this.bindScaleButtons();
    this.bindExportImageButton();
    this.setupColorPicker();
    this.renderLegend();
    this.renderEditor();
    this.renderPixelArt();
    //this.updatePaletteUI("classic");
  }

  bindThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");
    if (!themeToggle) {
      return;
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      themeToggle.querySelector(".theme-toggle-icon").textContent = "☀️";
    }

    themeToggle.addEventListener("click", () => {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        themeToggle.querySelector(".theme-toggle-icon").textContent = "🌙";
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        themeToggle.querySelector(".theme-toggle-icon").textContent = "☀️";
        localStorage.setItem("theme", "dark");
      }
    });
  }

  getCellElement(rowIndex, columnIndex) {
    return this.editor.querySelector(
      `[data-row="${rowIndex}"][data-column="${columnIndex}"]`,
    );
  }

  getEditorCellBackground(value) {
    const color = this.colorMap[value];
    if (!color) {
      return "rgba(255, 255, 255, 0.2)";
    }

    return hexToRgba(color, 0.2);
  }

  updateEditorCellAppearance(cell, value) {
    if (!cell) {
      return;
    }

    cell.style.backgroundColor = this.getEditorCellBackground(value);
  }

  clearSelection() {
    this.selectedCells.forEach((key) => {
      const { rowIndex, columnIndex } = parseCellKey(key);
      const cell = this.getCellElement(rowIndex, columnIndex);
      if (cell) {
        cell.classList.remove("cell-input--selected");
      }
    });

    this.selectedCells.clear();
  }

  selectCell(rowIndex, columnIndex) {
    const key = getCellKey(rowIndex, columnIndex);
    if (this.selectedCells.has(key)) {
      return;
    }

    const cell = this.getCellElement(rowIndex, columnIndex);
    if (!cell) {
      return;
    }

    this.selectedCells.add(key);
    cell.classList.add("cell-input--selected");
  }

  applyValueToCell(rowIndex, columnIndex, value, shouldRecordLastEdit = false) {
    const nextValue = this.matrix.setCell(rowIndex, columnIndex, value);
    const cell = this.getCellElement(rowIndex, columnIndex);

    if (cell) {
      cell.textContent = String(nextValue);
      this.updateEditorCellAppearance(cell, nextValue);
    }

    this.updatePixel(rowIndex, columnIndex, nextValue);
    if (shouldRecordLastEdit) {
      this.lastSingleEdit = { rowIndex, columnIndex, value: nextValue };
    }

    return nextValue;
  }

  applyValueToSelection(nextValue) {
    this.selectedCells.forEach((key) => {
      const { rowIndex, columnIndex } = parseCellKey(key);
      this.applyValueToCell(rowIndex, columnIndex, nextValue, false);
    });
  }

  isAdjacentToLastEditedCell(rowIndex, columnIndex) {
    if (!this.lastSingleEdit) {
      return false;
    }

    const rowDistance = Math.abs(this.lastSingleEdit.rowIndex - rowIndex);
    const columnDistance = Math.abs(
      this.lastSingleEdit.columnIndex - columnIndex,
    );

    if (rowDistance === 0 && columnDistance === 0) {
      return false;
    }

    return rowDistance <= 1 && columnDistance <= 1;
  }

  startSelection(rowIndex, columnIndex) {
    this.isDraggingSelection = true;
    this.clearSelection();
    this.selectCell(rowIndex, columnIndex);

    if (this.isAdjacentToLastEditedCell(rowIndex, columnIndex)) {
      this.dragFillValue = this.lastSingleEdit.value;
      this.applyValueToCell(rowIndex, columnIndex, this.dragFillValue, false);
      return;
    }

    this.dragFillValue = null;
  }

  continueSelection(rowIndex, columnIndex) {
    this.selectCell(rowIndex, columnIndex);

    if (this.dragFillValue !== null) {
      this.applyValueToCell(rowIndex, columnIndex, this.dragFillValue, false);
    }
  }

  bindTemplateSelector() {
    if (!this.templateSelector) {
      return;
    }

    this.templateSelector.addEventListener("change", () => {
      this.loadTemplate(this.templateSelector.value);
    });
  }

  bindActionButtons() {
    if (this.clearGridButton) {
      this.clearGridButton.addEventListener("click", () => {
        this.clearGrid();
      });
    }

    if (this.exportGridButton) {
      this.exportGridButton.addEventListener("click", () => {
        this.exportGrid();
      });
    }
  }

  bindScaleButtons() {
    const scaleButtons = document.querySelectorAll(".scale-btn");
    scaleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        scaleButtons.forEach((b) => b.classList.remove("scale-btn--active"));
        btn.classList.add("scale-btn--active");
        const scale = btn.dataset.scale;
        this.pixelArtGrid.setAttribute("data-scale", scale);
      });
    });

    const defaultBtn = document.querySelector('.scale-btn[data-scale="1"]');
    if (defaultBtn) {
      defaultBtn.classList.add("scale-btn--active");
    }
  }

  bindExportImageButton() {
    if (!this.exportImageButton) {
      return;
    }

    this.exportImageButton.addEventListener("click", () => {
      this.exportImage();
    });
  }

  exportImage() {
    const rows = this.matrix.getRowCount();
    const cols = this.matrix.getColumnCount();
    const pixelSize = 16;
    const canvas = document.createElement("canvas");
    canvas.width = cols * pixelSize;
    canvas.height = rows * pixelSize;
    const ctx = canvas.getContext("2d");

    this.matrix.forEachCell((value, rowIndex, columnIndex) => {
      const color = this.colorMap[value] || "#ffffff";
      ctx.fillStyle = color;
      ctx.fillRect(
        columnIndex * pixelSize,
        rowIndex * pixelSize,
        pixelSize,
        pixelSize,
      );
    });

    const link = document.createElement("a");
    link.download = `pixel-art-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  setupColorPicker() {
    if (this.colorPickerInput) {
      return;
    }

    const input = document.createElement("input");
    input.type = "color";
    input.style.position = "fixed";
    input.style.opacity = "0.01";
    input.style.pointerEvents = "auto";
    input.style.width = "36px";
    input.style.height = "36px";
    input.style.border = "0";
    input.style.padding = "0";
    input.style.zIndex = "9999";
    input.addEventListener("input", () => {
      if (this.activeLegendValue === null) {
        return;
      }

      const nextColor = input.value.toLowerCase();
      this.colorMap[this.activeLegendValue] = nextColor;
      this.updateLegendItem(this.activeLegendValue, nextColor);
      //this.refreshPaletteAcrossGrid();
    });

    document.body.appendChild(input);
    this.colorPickerInput = input;
  }

  openColorPickerForValue(value, event) {
    if (!this.colorPickerInput) {
      return;
    }

    this.activeLegendValue = value;
    const currentColor = this.colorMap[value] ?? "#ffffff";

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const x = event?.clientX ?? Math.floor(viewportWidth / 2);
    const y = event?.clientY ?? Math.floor(viewportHeight / 2);

    const left = Math.max(0, Math.min(viewportWidth - 36, x - 18));
    const top = Math.max(0, Math.min(viewportHeight - 36, y - 18));
    this.colorPickerInput.style.left = `${left}px`;
    this.colorPickerInput.style.top = `${top}px`;
    this.colorPickerInput.value = currentColor;
    this.colorPickerInput.focus();

    if (typeof this.colorPickerInput.showPicker === "function") {
      this.colorPickerInput.showPicker();
      return;
    }

    this.colorPickerInput.click();
  }

  updateLegendItem(value, color) {
    const item = this.legend.querySelector(`[data-value="${value}"]`);
    if (!item) {
      return;
    }

    const swatch = item.querySelector(".legend__color");
    const label = item.querySelector(".legend__label");

    if (swatch) {
      swatch.style.backgroundColor = color;
    }

    if (label) {
      label.textContent = `${value} = ${color}`;
    }
  }

  /*refreshPaletteAcrossGrid() {
    this.matrix.forEachCell((value, rowIndex, columnIndex) => {
      const cell = this.getCellElement(rowIndex, columnIndex);
      if (cell) {
        this.updateEditorCellAppearance(cell, value);
      }

      this.updatePixel(rowIndex, columnIndex, value);
    });
  }*/
  resetInteractionState() {
    this.clearSelection();
    this.dragFillValue = null;
    this.lastSingleEdit = null;
  }

  syncRenderedGridWithMatrix() {
    this.matrix.forEachCell((value, rowIndex, columnIndex) => {
      const cell = this.getCellElement(rowIndex, columnIndex);
      if (cell) {
        cell.textContent = String(value);
        this.updateEditorCellAppearance(cell, value);
      }

      this.updatePixel(rowIndex, columnIndex, value);
    });
  }

  resetGridToZero() {
    const zeroGrid = PixelMatrix.createZeroMatrix(this.matrix.getRowCount());
    this.matrix.setGrid(zeroGrid);
    this.syncRenderedGridWithMatrix();
  }

  clearGrid(cancelAnimation = true) {
    if (cancelAnimation) {
      this.templateAnimationToken += 1;
      this.isTemplateAnimating = false;
    }

    this.resetInteractionState();
    this.resetGridToZero();
  }

  exportGrid() {
    const payload = {
      rows: this.matrix.getRowCount(),
      columns: this.matrix.getColumnCount(),
      matrix: this.matrix.toArray(),
    };

    const fileNameDate = new Date().toISOString().replace(/[.:]/g, "-");
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `pixel-art-${fileNameDate}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async loadTemplate(templateKey) {
    const templateFactory = this.templates[templateKey];
    if (!templateFactory) {
      return;
    }

    const currentToken = ++this.templateAnimationToken;
    this.isTemplateAnimating = true;

    this.clearGrid(false);

    const targetGrid = templateFactory();
    const drawSteps = [];

    for (let rowIndex = 0; rowIndex < targetGrid.length; rowIndex += 1) {
      for (
        let columnIndex = 0;
        columnIndex < targetGrid[rowIndex].length;
        columnIndex += 1
      ) {
        const value = targetGrid[rowIndex][columnIndex];
        if (value !== 0) {
          drawSteps.push({ rowIndex, columnIndex, value });
        }
      }
    }

    for (let index = 0; index < drawSteps.length; index += 1) {
      if (currentToken !== this.templateAnimationToken) {
        return;
      }

      const step = drawSteps[index];
      this.applyValueToCell(step.rowIndex, step.columnIndex, step.value, false);
      await delay(14);
    }

    if (currentToken === this.templateAnimationToken) {
      this.isTemplateAnimating = false;
    }
  }

  renderLegend() {
    const fragment = document.createDocumentFragment();
    this.legend.textContent = "";

    Object.entries(this.colorMap).forEach(([value, color]) => {
      const item = document.createElement("div");
      item.className = "legend__item";
      item.dataset.value = value;

      const swatch = document.createElement("span");
      swatch.className = "legend__color";
      swatch.style.backgroundColor = color;
      swatch.title = `Cambiar color ${value}`;
      swatch.addEventListener("click", (event) => {
        this.openColorPickerForValue(value, event);
      });

      const label = document.createElement("span");
      label.className = "legend__label";
      label.textContent = `${value} = ${color}`;

      item.append(swatch, label);
      fragment.appendChild(item);
    });

    this.legend.appendChild(fragment);
  }

  renderEditor() {
    const fragment = document.createDocumentFragment();

    this.matrix.forEachCell((cellValue, rowIndex, columnIndex) => {
      const cell = document.createElement("div");
      cell.className = "cell-input";
      cell.contentEditable = "true";
      cell.textContent = String(cellValue);
      this.updateEditorCellAppearance(cell, cellValue);
      cell.dataset.row = String(rowIndex);
      cell.dataset.column = String(columnIndex);
      cell.setAttribute("role", "textbox");
      cell.setAttribute(
        "aria-label",
        `Fila ${rowIndex + 1}, columna ${columnIndex + 1}`,
      );

      cell.addEventListener("mousedown", (event) => {
        if (event.button !== 0 || this.isTemplateAnimating) {
          return;
        }

        event.preventDefault();
        this.startSelection(rowIndex, columnIndex);
      });

      cell.addEventListener("mouseover", () => {
        if (!this.isDraggingSelection || this.isTemplateAnimating) {
          return;
        }

        this.continueSelection(rowIndex, columnIndex);
      });

      cell.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
        }
      });

      cell.addEventListener("input", () => {
        if (this.isTemplateAnimating) {
          return;
        }

        const normalizedValue = this.matrix.normalizeTextValue(
          cell.textContent,
        );
        this.applyValueToCell(rowIndex, columnIndex, normalizedValue, true);
      });

      cell.addEventListener("blur", () => {
        if (this.isTemplateAnimating) {
          return;
        }

        const normalizedValue = this.matrix.normalizeTextValue(
          cell.textContent,
        );
        this.applyValueToCell(rowIndex, columnIndex, normalizedValue, true);
      });

      fragment.appendChild(cell);
    });

    this.editor.appendChild(fragment);
  }

  createPixel(rowIndex, columnIndex, value) {
    const pixel = document.createElement("div");
    pixel.className = "pixel";
    pixel.dataset.row = String(rowIndex);
    pixel.dataset.column = String(columnIndex);
    pixel.style.backgroundColor = this.colorMap[value];
    return pixel;
  }

  renderPixelArt() {
    const fragment = document.createDocumentFragment();

    this.matrix.forEachCell((value, rowIndex, columnIndex) => {
      fragment.appendChild(this.createPixel(rowIndex, columnIndex, value));
    });

    this.pixelArtGrid.appendChild(fragment);
  }

  updatePixel(rowIndex, columnIndex, value) {
    const pixel = this.pixelArtGrid.querySelector(
      `[data-row="${rowIndex}"][data-column="${columnIndex}"]`,
    );
    if (!pixel) {
      return;
    }

    pixel.style.backgroundColor = this.colorMap[value];
  }

  bindGlobalEvents() {
    document.addEventListener("mouseup", () => {
      this.isDraggingSelection = false;
      this.dragFillValue = null;
    });

    document.addEventListener("mousedown", (event) => {
      if (!this.editor.contains(event.target)) {
        this.clearSelection();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (this.isTemplateAnimating) {
        return;
      }

      if (!/^[0-9]$/.test(event.key)) {
        return;
      }

      if (this.selectedCells.size === 0) {
        return;
      }

      event.preventDefault();
      const nextValue = Number.parseInt(event.key, 10);
      this.applyValueToSelection(nextValue);

      if (this.selectedCells.size === 1) {
        const onlyKey = this.selectedCells.values().next().value;
        const { rowIndex, columnIndex } = parseCellKey(onlyKey);
        this.lastSingleEdit = { rowIndex, columnIndex, value: nextValue };
      }
    });
  }
}
