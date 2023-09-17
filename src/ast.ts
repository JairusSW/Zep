import { Statement } from "../nodes/Statement.js";
import { StringLiteral } from "../nodes/StringLiteral.js";
import { TypeExpression } from "../nodes/TypeExpression.js";
import { VariableStatement } from "../nodes/VariableStatement.js";
import { Token, Tokenizer } from "./tokenizer.js";
import { isBuiltinType } from "./util.js";

export class AST {
    public data: string;
    public statements: Statement[] = [];
    public pos: number = 0;
    public tokenizer: Tokenizer;
    constructor(data: string) {
        this.data = data;
        this.tokenizer = new Tokenizer(this.data);
        const tokenData = this.tokenizer.getToken();
        if (tokenData.token == Token.Identifier) {
            if (isBuiltinType(tokenData.text)) {
                const pos = this.tokenizer.pos;
                const nameToken = this.tokenizer.getToken();
                const eqToken = this.tokenizer.getToken();
                const valueToken = this.tokenizer.getToken();
                const semiToken = this.tokenizer.getToken();
                if (nameToken.token == Token.Identifier && eqToken.token == Token.Equals && valueToken.token == Token.String && semiToken.token == Token.Semi) {
                    // Obviously a variable
                    this.statements.push(new VariableStatement(new StringLiteral(valueToken.text), nameToken.text, new TypeExpression([tokenData.text], false), false));
                }
            }
        }
    }
}