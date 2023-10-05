import { BinaryExpression } from "../ast/nodes/BinaryExpression.js";
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration.js";
import { Identifier } from "../ast/nodes/Identifier.js";
import { Program } from "../ast/nodes/Program.js";
import { ReturnStatement } from "../ast/nodes/ReturnStatement.js";
import { TypeExpression } from "../ast/nodes/TypeExpression.js";
import { WasmFunction } from "./types/WasmFunction.js";
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
            }
        }

        const returnType = typeToWasm(node.returnType);

        const out = new WasmFunction(name, params, body, returnType!, true);
        this.module.statements.push(out);
        return out;
    }
}

export function typeToWasm(type: TypeExpression): WasmType | null {
    if (type.union) return null;
    switch (type.types[0]) {
        case "i32": return WasmType.I32;
    }
    return null;
}