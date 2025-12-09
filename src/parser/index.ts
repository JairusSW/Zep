import { Statement } from "../ast/nodes/Statement.js";
import { Identifier } from "../ast/nodes/Identifier.js";
import { Tokenizer } from "../tokenizer/index.js";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration.js";
import { StringLiteral } from "../ast/nodes/StringLiteral.js";
import { TypeExpression } from "../ast/nodes/TypeExpression.js";
import { Source } from "../ast/Source.js";
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration.js";
import { BlockExpression } from "../ast/nodes/BlockStatement.js";
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
import { FunctionImportDeclaration } from "../ast/nodes/FunctionImportDeclaration.js";
import { ModifierExpression } from "../ast/nodes/ModifierExpression.js";
import { ReferenceExpression } from "../ast/nodes/ReferenceExpression.js";
import { CompileTimeError, SyntaxError, TokenMismatchError, UserError } from "../error/error.js";
import { Range } from "../ast/Range.js";
import { Token } from "../tokenizer/token.js";
import { TokenData } from "../tokenizer/tokendata.js";
import { CallExpression } from "../ast/nodes/CallExpression.js";
import { IfStatement, IfStatementKind } from "../ast/nodes/IfStatement.js";
import { BooleanLiteral } from "../ast/nodes/BooleanLiteral.js";
import { Node } from "../ast/nodes/Node.js";
import { BranchStatement } from "../ast/nodes/BranchStatement.js";
import { BranchToStatement } from "../ast/nodes/BranchToStatement.js";
import { EnumDeclaration } from "../ast/nodes/EnumDeclaration.js";
import { EnumElement } from "../ast/nodes/EnumElement.js";
import { ParenthesizedExpression } from "../ast/nodes/ParenthesizedExpression.js";
import { WhileStatement } from "../ast/nodes/WhileStatement.js";
import { StructDeclaration } from "../ast/nodes/StructDeclaration.js";
import { FieldAccessKind, StructFieldDeclaration } from "../ast/nodes/StructFieldDeclaration.js";
import { ImportDeclaration } from "../ast/nodes/ImportDeclaration.js";
import { Program } from "../ast/Program.js";
import { assert } from "../util/assert.js";
import { ExpressionStatement } from "../ast/nodes/ExpressionStatement.js";

export class Parser {
  public source: Source;
  public program: Program;
  public pos: number = 0;

