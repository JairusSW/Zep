import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";

export class Identifier extends Expression {
  public nameOf: string = "Identifier";
  public data: string;
  constructor(value: string, range: Range) {
    super(NodeKind.IdentifierExpression);
    this.data = value;
    this.range = range;
  }
}
