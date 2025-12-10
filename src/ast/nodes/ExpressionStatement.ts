import { Range } from "../Range";
import { Expression } from "./Expression";
import { Statement } from "./Statement";

export class ExpressionStatement extends Statement {
  public nameOf: string = "ExpressionStatement";
  public expression: Expression;

  constructor(expression: Expression) {
    super();
    this.expression = expression;
    this.range = this.expression.range;
  }
}
