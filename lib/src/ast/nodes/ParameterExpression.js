"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParameterExpression = void 0;
const Statement_js_1 = require("./Statement.js");
class ParameterExpression extends Statement_js_1.Statement {
  constructor(name, type, range) {
    super();
    this.nameOf = "ParameterExpression";
    this.name = name;
    this.type = type;
    this.range = range;
  }
}
exports.ParameterExpression = ParameterExpression;
