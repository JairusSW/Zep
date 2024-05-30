import { Expression } from "./Expression";
import { Statement } from "./Statement";

export class ReferenceExpression extends Expression {
  public nameOf: string = "ReferenceExpression";
  constructor(public name: string, public referencing: Statement) {
    super();
  }
}
