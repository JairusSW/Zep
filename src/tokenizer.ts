import { isWhitespace, isWhitespaceCode } from "./util.js";

export class Tokenizer {
    public text: string = "";
    public pos: number = 0;
    public tokens: TokenData[] = [];
    public tokensPos: number = 0;

    private inString: boolean = false;
    private lastRef: number = 0;
    private tokensCalculated: boolean = false;
    private lookahead: TokenData | null = null;
    constructor(text: string) {
        this.text = text;
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
        const startPos = this.pos;
        const startToken = this.tokensPos;
        for (const test of tests) {
            if (!test(this.getToken())) {
                this.pos = startPos;
                this.tokensPos = startToken;
                return null;
            }
        }
        return this.tokens.slice(startToken, this.tokensPos);
    }
    getToken(): TokenData {
        //if (this.tokens[this.tokensPos]) return this.tokens[this.tokensPos];
        // Publish queue
        if (this.lookahead) {
            const item = this.lookahead;
            this.lookahead = null;
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
            if (spl) {
                const tok = new TokenData(Token.Identifier, this.text.slice(start, ++this.pos));
                this.tokensPos += 2;
                this.tokens.push(tok);
                this.lookahead = spl;
                return tok;
            } else if (isWhitespace(char)) {
                const tok = new TokenData(Token.Identifier, this.text.slice(start, ++this.pos));
                this.tokensPos++;
                this.tokens.push(tok);
                return tok;
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