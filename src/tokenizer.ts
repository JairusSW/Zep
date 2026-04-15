import { DiagnosticCode, DiagnosticEmitter } from "./diagnostics";
import { Range, RangeData } from "./range";
import { Source } from "./source";
import { CharCode } from "./util";

export const enum Token {
  // meta
  Invalid,
  EndOfFile,

  // keywords
  Fn,
  Struct,
  Enum,
  Interface,
  Impl,
  Import,
  Let,
  Mut,
  If,
  Else,
  For,
  In,
  While,
  Match,
  Case,
  Default,
  Return, // `rt`
  Export,
  Extern,
  As,
  Type,
  Null,
  Void,
  True,
  False,
  And, // `and`
  Or, // `or`
  Is, // `is`
  InstanceOf, // `instanceof`
  Jump, // `jump`

  // punctuation / operators
  OpenBrace,
  CloseBrace,
  OpenParen,
  CloseParen,
  OpenBracket,
  CloseBracket,
  Dot,
  DotDot,
  DotDotEq,
  DotDotDot,
  Semicolon,
  Comma,
  LessThan,
  GreaterThan,
  LessThanEq,
  GreaterThanEq,
  EqEq,
  BangEq,
  Arrow, // ->
  FatArrow, // =>
  Plus,
  Minus,
  Star,
  Slash,
  Percent,
  PlusPlus,
  MinusMinus,
  ShiftLeft,
  ShiftRight,
  Amp,
  Bar,
  Caret,
  Bang,
  Tilde,
  AmpAmp,
  BarBar,
  Question,
  Colon,
  Eq,
  PlusEq,
  MinusEq,
  StarEq,
  SlashEq,
  PercentEq,
  ShiftLeftEq,
  ShiftRightEq,
  AmpEq,
  BarEq,
  CaretEq,
  Hash,

  // literals
  Identifier,
  StringLiteral,
  // IntegerLiteral,
  // FloatLiteral,
  NumberLiteral,
  CharLiteral,
  RawLiteral,

  // trivia (optional – usually not surfaced to parser)
  LineComment,
  BlockComment,
}

export class Tokenizer extends DiagnosticEmitter {
  private source: Source;
  public end: number;
  public pos: number = 0;
  public tkPos: number = 0;
  public line: number = 0;
  public lineStart: number = 0;
  public tkLine: number = 0;
  public tkLineStart: number = 0;
  public lastToken: Token = Token.Invalid;
  public nextToken: Token | null = null;
  public nextLiteral: string | null = null;

  private readonly state: TokenizerState;
  private entries: TokenEntry[] = [];
  public cursor: number = -1;
  private scanPos: number = 0;
  private scanLine: number = 0;
  private scanColumn: number = 0;

  private static readonly KEYWORDS: Record<string, Token> = {
    fn: Token.Fn,
    struct: Token.Struct,
    enum: Token.Enum,
    interface: Token.Interface,
    impl: Token.Impl,
    import: Token.Import,
    let: Token.Let,
    mut: Token.Mut,
    if: Token.If,
    else: Token.Else,
    for: Token.For,
    in: Token.In,
    while: Token.While,
    match: Token.Match,
    case: Token.Case,
    default: Token.Default,
    rt: Token.Return,
    extern: Token.Extern,
    as: Token.As,
    type: Token.Type,
    null: Token.Null,
    void: Token.Void,
    true: Token.True,
    false: Token.False,
    and: Token.And,
    or: Token.Or,
    is: Token.Is,
    instanceof: Token.InstanceOf,
    jump: Token.Jump,
  };

  constructor(source: Source) {
    super();
    this.source = source;
    this.source.tokenizer = this;
    this.end = this.source.text.length;
    this.scanAll();
    this.state = new TokenizerState(this);
  }

  protected getFileName(): string {
    return this.source.fileName;
  }

  getState(): TokenizerState {
    return this.state.wind();
  }

  createState(): TokenizerState {
    return new TokenizerState(this);
  }

  getRange(lookahead: number = 0): Range {
    const idx = this.cursor + lookahead;
    if (idx < 0 || idx >= this.entries.length) {
      return new Range(
        { line: this.scanLine, column: this.scanColumn },
        { line: this.scanLine, column: this.scanColumn },
        this.source,
      );
    }
    return this.entries[idx].range;
  }

