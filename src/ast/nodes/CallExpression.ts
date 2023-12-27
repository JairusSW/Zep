import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";

export class CallExpression extends Expression {
  public nameOf: string = "CallExpression";
  constructor(
    public calling: Identifier,
    public parameters: Expression[],
  ) {
    super();
  }
}
