"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
const Scope_js_1 = require("../checker/scope/Scope.js");
class Source {
    constructor(name, statements = null, topLevelStatements = null) {
        this.name = name;
        this.topLevelStatements = [];
        this.statements = [];
        this.globalScope = new Scope_js_1.Scope();
        if (statements)
            this.statements = statements;
    }
}
exports.Source = Source;