  all(): Token[] {
    return this.entries.map((entry) => entry.token);
  }

  next(): Token {
    if (this.cursor + 1 < this.entries.length) {
      this.cursor++;
    }

    const entry = this.entries[this.cursor] ?? this.entries[this.entries.length - 1];
    this.lastToken = entry.token;
    this.nextToken =
      this.cursor + 1 < this.entries.length
        ? this.entries[this.cursor + 1].token
        : Token.EndOfFile;
    this.nextLiteral = entry.literal;

    this.pos = entry.startOffset;
    this.tkPos = entry.endOffset;
    this.line = entry.range.start.line;
    this.tkLine = entry.range.end.line;
    this.lineStart = this.pos - entry.range.start.column;
    this.tkLineStart = this.tkPos - entry.range.end.column;

    return entry.token;
  }

  peek(lookahead: number = 0): Token {
    const idx = this.cursor + lookahead + 1;
    if (idx < 0 || idx >= this.entries.length) return Token.EndOfFile;
    return this.entries[idx].token;
  }

  public readIdentifier(): string {
    if (!this.nextLiteral) {
      this.error(
        DiagnosticCode.MISSING_LITERAL,
        { function: "readIdentifier" },
        this.getRange(),
      );
    }
    if (this.lastToken !== Token.Identifier) {
      this.error(
        DiagnosticCode.EXPECTED_TOKEN,
        { expected: "identifier", found: tokenToString(this.lastToken) },
        this.getRange(),
      );
    }
    return this.nextLiteral;
  }

  public readString(): string {
    if (!this.nextLiteral) {
      this.error(
        DiagnosticCode.MISSING_LITERAL,
        { function: "readString" },
        this.getRange(),
      );
    }
    if (this.lastToken !== Token.StringLiteral) {
      this.error(
        DiagnosticCode.EXPECTED_TOKEN,
        { expected: "string literal", found: tokenToString(this.lastToken) },
        this.getRange(),
      );
    }
    return this.nextLiteral;
  }

  public readNumber(): string {
    if (!this.nextLiteral) {
      this.error(
        DiagnosticCode.MISSING_LITERAL,
        { function: "readNumber" },
        this.getRange(),
      );
    }
    if (this.lastToken !== Token.NumberLiteral) {
      this.error(
        DiagnosticCode.EXPECTED_TOKEN,
        { expected: "number literal", found: tokenToString(this.lastToken) },
        this.getRange(),
      );
    }
    return this.nextLiteral;
  }

  private scanAll(): void {
    this.entries = [];
    this.cursor = -1;
    this.scanPos = 0;
    this.scanLine = 0;
    this.scanColumn = 0;
    this.end = this.source.text.length;

    while (this.scanPos < this.end) {
      if (this.skipTrivia()) continue;
      this.entries.push(this.scanToken());
    }

    const eofRange = new Range(
      { line: this.scanLine, column: this.scanColumn },
      { line: this.scanLine, column: this.scanColumn },
      this.source,
    );
    this.entries.push({
      token: Token.EndOfFile,
      literal: null,
      range: eofRange,
      startOffset: this.scanPos,
      endOffset: this.scanPos,
    });
  }

  private skipTrivia(): boolean {
    if (this.scanPos >= this.end) return false;
    const ch = this.charCode(this.scanPos);
    const next = this.charCode(this.scanPos + 1);

    if (
      ch === CharCode.Space ||
      ch === CharCode.Tab ||
      ch === CharCode.VerticalTab ||
      ch === CharCode.FormFeed
    ) {
      this.advanceChar();
      return true;
    }
    if (ch === CharCode.CarriageReturn || ch === CharCode.LineFeed) {
      this.advanceNewline();
      return true;
    }
    if (ch === CharCode.Slash && next === CharCode.Slash) {
      this.advanceChar();
      this.advanceChar();
      while (this.scanPos < this.end) {
        const c = this.charCode(this.scanPos);
        if (c === CharCode.CarriageReturn || c === CharCode.LineFeed) break;
        this.advanceChar();
      }
      return true;
    }
    if (ch === CharCode.Slash && next === CharCode.Asterisk) {
      this.advanceChar();
      this.advanceChar();
      while (this.scanPos < this.end) {
        const c = this.charCode(this.scanPos);
        if (c === CharCode.Asterisk && this.charCode(this.scanPos + 1) === CharCode.Slash) {
          this.advanceChar();
          this.advanceChar();
          return true;
        }
        if (c === CharCode.CarriageReturn || c === CharCode.LineFeed) {
          this.advanceNewline();
          continue;
        }
        this.advanceChar();
      }
      this.error(DiagnosticCode.UNTERMINATED_STRING_LITERAL, {}, this.getRange());
    }
    return false;
  }

