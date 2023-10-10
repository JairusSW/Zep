import { BinaryExpression } from "../ast/nodes/BinaryExpression.js";
import { CallExpression } from "../ast/nodes/CallExpression.js";
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration.js";
import { Identifier } from "../ast/nodes/Identifier.js";
import { ImportFunctionDeclaration } from "../ast/nodes/ImportFunctionDeclaration.js";
import { Program } from "../ast/nodes/Program.js";
import { ReturnStatement } from "../ast/nodes/ReturnStatement.js";
import { StringLiteral } from "../ast/nodes/StringLiteral.js";
import { TypeExpression } from "../ast/nodes/TypeExpression.js";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration.js";
import { WasmCall } from "./types/WasmCall.js";
import { WasmData } from "./types/WasmData.js";
import { WasmFunction } from "./types/WasmFunction.js";
import { WasmImport, WasmImportType } from "./types/WasmImport.js";
import { WasmMemory } from "./types/WasmMemory.js";
import { WasmModule } from "./types/WasmModule.js";
import { WasmOp, WasmOperator } from "./types/WasmOp.js";
import { WasmParam } from "./types/WasmParam.js";
import { WasmStatement } from "./types/WasmStatement.js";
import { WasmType } from "./types/WasmType.js";

export class WasmConnector {
    public program: Program;
    public module: WasmModule = new WasmModule([]);
    constructor(program: Program) {
        this.program = program;
        this.module.statements.push(new WasmMemory(1, "env", "buffer"));
    }
    addFunctionCall(node: CallExpression): WasmCall {
        const out = new WasmCall(node.calling.data, []);
        this.module.statements.push(out);
        return out;
    }
    addImportFunction(node: ImportFunctionDeclaration): WasmImport {
        const out = new WasmImport(WasmImportType.Function, node);
        this.module.statements.push(out);
        return out;
    }
    addFunction(node: FunctionDeclaration): WasmFunction {
        const name = node.name.data;
        const params: WasmParam[] = [];

        for (const param of node.parameters) {
            const type = typeToWasm(param.type!);
            params.push(
                new WasmParam(
                    param.name.data,
                    type!
                )
            )
        }

        const body: WasmStatement[] = [];

        for (const stmt of node.block.statements) {
            if (stmt instanceof ReturnStatement && stmt.returning instanceof BinaryExpression) {
                body.push(
                    new WasmOp(
                        (<Identifier>stmt.returning.left).data,
                        WasmOperator.Add,
                        (<Identifier>stmt.returning.right).data
                    )
                )
            } else if (stmt instanceof CallExpression) {
                body.push(
                    new WasmCall(
                        stmt.calling.data,
                        []
                    )
                )
            }
        }

        const returnType = typeToWasm(node.returnType);

        const out = new WasmFunction(name, params, body, returnType!, true);
        this.module.statements.push(out);
        return out;
    }
    addStringLiteral(node: StringLiteral): WasmData {
        const data = new Array<string | number>(1 + node.data.length);
        data[0] = data.length;
        for (let i = 0; i < node.data.length; i++) {
            data[i + 1] = node.data.charAt(i);
        }
        const out = new WasmData(0, data);
        this.module.statements.push(out);
        return out;
    }
}

export function typeToWasm(type: TypeExpression): WasmType | null {
    if (type.union) return null;
    switch (type.types[0]) {
        case "i32": return WasmType.I32;
        case "void": return WasmType.Void;
    }
    return null;
}