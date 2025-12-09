import { Range } from "../Range.js";
import { Expression } from "./Expression.js";
import { TypeExpression } from "./TypeExpression.js";

export class NumberLiteral extends Expression {
  public nameOf: string = "NumberLiteral";
  public data: string;
  public type: TypeExpression | null;
  constructor(data: string, type: TypeExpression | null, range: Range) {
    super();
    this.data = data;
    this.type = type;
    this.range = range;
  }
}
