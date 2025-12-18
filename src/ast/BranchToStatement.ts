import { Range } from "../range.js";
import { Identifier } from "./Identifier.js";
import { NodeKind } from "./Node.js";
import { Statement } from "./Statement.js";

export class BranchToStatement extends Statement {
  public to: Identifier;
  constructor(to: Identifier, range: Range) {
    super(NodeKind.BranchToStatement);
    this.to = to;
    this.range = range;
  }
}
