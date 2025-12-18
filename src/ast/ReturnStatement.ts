import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";
import { Statement } from "./Statement.js";

export class ReturnStatement extends Statement {
  public nameOf: string = "ReturnStatement";
  public returning: Expression;
  constructor(returning: Expression, range: Range) {
    super(NodeKind.ReturnStatement);
    this.returning = returning;
    this.range = range;
  }
}
