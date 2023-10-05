import { Token, TokenData } from "../../tokenizer/tokenizer.js";
import { isIdentifier } from "../../util/types/checkers.js";
import { BlockExpression } from "./BlockExpression.js";
import { Identifier } from "./Identifier.js";
import { ParameterExpression } from "./ParameterExpression.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class FunctionDeclaration extends Statement {
    public name: Identifier;
    public parameters: ParameterExpression[];
    public returnType: TypeExpression;
    //public genericType: TypeExpression | null;
    public block: BlockExpression;
    constructor(name: Identifier, parameters: ParameterExpression[], returnType: TypeExpression, block: BlockExpression) {
        super();
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.block = block;
    }
    static match: ((tok: TokenData) => boolean)[] = [
        (tok) => tok.text === "fn",
        isIdentifier,
        (tok) => tok.token === Token.LeftParen,
        (tok) => tok.token === Token.RightParen,
        (tok) => tok.text === "->",
        isIdentifier
    ]
}