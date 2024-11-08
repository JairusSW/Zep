import { Range } from "../Range";
import { Identifier } from "./Identifier";
import { Statement } from "./Statement";
import { StructFieldDeclaration } from "./StructFieldDeclaration";

export class StructDeclaration extends Statement {
    public nameOf = "StructDeclaration";
    public name: Identifier;
    public fields: StructFieldDeclaration[];
    constructor(name: Identifier, fields: StructFieldDeclaration[], range: Range) {
        super();
        this.name = name;
        this.fields = fields;
        this.range = range;
    }
}