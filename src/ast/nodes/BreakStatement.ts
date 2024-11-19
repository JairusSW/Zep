import { Range } from "../Range";
import { Statement } from "./Statement.js";

export class BreakStatement extends Statement {
  public nameOf: string = "BreakStatement";
  constructor(range: Range) {
    super();
    this.range = range;
  }
}