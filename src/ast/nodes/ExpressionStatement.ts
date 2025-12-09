import { Range } from "../Range";
import { Expression } from "./Expression";
import { Statement } from "./Statement";

export class ExpressionStatement extends Statement {
  public nameOf: string = "ExpressionStatement";
  public expression: Expression;

  constructor(expression: Expression, range: Range) {
    super();
    this.expression = expression;
    this.range = range;
  }
}
