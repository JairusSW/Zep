import { BlockExpression } from "./BlockExpression";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class IfStatement extends Statement {
  public nameOf: string = "IfStatement";
  public condition: Expression;
  public block: BlockExpression;
  constructor(condition: Expression, block: BlockExpression) {
    super();
    this.condition = condition;
    this.block = block;
  }
}