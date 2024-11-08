import { Range } from "../Range";
import { Expression } from "./Expression";
import { Identifier } from "./Identifier";
import { TypeExpression } from "./TypeExpression";

export class StructFieldDeclaration extends Expression {
    public nameOf = "StructFieldExpression";
    public name: Identifier;
    public access: FieldAccessKind;
    public type: TypeExpression;
    public value: Expression | null;
    constructor(name: Identifier, type: TypeExpression, access: FieldAccessKind = FieldAccessKind.Private, value: Expression | null, range: Range) {
        super();
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
    Final
}