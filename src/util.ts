export function isWhitespaceCode(code: number): boolean {
  return code === 32 || code === 9;
}

export function isWhitespace(char: string): boolean {
  return char === " " || char === "\t";
}
