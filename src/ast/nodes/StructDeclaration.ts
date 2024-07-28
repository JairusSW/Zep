import { Range } from "../Range";
import { Identifier } from "./Identifier";
import { Statement } from "./Statement";
import { StructMember } from "./StructMember";

export class StructDeclaration extends Statement {
    public nameOf = "StructDeclaration";
    public name: Identifier;
    public members: StructMember[];
    constructor(name: Identifier, members: StructMember[], range: Range) {
        super();
        this.name = name;
        this.members = members;
        this.range = range;
    }
}