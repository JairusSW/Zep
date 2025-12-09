import { Range } from "../Range.js";
import { Expression } from "./Expression.js";

export class TypeExpression extends Expression {
  public nameOf: string = "TypeExpression";
  public types: string[];
  public union: boolean;
  constructor(types: string[], union: boolean, range: Range) {
    super();
    this.types = types;
    this.union = union;
    this.range = range;
  }
}
