"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifierExpression = void 0;
const Expression_js_1 = require("./Expression.js");
class ModifierExpression extends Expression_js_1.Expression {
    constructor(tag, content, range) {
        super();
        this.nameOf = "ModifierExpression";
        this.tag = tag;
        this.content = content;
        this.range = range;
    }
}
exports.ModifierExpression = ModifierExpression;
