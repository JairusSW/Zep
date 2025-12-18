import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { NodeKind } from "./Node.js";

export class AttributeExpression extends Expression {
  public readonly nameOf: string = "AttributeExpression";

  public tag: Identifier;

  public args: Record<string, string>;

  constructor(tag: Identifier, args: Record<string, string>, range: Range) {
    super(NodeKind.AttributeExpression);
    this.tag = tag;
    this.args = args;
    this.range = range;
  }
}
