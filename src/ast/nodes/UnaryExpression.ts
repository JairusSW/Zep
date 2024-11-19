import { Range } from "../Range.js";
import { Operator } from "./BinaryExpression.js";
import { Expression } from "./Expression.js";

export class UnaryExpression extends Expression {
  public nameOf: string = "UnaryExpression";
  public operator: Operator;
  public operand: Expression;
  constructor(operator: Operator, operand: Expression, range: Range) {
    super();
    this.operator = operator;
    this.operand = operand;
    this.range = range;
  }
}