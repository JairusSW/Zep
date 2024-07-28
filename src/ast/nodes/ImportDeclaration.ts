import { Range } from "../Range.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";

export class ImportDeclaration extends Statement {
  public nameOf: string = "ImportDeclaration";
  public path: Identifier;
  constructor(path: Identifier, range: Range) {
    super();
    this.path = path;
    this.range = range;
  }
}
