import { Token } from "../../tokenizer.js";
const builtinTypes = [
    "string",
    "bool",
    "fn",
    "ptr",
    "null",
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
export function isBuiltinType(token) {
    return token.token === Token.Identifier && builtinTypes.includes(token.text);
}
export function isIdentifier(token) {
    return token.token === Token.Identifier;
}
export function isEquals(token) {
    return token.text == "="; //token.token === Token.Equals;
}
export function isString(token) {
    return token.text.startsWith("\"") && token.text.endsWith("\""); //token.token === Token.String;
}
export function isSemi(token) {
    return token.token === Token.Semi;
}
