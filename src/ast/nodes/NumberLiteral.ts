import { Expression } from "./Expression.js";

export class NumberLiteral extends Expression {
  public nameOf: string = "NumberLiteral";
  public data: string;
  constructor(data: string) {
    super();
    this.data = data;
  }
}
