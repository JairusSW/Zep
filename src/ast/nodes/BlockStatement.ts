import { Scope } from "../../checker/scope/Scope.js";
import { Range } from "../Range.js";
import { Statement } from "./Statement.js";

export class BlockExpression extends Statement {
  public nameOf: string = "BlockStatement";
  public statements: Statement[];
  public scope: Scope;
  constructor(statements: Statement[], scope: Scope, range: Range) {
    super();
    this.statements = statements;
    this.scope = scope;
    this.range = range;
  }
}
