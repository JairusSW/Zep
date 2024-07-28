import { Range } from "../Range.js";
import { Expression } from "./Expression.js";

export class StringLiteral extends Expression {
  public nameOf: string = "StringLiteral";
  public data: string;
  constructor(data: string, range: Range) {
    super();
    this.data = data;
    this.range = range;
  }
}
