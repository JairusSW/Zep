import { Scope } from "../../checker/scope/Scope.js";
import { Token, TokenData } from "../../tokenizer/tokenizer.js";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class BlockExpression extends Expression {
  public scope: Scope = new Scope();
  constructor(public statements: Statement[]) {
    super();
  }
  static match: ((tok: TokenData) => boolean)[] = [
    (tok) => tok.token === Token.LeftBracket,
  ];
}
