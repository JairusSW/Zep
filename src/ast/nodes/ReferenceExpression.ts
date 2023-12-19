import { Expression } from "./Expression";
import { Statement } from "./Statement";

export class ReferenceExpression extends Expression {
  public nameOf: string = "ReferenceExpression";
  constructor(public referencing: Statement) {
    super();
  }
}
