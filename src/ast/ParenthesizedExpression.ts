import { Range } from "../range";
import { Expression } from "./Expression";
import { NodeKind } from "./Node";

export class ParenthesizedExpression extends Expression {
  public nameOf = "ParenthesizedExpression";
  public expression: Expression;
  constructor(expression: Expression, range: Range) {
    super(NodeKind.ParenthesizedExpression);
    this.expression = expression;
    this.range = range;
  }
}
