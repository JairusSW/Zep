"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallExpression = void 0;
const Expression_js_1 = require("./Expression.js");
class CallExpression extends Expression_js_1.Expression {
    constructor(calling, parameters, range) {
        super();
        this.nameOf = "CallExpression";
        this.calling = calling;
        this.parameters = parameters;
        this.range = range;
    }
}
exports.CallExpression = CallExpression;
