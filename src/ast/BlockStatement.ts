import { Range } from "../range.js";
import { NodeKind } from "./Node.js";
import { Statement } from "./Statement.js";

export class BlockStatement extends Statement {
  public statements: Statement[];
  constructor(statements: Statement[], range: Range) {
    super(NodeKind.BlockStatement);
    this.statements = statements;
    this.range = range;
  }
}