  private scanToken(): TokenEntry {
    const startOffset = this.scanPos;
    const start: RangeData = { line: this.scanLine, column: this.scanColumn };
    const ch = this.charCode(this.scanPos);

    if (this.isIdentifierStart(ch)) {
      const literal = this.scanIdentifier();
      const keyword = Tokenizer.KEYWORDS[literal];
      return this.makeEntry(keyword ?? Token.Identifier, literal, start, startOffset);
    }

    if (this.isDigit(ch)) {
      const literal = this.scanNumber();
      return this.makeEntry(Token.NumberLiteral, literal, start, startOffset);
    }

    switch (ch) {
      case CharCode.DoubleQuote:
        return this.makeEntry(Token.StringLiteral, this.scanString(), start, startOffset);
      case CharCode.OpenBrace:
        this.advanceChar();
        return this.makeEntry(Token.OpenBrace, null, start, startOffset);
      case CharCode.CloseBrace:
        this.advanceChar();
        return this.makeEntry(Token.CloseBrace, null, start, startOffset);
      case CharCode.OpenParen:
        this.advanceChar();
        return this.makeEntry(Token.OpenParen, null, start, startOffset);
      case CharCode.CloseParen:
        this.advanceChar();
        return this.makeEntry(Token.CloseParen, null, start, startOffset);
      case CharCode.OpenBracket:
        this.advanceChar();
        return this.makeEntry(Token.OpenBracket, null, start, startOffset);
      case CharCode.CloseBracket:
        this.advanceChar();
        return this.makeEntry(Token.CloseBracket, null, start, startOffset);
      case CharCode.Semicolon:
        this.advanceChar();
        return this.makeEntry(Token.Semicolon, null, start, startOffset);
      case CharCode.Comma:
        this.advanceChar();
        return this.makeEntry(Token.Comma, null, start, startOffset);
      case CharCode.Question:
        this.advanceChar();
        return this.makeEntry(Token.Question, null, start, startOffset);
      case CharCode.Tilde:
        this.advanceChar();
        return this.makeEntry(Token.Tilde, null, start, startOffset);
      case CharCode.Hash:
        this.advanceChar();
        return this.makeEntry(Token.Hash, null, start, startOffset);
      case CharCode.Dot:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.Dot) {
          this.advanceChar();
          if (this.charCode(this.scanPos) === CharCode.Equals) {
            this.advanceChar();
            return this.makeEntry(Token.DotDotEq, null, start, startOffset);
          }
          if (this.charCode(this.scanPos) === CharCode.Dot) {
            this.advanceChar();
            return this.makeEntry(Token.DotDotDot, null, start, startOffset);
          }
          return this.makeEntry(Token.DotDot, null, start, startOffset);
        }
        return this.makeEntry(Token.Dot, null, start, startOffset);
      case CharCode.Colon:
        this.advanceChar();
        return this.makeEntry(Token.Colon, null, start, startOffset);
      case CharCode.Exclamation:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.BangEq, null, start, startOffset);
        }
        return this.makeEntry(Token.Bang, null, start, startOffset);
      case CharCode.Equals:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.EqEq, null, start, startOffset);
        }
        if (this.charCode(this.scanPos) === CharCode.GreaterThan) {
          this.advanceChar();
          return this.makeEntry(Token.FatArrow, null, start, startOffset);
        }
        return this.makeEntry(Token.Eq, null, start, startOffset);
      case CharCode.Plus:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.Plus) {
          this.advanceChar();
          return this.makeEntry(Token.PlusPlus, null, start, startOffset);
        }
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.PlusEq, null, start, startOffset);
        }
        return this.makeEntry(Token.Plus, null, start, startOffset);
      case CharCode.Minus:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.Minus) {
          this.advanceChar();
          return this.makeEntry(Token.MinusMinus, null, start, startOffset);
        }
        if (this.charCode(this.scanPos) === CharCode.GreaterThan) {
          this.advanceChar();
          return this.makeEntry(Token.Arrow, null, start, startOffset);
        }
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.MinusEq, null, start, startOffset);
        }
        return this.makeEntry(Token.Minus, null, start, startOffset);
      case CharCode.Asterisk:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.StarEq, null, start, startOffset);
        }
        return this.makeEntry(Token.Star, null, start, startOffset);
      case CharCode.Slash:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.SlashEq, null, start, startOffset);
        }
        return this.makeEntry(Token.Slash, null, start, startOffset);
      case CharCode.Percent:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.PercentEq, null, start, startOffset);
        }
        return this.makeEntry(Token.Percent, null, start, startOffset);
      case CharCode.Ampersand:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.Ampersand) {
          this.advanceChar();
          return this.makeEntry(Token.AmpAmp, null, start, startOffset);
        }
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.AmpEq, null, start, startOffset);
        }
        return this.makeEntry(Token.Amp, null, start, startOffset);
      case CharCode.Bar:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.Bar) {
          this.advanceChar();
          return this.makeEntry(Token.BarBar, null, start, startOffset);
        }
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.BarEq, null, start, startOffset);
        }
        return this.makeEntry(Token.Bar, null, start, startOffset);
      case CharCode.Caret:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.CaretEq, null, start, startOffset);
        }
        return this.makeEntry(Token.Caret, null, start, startOffset);
      case CharCode.LessThan:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.LessThan) {
          this.advanceChar();
          if (this.charCode(this.scanPos) === CharCode.Equals) {
            this.advanceChar();
            return this.makeEntry(Token.ShiftLeftEq, null, start, startOffset);
          }
          return this.makeEntry(Token.ShiftLeft, null, start, startOffset);
        }
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.LessThanEq, null, start, startOffset);
        }
        return this.makeEntry(Token.LessThan, null, start, startOffset);
      case CharCode.GreaterThan:
        this.advanceChar();
        if (this.charCode(this.scanPos) === CharCode.GreaterThan) {
          this.advanceChar();
          if (this.charCode(this.scanPos) === CharCode.Equals) {
            this.advanceChar();
            return this.makeEntry(Token.ShiftRightEq, null, start, startOffset);
          }
          return this.makeEntry(Token.ShiftRight, null, start, startOffset);
        }
        if (this.charCode(this.scanPos) === CharCode.Equals) {
          this.advanceChar();
          return this.makeEntry(Token.GreaterThanEq, null, start, startOffset);
        }
        return this.makeEntry(Token.GreaterThan, null, start, startOffset);
      case CharCode.SingleQuote:
        this.advanceChar();
        this.error(
          DiagnosticCode.UNSUPPORTED,
          { message: "Character literals are not yet supported!" },
          this.getRange(),
        );
      case CharCode.Backtick:
        this.advanceChar();
        this.error(
          DiagnosticCode.UNSUPPORTED,
          { message: "Raw literals are not yet supported!" },
          this.getRange(),
        );
    }

    this.advanceChar();
    return this.makeEntry(Token.Invalid, null, start, startOffset);
  }

  private isIdentifierStart(ch: number): boolean {
    return (
      (ch >= CharCode.A && ch <= CharCode.Z) ||
      (ch >= CharCode.a && ch <= CharCode.z) ||
      ch === CharCode._ ||
      ch === CharCode.Dollar
    );
  }

  private isIdentifierPart(ch: number): boolean {
    return this.isIdentifierStart(ch) || this.isDigit(ch);
  }

  private isDigit(ch: number): boolean {
    return ch >= CharCode._0 && ch <= CharCode._9;
  }

  private scanIdentifier(): string {
    const start = this.scanPos;
    this.advanceChar();
    while (this.scanPos < this.end && this.isIdentifierPart(this.charCode(this.scanPos))) {
      this.advanceChar();
    }
    return this.source.text.slice(start, this.scanPos);
  }

  private scanNumber(): string {
    const start = this.scanPos;
    this.advanceDigitsOrUnderscore();

    if (this.charCode(this.scanPos) === CharCode.Dot && this.isDigit(this.charCode(this.scanPos + 1))) {
      this.advanceChar();
      this.advanceDigitsOrUnderscore();
    }

    const exp = this.charCode(this.scanPos);
    if (exp === CharCode.E || exp === CharCode.e) {
      const expStart = this.scanPos;
      this.advanceChar();
      const sign = this.charCode(this.scanPos);
      if (sign === CharCode.Plus || sign === CharCode.Minus) this.advanceChar();
      if (this.isDigit(this.charCode(this.scanPos))) {
        this.advanceDigitsOrUnderscore();
      } else {
        this.scanPos = expStart;
      }
    }

    return this.source.text.slice(start, this.scanPos);
  }

  private advanceDigitsOrUnderscore(): void {
    while (this.scanPos < this.end) {
      const ch = this.charCode(this.scanPos);
      if (this.isDigit(ch) || ch === CharCode._) {
        this.advanceChar();
      } else {
        break;
      }
    }
  }

  private scanString(): string {
    this.advanceChar(); // open "
    let out = "";
    let chunkStart = this.scanPos;

    while (this.scanPos < this.end) {
      const ch = this.charCode(this.scanPos);
      if (ch === CharCode.DoubleQuote) {
        if (this.scanPos > chunkStart) out += this.source.text.slice(chunkStart, this.scanPos);
        this.advanceChar();
        return out;
      }
      if (ch === CharCode.Backslash) {
        if (this.scanPos > chunkStart) out += this.source.text.slice(chunkStart, this.scanPos);
        this.advanceChar();
        if (this.scanPos >= this.end) {
          this.error(DiagnosticCode.UNTERMINATED_STRING_LITERAL, {}, this.getRange());
        }
        const esc = this.charCode(this.scanPos);
        this.advanceChar();
        switch (esc) {
          case CharCode.Backslash:
            out += "\\";
            break;
          case CharCode.DoubleQuote:
            out += '"';
            break;
          case CharCode.n:
            out += "\n";
            break;
          case CharCode.r:
            out += "\r";
            break;
          case CharCode.t:
            out += "\t";
            break;
          case CharCode.b:
            out += "\b";
            break;
          case CharCode.f:
            out += "\f";
            break;
          default:
            out += String.fromCharCode(esc);
            break;
        }
        chunkStart = this.scanPos;
        continue;
      }
      if (ch === CharCode.CarriageReturn || ch === CharCode.LineFeed) {
        this.error(DiagnosticCode.UNTERMINATED_STRING_LITERAL, {}, this.getRange());
      }
      this.advanceChar();
    }

    this.error(DiagnosticCode.UNTERMINATED_STRING_LITERAL, {}, this.getRange());
  }

  private makeEntry(
    token: Token,
    literal: string | null,
    start: RangeData,
    startOffset: number,
  ): TokenEntry {
    const end: RangeData = { line: this.scanLine, column: this.scanColumn };
    return {
      token,
      literal,
      range: new Range(start, end, this.source),
      startOffset,
      endOffset: this.scanPos,
    };
  }

  private advanceNewline(): void {
    if (
      this.charCode(this.scanPos) === CharCode.CarriageReturn &&
      this.charCode(this.scanPos + 1) === CharCode.LineFeed
    ) {
      this.scanPos += 2;
    } else {
      this.scanPos += 1;
    }
    this.scanLine += 1;
    this.scanColumn = 0;
  }

  private advanceChar(): void {
    const ch = this.charCode(this.scanPos);
    if (ch === CharCode.CarriageReturn || ch === CharCode.LineFeed) {
      this.advanceNewline();
      return;
    }
    this.scanPos += 1;
    this.scanColumn += 1;
  }

  private charCode(pos: number): number {
    if (pos < 0 || pos >= this.end) return -1;
    return this.source.text.charCodeAt(pos);
  }

  getSurroundingLines(
    range: Range,
    padding: number = 1,
  ): {
    startLine: number;
    endLine: number;
    lines: string[];
  } {
    const text = this.source.text;

    // Build line-start offsets
    const lineStarts: number[] = [0];
    for (let i = 0; i < text.length; i++) {
      const ch = text.charCodeAt(i);
      if (ch === CharCode.LineFeed) {
        lineStarts.push(i + 1);
      }
    }

    const totalLines = lineStarts.length;
    const rangeStartLine = range.start.line;
    const rangeEndLine = range.end.line;

    const startLine = Math.max(0, rangeStartLine - padding);
    const endLine = Math.min(totalLines - 1, rangeEndLine + padding);

    const lines: string[] = [];

    for (let line = startLine; line <= endLine; line++) {
      const lineStart = lineStarts[line];
      const lineEnd =
        line + 1 < totalLines ? lineStarts[line + 1] : text.length;

      // trim trailing newline chars
      let end = lineEnd;
      if (end > lineStart && text.charCodeAt(end - 1) === CharCode.LineFeed) {
        end--;
        if (
          end > lineStart &&
          text.charCodeAt(end - 1) === CharCode.CarriageReturn
        ) {
          end--;
        }
      }

      lines.push(text.slice(lineStart, end));
    }

    return { startLine, endLine, lines };
  }

  reset(source: Source | null = null): void {
    if (!source) return;
    this.source = source;
    this.source.tokenizer = this;
    this.scanAll();
    this.pos = 0;
    this.tkPos = 0;
    this.line = 0;
    this.lineStart = 0;
    this.tkLine = 0;
    this.tkLineStart = 0;
    this.lastToken = Token.Invalid;
    this.nextToken = this.entries[0]?.token ?? Token.EndOfFile;
    this.nextLiteral = null;
  }
}

