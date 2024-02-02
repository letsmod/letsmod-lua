export function convertArray<T>(arr: T[] | undefined): T[] | undefined {
  if (arr === undefined) {
    return undefined;
  }

  let result = [];

  for (let key in arr) {
    result.push(arr[key]);
  }
  return result;
}
