import { Range } from "../Range.js";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class BinaryExpression extends Expression {
  public nameOf: string = "BinaryExpression";
  public left: Expression | Statement;
  public operand: Operator;
  public right: Expression | Statement;
  constructor(
    left: Expression | Statement,
    operand: Operator,
    right: Expression | Statement,
    range: Range,
  ) {
    super();
    this.left = left;
    this.operand = operand;
    this.right = right;
    this.range = range;
  }
}

export enum Operator {
  Add = "+",
  Sub = "-",
  Mul = "*",
  Mod = "%",
  Equals = "=",
  EqualsEquals = "==",
  EqualsEqualsEquals = "===",
}
