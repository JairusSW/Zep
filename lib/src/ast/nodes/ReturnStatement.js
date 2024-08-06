"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnStatement = void 0;
const Statement_js_1 = require("./Statement.js");
class ReturnStatement extends Statement_js_1.Statement {
    constructor(returning, range) {
        super();
        this.nameOf = "ReturnStatement";
        this.returning = returning;
        this.range = range;
    }
}
exports.ReturnStatement = ReturnStatement;
