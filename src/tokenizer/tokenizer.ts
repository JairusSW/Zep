import { isWhitespace } from "../util.js";
import { Token } from "./Token.js";
import { TokenData } from "./TokenData.js";
import { Position } from "./position.js";
import { isPunctuation } from "./util.js";

export class Tokenizer {
  public text: string = "";
  public tokens: TokenData[] = [];
  public tokensIndex: number = 0;

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
      this.position.index++;
      this.nextToken = null;
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
      this.tokensIndex++;
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
        this.tokensIndex++;
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
          this.tokensIndex++;
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
          this.tokensIndex++;
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
    this.tokensCalculated = false;
    this.tokensIndex = 0;
  }
}