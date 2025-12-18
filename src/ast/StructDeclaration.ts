import { Range } from "../range";
import { AttributeExpression } from "./AttributeExpression";
import { Identifier } from "./Identifier";
import { NodeKind } from "./Node";
import { Statement } from "./Statement";
import { StructFieldDeclaration } from "./StructFieldDeclaration";

export class StructDeclaration extends Statement {
  public nameOf = "StructDeclaration";
  public attributes: AttributeExpression[];
  public name: Identifier;
  public fields: StructFieldDeclaration[];
  constructor(
    attributes: AttributeExpression[],
    name: Identifier,
    fields: StructFieldDeclaration[],
    range: Range,
  ) {
    super(NodeKind.StructDeclaration);
    this.attributes = attributes;
    this.name = name;
    this.fields = fields;
    this.range = range;
  }
}
