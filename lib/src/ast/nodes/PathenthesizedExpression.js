"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParenthesizedExpression = void 0;
const Expression_1 = require("./Expression");
class ParenthesizedExpression extends Expression_1.Expression {
    constructor(expression, range) {
        super();
        this.nameOf = "ParenthesizedExpression";
        this.expression = expression;
        this.range = range;
    }
}
exports.ParenthesizedExpression = ParenthesizedExpression;
