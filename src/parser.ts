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

type ParserState = {
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

  private getState(): ParserState {
    return {
      tokenizerState: this.tokenizer.createState(),
      current: this.current,
      rangesSize: this.ranges.size,
    };
  }

  private updateState(state: ParserState): ParserState {
    state.tokenizerState.wind();
    state.current = this.current;
    state.rangesSize = this.ranges.size;
    return state;
  }

  private applyState(state: ParserState): void {
    state.tokenizerState.unwind();
    this.current = state.current;
    while (this.ranges.size > state.rangesSize) {
      this.ranges.pop();
    }
  }

  private tryParse<T extends Node>(fn: () => T | null): T | null {
    const state = this.getState();
    const node = fn();
    if (!node) {
      this.applyState(state);
      return null;
    }
    return node;
  }

  private advance(): Token {
    this.current = this.tokenizer.next();
    return this.current;
  }

  private matches(token: Token): boolean {
    return this.current === token;
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
      const stmt = this.parseTopLevelStatement();
      if (!stmt) break;
      this.currentSource.statements.push(stmt);
    }
  }

  parseTopLevelStatement(): Statement | null {
    const startRange = this.getCurrentRange();
    const state = this.getState();
    this.ranges.push(startRange);

    let node: Statement | null = null;

    if ((node = this.parseFunctionDeclaration()))
      return this.ranges.pop(), node;
    this.applyState(state);

    if ((node = this.parseImportDeclaration())) return this.ranges.pop(), node;
    this.applyState(state);

    if ((node = this.parseVariableDeclaration()))
      return this.ranges.pop(), node;
    this.applyState(state);

    if ((node = this.parseStructDeclaration())) return this.ranges.pop(), node;
    this.applyState(state);

    if ((node = this.parseEnumDeclaration())) return this.ranges.pop(), node;
    this.applyState(state);

    this.ranges.pop();
    return null;
  }

  parseStatement(): Statement | null {
    const state = this.getState();
    const startRange = this.getCurrentRange();
    this.ranges.push(startRange);

    let node: Statement | null = null;

    if ((node = this.parseBlockStatement())) return this.ranges.pop(), node;
    this.applyState(state);

    if ((node = this.parseVariableDeclaration()))
      return this.ranges.pop(), node;
    this.applyState(state);

    if ((node = this.parseReturnStatement())) return this.ranges.pop(), node;
    this.applyState(state);

    if ((node = this.parseIfStatement())) return this.ranges.pop(), node;
    this.applyState(state);

    if ((node = this.parseBlockStatement())) return this.ranges.pop(), node;
    this.applyState(state);

    if ((node = this.parseWhileStatement())) return this.ranges.pop(), node;
    this.applyState(state);

    if ((node = this.parseExpressionStatement())) return this.ranges.pop(), node;
    this.applyState(state);

    this.ranges.pop();
    return null;
  }

  // --- expressions / precedence ---

  parseExpression(): Expression | null {
    const state = this.getState();
    const startRange = this.getCurrentRange();
    this.ranges.push(startRange);
    let expr: Expression | null;
    if ((expr = this.parseBinaryExpression(1))) return this.ranges.pop(), expr;
    this.applyState(state);
    // if (expr = this.parseBlockStatement()) return this.ranges.pop(), expr;
    // this.applyState(state);
    this.ranges.pop();
    return null;
  }

  private parsePrimaryExpression(): Expression | null {
    const state = this.getState();
    let expr: Expression | null = null;
    if ((expr = this.parseCallExpression())) return expr;
    this.applyState(state);
    if ((expr = this.parseIdentifierExpression())) return expr;
    this.applyState(state);
    if ((expr = this.parseParenthesizedExpression())) return expr;
    this.applyState(state);
    if ((expr = this.parsePropertyAccessExpression())) return expr;
    this.applyState(state);
    if ((expr = this.parseNumberLiteral())) return expr;
    this.applyState(state);
    if ((expr = this.parseStringLiteral())) return expr;
    this.applyState(state);
    if ((expr = this.parseBooleanLiteral())) return expr;
    this.applyState(state);
    return null;
  }

  private parseBinaryExpression(minPrec: number = 1): Expression | null {
    let state = this.getState();
    const left = this.parsePrimaryExpression();
    if (!left) {
      this.applyState(state);
      return null;
    }

    state = this.getState();
    while (true) {
      const opToken = this.advance();
      const op = tokenToOp(opToken);
      if (op === null) break;

      const prec = opPrecedence(op);
      if (prec < minPrec) break;

      const nextMin = isRightAssociative(op) ? prec : prec + 1;
      const right = this.parseBinaryExpression(nextMin);
      if (!right) {
        this.error(
          DiagnosticCode.EXPECTED_EXPRESSION_AFTER_OPERATOR,
          { operator: tokenToString(opToken) },
          this.getCurrentRange(),
        );
      }

      const result = new BinaryExpression(
        left,
        op,
        right,
        this.getRange(left.range, right.range),
      );
      return result;
    }

    this.applyState(state);
    return left;
  }

  parsePropertyAccessExpression(): PropertyAccessExpression | null {
    const state = this.getState();

    // first token not yet consumed for this primary
    this.advance();
    const base = this.parseIdentifierExpression();
    if (!base || !this.matches(Token.Dot)) {
      this.applyState(state);
      return null;
    }

    this.advance(); // '.'

    const property = this.parseIdentifierExpression();
    if (!property) {
      this.applyState(state);
      return null;
    }

    return new PropertyAccessExpression(
      base,
      property,
      Range.from(base.range, property.range),
    );
  }

  parseCallExpression(): CallExpression | null {
    const state = this.getState();
    const start = this.getCurrentRange();

    // first token not yet consumed
    const callee =
      this.parseIdentifierExpression() || this.parsePropertyAccessExpression();
    // Should be this.parseExpression() - CallExpression

    this.advance(); // (
    if (!callee || !this.matches(Token.OpenParen)) {
      this.applyState(state);
      return null;
    }

    const args: Expression[] = [];

    while (true) {
      const arg = this.parseExpression();
      if (!arg) break;
      args.push(arg);
      this.advance(); // , or )
      if (this.matches(Token.Comma)) continue;
      if (this.matches(Token.CloseParen)) break;
      else
        this.error(
          DiagnosticCode.UNTERMINATED_GROUP,
          { kind: ")" },
          this.getCurrentRange(),
        );
    }

    return new CallExpression(
      callee,
      args,
      this.getRange(start, this.getCurrentRange()),
    );
  }

  parseParenthesizedExpression(): ParenthesizedExpression | null {
    const state = this.getState();
    const start = this.getCurrentRange();

    // first token not yet consumed
    this.advance(); // (
    if (!this.matches(Token.OpenParen)) {
      this.applyState(state);
      return null;
    }

    const expr = this.parseExpression();
    if (!expr) {
      this.applyState(state);
      return null;
    }

    this.advance(); // )
    if (!this.matches(Token.CloseParen)) {
      this.error(
        DiagnosticCode.UNTERMINATED_GROUP,
        { kind: ")" },
        this.getCurrentRange(),
      );
    }

    return new ParenthesizedExpression(expr, this.getRange(start, expr.range));
  }

  parseExpressionStatement(): ExpressionStatement | null {
    const state = this.getState();

    const expr = this.parseExpression();
    if (!expr) {
      this.applyState(state);
      return null;
    }
    return new ExpressionStatement(expr);
  }

  // --- type syntax ---

  parseTypeExpression(): TypeExpression | null {
    let state = this.getState();
    const start = this.getCurrentRange();

    // first token not yet consumed
    this.advance(); // type
    if (!this.matches(Token.Identifier)) return this.applyState(state), null;

    const types: string[] = [];
    types.push(this.tokenizer.readIdentifier());

    state = this.getState();
    this.advance(); // |

    let union = false;

    if (this.matches(Token.Bar)) {
      union = true;

      do {
        this.advance(); // type
        if (!this.matches(Token.Identifier)) {
          this.error(
            DiagnosticCode.EXPECTED_TYPE_AFTER_BAR_IN_UNION,
            {},
            this.getCurrentRange(),
          );
        }

        types.push(this.tokenizer.readIdentifier());

        this.updateState(state);
        this.advance(); // |
      } while (this.matches(Token.Bar));
      this.applyState(state);
    } else {
      this.applyState(state);
    }

    return new TypeExpression(
      types,
      union,
      this.getRange(start, this.getCurrentRange()),
    );
  }

  // --- variable declarations ---

  parseVariableDeclaration(): VariableDeclaration | null {
    const state = this.getState();
    const start = this.getCurrentRange();

    // first token not yet consumed
    this.advance(); // let or mut

    let mutable: boolean;
    if (this.matches(Token.Let)) {
      mutable = false;
    } else if (this.matches(Token.Mut)) {
      mutable = true;
    } else {
      this.applyState(state);
      return null;
    }

    const name = this.parseIdentifierExpression(); // name

    if (!name) {
      this.error(
        DiagnosticCode.MISSING_LITERAL,
        {},
        this.getCurrentRange()
      );
    }

    this.advance(); // : or =

    let type: TypeExpression | null = null;
    let value: Expression | null = null;

    if (this.matches(Token.Colon)) {
      type = this.parseTypeExpression();
      if (!type) {
        this.error(
          DiagnosticCode.EXPECTED_TYPE_AFTER_COLON,
          {},
          this.getCurrentRange(),
        );
      }
      this.advance(); // =
      if (this.matches(Token.Eq)) {
        value = this.parseExpression();
        if (!value) {
          this.applyState(state);
          return null;
        }
      }
    } else if (this.matches(Token.Eq)) {
      value = this.parseExpression();
      if (!value) {
        this.applyState(state);
        return null;
      }
    } else {
      this.error(
        DiagnosticCode.EXPECTED_EQUALS_OR_COLON_AFTER_VARIABLE_NAME,
        {},
        this.getCurrentRange(),
      );
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
    const state = this.getState();
    const start = this.getCurrentRange();

    const name = this.parseIdentifierExpression();
    if (!name) return null;

    this.advance(); // :
    if (!this.matches(Token.Colon)) {
      this.error(
        DiagnosticCode.MISSING_TOKEN,
        { token: ":" },
        this.getCurrentRange(),
      );
    }

    const type = this.parseTypeExpression();
    if (!type) {
      this.applyState(state);
      return null;
    }

    return new ParameterExpression(
      name,
      type,
      this.getRange(start, type.range),
    );
  }

  parseFunctionDeclaration(): FunctionDeclaration | null {
    const state = this.getState();
    const start = this.getCurrentRange();

    const attributes: AttributeExpression[] = [];
    while (true) {
      const attribute = this.tryParse(() => this.parseAttributeExpression());
      if (!attribute) break;
      attributes.push(attribute);
    }

    let exported = attributes.some((v) => v.tag.data === "export");

    this.advance(); // fn
    if (!this.matches(Token.Fn)) {
      this.applyState(state);
      return null;
    }

    const name = this.parseIdentifierExpression(); // name
    if (!name) {
      this.error(
        DiagnosticCode.EXPECTED_NAME_AFTER_FUNCTION,
        {},
        this.getCurrentRange(),
      );
    }

    this.advance(); // (

    if (!this.matches(Token.OpenParen)) {
      this.error(
        DiagnosticCode.EXPECTED_PARAMETER_LIST,
        {},
        this.getCurrentRange(),
      );
    }

    const params: ParameterExpression[] = [];
    while (true) {
      const param = this.parseParameterExpression();
      if (!param) break;
      params.push(param);
      this.advance(); // , or )
      if (this.matches(Token.Comma)) continue;
      if (this.matches(Token.CloseParen)) break;
      else
        this.error(
          DiagnosticCode.MISSING_TOKEN,
          { token: ")" },
          this.getCurrentRange(),
        );
    }
    this.advance();

    let returnType: TypeExpression | null = null;
    if (this.matches(Token.Colon)) {
      returnType = this.parseTypeExpression();
      if (!returnType) {
        this.error(
          DiagnosticCode.EXPECTED_TYPE_AFTER_COLON,
          {},
          this.getCurrentRange(),
        );
      }
    }

    const block = this.parseStatement();
    if (!block) {
      this.applyState(state);
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
    const state = this.getState();
    const start = this.getCurrentRange();

    const attributes: AttributeExpression[] = [];
    while (true) {
      const attribute = this.tryParse(() => this.parseAttributeExpression());
      if (!attribute) break;
      attributes.push(attribute);
    }

    let exported = attributes.some((v) => v.tag.data === "export");

    // first token not yet consumed
    this.advance();
    if (!this.matches(Token.Enum)) {
      this.applyState(state);
      return null;
    }
    this.advance(); // 'enum'

    const name = this.parseIdentifierExpression();
    if (!name) {
      this.error(
        DiagnosticCode.EXPECTED_NAME_AFTER_ENUM,
        {},
        this.getCurrentRange(),
      );
    }

    if (!this.matches(Token.OpenBrace)) {
      this.error(
        DiagnosticCode.MISSING_TOKEN,
        { token: "{" },
        this.getCurrentRange(),
      );
    }
    this.advance(); // '{'

    const elements: EnumFieldDeclaration[] = [];
    let index = 0;

    while (
      !this.matches(Token.CloseBrace) &&
      this.current !== Token.EndOfFile
    ) {
      const fieldAttributes: AttributeExpression[] = [];
      while (true) {
        const attribute = this.tryParse(() => this.parseAttributeExpression());
        if (!attribute) break;
        fieldAttributes.push(attribute);
      }

      const elementName = this.parseIdentifierExpression();
      if (!elementName) break;

      let elementValue: NumberLiteral | StringLiteral | null = null;

      if (this.matches(Token.Eq)) {
        this.advance(); // '='
        elementValue = this.parseNumberLiteral() || this.parseStringLiteral();
        if (!elementValue) {
          this.error(
            DiagnosticCode.EXPECTED_VALUE_AFTER_EQUALS,
            {},
            this.getCurrentRange(),
          );
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

      if (!this.matches(Token.Comma)) break;
      this.advance(); // ','
    }

    if (!this.matches(Token.CloseBrace)) {
      this.error(
        DiagnosticCode.MISSING_TOKEN,
        { token: "}" },
        this.getCurrentRange(),
      );
    }
    this.advance(); // '}'

    return new EnumDeclaration(
      attributes,
      name,
      elements,
      this.getRange(start, this.getCurrentRange()),
    );
  }

  // --- if / while / blocks ---

  parseIfStatement(parent: IfStatement | null = null): IfStatement | null {
    const state = this.getState();
    const start = this.getCurrentRange();

    // first token not yet consumed for this statement
    this.advance(); // if, else

    let kind: IfStatementKind;

    if (!parent) {
      if (!this.matches(Token.If)) {
        this.applyState(state);
        return null;
      }
      kind = IfStatementKind.If;
    } else {
      if (!this.matches(Token.Else)) {
        this.applyState(state);
        return null;
      }

      if (this.matches(Token.If)) {
        this.advance(); // 'if'
        kind = IfStatementKind.ElseIf;
      } else {
        kind = IfStatementKind.Else;
      }
    }

    let condition: Expression | null = null;
    if (kind !== IfStatementKind.Else) {
      condition = this.parseExpression();
      if (!condition) {
        this.applyState(state);
        return null;
      }
    }

    const ifTrue = this.parseBlockStatement();
    if (!ifTrue) {
      this.applyState(state);
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
    const state = this.getState();
    const start = this.getCurrentRange();

    // first token not yet consumed
    this.advance();
    if (!this.matches(Token.While)) {
      this.applyState(state);
      return null;
    }
    this.advance(); // 'while'

    const condition = this.parseExpression();
    if (!condition) {
      this.applyState(state);
      return null;
    }

    const body = this.parseStatement();
    if (!body) {
      this.applyState(state);
      return null;
    }

    return new WhileStatement(
      condition,
      body,
      this.getRange(start, body.range),
    );
  }

  parseBlockStatement(): BlockStatement | null {
    const state = this.getState();
    const start = this.getCurrentRange();

    this.advance(); // {
    if (!this.matches(Token.OpenBrace)) {
      this.applyState(state);
      return null;
    }

    const state2 = this.getState();
    if (this.advance() === Token.CloseBrace) {
      return new BlockStatement(
        [],
        this.getRange()
      )
    } else {
      this.applyState(state2);
    }

    const stmts: Statement[] = [];

    while (
      !this.matches(Token.CloseBrace) &&
      this.current !== Token.EndOfFile
    ) {
      const stmt = this.parseStatement();
      if (!stmt) break;
      stmts.push(stmt);
    }

    this.advance(); // }
    if (!this.matches(Token.CloseBrace)) {
      this.error(
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
    const state = this.getState();
    const start = this.getCurrentRange();

    // first token not yet consumed
    this.advance(); // #
    if (!this.matches(Token.Hash)) {
      this.applyState(state);
      return null;
    }
    this.advance(); // [

    if (!this.matches(Token.OpenBracket)) {
      this.applyState(state);
      return null;
    }

    // attribute name: export / extern / inline / ...
    const tag = this.parseIdentifierExpression();
    console.log("tag", tag);
    if (!tag) {
      this.error(
        DiagnosticCode.EXPECTED_TAG_IN_MODIFIER,
        {},
        this.getCurrentRange(),
      );
    }

    const args: Record<string, string> = {};

    this.advance(); // ( or ]
    // Optional arguments:
    // 1 - #[export]
    // 2 - #[export(alias = "name")]
    // 3 - #[extern("env.log")]
    if (this.matches(Token.OpenParen)) {
      this.advance(); // case 3
      if (this.matches(Token.StringLiteral)) {
        // extern("env.log") => { value: "env.log" }
        const lit = this.parseStringLiteral();
        if (!lit) {
          this.error(
            DiagnosticCode.EXPECTED_VALUE_AFTER_EQUALS,
            {},
            this.getCurrentRange(),
          );
        }
        args["value"] = lit!.data;
      } else if (this.matches(Token.Identifier)) {
        // key = "value", [ , key = "value", ... ]
        while (true) {
          const keyIdent = new Identifier(
            this.tokenizer.readIdentifier(),
            this.getCurrentRange(),
          );
          if (!keyIdent) {
            this.error(
              DiagnosticCode.EXPECTED_TOKEN,
              { expected: "identifier", found: tokenToString(this.current) },
              this.getCurrentRange(),
            );
          }

          this.advance(); // =
          if (!this.matches(Token.Eq)) {
            this.error(
              DiagnosticCode.EXPECTED_TOKEN,
              { expected: "=", found: tokenToString(this.current) },
              this.getCurrentRange(),
            );
          }

          const valueLit = this.parseStringLiteral();
          if (!valueLit) {
            this.error(
              DiagnosticCode.EXPECTED_VALUE_AFTER_EQUALS,
              {},
              this.getCurrentRange(),
            );
          }

          args[keyIdent.data] = valueLit!.data;

          this.advance(); // ,
          if (!this.matches(Token.Comma)) break;
        }
      }

      if (!this.matches(Token.CloseParen)) {
        this.error(
          DiagnosticCode.UNTERMINATED_GROUP,
          { kind: ")" },
          this.getCurrentRange(),
        );
      }
      this.advance(); // ')'
    }

    if (!this.matches(Token.CloseBracket)) {
      this.error(
        DiagnosticCode.MISSING_TOKEN,
        { token: "]" },
        this.getCurrentRange(),
      );
    }

    return new AttributeExpression(
      tag,
      args,
      this.getRange(start, this.getCurrentRange()),
    );
  }

  parseImportDeclaration(): ImportDeclaration | null {
    const state = this.getState();
    const start = this.getCurrentRange();

    this.advance();
    if (!this.matches(Token.Import)) {
      this.applyState(state);
      return null;
    }

    const path = this.parseStringLiteral();
    if (!path) {
      this.applyState(state);
      return null;
    }

    return new ImportDeclaration(path, this.getRange(start, path.range));
  }

  parseReturnStatement(): ReturnStatement | null {
    const state = this.getState();
    const start = this.getCurrentRange();

    this.advance(); // return
    if (!this.matches(Token.Return)) {
      this.applyState(state);
      return null;
    }
    const expr = this.parseExpression();
    if (!expr) {
      this.error(
        DiagnosticCode.EXPECTED_EXPRESSION_AFTER_RETURN,
        {},
        this.getCurrentRange(),
      );
    }

    return new ReturnStatement(expr!, this.getRange(start, expr!.range));
  }

  // --- struct fields ---

  parseStructFieldExpression(): StructFieldDeclaration | null {
    const state = this.getState();
    const start = this.getCurrentRange();

    const attributes: AttributeExpression[] = [];
    while (true) {
      const attribute = this.tryParse(() => this.parseAttributeExpression());
      if (!attribute) break;
      attributes.push(attribute);
    }

    // first token not yet consumed
    this.advance();

    let access: FieldAccessKind = FieldAccessKind.Public;

    if (this.matches(Token.Identifier)) {
      const identState = this.getState();
      const text = this.tokenizer.readIdentifier();
      this.advance();

      if (text === "public" || text === "private" || text === "final") {
        switch (text) {
          case "public":
            access = FieldAccessKind.Public;
            break;
          case "private":
            access = FieldAccessKind.Private;
            break;
          case "final":
            access = FieldAccessKind.Final;
            break;
        }
      } else {
        this.applyState(identState);
      }
    }

    if (!this.matches(Token.Identifier)) {
      this.applyState(state);
      return null;
    }
    const typeName = this.tokenizer.readIdentifier();
    const typeRange = this.getCurrentRange();
    this.advance();
    const type = new TypeExpression([typeName], false, typeRange);

    if (!this.matches(Token.Identifier)) {
      this.applyState(state);
      return null;
    }
    const nameText = this.tokenizer.readIdentifier();
    const nameRange = this.getCurrentRange();
    this.advance();
    const name = new Identifier(nameText, nameRange);

    let value: Expression | null = null;
    const afterNameState = this.getState();
    if (this.matches(Token.Eq)) {
      this.advance();
      value = this.parseExpression();
      if (!value) this.applyState(afterNameState);
    } else {
      this.applyState(afterNameState);
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
    const state = this.getState();
    const start = this.getCurrentRange();

    const attributes: AttributeExpression[] = [];
    while (true) {
      const attribute = this.tryParse(() => this.parseAttributeExpression());
      if (!attribute) break;
      attributes.push(attribute);
    }

    // first token not yet consumed
    this.advance();
    if (!this.matches(Token.Struct)) {
      this.applyState(state);
      return null;
    }
    this.advance(); // 'struct'

    const name = this.parseIdentifierExpression();
    if (!name) {
      this.error(
        DiagnosticCode.EXPECTED_NAME_AFTER_STRUCT,
        {},
        this.getCurrentRange(),
      );
    }

    if (!this.matches(Token.OpenBrace)) {
      this.error(
        DiagnosticCode.MISSING_TOKEN,
        { token: "{" },
        this.getCurrentRange(),
      );
    }
    this.advance(); // '{'

    const fields: StructFieldDeclaration[] = [];

    while (
      !this.matches(Token.CloseBrace) &&
      this.current !== Token.EndOfFile
    ) {
      const field = this.parseStructFieldExpression();
      if (!field) break;
      fields.push(field);
    }

    if (!this.matches(Token.CloseBrace)) {
      this.error(
        DiagnosticCode.MISSING_TOKEN,
        { token: "}" },
        this.getCurrentRange(),
      );
    }
    this.advance(); // '}'

    return new StructDeclaration(
      attributes,
      name!,
      fields,
      this.getRange(start, this.getCurrentRange()),
    );
  }

  // --- simple primaries ---

  parseIdentifierExpression(): Identifier | null {
    const state = this.getState();

    this.advance();
    if (!this.matches(Token.Identifier)) return this.applyState(state), null;

    const text = this.tokenizer.readIdentifier();
    const range = this.getCurrentRange();

    return new Identifier(text, range);
  }

  parseNumberLiteral(): NumberLiteral | null {
    const state = this.getState();
    this.advance();
    if (!this.matches(Token.NumberLiteral)) return this.applyState(state), null;

    const text = this.tokenizer.readNumber();
    const range = this.getCurrentRange();

    return new NumberLiteral(text, null, range);
  }

  parseStringLiteral(): StringLiteral | null {
    const state = this.getState();
    // first token not yet consumed
    this.advance();
    if (!this.matches(Token.StringLiteral)) return this.applyState(state), null;

    const text = this.tokenizer.readString();
    const range = this.getCurrentRange();

    return new StringLiteral(text, range);
  }

  parseBooleanLiteral(): BooleanLiteral | null {
    const state = this.getState();
    // first token not yet consumed
    this.advance();
    if (!this.matches(Token.True) && !this.matches(Token.False))
      return this.applyState(state), null;

    const value = this.matches(Token.True);
    const range = this.getCurrentRange();

    return new BooleanLiteral(value, range);
  }
}