  private parsed = false;
  constructor(source: Source, program: Program) {
    this.source = source;
    this.program = program;
  }
  parse(): Source {
    if (this.parsed) return this.source;
    this.parsed = true;
    return this.parseSource();
  }
  parseSource(): Source {
    while (this.parseTopLevelStatement(this.source.globalScope)) { }
    return this.source;
  }
  parseTopLevelStatement(scope: Scope): Statement | null {
    const tokenizer = this.source.tokenizer;
    let node: Statement | null = null;
    const state = tokenizer.createState();
    if ((node = this.parseFunctionDeclaration(scope))) return node;
    state.resume();
    if ((node = this.parseImportDeclaration(scope))) return node;
    state.resume();
    if ((node = this.parseFunctionImport(scope))) return node;
    state.resume();
    if ((node = this.parseVariableDeclaration(scope))) return node;
    state.resume();
    if ((node = this.parseStructDeclaration(scope))) return node;
    state.resume();
    if ((node = this.parseEnumDeclaration(scope))) return node;
    state.resume();
    return null;
  }
  parseStatement(scope: Scope): Statement | null {
    const tokenizer = this.source.tokenizer;
    let node: Statement | null = null;
    const state = tokenizer.createState();
    if ((node = this.parseVariableDeclaration(scope))) return node;
    state.resume();
    if ((node = this.parseReturnStatement(scope))) return node;
    state.resume();
    if ((node = this.parseIfStatement(scope))) return node;
    state.resume();
    if ((node = this.parseBlockStatement(scope))) return node;
    state.resume();
    if ((node = this.parseBranchStatement(scope))) return node;
    state.resume();
    if ((node = this.parseWhileStatement(scope))) return node;
    state.resume();
    if ((node = this.parseCallExpression(scope))) return node;
    state.resume();
    return null;
  }
  parseExpression(scope: Scope, besides: string | null = null): Expression | null {
    const tokenizer = this.source.tokenizer;
    let express: Expression | null = null;
    const state = tokenizer.createState();
    if (besides !== "BinaryExpression" && (express = this.parseBinaryExpression(scope))) return express;
    state.resume();
    if (besides !== "CallExpression" && (express = this.parseCallExpression(scope))) return express;
    state.resume();
    if (besides !== "NumberLiteral" && (express = this.parseNumberLiteral(scope))) return express;
    state.resume();
    if (besides !== "StringLiteral" && (express = this.parseStringLiteral(scope))) return express;
    state.resume();
    if (besides !== "BooleanLiteral" && (express = this.parseBooleanLiteral(scope))) return express;
    state.resume();
    if (besides !== "ReferenceExpression" && (express = this.parseReferenceExpression(scope))) return express;
    state.resume();
    if (besides !== "ModifierExpression" && (express = this.parseModifierExpression(scope))) return express;
    state.resume();
    if (besides !== "IdentifierExpression" && (express = this.parseIdentifierExpression(scope))) return express;
    state.resume();
    if (besides !== "ParameterExpression" && (express = this.parseParameterExpression(scope))) return express;
    state.resume();
    if (besides !== "ParenthesizedExpression" && (express = this.parseParenthesizedExpression(scope))) return express;
    state.resume();

    return null;
  }
  parseExpressionStatement(scope: Scope): ExpressionStatement | null {
    const tokenizer = this.source.tokenizer;
    let node: Expression | null = null;
    const state = tokenizer.createState();
    if ((node = this.parseExpression(scope, "ExpressionStatement"))) return node;
    state.resume();
    return null;
  }
  parseNode(scope: Scope, besides: string | null = null): Node | null {
    const tokenizer = this.source.tokenizer;
    let node: Node | null = this.parseStatement(scope) || this.parseExpression(scope, besides);
    return node;
  }
  parseVariableDeclaration(scope: Scope): VariableDeclaration | null {
    const tokenizer = this.source.tokenizer;

    // Determine mutability keyword (consumes the mut/let token)
    const kw = tokenizer.getToken();
    let mutable: boolean;
    switch (kw.text) {
      case "let":
        mutable = true;
        break;
      case "mut":
        mutable = false;
        break;
      default:
        return null;
    }

    // Parse name (consumes identifier)
    const nameTok = tokenizer.getToken();
    if (!isIdentifier(nameTok)) return null;

    let type: TypeExpression | null = null;
    let value: Expression | null = null;

    // Peek the next token without consuming
    let next = tokenizer.viewToken();

    // If there's a type annotation: consume ':' then parse the type
    if (next.token === Token.Colon) {
      tokenizer.getToken(); // consume ':'

      // parseTypeExpression will call getToken() to consume the identifier(s)
      type = this.parseTypeExpression(scope);
      if (!type) {
        new SyntaxError(
          this.source,
          "Error",
          "Expected type after ':'",
          0x5,
          tokenizer.currentRange(),
          "FAIL"
        ).throw();
      }

      // After type, peek: if '=' present -> consume and parse value, otherwise value stays null (optional)
      next = tokenizer.viewToken();
      if (next.token === Token.Equals) {
        tokenizer.getToken(); // consume '='
        value = this.parseExpression(scope);
        if (!value) return null;
      }

    } else {
      // No type annotation -> initializer required
      if (next.token !== Token.Equals) {
        new SyntaxError(
          this.source,
          "Error",
          "Expected '=' or ':' after variable name!",
          0x5,
          tokenizer.currentRange(),
          "FAIL"
        ).throw();
      }

      tokenizer.getToken(); // consume '='
      value = this.parseExpression(scope);
      if (!value) return null;
    }

    const endRange = value?.range ?? type?.range ?? tokenizer.position.toRange();
    const node = new VariableDeclaration(
      new Identifier(nameTok.text, nameTok.range),
      value,
      type,
      mutable,
      Range.from(nameTok.range, endRange)
    );

    scope.add(nameTok.text, node);
    return node;
  }

