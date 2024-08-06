"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionImport = void 0;
const Statement_js_1 = require("./Statement.js");
class FunctionImport extends Statement_js_1.Statement {
    constructor(path, name, parameters, returnType, exported, range) {
        super();
        this.nameOf = "FunctionImport";
        this.path = path;
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.exported = exported;
        this.range = range;
    }
}
exports.FunctionImport = FunctionImport;
