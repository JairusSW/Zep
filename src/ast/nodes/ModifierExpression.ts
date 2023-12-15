import { Expression } from "./Expression.js";

export class ModifierExpression extends Expression {
  constructor(
    public tag: string,
    public content: string | null = null,
  ) {
    super();
  }
}
