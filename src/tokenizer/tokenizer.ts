import { isWhitespace, isWhitespaceCode } from "../util.js";

export class Tokenizer {
    public text: string = "";
    public pos: number = 0;
    public tokens: TokenData[] = [];
    public tokensPos: number = 0;

    public line: number = 0;
    public linePos: number = 0;

    public cache: boolean;

    private tokensCalculated: boolean = false;
    private lookahead: TokenData | null = null;

    private freezePos: number = 0;
    private freezeToken: number = 0;
    private freezeLine: number = 0;
    private freezeLinePos: number = 0;
    constructor(text: string, cache: boolean = false) {
        this.text = text;
        this.cache = cache;
    }
    freeze(): void {
        this.freezePos = this.pos;
        this.freezeToken = this.tokensPos;
        this.freezeLine = this.line;
        this.freezeLinePos = this.linePos;
    }
    release(): void {
        this.pos = this.freezePos;
        this.tokensPos = this.freezeToken;
        this.line = this.freezeLine;
        this.linePos = this.freezeLinePos;
    }
    getAll(): TokenData[] {
        if (this.cache && this.tokensCalculated) return this.tokens;
        this.tokensCalculated = true;
        const result: TokenData[] = [];
        while (true) {
            const token = this.getToken();
            if (token.token === Token.EOF) break;
            result.push(token);
        }
        if (this.cache) this.tokens = result;
        this.pos = 0;
        this.tokensPos = 0;
        return result;
    }
    matches(tests: ((token: TokenData) => boolean)[]): TokenData[] | null {
        const start = this.tokensPos;
        this.freeze();
        for (const test of tests) {
            const tok = this.getToken();
            const res = test(tok);

            if (res === false) {
                this.release();
                return null;
            } else if (res === null) {
                while (true) {
                    const tok = this.getToken();
                    if (tok === null) return null;
                    const res = test(tok);
                    if (res === false) return null;
                    if (res === true) this.tokens.slice(start, this.tokensPos);
                }
            }
        }
        return this.tokens.slice(start, this.tokensPos);
    }
    getToken(): TokenData {
        if (this.pos >= this.text.length) return new TokenData(Token.EOF, "", this.text.length, this.line, this.pos - this.linePos );
        if (this.cache && this.tokens[this.tokensPos + 1]) {
            const tok = this.tokens[this.tokensPos++];
            this.pos = tok.pos + tok.text.length;
            return tok;
        }
        // Publish queue
        if (this.lookahead) {
            const item = this.lookahead;
            this.lookahead = null;
            this.pos += item.text.length;
            item.line = this.line;
            item.pos = this.pos;
            item.linePos = this.pos - this.linePos;
            this.tokens.push(item);
            this.tokensPos++;
            return item;
        }

        // Remove leading whitespace
        while (true) {
            const code = this.text.charCodeAt(this.pos);
            if (isWhitespaceCode(code)) this.pos++;
            else break;
        }

        const start = this.pos;

        let char = this.text[this.pos];
        if (char === "\n") {
            this.line++;
            this.linePos = this.pos + 1;
        }
        if (char === "\"") {
            const start = this.pos;
            this.pos++;
            while (this.pos < this.text.length) {
                if (this.text[this.pos] === "\"" && this.text[this.pos - 1] !== "\\") {
                    this.pos++;
                    this.tokensPos++;
                    const tok = new TokenData(Token.String, this.text.slice(start, this.pos), start, this.line, this.pos - this.linePos);
                    this.tokens.push(tok);
                    return tok;
                }
                this.pos++;
            }

            return new TokenData(Token.EOF, "", this.text.length, this.line, this.pos - this.linePos);
        } else if (isNumeric(char)) {
            const start = this.pos;
            while (this.pos < this.text.length && (isNumeric(this.text[this.pos]) || this.text[this.pos] === '.')) {
                this.pos++;
            }
            const txt = this.text.slice(start, this.pos);
            const value = parseFloat(txt);
            if (!isNaN(value)) {
                const tok = new TokenData(Token.Number, txt, start, this.line, this.pos - this.linePos);
                this.tokensPos++;
                this.tokens.push(tok);
                return tok;
            }
        }

        while (this.pos < this.text.length) {
            const char = this.text[this.pos + 1];
            if (char === "\n") {
                this.line++;
                this.linePos = this.pos + 1;
            }
            const spl = parseSplToken(char, this.pos, this.line, this.linePos );
            if (spl) {
                const tok = new TokenData(Token.Identifier, this.text.slice(start, ++this.pos), start, this.line, this.pos - this.linePos);
                this.tokensPos++;
                this.tokens.push(tok);
                this.lookahead = spl;
                return tok;
            } else if (isWhitespace(char)) {
                const txt = this.text.slice(start, ++this.pos);
                const spl = parseSplToken(txt, this.pos, this.line, this.linePos);
                if (spl) {
                    this.tokensPos++;
                    this.tokens.push(spl);
                    return spl;
                }
                const tok = new TokenData(Token.Identifier, txt, start, this.line, this.pos - this.linePos);
                this.tokensPos++;
                this.tokens.push(tok);
                return tok;
            } else {
                this.pos++;
            }
        }
        if (this.pos === this.text.length) {
            const txt = this.text.slice(start, this.pos++);
            const spl = parseSplToken(txt, this.pos, this.line, this.linePos );
            if (spl) {
                this.tokensPos++;
                this.tokens.push(spl);
                return spl;
            }
            const tok = new TokenData(Token.Identifier, txt, start, this.line, this.pos - this.linePos );
            this.tokensPos++;
            this.tokens.push(tok);
            return tok;
        }
        return new TokenData(Token.EOF, "", this.text.length, this.line, this.pos - this.linePos );
    }
    reset(): void {
        this.pos = 0;
        this.lookahead = null;
        this.tokensCalculated = false;
        this.tokensPos = 0;
    }
}

