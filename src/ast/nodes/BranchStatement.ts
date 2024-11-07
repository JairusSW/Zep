import { Range } from "../Range.js";
import { Node } from "./Node.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";

export class BranchStatement extends Statement {
  public nameOf: string = "BranchStatement";
  public name: Identifier;
  public block: Node;
  constructor(name: Identifier, block: Node, range: Range) {
    super();
    this.name = name;
    this.block = block;
    this.range = range;
  }
}
