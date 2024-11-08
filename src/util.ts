export function isWhitespaceCode(code: number): boolean {
  return code === 32 || code === 9;
}

export function isWhitespace(str: string): boolean {
  return /^\s*$/.test(str);
}
