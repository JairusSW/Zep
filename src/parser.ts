// parser.ts

import {
  BinaryExpression,
  BlockExpression as BlockStatement,
  BooleanLiteral,
  CallExpression,
  EnumDeclaration,
  Expression,
  ExpressionStatement,
  FieldAccessKind,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  IfStatementKind,
  ImportDeclaration,
  NumberLiteral,
  ParameterExpression,
  ParenthesizedExpression,
  PropertyAccessExpression,
  ReturnStatement,
  Statement,
  StringLiteral,
  StructDeclaration,
  StructFieldDeclaration,
  tokenToOp,
  TypeExpression,
  VariableDeclaration,
  WhileStatement,
} from "./ast.js";
import { EnumFieldDeclaration } from "./ast/EnumElement.js";
import { AttributeExpression } from "./ast/AttributeExpression.js";
import { Node } from "./ast/Node.js";
import { DiagnosticCode, DiagnosticEmitter } from "./diagnostics.js";
import { Range } from "./range.js";
import { Source } from "./source.js";
import { Stack } from "./stack.js";
import {
  Token,
  Tokenizer,
  TokenizerState,
  tokenToString,
} from "./tokenizer.js";
import { isRightAssociative, opPrecedence } from "./util.js";

type ParserSnapshot = {
  tokenizerState: TokenizerState;
  current: Token;
  rangesSize: number;
};

export class Parser extends DiagnosticEmitter {
  public tokenizer!: Tokenizer;
  public sources: Source[];

  public backlog: Stack<string> = new Stack<string>();
  public seenlog: Set<string> = new Set<string>();
  public donelog: Set<string> = new Set<string>();

  private ranges: Stack<Range> = new Stack<Range>();
  public currentSource!: Source;
  private current: Token = Token.Invalid;

  constructor(sources: Source[] = []) {
    super();
    this.sources = sources;
  }

  protected getFileName(): string {
    return this.currentSource.fileName;
  }

  // --- state management ---

  public setSource(source: Source): void {
    if (!this.sources.includes(source)) this.sources.push(source);
    this.currentSource = source;
    this.tokenizer = new Tokenizer(this.currentSource);
    this.current = Token.Invalid; // nothing consumed yet
  }

  public parseSource(source: Source): Statement[] {
    this.setSource(source);
    this.parseTopLevelStatements();
    return this.currentSource.statements;
  }

  private tryParse<T extends Node>(fn: () => T | null): T | null {
    const state = this.checkpoint();
    const node = fn();
    if (!node) {
      this.restore(state);
      return null;
    }
    return node;
  }

  private checkpoint(): ParserSnapshot {
    return {
      tokenizerState: this.tokenizer.createState(),
      current: this.current,
      rangesSize: this.ranges.size,
    };
  }

  private restore(state: ParserSnapshot): void {
    state.tokenizerState.unwind();
    this.current = state.current;
    while (this.ranges.size > state.rangesSize) {
      this.ranges.pop();
    }
  }

  private reportSyntaxError(
    code: DiagnosticCode,
    params: Record<string, string> = {},
    range: Range | null = this.getCurrentRange(),
  ): void {
    this.warn(code, params, range);
  }

  private isTopLevelStart(token: Token): boolean {
    return (
      token === Token.Hash ||
      token === Token.Fn ||
      token === Token.Import ||
      token === Token.Let ||
      token === Token.Mut ||
      token === Token.Struct ||
      token === Token.Enum
    );
  }

  private isStatementStart(token: Token): boolean {
    return (
      token === Token.OpenBrace ||
      token === Token.Let ||
      token === Token.Mut ||
      token === Token.Return ||
      token === Token.If ||
      token === Token.Else ||
      token === Token.While ||
      token === Token.Identifier ||
      token === Token.NumberLiteral ||
      token === Token.StringLiteral ||
      token === Token.True ||
      token === Token.False ||
      token === Token.OpenParen
    );
  }

  private synchronizeTopLevel(): void {
    let consumed = false;
    while (true) {
      const next = this.peekNextToken();
      if (next === Token.EndOfFile) return;
      if (consumed && this.isTopLevelStart(next)) return;
      this.advance();
      consumed = true;
      if (this.current === Token.Semicolon) return;
    }
  }

  private synchronizeStatement(allowImmediateBoundary: boolean = false): void {
    let consumed = false;
    while (true) {
      const next = this.peekNextToken();
      if (next === Token.EndOfFile || next === Token.CloseBrace) return;
      if ((consumed || allowImmediateBoundary) && this.isStatementStart(next)) {
        return;
      }
      this.advance();
      consumed = true;
      if (this.current === Token.Semicolon) return;
    }
  }

