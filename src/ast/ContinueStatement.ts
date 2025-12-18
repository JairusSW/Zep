import { Range } from "../range";
import { NodeKind } from "./Node";
import { Statement } from "./Statement.js";

export class ContinueStatement extends Statement {
  constructor(range: Range) {
    super(NodeKind.ContinueStatement);
    this.range = range;
  }
}
