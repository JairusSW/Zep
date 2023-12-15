import { Statement } from "../ast/nodes/Statement.js";
import { Identifier } from "../ast/nodes/Identifier.js";
import { Tokenizer } from "../tokenizer/tokenizer.js";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration.js";
import { StringLiteral } from "../ast/nodes/StringLiteral.js";
import { TypeExpression } from "../ast/nodes/TypeExpression.js";
import { Program } from "../ast/Program.js";
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration.js";
import { BlockExpression } from "../ast/nodes/BlockExpression.js";
import { ParameterExpression } from "../ast/nodes/ParameterExpression.js";
import { ReturnStatement } from "../ast/nodes/ReturnStatement.js";
import { Expression } from "../ast/nodes/Expression.js";
import { BinaryExpression, Operator } from "../ast/nodes/BinaryExpression.js";
import { Scope } from "../checker/scope/Scope.js";
import {
  isBuiltinType,
  isIdentifier,
  isNumeric,
  isString,
} from "../util/types/checkers.js";
import { NumberLiteral } from "../ast/nodes/NumberLiteral.js";
import { ImportFunctionDeclaration } from "../ast/nodes/ImportFunctionDeclaration.js";
import { ModifierExpression } from "../ast/nodes/ModifierExpression.js";
import { ReferenceExpression } from "../ast/nodes/ReferenceExpression.js";
import { ErrorTypes, TokenMismatchError } from "../error/error.js";
import { Range } from "../ast/Range.js";
import { Token } from "../tokenizer/token.js";
import { TokenData } from "../tokenizer/tokendata.js";
import { CallExpression } from "../ast/nodes/CallExpression.js";

export class Parser {
  public program: Program = new Program("test.zp");
  public pos: number = 0;
  public tokenizer: Tokenizer;
  constructor(
    tokenizer: Tokenizer,
    public fileName: string,
  ) {
    this.tokenizer = tokenizer;
  }
  parseStatement(): Statement | null {
    let node: Statement | null = null;
    if ((node = this.parseVariableDeclaration())) return node;
    this.tokenizer.resumeState();
    if ((node = this.parseFunctionDeclaration())) return node;
    this.tokenizer.resumeState();
    //if (node = this.parseReturnStatement()) return node;
    return node;
  }
  parseExpression(): Expression | null {
    let express: Expression | null = null;
    if ((express = this.parseNumberLiteral())) return express;
    this.tokenizer.resumeState();
    if ((express = this.parseStringLiteral())) return express;
    this.tokenizer.resumeState();
    if ((express = this.parseModifierExpression())) return express;
    this.tokenizer.resumeState();
    if ((express = this.parseBinaryExpression())) return express;
    this.tokenizer.resumeState();
    if ((express = this.parseIdentifierExpression())) return express;
    return express;
  }
  parseVariableDeclaration(): VariableDeclaration | null {
    this.tokenizer.pauseState();
    const type = this.tokenizer.getToken(); // TypeExpression
    if (!isBuiltinType(type)) return null;
    const mutableTok = this.tokenizer.getToken();
    let mutable = false;
    if (mutableTok.token === Token.Question) mutable = true;
    let name = mutable ? this.tokenizer.getToken() : mutableTok; // Identifier
    if (!isIdentifier(name)) {
      this.tokenizer.resumeState();
      return null;
    }
    this.tokenizer.getToken(); // =

    this.tokenizer.pauseState();
    const value = this.parseExpression(); // Expression
    if (!value) {
      const value = this.tokenizer.getToken();
      this.tokenizer.resumeState();
      new TokenMismatchError(
        "Expected to find value of variable, but found " +
        value.text +
        " instead!",
        0x80,
        value.range,
      );
      return null;
    }
    const node = new VariableDeclaration(
      value,
      new Identifier(name.text, name.range),
      new TypeExpression([type.text]),
      mutable,
    );

    this.program.statements.push(node);
    this.program.globalScope.add(name.text, node);
    return node;
  }
  parseModifierExpression(): ModifierExpression | null {
    this.tokenizer.pauseState();

    const hashToken = this.tokenizer.getToken();
    const openingBracketToken = this.tokenizer.getToken();
    const tagToken = this.tokenizer.getToken();
    const closingBracketToken = this.tokenizer.getToken();

    if (
      hashToken?.text !== "#" ||
      openingBracketToken?.text !== "[" ||
      (!isIdentifier(tagToken) && tagToken.text !== "extern") ||
      closingBracketToken?.text !== "]"
    )
      return null;

    this.tokenizer.pauseState();
    const colonToken = this.tokenizer.getToken();
    if (colonToken.token !== Token.Colon) {
      this.tokenizer.resumeState();
      const node = new ModifierExpression(
        new Identifier(tagToken.text, tagToken.range),
      );
      return node;
    }
    const contentFirstToken = this.tokenizer.getToken();
    if (contentFirstToken.token !== Token.Identifier) {
      new TokenMismatchError(
        "Expected to find content to modifier, but found none!",
        2,
        contentFirstToken.range,
      );
      return null;
    }
    const content: TokenData[] = [contentFirstToken];
    while (true) {
      const token = this.tokenizer.getToken();
      if (token.range.line < token.range.line || token.token === Token.EOF) {
        this.tokenizer.resumeState();
        break;
      }
      this.tokenizer.pauseState();
      content.push(token);
    }
    const contentId = new Identifier(
      content.map((v) => v.text).join(""),
      new Range(
        contentFirstToken.range.line,
        contentFirstToken.range.start,
        content[content.length - 1].range.end,
      ),
    );
    const node = new ModifierExpression(
      new Identifier(tagToken.text, tagToken.range),
      contentId,
    );
    return node;
  }

