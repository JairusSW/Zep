import { isWhitespace, isWhitespaceCode } from "./util.js";
export class Tokenizer {
    constructor(text) {
        this.text = "";
        this.pos = 0;
        this.queue = [];
        this.text = text;
    }
    getAll() {
        const result = [];
        while (true) {
            const token = this.getToken();
            if (token.token === Token.EOF)
                break;
            result.push(token);
        }
        this.queue = result;
        this.pos = 0;
        return result.map(v => v.text);
    }
    getNext() {
        return this.getToken().text;
    }
    getToken() {
        // Publish queue
        if (this.queue.length) {
            const item = this.queue.shift();
            this.pos += item.text.length;
            return item;
        }
        // Remove leading whitespace
        while (true) {
            const code = this.text.charCodeAt(this.pos);
            if (isWhitespaceCode(code))
                this.pos++;
            else
                break;
        }
        const start = this.pos;
        // Scan single character tokens
        while (this.pos < this.text.length) {
            const char = this.text[this.pos + 1];
            const spl = parseSplToken(char);
            if (isWhitespace(char)) {
                return new TokenData(Token.Identifier, this.text.slice(start, ++this.pos));
            }
            else if (spl) {
                this.queue.push(spl);
                return new TokenData(Token.Identifier, this.text.slice(start, ++this.pos));
            }
            else {
                this.pos++;
            }
        }
        return new TokenData(Token.EOF, "");
    }
}
export class TokenData {
    constructor(token, text) {
        this.token = token;
        this.text = text;
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
    "}"
];
export var Token;
(function (Token) {
    // GENERAL
    Token[Token["Identifier"] = 0] = "Identifier";
    Token[Token["Number"] = 1] = "Number";
    Token[Token["String"] = 2] = "String";
    // SPLITTERS
    Token[Token["Semi"] = 3] = "Semi";
    Token[Token["Equals"] = 4] = "Equals";
    Token[Token["Question"] = 5] = "Question";
    Token[Token["Colon"] = 6] = "Colon";
    Token[Token["Comma"] = 7] = "Comma";
    Token[Token["LeftParen"] = 8] = "LeftParen";
    Token[Token["RightParen"] = 9] = "RightParen";
    Token[Token["LeftBracket"] = 10] = "LeftBracket";
    Token[Token["RightBracket"] = 11] = "RightBracket";
    // UTILITY
    Token[Token["EOF"] = 12] = "EOF";
})(Token = Token || (Token = {}));
export function parseSplToken(char) {
    switch (char) {
        case ";": return new TokenData(Token.Semi, ";");
        case "=": return new TokenData(Token.Equals, "=");
        case "?": return new TokenData(Token.Question, "?");
        case ":": return new TokenData(Token.Colon, ":");
        case ",": return new TokenData(Token.Comma, ",");
        case "(": return new TokenData(Token.LeftParen, "(");
        case ")": return new TokenData(Token.RightParen, ")");
        case "{": return new TokenData(Token.LeftBracket, "{");
        case "}": return new TokenData(Token.RightBracket, "}");
        default: return null;
    }
}
