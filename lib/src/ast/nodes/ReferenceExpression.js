"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceExpression = void 0;
const Expression_1 = require("./Expression");
class ReferenceExpression extends Expression_1.Expression {
    constructor(name, referencing, range) {
        super();
        this.nameOf = "ReferenceExpression";
        this.name = name;
        this.referencing = referencing;
        this.range = range;
    }
}
exports.ReferenceExpression = ReferenceExpression;
