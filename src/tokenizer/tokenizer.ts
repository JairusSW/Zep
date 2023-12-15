import { Range } from "../ast/Range.js";
import { isWhitespace } from "../util.js";

export class Position {
  public index: number = 0;
  public line: number = 0;
  public start: number = 0;
  private lineStart: number = 0;
  private indexState: number = 0;
  private startState: number = 0;
  private lineState: number = 0;
  private lineStartState: number = 0;
  constructor(index: number, line: number) {
    this.index = index;
    this.line = line;
  }
  incrementLine(): void {
    this.line++;
    this.lineStart = this.index;
  }
  markPosition(): void {
    this.start = this.index;
  }
  pauseState(): void {
    this.indexState = this.index;
    this.lineState = this.line;
    this.startState = this.start;
    this.lineStartState = this.lineStart;
  }
  resumeState(): void {
    this.index = this.indexState;
    this.line = this.lineState;
    this.start = this.startState;
    this.lineStart = this.lineStartState;
  }
  toRange(): Range {
    return new Range(
      this.line,
      this.start - this.lineStart,
      this.index - this.lineStart,
    );
  }
}

export class Tokenizer {
  public text: string = "";
  public tokens: TokenData[] = [];
  public tokensIndex: number = 0;

  public position: Position = new Position(0, 0);
  public cache: boolean;

  private tokensCalculated: boolean = false;
  private nextToken: TokenData | null = null;

  constructor(text: string, cache: boolean = false) {
    this.text = text;
    this.cache = cache;
  }
  pauseState(): void {
    this.position.pauseState();
  }
  resumeState(): void {
    this.position.resumeState();
  }
  getAll(): TokenData[] {
    if (this.cache && this.tokensCalculated) return this.tokens;
    this.pauseState();
    let tokensIndexState = this.tokensIndex;
    this.tokensCalculated = true;
    const result: TokenData[] = [];
    while (true) {
      const token = this.getToken();
      if (token.token === Token.EOF) {
        result.push(token);
        break;
      }
      result.push(token);
    }
    if (this.cache) this.tokens = result;
    this.tokensIndex = tokensIndexState;
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

export function isPunctuation(
  char: string,
  position: Position,
): TokenData | null {
  switch (char) {
    case ";": {
      return new TokenData(Token.Semi, ";", position.toRange());
    }
    case "=": {
      return new TokenData(Token.Equals, "=", position.toRange());
    }
    case "?": {
      return new TokenData(Token.Question, "?", position.toRange());
    }
    case ":": {
      return new TokenData(Token.Colon, ":", position.toRange());
    }
    case ",": {
      return new TokenData(Token.Comma, ",", position.toRange());
    }
    case "(": {
      return new TokenData(Token.LeftParen, "(", position.toRange());
    }
    case ")": {
      return new TokenData(Token.RightParen, ")", position.toRange());
    }
    case "{": {
      return new TokenData(Token.LeftBracket, "{", position.toRange());
    }
    case "}": {
      return new TokenData(Token.RightBracket, "}", position.toRange());
    }
    case "[": {
      return new TokenData(Token.LeftBrace, "[", position.toRange());
    }
    case "]": {
      return new TokenData(Token.RightBrace, "]", position.toRange());
    }
    case "+": {
      return new TokenData(Token.Add, "+", position.toRange());
    }
    case "-": {
      return new TokenData(Token.Sub, "-", position.toRange());
    }
    case "#": {
      return new TokenData(Token.Pound, "#", position.toRange());
    }
    default: {
      return null;
    }
  }
}

export class TokenData {
  public text: string;
  public token: Token;
  public range: Range;
  constructor(token: Token, text: string, range: Range) {
    this.token = token;
    this.text = text;
    this.range = range;
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
  "+",
];

export enum Token {
  // GENERAL
  Identifier,
  Number, // 0-9 _ .
  String, // " "   ' '   ` `
  // PUNCTUATION
  Semi, // ;
  Equals, // =
  Question, // ?
  Colon, // :
  Comma, // ,
  LeftParen, // (
  RightParen, // )
  LeftBracket, // {
  RightBracket, // }
  LeftBrace, // [
  RightBrace, // ]
  // Operators
  Add, // +
  Sub, // -
  // SYMBOLS
  Pound, // #
  // UTILITY
  EOF, // EXIT
}

function isNumeric(char: string): boolean {
  return /^[0-9]+$/.test(char) || char === ".";
}
