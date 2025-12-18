import { Range } from "../range.js";
import { Node, NodeKind } from "./Node.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";

export class BranchStatement extends Statement {
  public name: Identifier;
  public block: Node;
  constructor(name: Identifier, block: Node, range: Range) {
    super(NodeKind.BranchStatement);
    this.name = name;
    this.block = block;
    this.range = range;
  }
}
