"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionDeclaration = void 0;
const Statement_js_1 = require("./Statement.js");
class FunctionDeclaration extends Statement_js_1.Statement {
  constructor(name, parameters, returnType, block, scope, exported, range) {
    super();
    this.nameOf = "FunctionDeclaration";
    this.name = name;
    this.parameters = parameters;
    this.returnType = returnType;
    this.block = block;
    this.scope = scope;
    this.exported = exported;
    for (const param of this.parameters) {
      this.scope.add(param.name.data, param);
    }
    this.range = range;
  }
}
exports.FunctionDeclaration = FunctionDeclaration;
