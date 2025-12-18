import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";
import { TypeExpression } from "./TypeExpression.js";

export class NumberLiteral extends Expression {
  public nameOf: string = "NumberLiteral";
  public data: string;
  public type: TypeExpression | null;
  constructor(data: string, type: TypeExpression | null, range: Range) {
    super(NodeKind.NumberLiteral);
    this.data = data;
    this.type = type;
    this.range = range;
  }
}
