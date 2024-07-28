import { Range } from "../Range.js";
import { BlockExpression } from "./BlockExpression.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";

export class BranchStatement extends Statement {
  public nameOf: string = "BranchStatement";
  public name: Identifier;
  public block: BlockExpression;
  constructor(name: Identifier, block: BlockExpression, range: Range) {
    super();
    this.name = name;
    this.block = block;
    this.range = range;
  }
}
