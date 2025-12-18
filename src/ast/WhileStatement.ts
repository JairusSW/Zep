import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";
import { Statement } from "./Statement.js";

export class WhileStatement extends Statement {
  public nameOf: string = "WhileStatement";
  public condition: Expression;
  public body: Statement;
  constructor(condition: Expression, body: Statement, range: Range) {
    super(NodeKind.WhileStatement);
    this.condition = condition;
    this.body = body;
    this.range = range;
  }
}
