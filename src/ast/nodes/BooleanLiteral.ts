import { Range } from "../Range.js";
import { Expression } from "./Expression.js";

export class BooleanLiteral extends Expression {
  public nameOf: string = "BooleanLiteral";
  public value: boolean;
  constructor(value: boolean, range: Range) {
    super();
    this.value = value;
    this.range = range;
  }
}
