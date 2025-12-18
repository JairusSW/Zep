import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { NodeKind } from "./Node.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class VariableDeclaration extends Statement {
  public nameOf: string = "VariableDeclaration";
  public value: Expression | null;
  public name: Identifier;
  public type: TypeExpression | null;
  public mutable: boolean;
  constructor(
    name: Identifier,
    value: Expression | null,
    type: TypeExpression | null,
    mutable: boolean,
    range: Range,
  ) {
    super(NodeKind.VariableDeclaration);
    this.name = name;
    this.value = value;
    this.type = type;
    this.mutable = mutable;
    this.range = range;
  }
}
