import { Range } from "../Range.js";
import { Expression } from "./Expression.js";

export class NumberLiteral extends Expression {
  public nameOf: string = "NumberLiteral";
  public data: string;
  constructor(data: string, range: Range) {
    super();
    this.data = data;
    this.range = range;
  }
}
