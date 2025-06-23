export const setupCanvasSize = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  scaleFactor: number
): void => {
  canvas.width = width * scaleFactor;
  canvas.height = height * scaleFactor;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
};
