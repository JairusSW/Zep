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

  private nextToken: TokenData | null = null;

  constructor(text: string) {
    this.text = text;
  }
  pauseState(): void {
    this.position.pauseState();
  }
  resumeState(): void {
    this.position.resumeState();
  }
  getAll(): TokenData[] {
    this.pauseState();
    const result: TokenData[] = [];
    while (true) {
      const token = this.getToken();
      if (token.token === Token.EOF) break;
      result.push(token);
    }
    this.resumeState();
    return result;
  }
  getToken(): TokenData {
    if (this.position.index >= this.text.length) {
      this.position.markPosition();
      return new TokenData(Token.EOF, "", this.position.toRange());
    }

    if (this.nextToken) {
      const tok = this.nextToken;
      const char = this.text[this.position.index];
      this.position.markPosition();
      const punct = isPunctuation(char, this.position);
      if (punct) {
        punct.range.end += punct.text.length;
        this.nextToken = punct;
      } else {
        this.nextToken = null;
      }
      this.position.index += tok.text.length;
      tok.range = this.position.toRange();
      return tok;
    }

    while (true) {
      const code = this.text.charCodeAt(this.position.index);
      if (code === 32 /*" "*/ || code === 9 /* \t */) this.position.index++;
      else if (code === 10 /* \n */) {
        this.position.incrementLine();
        this.position.index++;
      } else break;
    }
    this.position.markPosition();
    let char = this.text[this.position.index];

    const punct = isPunctuation(char, this.position);
    if (punct) {
      punct.range.end += punct.text.length;
      this.position.index += punct.text.length;
      this.tokens.push(punct);
      return punct;
    }

    while (this.position.index < this.text.length) {
      char = this.text[this.position.index];
      if (char === "\n") {
        const txt = this.text.slice(this.position.start, this.position.index++);
        const tok = new TokenData(
          Token.Identifier,
          txt,
          this.position.toRange(),
        );
        this.tokens.push(tok);

        this.position.incrementLine();
        this.position.index++;
        return tok;
      } else {
        const punct = isPunctuation(char, this.position);
        if (punct) {
          this.nextToken = punct;
          const txt = this.text.slice(
            this.position.start,
            this.position.index++,
          );
          const tok = new TokenData(
            Token.Identifier,
            txt,
            this.position.toRange(),
          );
          this.tokens.push(tok);
          return tok;
        } else if (isWhitespace(char)) {
          const txt = this.text.slice(
            this.position.start,
            this.position.index++,
          );
          const tok = new TokenData(
            Token.Identifier,
            txt,
            this.position.toRange(),
          );
          this.tokens.push(tok);
          return tok;
        } else {
          this.position.index++;
        }
      }
    }
    const endOfFile = new TokenData(Token.EOF, "", this.position.toRange());
    return endOfFile;
  }
  reset(): void {
    this.position = new Position(0, 0);
  }
}