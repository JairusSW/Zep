import { isString } from "../src/util/types/checkers.js";
import { Statement } from "./Statement.js";
export class ImportDeclaration extends Statement {
    constructor(path) {
        super();
        this.path = path;
    }
}
ImportDeclaration.match = [
    (tok) => tok.text === "import",
    isString
];
