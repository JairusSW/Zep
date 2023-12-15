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
    char: string,
    position: Position,
): TokenData | null {
    switch (char) {
        case ";": {
            return new TokenData(Token.Semi, ";", position.toRange());
        }
        case "=": {
            return new TokenData(Token.Equals, "=", position.toRange());
        }
        case "?": {
            return new TokenData(Token.Question, "?", position.toRange());
        }
        case ":": {
            return new TokenData(Token.Colon, ":", position.toRange());
        }
        case ",": {
            return new TokenData(Token.Comma, ",", position.toRange());
        }
        case "(": {
            return new TokenData(Token.LeftParen, "(", position.toRange());
        }
        case ")": {
            return new TokenData(Token.RightParen, ")", position.toRange());
        }
        case "{": {
            return new TokenData(Token.LeftBracket, "{", position.toRange());
        }
        case "}": {
            return new TokenData(Token.RightBracket, "}", position.toRange());
        }
        case "[": {
            return new TokenData(Token.LeftBrace, "[", position.toRange());
        }
        case "]": {
            return new TokenData(Token.RightBrace, "]", position.toRange());
        }
        case "+": {
            return new TokenData(Token.Add, "+", position.toRange());
        }
        case "-": {
            return new TokenData(Token.Sub, "-", position.toRange());
        }
        case "#": {
            return new TokenData(Token.Pound, "#", position.toRange());
        }
        default: {
            return null;
        }
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