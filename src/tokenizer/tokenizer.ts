import { isWhitespace, isWhitespaceCode } from "../util.js";

export class Tokenizer {
    public text: string = "";
    public pos: number = 0;
    public tokens: TokenData[] = [];
    public tokensPos: number = 0;

    private tokensCalculated: boolean = false;
    private lookahead: TokenData | null = null;

    private freezePos: number = 0;
    private freezeToken: number = 0;
    constructor(text: string) {
        this.text = text;
    }
    freeze(): void {
        this.freezePos = this.pos;
        this.freezeToken = this.tokensPos;
    }
    release(): void {
        this.pos = this.freezePos;
        this.tokensPos = this.freezeToken;
    }
    getAll(): TokenData[] {
        if (this.tokensCalculated) return this.tokens;
        this.tokensCalculated = true;
        const result: TokenData[] = [];
        while (true) {
            const token = this.getToken();
            if (token.token === Token.EOF) break;
            result.push(token);
        }
        this.tokens = result;
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
        if (this.pos >= this.text.length) return new TokenData(Token.EOF, "", this.text.length);
        if (this.tokens[this.tokensPos + 1]) {
            const tok = this.tokens[this.tokensPos++];
            this.pos = tok.pos + tok.text.length;
            return tok;
        }
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
            if (isWhitespaceCode(code)) this.pos++;
            else break;
        }

        const start = this.pos;

        if (this.text[this.pos] === "\"") {
            const start = this.pos;
            this.pos++;
            while (this.pos < this.text.length) {
                if (this.text[this.pos] === "\"" && this.text[this.pos - 1] !== "\\") {
                    this.pos++;
                    this.tokensPos++;
                    const tok = new TokenData(Token.String, this.text.slice(start, this.pos), start);
                    this.tokens.push(tok);
                    return tok;
                }
                this.pos++;
            }

            return new TokenData(Token.EOF, "", this.text.length);
        } else if (isNumeric(this.text[this.pos])) {
            const start = this.pos;
            while (this.pos < this.text.length && (isNumeric(this.text[this.pos]) || this.text[this.pos] === '.')) {
                this.pos++;
            }
            const txt = this.text.slice(start, this.pos);
            const value = parseFloat(txt);
            if (!isNaN(value)) {
                const tok = new TokenData(Token.Number, txt, start);
                this.tokensPos++;
                this.tokens.push(tok);
                return tok;
            }
        }

        while (this.pos < this.text.length) {
            const char = this.text[this.pos + 1];
            const spl = parseSplToken(char, this.pos);
            if (spl) {
                const tok = new TokenData(Token.Identifier, this.text.slice(start, ++this.pos), start);
                this.tokensPos++;
                this.tokens.push(tok);
                this.lookahead = spl;
                return tok;
            } else if (isWhitespace(char)) {
                const txt = this.text.slice(start, ++this.pos);
                const spl = parseSplToken(txt, this.pos);
                if (spl) {
                    this.tokensPos++;
                    this.tokens.push(spl);
                    return spl;
                }
                const tok = new TokenData(Token.Identifier, txt, start);
                this.tokensPos++;
                this.tokens.push(tok);
                return tok;
            } else {
                this.pos++;
            }
        }
        if (this.pos === this.text.length) {
            const txt = this.text.slice(start, this.pos++);
            const spl = parseSplToken(txt, this.pos);
            if (spl) {
                this.tokensPos++;
                this.tokens.push(spl);
                return spl;
            }
            const tok = new TokenData(Token.Identifier, txt, start);
            this.tokensPos++;
            this.tokens.push(tok);
            return tok;
        }
        return new TokenData(Token.EOF, "", this.text.length);
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
    constructor(token: Token, text: string, pos: number) {
        this.token = token;
        this.text = text;
        this.pos = pos;
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
    Add, // +
    // UTILITY
    EOF, // EXIT
}

export function parseSplToken(char: string, pos: number): TokenData | null {
    switch (char) {
        case ";": return new TokenData(Token.Semi, ";", pos);
        case "=": return new TokenData(Token.Equals, "=", pos);
        case "?": return new TokenData(Token.Question, "?", pos);
        case ":": return new TokenData(Token.Colon, ":", pos);
        case ",": return new TokenData(Token.Comma, ",", pos);
        case "(": return new TokenData(Token.LeftParen, "(", pos);
        case ")": return new TokenData(Token.RightParen, ")", pos);
        case "{": return new TokenData(Token.LeftBracket, "{", pos);
        case "}": return new TokenData(Token.RightBracket, "}", pos);
        case "[": return new TokenData(Token.LeftBrace, "[", pos);
        case "]": return new TokenData(Token.RightBrace, "]", pos);
        case "+": return new TokenData(Token.Add, "+", pos);
        default: return null;
    }
}

function isNumeric(char: string): boolean {
    return /^[0-9]+$/.test(char) || char === '.';
}