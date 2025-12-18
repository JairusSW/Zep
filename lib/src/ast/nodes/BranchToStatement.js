"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchToStatement = void 0;
const Statement_js_1 = require("./Statement.js");
class BranchToStatement extends Statement_js_1.Statement {
  constructor(to, range) {
    super();
    this.nameOf = "BranchStatement";
    this.to = to;
    this.range = range;
  }
}
exports.BranchToStatement = BranchToStatement;