  private synchronizeTo(stops: Token[]): void {
    while (true) {
      const next = this.peekNextToken();
      if (next === Token.EndOfFile) return;
      if (stops.includes(next)) return;
      this.advance();
    }
  }

  private advance(): Token {
    this.current = this.tokenizer.next();
    return this.current;
  }

  private matches(token: Token): boolean {
    return this.current === token;
  }

  private peek(token: Token): boolean {
    const state = this.checkpoint();
    const next = this.advance();
    this.restore(state);
    return next === token;
  }

  private peekNextToken(): Token {
    const state = this.checkpoint();
    const token = this.advance();
    this.restore(state);
    return token;
  }

  private consume(token: Token): boolean {
    const state = this.checkpoint();
    this.advance();
    if (this.matches(token)) return true;
    this.restore(state);
    return false;
  }

  private expect(token: Token, diagnosticToken: string = tokenToString(token)): void {
    this.advance();
    if (!this.matches(token)) {
      this.reportSyntaxError(
        DiagnosticCode.MISSING_TOKEN,
        { token: diagnosticToken },
        this.getCurrentRange(),
      );
    }
  }

  private getCurrentRange(): Range {
    return this.tokenizer.getRange();
  }

  private getStartRange(): Range {
    return (
      this.ranges.peek() ??
      new Range(
        { line: 0, column: 0 },
        { line: 0, column: 0 },
        this.currentSource,
      )
    );
  }

  private getRange(
    start: Range = this.getStartRange(),
    end: Range = this.getCurrentRange(),
  ): Range {
    return Range.from(start, end);
  }

  // --- top-level ---

  parseTopLevelStatements(): void {
    while (true) {
      const next = this.peekNextToken();
      if (next === Token.EndOfFile) break;
      const stmt = this.parseTopLevelStatement();
      if (stmt) {
        this.currentSource.statements.push(stmt);
        continue;
      }
      this.reportSyntaxError(
        DiagnosticCode.EXPECTED_TOKEN,
        { expected: "top-level declaration", found: tokenToString(next) },
      );
      this.synchronizeTopLevel();
    }
  }

  parseTopLevelStatement(): Statement | null {
    const startRange = this.getCurrentRange();
    this.ranges.push(startRange);

    const token = this.peekNextToken();
    let node: Statement | null = null;

    if (token === Token.Hash) {
      node =
        this.tryParse(() => this.parseFunctionDeclaration()) ??
        this.tryParse(() => this.parseStructDeclaration()) ??
        this.tryParse(() => this.parseEnumDeclaration());
    } else if (token === Token.Fn) {
      node = this.parseFunctionDeclaration();
    } else if (token === Token.Import) {
      node = this.parseImportDeclaration();
    } else if (token === Token.Let || token === Token.Mut) {
      node = this.parseVariableDeclaration();
    } else if (token === Token.Struct) {
      node = this.parseStructDeclaration();
    } else if (token === Token.Enum) {
      node = this.parseEnumDeclaration();
    }

    if (node) return this.ranges.pop(), node;

    this.ranges.pop();
    return null;
  }

  parseStatement(): Statement | null {
    const startRange = this.getCurrentRange();
    this.ranges.push(startRange);

    const token = this.peekNextToken();
    let node: Statement | null = null;

    if (token === Token.OpenBrace) {
      node = this.parseBlockStatement();
    } else if (token === Token.Let || token === Token.Mut) {
      node = this.parseVariableDeclaration();
    } else if (token === Token.Return) {
      node = this.parseReturnStatement();
    } else if (token === Token.If || token === Token.Else) {
      node = this.parseIfStatement();
    } else if (token === Token.While) {
      node = this.parseWhileStatement();
    } else {
      node = this.parseExpressionStatement();
    }

    if (node) return this.ranges.pop(), node;

    this.ranges.pop();
    return null;
  }

  // --- expressions / precedence ---

  parseExpression(): Expression | null {
    const state = this.checkpoint();
    const startRange = this.getCurrentRange();
    this.ranges.push(startRange);
    let expr: Expression | null;
    if ((expr = this.parseBinaryExpression(1))) return this.ranges.pop(), expr;
    this.restore(state);
    // if (expr = this.parseBlockStatement()) return this.ranges.pop(), expr;
    // this.restore(state);
    this.ranges.pop();
    return null;
  }

  private parseAtomExpression(): Expression | null {
    const state = this.checkpoint();
    let expr: Expression | null = null;
    if ((expr = this.parseIdentifierExpression())) return expr;
    this.restore(state);
    if ((expr = this.parseParenthesizedExpression())) return expr;
    this.restore(state);
    if ((expr = this.parseNumberLiteral())) return expr;
    this.restore(state);
    if ((expr = this.parseStringLiteral())) return expr;
    this.restore(state);
    if ((expr = this.parseBooleanLiteral())) return expr;
    this.restore(state);
    return null;
  }

