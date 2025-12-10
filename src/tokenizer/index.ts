/**
 * Class representing a Tokenizer.
 *
 * The Tokenizer class is responsible for tokenizing a given text. It takes a string as input and returns an array of TokenData objects.
 *
 * @property {string} text - The text to be tokenized.
 * @property {TokenData[]} tokens - An array of TokenData objects representing the tokens in the input text.
 * @property {Position} position - An instance of the Position class that keeps track of the current index and line number in the text.
 * @property {TokenData | null} nextToken - The next token to be returned by the getToken method.
 *
 * @method pauseState - Pauses the state of the position object.
 * @method resumeState - Resumes the saved state of the position object.
 * @method getAll - Tokenizes the entire text and returns an array of TokenData objects.
 * @method getToken - Gets the next token from the text and returns a TokenData object.
 * @method reset - Resets the position to the start of the text.
 */
import { Token } from "./token";
import { TokenData } from "./tokendata";
import { Position } from "./position";
import { isPunctuation } from "./util";
import { isWhitespace } from "../util";
import { Range } from "../ast/Range";

const isDigit = (ch: string) => /\d/.test(ch);

export class Tokenizer {
    public text: string = "";
    public tokens: TokenData[] = [];

    public position: Position = new Position(0, 0);

    public nextToken: TokenData | null = null;

    constructor(text: string) {
        this.text = text;
    }
    createState(): TokenizerState {
        const state = new TokenizerState(this, this.position, this.nextToken);
        state.pause();
        return state;
    }
    getAll(): TokenData[] {
        const state = this.createState();
        const result: TokenData[] = [];
        while (true) {
            const token = this.getToken();
            if (token.token === Token.EOF) break;
            result.push(token);
        }
        state.resume();
        return result;
    }
    getToken(): TokenData {
        if (this.nextToken) {
            const tok = this.nextToken;
            this.nextToken = null;
            return tok;
        }

        if (this.position.current >= this.text.length) {
            this.position.markPosition();
            return new TokenData(Token.EOF, "EOF", this.position.toRange());
        }

        let char = "";
        // Clear whitespace
        while (true) {
            char = this.text.charAt(this.position.current);
            if (char == "\n") {
                this.position.incrementLine();
                this.position.current++;
                this.position.markPosition();
            } else if (char == " ") {
                this.position.current++;
                this.position.markPosition();
            } else {
                break;
            }
        }
        let first = true;
        while (this.position.current < this.text.length) {
            const quote = char == "\"" || char == "'" || char == "`";
            if (quote) {
                const quoteType = char;
                const multiline = quoteType == "`";
                this.position.markPosition();
                this.position.current++;
                while (true) {
                    if (this.position.current > this.text.length) {
                        this.position.markPosition();
                        return new TokenData(Token.EOF, "EOF", this.position.toRange());
                    }
                    const ch = this.text.charAt(this.position.current);
                    if (ch == "\n") (this.position.incrementLine(), this.position.current++);
                    if (ch == quoteType && this.text.charAt(this.position.current - 1) !== "\\") {
                        const txt = this.text.slice(this.position.start, this.position.current + 1);
                        const pos = this.position.toRange();
                        this.position.current++;
                        this.position.markPosition();
                        return new TokenData(
                            Token.STRING,
                            txt,
                            pos
                        );
                    }
                    this.position.current++;
                    // if (!multiline && ch == "\n") {}
                }
            }

            const num = first && isDigit(char) || (char === "." && isDigit(this.text.charAt(this.position.current + 1)));
            first = false;
            if (num) {
                this.position.markPosition();
                let txt = "";
                let hasDecimal = false;
                let hasExponent = false;

                if (char === ".") {
                    txt += char;
                    this.position.current++;
                }

                while (this.position.current < this.text.length) {
                    const currentChar = this.text.charAt(this.position.current);

                    if (isDigit(currentChar)) {
                        txt += currentChar;
                    } else if (currentChar === "." && !hasDecimal && !hasExponent) {
                        hasDecimal = true;
                        txt += currentChar;
                    } else if ((currentChar === "e" || currentChar === "E") && !hasExponent) {
                        hasExponent = true;
                        txt += currentChar;

                        const nextChar = this.text.charAt(this.position.current + 1);
                        if (nextChar === "+" || nextChar === "-") {
                            txt += nextChar;
                            this.position.current++;
                        }
                    } else {
                        break;
                    }

                    this.position.current++;
                }
                this.position.markPosition();
                const pos = this.position.toRange();
                return new TokenData(Token.NUMBER, txt, pos);
            }

            const space = isWhitespace(char);
            if (space) {
                if (char == "\n") {
                    const txt = this.text.slice(this.position.start, this.position.current);
                    const pos = this.position.toRange();
                    this.position.incrementLine();
                    this.position.current++;
                    this.position.markPosition();
                    return new TokenData(
                        Token.IDENTIFIER,
                        txt,
                        pos
                    );
                }
                const txt = this.text.slice(this.position.start, this.position.current);
                const pos = this.position.toRange();
                this.position.current++;
                this.position.markPosition();
                return new TokenData(
                    Token.IDENTIFIER,
                    txt,
                    pos
                );
            }

            const punctuation = isPunctuation(this.text, this.position);
            if (punctuation) {
                const spacing = this.position.current - this.position.start;
                if (spacing > punctuation.text.length) {
                    this.nextToken = punctuation;
                    const txt = this.text.slice(this.position.start, this.position.current - punctuation.text.length);
                    const pos = this.position.toRange();
                    this.position.markPosition();
                    return new TokenData(
                        Token.IDENTIFIER,
                        txt,
                        pos
                    );
                }
                this.position.markPosition();
                return punctuation;
            }

            this.position.current++;
            char = this.text.charAt(this.position.current);
        }
        this.position.markPosition();
        return new TokenData(Token.EOF, "EOF", this.position.toRange());
    }
    viewToken(lookahead: number = 0): TokenData {
        const state = this.createState();
        let tok!: TokenData;
        if (!lookahead) {
            tok = this.getToken();
            state.resume();
            return tok;
        }
        while (lookahead--) {
            tok = this.getToken();
        }
        state.resume();
        return tok;
    }
    getLine(): TokenData {
        const start = this.position.current;

        let i = start;
        while (i < this.text.length && this.text.charAt(i) !== "\n") {
            i++;
        }

        const txt = this.text.slice(start, i);

        this.position.current = i;
        this.position.markPosition();

        if (i < this.text.length && this.text.charAt(i) === "\n") {
            this.position.incrementLine();
            this.position.current++;
            this.position.markPosition();
        }

        const range = this.position.toRange();

        return new TokenData(
            Token.TEXT,
            txt,
            range
        );
    }


