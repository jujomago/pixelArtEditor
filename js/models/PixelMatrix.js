import { clampToRange, createZeroMatrix, normalizeTextValue } from "../utils/matrixUtils.js";

export class PixelMatrix {
  constructor(initialMatrix, minValue = 0, maxValue = 9) {
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.grid = initialMatrix.map((row) => row.map((value) => this.clamp(value)));
  }

  static createZeroMatrix(size = 20) {
    return createZeroMatrix(size);
  }

  clamp(value) {
    return clampToRange(value, this.minValue, this.maxValue);
  }

  normalizeTextValue(rawText) {
    return normalizeTextValue(rawText, this.minValue, this.maxValue);
  }

  getRowCount() {
    return this.grid.length;
  }

  getColumnCount() {
    return this.grid.length === 0 ? 0 : this.grid[0].length;
  }

  setCell(rowIndex, columnIndex, value) {
    const nextValue = this.clamp(value);
    this.grid[rowIndex][columnIndex] = nextValue;
    return nextValue;
  }

  setGrid(nextGrid) {
    const rowCount = this.getRowCount();
    const columnCount = this.getColumnCount();

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
        const value = nextGrid?.[rowIndex]?.[columnIndex] ?? this.minValue;
        this.grid[rowIndex][columnIndex] = this.clamp(value);
      }
    }
  }

  toArray() {
    return this.grid.map((row) => [...row]);
  }

  forEachCell(callback) {
    this.grid.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        callback(value, rowIndex, columnIndex);
      });
    });
  }
}
