export function sum(numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

export function arraysEqualAsSets<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1 === arr2) {
    return true;
  }

  if (arr1 === null || arr2 === null) {
    return false;
  }

  if (arr1.length !== arr2.length) {
    return false;
  }

  const a1 = arr1.concat().sort();
  const a2 = arr2.concat().sort();

  for (let i = 0; i < a1.length; ++i) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }

  return true;
}