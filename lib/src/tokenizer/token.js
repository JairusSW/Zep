"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
/**
 * Represents different types of tokens.
 */
var Token;
(function (Token) {
    // GENERAL
    Token[Token["Identifier"] = 0] = "Identifier";
    Token[Token["Number"] = 1] = "Number";
    Token[Token["String"] = 2] = "String";
    // PUNCTUATION
    Token[Token["Semi"] = 3] = "Semi";
    Token[Token["Equals"] = 4] = "Equals";
    Token[Token["Question"] = 5] = "Question";
    Token[Token["Colon"] = 6] = "Colon";
    Token[Token["Comma"] = 7] = "Comma";
    Token[Token["LeftParen"] = 8] = "LeftParen";
    Token[Token["RightParen"] = 9] = "RightParen";
    Token[Token["LeftBracket"] = 10] = "LeftBracket";
    Token[Token["RightBracket"] = 11] = "RightBracket";
    Token[Token["LeftBrace"] = 12] = "LeftBrace";
    Token[Token["RightBrace"] = 13] = "RightBrace";
    Token[Token["Period"] = 14] = "Period";
    // Operators
    Token[Token["Add"] = 15] = "Add";
    Token[Token["Sub"] = 16] = "Sub";
    // COMPARISIONS
    Token[Token["GreaterThan"] = 17] = "GreaterThan";
    Token[Token["LessThan"] = 18] = "LessThan";
    // SYMBOLS
    Token[Token["Pound"] = 19] = "Pound";
    // UTILITY
    Token[Token["EOF"] = 20] = "EOF";
})(Token || (exports.Token = Token = {}));
