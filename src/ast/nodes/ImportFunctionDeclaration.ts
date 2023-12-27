import { Identifier } from "./Identifier.js";
import { ParameterExpression } from "./ParameterExpression.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class ImportFunctionDeclaration extends Statement {
  public nameOf: string = "ImportFunctionDeclaration";
  public path: Identifier;

  public name: Identifier;
  public parameters: ParameterExpression[];
  public returnType: TypeExpression;
  public exported: boolean;
  constructor(
    path: Identifier,
    name: Identifier,
    parameters: ParameterExpression[],
    returnType: TypeExpression,
    exported: boolean
  ) {
    super();
    this.path = path;
    this.name = name;
    this.parameters = parameters;
    this.returnType = returnType;
    this.exported = exported;
  }
}
