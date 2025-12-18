"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberLiteral = void 0;
const Expression_js_1 = require("./Expression.js");
class NumberLiteral extends Expression_js_1.Expression {
  constructor(data, range) {
    super();
    this.nameOf = "NumberLiteral";
    this.data = data;
    this.range = range;
  }
}
exports.NumberLiteral = NumberLiteral;
