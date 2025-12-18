import { Range } from "../range.js";
import { AttributeExpression } from "./AttributeExpression.js";
import { Identifier } from "./Identifier.js";
import { NodeKind } from "./Node.js";
import { NumberLiteral } from "./NumberLiteral.js";
import { Statement } from "./Statement.js";
import { StringLiteral } from "./StringLiteral.js";

export class EnumFieldDeclaration extends Statement {
  public attributes: AttributeExpression[];
  public name: Identifier;
  public value: NumberLiteral | StringLiteral;
  constructor(
    attributes: AttributeExpression[],
    name: Identifier,
    value: NumberLiteral | StringLiteral,
    range: Range,
  ) {
    super(NodeKind.EnumFieldDeclaration);
    this.attributes = attributes;
    this.name = name;
    this.value = value;
    this.range = range;
  }
}
