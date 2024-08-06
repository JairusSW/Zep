"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPLITTER_TOKENS = void 0;
exports.isPunctuation = isPunctuation;
const token_1 = require("./token");
const tokendata_1 = require("./tokendata");
/**
 * Checks if a character is a punctuation mark and returns the corresponding TokenData object.
 * @param char - The character to check.
 * @param position - The current position in the code.
 * @returns A TokenData object if the character is a punctuation mark, or null if it is not.
 */
function isPunctuation(char, position) {
    switch (char) {
        case ";": {
            return new tokendata_1.TokenData(token_1.Token.Semi, ";", position.toRange());
        }
        case "=": {
            return new tokendata_1.TokenData(token_1.Token.Equals, "=", position.toRange());
        }
        case "?": {
            return new tokendata_1.TokenData(token_1.Token.Question, "?", position.toRange());
        }
        case ":": {
            return new tokendata_1.TokenData(token_1.Token.Colon, ":", position.toRange());
        }
        case ",": {
            return new tokendata_1.TokenData(token_1.Token.Comma, ",", position.toRange());
        }
        case "(": {
            return new tokendata_1.TokenData(token_1.Token.LeftParen, "(", position.toRange());
        }
        case ")": {
            return new tokendata_1.TokenData(token_1.Token.RightParen, ")", position.toRange());
        }
        case "{": {
            return new tokendata_1.TokenData(token_1.Token.LeftBracket, "{", position.toRange());
        }
        case "}": {
            return new tokendata_1.TokenData(token_1.Token.RightBracket, "}", position.toRange());
        }
        case "[": {
            return new tokendata_1.TokenData(token_1.Token.LeftBrace, "[", position.toRange());
        }
        case "]": {
            return new tokendata_1.TokenData(token_1.Token.RightBrace, "]", position.toRange());
        }
        case "+": {
            return new tokendata_1.TokenData(token_1.Token.Add, "+", position.toRange());
        }
        case "-": {
            return new tokendata_1.TokenData(token_1.Token.Sub, "-", position.toRange());
        }
        case "#": {
            return new tokendata_1.TokenData(token_1.Token.Pound, "#", position.toRange());
        }
        case ">": {
            return new tokendata_1.TokenData(token_1.Token.GreaterThan, ">", position.toRange());
        }
        case "<": {
            return new tokendata_1.TokenData(token_1.Token.LessThan, "<", position.toRange());
        }
        case ".": {
            return new tokendata_1.TokenData(token_1.Token.Period, ".", position.toRange());
        }
        default: {
            return null;
        }
    }
}
exports.SPLITTER_TOKENS = [
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
function isNumeric(char) {
    return /^[0-9]+$/.test(char) || char === ".";
}
