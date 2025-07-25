export const joinArray = (array: string[], seperator: string = "\n") =>
  array.join(seperator);

export const splitArray = (array: string, seperator: string = "\n") =>
  array
    .split(seperator)
    .filter((v) => v)
    .map((i) => i.trim());
