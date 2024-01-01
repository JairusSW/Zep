import { Program } from "../ast/Program";
import { FunctionDeclaration } from "../ast/nodes/Function";
import { ErrorTypes } from "../error/error";

export class Validator {
  constructor(public program: Program) { }
  validate() { }
  validateFunctionDeclaration(node: FunctionDeclaration): {
    valid: boolean;
    message: string;
    type: ErrorTypes;
  } { }
}
