import { Token, TokenData } from "../../tokenizer/tokenizer.js";

const builtinTypes = [
    "string",
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
];


export function isBuiltinType(token: TokenData): boolean {
    return token.token === Token.Identifier && builtinTypes.includes(token.text);
}

export function isIdentifier(token: TokenData): boolean {
    return token.token === Token.Identifier;
}

export function isEquals(token: TokenData): boolean {
    return token.token === Token.Equals;
}

export function isString(token: TokenData): boolean {
    return token.token === Token.String;
}

export function isSemi(token: TokenData): boolean {
    return token.token === Token.Semi;
}

export function isNumeric(token: TokenData): boolean {
    return token.token === Token.Number;
}