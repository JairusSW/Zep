import { Token, TokenData } from "../../tokenizer/tokenizer.js";
import { isIdentifier } from "../../util/types/checkers.js";
import { Identifier } from "./Identifier.js";
import { ParameterExpression } from "./ParameterExpression.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class ImportFunctionDeclaration extends Statement {
  public path: Identifier;

  public name: Identifier;
  public parameters: ParameterExpression[];
  public returnType: TypeExpression;
  constructor(
    path: Identifier,
    name: Identifier,
    parameters: ParameterExpression[],
    returnType: TypeExpression,
  ) {
    super();
    this.path = path;
    this.name = name;
    this.parameters = parameters;
    this.returnType = returnType;
  }
  static match: ((tok: TokenData) => boolean)[] = [
    (tok) => tok.text === "#",
    (tok) => tok.token === Token.LeftBrace,
    (tok) => tok.token === Token.Identifier,
    (tok) => tok.token === Token.RightBrace,
    (tok) => tok.token === Token.Colon,
    (tok) => tok.token === Token.Identifier,
    (tok) => tok.text === "fn",
    (tok) => tok.token === Token.Identifier,
    (tok) => tok.token === Token.LeftParen,

    (tok) => tok.token === Token.Identifier,
    (tok) => tok.token === Token.Colon,
    (tok) => tok.token === Token.Identifier,

    (tok) => tok.token === Token.RightParen,
    (tok) => tok.text === "->",
    (tok) => tok.token === Token.Identifier,
  ];
}
