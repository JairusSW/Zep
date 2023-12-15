import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";

export class ModifierExpression extends Expression {
  constructor(
    public tag: Identifier,
    public content: Identifier | null = null,
  ) {
    super();
  }
}
