import { Scope } from "../../checker/scope/Scope.js";
import { Range } from "../Range.js";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class BlockExpression extends Expression {
  public nameOf: string = "BlockExpression";
  public statements: Statement[];
  public scope: Scope;
  constructor(statements: Statement[], scope: Scope, range: Range) {
    super();
    this.statements = statements;
    this.scope = scope;
    this.range = range;
  }
}
