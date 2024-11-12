import { Range } from "../Range.js";
import { Identifier } from "./Identifier.js";
import { ParameterExpression } from "./ParameterExpression.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class FunctionImportDeclaration extends Statement {
  public nameOf: string = "FunctionImportDeclaration";
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
    exported: boolean,
    range: Range,
  ) {
    super();
    this.path = path;
    this.name = name;
    this.parameters = parameters;
    this.returnType = returnType;
    this.exported = exported;
    this.range = range;
  }
}
