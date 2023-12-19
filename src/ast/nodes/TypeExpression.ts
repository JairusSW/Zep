import { Expression } from "./Expression.js";

export class TypeExpression extends Expression {
  public nameOf: string = "TypeExpression";
  public types: string[];
  public union: boolean;
  constructor(types: string[], union: boolean = false) {
    super();
    this.types = types;
    this.union = union;
  }
}
