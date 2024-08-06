"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockExpression = void 0;
const Expression_js_1 = require("./Expression.js");
class BlockExpression extends Expression_js_1.Expression {
    constructor(statements, scope, range) {
        super();
        this.nameOf = "BlockExpression";
        this.statements = statements;
        this.scope = scope;
        this.range = range;
    }
}
exports.BlockExpression = BlockExpression;
