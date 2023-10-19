import { CallExpression } from "./ast/nodes/CallExpression.js";
import { FunctionDeclaration } from "./ast/nodes/FunctionDeclaration.js";
import { StringLiteral } from "./ast/nodes/StringLiteral.js";
import { WasmConnector } from "./gen/connector.js";
import { WasmFunction } from "./gen/types/WasmFunction.js";
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { Visitor } from "./visitor/Visitor.js";

const tokenizer = new Tokenizer(`fn add(a: i32, b: i32) -> i32 {
    rt a + b
}`);

const parser = new Parser(tokenizer, "test.zp");

parser.parseProgram();

console.log(parser.program.statements);
console.log(parser.program.globalScope)