  parseTypeExpression(scope: Scope): TypeExpression | null {
    const tokenizer = this.source.tokenizer;

    let token = tokenizer.getToken();
    if (!isIdentifier(token)) return null;

    const types: string[] = [token.text];
    let startRange = token.range;

    let union = false;

    // while (true) {
    //   token = tokenizer.viewToken();

    //   if (token.token !== Token.Pipe) break;
    //   tokenizer.getToken();

    //   union = true;

    //   const nextType = tokenizer.getToken();

    //   if (!isIdentifier(nextType)) {
    //     new SyntaxError(
    //       this.source,
    //       "SyntaxError",
    //       "Expected type identifier after '|' in union type",
    //       0x10,
    //       nextType.range,
    //       "FAIL"
    //     ).throw();
    //   }

    //   types.push(nextType.text);
    // }

    const fullRange = Range.from(startRange, tokenizer.currentRange());

    const node = new TypeExpression(types, union, fullRange);
    return node;
  }

  parseFunctionDeclaration(scope: Scope): FunctionDeclaration | null {
    const tokenizer = this.source.tokenizer;
    const state = tokenizer.createState();

    let exported = false;

    const exp = this.parseModifierExpression(scope);
    if (!exp) state.resume();
    else if (exp.tag.data == "export") exported = true;
    const fn = tokenizer.getToken();
    if (!isIdentifier(fn) || fn.text !== "fn") return null;

    const name = tokenizer.getToken();
    if (!isIdentifier(name)) return null;
    if (tokenizer.getToken().token !== Token.LeftParen) return null;
    const params: ParameterExpression[] = [];
    const blockScope = new Scope(scope);
    while (true) {
      const param = this.parseParameterExpression(blockScope);
      if (!param) break;
      params.push(param);
      const tok = tokenizer.getToken().token;
      if (tok !== Token.Comma) break;
    }

    let returnType: TypeExpression | null = null
    const stateB = tokenizer.createState();
    if (tokenizer.getToken().token === Token.Colon) {
      returnType = this.parseTypeExpression(blockScope);
      assert(!!returnType, new SyntaxError(
        this.source,
        "Error", "Expected return type after ':'",
        0x5,
        tokenizer.currentRange(),
        "FAIL"
      ));
    } else {
      stateB.resume();
    }

    const block = this.parseBlockStatement(blockScope);
    if (!block) return null;

    const node = new FunctionDeclaration(
      new Identifier(name.text, name.range),
      params,
      returnType,
      block,
      new Scope(scope),
      exported,
      Range.from(exp?.range || fn.range, tokenizer.position.toRange())
    );
    if (scope.parentScope) {
      if (exported) {
        new SyntaxError(
          this.source,
          "Warn", "Exported functions must occur at the global scope! Not exporting function and moving on.",
          0x1,
          fn.range,
          "WARN"
        );
      } else {
        new SyntaxError(
          this.source,
          "Error", "Closures not yet supported!",
          0x2,
          fn.range,
          "FAIL"
        );
      }
    }
    this.source.globalScope.add(name.text, node);
    this.source.topLevelStatements.push(node);
    return node;
  }
  parseEnumDeclaration(scope: Scope): EnumDeclaration | null {
    const tokenizer = this.source.tokenizer;
    const state = tokenizer.createState();

    let exported = false;

    const exp = this.parseModifierExpression(scope);
    if (!exp) state.resume();
    else if (exp.tag.data == "export") exported = true;

    tokenizer.createState();
    if (tokenizer.getToken().text != "enum") return null;
    const name = tokenizer.getToken();
    if (tokenizer.getToken().text != "{") return null;

    const elements: EnumElement[] = [];

    let elementName = tokenizer.getToken();
    if (elementName.token !== Token.Identifier) return null;
    let elementValue: NumberLiteral | null = null;

    let index = 0;
    let trailing!: TokenData;
    while (true) {
      trailing = tokenizer.getToken();
      if (trailing.text === "}" || trailing.text === ",") {
        const element = new EnumElement(
          new Identifier(
            elementName.text,
            elementName.range
          ),
          elementValue || new NumberLiteral(
            index.toString(),
            null,
            tokenizer.position.toRange()
          ),
          Range.from(elementName.range, tokenizer.position.toRange())
        );

        if (elementValue) elementValue = null;

        index++;
        elements.push(element);
        if (trailing.text === "}") break;

        elementName = tokenizer.getToken();
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
      elements,
      Range.from(elementName.range, trailing.range)
    );

    this.source.globalScope.add(name.text, node);
    this.source.topLevelStatements.push(node);

    return node;
  }
  parseIfStatement(scope: Scope, parent: IfStatement | null = null): IfStatement | null {
    const tokenizer = this.source.tokenizer;
    const firstToken = tokenizer.getToken().text;
    let kind: IfStatementKind | null = null;
    let condition: Expression | null = null;
    if (!parent && firstToken == "if") {
      kind = IfStatementKind.If;
    }
    if (parent && firstToken === "else") {
      const state = tokenizer.createState();
      if (tokenizer.getToken().text !== "if") {
        state.resume();
        kind = IfStatementKind.Else;
      } else {
        kind = IfStatementKind.ElseIf
      }
    }
    if (kind == null) return null;
    const start = tokenizer.position.toRange();
    if (kind !== IfStatementKind.Else) {
      condition = this.parseExpression(scope);
      if (!condition) return null;
    }
    const ifTrue = this.parseStatement(scope);
    if (!ifTrue) return null;
    const state = tokenizer.createState();

    const node = new IfStatement(condition, ifTrue, null, kind, Range.from(start, ifTrue.range));
    node.ifFalse = this.parseIfStatement(scope, node);
    if (!node.ifFalse) {
      state.resume();
      console.log(node);
      return node;
    } else {
      node.range = Range.from(start, node.ifFalse.range);
      console.log(node);
      return node;
    }
  }
  parseModifierExpression(scope: Scope): ModifierExpression | null {
    const tokenizer = this.source.tokenizer;
    const hashToken = tokenizer.getToken();
    const openingBracketToken = tokenizer.getToken();
    const tagToken = tokenizer.getToken();
    const closingBracketToken = tokenizer.getToken();

    if (
      hashToken?.text !== "#" ||
      openingBracketToken?.text !== "[" ||
      (!isIdentifier(tagToken) && tagToken.text !== "extern") ||
      closingBracketToken?.text !== "]"
    )
      return null;

    const colonToken = tokenizer.viewToken();
    if (colonToken.token !== Token.Colon) {
      const node = new ModifierExpression(
        new Identifier(tagToken.text, tagToken.range),
        null,
        Range.from(hashToken.range, colonToken.range)
      );
      return node;
    }
    tokenizer.getToken();
    const contentFirstToken = tokenizer.getToken();
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
      const token = tokenizer.getToken();
      if (
        contentFirstToken.range.line < token.range.line ||
        token.token === Token.EOF
      ) {
        tokenizer.resumeState();
        break;
      }
      tokenizer.pauseState();
      content.push(token);
    }*/
    const contentId = new Identifier(
      content.map((v) => v.text).join(""),
      tokenizer.position.toRange(),
    );
    const node = new ModifierExpression(
      new Identifier(tagToken.text, tagToken.range),
      contentId,
      Range.from(hashToken.range, contentId.range)
    );
    return node;
  }
  parseFunctionImport(scope: Scope): FunctionImportDeclaration | null {
    const tokenizer = this.source.tokenizer;
    const hashToken = tokenizer.getToken();
    const openingBracketToken = tokenizer.getToken();
    const tagToken = tokenizer.getToken();
    const closingBracketToken = tokenizer.getToken();

    if (
      hashToken?.text !== "#" ||
      openingBracketToken?.text !== "[" ||
      (!isIdentifier(tagToken) && tagToken.text !== "extern") ||
      closingBracketToken?.text !== "]"
    )
      return null;

    const colonToken = tokenizer.getToken();

    if (colonToken.token !== Token.Colon) {
      return null;
    }

    const contentFirstToken = tokenizer.getToken();
    if (contentFirstToken.token !== Token.Identifier) {
      new TokenMismatchError(
        "Expected to find content to modifier, but found void!",
        2,
        contentFirstToken.range,
      );
      return null;
    }

    const content: TokenData[] = [contentFirstToken];

    let state = tokenizer.createState();
    while (true) {
      const token = tokenizer.getToken();
      if (
        contentFirstToken.range.start.line !== token.range.start.line ||
        token.token === Token.EOF
      ) {
        state.resume();
        break;
      }
      state = tokenizer.createState();
      content.push(token);
    }

    const contentId = new Identifier(
      content.map((v) => v.text).join(""),
      tokenizer.position.toRange()
    );

    let exported = false;

    const fn = tokenizer.getToken();
    if (!isIdentifier(fn) || fn.text !== "fn") return null;

    const name = tokenizer.getToken();

    if (!isIdentifier(name)) return null;
    if (tokenizer.getToken().token !== Token.LeftParen) return null;
    const params: ParameterExpression[] = [];

    const blockScope = new Scope();
    // Scope will be thrown away

    while (true) {
      const param = this.parseParameterExpression(blockScope);
      if (!param) return null;
      params.push(param);

      const tok = tokenizer.getToken().token;

      if (tok === Token.RightParen) break;
      if (tok !== Token.Comma) break;
    }
    if (tokenizer.getToken().token !== Token.Minus) return null;
    if (tokenizer.getToken().token !== Token.GreaterThan) return null;

    const returnType = tokenizer.getToken();

    if (!isBuiltinType(returnType)) return null;

    const node = new FunctionImportDeclaration(
      contentId,
      new Identifier(name.text, name.range),
      params,
      new TypeExpression([returnType.text], false, returnType.range),
      exported,
      Range.from(hashToken.range, returnType.range)
    );

    scope.add(name.text, node);
    if (scope.parentScope) throw new Error("Expected to find function import at top level, but found it elsewhere!");
    this.source.topLevelStatements.push(node);

    return node;
  }
  parseImportDeclaration(scope: Scope): ImportDeclaration | null {
    const tokenizer = this.source.tokenizer;
    if (tokenizer.getToken().text !== "import") return null;
    const start = tokenizer.position.toRange();

    const path = this.parseStringLiteral(scope);
    if (!path) return null;
    const source = this.program.sources.find(v => v.fileName == path.data);
    if (!source) {
      new UserError(
        this.source,
        "ERROR",
        "Could not locate imported file " + path.data,
        321,
        Range.from(start, path.range),
        "FAIL"
      );
      return null;
    }
    source.parse();
    const node = new ImportDeclaration(path, Range.from(start, path.range));

    // scope.add(, node);
    if (scope.parentScope) throw new Error("Expected to find import at top level, but found it elsewhere!");
    this.source.topLevelStatements.push(node);

    return node;
  }
  parseBranchStatement(scope: Scope): BranchStatement | null {
    const tokenizer = this.source.tokenizer;
    if (tokenizer.getToken().text !== "branch") return null;
    const start = tokenizer.position.toRange();
    const name = tokenizer.getToken();
    if (name.token !== Token.Identifier) return null;

    const body = this.parseNode(scope);
    if (!body) return null;

    const node = new BranchStatement(
      new Identifier(
        name.text,
        name.range
      ),
      body,
      Range.from(start, body.range)
    );
    scope.add(name.text, node);
    return node;
  }

