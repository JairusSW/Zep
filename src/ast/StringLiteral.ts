import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";

export class StringLiteral extends Expression {
  public nameOf: string = "StringLiteral";
  public data: string;
  constructor(data: string, range: Range) {
    super(NodeKind.StringLiteral);
    this.data = data;
    this.range = range;
  }
}
