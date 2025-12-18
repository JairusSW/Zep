import { Range } from "../range.js";
import { AttributeExpression } from "./AttributeExpression.js";
import { EnumFieldDeclaration } from "./EnumElement.js";
import { Identifier } from "./Identifier.js";
import { NodeKind } from "./Node.js";
import { Statement } from "./Statement.js";

export class EnumDeclaration extends Statement {
  public nameOf: string = "EnumDeclaration";
  public attributes: AttributeExpression[];
  public name: Identifier;
  public elements: EnumFieldDeclaration[];
  constructor(
    attributes: AttributeExpression[],
    name: Identifier,
    elements: EnumFieldDeclaration[] = [],
    range: Range,
  ) {
    super(NodeKind.EnumDeclaration);
    this.attributes = attributes;
    this.name = name;
    this.elements = elements;
    this.range = range;
  }
}
