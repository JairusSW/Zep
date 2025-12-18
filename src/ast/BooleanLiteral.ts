import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";

export class BooleanLiteral extends Expression {
  public value: boolean;
  constructor(value: boolean, range: Range) {
    super(NodeKind.BooleanLiteral);
    this.value = value;
    this.range = range;
  }
}
