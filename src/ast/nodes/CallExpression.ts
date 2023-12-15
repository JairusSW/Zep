import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { ParameterExpression } from "./ParameterExpression.js";

export class CallExpression extends Expression {
  constructor(
    public calling: Identifier,
    public parameters: ParameterExpression[],
  ) {
    super();
  }
}
