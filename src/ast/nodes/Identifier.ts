import { Range } from "../Range.js";
import { Expression } from "./Expression.js";

export class Identifier extends Expression {
  public nameOf: string = "Identifier";
  public data: string;
  constructor(value: string, range: Range) {
    super();
    this.data = value;
  }
}
