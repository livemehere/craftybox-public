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
