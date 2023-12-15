import { Expression } from "./Expression";
import { Statement } from "./Statement";

export class ReferenceExpression extends Expression {
  constructor(public referencing: Statement) {
    super();
  }
}
