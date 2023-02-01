import { Tokenizer } from "./tokenizer.js";
const tokenizer = new Tokenizer('string foo = "bar";');
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());
console.log(tokenizer.getNext());