  parseBranchToStatement(scope: Scope): BranchToStatement | null {
    const tokenizer = this.source.tokenizer;
    if (tokenizer.getToken().text !== "br") return null;
    const start = tokenizer.position.toRange();
    const branchTo = tokenizer.getToken();
    if (branchTo.token !== Token.Identifier) return null
    const node = new BranchToStatement(
      new Identifier(
        branchTo.text,
        branchTo.range
      ),
      Range.from(start, branchTo.range)
    );
    return node;
  }
  parseCallExpression(scope: Scope): CallExpression | null {
    const tokenizer = this.source.tokenizer;
    const calling = tokenizer.getToken();
    if (!isIdentifier(calling)) return null;
    const leftParen = tokenizer.getToken();
    if (leftParen.text !== "(") return null;
    const args: Expression[] = [];

    while (true) {
      const arg = this.parseExpression(scope);

      if (!arg) {
        assert(tokenizer.getToken().token === Token.RightParen, new SyntaxError(this.source, "Error", "Expected ')' after function call, but got none!", 0x4, tokenizer.currentRange(), "FAIL"));
        break;
      }
      args.push(arg);

      const tok = tokenizer.getToken();

      if (tok.token === Token.RightParen) break;
      if (tok.token !== Token.Comma) return null;
    }

    if (!isIdentifier(calling)) return null;

    if (leftParen.token !== Token.LeftParen) return null;

    const node = new CallExpression(
      new Identifier(calling.text, calling.range),
      args,
      Range.from(calling.range, tokenizer.currentRange())
    );

    return node;
  }
  parseReferenceExpression(scope: Scope): ReferenceExpression | null {
    const tokenizer = this.source.tokenizer;
    const id = tokenizer.getToken();
    if (!scope.has(id.text)) return null;
    return new ReferenceExpression(
      id.text,
      scope.get(id.text)! as Statement,
      id.range
    );
  }
  parseReturnStatement(scope: Scope): ReturnStatement | null {
    const tokenizer = this.source.tokenizer;
    const rt = tokenizer.getToken();
    if (!isIdentifier(rt) || rt.text !== "rt") return null;
    const expr = this.parseExpression(scope);
    if (!expr) return null;
    const node = new ReturnStatement(
      expr,
      Range.from(rt.range, expr.range)
    );
    return node;
  }
  parseParameterExpression(scope: Scope): ParameterExpression | null {
    const tokenizer = this.source.tokenizer;
    const name = tokenizer.getToken();
    if (!isIdentifier(name) || tokenizer.getToken().text !== ":")
      return null;
    const type = tokenizer.getToken();
    if (!isBuiltinType(type)) return null;
    const node = new ParameterExpression(
      new Identifier(name.text, name.range),
      new TypeExpression([type.text], false, type.range),
      Range.from(name.range, type.range)
    );
    scope.add(name.text, node);
    return node;
  }
  parseBlockStatement(scope: Scope): BlockExpression | null {
    const tokenizer = this.source.tokenizer;
    let token = tokenizer.getToken();
    if (token.token !== Token.LeftBracket) return null;
    const stmts: Statement[] = [];
    while (true) {
      let stmt: Node | null = this.parseNode(scope);
      if (stmt) stmts.push(stmt);
      else break;
    }
    if (tokenizer.getToken().token !== Token.RightBracket) return null;
    const node = new BlockExpression(
      stmts,
      scope,
      Range.from(token.range, tokenizer.position.toRange())
    );
    return node;
  }
  parseBinaryExpressionLeft(scope: Scope) {
    const tokenizer = this.source.tokenizer;
    const state = tokenizer.createState();
    let left: Expression | null;
    if (left = this.parseCallExpression(scope)) return left;
    state.resume();
    if (left = this.parseNumberLiteral(scope)) return left;
    state.resume();
    if (left = this.parseIdentifierExpression(scope)) return left;
    state.resume();
    if (left = this.parseStringLiteral(scope)) return left;
    state.resume();
    if (left = this.parseBooleanLiteral(scope)) return left;
    state.resume();
    if (left = this.parseParenthesizedExpression(scope)) return left;
    state.resume()
    return null;
  }
  parseBinaryExpression(scope: Scope): BinaryExpression | null {
    const tokenizer = this.source.tokenizer;
    let left: Expression | null = this.parseBinaryExpressionLeft(scope);
    if (!left) return null;
    const op = tokenToOp(tokenizer.getToken());
    let right: Expression | null = this.parseExpression(scope);

    if (op === null || !left || !right) {
      return null;
    }
    if (left instanceof Identifier) {
      if (scope.has(left.data)) {
        left = new ReferenceExpression(
          left.data,
          left,
          left.range
        );
      } else {
        new TokenMismatchError(
          `Cannot find name ${left.data} in scope`,
          0x01,
          left.range,
        );
        return null;
      }
    }
    const node = new BinaryExpression(
      left,
      op,
      right,
      Range.from(left.range, right.range)
    );
    // Check scope
    return node;
  }
  parseParenthesizedExpression(scope: Scope): ParenthesizedExpression | null {
    const tokenizer = this.source.tokenizer;
    if (tokenizer.getToken().text !== "(") return null;
    const start = tokenizer.position.toRange();
    const expr = this.parseExpression(scope, "ParenthesizedExpression");
    if (tokenizer.getToken().text !== ")") return null;
    if (!expr) return null;

    const node = new ParenthesizedExpression(expr, Range.from(start, expr.range));
    return node;
  }
  parseIdentifierExpression(scope: Scope): Identifier | null {
    const tokenizer = this.source.tokenizer;
    const id = tokenizer.getToken();
    if (!isIdentifier(id)) return null;
    return new Identifier(id.text, id.range);
  }
  parseNumberLiteral(scope: Scope): NumberLiteral | null {
    const tokenizer = this.source.tokenizer;
    const num = tokenizer.getToken(); // 1234567890_.
    if (!isNumeric(num)) return null;
    return new NumberLiteral(num.text, null, num.range);
  }
  parseStringLiteral(scope: Scope): StringLiteral | null {
    const tokenizer = this.source.tokenizer;
    const str = tokenizer.getToken(); // " ... "
    if (!isString(str)) return null;
    return new StringLiteral(str.text.slice(1, str.text.length - 1), str.range);
  }
  parseBooleanLiteral(scope: Scope): BooleanLiteral | null {
    const tokenizer = this.source.tokenizer;
    const value = tokenizer.getToken();
    if (value.text === "true") return new BooleanLiteral(true, value.range);
    else if (value.text === "false") return new BooleanLiteral(false, value.range);
    return null;
  }
  parseWhileStatement(scope: Scope): WhileStatement | null {
    const tokenizer = this.source.tokenizer;
    if (tokenizer.getToken().text !== "while") return null;
    const start = tokenizer.position.toRange();
    const condition = this.parseExpression(scope);
    if (!condition) return null;
    const body = this.parseStatement(scope);
    if (!body) return null;

    const node = new WhileStatement(condition, body, Range.from(start, body.range));
    return node;
  }
  parseStructDeclaration(scope: Scope): StructDeclaration | null {
    const tokenizer = this.source.tokenizer;
    if (tokenizer.getToken().text !== "struct") return null;
    const start = tokenizer.position.toRange();

    const nameToken = tokenizer.getToken();
    if (!isIdentifier(nameToken)) return null;
    const name = new Identifier(nameToken.text, nameToken.range);

    if (tokenizer.getToken().text !== "{") return null;
    const fields: StructFieldDeclaration[] = [];
    while (true) {
      const field = this.parseStructFieldExpression(scope);
      if (!field) return null;
      fields.push(field);
      tokenizer.position.markPosition();
      if (tokenizer.viewToken().text == "}") break;
    }
    const lastToken = tokenizer.getToken();

    const node = new StructDeclaration(name, fields, Range.from(start, lastToken.range));
    this.source.topLevelStatements.push(node);
    return node;
  }
  parseStructFieldExpression(scope: Scope): StructFieldDeclaration | null {
    const tokenizer = this.source.tokenizer;
    const accessToken = tokenizer.getToken();
    const start = tokenizer.position.toRange();

    let access: FieldAccessKind | null = null;

    if (accessToken.text === "public") {
      access = FieldAccessKind.Public;
    } else if (accessToken.text === "private") {
      access = FieldAccessKind.Private;
    } else if (accessToken.text === "final") {
      access = FieldAccessKind.Final;
    }

    access = access || FieldAccessKind.Public;

    const typeToken = access ? tokenizer.getToken() : accessToken;
    if (!isIdentifier(typeToken)) return null;
    const type = new TypeExpression([typeToken.text], false, typeToken.range);

    const nameToken = tokenizer.getToken();
    if (!isIdentifier(nameToken)) return null;
    const name = new Identifier(nameToken.text, nameToken.range);

    let value: Expression | null = null;
    const state = tokenizer.createState();
    if (tokenizer.getToken().text == "=") {
      value = this.parseExpression(scope);
    } else {
      state.resume();
    }

    const node = new StructFieldDeclaration(name, type, access, value, Range.from(start, nameToken.range));
    return node;
  }
}

export function tokenToOp(tok: TokenData): Operator | null {
  if (tok.token === Token.Plus) return Operator.Add;
  if (tok.token === Token.Minus) return Operator.Sub;
  if (tok.token === Token.Asterisk) return Operator.Mul;
  if (tok.token === Token.Equals) return Operator.Equals;
  if (tok.token === Token.EqualsEquals) return Operator.EqualsEquals;
  if (tok.token === Token.LessThanEquals) return Operator.LessThanEquals;
  return null;
}
