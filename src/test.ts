import { AST } from "./ast.js";
import { Tokenizer } from "./tokenizer.js";

const tokenizer = new Tokenizer('string foo = "bar";');
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());

const ast = new AST('string foo = "bar";');
console.log(ast.statements);
