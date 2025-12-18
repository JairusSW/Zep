"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfStatement = void 0;
const Statement_js_1 = require("./Statement.js");
class IfStatement extends Statement_js_1.Statement {
  constructor(condition, block, range) {
    super();
    this.nameOf = "IfStatement";
    this.condition = condition;
    this.block = block;
    this.range = range;
  }
}
exports.IfStatement = IfStatement;