type TokenEntry = {
  token: Token;
  literal: string | null;
  range: Range;
  startOffset: number;
  endOffset: number;
};

export class TokenizerState {
  readonly tokenizer: Tokenizer;
  public cursor: number;
  public pos: number;
  public tkPos: number;
  public line: number;
  public lineStart: number;
  public tkLine: number;
  public tkLineStart: number;
  public lastToken: Token;
  public nextLiteral: string | null;

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
    this.cursor = tokenizer.cursor;
    this.pos = tokenizer.pos;
    this.tkPos = tokenizer.tkPos;
    this.line = tokenizer.line;
    this.lineStart = tokenizer.lineStart;
    this.tkLine = tokenizer.tkLine;
    this.tkLineStart = tokenizer.tkLineStart;
    this.lastToken = tokenizer.lastToken;
    this.nextLiteral = tokenizer.nextLiteral;
  }

  unwind(): void {
    const t = this.tokenizer;
    t.cursor = this.cursor;
    t.pos = this.pos;
    t.tkPos = this.tkPos;
    t.line = this.line;
    t.lineStart = this.lineStart;
    t.tkLine = this.tkLine;
    t.tkLineStart = this.tkLineStart;
    t.lastToken = this.lastToken;
    t.nextLiteral = this.nextLiteral;
  }

  wind(): TokenizerState {
    const t = this.tokenizer;
    this.cursor = t.cursor;
    this.pos = t.pos;
    this.tkPos = t.tkPos;
    this.line = t.line;
    this.lineStart = t.lineStart;
    this.tkLine = t.tkLine;
    this.tkLineStart = t.tkLineStart;
    this.lastToken = t.lastToken;
    this.nextLiteral = t.nextLiteral;
    return this;
  }
}

