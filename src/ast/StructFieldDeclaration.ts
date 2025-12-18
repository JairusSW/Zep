import { Range } from "../range";
import { AttributeExpression } from "./AttributeExpression";
import { Expression } from "./Expression";
import { Identifier } from "./Identifier";
import { NodeKind } from "./Node";
import { TypeExpression } from "./TypeExpression";

export class StructFieldDeclaration extends Expression {
  public nameOf = "StructFieldExpression";
  public attributes: AttributeExpression[];
  public name: Identifier;
  public access: FieldAccessKind;
  public type: TypeExpression;
  public value: Expression | null;
  constructor(
    attributes: AttributeExpression[],
    name: Identifier,
    type: TypeExpression,
    access: FieldAccessKind = FieldAccessKind.Private,
    value: Expression | null,
    range: Range,
  ) {
    super(NodeKind.StructFieldDeclaration);
    this.attributes = attributes;
    this.name = name;
    this.type = type;
    this.access = access;
    this.value = value;
    this.range = range;
  }
}

export enum FieldAccessKind {
  Public,
  Private,
  Final,
}
