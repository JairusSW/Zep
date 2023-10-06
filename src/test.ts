import { CallExpression } from "./ast/nodes/CallExpression.js";
import { StringLiteral } from "./ast/nodes/StringLiteral.js";
import { WasmConnector } from "./gen/connector.js";
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";

const tokenizer = new Tokenizer(`"hello"`);

const parser = new Parser(tokenizer, "test.zp");
parser.tokenizer.getAll();

console.log(parser.parseStringLiteral());
//console.log(parser.parseImportFunctionDeclaration());
//console.log(parser.parseFunctionDeclaration());

const wasm = new WasmConnector(parser.program);
const wasmData = wasm.addStringLiteral(parser.program.statements[0] as StringLiteral);
console.log(wasmData.toWat());
//const wasmFunc = wasm.addFunction(func!);
//console.log(wasmFunc);

//console.log(wasm.module.toWat())