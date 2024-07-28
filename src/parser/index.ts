import { Statement } from "../ast/nodes/Statement.js";
import { Identifier } from "../ast/nodes/Identifier.js";
import { Tokenizer } from "../tokenizer/index.js";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration.js";
import { StringLiteral } from "../ast/nodes/StringLiteral.js";
import { TypeExpression } from "../ast/nodes/TypeExpression.js";
import { Program } from "../ast/Program.js";
import { FunctionDeclaration } from "../ast/nodes/Function.js";
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
import { FunctionImport } from "../ast/nodes/FunctionImport.js";
import { ModifierExpression } from "../ast/nodes/ModifierExpression.js";
import { ReferenceExpression } from "../ast/nodes/ReferenceExpression.js";
import { CompileTimeError, ErrorTypes, SyntaxError, TokenMismatchError } from "../error/error.js";
import { Range } from "../ast/Range.js";
import { Token } from "../tokenizer/token.js";
import { TokenData } from "../tokenizer/tokendata.js";
import { CallExpression } from "../ast/nodes/CallExpression.js";
import { IfStatement } from "../ast/nodes/IfStatement.js";
import { BooleanLiteral } from "../ast/nodes/BooleanLiteral.js";
import { Node } from "../ast/nodes/Node.js";
import { BranchStatement } from "../ast/nodes/BranchStatement.js";
import { BranchToStatement } from "../ast/nodes/BranchToStatement.js";
import { EnumDeclaration } from "../ast/nodes/EnumDeclaration.js";
import { EnumElement } from "../ast/nodes/EnumElement.js";
import { ParenthesizedExpression } from "../ast/nodes/PathenthesizedExpression.js";

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
  parseProgram(): Program {
    while (this.parseTopLevelStatement(this.program.globalScope)) { }
    return this.program;
  }
  parseTopLevelStatement(scope: Scope): Statement | null {
    let node: Statement | null = null;
    const state = this.tokenizer.createState();
    if ((node = this.parseFunctionDeclaration(scope))) return node;
    state.resume();
    if ((node = this.parseFunctionImport(scope))) return node;
    state.resume();
    if ((node = this.parseVariableDeclaration(scope))) return node;
    state.resume();
    if ((node = this.parseEnumDeclaration(scope))) return node;
    state.resume();
    return null;
  }
  parseStatement(scope: Scope): Statement | null {
    let node: Statement | null = null;
    const state = this.tokenizer.createState();
    if ((node = this.parseVariableDeclaration(scope))) return node;
    state.resume();
    if ((node = this.parseReturnStatement(scope))) return node;
    state.resume();
    if ((node = this.parseIfStatement(scope))) return node;
    state.resume();
    if ((node = this.parseCallExpression(scope))) return node;
    state.resume();
    if ((node = this.parseBranchStatement(scope))) return node;
    state.resume();
    return null;
  }
  parseExpression(scope: Scope, besides: string | null = null): Expression | null {
    let express: Expression | null = null;
    const state = this.tokenizer.createState();
    if (besides !== "NumberLiteral" && (express = this.parseNumberLiteral(scope))) return express;
    state.resume();
    if (besides !== "StringLiteral" && (express = this.parseStringLiteral(scope))) return express;
    state.resume();
    if (besides !== "BooleanLiteral" && (express = this.parseBooleanLiteral(scope))) return express;
    state.resume();
    if (besides !== "BinaryExpression" && (express = this.parseBinaryExpression(scope))) return express;
    state.resume();
    if (besides !== "ReferenceExpression" && (express = this.parseReferenceExpression(scope))) return express;
    state.resume();
    if (besides !== "ModifierExpression" && (express = this.parseModifierExpression(scope))) return express;
    state.resume();
    if (besides !== "IdentifierExpression" && (express = this.parseIdentifierExpression(scope))) return express;
    state.resume();
    if (besides !== "ParameterExpression" && (express = this.parseParameterExpression(scope))) return express;
    state.resume();
    return null;
  }
  parseNode(scope: Scope): Node | null {
    const state = this.tokenizer.createState();
    let node: Node | null = null;
    if ((node = this.parseBranchStatement(scope))) return node;
    state.resume();
    if ((node = this.parseBranchToStatement(scope))) return node;
    state.resume();
    if ((node = this.parseIfStatement(scope))) return node;
    state.resume();
    if ((node = this.parseCallExpression(scope))) return node;
    state.resume();
    if ((node = this.parseReturnStatement(scope))) return node;
    state.resume();
    if ((node = this.parseNumberLiteral(scope))) return node;
    state.resume();
    if ((node = this.parseStringLiteral(scope))) return node;
    state.resume();
    if ((node = this.parseBooleanLiteral(scope))) return node;
    state.resume();
    if ((node = this.parseBinaryExpression(scope))) return node;
    state.resume();
    if ((node = this.parseReferenceExpression(scope))) return node;
    state.resume();
    if ((node = this.parseModifierExpression(scope))) return node;
    state.resume();
    if ((node = this.parseVariableDeclaration(scope))) return node;
    state.resume();
    if ((node = this.parseFunctionDeclaration(scope))) return node;
    state.resume();
    //if ((node = this.parseIdentifierExpression(scope))) return node;
    //state.resume();
    return null;
  }
  parseVariableDeclaration(scope: Scope): VariableDeclaration | null {
    const type = this.tokenizer.getToken();
    if (!isBuiltinType(type)) return null;
    const mutableTok = this.tokenizer.getToken();
    let mutable = false;
    if (mutableTok.token === Token.Question) mutable = true;
    let name = mutable ? this.tokenizer.getToken() : mutableTok;
    if (!isIdentifier(name)) return null;
    this.tokenizer.getToken(); // =

    const value = this.parseExpression(scope, "IdentifierExpression"); // Expression
    if (!value) {
      const value = this.tokenizer.getToken();
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

    scope.add(name.text, node);
    return node;
  }
  parseFunctionDeclaration(scope: Scope): FunctionDeclaration | null {
    const state = this.tokenizer.createState();

    let exported = false;

    const exp = this.parseModifierExpression(scope);
    if (!exp) state.resume();
    else if (exp.tag.data == "export") exported = true;
    const fn = this.tokenizer.getToken();
    if (!isIdentifier(fn) || fn.text !== "fn") return null;

    const name = this.tokenizer.getToken();
    if (!isIdentifier(name)) return null;
    if (this.tokenizer.getToken().token !== Token.LeftParen) return null;
    const params: ParameterExpression[] = [];
    const blockScope = new Scope(scope);
    while (true) {
      const param = this.parseParameterExpression(blockScope);
      if (!param) break;
      params.push(param);
      const tok = this.tokenizer.getToken().token;
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

    if (scope.parentScope) {
      if (exported) {
        new SyntaxError(
          this.program,
          "Warn", "Exported functions must occur at the global scope! Not exporting function and moving on.",
          0x1,
          fn.range,
          "WARN"
        );
      } else {
        new SyntaxError(
          this.program,
          "Error", "Closures not yet supported!",
          0x2,
          fn.range,
          "FAIL"
        );
      }
    }
    this.program.globalScope.add(name.text, node);
    this.program.topLevelStatements.push(node);
    return node;
  }
  parseEnumDeclaration(scope: Scope): EnumDeclaration | null {
    this.tokenizer.createState();
    if (this.tokenizer.getToken().text != "enum") return null;
    const name = this.tokenizer.getToken();
    if (this.tokenizer.getToken().text != "{") return null;

    const elements: EnumElement[] = [];

    let elementName = this.tokenizer.getToken();
    if (elementName.token !== Token.Identifier) return null;
    let elementValue: NumberLiteral | null = null;

    let index = 0;
    while (true) {
      const trailing = this.tokenizer.getToken();
      if (trailing.text === "}" || trailing.text === ",") {
        const element = new EnumElement(
          new Identifier(
            elementName.text,
            elementName.range
          ),
          elementValue || new NumberLiteral(
            index.toString()
          )
        );

        if (elementValue) elementValue = null;

        index++;
        elements.push(element);
        if (trailing.text === "}") break;

        elementName = this.tokenizer.getToken();
        if (elementName.token !== Token.Identifier) return null;
      } else if (trailing.text === "=") {
        elementValue = this.parseNumberLiteral(scope);
        if (!elementValue) {

        }
      }
    }

    const node = new EnumDeclaration(
      new Identifier(
        name.text,
        name.range
      ),
      elements
    );

    this.program.globalScope.add(name.text, node);
    this.program.topLevelStatements.push(node);

    return node;
  }
  parseIfStatement(scope: Scope): IfStatement | null {
    if (this.tokenizer.getToken().text !== "if") return null;
    if (this.tokenizer.getToken().text !== "(") return null;
    const condition = this.parseBooleanLiteral(scope);
    if (this.tokenizer.getToken().text !== ")") return null;
    if (!condition) return null;
    const block = this.parseBlockExpression(scope);
    if (!block) return null;

    const node = new IfStatement(condition, block);
    return node;
  }
  parseModifierExpression(scope: Scope): ModifierExpression | null {
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

    const colonToken = this.tokenizer.viewToken();
    if (colonToken.token !== Token.Colon) {
      const node = new ModifierExpression(
        new Identifier(tagToken.text, tagToken.range),
      );
      return node;
    }
    this.tokenizer.getToken();
    const contentFirstToken = this.tokenizer.getToken();
    if (contentFirstToken.token !== Token.Identifier) {
      new TokenMismatchError(
        "Expected to find content to modifier, but found void!",
        2,
        contentFirstToken.range,
      );
      return null;
    }
    const content: TokenData[] = [contentFirstToken];
    /*while (true) {
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
    }*/
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
  parseFunctionImport(scope: Scope): FunctionImport | null {
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

    const colonToken = this.tokenizer.getToken();

    if (colonToken.token !== Token.Colon) {
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
        "Expected to find content to modifier, but found void!",
        2,
        contentFirstToken.range,
      );
      return null;
    }

    const content: TokenData[] = [contentFirstToken];

    let state = this.tokenizer.createState();
    while (true) {
      const token = this.tokenizer.getToken();
      if (
        contentFirstToken.range.line !== token.range.line ||
        token.token === Token.EOF
      ) {
        state.resume();
        break;
      }
      state = this.tokenizer.createState();
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

    const node = new FunctionImport(
      contentId,
      new Identifier(name.text, name.range),
      params,
      new TypeExpression([returnType.text], false),
      exported
    );

    scope.add(name.text, node);
    if (scope.parentScope) throw new Error("Expected to find import function at top level, but found it elsewhere!");
    this.program.topLevelStatements.push(node);

    return node;
  }
  parseBranchStatement(scope: Scope): BranchStatement | null {
    if (this.tokenizer.getToken().text !== "branch") return null;
    const name = this.tokenizer.getToken();
    if (name.token !== Token.Identifier) return null;

    let block: BlockExpression;

    if (this.tokenizer.viewToken().token !== Token.LeftBracket) {
      const stmt = this.parseNode(scope);
      if (!stmt) return null;
      block = new BlockExpression([
        stmt
      ]);
    } else {
      scope.add(name.text, new Statement())
      if (this.tokenizer.getToken().token !== Token.LeftBracket) return null;
      const stmts: Statement[] = [];
      while (true) {
        let stmt: Node | null = this.parseCallExpression(scope);
        if (stmt) stmts.push(stmt);
        else break;
      }
      block = new BlockExpression(stmts);
    }

    const node = new BranchStatement(
      new Identifier(
        name.text,
        name.range
      ),
      block
    );
    scope.add(name.text, node);
    return node;
  }

  parseBranchToStatement(scope: Scope): BranchToStatement | null {
    if (this.tokenizer.getToken().text !== "br") return null;
    const branchTo = this.tokenizer.getToken();
    if (branchTo.token !== Token.Identifier) return null
    const node = new BranchToStatement(
      new Identifier(
        branchTo.text,
        branchTo.range
      )
    );
    return node;
  }
  parseCallExpression(scope: Scope): CallExpression | null {
    const calling = this.tokenizer.getToken();
    const leftParen = this.tokenizer.getToken();
    const args: Expression[] = [];

    while (true) {
      const arg = this.parseExpression(scope);

      if (!arg) return null;
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

    return node;
  }
  parseReferenceExpression(scope: Scope): ReferenceExpression | null {
    const id = this.tokenizer.getToken();
    if (!scope.has(id.text)) return null;
    return new ReferenceExpression(id.text, scope.get(id.text)! as Statement);
  }
  parseReturnStatement(scope: Scope): ReturnStatement | null {
    const rt = this.tokenizer.getToken();
    if (!isIdentifier(rt) || rt.text !== "rt") return null;
    const express = this.parseExpression(scope);
    if (!express) return null;
    const node = new ReturnStatement(express);
    return node;
  }
  parseParameterExpression(scope: Scope): ParameterExpression | null {
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
  parseBlockExpression(scope: Scope): BlockExpression | null {
    let token = this.tokenizer.getToken();
    if (token.token !== Token.LeftBracket) return null;
    const stmts: Statement[] = [];
    while (true) {
      let stmt: Node | null = this.parseNode(scope);
      if (stmt) stmts.push(stmt);
      else break;
    }
    if (this.tokenizer.getToken().token !== Token.RightBracket) return null;
    const node = new BlockExpression(stmts);
    return node;
  }
  parseBinaryExpression(scope: Scope): BinaryExpression | null {
    let left: Expression | null = this.parseExpression(scope, "BinaryExpression");
    const op = tokenToOp(this.tokenizer.getToken());
    let right: Expression | null = this.parseExpression(scope, "BinaryExpression");

    if (op === null || !left || !right) {
      return null;
    }
    if (left instanceof Identifier) {
      if (scope.has(left.data)) {
        left = new ReferenceExpression(left.data, left);
      } else {
        new TokenMismatchError(
          `Cannot find name ${left.data} in scope`,
          0x01,
          left.range,
        );
        return null;
      }
    }
    const node = new BinaryExpression(left, op, right);
    // Check scope
    return node;
  }
  parseParenthesizedExpression(scope: Scope) {
    if (this.tokenizer.getToken().text !== "(") return null;
    const expression = this.parseExpression(scope);
    if (this.tokenizer.getToken().text !== ")") return null;
    if (!expression) return null;
    
    const node = new ParenthesizedExpression(expression, Range.from())
  }
  parseIdentifierExpression(scope: Scope): Identifier | null {
    const id = this.tokenizer.getToken();
    if (!isIdentifier(id)) return null;
    return new Identifier(id.text, id.range);
  }
  parseNumberLiteral(scope: Scope): NumberLiteral | null {
    const num = this.tokenizer.getToken(); // 1234567890_.
    if (!isNumeric(num)) return null;
    return new NumberLiteral(num.text);
  }
  parseStringLiteral(scope: Scope): StringLiteral | null {
    const num = this.tokenizer.getToken(); // " ... "
    if (!isString(num)) return null;
    return new StringLiteral(num.text);
  }
  parseBooleanLiteral(scope: Scope): BooleanLiteral | null {
    const value = this.tokenizer.getToken();
    if (value.text === "true") return new BooleanLiteral(true);
    else if (value.text === "false") return new BooleanLiteral(false);
    return null;
  }
}

export function tokenToOp(tok: TokenData): Operator | null {
  if (tok.token === Token.Add) return Operator.Add;
  if (tok.token === Token.Sub) return Operator.Sub;
  if (tok.token === Token.Equals) return Operator.Assign;
  return null;
}
