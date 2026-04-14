import { Source } from "../source";
import { FunctionDeclaration } from "../ast/FunctionDeclaration";
import { ErrorTypes } from "../error/error";

export class Validator {
  constructor(public program: Source) {}
  validate() {}
  validateFunctionDeclaration(node: FunctionDeclaration): {
    valid: boolean;
    message: string;
    type: ErrorTypes;
  } {
    return {
      valid: true,
      message: "",
      type: ErrorTypes.UserError,
    };
  }
}
