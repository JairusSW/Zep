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
    if (this.position.index >= this.text.length) {
      this.position.markPosition();
      return new TokenData(Token.EOF, "", this.position.toRange());
    }

    if (this.nextToken) {
      const tok = this.nextToken;
      this.position.markPosition();
      this.nextToken = null;
      this.position.index++;
      tok.range = this.position.toRange();
      return tok;
    }

    while (true) {
      const code = this.text.charCodeAt(this.position.index);
      switch (code) {
        case 32 /*" "*/:
        case 9 /* \t */:
          this.position.index++;
          break;
        case 10 /* \n */:
          this.position.incrementLine();
          this.position.index++;
          break;
        default:
          let char = this.text[this.position.index];

          const punct = isPunctuation(char, this.position);
          if (punct) {
            punct.range.end += punct.text.length;
            this.position.index++;
            this.tokens.push(punct);
            return punct;
          }

          this.position.markPosition();

          while (this.position.index < this.text.length) {
            char = this.text[this.position.index];
            if (char === "\n") {
              const txt = this.text.slice(
                this.position.start,
                this.position.index,
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
                this.position.index++;
                return tok;
              }
            } else if (char == "\"") {
              this.position.index++;
              this.position.markPosition();
              while (true) {
                char = this.text[this.position.index];
                if (char === "\"") {
                  const txt = this.text.slice(this.position.start, this.position.index);
                  const tok = new TokenData(
                    Token.String,
                    txt,
                    this.position.toRange(),
                  )
                  this.position.index++;
                  this.tokens.push(tok);
                  return tok;
                }
                if (this.position.index >= this.text.length) {
                  this.position.markPosition();
                  return new TokenData(Token.EOF, "", this.position.toRange());
                }
                this.position.index++;
              }
            } else {
              const punct = isPunctuation(char, this.position);
              if (punct) {
                this.nextToken = punct;
                const txt = this.text.slice(
                  this.position.start,
                  this.position.index,
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
                  return tok;
                }
              } else if (isWhitespace(char)) {
                const txt = this.text.slice(
                  this.position.start,
                  this.position.index,
                );
                const firstChar = txt[0];
                const lastChar = txt[txt.length - 1];

                if (firstChar == '"' && lastChar == '"') {
                  const tok = new TokenData(
                    Token.String,
                    txt,
                    this.position.toRange(),
                  );
                  this.position.index++;
                  this.tokens.push(tok);
                  return tok;
                } else if (!isNaN(parseFloat(txt))) {
                  const tok = new TokenData(
                    Token.Number,
                    txt,
                    this.position.toRange(),
                  );
                  this.position.index++;
                  this.tokens.push(tok);
                  return tok;
                } else {
                  const tok = new TokenData(
                    Token.Identifier,
                    txt,
                    this.position.toRange(),
                  );
                  this.position.index++;
                  this.tokens.push(tok);
                  return tok;
                }
              } else {
                this.position.index++;
              }
            }
          }
          // bad design choice
          const txt = this.text.slice(this.position.start, this.position.index);
          const firstChar = txt[0];
          const lastChar = txt[txt.length - 1];
          if (firstChar == '"' && lastChar == '"') {
            const tok = new TokenData(
              Token.String,
              txt,
              this.position.toRange(),
            );
            this.position.index++;
            this.tokens.push(tok);
            return tok;
          } else if (!isNaN(parseFloat(txt))) {
            const tok = new TokenData(
              Token.Number,
              txt,
              this.position.toRange(),
            );
            this.position.index++;
            this.tokens.push(tok);
            return tok;
          } else {
            this.position.incrementLine();

            const tok = new TokenData(
              Token.Identifier,
              txt,
              this.position.toRange(),
            );
            this.position.index++;
            this.tokens.push(tok);
            return tok;
          }
      }
    }
  }
  viewToken(lookahead: number = 0): TokenData {
    const state = this.createState();
    let tok: TokenData;
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
  private start: number = 0;
  private line: number = 0;
  private lineStart: number = 0;
  public tokenizer: Tokenizer;
  public nextToken: TokenData | null;
  public position: Position;
  constructor(tokenizer: Tokenizer, position: Position, nextToken: TokenData | null = null) {
    this.tokenizer = tokenizer;
    this.position = position;
    this.nextToken = nextToken;
  }
  pause(): void {
    this.nextToken = this.tokenizer.nextToken;
    this.index = this.position.index;
    this.start = this.position.start;
    this.line = this.position.line;
    this.lineStart = this.position.lineStart;
  }
  resume(): void {
    this.tokenizer.nextToken = this.nextToken;
    this.position.index = this.index;
    this.position.start = this.start;
    this.position.line = this.line;
    this.position.lineStart = this.lineStart;
  }
}