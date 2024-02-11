import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";

export class BranchToStatement extends Statement {
  public nameOf: string = "BranchStatement";
  public to: Identifier;
  constructor(to: Identifier) {
    super();
    this.to = to;
  }
}