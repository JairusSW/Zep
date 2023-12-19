import { Range } from "../Range.js";
import { Expression } from "./Expression.js";

export class Identifier extends Expression {
  public nameOf: string = "Identifier";
  constructor(
    public data: string,
    public range: Range,
  ) {
    super();
  }
}
