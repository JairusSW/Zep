"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumElement = void 0;
const Statement_js_1 = require("./Statement.js");
class EnumElement extends Statement_js_1.Statement {
    constructor(name, value, range) {
        super();
        this.nameOf = "EnumElement";
        this.name = name;
        this.value = value;
        this.range = range;
    }
}
exports.EnumElement = EnumElement;