  parseFunctionDeclaration(
    scope: Scope = this.program.globalScope,
  ): FunctionDeclaration | null {
    this.tokenizer.pauseState();

    let token: TokenData | null = null;

    const fn = this.tokenizer.getToken();
    if (!isIdentifier(fn) || fn.text !== "fn") {
      return null;
    }

    const name = this.tokenizer.getToken();
    if (!isIdentifier(name)) {
      return null;
    }
    if (this.tokenizer.getToken().token !== Token.LeftParen) {
      this.tokenizer.resumeState();
      return null;
    }
    const params: ParameterExpression[] = [];
    while (true) {
      const param = this.parseParameterExpression();
      if (!param) {
        this.tokenizer.resumeState();
        return null;
      }
      params.push(param);
      const tok = this.tokenizer.getToken().token;
      if (tok === Token.RightParen) break;
      if (tok !== Token.Comma) break;
    }
    if (
      ((token = this.tokenizer.getToken()) && !isIdentifier(token)) ||
      token.text !== "->"
    ) {
      this.tokenizer.resumeState();
      return null;
    }
    const returnType = this.tokenizer.getToken();
    if (!isBuiltinType(returnType)) {
      this.tokenizer.resumeState();
      return null;
    }
    const block = this.parseBlockExpression();
    if (!block) {
      this.tokenizer.resumeState();
      return null;
    }
    const node = new FunctionDeclaration(
      new Identifier(name.text, name.range),
      params,
      new TypeExpression([returnType.text], false),
      block,
      new Scope(scope),
    );

    scope.add(name.text, node);

    return node;
  }
  parseImportFunctionDeclaration(
    scope: Scope = this.program.globalScope,
  ): ImportFunctionDeclaration | null {
    this.tokenizer.pauseState();

    const hashToken = this.tokenizer.getToken();
    const openingBracketToken = this.tokenizer.getToken();
    const tagToken = this.tokenizer.getToken();
    const closingBracketToken = this.tokenizer.getToken();

    if (
      hashToken?.text !== "#" ||
      openingBracketToken?.text !== "[" ||
      (!isIdentifier(tagToken) && tagToken.text !== "extern") ||
      closingBracketToken?.text !== "]"
    )
      return null;

    this.tokenizer.pauseState();
    const colonToken = this.tokenizer.getToken();
    if (colonToken.token !== Token.Colon) {
      this.tokenizer.resumeState();
      return null;
    }
    const contentFirstToken = this.tokenizer.getToken();
    if (contentFirstToken.token !== Token.Identifier) {
      new TokenMismatchError(
        "Expected to find content to modifier, but found none!",
        2,
        contentFirstToken.range,
      );
      return null;
    }
    const content: TokenData[] = [contentFirstToken];
    while (true) {
      const token = this.tokenizer.getToken();
      if (token.range.line < token.range.line) {
        this.tokenizer.resumeState();
        break;
      }
      this.tokenizer.pauseState();
      content.push(token);
    }
    const contentId = new Identifier(
      content.map((v) => v.text).join(""),
      new Range(
        contentFirstToken.range.line,
        contentFirstToken.range.start,
        content[content.length - 1].range.end,
      ),
    );

    const fn = this.tokenizer.getToken();
    if (!isIdentifier(fn) || fn.text !== "fn") {
      console.log(1);
      return null;
    }

    const name = this.tokenizer.getToken();
    if (!isIdentifier(name)) {
      return null;
    }
    if (this.tokenizer.getToken().token !== Token.LeftParen) {
      console.log(3);
      return null;
    }
    const params: ParameterExpression[] = [];
    while (true) {
      const param = this.parseParameterExpression();
      if (!param) {
        console.log(4);
        return null;
      }
      params.push(param);
      const tok = this.tokenizer.getToken().token;
      if (tok === Token.RightParen) break;
      if (tok !== Token.Comma) break;
    }
    let token: TokenData | null = null;
    if ((token = this.tokenizer.getToken()) && token.token !== Token.Sub) {
      console.log(5, token);
      return null;
    }
    if (
      (token = this.tokenizer.getToken()) &&
      token.token !== Token.GreaterThan
    ) {
      console.log(6);
      return null;
    }
    const returnType = this.tokenizer.getToken();
    if (!isBuiltinType(returnType)) {
      this.tokenizer.resumeState();
      console.log(7, returnType);
      return null;
    }

    const node = new ImportFunctionDeclaration(
      new Identifier("env", new Range(0, 0, 0)),
      new Identifier(name.text, name.range),
      params,
      new TypeExpression([returnType.text], false),
    );

    scope.add(name.text, node);

    return node;
  }
  parseCallExpression(
    scope: Scope = this.program.globalScope,
  ): CallExpression | null {
    this.tokenizer.pauseState();

    const calling = this.tokenizer.getToken();
    const leftParen = this.tokenizer.getToken();
    const args = this.tokenizer.getToken();
    const rightParen = this.tokenizer.getToken();

    if (!isIdentifier(calling)) {
      return null;
    }
    if (leftParen.token !== Token.LeftParen) return null;
    if (!args) return null;
    if (rightParen.token !== Token.RightParen) return null;

    const node = new CallExpression(
      new Identifier(calling.text, calling.range),
      [new ParameterExpression(new Identifier(args.text, args.range))],
    );

    this.program.statements.push(node);
    return node;
  }
  parseReturnStatement(
    scope: Scope = this.program.globalScope,
  ): ReturnStatement | null {
    this.tokenizer.pauseState();
    const rt = this.tokenizer.getToken();
    if (!isIdentifier(rt) || rt.text !== "rt") {
      this.tokenizer.resumeState();
      return null;
    }
    const express = this.parseBinaryExpression(scope);
    if (!express) {
      this.tokenizer.resumeState();
      return null;
    }
    const node = new ReturnStatement(express);
    return node;
  }
  parseParameterExpression(
    scope: Scope = this.program.globalScope,
  ): ParameterExpression | null {
    this.tokenizer.pauseState();
    const name = this.tokenizer.getToken();
    if (!isIdentifier(name) || this.tokenizer.getToken().text !== ":") {
      this.tokenizer.resumeState();
      return null;
    }
    const type = this.tokenizer.getToken();
    if (!isBuiltinType(type)) {
      this.tokenizer.resumeState();
      return null;
    }
    const node = new ParameterExpression(
      new Identifier(name.text, name.range),
      new TypeExpression([type.text], false),
    );

    scope.add(name.text, node);

    return node;
  }
  parseBlockExpression(): BlockExpression | null {
    this.tokenizer.pauseState();
    let token = this.tokenizer.getToken();
    if (token.token !== Token.LeftBracket) {
      this.tokenizer.resumeState();
      return null;
    }
    const stmts: Statement[] = [];
    while (true) {
      const stmt = this.parseReturnStatement();
      if (!stmt) break;
      stmts.push(stmt!);
    }
    if (this.tokenizer.getToken().token !== Token.RightBracket) {
      this.tokenizer.resumeState();
      return null;
    }
    const node = new BlockExpression(stmts);
    return node;
  }
  parseBinaryExpression(
    scope: Scope = this.program.globalScope,
  ): BinaryExpression | null {
    this.tokenizer.pauseState();
    let left: Expression | null = this.parseIdentifierExpression();
    const op = tokenToOp(this.tokenizer.getToken());
    let right: Expression | null = this.parseIdentifierExpression();

    if (op === null || !left || !right) {
      this.tokenizer.resumeState();
      return null;
    }
    if (left instanceof Identifier) {
      if (scope.has(left.data)) {
        left = new ReferenceExpression(left);
      } else {
        new TokenMismatchError(
          `Cannot find name ${left.data} in scope`,
          0x01,
          left.range,
        );
        this.tokenizer.resumeState();
        return new BinaryExpression(left, op, right);
      }
    }
    // Check scope
    return new BinaryExpression(left, op, right);
  }
  parseIdentifierExpression(): Identifier | null {
    this.tokenizer.pauseState();
    const id = this.tokenizer.getToken();
    if (!isIdentifier(id)) {
      this.tokenizer.resumeState();
      return null;
    }
    return new Identifier(id.text, id.range);
  }
  parseNumberLiteral(): NumberLiteral | null {
    this.tokenizer.pauseState();
    const num = this.tokenizer.getToken(); // 1234567890_.
    if (!isNumeric(num)) {
      this.tokenizer.resumeState();
      return null;
    }
    return new NumberLiteral(num.text);
  }
  parseStringLiteral(): StringLiteral | null {
    this.tokenizer.pauseState();
    const num = this.tokenizer.getToken(); // " ... "
    if (!isString(num)) {
      this.tokenizer.resumeState();
      return null;
    }
    return new StringLiteral(num.text);
  }
}

export function tokenToOp(tok: TokenData): Operator | null {
  if (tok.token === Token.Add) return Operator.Add;
  if (tok.token === Token.Sub) return Operator.Sub;
  return null;
}
