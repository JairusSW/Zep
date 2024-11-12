import { w } from "../../wazum/src/index";
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration";
import { getNameOf, getTypeOf, toDataType, toNumericType } from "./util";
import { BinaryExpression, Operator } from "../ast/nodes/BinaryExpression";
import { ReturnStatement } from "../ast/nodes/ReturnStatement";
import { FunctionImportDeclaration } from "../ast/nodes/FunctionImportDeclaration";
import { CallExpression } from "../ast/nodes/CallExpression";
import { NumericDataType } from "../../../wazum/dist/nodes";
import { NumberLiteral } from "../ast/nodes/NumberLiteral";
import { Source } from "../ast/Source";
import { StringLiteral } from "../ast/nodes/StringLiteral";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration";
import { writeLength } from "./util";
import { Instr } from "../../wazum/src/nodes";
import { NoInfer } from "../../wazum/dist/utils";
import { Node } from "../ast/nodes/Node";
import { BranchStatement as BranchStatement } from "../ast/nodes/BranchStatement";
import { BranchToStatement } from "../ast/nodes/BranchToStatement";
import { IfStatement } from "../ast/nodes/IfStatement";

let offset: number = 0;
export class Generator {
  public module: w.Module = new w.Module();
  public segments: w.MemorySegment[] = [];
  constructor() {}
  parseProgram(program: Source): void {
    for (const topStmt of program.topLevelStatements) {
      if (topStmt instanceof FunctionImportDeclaration) {
        this.parseFnImport(topStmt);
      } else if (topStmt instanceof FunctionDeclaration) {
        this.parseFn(topStmt);
      } else {
        throw new Error("Tried to generate unsupported top level node!");
      }
    }
  }

  toWat(): string {
    return this.module.compile();
  }
  parseFnImport(node: FunctionImportDeclaration): w.FuncImport {
    const params: [type: NumericDataType, name: string][] = [];
    for (const param of node.parameters) {
      params.push([getTypeOf(param), getNameOf(param)]);
    }
    const fnImport = w.funcImport(node.name.data, {
      importPath: node.path.data.split(".")[0],
      importName: node.path.data.split(".")[1],
      params: params,
      returnType: toDataType(node.returnType.types[0]),
    });

    this.module.addFuncImport(fnImport);
    return fnImport;
  }
  parseFn(node: FunctionDeclaration): w.Func {
    const name: string = node.name.data;
    const params: [type: w.NumericDataType, name: string][] = [];
    const returnType: w.DataType = toDataType(node.returnType.types[0]);

    for (const param of node.parameters) {
      const name = getNameOf(param);
      const type = getTypeOf(param);
      params.push([type, name]);
    }

    let body: Instr[] = [];
    for (const stmt of node.block.statements) {
      if (stmt instanceof CallExpression) body.push(this.parseCall(stmt));
      else if (stmt instanceof ReturnStatement)
        body.push(this.parseReturnStatement(stmt));
      else if (stmt instanceof BranchStatement)
        body.push(this.parseBranch(stmt));
      else if (stmt instanceof IfStatement) 
        body.push(this.parseIfStmt(stmt));
      else
        throw new Error(
          "Could not parse body of FunctionDeclaration to wasm equivalent!",
        );
    }

    const fn = w.func(
      name,
      {
        params: params,
        returnType: returnType,
        locals: [],
      },
      { __nodeType: "block", name: null, body, returnType } as w.Block,
    );

    this.module.addFunc(fn, node.exported);
    return fn;
  }
  parseBranchTo(node: BranchToStatement): w.Branch {
    return w.branch(node.to.data);
  }
  parseBranch(node: BranchStatement): w.Loop {
    return w.loop(node.name.data, [
      <Instr<"void">>this.parseCall(<CallExpression>node.block.statements[0]),
      w.branch("a"),
    ]);
  }
  parseIfStmt(node: IfStatement): w.BranchIf {
    return w.branchIf(
      "block",
      w.constant("i32", 1)
    )
  }
  parseVariable(node: VariableDeclaration): w.LocalSet {
    if (node.value instanceof StringLiteral) {
      const value = this.parseStringLiteral(node.value as StringLiteral);
      return w.local.set("i32", node.name.data, w.constant("i32", 0));
    } else {
      const type = toNumericType(node.type.types[0]);
      const value = parseFloat((node.value as NumberLiteral).data);
      return w.local.set(type, node.name.data, w.constant(type, value));
    }
  }
  parseReturnStatement(node: ReturnStatement): w.Instr {
    if (node.returning instanceof BinaryExpression) {
      return this.parseBinaryExpression(node.returning as BinaryExpression);
    } else {
      throw new Error("Could not parse ReturnStatement to wasm equivalent!");
    }
  }
  parseCall(node: CallExpression): w.Instr {
    const params: w.Instr[] = [];
    for (const param of node.parameters) {
      if (param instanceof NumberLiteral) {
        params.push(this.parseNumberLiteral("i32", param));
      }
    }
    return w.call(node.calling.data, "i32", params);
  }
  parseNumberLiteral(type: NumericDataType, node: NumberLiteral): w.Instr {
    switch (type) {
      case "i32":
        return w.constant(type, parseInt(node.data));
      case "i64":
        return w.constant(type, parseInt(node.data));
      case "f32":
        return w.constant(type, parseFloat(node.data));
      case "f64":
        return w.constant(type, parseFloat(node.data));
      default:
        throw new Error("Could not parse NumberLiteral to wasm equivalent!");
    }
  }
  parseStringLiteral(node: StringLiteral): w.MemorySegment {
    const seg: w.MemorySegment = {
      data: "\\0" + node.data.length.toString(16) + node.data,
      offset: w.constant("i32", offset),
    };
    offset += 1 + node.data.length;
    this.segments.push(seg);
    return seg;
  }
  parseBinaryExpression(node: BinaryExpression): w.Add | w.Sub {
    switch (node.operand) {
      case Operator.Add: {
        const leftType = getTypeOf(node.left);
        const leftName = getNameOf(node.left);

        const rightType = getTypeOf(node.right);
        const rightName = getNameOf(node.right);
        const op = w.add(
          leftType,
          w.local.get(leftType, leftName),
          w.local.get(rightType, rightName),
        );
        return op;
      }
      case Operator.Sub: {
        const leftType = getTypeOf(node.left);
        const leftName = getNameOf(node.left);

        const rightType = getTypeOf(node.right);
        const rightName = getNameOf(node.right);
        const op = w.sub(
          leftType,
          w.local.get(leftType, leftName),
          w.local.get(rightType, rightName),
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
