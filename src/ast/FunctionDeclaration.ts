import { Scope } from "../checker/scope/Scope.js";
import { Range } from "../range.js";
import { BlockStatement } from "./BlockStatement.js";
import { Identifier } from "./Identifier.js";
import { AttributeExpression } from "./AttributeExpression.js";
import { NodeKind } from "./Node.js";
import { ParameterExpression } from "./ParameterExpression.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class FunctionDeclaration extends Statement {
  public nameOf: string = "FunctionDeclaration";
  public attributes: AttributeExpression[];
  public name: Identifier;
  public parameters: ParameterExpression[];
  public returnType: TypeExpression | null;
  public block: Statement;
  public exported: boolean;
  constructor(
    attributes: AttributeExpression[],
    name: Identifier,
    parameters: ParameterExpression[],
    returnType: TypeExpression | null,
    block: Statement,
    exported: boolean,
    range: Range,
  ) {
    super(NodeKind.FunctionDeclaration);
    this.attributes = attributes;
    this.name = name;
    this.parameters = parameters;
    this.returnType = returnType;
    this.block = block;
    this.exported = exported;
    this.range = range;
  }
}
