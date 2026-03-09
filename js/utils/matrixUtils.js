export function clampToRange(value, minValue, maxValue) {
  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue)) {
    return minValue;
  }

  return Math.max(minValue, Math.min(maxValue, parsedValue));
}

export function normalizeTextValue(rawText, minValue, maxValue) {
  const onlyDigits = String(rawText).replace(/\D/g, "");
  if (onlyDigits.length === 0) {
    return minValue;
  }

  return clampToRange(onlyDigits[onlyDigits.length - 1], minValue, maxValue);
}

export function createZeroMatrix(size = 20) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
}