    currentRange(): Range {
        return this.position.toRange();
    }
    reset(): void {
        this.position = new Position(0, 0);
    }
}

export class TokenizerState {
    private index: number = 0;

    private _line: number = 0;
    private _line_start: number = 0;

    private _current: number = 0;
    private _start: number = 0;
    private _start_line: number = 0;
    private _start_line_start: number = 0;

    public tokenizer: Tokenizer;
    public nextToken: TokenData | null;
    public position: Position;
    constructor(
        tokenizer: Tokenizer,
        position: Position,
        nextToken: TokenData | null = null,
    ) {
        this.tokenizer = tokenizer;
        this.position = position;
        this.nextToken = nextToken;
    }
    pause(): void {
        this.nextToken = this.tokenizer.nextToken;
        this.index = this.position.current;
        this._start = this.position.start;

        this._current = this.position.current;
        this._line = this.position.line;
        this._line_start = this.position.line_start;
        this._start = this.position.start;
        this._start_line = this.position.start_line;
        this._start_line_start = this.position.start_line_start;
    }
    resume(): void {
        this.tokenizer.nextToken = this.nextToken;
        this.position.current = this.index;

        this.position.current = this._current;
        this.position.line = this._line;
        this.position.line_start = this._line_start;
        this.position.start = this._start;
        this.position.start_line = this._start_line;
        this.position.start_line_start = this._start_line_start;
    }
}