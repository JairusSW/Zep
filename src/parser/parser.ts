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
  parseStatement(scope: Scope = this.program.globalScope): Statement | null {
    let node: Statement | null = null;
    if ((node = this.parseVariableDeclaration(scope))) return node;
    this.tokenizer.resumeState();
    if ((node = this.parseFunctionDeclaration(scope))) return node;
    this.tokenizer.resumeState();
    if ((node = this.parseReturnStatement())) return node;
    this.tokenizer.resumeState();
    return null;
  }
  parseExpression(scope: Scope = this.program.globalScope): Expression | null {
    let express: Expression | null = null;
    if ((express = this.parseNumberLiteral(scope))) return express;
    this.tokenizer.resumeState();
    if ((express = this.parseStringLiteral(scope))) return express;
    this.tokenizer.resumeState();
    if ((express = this.parseBinaryExpression(scope))) return express;
    this.tokenizer.resumeState();
    if ((express = this.parseReferenceExpression(scope))) return express;
    this.tokenizer.resumeState();
    if ((express = this.parseModifierExpression(scope))) return express;
    this.tokenizer.resumeState();
    if ((express = this.parseIdentifierExpression(scope))) return express;
    this.tokenizer.resumeState();
    return null;
  }
  parseVariableDeclaration(
    scope: Scope = this.program.globalScope,
  ): VariableDeclaration | null {
    this.tokenizer.pauseState();
    const type = this.tokenizer.getToken(); // TypeExpression
    if (!isBuiltinType(type)) return null;
    const mutableTok = this.tokenizer.getToken();
    let mutable = false;
    if (mutableTok.token === Token.Question) mutable = true;
    let name = mutable ? this.tokenizer.getToken() : mutableTok; // Identifier
    if (!isIdentifier(name)) return null;
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
  parseModifierExpression(
    scope: Scope = this.program.globalScope,
  ): ModifierExpression | null {
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
      if (
        contentFirstToken.range.line < token.range.line ||
        token.token === Token.EOF
      ) {
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

    let exported = true;

    const exp = this.tokenizer.getToken();
    if (!isIdentifier(exp)) return null;
    if (exp.text !== "export") exported = false;
    const fn = exported ? this.tokenizer.getToken() : exp;
    if (!isIdentifier(fn) || fn.text !== "fn") return null;

    const name = this.tokenizer.getToken();
    if (!isIdentifier(name)) return null;
    if (this.tokenizer.getToken().token !== Token.LeftParen) return null;

    const params: ParameterExpression[] = [];
    const blockScope = new Scope(scope);
    while (true) {
      const param = this.parseParameterExpression(blockScope);
      if (!param) return null;
      params.push(param);
      const tok = this.tokenizer.getToken().token;
      if (tok === Token.RightParen) break;
      if (tok !== Token.Comma) break;
    }
    if (this.tokenizer.getToken().token !== Token.Sub) return null;
    if (this.tokenizer.getToken().token !== Token.GreaterThan) return null;
    const returnType = this.tokenizer.getToken();
    if (!isBuiltinType(returnType)) return null;
    const block = this.parseBlockExpression(blockScope);
    if (!block) return null;

    const node = new FunctionDeclaration(
      new Identifier(name.text, name.range),
      params,
      new TypeExpression([returnType.text], false),
      block,
      new Scope(scope),
      exported
    );

    if (exported && scope.parentScope) throw new Error("Exported functions must occur at the global scope!");
    this.program.globalScope.add(name.text, node);
    this.program.topLevelStatements.push(node);
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
      new TokenMismatchError(
        "Expected to find path to host function import, but found nothing!",
        3,
        colonToken.range,
      );
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
      if (
        contentFirstToken.range.line !== token.range.line ||
        token.token === Token.EOF
      ) {
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

    this.tokenizer.pauseState();
    const fn = this.tokenizer.getToken();
    if (!isIdentifier(fn) || fn.text !== "fn") return null;

    const name = this.tokenizer.getToken();

    if (!isIdentifier(name)) return null;
    if (this.tokenizer.getToken().token !== Token.LeftParen) return null;
    const params: ParameterExpression[] = [];

    const blockScope = new Scope();
    // Scope will be thrown away

    while (true) {
      const param = this.parseParameterExpression(blockScope);
      if (!param) return null;
      params.push(param);

      const tok = this.tokenizer.getToken().token;

      if (tok === Token.RightParen) break;
      if (tok !== Token.Comma) break;
    }
    if (this.tokenizer.getToken().token !== Token.Sub) return null;
    if (this.tokenizer.getToken().token !== Token.GreaterThan) return null;

    const returnType = this.tokenizer.getToken();

    if (!isBuiltinType(returnType)) return null;

    const node = new ImportFunctionDeclaration(
      contentId,
      new Identifier(name.text, name.range),
      params,
      new TypeExpression([returnType.text], false),
    );

    scope.add(name.text, node);
    if (scope.parentScope) throw new Error("Expected to find import function at top level, but found it elsewhere!");
    this.program.topLevelStatements.push(node);

    return node;
  }
  parseCallExpression(
    scope: Scope = this.program.globalScope,
  ): CallExpression | null {
    this.tokenizer.pauseState();

    const calling = this.tokenizer.getToken();
    const leftParen = this.tokenizer.getToken();
    const args: Expression[] = [];

    while (true) {
      const arg = this.parseExpression(scope);

      if (!arg) {
        console.log(1);
        return null;
      }
      args.push(arg);

      const tok = this.tokenizer.getToken();

      if (tok.token === Token.RightParen) break;
      if (tok.token !== Token.Comma) return null;
    }

    if (!isIdentifier(calling)) return null;

    if (leftParen.token !== Token.LeftParen) return null;

    const node = new CallExpression(
      new Identifier(calling.text, calling.range),
      args,
    );

    this.program.statements.push(node);
    return node;
  }
  parseReferenceExpression(
    scope: Scope = this.program.globalScope,
  ): ReferenceExpression | null {
    this.tokenizer.pauseState();
    const id = this.tokenizer.getToken();
    if (!isIdentifier(id)) return null;
    if (!scope.has(id.text)) return null;
    return new ReferenceExpression(scope.get(id.text)! as Statement);
  }
  parseReturnStatement(
    scope: Scope = this.program.globalScope,
  ): ReturnStatement | null {
    this.tokenizer.pauseState();
    const rt = this.tokenizer.getToken();
    if (!isIdentifier(rt) || rt.text !== "rt") return null;
    const express = this.parseExpression(scope);
    if (!express) return null;
    const node = new ReturnStatement(express);
    return node;
  }
  parseParameterExpression(
    scope: Scope = this.program.globalScope,
  ): ParameterExpression | null {
    this.tokenizer.pauseState();
    const name = this.tokenizer.getToken();
    if (!isIdentifier(name) || this.tokenizer.getToken().text !== ":")
      return null;
    const type = this.tokenizer.getToken();
    if (!isBuiltinType(type)) return null;
    const node = new ParameterExpression(
      new Identifier(name.text, name.range),
      new TypeExpression([type.text], false),
    );
    scope.add(name.text, node);
    return node;
  }
  parseBlockExpression(
    scope: Scope = this.program.globalScope,
  ): BlockExpression | null {
    this.tokenizer.pauseState();
    let token = this.tokenizer.getToken();
    if (token.token !== Token.LeftBracket) return null;
    const stmts: Statement[] = [];
    while (true) {
      const stmt = this.parseReturnStatement(scope);
      if (!stmt) {
        this.tokenizer.resumeState();
        break;
      }
      stmts.push(stmt!);
    }
    if (this.tokenizer.getToken().token !== Token.RightBracket) return null;
    const node = new BlockExpression(stmts);
    return node;
  }
  parseBinaryExpression(
    scope: Scope = this.program.globalScope,
  ): BinaryExpression | null {
    this.tokenizer.pauseState();
    let left: Expression | null = this.parseReferenceExpression(scope);
    const op = tokenToOp(this.tokenizer.getToken());
    let right: Expression | null = this.parseReferenceExpression(scope);

    if (op === null || !left || !right) return null;
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
        const node = new BinaryExpression(left, op, right);
        this.program.statements.push(node);
        return node;
      }
    }
    const node = new BinaryExpression(left, op, right);
    this.program.statements.push(node);
    // Check scope
    return node;
  }
  parseIdentifierExpression(
    scope: Scope = this.program.globalScope,
  ): Identifier | null {
    this.tokenizer.pauseState();
    const id = this.tokenizer.getToken();
    if (!isIdentifier(id)) return null;
    return new Identifier(id.text, id.range);
  }
  parseNumberLiteral(
    scope: Scope = this.program.globalScope,
  ): NumberLiteral | null {
    this.tokenizer.pauseState();
    const num = this.tokenizer.getToken(); // 1234567890_.
    if (!isNumeric(num)) return null;
    return new NumberLiteral(num.text);
  }
  parseStringLiteral(
    scope: Scope = this.program.globalScope,
  ): StringLiteral | null {
    this.tokenizer.pauseState();
    const num = this.tokenizer.getToken(); // " ... "
    if (!isString(num)) return null;
    return new StringLiteral(num.text);
  }
}

export function tokenToOp(tok: TokenData): Operator | null {
  if (tok.token === Token.Add) return Operator.Add;
  if (tok.token === Token.Sub) return Operator.Sub;
  if (tok.token === Token.Equals) return Operator.Assign;
  return null;
}
