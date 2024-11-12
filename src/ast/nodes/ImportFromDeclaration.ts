import { Range } from "../Range.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";
import { StringLiteral } from "./StringLiteral.js";

export class ImportFromDeclaration extends Statement {
    public nameOf: string = "ImportFromDeclaration";
    public value: Identifier// | ObjectLiteral | ArrayLiteral;
    public path: StringLiteral;
    constructor(value: Identifier, path: StringLiteral, range: Range) {
        super();
        this.value = value;
        this.path = path;
        this.range = range;
    }
}
