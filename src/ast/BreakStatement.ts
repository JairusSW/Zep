import { Range } from "../range";
import { NodeKind } from "./Node";
import { Statement } from "./Statement.js";

export class BreakStatement extends Statement {
  constructor(range: Range) {
    super(NodeKind.BreakStatement);
    this.range = range;
  }
}
