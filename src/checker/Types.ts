import {
  BinaryExpression,
  BinaryOp,
  BlockExpression,
  BooleanLiteral,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  NumberLiteral,
  ParenthesizedExpression,
  PropertyAccessExpression,
  ReturnStatement,
  Statement,
  StringLiteral,
  VariableDeclaration,
  WhileStatement,
} from "../ast.js";
import {
  DiagnosticCode,
  DiagnosticEmitter,
  DiagnosticSeverity,
} from "../diagnostics.js";
import { Range } from "../range.js";
import { Source } from "../source.js";

type TypeName = string;

type VariableSymbol = {
  kind: "variable";
  name: string;
  type: TypeName;
  mutable: boolean;
  range: Range;
};

type FunctionSymbol = {
  kind: "function";
  name: string;
  paramTypes: TypeName[];
  returnType: TypeName;
  range: Range;
};

type ScopeFrame = {
  parent: ScopeFrame | null;
  variables: Map<string, VariableSymbol>;
};

const NUMERIC_TYPES = new Set<TypeName>(["i32", "i64", "f32", "f64", "usize"]);
const INTEGER_TYPES = new Set<TypeName>(["i32", "i64", "usize"]);

function isAssignmentOp(op: BinaryOp): boolean {
  return (
    op === BinaryOp.Assign ||
    op === BinaryOp.AddEq ||
    op === BinaryOp.SubEq ||
    op === BinaryOp.MulEq ||
    op === BinaryOp.DivEq ||
    op === BinaryOp.ModEq ||
    op === BinaryOp.BitAndEq ||
    op === BinaryOp.BitOrEq ||
    op === BinaryOp.BitXorEq ||
    op === BinaryOp.ShiftLeftEq ||
    op === BinaryOp.ShiftRightEq
  );
}

