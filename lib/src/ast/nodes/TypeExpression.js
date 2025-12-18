"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeExpression = void 0;
const Expression_js_1 = require("./Expression.js");
class TypeExpression extends Expression_js_1.Expression {
  constructor(types, union = false, range) {
    super();
    this.nameOf = "TypeExpression";
    this.types = types;
    this.union = union;
    this.range = range;
  }
}
exports.TypeExpression = TypeExpression;