export class TokenData {
    public text: string;
    public token: Token;
    public pos: number;
    public line: number;
    public linePos: number;
    constructor(token: Token, text: string, pos: number, line: number, linePos: number) {
        this.token = token;
        this.text = text;
        this.pos = pos;
        this.line = line;
        this.linePos = linePos;
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
    "+"
];

export enum Token {
    // GENERAL
    Identifier,
    Number, // 0-9 _ .
    String, // " "   ' '   ` `
    // SPLITTERS
    Semi, // ;
    Equals, // =
    Question, // ?
    Colon, // ;
    Comma, // ,
    LeftParen, // (
    RightParen, // )
    LeftBracket, // {
    RightBracket, // }
    LeftBrace, // [
    RightBrace, // ]
    // Operators
    Plus, // +
    Neg, // -
    // UTILITY
    EOF, // EXIT
}

export function parseSplToken(char: string, pos: number, line: number, linePos: number): TokenData | null {
    switch (char) {
        case ";": return new TokenData(Token.Semi, ";", pos, line, pos - linePos);
        case "=": return new TokenData(Token.Equals, "=", pos, line, pos - linePos);
        case "?": return new TokenData(Token.Question, "?", pos, line, pos - linePos);
        case ":": return new TokenData(Token.Colon, ":", pos, line, pos - linePos);
        case ",": return new TokenData(Token.Comma, ",", pos, line, pos - linePos);
        case "(": return new TokenData(Token.LeftParen, "(", pos, line, pos - linePos);
        case ")": return new TokenData(Token.RightParen, ")", pos, line, pos - linePos);
        case "{": return new TokenData(Token.LeftBracket, "{", pos, line, pos - linePos);
        case "}": return new TokenData(Token.RightBracket, "}", pos, line, pos - linePos);
        case "[": return new TokenData(Token.LeftBrace, "[", pos, line, pos - linePos);
        case "]": return new TokenData(Token.RightBrace, "]", pos, line, pos - linePos);
        case "+": return new TokenData(Token.Plus, "+", pos, line, pos - linePos);
        case "-": return new TokenData(Token.Neg, "-", pos, line, pos - linePos);
        default: return null;
    }
}

function isNumeric(char: string): boolean {
    return /^[0-9]+$/.test(char) || char === '.';
}