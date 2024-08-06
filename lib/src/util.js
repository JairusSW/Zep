"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWhitespaceCode = isWhitespaceCode;
exports.isWhitespace = isWhitespace;
function isWhitespaceCode(code) {
    return code === 32 || code === 9;
}
function isWhitespace(char) {
    return char === " " || char === "\t";
}
