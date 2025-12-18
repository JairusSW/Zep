"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanLiteral = void 0;
const Expression_js_1 = require("./Expression.js");
class BooleanLiteral extends Expression_js_1.Expression {
  constructor(value, range) {
    super();
    this.nameOf = "BooleanLiteral";
    this.value = value;
    this.range = range;
  }
}
exports.BooleanLiteral = BooleanLiteral;
