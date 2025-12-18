import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { NodeKind } from "./Node.js";
import { Statement } from "./Statement.js";

export class PropertyAccessExpression extends Statement {
  public nameOf: string = "PropertyAccessExpression";
  public expression: Expression;
  public property: Identifier;
  constructor(expression: Expression, property: Identifier, range: Range) {
    super(NodeKind.PropertyAccessExpression);
    this.expression = expression;
    this.property = property;
    this.range = range;
  }
}
