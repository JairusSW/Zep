import { isWhitespace, isWhitespaceCode } from "./util.js";

export class Tokenizer {
    public text: string = "";
    public pos: number = 0;
    public queue: TokenData[] = [];
    constructor(text: string) {
        this.text = text;
    }
    getAll(): string[] {
        const result: TokenData[] = [];
        while (true) {
            const token = this.getToken();
            if (token.token === Token.EOF) break;
            result.push(token)
        }
        this.queue = result;
        this.pos = 0;
        return result.map(v => v.text);
    }
    getNext(): string {
        return this.getToken().text;
    }
    getToken(): TokenData {
        // Publish queue
        if (this.queue.length) {
            const item = this.queue.shift()!;
            this.pos += item.text.length;
            return item;
        }

        // Remove leading whitespace
        while (true) {
            const code = this.text.charCodeAt(this.pos);
            if (isWhitespaceCode(code)) this.pos++;
            else break;
        }

        const start = this.pos;

        // Scan single character tokens
        while (this.pos < this.text.length) {
            const char = this.text[this.pos + 1];
            const spl = parseSplToken(char);
            if (isWhitespace(char)) {
                return new TokenData(Token.Identifier, this.text.slice(start, ++this.pos));
            } else if (spl) {
                this.queue.push(spl);
                return new TokenData(Token.Identifier, this.text.slice(start, ++this.pos));
            } else {
                this.pos++;
            }
        }

        return new TokenData(Token.EOF, "");
    }

}

export class TokenData {
    public text: string;
    public token: Token;
    constructor(token: Token, text: string) {
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

export enum Token {
    // GENERAL
    Identifier,
    Number,
    String,
    // SPLITTERS
    Semi,
    Equals,
    Question,
    Colon,
    Comma,
    LeftParen,
    RightParen,
    LeftBracket,
    RightBracket,
    // UTILITY
    EOF,
}

export function parseSplToken(char: string): TokenData | null {
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