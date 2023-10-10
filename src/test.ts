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
console.log(parser.tokenizer.getAll());

parser.parseProgram();
const wasm = new WasmConnector();
wasm.fromProgram(parser.program);

console.log(wasm.module.toWat());
/*
const imp = parser.parseImportFunctionDeclaration();
const fn = parser.parseFunctionDeclaration();
console.log(parser.program.statements);

const wasm = new WasmConnector(parser.program);
wasm.addImportFunction(imp!);
wasm.addStringLiteral(new StringLiteral("Hi there... Its me, Zep!"));
wasm.addFunction(fn!);

console.log(wasm.module.toWat())*/