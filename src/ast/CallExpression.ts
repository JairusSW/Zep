import { Range } from "../range.js";
import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { NodeKind } from "./Node.js";

export class CallExpression extends Expression {
  public calling: Expression;
  public parameters: Expression[];
  constructor(calling: Expression, parameters: Expression[], range: Range) {
    super(NodeKind.CallExpression);
    this.calling = calling;
    this.parameters = parameters;
    this.range = range;
  }
}
