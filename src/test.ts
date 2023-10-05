import { WasmConnector } from "./gen/connector.js";
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";

const tokenizer = new Tokenizer(`fn add(a: i32, b: i32) -> i32 {
    ret a + b
}`);

const parser = new Parser(tokenizer, "test.zp");
parser.tokenizer.getAll();

//console.log(parser.parseImportFunctionDeclaration());
//console.log(parser.parseImportDeclaration());
//console.log(parser.parseVariableDeclaration());
const func = parser.parseFunctionDeclaration();
console.log(func);

const wasm = new WasmConnector(parser.program);
const wasmFunc = wasm.addFunction(func!);
console.log(wasmFunc);

console.log(wasm.module.toWat())