export function mapToRange(value: number, min: number, max: number) {
  return (Math.abs(value) % (max - min + 1)) + min;
}
