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
    Return,      // `rt`
    Export,
    Extern,
    As,
    Type,
    Null,
    Void,
    True,
    False,
    And,         // `and`
    Or,          // `or`
    Is,          // `is`
    InstanceOf,  // `instanceof`
    Jump,        // `jump`

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
    Arrow,          // ->
    FatArrow,       // =>
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
    AttrStart,      // `#[`

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

    public line: number = 0
    public lineStart: number = 0;

    public tkLine: number = 0
    public tkLineStart: number = 0;

    public lastToken: Token = Token.Invalid;
    public nextToken: Token | null = null;
    public nextLiteral: string | null = null;

    private readonly state: TokenizerState;

    constructor(source: Source) {
        super();
        this.source = source;
        this.source.tokenizer = this;
        this.end = this.source.text.length;
        this.state = new TokenizerState(this);
    }

    protected getFileName(): string {
        return this.source.fileName;
    }

    getState(): TokenizerState {
        return this.state;
    }

    createState(): TokenizerState {
        return new TokenizerState(this);
    }

    getRange(): Range {
        const start: RangeData = {
            line: this.line,
            column: this.pos - this.lineStart
        }
        const end: RangeData = {
            line: this.tkLine,
            column: this.tkPos - this.tkLineStart
        }
        return new Range(start, end, this.source);
    }

    all(): Token[] {
        const state = this.getState();
        const out: Token[] = [];
        while (true) {
            const t = this.next();
            out.push(t);
            if (t === Token.EndOfFile) break;
        }
        state.unwind();
        return out;
    }
    next(): Token {
        this.lastToken = this.nextUnsafe();
        return this.lastToken;
    }
    private bumpLine(pos: number = this.tkPos, amount: number = 1): void {
        this.tkLine += amount;
        this.tkLineStart = pos;
    }

    private nextUnsafe(): Token {
        this.nextLiteral = null;
        this.line = this.tkLine;
        this.lineStart = this.tkLineStart;

        this.pos = this.tkPos;

        const text = this.source.text;
        const end = this.end;

        while (this.tkPos < end) {
            let c = text.charCodeAt(this.tkPos);

            switch (c) {
                // whitespace
                case CharCode.CarriageReturn: {
                    ++this.tkPos;
                    if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.LineFeed) {
                        ++this.tkPos;
                    }
                    this.bumpLine();
                    this.line = this.tkLine;
                    this.lineStart = this.tkLineStart;
                    continue;
                }
                case CharCode.LineFeed: {
                    ++this.tkPos;
                    this.bumpLine();
                    this.line = this.tkLine;
                    this.lineStart = this.tkLineStart;
                    continue;
                }

                case CharCode.Tab:
                case CharCode.VerticalTab:
                case CharCode.FormFeed:
                case CharCode.Space: {
                    ++this.tkPos;
                    continue;
                }

                // identifiers / keywords / numbers
                default: {
                    // identifier start: letter, _, $
                    if (
                        (c >= CharCode.A && c <= CharCode.Z) ||
                        (c >= CharCode.a && c <= CharCode.z) ||
                        c === CharCode._ ||
                        c === CharCode.Dollar
                    ) {
                        this.nextLiteral = this.digestIdentifier();

                        switch (this.nextLiteral) {
                            case "fn": return Token.Fn;
                            case "struct": return Token.Struct;
                            case "enum": return Token.Enum;
                            case "interface": return Token.Interface;
                            case "impl": return Token.Impl;
                            case "import": return Token.Import;
                            case "let": return Token.Let;
                            case "mut": return Token.Mut;
                            case "if": return Token.If;
                            case "else": return Token.Else;
                            case "for": return Token.For;
                            case "in": return Token.In;
                            case "while": return Token.While;
                            case "match": return Token.Match;
                            case "case": return Token.Case;
                            case "default": return Token.Default;
                            case "rt": return Token.Return;
                            case "export": return Token.Export;
                            case "extern": return Token.Extern;
                            case "as": return Token.As;
                            case "type": return Token.Type;
                            case "null": return Token.Null;
                            case "void": return Token.Void;
                            case "true": return Token.True;
                            case "false": return Token.False;
                            case "and": return Token.And;
                            case "or": return Token.Or;
                            case "is": return Token.Is;
                            case "instanceof": return Token.InstanceOf;
                            case "jump": return Token.Jump;
                        }
                        return Token.Identifier;
                    }

                    if (c >= CharCode._0 && c <= CharCode._9 || c === CharCode._ || c === CharCode.Dot) {
                        this.nextLiteral = this.digestNumber();
                        return Token.NumberLiteral;
                    }
                }

                // !
                case CharCode.Exclamation: {
                    ++this.tkPos;
                    if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.Equals) {
                        ++this.tkPos;
                        return Token.BangEq;
                    }
                    return Token.Bang;
                }

                // "string"
                case CharCode.DoubleQuote: {
                    ++this.tkPos;
                    this.nextLiteral = this.digestString()
                    return Token.StringLiteral;
                }

                // 'char'
                case CharCode.SingleQuote: {
                    ++this.tkPos;
                    this.error(
                        DiagnosticCode.UNSUPPORTED,
                        { message: "Character literals are not yet supported!" },
                        this.getRange()
                    )
                    return Token.CharLiteral;
                }

                // `raw`
                case CharCode.Backtick: {
                    ++this.tkPos;
                    this.error(
                        DiagnosticCode.UNSUPPORTED,
                        { message: "Raw literals are not yet supported!" },
                        this.getRange()
                    )
                    return Token.RawLiteral;
                }

                // %
                case CharCode.Percent: {
                    ++this.tkPos;
                    if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.Equals) {
                        ++this.tkPos;
                        return Token.PercentEq;
                    }
                    return Token.Percent;
                }

                // &
                case CharCode.Ampersand: {
                    ++this.tkPos;
                    if (this.tkPos < end) {
                        const ch = text.charCodeAt(this.tkPos);
                        if (ch === CharCode.Ampersand) {
                            ++this.tkPos;
                            return Token.AmpAmp;
                        }
                        if (ch === CharCode.Equals) {
                            ++this.tkPos;
                            return Token.AmpEq;
                        }
                    }
                    return Token.Amp;
                }

                // (
                case CharCode.OpenParen: {
                    ++this.tkPos;
                    return Token.OpenParen;
                }

                // )
                case CharCode.CloseParen: {
                    ++this.tkPos;
                    return Token.CloseParen;
                }

                // *
                case CharCode.Asterisk: {
                    ++this.tkPos;
                    if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.Equals) {
                        ++this.tkPos;
                        return Token.StarEq;
                    }
                    return Token.Star;
                }

                // +
                case CharCode.Plus: {
                    ++this.tkPos;
                    if (this.tkPos < end) {
                        const ch = text.charCodeAt(this.tkPos);
                        if (ch === CharCode.Plus) {
                            ++this.tkPos;
                            return Token.PlusPlus;
                        }
                        if (ch === CharCode.Equals) {
                            ++this.tkPos;
                            return Token.PlusEq;
                        }
                    }
                    return Token.Plus;
                }

                // -
                case CharCode.Minus: {
                    ++this.tkPos;
                    if (this.tkPos < end) {
                        const ch = text.charCodeAt(this.tkPos);
                        if (ch === CharCode.Minus) {
                            ++this.tkPos;
                            return Token.MinusMinus;
                        }
                        if (ch === CharCode.GreaterThan) {
                            ++this.tkPos;
                            return Token.Arrow;
                        }
                        if (ch === CharCode.Equals) {
                            ++this.tkPos;
                            return Token.MinusEq;
                        }
                    }
                    return Token.Minus;
                }

                // .
                case CharCode.Dot: {
                    ++this.tkPos;
                    if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.Dot) {
                        ++this.tkPos;
                        if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.Equals) {
                            ++this.tkPos;
                            return Token.DotDotEq;
                        }
                        if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.Dot) {
                            ++this.tkPos;
                            return Token.DotDotDot;
                        }
                        return Token.DotDot;
                    }
                    return Token.Dot;
                }

                // ,
                case CharCode.Comma: {
                    ++this.tkPos;
                    return Token.Comma;
                }

                // ;
                case CharCode.Semicolon: {
                    ++this.tkPos;
                    return Token.Semicolon;
                }

                // :
                case CharCode.Colon: {
                    ++this.tkPos;
                    return Token.Colon;
                }

                // ?
                case CharCode.Question: {
                    ++this.tkPos;
                    return Token.Question;
                }

                // [
                case CharCode.OpenBracket: {
                    ++this.tkPos;
                    return Token.OpenBracket;
                }

                // ]
                case CharCode.CloseBracket: {
                    ++this.tkPos;
                    return Token.CloseBracket;
                }

                // {
                case CharCode.OpenBrace: {
                    ++this.tkPos;
                    return Token.OpenBrace;
                }

                // }
                case CharCode.CloseBrace: {
                    ++this.tkPos;
                    return Token.CloseBrace;
                }

                // ~
                case CharCode.Tilde: {
                    ++this.tkPos;
                    return Token.Tilde;
                }

                // ^
                case CharCode.Caret: {
                    ++this.tkPos;
                    if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.Equals) {
                        ++this.tkPos;
                        return Token.CaretEq;
                    }
                    return Token.Caret;
                }

                // |
                case CharCode.Bar: {
                    ++this.tkPos;
                    if (this.tkPos < end) {
                        const ch = text.charCodeAt(this.tkPos);
                        if (ch === CharCode.Bar) {
                            ++this.tkPos;
                            return Token.BarBar;
                        }
                        if (ch === CharCode.Equals) {
                            ++this.tkPos;
                            return Token.BarEq;
                        }
                    }
                    return Token.Bar;
                }

                // =
                case CharCode.Equals: {
                    ++this.tkPos;
                    if (this.tkPos < end) {
                        const ch = text.charCodeAt(this.tkPos);
                        if (ch === CharCode.Equals) {
                            ++this.tkPos;
                            return Token.EqEq;
                        }
                        if (ch === CharCode.GreaterThan) {
                            ++this.tkPos;
                            return Token.FatArrow;
                        }
                    }
                    return Token.Eq;
                }

                // <
                case CharCode.LessThan: {
                    ++this.tkPos;
                    if (this.tkPos < end) {
                        const ch = text.charCodeAt(this.tkPos);
                        if (ch === CharCode.LessThan) {
                            ++this.tkPos;
                            if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.Equals) {
                                ++this.tkPos;
                                return Token.ShiftLeftEq;
                            }
                            return Token.ShiftLeft;
                        }
                        if (ch === CharCode.Equals) {
                            ++this.tkPos;
                            return Token.LessThanEq;
                        }
                    }
                    return Token.LessThan;
                }

                // >
                case CharCode.GreaterThan: {
                    ++this.tkPos;
                    if (this.tkPos < end) {
                        let ch = text.charCodeAt(this.tkPos);
                        if (ch === CharCode.GreaterThan) {
                            ++this.tkPos;
                            if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.Equals) {
                                ++this.tkPos;
                                return Token.ShiftRightEq;
                            }
                            return Token.ShiftRight;
                        }
                        if (ch === CharCode.Equals) {
                            ++this.tkPos;
                            return Token.GreaterThanEq;
                        }
                    }
                    return Token.GreaterThan;
                }

                // /
                case CharCode.Slash: {
                    ++this.tkPos;
                    if (this.tkPos < end) {
                        const ch = text.charCodeAt(this.tkPos);

                        // line comment: //
                        if (ch === CharCode.Slash) {
                            ++this.tkPos;
                            // consume until end of line or EOF
                            while (this.tkPos < end) {
                                const d = text.charCodeAt(this.tkPos);
                                if (d === CharCode.LineFeed) break;
                                this.tkPos++;
                            }
                            // do not return a token; let outer while() continue
                            continue;
                        }

                        // block comment: /* ... */
                        if (ch === CharCode.Asterisk) {
                            ++this.tkPos;
                            while (this.tkPos < end) {
                                const d = text.charCodeAt(this.tkPos);
                                if (d === CharCode.Asterisk) {
                                    this.tkPos++;
                                    if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.Slash) {
                                        this.tkPos++; // consume closing */
                                        break;
                                    }
                                    continue;
                                }

                                if (d === CharCode.LineFeed) {
                                    this.bumpLine();
                                    this.line = this.tkLine;
                                    this.lineStart = this.tkLineStart;
                                }

                                this.tkPos++;
                            }
                            // Unterminated block comment falls out of loop; you can emit a diagnostic here if you want.
                            continue;
                        }

                        // /= operator
                        if (ch === CharCode.Equals) {
                            ++this.tkPos;
                            return Token.SlashEq;
                        }
                    }
                    return Token.Slash;
                }

                // #
                case CharCode.Hash: {
                    ++this.tkPos;
                    if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.OpenBracket) {
                        ++this.tkPos;
                        return Token.AttrStart; // `#[`
                    }
                    return Token.Invalid;
                }
            }
        }

        ++this.tkPos;
        return Token.EndOfFile;
    }


    peek(lookahead: number = 0): Token {
        const state = this.getState();
        let tok: Token = Token.Invalid;

        if (!lookahead) {
            tok = this.next();
            state.unwind();
            return tok;
        }

        while (lookahead-- >= 0) {
            tok = this.next();
            if (tok === Token.EndOfFile) break;
        }

        state.unwind();
        return tok;
    }

    public readIdentifier(): string {
        if (!this.nextLiteral) {
            this.error(
                DiagnosticCode.MISSING_LITERAL,
                { function: "readIdentifier" },
                this.getRange() // This should be the current file hah
            );
        }
        if (this.lastToken !== Token.Identifier) {
            this.error(
                DiagnosticCode.EXPECTED_TOKEN,
                { expected: "identifier", found: tokenToString(this.lastToken) },
                this.getRange()
            );
        }
        return this.nextLiteral;
    }
    public readString(): string {
        if (!this.nextLiteral) {
            this.error(
                DiagnosticCode.MISSING_LITERAL,
                { function: "readString" },
                this.getRange() // This should be the current file hah
            );
        }
        if (this.lastToken !== Token.StringLiteral) {
            this.error(
                DiagnosticCode.EXPECTED_TOKEN,
                { expected: "string literal", found: tokenToString(this.lastToken) },
                this.getRange()
            );
        }
        return this.nextLiteral;
    }
    public readNumber(): string {
        if (!this.nextLiteral) {
            this.error(
                DiagnosticCode.MISSING_LITERAL,
                { function: "readNumber" },
                this.getRange() // This should be the current file hah
            );
        }
        if (this.lastToken !== Token.NumberLiteral) {
            this.error(
                DiagnosticCode.EXPECTED_TOKEN,
                { expected: "number literal", found: tokenToString(this.lastToken) },
                this.getRange()
            );
        }
        return this.nextLiteral;
    }
    private digestIdentifier(): string {
        const text = this.source.text;
        const end = this.end;

        this.pos = this.tkPos;

        this.tkPos++;

        while (this.tkPos < end) {
            const d = text.charCodeAt(this.tkPos);
            if (
                (d >= CharCode.A && d <= CharCode.Z) ||
                (d >= CharCode.a && d <= CharCode.z) ||
                (d >= CharCode._0 && d <= CharCode._9) ||
                d === CharCode._ ||
                d === CharCode.Dollar
            ) {
                ++this.tkPos;
            } else {
                break;
            }
        }

        this.nextLiteral = text.slice(this.pos, this.tkPos);
        return this.nextLiteral;
    }
    private digestNumber(): string {
        const text = this.source.text;
        const end = this.end;

        this.pos = this.tkPos;

        this.tkPos++;
        while (this.tkPos < end) {
            const d = text.charCodeAt(this.tkPos);
            if (d >= CharCode._0 && d <= CharCode._9) {
                ++this.tkPos;
            } else break;
        }

        if (this.tkPos < end && text.charCodeAt(this.tkPos) === CharCode.Dot) {
            const next = this.tkPos + 1 < end ? text.charCodeAt(this.tkPos + 1) : -1;
            if (next >= CharCode._0 && next <= CharCode._9) {
                this.tkPos += 2;
                while (this.tkPos < end) {
                    const d = text.charCodeAt(this.tkPos);
                    if (d >= CharCode._0 && d <= CharCode._9) {
                        ++this.tkPos;
                    } else break;
                }
            }
        }

        if (this.tkPos < end) {
            const e = text.charCodeAt(this.tkPos);
            if (e === CharCode.E || e === CharCode.e) {
                let p = this.tkPos + 1;
                if (p < end) {
                    const s = text.charCodeAt(p);
                    if (s === CharCode.Plus || s === CharCode.Minus) {
                        ++p;
                    }
                }
                if (p < end) {
                    const d = text.charCodeAt(p);
                    if (d >= CharCode._0 && d <= CharCode._9) {
                        this.tkPos = p + 1;
                        while (this.tkPos < end) {
                            const d2 = text.charCodeAt(this.tkPos);
                            if (d2 >= CharCode._0 && d2 <= CharCode._9) {
                                ++this.tkPos;
                            } else break;
                        }
                    }
                }
            }
        }

        this.nextLiteral = text.slice(this.pos, this.tkPos);
        return this.nextLiteral;
    }

    private digestString(): string {
        const text = this.source.text;
        const end = this.end;

        this.pos = this.tkPos - 1;

        this.nextLiteral = "";
        let start = this.tkPos;

        while (this.tkPos < end) {
            const ch = text.charCodeAt(this.tkPos);

            if (ch === CharCode.DoubleQuote) {
                if (this.tkPos > start) {
                    this.nextLiteral += text.slice(start, this.tkPos);
                }
                this.tkPos++;
                return this.nextLiteral;
            }

            if (ch === CharCode.Backslash) {
                if (this.tkPos > start) {
                    this.nextLiteral += text.slice(start, this.tkPos);
                }
                this.tkPos++;
                if (this.tkPos >= end) {
                    this.error(
                        DiagnosticCode.UNTERMINATED_STRING_LITERAL,
                        {},
                        this.getRange()
                    );
                }

                const esc = text.charCodeAt(this.tkPos);
                this.tkPos++;

                switch (esc) {
                    case CharCode.Backslash: this.nextLiteral += "\\"; break;
                    case CharCode.DoubleQuote: this.nextLiteral += "\""; break;
                    case CharCode.n: this.nextLiteral += "\n"; break;
                    case CharCode.r: this.nextLiteral += "\r"; break;
                    case CharCode.t: this.nextLiteral += "\t"; break;
                    case CharCode.b: this.nextLiteral += "\b"; break;
                    case CharCode.f: this.nextLiteral += "\f"; break;
                    default:
                        this.nextLiteral += String.fromCharCode(esc);
                        break;
                }

                start = this.tkPos;
                continue;
            }

            this.tkPos++;
        }

        if (this.tkPos > start)
            this.nextLiteral += text.slice(start, this.tkPos);

        this.error(
            DiagnosticCode.UNTERMINATED_STRING_LITERAL,
            {},
            this.getRange()
        );
    }
    getSurroundingLines(range: Range, padding: number = 1): {
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
                if (end > lineStart && text.charCodeAt(end - 1) === CharCode.CarriageReturn) {
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
        this.end = this.source.text.length;
        this.pos = 0;
        this.nextToken = null;
    }
}

