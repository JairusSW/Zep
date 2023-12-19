import { Expression } from "./Expression.js";

export class StringLiteral extends Expression {
  public nameOf: string = "StringLiteral";
  public data: string;
  constructor(data: string) {
    super();
    this.data = data;
  }
}
