import { CBounds } from '@/lib/simple-canvas/types';

export const drawImg = (
  ctx: CanvasRenderingContext2D,
  base64: string,
  bounds: CBounds
) => {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      ctx.drawImage(img, bounds.x, bounds.y, bounds.width, bounds.height);
      resolve();
    };
    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };
  });
};
