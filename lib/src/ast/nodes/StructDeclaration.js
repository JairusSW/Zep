"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructDeclaration = void 0;
const Statement_1 = require("./Statement");
class StructDeclaration extends Statement_1.Statement {
    constructor(name, members, range) {
        super();
        this.nameOf = "StructDeclaration";
        this.name = name;
        this.members = members;
        this.range = range;
    }
}
exports.StructDeclaration = StructDeclaration;
