"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = void 0;
class Scope {
    constructor(parentScope = null) {
        this.parentScope = parentScope;
        this.nodes = new Map();
    }
    add(name, node) {
        if (this.nodes.has(name)) {
            return false;
        }
        else {
            this.nodes.set(name, node);
            return true;
        }
    }
    has(name) {
        var _a;
        return this.nodes.has(name) || ((_a = this.parentScope) === null || _a === void 0 ? void 0 : _a.has(name)) || false;
    }
    get(name) {
        var _a;
        return this.nodes.get(name) || ((_a = this.parentScope) === null || _a === void 0 ? void 0 : _a.get(name)) || null;
    }
}
exports.Scope = Scope;
