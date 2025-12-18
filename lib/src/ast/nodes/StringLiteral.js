"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringLiteral = void 0;
const Expression_js_1 = require("./Expression.js");
class StringLiteral extends Expression_js_1.Expression {
  constructor(data, range) {
    super();
    this.nameOf = "StringLiteral";
    this.data = data;
    this.range = range;
  }
}
exports.StringLiteral = StringLiteral;
