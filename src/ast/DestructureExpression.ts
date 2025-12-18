import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";

export class DestructureExpression extends Expression {
  public nameOf: string = "DestructureExpression";
  public elements: Expression[] = [];
  constructor(elements: Expression[], range: Range) {
    super(NodeKind.DestructureExpression);
    this.elements = elements;
    this.range = range;
  }
}
