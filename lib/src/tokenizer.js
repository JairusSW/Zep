import { isWhitespace, isWhitespaceCode } from "./util.js";
export class Tokenizer {
    constructor(text) {
        this.text = "";
        this.pos = 0;
        this.tokens = [];
        this.tokensPos = 0;
        this.tokensCalculated = false;
        this.lookahead = null;
        this.text = text;
    }
    getAll() {
        if (this.tokensCalculated)
            return this.tokens;
        this.tokensCalculated = true;
        const result = [];
        while (true) {
            const token = this.getToken();
            if (token.token === Token.EOF)
                break;
            result.push(token);
        }
        this.tokens = result;
        this.pos = 0;
        this.tokensPos = 0;
        return result;
    }
    matches(tests) {
        const startPos = this.pos;
        const startToken = this.tokensPos;
        for (const test of tests) {
            const tok = this.getToken();
            if (!test(tok)) {
                this.pos = startPos;
                this.tokensPos = startToken;
                return null;
            }
        }
        return this.tokens.slice(startToken, this.tokensPos);
    }
    getToken() {
        if (this.tokens[this.tokensPos])
            return this.tokens[this.tokensPos++];
        // Publish queue
        if (this.lookahead) {
            const item = this.lookahead;
            this.lookahead = null;
            this.pos += item.text.length;
            this.tokens.push(item);
            this.tokensPos++;
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
        if (this.text[this.pos] === "\"") {
            this.pos++;
            while (this.pos < this.text.length) {
                if (this.text[this.pos] === "\"" && this.text[this.pos - 1] !== "\\") {
                    this.pos++;
                    this.tokensPos++;
                    const tok = new TokenData(Token.String, this.text.slice(start, this.pos));
                    this.tokens.push(tok);
                    return tok;
                }
                this.pos++;
            }
            return new TokenData(Token.EOF, "");
        }
        while (this.pos < this.text.length) {
            const char = this.text[this.pos + 1];
            const spl = parseSplToken(char);
            if (spl) {
                const tok = new TokenData(Token.Identifier, this.text.slice(start, ++this.pos));
                this.tokensPos++;
                this.tokens.push(tok);
                this.lookahead = spl;
                return tok;
            }
            else if (isWhitespace(char)) {
                const txt = this.text.slice(start, ++this.pos);
                const spl = parseSplToken(txt);
                if (spl) {
                    this.tokensPos++;
                    this.tokens.push(spl);
                    return spl;
                }
                const tok = new TokenData(Token.Identifier, txt);
                this.tokensPos++;
                this.tokens.push(tok);
                return tok;
            }
            else {
                this.pos++;
            }
        }
        return new TokenData(Token.EOF, "");
    }
    reset() {
        this.pos = 0;
        this.lookahead = null;
        this.tokensCalculated = false;
        this.tokensPos = 0;
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
