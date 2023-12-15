import { Token, TokenData } from "../../tokenizer/tokenizer.js";
import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";

export class BinaryExpression extends Expression {
  public left: Expression | Statement;
  public operand: Operator;
  public right: Expression | Statement;
  constructor(
    left: Expression | Statement,
    operand: Operator,
    right: Expression | Statement,
  ) {
    super();
    this.left = left;
    this.operand = operand;
    this.right = right;
  }
  static match: ((tok: TokenData) => boolean)[] = [
    (tok) => tok.token === Token.Identifier,
    (tok) => tok.token === Token.Add || tok.token === Token.Sub,
    (tok) => tok.token === Token.Identifier,
  ];
}

export enum Operator {
  Add,
  Sub,
}
