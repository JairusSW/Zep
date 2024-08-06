"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntaxError = exports.TokenMismatchError = exports.CompileTimeError = exports.ErrorTypes = void 0;
const chalk_1 = __importDefault(require("chalk"));
var ErrorTypes;
(function (ErrorTypes) {
    ErrorTypes[ErrorTypes["TokenMismatch"] = 0] = "TokenMismatch";
    ErrorTypes[ErrorTypes["TypeError"] = 1] = "TypeError";
    ErrorTypes[ErrorTypes["SyntaxError"] = 2] = "SyntaxError";
})(ErrorTypes || (exports.ErrorTypes = ErrorTypes = {}));
class CompileTimeError {
    constructor(message, type, code) {
        this.message = message;
        this.type = type;
        this.code = code;
    }
}
exports.CompileTimeError = CompileTimeError;
class TokenMismatchError extends CompileTimeError {
    constructor(message, code, range) {
        super(message, ErrorTypes.TokenMismatch, code);
        this.range = range;
        console.log(chalk_1.default.bgRed("Error") + chalk_1.default.grey(":") + " " + message);
        console.log(" " +
            chalk_1.default.cyan("test.zp") +
            chalk_1.default.gray(":") +
            chalk_1.default.cyan(this.range.line) +
            chalk_1.default.gray(":") +
            chalk_1.default.cyan(this.range.start));
    }
}
exports.TokenMismatchError = TokenMismatchError;
class SyntaxError extends CompileTimeError {
    constructor(program, prefix, message, code, range, action) {
        super(message, ErrorTypes.SyntaxError, code);
        this.range = range;
        let color;
        if (action === "FAIL") {
            color = chalk_1.default.bold.red;
        }
        else if (action === "WARN") {
            color = chalk_1.default.bold.yellowBright;
        }
        else {
            color = chalk_1.default.bold.blue;
        }
        console.log(color(prefix) + chalk_1.default.grey(":") + " " + message);
        console.log(" " +
            chalk_1.default.cyan("test.zp") +
            chalk_1.default.gray(":") +
            chalk_1.default.cyan(this.range.line) +
            chalk_1.default.gray(":") +
            chalk_1.default.cyan(this.range.start));
        if (action === "FAIL")
            process.exit(0);
    }
}
exports.SyntaxError = SyntaxError;
