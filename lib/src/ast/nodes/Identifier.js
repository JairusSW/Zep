"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Identifier = void 0;
const Expression_js_1 = require("./Expression.js");
class Identifier extends Expression_js_1.Expression {
    constructor(value, range) {
        super();
        this.nameOf = "Identifier";
        this.data = value;
    }
}
exports.Identifier = Identifier;
