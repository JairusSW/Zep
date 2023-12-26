import { BlockExpression } from "./BlockExpression";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class LoopStatement extends Statement {
  public nameOf: string = "LoopStatement";
  public condition: Expression;
  public block: BlockExpression;
  constructor(condition: Expression, block: BlockExpression) {
    super();
    this.condition = condition;
    this.block = block;
  }
}