export class TokenizerState {
    readonly tokenizer: Tokenizer;
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
        case Token.Invalid: return "Invalid";
        case Token.EndOfFile: return "EOF";

        // keywords
        case Token.Fn: return "fn";
        case Token.Struct: return "struct";
        case Token.Enum: return "enum";
        case Token.Interface: return "interface";
        case Token.Impl: return "impl";
        case Token.Import: return "import";
        case Token.Let: return "let";
        case Token.Mut: return "mut";
        case Token.If: return "if";
        case Token.Else: return "else";
        case Token.For: return "for";
        case Token.In: return "in";
        case Token.While: return "while";
        case Token.Match: return "match";
        case Token.Case: return "case";
        case Token.Default: return "default";
        case Token.Return: return "rt";
        case Token.Export: return "export";
        case Token.Extern: return "extern";
        case Token.As: return "as";
        case Token.Type: return "type";
        case Token.Null: return "null";
        case Token.Void: return "void";
        case Token.True: return "true";
        case Token.False: return "false";
        case Token.And: return "and";
        case Token.Or: return "or";
        case Token.Is: return "is";
        case Token.InstanceOf: return "instanceof";
        case Token.Jump: return "jump";

        // punctuation / operators
        case Token.OpenBrace: return "{";
        case Token.CloseBrace: return "}";
        case Token.OpenParen: return "(";
        case Token.CloseParen: return ")";
        case Token.OpenBracket: return "[";
        case Token.CloseBracket: return "]";
        case Token.Dot: return ".";
        case Token.DotDot: return "..";
        case Token.DotDotEq: return "..=";
        case Token.DotDotDot: return "...";
        case Token.Semicolon: return ";";
        case Token.Comma: return ",";
        case Token.LessThan: return "<";
        case Token.GreaterThan: return ">";
        case Token.LessThanEq: return "<=";
        case Token.GreaterThanEq: return ">=";
        case Token.EqEq: return "==";
        case Token.BangEq: return "!=";
        case Token.Arrow: return "->";
        case Token.FatArrow: return "=>";
        case Token.Plus: return "+";
        case Token.Minus: return "-";
        case Token.Star: return "*";
        case Token.Slash: return "/";
        case Token.Percent: return "%";
        case Token.PlusPlus: return "++";
        case Token.MinusMinus: return "--";
        case Token.ShiftLeft: return "<<";
        case Token.ShiftRight: return ">>";
        case Token.Amp: return "&";
        case Token.Bar: return "|";
        case Token.Caret: return "^";
        case Token.Bang: return "!";
        case Token.Tilde: return "~";
        case Token.AmpAmp: return "&&";
        case Token.BarBar: return "||";
        case Token.Question: return "?";
        case Token.Colon: return ":";
        case Token.Eq: return "=";
        case Token.PlusEq: return "+=";
        case Token.MinusEq: return "-=";
        case Token.StarEq: return "*=";
        case Token.SlashEq: return "/=";
        case Token.PercentEq: return "%=";
        case Token.ShiftLeftEq: return "<<=";
        case Token.ShiftRightEq: return ">>=";
        case Token.AmpEq: return "&=";
        case Token.BarEq: return "|=";
        case Token.CaretEq: return "^=";
        case Token.AttrStart: return "#[";

        // literals (kind names, not values)
        case Token.Identifier: return "identifier";
        case Token.StringLiteral: return "string literal";
        // case Token.IntegerLiteral: return "integer literal";
        // case Token.FloatLiteral: return "float literal";
        case Token.NumberLiteral: return "number literal";
        case Token.CharLiteral: return "char literal";
        case Token.RawLiteral: return "raw literal";

        // trivia
        case Token.LineComment: return "line comment";
        case Token.BlockComment: return "block comment";

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
