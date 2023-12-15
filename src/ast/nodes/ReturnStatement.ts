import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class ReturnStatement extends Statement {
  constructor(public returning: Expression) {
    super();
  }
}
