"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableDeclaration = void 0;
const Statement_js_1 = require("./Statement.js");
class VariableDeclaration extends Statement_js_1.Statement {
  constructor(value, name, type, mutable, range) {
    super();
    this.nameOf = "VariableDeclaration";
    this.value = value;
    this.name = name;
    this.type = type;
    this.mutable = mutable;
    this.range = range;
  }
}
exports.VariableDeclaration = VariableDeclaration;
