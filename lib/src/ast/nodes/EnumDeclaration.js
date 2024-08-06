"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumDeclaration = void 0;
const Statement_js_1 = require("./Statement.js");
class EnumDeclaration extends Statement_js_1.Statement {
    constructor(name, elements = [], range) {
        super();
        this.nameOf = "EnumDeclaration";
        this.name = name;
        this.elements = elements;
        this.range = range;
    }
}
exports.EnumDeclaration = EnumDeclaration;
