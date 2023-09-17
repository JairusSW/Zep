import { VariableStatement } from "../nodes/VariableStatement.js";
import { Tokenizer } from "./tokenizer.js";
const tokenizer = new Tokenizer(`
string foo = "bar";
string boo = "gah";`);
console.log(tokenizer.getAll());
console.log("Is Variable Statement? ", tokenizer.matches(VariableStatement.match));
console.log("Is Variable Statement? ", tokenizer.matches(VariableStatement.match));
