export function isNumber(data: any): data is number {
  return !isNaN(+data);
}

export function isString(data: any): data is string {
  return data !== undefined && typeof data === 'string';
}

export function isArray<T>(
  data: any,
  isT: (value: any) => value is T
): data is T[] {
  return Array.isArray(data) && data.every(isT);
}