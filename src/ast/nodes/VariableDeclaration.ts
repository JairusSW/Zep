import { Range } from "../Range.js";
import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class VariableDeclaration extends Statement {
  public nameOf: string = "VariableDeclaration";
  public value: Expression;
  public name: Identifier;
  public type: TypeExpression;
  public mutable: boolean;
  constructor(
    value: Expression,
    name: Identifier,
    type: TypeExpression,
    mutable: boolean,
    range: Range,
  ) {
    super();
    this.value = value;
    this.name = name;
    this.type = type;
    this.mutable = mutable;
    this.range = range;
  }
}
