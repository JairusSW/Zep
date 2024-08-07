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
import { isWhitespace } from "../util";
import { Token } from "./token";
import { TokenData } from "./tokendata";
import { Position } from "./position";
import { isPunctuation } from "./util";

export class Tokenizer {
  public text: string = "";
  public tokens: TokenData[] = [];

  public position: Position = new Position(0, 0);

  public nextToken: TokenData | null = null;
  private nextTokenState: TokenData | null = null;

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
    if (this.position.current >= this.text.length) {
      this.position.markPosition();
      return new TokenData(Token.EOF, "EOF", this.position.toRange());
    }

    if (this.nextToken) {
      const tok = this.nextToken;
      this.position.markPosition();
      this.nextToken = null;
      this.position.current++;
      tok.range = this.position.toRange();
      return tok;
    }

    while (true) {
      const code = this.text.charCodeAt(this.position.current);
      // Clear whitespace
      switch (code) {
        case 32 /*" "*/:
        case 9 /* \t */:
          this.position.current++;
          break;
        case 10 /* \n */:
          this.position.incrementLine();
          this.position.current++;
          break;
      }
      
      let char = this.text.charAt(this.position.current);

      const pun = isPunctuation(char, this.position);
      if (pun) {
        this.position.markPosition();
        this.position.current++;
        pun.range = this.position.toRange();
        this.tokens.push(pun);
        return pun;
      }

      this.position.markPosition();

      while (this.position.current < this.text.length) {
        char = this.text[this.position.current];
        if (char === "\n") {
          const txt = this.text.slice(
            this.position.start,
            this.position.current,
          );

          const tok = new TokenData(
            Token.Identifier,
            txt,
            this.position.toRange(),
          );
          const firstChar = txt[0];
          const lastChar = txt[txt.length - 1];
          if (firstChar == '"' && lastChar == '"') {
            const tok = new TokenData(
              Token.String,
              txt,
              this.position.toRange(),
            );
            this.tokens.push(tok);
            return tok;
          } else if (!isNaN(parseFloat(txt))) {
            const tok = new TokenData(
              Token.Number,
              txt,
              this.position.toRange(),
            );
            this.tokens.push(tok);
            return tok;
          } else {
            this.position.incrementLine();
            this.position.current++;
            return tok;
          }
        } else if (char == '"') {
          this.position.current++;
          this.position.markPosition();
          while (true) {
            char = this.text.charAt(this.position.current);
            if (this.position.current >= this.text.length) {
              this.position.markPosition();
              return new TokenData(Token.EOF, "EOF", this.position.toRange());
            } else if (char === '"') {
              const txt = this.text.slice(
                this.position.start,
                this.position.current,
              );

              const tok = new TokenData(
                Token.String,
                txt,
                this.position.toRange(),
              );
              this.position.current++;
              this.tokens.push(tok);
              return tok;
            } else if (char === "\n") {
              //this.position.incrementLine();
              this.position.current++;
              continue;
            }
            this.position.current++;
          }
        } else {
          const pun = isPunctuation(char, this.position);
          if (pun) {
            this.nextToken = pun;

            const txt = this.text.slice(
              this.position.start,
              this.position.current,
            );
            const firstChar = txt[0];
            const lastChar = txt[txt.length - 1];

            if (firstChar == '"' && lastChar == '"') {
              const tok = new TokenData(
                Token.String,
                txt,
                this.position.toRange(),
              );
              this.tokens.push(tok);
              return tok;
            } else if (!isNaN(parseFloat(txt))) {
              const tok = new TokenData(
                Token.Number,
                txt,
                this.position.toRange(),
              );
              this.tokens.push(tok);
              return tok;
            } else {
              const tok = new TokenData(
                Token.Identifier,
                txt,
                this.position.toRange(),
              );
              this.tokens.push(tok);
              if (txt == "") throw "Hadfew"
              return tok;
            }
          } else if (isWhitespace(char)) {
            const txt = this.text.slice(
              this.position.start,
              this.position.current,
            );
            if (!txt) {
              this.position.current++;
              return this.getToken();
            }
            const firstChar = txt[0];
            const lastChar = txt[txt.length - 1];

            if (firstChar == '"' && lastChar == '"') {
              const tok = new TokenData(
                Token.String,
                txt,
                this.position.toRange(),
              );
              this.position.current++;
              this.tokens.push(tok);
              return tok;
            } else if (!isNaN(parseFloat(txt))) {
              const tok = new TokenData(
                Token.Number,
                txt,
                this.position.toRange(),
              );
              this.position.current++;
              this.tokens.push(tok);
              return tok;
            } else {
              const tok = new TokenData(
                Token.Identifier,
                txt,
                this.position.toRange(),
              );
              this.position.current++;
              this.tokens.push(tok);
              return tok;
            }
          } else {
            this.position.current++;
          }
        }
      }
      // bad design choice
      const txt = this.text.slice(
        this.position.start,
        this.position.current
      );
      if (!txt) {
        this.position.current++;
        return this.getToken();
      }
      const firstChar = txt[0];
      const lastChar = txt[txt.length - 1];

      if (firstChar == '"' && lastChar == '"') {
        const tok = new TokenData(
          Token.String,
          txt,
          this.position.toRange(),
        );
        this.position.current++;
        this.tokens.push(tok);
        return tok;
      } else if (!isNaN(parseFloat(txt))) {
        const tok = new TokenData(
          Token.Number,
          txt,
          this.position.toRange(),
        );
        this.position.current++;
        this.tokens.push(tok);
        return tok;
      } else {
        // this.position.incrementLine();

        const tok = new TokenData(
          Token.Identifier,
          txt,
          this.position.toRange(),
        );
        this.position.current++;
        this.tokens.push(tok);
        return tok;
      }
    }
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
  reset(): void {
    this.position = new Position(0, 0);
  }
}

class TokenizerState {
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
