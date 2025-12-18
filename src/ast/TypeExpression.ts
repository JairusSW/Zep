import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";

export class TypeExpression extends Expression {
  public nameOf: string = "TypeExpression";
  public types: string[];
  public union: boolean;
  constructor(types: string[], union: boolean, range: Range) {
    super(NodeKind.TypeExpression);
    this.types = types;
    this.union = union;
    this.range = range;
  }
}
