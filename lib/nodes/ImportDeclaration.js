import { Statement } from "./Statement.js";
export class ImportDeclaration extends Statement {
    constructor(path) {
        super();
        this.path = path;
    }
}
