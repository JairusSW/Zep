"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructFieldExpression = void 0;
const Expression_1 = require("./Expression");
class StructFieldExpression extends Expression_1.Expression {
  constructor(name, type, value, range) {
    super();
    this.nameOf = "StructFieldExpression";
    this.name = name;
    this.type = type;
    this.value = value;
    this.range = range;
  }
}
exports.StructFieldExpression = StructFieldExpression;
