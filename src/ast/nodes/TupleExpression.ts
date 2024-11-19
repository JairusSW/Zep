import { Range } from "../Range.js";
import { Expression } from "./Expression.js";

export class TupleExpression extends Expression {
  public nameOf: string = "TupleExpression";
  public elements: Expression[] = [];
  constructor(elements: Expression[], range: Range) {
    super();
    this.elements = elements;
    this.range = range;
  }
}