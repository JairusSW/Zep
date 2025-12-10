import { Token } from "../../tokenizer/token";
import { TokenData } from "../../tokenizer/tokendata";

const builtinTypes = [
  "str",
  "bool",
  "i8",
  "i16",
  "i32",
  "i64",
  "u8",
  "u16",
  "u32",
  "u64",
  "f32",
  "f64",
  "void",
];

export function isBuiltinType(token: TokenData): boolean {
  return token.token === Token.IDENTIFIER && builtinTypes.includes(token.text);
}

export function isIdentifier(token: TokenData): boolean {
  return token.token === Token.IDENTIFIER;
}

export function isEquals(token: TokenData): boolean {
  return token.token === Token.EQUALS;
}

export function isString(token: TokenData): boolean {
  return token.token === Token.STRING;
}

export function isSemi(token: TokenData): boolean {
  return token.token === Token.SEMI;
}

export function isNumeric(token: TokenData): boolean {
  return token.token === Token.NUMBER;
}