export function tokenToString(token: Token): string {
  switch (token) {
    // meta
    case Token.Invalid:
      return "Invalid";
    case Token.EndOfFile:
      return "EOF";

    // keywords
    case Token.Fn:
      return "fn";
    case Token.Struct:
      return "struct";
    case Token.Enum:
      return "enum";
    case Token.Interface:
      return "interface";
    case Token.Impl:
      return "impl";
    case Token.Import:
      return "import";
    case Token.Let:
      return "let";
    case Token.Mut:
      return "mut";
    case Token.If:
      return "if";
    case Token.Else:
      return "else";
    case Token.For:
      return "for";
    case Token.In:
      return "in";
    case Token.While:
      return "while";
    case Token.Match:
      return "match";
    case Token.Case:
      return "case";
    case Token.Default:
      return "default";
    case Token.Return:
      return "rt";
    case Token.Export:
      return "export";
    case Token.Extern:
      return "extern";
    case Token.As:
      return "as";
    case Token.Type:
      return "type";
    case Token.Null:
      return "null";
    case Token.Void:
      return "void";
    case Token.True:
      return "true";
    case Token.False:
      return "false";
    case Token.And:
      return "and";
    case Token.Or:
      return "or";
    case Token.Is:
      return "is";
    case Token.InstanceOf:
      return "instanceof";
    case Token.Jump:
      return "jump";

    // punctuation / operators
    case Token.OpenBrace:
      return "{";
    case Token.CloseBrace:
      return "}";
    case Token.OpenParen:
      return "(";
    case Token.CloseParen:
      return ")";
    case Token.OpenBracket:
      return "[";
    case Token.CloseBracket:
      return "]";
    case Token.Dot:
      return ".";
    case Token.DotDot:
      return "..";
    case Token.DotDotEq:
      return "..=";
    case Token.DotDotDot:
      return "...";
    case Token.Semicolon:
      return ";";
    case Token.Comma:
      return ",";
    case Token.LessThan:
      return "<";
    case Token.GreaterThan:
      return ">";
    case Token.LessThanEq:
      return "<=";
    case Token.GreaterThanEq:
      return ">=";
    case Token.EqEq:
      return "==";
    case Token.BangEq:
      return "!=";
    case Token.Arrow:
      return "->";
    case Token.FatArrow:
      return "=>";
    case Token.Plus:
      return "+";
    case Token.Minus:
      return "-";
    case Token.Star:
      return "*";
    case Token.Slash:
      return "/";
    case Token.Percent:
      return "%";
    case Token.PlusPlus:
      return "++";
    case Token.MinusMinus:
      return "--";
    case Token.ShiftLeft:
      return "<<";
    case Token.ShiftRight:
      return ">>";
    case Token.Amp:
      return "&";
    case Token.Bar:
      return "|";
    case Token.Caret:
      return "^";
    case Token.Bang:
      return "!";
    case Token.Tilde:
      return "~";
    case Token.AmpAmp:
      return "&&";
    case Token.BarBar:
      return "||";
    case Token.Question:
      return "?";
    case Token.Colon:
      return ":";
    case Token.Eq:
      return "=";
    case Token.PlusEq:
      return "+=";
    case Token.MinusEq:
      return "-=";
    case Token.StarEq:
      return "*=";
    case Token.SlashEq:
      return "/=";
    case Token.PercentEq:
      return "%=";
    case Token.ShiftLeftEq:
      return "<<=";
    case Token.ShiftRightEq:
      return ">>=";
    case Token.AmpEq:
      return "&=";
    case Token.BarEq:
      return "|=";
    case Token.CaretEq:
      return "^=";
    case Token.Hash:
      return "#";

    // literals (kind names, not values)
    case Token.Identifier:
      return "identifier";
    case Token.StringLiteral:
      return "string literal";
    // case Token.IntegerLiteral: return "integer literal";
    // case Token.FloatLiteral: return "float literal";
    case Token.NumberLiteral:
      return "number literal";
    case Token.CharLiteral:
      return "char literal";
    case Token.RawLiteral:
      return "raw literal";

    // trivia
    case Token.LineComment:
      return "line comment";
    case Token.BlockComment:
      return "block comment";

    default:
      return "unknown token";
  }
}

export function isIdentifierToken(token: Token): boolean {
  switch (token) {
    case Token.Identifier:
    case Token.Fn:
    case Token.Struct:
    case Token.Enum:
    case Token.Interface:
    case Token.Impl:
    case Token.Let:
    case Token.Mut:
    case Token.If:
    case Token.Else:
    case Token.For:
    case Token.In:
    case Token.While:
    case Token.Match:
    case Token.Case:
    case Token.Default:
    case Token.Return:
    case Token.Export:
    case Token.Extern:
    case Token.As:
    case Token.Type:
    case Token.Null:
    case Token.Void:
    case Token.True:
    case Token.False:
    case Token.And:
    case Token.Or:
    case Token.Is:
    case Token.InstanceOf:
    case Token.Jump:
      return true;

    default:
      return false;
  }
}
