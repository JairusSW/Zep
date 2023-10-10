import { CallExpression } from "./ast/nodes/CallExpression.js";
import { FunctionDeclaration } from "./ast/nodes/FunctionDeclaration.js";
import { StringLiteral } from "./ast/nodes/StringLiteral.js";
import { WasmConnector } from "./gen/connector.js";
import { WasmFunction } from "./gen/types/WasmFunction.js";
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";

const tokenizer = new Tokenizer(`#[ref]: env
fn print(data: i32) -> void
fn main() -> void {
    print("Hi there... Its me, Zep!")
}`);

const parser = new Parser(tokenizer, "test.zp");
parser.tokenizer.getAll();

const imp = parser.parseImportFunctionDeclaration();
const fn = parser.parseFunctionDeclaration();
console.log(parser.program.statements);

const wasm = new WasmConnector(parser.program);
wasm.addImportFunction(imp!);
wasm.addStringLiteral(new StringLiteral("Hi there... Its me, Zep!"));
wasm.addFunction(fn!);

console.log(wasm.module.toWat())