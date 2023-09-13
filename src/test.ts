import { Tokenizer } from "./tokenizer.js";

const tokenizer = new Tokenizer(`from "std import st"`);

console.log(tokenizer.getAll());