import { Scope } from "../../checker/scope/Scope.js";
import { BlockExpression } from "./BlockExpression.js";
import { Identifier } from "./Identifier.js";
import { ParameterExpression } from "./ParameterExpression.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class FunctionDeclaration extends Statement {
  public nameOf: string = "FunctionDeclaration";
  public name: Identifier;
  public parameters: ParameterExpression[];
  public returnType: TypeExpression;
  //public genericType: TypeExpression | null;
  public block: BlockExpression;
  public scope: Scope;
  public exported: boolean;
  constructor(
    name: Identifier,
    parameters: ParameterExpression[],
    returnType: TypeExpression,
    block: BlockExpression,
    scope: Scope,
    exported: boolean
  ) {
    super();
    this.name = name;
    this.parameters = parameters;
    this.returnType = returnType;
    this.block = block;
    this.scope = scope;
    this.exported = exported;
    for (const param of this.parameters) {
      this.scope.add(param.name.data, param);
    }
  }
}
