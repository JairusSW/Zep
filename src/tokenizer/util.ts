import { Token } from "./token";
import { TokenData } from "./tokendata";
import { Position } from "./position";

/**
 * Checks if a character is a punctuation mark and returns the corresponding TokenData object.
 * @param char - The character to check.
 * @param position - The current position in the code.
 * @returns A TokenData object if the character is a punctuation mark, or null if it is not.
 */
export function isPunctuation(
  text: string,
  position: Position,
): TokenData | null {
  if (text.startsWith("===", position.current)) {
    position.current += 3;
    return new TokenData(Token.EqualsEqualsEquals, "===", position.toRange());
  } else if (text.startsWith("==", position.current)) {
    position.current += 2;
    return new TokenData(Token.EqualsEquals, "==", position.toRange());
  } else if (text.startsWith("=", position.current)) {
    position.current++;
    return new TokenData(Token.Equals, "=", position.toRange());
  } else if (text.startsWith("?", position.current)) {
    position.current++;
    return new TokenData(Token.Question, "?", position.toRange());
  } else if (text.startsWith(":", position.current)) {
    position.current++;
    return new TokenData(Token.Colon, ":", position.toRange());
  } else if (text.startsWith(",", position.current)) {
    position.current++;
    return new TokenData(Token.Comma, ",", position.toRange());
  } else if (text.startsWith("(", position.current)) {
    position.current++;
    return new TokenData(Token.LeftParen, "(", position.toRange());
  } else if (text.startsWith(")", position.current)) {
    position.current++;
    return new TokenData(Token.RightParen, ")", position.toRange());
  } else if (text.startsWith("{", position.current)) {
    position.current++;
    return new TokenData(Token.LeftBracket, "{", position.toRange());
  } else if (text.startsWith("}", position.current)) {
    position.current++;
    return new TokenData(Token.RightBracket, "}", position.toRange());
  } else if (text.startsWith("[", position.current)) {
    position.current++;
    return new TokenData(Token.LeftBrace, "[", position.toRange());
  } else if (text.startsWith("]", position.current)) {
    position.current++;
    return new TokenData(Token.RightBrace, "]", position.toRange());
  } else if (text.startsWith("+", position.current)) {
    position.current++;
    return new TokenData(Token.Add, "+", position.toRange());
  } else if (text.startsWith("-", position.current)) {
    position.current++;
    return new TokenData(Token.Sub, "-", position.toRange());
  } else if (text.startsWith("#", position.current)) {
    position.current++;
    return new TokenData(Token.Pound, "#", position.toRange());
  } else if (text.startsWith(">", position.current)) {
    position.current++;
    return new TokenData(Token.GreaterThan, ">", position.toRange());
  } else if (text.startsWith("<", position.current)) {
    position.current++;
    return new TokenData(Token.LessThan, "<", position.toRange());
  } else if (text.startsWith(".", position.current)) {
    position.current++;
    return new TokenData(Token.Period, ".", position.toRange());
  } else {
    return null;
  }
}

export const SPLITTER_TOKENS = [
  ";",
  "=",
  "?",
  ":",
  ",",
  "(",
  ")",
  "{",
  "}",
  "+",
];

function isNumeric(char: string): boolean {
  return /^[0-9]+$/.test(char) || char === ".";
}
