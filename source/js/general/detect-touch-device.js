// Detect touch device

export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints;
}
