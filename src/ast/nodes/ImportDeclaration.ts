import { Range } from "../Range.js";
import { Statement } from "./Statement.js";
import { StringLiteral } from "./StringLiteral.js";

export class ImportDeclaration extends Statement {
    public nameOf: string = "ImportDeclaration";
    public path: StringLiteral;
    constructor(path: StringLiteral, range: Range) {
        super();
        this.path = path;
        this.range = range;
    }
}
