/**
 * A function that calculates the max values of
 * two arrays and combines them into one.
 */
export function maxArray(a: number[], b: number[]) {
  if (a.length !== b.length) {
    throw new Error("Unequal array lengths");
  }
  return a.map((value, index) => (value > b[index] ? value : b[index]));
}
