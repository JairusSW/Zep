import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class ParameterExpression extends Statement {
  public name: Identifier;
  public type: TypeExpression | null = null;
  constructor(name: Identifier, type: TypeExpression | null = null) {
    super();
    this.name = name;
    this.type = type;
  }
}
