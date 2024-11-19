import { Range } from "../Range";
import { Statement } from "./Statement.js";

export class ContinueStatement extends Statement {
  public nameOf: string = "ContinueStatement";
  constructor(range: Range) {
    super();
    this.range = range;
  }
}