import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";

export class ImportDeclaration extends Statement {
  public path: Identifier;
  constructor(path: Identifier) {
    super();
    this.path = path;
  }
}
