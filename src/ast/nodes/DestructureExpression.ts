import { Range } from "../Range.js";
import { Expression } from "./Expression.js";

export class DestructureExpression extends Expression {
  public nameOf: string = "DestructureExpression";
  public elements: Expression[] = [];
  constructor(elements: Expression[], range: Range) {
    super();
    this.elements = elements;
    this.range = range;
  }
}