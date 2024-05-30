import { EnumElement } from "./EnumElement.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";

export class EnumDeclaration extends Statement {
  public nameOf: string = "EnumDeclaration";
  public name: Identifier;
  public elements: EnumElement[];
  constructor(name: Identifier, elements: EnumElement[] = []) {
    super();
    this.name = name;
    this.elements = elements;
  }
}
