import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";

export class TupleExpression extends Expression {
  public nameOf: string = "TupleExpression";
  public elements: Expression[] = [];
  constructor(elements: Expression[], range: Range) {
    super(NodeKind.TupleExpression);
    this.elements = elements;
    this.range = range;
  }
}
