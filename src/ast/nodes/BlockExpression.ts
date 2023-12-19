import { Scope } from "../../checker/scope/Scope.js";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class BlockExpression extends Expression {
  public nameOf: string = "BlockExpression";
  public scope: Scope = new Scope();
  constructor(public statements: Statement[]) {
    super();
  }
}
