"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operator = exports.BinaryExpression = void 0;
const Expression_js_1 = require("./Expression.js");
class BinaryExpression extends Expression_js_1.Expression {
  constructor(left, operand, right, range) {
    super();
    this.nameOf = "BinaryExpression";
    this.left = left;
    this.operand = operand;
    this.right = right;
    this.range = range;
  }
}
exports.BinaryExpression = BinaryExpression;
var Operator;
(function (Operator) {
  Operator["Add"] = "+";
  Operator["Sub"] = "-";
  Operator["Assign"] = "=";
  Operator["Mod"] = "%";
})(Operator || (exports.Operator = Operator = {}));