function splitUnion(type: TypeName): TypeName[] {
  return type
    .split("|")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function typeToString(type: TypeName | null): string {
  return type ?? "<unknown>";
}

export class TypeChecker extends DiagnosticEmitter {
  private source: Source;
  private functions = new Map<string, FunctionSymbol>();
  private currentFunction: FunctionSymbol | null = null;

  constructor(source: Source) {
    super();
    this.source = source;
  }

  protected getFileName(): string {
    return this.source.fileName;
  }

  check(): void {
    this.functions.clear();
    this.collectTopLevelDeclarations();
    this.checkTopLevelStatements();
  }

  private reportError(
    code: DiagnosticCode,
    params: Record<string, string> = {},
    range: Range | null = null,
  ): void {
    this.emit(DiagnosticSeverity.ERROR, code, undefined, params, range);
  }

  private collectTopLevelDeclarations(): void {
    for (const stmt of this.source.statements) {
      if (!(stmt instanceof FunctionDeclaration)) continue;

      const name = stmt.name.data;
      if (this.functions.has(name)) {
        this.reportError(
          DiagnosticCode.UNSUPPORTED,
          { message: `duplicate function declaration '${name}'` },
          stmt.name.range,
        );
        continue;
      }

      const paramTypes: TypeName[] = stmt.parameters.map((param) =>
        this.resolveDeclaredType(param.type, "parameter", param.range),
      );
      const returnType = this.resolveDeclaredType(
        stmt.returnType,
        "function return",
        stmt.range,
      );

      this.functions.set(name, {
        kind: "function",
        name,
        paramTypes,
        returnType,
        range: stmt.range,
      });
    }
  }

  private checkTopLevelStatements(): void {
    for (const stmt of this.source.statements) {
      if (stmt instanceof FunctionDeclaration) {
        this.checkFunctionDeclaration(stmt);
        continue;
      }

      if (stmt instanceof VariableDeclaration) {
        // Allow top-level constants; still type-check expression.
        const scope = this.makeScope(null);
        this.checkVariableDeclaration(stmt, scope);
        continue;
      }

      this.reportError(
        DiagnosticCode.UNSUPPORTED,
        {
          message: `top-level statement '${stmt.constructor.name}' is not type-checked`,
        },
        stmt.range,
      );
    }
  }

  private checkFunctionDeclaration(node: FunctionDeclaration): void {
    const fn = this.functions.get(node.name.data);
    if (!fn) return;

    const scope = this.makeScope(null);
    this.currentFunction = fn;

    for (let i = 0; i < node.parameters.length; i++) {
      const parameter = node.parameters[i];
      const paramType = fn.paramTypes[i] ?? "void";
      this.defineVariable(scope, {
        kind: "variable",
        name: parameter.name.data,
        type: paramType,
        mutable: false,
        range: parameter.range,
      });
    }

    this.checkStatement(node.block, scope);
    this.currentFunction = null;
  }

  private checkStatement(stmt: Statement, scope: ScopeFrame): void {
    if (stmt instanceof BlockExpression) {
      this.checkBlock(stmt, scope);
      return;
    }
    if (stmt instanceof VariableDeclaration) {
      this.checkVariableDeclaration(stmt, scope);
      return;
    }
    if (stmt instanceof ExpressionStatement) {
      this.inferExpressionType(stmt.expression, scope);
      return;
    }
    if (stmt instanceof ReturnStatement) {
      this.checkReturnStatement(stmt, scope);
      return;
    }
    if (stmt instanceof IfStatement) {
      this.checkIfStatement(stmt, scope);
      return;
    }
    if (stmt instanceof WhileStatement) {
      this.checkWhileStatement(stmt, scope);
      return;
    }

    this.reportError(
      DiagnosticCode.UNSUPPORTED,
      { message: `statement '${stmt.constructor.name}' is not type-checked` },
      stmt.range,
    );
  }

  private checkBlock(block: BlockExpression, parentScope: ScopeFrame): void {
    const scope = this.makeScope(parentScope);
    for (const statement of block.statements) {
      this.checkStatement(statement, scope);
    }
  }

  private checkVariableDeclaration(
    node: VariableDeclaration,
    scope: ScopeFrame,
  ): void {
    const declaredType = this.resolveDeclaredType(
      node.type,
      `variable '${node.name.data}'`,
      node.range,
    );
    const valueType = node.value
      ? this.inferExpressionType(node.value, scope)
      : null;

    let finalType: TypeName;
    if (declaredType !== "void") {
      finalType = declaredType;
      if (valueType && !this.isAssignable(valueType, declaredType)) {
        this.reportError(
          DiagnosticCode.TYPE_MISMATCH,
          { actual: valueType, expected: declaredType },
          node.value?.range ?? node.range,
        );
      }
    } else if (valueType) {
      finalType = valueType;
    } else {
      this.reportError(
        DiagnosticCode.UNSUPPORTED,
        {
          message: `variable '${node.name.data}' requires a type annotation or initializer`,
        },
        node.range,
      );
      finalType = "void";
    }

    this.defineVariable(scope, {
      kind: "variable",
      name: node.name.data,
      type: finalType,
      mutable: node.mutable,
      range: node.range,
    });
  }

  private checkReturnStatement(node: ReturnStatement, scope: ScopeFrame): void {
    const expected = this.currentFunction?.returnType ?? "void";
    const actual = this.inferExpressionType(node.returning, scope);
    if (!actual) return;

    if (!this.isAssignable(actual, expected)) {
      this.reportError(
        DiagnosticCode.TYPE_MISMATCH,
        { actual, expected },
        node.returning.range,
      );
    }
  }

  private checkIfStatement(node: IfStatement, scope: ScopeFrame): void {
    if (node.condition) {
      const conditionType = this.inferExpressionType(node.condition, scope);
      if (conditionType && !this.isAssignable(conditionType, "bool")) {
        this.reportError(
          DiagnosticCode.TYPE_MISMATCH,
          { actual: conditionType, expected: "bool" },
          node.condition.range,
        );
      }
    }

    this.checkStatement(node.ifTrue, this.makeScope(scope));
    if (node.ifFalse) this.checkStatement(node.ifFalse, this.makeScope(scope));
  }

  private checkWhileStatement(node: WhileStatement, scope: ScopeFrame): void {
    const conditionType = this.inferExpressionType(node.condition, scope);
    if (conditionType && !this.isAssignable(conditionType, "bool")) {
      this.reportError(
        DiagnosticCode.TYPE_MISMATCH,
        { actual: conditionType, expected: "bool" },
        node.condition.range,
      );
    }
    this.checkStatement(node.body, this.makeScope(scope));
  }

  private inferExpressionType(
    expr: Expression | Statement,
    scope: ScopeFrame,
  ): TypeName | null {
    if (expr instanceof Identifier) {
      const variable = this.resolveVariable(scope, expr.data);
      if (variable) return variable.type;

      if (this.functions.has(expr.data)) {
        this.reportError(
          DiagnosticCode.NAMESPACE_CANNOT_BE_USED_HERE,
          {},
          expr.range,
        );
        return null;
      }

      this.reportError(
        DiagnosticCode.UNKNOWN_IDENTIFIER,
        { name: expr.data },
        expr.range,
      );
      return null;
    }

    if (expr instanceof NumberLiteral) {
      return expr.type?.types[0] ?? "i32";
    }
    if (expr instanceof StringLiteral) return "string";
    if (expr instanceof BooleanLiteral) return "bool";
    if (expr instanceof ParenthesizedExpression) {
      return this.inferExpressionType(expr.expression, scope);
    }
    if (expr instanceof CallExpression) return this.inferCallExpression(expr, scope);
    if (expr instanceof BinaryExpression) return this.inferBinaryExpression(expr, scope);
    if (expr instanceof PropertyAccessExpression) {
      this.reportError(
        DiagnosticCode.UNSUPPORTED,
        { message: "property access type resolution is not implemented yet" },
        expr.range,
      );
      return null;
    }

    this.reportError(
      DiagnosticCode.UNSUPPORTED,
      { message: `expression '${expr.constructor.name}' is not type-checked` },
      expr.range,
    );
    return null;
  }

  private inferCallExpression(
    node: CallExpression,
    scope: ScopeFrame,
  ): TypeName | null {
    if (!(node.calling instanceof Identifier)) {
      this.reportError(
        DiagnosticCode.UNSUPPORTED,
        { message: "only direct function calls are supported by the type checker" },
        node.calling.range,
      );
      return null;
    }

    const fnName = node.calling.data;
    const fn = this.functions.get(fnName);
    if (!fn) {
      this.reportError(
        DiagnosticCode.UNKNOWN_IDENTIFIER,
        { name: fnName },
        node.calling.range,
      );
      return null;
    }

    if (node.parameters.length !== fn.paramTypes.length) {
      this.reportError(
        DiagnosticCode.UNSUPPORTED,
        {
          message:
            `function '${fnName}' expects ${fn.paramTypes.length} argument(s)` +
            ` but got ${node.parameters.length}`,
        },
        node.range,
      );
    }

    const checkCount = Math.min(node.parameters.length, fn.paramTypes.length);
    for (let i = 0; i < checkCount; i++) {
      const argType = this.inferExpressionType(node.parameters[i], scope);
      const expected = fn.paramTypes[i];
      if (!argType) continue;
      if (!this.isAssignable(argType, expected)) {
        this.reportError(
          DiagnosticCode.TYPE_MISMATCH,
          { actual: argType, expected },
          node.parameters[i].range,
        );
      }
    }

    return fn.returnType;
  }

  private inferBinaryExpression(
    node: BinaryExpression,
    scope: ScopeFrame,
  ): TypeName | null {
    const leftType = this.inferExpressionType(node.left, scope);
    const rightType = this.inferExpressionType(node.right, scope);

    if (isAssignmentOp(node.operand)) {
      if (!(node.left instanceof Identifier)) {
        this.reportError(
          DiagnosticCode.UNSUPPORTED,
          { message: "left side of assignment must be an identifier" },
          node.left.range,
        );
        return leftType;
      }

      const variable = this.resolveVariable(scope, node.left.data);
      if (!variable) {
        this.reportError(
          DiagnosticCode.UNKNOWN_IDENTIFIER,
          { name: node.left.data },
          node.left.range,
        );
        return leftType;
      }

      if (!variable.mutable) {
        this.reportError(
          DiagnosticCode.UNSUPPORTED,
          { message: `cannot assign to immutable variable '${variable.name}'` },
          node.left.range,
        );
      }

      if (rightType && !this.isAssignable(rightType, variable.type)) {
        this.reportError(
          DiagnosticCode.TYPE_MISMATCH,
          { actual: rightType, expected: variable.type },
          node.right.range,
        );
      }

      return variable.type;
    }

    if (!leftType || !rightType) return leftType ?? rightType;

    switch (node.operand) {
      case BinaryOp.Add:
      case BinaryOp.Sub:
      case BinaryOp.Mul:
      case BinaryOp.Div:
      case BinaryOp.Mod: {
        this.requireNumericOperand(leftType, node.left.range, node);
        this.requireNumericOperand(rightType, node.right.range, node);
        if (!this.areComparableNumeric(leftType, rightType)) {
          this.reportError(
            DiagnosticCode.TYPE_MISMATCH,
            { actual: rightType, expected: leftType },
            node.right.range,
          );
        }
        return leftType;
      }

      case BinaryOp.Eq:
      case BinaryOp.NotEq:
      case BinaryOp.Lt:
      case BinaryOp.LtEq:
      case BinaryOp.Gt:
      case BinaryOp.GtEq: {
        if (!this.isAssignable(rightType, leftType)) {
          this.reportError(
            DiagnosticCode.TYPE_MISMATCH,
            { actual: rightType, expected: leftType },
            node.right.range,
          );
        }
        return "bool";
      }

      case BinaryOp.And:
      case BinaryOp.Or: {
        if (!this.isAssignable(leftType, "bool")) {
          this.reportError(
            DiagnosticCode.TYPE_MISMATCH,
            { actual: leftType, expected: "bool" },
            node.left.range,
          );
        }
        if (!this.isAssignable(rightType, "bool")) {
          this.reportError(
            DiagnosticCode.TYPE_MISMATCH,
            { actual: rightType, expected: "bool" },
            node.right.range,
          );
        }
        return "bool";
      }

      case BinaryOp.BitAnd:
      case BinaryOp.BitOr:
      case BinaryOp.BitXor:
      case BinaryOp.ShiftLeft:
      case BinaryOp.ShiftRight: {
        this.requireIntegerOperand(leftType, node.left.range, node);
        this.requireIntegerOperand(rightType, node.right.range, node);
        if (!this.areComparableNumeric(leftType, rightType)) {
          this.reportError(
            DiagnosticCode.TYPE_MISMATCH,
            { actual: rightType, expected: leftType },
            node.right.range,
          );
        }
        return leftType;
      }

      default:
        this.reportError(
          DiagnosticCode.UNSUPPORTED,
          { message: `operator '${BinaryOp[node.operand]}' is not type-checked` },
          node.range,
        );
        return leftType;
    }
  }

  private requireNumericOperand(
    type: TypeName,
    range: Range,
    node: BinaryExpression,
  ): void {
    if (NUMERIC_TYPES.has(type)) return;
    this.reportError(
      DiagnosticCode.UNSUPPORTED,
      {
        message:
          `operator '${BinaryOp[node.operand]}' requires numeric operands` +
          ` but got '${type}'`,
      },
      range,
    );
  }

  private requireIntegerOperand(
    type: TypeName,
    range: Range,
    node: BinaryExpression,
  ): void {
    if (INTEGER_TYPES.has(type)) return;
    this.reportError(
      DiagnosticCode.UNSUPPORTED,
      {
        message:
          `operator '${BinaryOp[node.operand]}' requires integer operands` +
          ` but got '${type}'`,
      },
      range,
    );
  }

  private areComparableNumeric(left: TypeName, right: TypeName): boolean {
    if (!NUMERIC_TYPES.has(left) || !NUMERIC_TYPES.has(right)) return false;
    return left === right;
  }

  private resolveDeclaredType(
    typeNode: { types: string[]; union: boolean } | null,
    context: string,
    range: Range,
  ): TypeName {
    if (!typeNode || typeNode.types.length === 0) return "void";

    const normalized = typeNode.types.map((v) => v.trim()).filter(Boolean);
    if (normalized.length === 0) return "void";

    if (normalized.length > 1 || typeNode.union) {
      return normalized.join(" | ");
    }

    const type = normalized[0];
    if (!this.isKnownType(type)) {
      this.reportError(
        DiagnosticCode.UNSUPPORTED,
        { message: `unknown type '${type}' in ${context}` },
        range,
      );
    }
    return type;
  }

  private isKnownType(type: TypeName): boolean {
    if (type.includes("|")) return splitUnion(type).every((t) => this.isKnownType(t));
    return (
      type === "void" ||
      type === "null" ||
      type === "bool" ||
      type === "string" ||
      NUMERIC_TYPES.has(type)
    );
  }

  private isAssignable(actual: TypeName, expected: TypeName): boolean {
    if (expected === actual) return true;
    if (expected.includes("|")) {
      return splitUnion(expected).includes(actual);
    }
    if (actual.includes("|")) {
      return splitUnion(actual).every((part) => this.isAssignable(part, expected));
    }
    if (expected === "void") return actual === "void";
    if (actual === "null" && expected !== "void") return true;
    return false;
  }

  private defineVariable(scope: ScopeFrame, symbol: VariableSymbol): void {
    if (scope.variables.has(symbol.name)) {
      this.reportError(
        DiagnosticCode.UNSUPPORTED,
        { message: `duplicate local declaration '${symbol.name}'` },
        symbol.range,
      );
      return;
    }
    scope.variables.set(symbol.name, symbol);
  }

  private resolveVariable(
    scope: ScopeFrame,
    name: string,
  ): VariableSymbol | null {
    let cursor: ScopeFrame | null = scope;
    while (cursor) {
      const symbol = cursor.variables.get(name);
      if (symbol) return symbol;
      cursor = cursor.parent;
    }
    return null;
  }

  private makeScope(parent: ScopeFrame | null): ScopeFrame {
    return {
      parent,
      variables: new Map<string, VariableSymbol>(),
    };
  }
}
