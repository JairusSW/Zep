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
    return new TokenData(Token.EQUALS, "=", position.toRange());
  } else if (text.startsWith(":=", position.current)) {
    position.current += 2;
    return new TokenData(Token.COLON_EQUALS, ":=", position.toRange());
  } else if (text.startsWith("?=", position.current)) {
    position.current += 2;
    return new TokenData(Token.QuestionEquals, "?=", position.toRange());
  } else if (text.startsWith("<=", position.current)) {
    position.current += 2;
    return new TokenData(Token.LessThanEquals, "<=", position.toRange());
  } else if (text.startsWith("?", position.current)) {
    position.current++;
    return new TokenData(Token.QUESTION, "?", position.toRange());
  } else if (text.startsWith(":", position.current)) {
    position.current++;
    return new TokenData(Token.COLON, ":", position.toRange());
  } else if (text.startsWith(",", position.current)) {
    position.current++;
    return new TokenData(Token.COMMA, ",", position.toRange());
  } else if (text.startsWith("(", position.current)) {
    position.current++;
    return new TokenData(Token.LEFT_PAREN, "(", position.toRange());
  } else if (text.startsWith(")", position.current)) {
    position.current++;
    return new TokenData(Token.RIGHT_PAREN, ")", position.toRange());
  } else if (text.startsWith("{", position.current)) {
    position.current++;
    return new TokenData(Token.LEFT_BRACKET, "{", position.toRange());
  } else if (text.startsWith("}", position.current)) {
    position.current++;
    return new TokenData(Token.RIGHT_BRACKET, "}", position.toRange());
  } else if (text.startsWith("[", position.current)) {
    position.current++;
    return new TokenData(Token.LEFT_BRACE, "[", position.toRange());
  } else if (text.startsWith("]", position.current)) {
    position.current++;
    return new TokenData(Token.RIGHT_BRACE, "]", position.toRange());
  } else if (text.startsWith("+", position.current)) {
    position.current++;
    return new TokenData(Token.Plus, "+", position.toRange());
  } else if (text.startsWith("-", position.current)) {
    position.current++;
    return new TokenData(Token.Minus, "-", position.toRange());
  } else if (text.startsWith("*", position.current)) {
    position.current++;
    return new TokenData(Token.Asterisk, "*", position.toRange());
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
    return new TokenData(Token.DOT, ".", position.toRange());
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
