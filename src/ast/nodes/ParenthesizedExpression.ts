import { Range } from "../Range";
import { Expression } from "./Expression";

export class ParenthesizedExpression extends Expression {
  public nameOf = "ParenthesizedExpression";
  public expression: Expression;
  constructor(expression: Expression, range: Range) {
    super();
    this.expression = expression;
    this.range = range;
  }
}
