import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class ReturnStatement extends Statement {
  public nameOf: string = "ReturnStatement";
  constructor(public returning: Expression) {
    super();
  }
}
