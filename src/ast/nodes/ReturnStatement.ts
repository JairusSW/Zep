import { Range } from "../Range.js";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class ReturnStatement extends Statement {
  public nameOf: string = "ReturnStatement";
  public returning: Expression;
  constructor(returning: Expression, range: Range) {
    super();
    this.returning = returning;
    this.range = range;
  }
}
