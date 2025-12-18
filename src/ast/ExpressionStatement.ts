import { Expression } from "./Expression";
import { NodeKind } from "./Node";
import { Statement } from "./Statement";

export class ExpressionStatement extends Statement {
  public nameOf: string = "ExpressionStatement";
  public expression: Expression;

  constructor(expression: Expression) {
    super(NodeKind.ExpressionStatement);
    this.expression = expression;
    this.range = this.expression.range;
  }
}
