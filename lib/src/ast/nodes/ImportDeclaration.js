"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportDeclaration = void 0;
const Statement_js_1 = require("./Statement.js");
class ImportDeclaration extends Statement_js_1.Statement {
    constructor(path, range) {
        super();
        this.nameOf = "ImportDeclaration";
        this.path = path;
        this.range = range;
    }
}
exports.ImportDeclaration = ImportDeclaration;
