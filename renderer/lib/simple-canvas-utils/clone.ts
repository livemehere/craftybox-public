import { CBounds } from '@/lib/simple-canvas-utils/types';

export const cropCanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  scaleFactor: number,
  bounds?: CBounds
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context is not available');
  }

  const cropX = bounds ? bounds.x : 0;
  const cropY = bounds ? bounds.y : 0;
  const cropWidth = bounds ? bounds.width : width;
  const cropHeight = bounds ? bounds.height : height;

  // Set the canvas size
  canvas.width = cropWidth * scaleFactor;
  canvas.height = cropHeight * scaleFactor;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the cropped area
  ctx.drawImage(
    canvas,
    cropX * scaleFactor,
    cropY * scaleFactor,
    cropWidth * scaleFactor,
    cropHeight * scaleFactor,
    0,
    0,
    cropWidth * scaleFactor,
    cropHeight * scaleFactor
  );

  // Reset the canvas style size
  canvas.style.width = `${cropWidth}px`;
  canvas.style.height = `${cropHeight}px`;
  return canvas;
};
