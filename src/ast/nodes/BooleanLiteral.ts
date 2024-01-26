import { Expression } from "./Expression.js";

export class BooleanLiteral extends Expression {
  public nameOf: string = "BooleanLiteral";
  constructor(
    public value: boolean
  ) {
    super();
  }
}
