"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generator = void 0;
const index_1 = require("../../wazum/src/index");
const Function_1 = require("../ast/nodes/Function");
const util_1 = require("./util");
const BinaryExpression_1 = require("../ast/nodes/BinaryExpression");
const ReturnStatement_1 = require("../ast/nodes/ReturnStatement");
const FunctionImport_1 = require("../ast/nodes/FunctionImport");
const CallExpression_1 = require("../ast/nodes/CallExpression");
const NumberLiteral_1 = require("../ast/nodes/NumberLiteral");
const StringLiteral_1 = require("../ast/nodes/StringLiteral");
const BranchStatement_1 = require("../ast/nodes/BranchStatement");
let offset = 0;
class Generator {
  constructor() {
    this.module = new index_1.w.Module();
    this.segments = [];
  }
  parseProgram(program) {
    for (const topStmt of program.topLevelStatements) {
      if (topStmt instanceof FunctionImport_1.FunctionImport) {
        this.parseFnImport(topStmt);
      } else if (topStmt instanceof Function_1.FunctionDeclaration) {
        this.parseFn(topStmt);
      } else {
        throw new Error("Tried to generate unsupported top level node!");
      }
    }
  }
  toWat() {
    return this.module.compile();
  }
  parseFnImport(node) {
    const params = [];
    for (const param of node.parameters) {
      params.push([(0, util_1.getTypeOf)(param), (0, util_1.getNameOf)(param)]);
    }
    const fnImport = index_1.w.funcImport(node.name.data, {
      importPath: node.path.data.split(".")[0],
      importName: node.path.data.split(".")[1],
      params: params,
      returnType: (0, util_1.toDataType)(node.returnType.types[0]),
    });
    this.module.addFuncImport(fnImport);
    return fnImport;
  }
  parseFn(node) {
    const name = node.name.data;
    const params = [];
    const returnType = (0, util_1.toDataType)(node.returnType.types[0]);
    for (const param of node.parameters) {
      const name = (0, util_1.getNameOf)(param);
      const type = (0, util_1.getTypeOf)(param);
      params.push([type, name]);
    }
    let body = [];
    for (const stmt of node.block.statements) {
      if (stmt instanceof CallExpression_1.CallExpression)
        body.push(this.parseCall(stmt));
      else if (stmt instanceof ReturnStatement_1.ReturnStatement)
        body.push(this.parseReturnStatement(stmt));
      else if (stmt instanceof BranchStatement_1.BranchStatement)
        body.push(this.parseBranch(stmt));
      else
        throw new Error(
          "Could not parse body of FunctionDeclaration to wasm equivalent!",
        );
    }
    const fn = index_1.w.func(
      name,
      {
        params: params,
        returnType: returnType,
        locals: [],
      },
      { __nodeType: "block", name: null, body, returnType },
    );
    this.module.addFunc(fn, node.exported);
    return fn;
  }
  parseBranchTo(node) {
    return index_1.w.branch(node.to.data);
  }
  parseBranch(node) {
    return index_1.w.loop(node.name.data, [
      this.parseCall(node.block.statements[0]),
      index_1.w.branch("a"),
    ]);
  }
  parseVariable(node) {
    if (node.value instanceof StringLiteral_1.StringLiteral) {
      const value = this.parseStringLiteral(node.value);
      return index_1.w.local.set(
        "i32",
        node.name.data,
        index_1.w.constant("i32", 0),
      );
    } else {
      const type = (0, util_1.toNumericType)(node.type.types[0]);
      const value = parseFloat(node.value.data);
      return index_1.w.local.set(
        type,
        node.name.data,
        index_1.w.constant(type, value),
      );
    }
  }
  parseReturnStatement(node) {
    if (node.returning instanceof BinaryExpression_1.BinaryExpression) {
      return this.parseBinaryExpression(node.returning);
    } else {
      throw new Error("Could not parse ReturnStatement to wasm equivalent!");
    }
  }
  parseCall(node) {
    const params = [];
    for (const param of node.parameters) {
      if (param instanceof NumberLiteral_1.NumberLiteral) {
        params.push(this.parseNumberLiteral("i32", param));
      }
    }
    return index_1.w.call(node.calling.data, "i32", params);
  }
  parseNumberLiteral(type, node) {
    switch (type) {
      case "i32":
        return index_1.w.constant(type, parseInt(node.data));
      case "i64":
        return index_1.w.constant(type, parseInt(node.data));
      case "f32":
        return index_1.w.constant(type, parseFloat(node.data));
      case "f64":
        return index_1.w.constant(type, parseFloat(node.data));
      default:
        throw new Error("Could not parse NumberLiteral to wasm equivalent!");
    }
  }
  parseStringLiteral(node) {
    const seg = {
      data: "\\0" + node.data.length.toString(16) + node.data,
      offset: index_1.w.constant("i32", offset),
    };
    offset += 1 + node.data.length;
    this.segments.push(seg);
    return seg;
  }
  parseBinaryExpression(node) {
    switch (node.operand) {
      case BinaryExpression_1.Operator.Add: {
        const leftType = (0, util_1.getTypeOf)(node.left);
        const leftName = (0, util_1.getNameOf)(node.left);
        const rightType = (0, util_1.getTypeOf)(node.right);
        const rightName = (0, util_1.getNameOf)(node.right);
        const op = index_1.w.add(
          leftType,
          index_1.w.local.get(leftType, leftName),
          index_1.w.local.get(rightType, rightName),
        );
        return op;
      }
      case BinaryExpression_1.Operator.Sub: {
        const leftType = (0, util_1.getTypeOf)(node.left);
        const leftName = (0, util_1.getNameOf)(node.left);
        const rightType = (0, util_1.getTypeOf)(node.right);
        const rightName = (0, util_1.getNameOf)(node.right);
        const op = index_1.w.sub(
          leftType,
          index_1.w.local.get(leftType, leftName),
          index_1.w.local.get(rightType, rightName),
        );
        return op;
      }
      default:
        throw new Error(
          "Could not convert BinaryExpression to wasm equivalent!",
        );
    }
  }
}
exports.Generator = Generator;
