import { Range } from "../range.js";
import { BinaryOp } from "./BinaryExpression.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";

export class UnaryExpression extends Expression {
  public nameOf: string = "UnaryExpression";
  public operator: BinaryOp;
  public operand: Expression;
  constructor(operator: BinaryOp, operand: Expression, range: Range) {
    super(NodeKind.UnaryExpression);
    this.operator = operator;
    this.operand = operand;
    this.range = range;
  }
}
