import { Expression } from "./Expression.js";

export class TypeExpression extends Expression {
  public types: string[];
  public union: boolean;
  constructor(types: string[], union: boolean = false) {
    super();
    this.types = types;
    this.union = union;
  }
}