  private parsePostfixExpression(): Expression | null {
    let expr = this.parseAtomExpression();
    if (!expr) return null;

    while (true) {
      const state = this.checkpoint();
      const token = this.advance();

      if (token === Token.Dot) {
        const property = this.parseIdentifierExpression();
        if (!property) {
          this.reportSyntaxError(
            DiagnosticCode.EXPECTED_TOKEN,
            { expected: "identifier", found: tokenToString(this.peekNextToken()) },
            this.getCurrentRange(),
          );
          this.synchronizeTo([
            Token.Dot,
            Token.OpenParen,
            Token.CloseParen,
            Token.Comma,
            Token.Semicolon,
            Token.CloseBrace,
          ]);
          return expr;
        }

        expr = new PropertyAccessExpression(
          expr,
          property,
          Range.from(expr.range, property.range),
        );
        continue;
      }

      if (token === Token.OpenParen) {
        const args: Expression[] = [];

        const emptyArgsState = this.checkpoint();
        this.advance();
        if (!this.matches(Token.CloseParen)) {
          this.restore(emptyArgsState);

          while (true) {
            const arg = this.parseExpression();
            if (!arg) {
              this.reportSyntaxError(
                DiagnosticCode.EXPECTED_TOKEN,
                { expected: "expression", found: tokenToString(this.peekNextToken()) },
                this.getCurrentRange(),
              );
              this.synchronizeTo([
                Token.Comma,
                Token.CloseParen,
                Token.Semicolon,
                Token.CloseBrace,
              ]);
              if (this.consume(Token.Comma)) continue;
              if (this.consume(Token.CloseParen)) break;
              return expr;
            }
            args.push(arg);

            this.advance();
            if (this.matches(Token.Comma)) continue;
            if (this.matches(Token.CloseParen)) break;

            this.reportSyntaxError(
              DiagnosticCode.UNTERMINATED_GROUP,
              { kind: ")" },
              this.getCurrentRange(),
            );
            this.synchronizeTo([
              Token.CloseParen,
              Token.Semicolon,
              Token.CloseBrace,
            ]);
            if (!this.consume(Token.CloseParen)) return expr;
            break;
          }
        }

        expr = new CallExpression(
          expr,
          args,
          Range.from(expr.range, this.getCurrentRange()),
        );
        continue;
      }

      this.restore(state);
      return expr;
    }
  }

  private parseBinaryExpression(minPrec: number = 1): Expression | null {
    let state = this.checkpoint();
    let left = this.parsePostfixExpression();
    if (!left) {
      this.restore(state);
      return null;
    }

    while (true) {
      state = this.checkpoint();
      const opToken = this.advance();
      const op = tokenToOp(opToken);
      if (op === null) {
        this.restore(state);
        break;
      }

      const prec = opPrecedence(op);
      if (prec < minPrec) {
        this.restore(state);
        break;
      }

      const nextMin = isRightAssociative(op) ? prec : prec + 1;
      const right = this.parseBinaryExpression(nextMin);
      if (!right) {
        this.reportSyntaxError(
          DiagnosticCode.EXPECTED_EXPRESSION_AFTER_OPERATOR,
          { operator: tokenToString(opToken) },
          this.getCurrentRange(),
        );
        this.synchronizeTo([
          Token.Hash,
          Token.Fn,
          Token.Import,
          Token.Let,
          Token.Mut,
          Token.Struct,
          Token.Enum,
          Token.Return,
          Token.If,
          Token.Else,
          Token.While,
          Token.Identifier,
          Token.NumberLiteral,
          Token.StringLiteral,
          Token.True,
          Token.False,
          Token.OpenParen,
          Token.OpenBrace,
          Token.Semicolon,
          Token.Comma,
          Token.CloseParen,
          Token.CloseBrace,
        ]);
        break;
      }

      const result: BinaryExpression = new BinaryExpression(
        left,
        op,
        right,
        this.getRange(left.range, right.range),
      );
      left = result;
    }

    return left;
  }

  parsePropertyAccessExpression(): PropertyAccessExpression | null {
    const state = this.checkpoint();
    const expr = this.parsePostfixExpression();
    if (expr instanceof PropertyAccessExpression) return expr;
    this.restore(state);
    return null;
  }

  parseCallExpression(): CallExpression | null {
    const state = this.checkpoint();
    const expr = this.parsePostfixExpression();
    if (expr instanceof CallExpression) return expr;
    this.restore(state);
    return null;
  }

  parseParenthesizedExpression(): ParenthesizedExpression | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    if (!this.consume(Token.OpenParen)) return null;

    const expr = this.parseExpression();
    if (!expr) {
      this.restore(state);
      return null;
    }

