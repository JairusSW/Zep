"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBuiltinType = isBuiltinType;
exports.isIdentifier = isIdentifier;
exports.isEquals = isEquals;
exports.isString = isString;
exports.isSemi = isSemi;
exports.isNumeric = isNumeric;
const token_1 = require("../../tokenizer/token");
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
function isBuiltinType(token) {
    return token.token === token_1.Token.Identifier && builtinTypes.includes(token.text);
}
function isIdentifier(token) {
    return token.token === token_1.Token.Identifier;
}
function isEquals(token) {
    return token.token === token_1.Token.Equals;
}
function isString(token) {
    return token.token === token_1.Token.String;
}
function isSemi(token) {
    return token.token === token_1.Token.Semi;
}
function isNumeric(token) {
    return token.token === token_1.Token.Number;
}
