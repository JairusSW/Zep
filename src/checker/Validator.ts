import { Source } from "../ast/Source";
import { FunctionDeclaration } from "../ast/nodes/Function";
import { ErrorTypes } from "../error/error";

export class Validator {
  constructor(public program: Source) {}
  validate() {}
  validateFunctionDeclaration(node: FunctionDeclaration): {
    valid: boolean;
    message: string;
    type: ErrorTypes;
  } {}
}
