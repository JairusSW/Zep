"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoStatement = void 0;
const Statement_js_1 = require("./Statement.js");
class DoStatement extends Statement_js_1.Statement {
  constructor(condition, block, range) {
    super();
    this.nameOf = "DoStatement";
    this.condition = condition;
    this.block = block;
    this.range = range;
  }
}
exports.DoStatement = DoStatement;
