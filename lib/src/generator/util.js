"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDataType = toDataType;
exports.toNumericType = toNumericType;
exports.getTypeOf = getTypeOf;
exports.getNameOf = getNameOf;
exports.writeLength = writeLength;
const ReferenceExpression_1 = require("../ast/nodes/ReferenceExpression");
const ParameterExpression_1 = require("../ast/nodes/ParameterExpression");
const VariableDeclaration_1 = require("../ast/nodes/VariableDeclaration");
function toDataType(type) {
    switch (type) {
        case "i32":
        case "i64":
        case "f32":
        case "f64":
            return type;
        case "void":
            return "void";
        default:
            throw new Error(`Could not convert type '${type}' to wasm data type!`);
    }
}
function toNumericType(type) {
    switch (type) {
        case "i32":
        case "i64":
        case "f32":
        case "f64":
            return type;
        default:
            throw new Error(`Could not convert type '${type}' to wasm numeric type!`);
    }
}
function getTypeOf(node) {
    var _a;
    if (node instanceof ReferenceExpression_1.ReferenceExpression) {
        return getTypeOf(node.referencing);
    }
    else if (node instanceof ParameterExpression_1.ParameterExpression) {
        return toNumericType((_a = node.type) === null || _a === void 0 ? void 0 : _a.types[0]);
    }
    else if (node instanceof VariableDeclaration_1.VariableDeclaration) {
        return toNumericType(node.type.types[0]);
    }
    else {
        throw new Error(`Could not discern the type of expression`);
    }
}
function getNameOf(node) {
    if (node instanceof ReferenceExpression_1.ReferenceExpression) {
        return getNameOf(node.referencing);
    }
    else if (node instanceof ParameterExpression_1.ParameterExpression) {
        return node.name.data;
    }
    else if (node instanceof VariableDeclaration_1.VariableDeclaration) {
        return node.name.data;
    }
    else {
        throw new Error(`Could not discern the type of expression`);
    }
}
// shitty af
function writeLength(value) {
    const high = (value >> 8) & 0xff;
    const low = value & 0xff;
    const highString = high > 9 ? high.toString() : high.toString().padStart(2, "0");
    const lowString = low > 9 ? low.toString() : low.toString().padStart(2, "0");
    return `\\${lowString}\\${highString}`;
}
