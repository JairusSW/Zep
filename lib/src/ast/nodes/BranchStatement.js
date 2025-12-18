"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchStatement = void 0;
const Statement_js_1 = require("./Statement.js");
class BranchStatement extends Statement_js_1.Statement {
  constructor(name, block, range) {
    super();
    this.nameOf = "BranchStatement";
    this.name = name;
    this.block = block;
    this.range = range;
  }
}
exports.BranchStatement = BranchStatement;
