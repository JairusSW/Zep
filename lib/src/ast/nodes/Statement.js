"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statement = void 0;
const Range_1 = require("../Range");
class Statement {
    constructor() {
        this.nameOf = "Statement";
        this.range = new Range_1.Range({
            line: -1,
            column: -1
        }, {
            line: -1,
            column: -1
        });
    }
}
exports.Statement = Statement;
