export function getGcd(a: number, b: number): number {
  if (b === 0) {
    return a;
  }
  return getGcd(b, a % b);
}

export function getAspectRatio(
    width: number,
    height: number
) {
    const gcdValue = getGcd(width, height);
    return {
        width: width / gcdValue,
        height: height / gcdValue,
    };
} 

/**
 * 
 * @param width 
 * @param height 
 * @param scaleFactor 1 = 100%
 * @returns 
 */
export function getScaledSize(
  width: number,
  height: number,
  scaleFactor: number 
): { width: number; height: number } {
  const gcdValue = getGcd(width, height);
  const _scaleFactor = Math.floor(scaleFactor * 10);
  const scaledWidth = (width / gcdValue) * _scaleFactor;
  const scaledHeight = (height / gcdValue) * _scaleFactor;
  console.log(gcdValue, _scaleFactor, width/gcdValue);

  return {
    width: scaledWidth,
    height: scaledHeight,
  };
}