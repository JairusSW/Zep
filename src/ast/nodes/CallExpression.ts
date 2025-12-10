import { Range } from "../Range.js";
import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";

export class CallExpression extends Expression {
  public nameOf: string = "CallExpression";
  public calling: Expression;
  public parameters: Expression[];
  constructor(calling: Expression, parameters: Expression[], range: Range) {
    super();
    this.calling = calling;
    this.parameters = parameters;
    this.range = range;
  }
}