    if (!this.consume(Token.CloseParen)) {
      this.reportSyntaxError(
        DiagnosticCode.UNTERMINATED_GROUP,
        { kind: ")" },
        this.getCurrentRange(),
      );
      this.synchronizeTo([Token.CloseParen, Token.Semicolon, Token.CloseBrace]);
      this.consume(Token.CloseParen);
    }

    return new ParenthesizedExpression(
      expr,
      this.getRange(start, this.getCurrentRange()),
    );
  }

  parseExpressionStatement(): ExpressionStatement | null {
    const state = this.checkpoint();

    const expr = this.parseExpression();
    if (!expr) {
      this.restore(state);
      return null;
    }
    return new ExpressionStatement(expr);
  }

  // --- type syntax ---

  parseTypeExpression(): TypeExpression | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    this.advance();
    if (!this.isTypeToken(this.current)) return this.restore(state), null;

    const types: string[] = [];
    types.push(this.readTypeToken());

    let union = false;
    while (this.consume(Token.Bar)) {
      union = true;
      this.advance();
      if (!this.isTypeToken(this.current)) {
        this.reportSyntaxError(
          DiagnosticCode.EXPECTED_TYPE_AFTER_BAR_IN_UNION,
          {},
          this.getCurrentRange(),
        );
        this.synchronizeTo([Token.Comma, Token.CloseParen, Token.Eq, Token.OpenBrace, Token.CloseBrace]);
        break;
      }
      types.push(this.readTypeToken());
    }

    return new TypeExpression(
      types,
      union,
      this.getRange(start, this.getCurrentRange()),
    );
  }

  private isTypeToken(token: Token): boolean {
    return token === Token.Identifier || token === Token.Void || token === Token.Null;
  }

  private readTypeToken(): string {
    if (this.matches(Token.Void)) return "void";
    if (this.matches(Token.Null)) return "null";
    return this.tokenizer.readIdentifier();
  }

  // --- variable declarations ---

  parseVariableDeclaration(): VariableDeclaration | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    let mutable: boolean;
    if (this.consume(Token.Let)) {
      mutable = false;
    } else if (this.consume(Token.Mut)) {
      mutable = true;
    } else {
      this.restore(state);
      return null;
    }

    const name = this.parseIdentifierExpression(); // name

    if (!name) {
      this.reportSyntaxError(
        DiagnosticCode.MISSING_LITERAL,
        {},
        this.getCurrentRange()
      );
      this.synchronizeStatement(true);
      return null;
    }

    let type: TypeExpression | null = null;
    let value: Expression | null = null;

    if (this.consume(Token.Colon)) {
      type = this.parseTypeExpression();
      if (!type) {
        this.reportSyntaxError(
          DiagnosticCode.EXPECTED_TYPE_AFTER_COLON,
          {},
          this.getCurrentRange(),
        );
        this.synchronizeStatement(true);
        return null;
      }
      if (this.consume(Token.Eq)) {
        value = this.parseExpression();
        if (!value) {
          this.reportSyntaxError(
            DiagnosticCode.EXPECTED_TOKEN,
            { expected: "expression", found: tokenToString(this.peekNextToken()) },
            this.getCurrentRange(),
          );
          this.synchronizeStatement(true);
          return null;
        }
      }
    } else if (this.consume(Token.Eq)) {
      value = this.parseExpression();
      if (!value) {
        this.reportSyntaxError(
          DiagnosticCode.EXPECTED_TOKEN,
          { expected: "expression", found: tokenToString(this.peekNextToken()) },
          this.getCurrentRange(),
        );
        this.synchronizeStatement(true);
        return null;
      }
    } else {
      this.reportSyntaxError(
        DiagnosticCode.EXPECTED_EQUALS_OR_COLON_AFTER_VARIABLE_NAME,
        {},
        this.getCurrentRange(),
      );
      this.synchronizeStatement(true);
      return null;
    }

    const endNode = (value ?? type ?? name) as Node;
    return new VariableDeclaration(
      name,
      value,
      type,
      mutable,
      this.getRange(start, endNode.range),
    );
  }

  // --- function declarations ---

  parseParameterExpression(): ParameterExpression | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    const name = this.parseIdentifierExpression();
    if (!name) return null;

    if (!this.consume(Token.Colon)) {
      this.reportSyntaxError(
        DiagnosticCode.MISSING_TOKEN,
        { token: ":" },
        this.getCurrentRange(),
      );
      this.synchronizeTo([Token.Comma, Token.CloseParen]);
      return null;
    }

    const type = this.parseTypeExpression();
    if (!type) {
      this.reportSyntaxError(
        DiagnosticCode.EXPECTED_TYPE_AFTER_COLON,
        {},
        this.getCurrentRange(),
      );
      this.synchronizeTo([Token.Comma, Token.CloseParen]);
      this.restore(state);
      return null;
    }

    return new ParameterExpression(
      name,
      type,
      this.getRange(start, type.range),
    );
  }

  parseFunctionDeclaration(): FunctionDeclaration | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    const attributes: AttributeExpression[] = [];
    while (true) {
      const attribute = this.tryParse(() => this.parseAttributeExpression());
      if (!attribute) break;
      attributes.push(attribute);
    }

    let exported = attributes.some((v) => v.tag.data === "export");

    if (!this.consume(Token.Fn)) {
      this.restore(state);
      return null;
    }

    const name = this.parseIdentifierExpression(); // name
    if (!name) {
      this.reportSyntaxError(
        DiagnosticCode.EXPECTED_NAME_AFTER_FUNCTION,
        {},
        this.getCurrentRange(),
      );
      this.synchronizeTopLevel();
      return null;
    }

    if (!this.consume(Token.OpenParen)) {
      this.reportSyntaxError(
        DiagnosticCode.EXPECTED_PARAMETER_LIST,
        {},
        this.getCurrentRange(),
      );
      this.synchronizeTopLevel();
      return null;
    }

    const params: ParameterExpression[] = [];
    if (!this.consume(Token.CloseParen)) {
      while (true) {
        const param = this.parseParameterExpression();
        if (!param) {
          this.reportSyntaxError(
            DiagnosticCode.EXPECTED_TOKEN,
            { expected: "parameter", found: tokenToString(this.peekNextToken()) },
            this.getCurrentRange(),
          );
          this.synchronizeTo([Token.Comma, Token.CloseParen]);
          if (this.consume(Token.Comma)) continue;
          if (this.consume(Token.CloseParen)) break;
          return null;
        }
        params.push(param);

        if (this.consume(Token.Comma)) continue;
        if (this.consume(Token.CloseParen)) break;
        this.reportSyntaxError(
          DiagnosticCode.MISSING_TOKEN,
          { token: ")" },
          this.getCurrentRange(),
        );
        this.synchronizeTo([Token.CloseParen, Token.OpenBrace]);
        if (!this.consume(Token.CloseParen)) return null;
        break;
      }
    }

    let returnType: TypeExpression | null = null;
    if (this.consume(Token.Colon)) {
      returnType = this.parseTypeExpression();
      if (!returnType) {
        this.reportSyntaxError(
          DiagnosticCode.EXPECTED_TYPE_AFTER_COLON,
          {},
          this.getCurrentRange(),
        );
        this.synchronizeTo([Token.OpenBrace, Token.Hash, Token.Fn, Token.Struct, Token.Enum, Token.Import]);
        return null;
      }
    }

    const isExtern = attributes.some((v) => v.tag.data === "extern");
    const block = isExtern
      ? new BlockStatement([], this.getCurrentRange())
      : this.parseStatement();
    if (!block) {
      this.reportSyntaxError(
        DiagnosticCode.EXPECTED_TOKEN,
        { expected: "function body", found: tokenToString(this.peekNextToken()) },
        this.getCurrentRange(),
      );
      this.synchronizeTopLevel();
      return null;
    }

    return new FunctionDeclaration(
      attributes,
      name,
      params,
      returnType,
      block,
      exported,
      this.getRange(start, block.range),
    );
  }

  // --- enum declarations ---

  parseEnumDeclaration(): EnumDeclaration | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    const attributes = this.parseAttributes();

    if (!this.consume(Token.Enum)) {
      this.restore(state);
      return null;
    }

    const name = this.parseIdentifierExpression();
    if (!name) {
      this.reportSyntaxError(
        DiagnosticCode.EXPECTED_NAME_AFTER_ENUM,
        {},
        this.getCurrentRange(),
      );
      this.synchronizeTopLevel();
      return null;
    }

    if (!this.consume(Token.OpenBrace)) {
      this.reportSyntaxError(
        DiagnosticCode.MISSING_TOKEN,
        { token: "{" },
        this.getCurrentRange(),
      );
      this.synchronizeTopLevel();
      return null;
    }

    const elements: EnumFieldDeclaration[] = [];
    let index = 0;

    if (!this.consume(Token.CloseBrace)) {
      while (!this.peek(Token.CloseBrace) && !this.peek(Token.EndOfFile)) {
        const fieldAttributes = this.parseAttributes();

        const elementName = this.parseIdentifierExpression();
        if (!elementName) {
          this.reportSyntaxError(
            DiagnosticCode.EXPECTED_TOKEN,
            { expected: "enum member", found: tokenToString(this.peekNextToken()) },
            this.getCurrentRange(),
          );
          this.synchronizeTo([Token.Comma, Token.CloseBrace]);
          if (this.consume(Token.Comma)) continue;
          break;
        }

        let elementValue: NumberLiteral | StringLiteral | null = null;

        if (this.consume(Token.Eq)) {
          elementValue = this.parseNumberLiteral() || this.parseStringLiteral();
          if (!elementValue) {
            this.reportSyntaxError(
              DiagnosticCode.EXPECTED_VALUE_AFTER_EQUALS,
              {},
              this.getCurrentRange(),
            );
            this.synchronizeTo([Token.Comma, Token.CloseBrace]);
          }
        }

        const valueNode =
          elementValue ||
          new NumberLiteral(index.toString(), null, elementName.range);

        const element = new EnumFieldDeclaration(
          fieldAttributes,
          elementName,
          valueNode,
          this.getRange(elementName.range, valueNode.range),
        );
        elements.push(element);
        index++;

        if (this.consume(Token.Comma)) continue;
        break;
      }
    }

    if (!this.consume(Token.CloseBrace)) {
      this.reportSyntaxError(
        DiagnosticCode.MISSING_TOKEN,
        { token: "}" },
        this.getCurrentRange(),
      );
      this.synchronizeTopLevel();
    }

    return new EnumDeclaration(
      attributes,
      name,
      elements,
      this.getRange(start, this.getCurrentRange()),
    );
  }

  // --- if / while / blocks ---

  parseIfStatement(parent: IfStatement | null = null): IfStatement | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    let kind: IfStatementKind;

    if (!parent) {
      if (!this.consume(Token.If)) {
        this.restore(state);
        return null;
      }
      kind = IfStatementKind.If;
    } else {
      if (!this.consume(Token.Else)) {
        this.restore(state);
        return null;
      }

      if (this.consume(Token.If)) {
        kind = IfStatementKind.ElseIf;
      } else {
        kind = IfStatementKind.Else;
      }
    }

    let condition: Expression | null = null;
    if (kind !== IfStatementKind.Else) {
      condition = this.parseExpression();
      if (!condition) {
        this.restore(state);
        return null;
      }
    }

    const ifTrue = this.parseBlockStatement();
    if (!ifTrue) {
      this.restore(state);
      return null;
    }

    const node = new IfStatement(
      condition,
      ifTrue,
      null,
      kind,
      this.getRange(start, ifTrue.range),
    );

    node.ifFalse = this.tryParse(() => this.parseIfStatement(node));
    if (!node.ifFalse) {
      return node;
    }

    node.range = this.getRange(start, node.ifFalse.range);
    return node;
  }

  parseWhileStatement(): WhileStatement | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    if (!this.consume(Token.While)) {
      this.restore(state);
      return null;
    }

    const condition = this.parseExpression();
    if (!condition) {
      this.restore(state);
      return null;
    }

    const body = this.parseStatement();
    if (!body) {
      this.restore(state);
      return null;
    }

    return new WhileStatement(
      condition,
      body,
      this.getRange(start, body.range),
    );
  }

  parseBlockStatement(): BlockStatement | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    if (!this.consume(Token.OpenBrace)) {
      this.restore(state);
      return null;
    }

    if (this.consume(Token.CloseBrace)) {
      return new BlockStatement([], this.getRange(start, this.getCurrentRange()));
    }

    const stmts: Statement[] = [];

    while (
      !this.peek(Token.CloseBrace) &&
      !this.peek(Token.EndOfFile)
    ) {
      const beforeCursor = this.tokenizer.cursor;
      const stmt = this.parseStatement();
      if (!stmt) {
        this.reportSyntaxError(
          DiagnosticCode.EXPECTED_TOKEN,
          { expected: "statement", found: tokenToString(this.peekNextToken()) },
        );
        this.synchronizeStatement(true);
        if (this.tokenizer.cursor === beforeCursor) {
          const next = this.peekNextToken();
          if (next !== Token.EndOfFile && next !== Token.CloseBrace) {
            this.advance();
          }
        }
        continue;
      }
      stmts.push(stmt);
    }

    if (!this.consume(Token.CloseBrace)) {
      this.reportSyntaxError(
        DiagnosticCode.MISSING_TOKEN_AT,
        { token: "}", message: "at end of block." },
        this.getCurrentRange(),
      );
    }

    return new BlockStatement(
      stmts,
      this.getRange(start, this.getCurrentRange()),
    );
  }

  // --- attributes / import / return ---

  parseAttributeExpression(): AttributeExpression | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    if (!this.consume(Token.Hash)) {
      this.restore(state);
      return null;
    }

    if (!this.consume(Token.OpenBracket)) {
      this.restore(state);
      return null;
    }

    // attribute name: export / extern / inline / ...
    this.advance();
    const tag = this.parseAttributeTag();
    if (!tag) {
      this.reportSyntaxError(
        DiagnosticCode.EXPECTED_TAG_IN_MODIFIER,
        {},
        this.getCurrentRange(),
      );
      this.synchronizeTo([Token.CloseBracket]);
      if (!this.consume(Token.CloseBracket)) return null;
      return null;
    }

    const args: Record<string, string> = {};

    if (this.consume(Token.OpenParen)) {
      this.advance();
      if (!this.matches(Token.CloseParen)) {
        if (this.matches(Token.StringLiteral)) {
          args["value"] = this.tokenizer.readString();
        } else if (this.matches(Token.Identifier)) {
          while (true) {
            if (!this.matches(Token.Identifier)) {
              this.reportSyntaxError(
                DiagnosticCode.EXPECTED_TOKEN,
                { expected: "identifier", found: tokenToString(this.current) },
                this.getCurrentRange(),
              );
              this.synchronizeTo([Token.Comma, Token.CloseParen, Token.CloseBracket]);
              break;
            }
            const key = this.tokenizer.readIdentifier();

            if (!this.consume(Token.Eq)) {
              this.reportSyntaxError(
                DiagnosticCode.EXPECTED_TOKEN,
                { expected: "=", found: tokenToString(this.current) },
                this.getCurrentRange(),
              );
              this.synchronizeTo([Token.Comma, Token.CloseParen, Token.CloseBracket]);
              break;
            }

            const valueLit = this.parseStringLiteral() || null;
            if (!valueLit) {
              this.reportSyntaxError(
                DiagnosticCode.EXPECTED_VALUE_AFTER_EQUALS,
                {},
                this.getCurrentRange(),
              );
              this.synchronizeTo([Token.Comma, Token.CloseParen, Token.CloseBracket]);
              break;
            }

            args[key] = valueLit.data;

            if (!this.consume(Token.Comma)) break;
            this.advance();
          }
        }

        if (!this.consume(Token.CloseParen)) {
          this.reportSyntaxError(
            DiagnosticCode.UNTERMINATED_GROUP,
            { kind: ")" },
            this.getCurrentRange(),
          );
          this.synchronizeTo([Token.CloseParen, Token.CloseBracket]);
          this.consume(Token.CloseParen);
        }
      }
    }

    if (!this.consume(Token.CloseBracket)) {
      this.reportSyntaxError(
        DiagnosticCode.MISSING_TOKEN,
        { token: "]" },
        this.getCurrentRange(),
      );
      this.synchronizeTo([Token.CloseBracket, Token.Hash, Token.Fn, Token.Struct, Token.Enum]);
      this.consume(Token.CloseBracket);
      return null;
    }

    return new AttributeExpression(
      tag,
      args,
      this.getRange(start, this.getCurrentRange()),
    );
  }

  private parseAttributeTag(): Identifier | null {
    if (this.matches(Token.Identifier)) {
      return new Identifier(this.tokenizer.readIdentifier(), this.getCurrentRange());
    }
    if (this.matches(Token.Extern)) {
      return new Identifier("extern", this.getCurrentRange());
    }
    return null;
  }

  parseImportDeclaration(): ImportDeclaration | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    if (!this.consume(Token.Import)) {
      this.restore(state);
      return null;
    }

    const path = this.parseStringLiteral();
    if (!path) {
      this.restore(state);
      return null;
    }

    return new ImportDeclaration(path, this.getRange(start, path.range));
  }

  parseReturnStatement(): ReturnStatement | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    if (!this.consume(Token.Return)) {
      this.restore(state);
      return null;
    }
    const expr = this.parseExpression();
    if (!expr) {
      this.reportSyntaxError(
        DiagnosticCode.EXPECTED_EXPRESSION_AFTER_RETURN,
        {},
        this.getCurrentRange(),
      );
      this.synchronizeStatement(true);
      return null;
    }

    return new ReturnStatement(expr, this.getRange(start, expr.range));
  }

  // --- struct fields ---

  parseStructFieldExpression(): StructFieldDeclaration | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    const attributes = this.parseAttributes();

    this.advance();
    if (!this.matches(Token.Identifier)) {
      this.restore(state);
      return null;
    }

    let access: FieldAccessKind = FieldAccessKind.Public;
    let nameText = this.tokenizer.readIdentifier();
    const isAccessModifier =
      nameText === "public" || nameText === "private" || nameText === "final";
    if (isAccessModifier && this.peek(Token.Identifier)) {
      if (nameText === "private") access = FieldAccessKind.Private;
      if (nameText === "final") access = FieldAccessKind.Final;
      this.advance();
      if (!this.matches(Token.Identifier)) {
        this.reportSyntaxError(
          DiagnosticCode.EXPECTED_TOKEN,
          { expected: "identifier", found: tokenToString(this.current) },
          this.getCurrentRange(),
        );
        this.synchronizeTo([Token.CloseBrace]);
        return null;
      }
      nameText = this.tokenizer.readIdentifier();
    }

    const nameRange = this.getCurrentRange();
    const name = new Identifier(nameText, nameRange);

    if (!this.consume(Token.Colon)) {
      this.reportSyntaxError(
        DiagnosticCode.MISSING_TOKEN,
        { token: ":" },
        this.getCurrentRange(),
      );
      this.synchronizeTo([Token.CloseBrace]);
      return null;
    }

    const type = this.parseTypeExpression();
    if (!type) {
      this.reportSyntaxError(
        DiagnosticCode.EXPECTED_TYPE_AFTER_COLON,
        {},
        this.getCurrentRange(),
      );
      this.synchronizeTo([Token.Comma, Token.CloseBrace]);
      return null;
    }
    let value: Expression | null = null;
    if (this.consume(Token.Eq)) {
      value = this.parseExpression();
      if (!value) {
        this.reportSyntaxError(
          DiagnosticCode.EXPECTED_TOKEN,
          { expected: "expression", found: tokenToString(this.peekNextToken()) },
          this.getCurrentRange(),
        );
        this.synchronizeTo([Token.Comma, Token.CloseBrace]);
        return null;
      }
    }

    return new StructFieldDeclaration(
      attributes,
      name,
      type,
      access,
      value,
      this.getRange(start, nameRange),
    );
  }

  parseStructDeclaration(): StructDeclaration | null {
    const state = this.checkpoint();
    const start = this.getCurrentRange();

    const attributes = this.parseAttributes();

    if (!this.consume(Token.Struct)) {
      this.restore(state);
      return null;
    }
    const name = this.parseIdentifierExpression();
    if (!name) {
      this.reportSyntaxError(
        DiagnosticCode.EXPECTED_NAME_AFTER_STRUCT,
        {},
        this.getCurrentRange(),
      );
      this.synchronizeTopLevel();
      return null;
    }

    if (!this.consume(Token.OpenBrace)) {
      this.reportSyntaxError(
        DiagnosticCode.MISSING_TOKEN,
        { token: "{" },
        this.getCurrentRange(),
      );
      this.synchronizeTopLevel();
      return null;
    }
    const fields: StructFieldDeclaration[] = [];

    if (!this.consume(Token.CloseBrace)) {
      while (!this.peek(Token.CloseBrace) && !this.peek(Token.EndOfFile)) {
        const field = this.parseStructFieldExpression();
        if (!field) {
          this.reportSyntaxError(
            DiagnosticCode.EXPECTED_TOKEN,
            { expected: "struct field", found: tokenToString(this.peekNextToken()) },
            this.getCurrentRange(),
          );
          this.synchronizeTo([Token.CloseBrace]);
          break;
        }
        fields.push(field);
      }
    }

    if (!this.consume(Token.CloseBrace)) {
      this.reportSyntaxError(
        DiagnosticCode.MISSING_TOKEN,
        { token: "}" },
        this.getCurrentRange(),
      );
      this.synchronizeTopLevel();
    }

    return new StructDeclaration(
      attributes,
      name!,
      fields,
      this.getRange(start, this.getCurrentRange()),
    );
  }

  private parseAttributes(): AttributeExpression[] {
    const attributes: AttributeExpression[] = [];
    while (true) {
      const attribute = this.tryParse(() => this.parseAttributeExpression());
      if (!attribute) break;
      attributes.push(attribute);
    }
    return attributes;
  }

  // --- simple primaries ---

  parseIdentifierExpression(): Identifier | null {
    const state = this.checkpoint();

    this.advance();
    if (!this.matches(Token.Identifier)) return this.restore(state), null;

    const text = this.tokenizer.readIdentifier();
    const range = this.getCurrentRange();

    return new Identifier(text, range);
  }

  parseNumberLiteral(): NumberLiteral | null {
    const state = this.checkpoint();
    this.advance();
    if (!this.matches(Token.NumberLiteral)) return this.restore(state), null;

    const text = this.tokenizer.readNumber();
    const range = this.getCurrentRange();

    return new NumberLiteral(text, null, range);
  }

  parseStringLiteral(): StringLiteral | null {
    const state = this.checkpoint();
    // first token not yet consumed
    this.advance();
    if (!this.matches(Token.StringLiteral)) return this.restore(state), null;

    const text = this.tokenizer.readString();
    const range = this.getCurrentRange();

    return new StringLiteral(text, range);
  }

  parseBooleanLiteral(): BooleanLiteral | null {
    const state = this.checkpoint();
    // first token not yet consumed
    this.advance();
    if (!this.matches(Token.True) && !this.matches(Token.False))
      return this.restore(state), null;

    const value = this.matches(Token.True);
    const range = this.getCurrentRange();

    return new BooleanLiteral(value, range);
  }
}
