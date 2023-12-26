import { BlockExpression } from "./BlockExpression";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class DoStatement extends Statement {
  public nameOf: string = "DoStatement";
  public condition: Expression;
  public block: BlockExpression;
  constructor(condition: Expression, block: BlockExpression) {
    super();
    this.condition = condition;
    this.block = block;
  }
}