import { Range } from "../range.js";
import { Identifier } from "./Identifier.js";
import { NodeKind } from "./Node.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class ParameterExpression extends Statement {
  public nameOf: string = "ParameterExpression";
  public name: Identifier;
  public type: TypeExpression | null;
  constructor(name: Identifier, type: TypeExpression | null, range: Range) {
    super(NodeKind.ParameterExpression);
    this.name = name;
    this.type = type;
    this.range = range;
  }
}
