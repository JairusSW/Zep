import { Range } from "../Range";
import { Node } from "./Node";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class IfStatement extends Statement {
  public nameOf: string = "IfStatement";
  public condition: Expression;
  public body: Node;
  constructor(condition: Expression, block: Node, range: Range) {
    super();
    this.condition = condition;
    this.body = block;
    this.range = range;
  }
}
