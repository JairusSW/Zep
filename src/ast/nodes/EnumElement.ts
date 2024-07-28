import { Range } from "../Range.js";
import { Identifier } from "./Identifier.js";
import { NumberLiteral } from "./NumberLiteral.js";
import { Statement } from "./Statement.js";

export class EnumElement extends Statement {
  public nameOf: string = "EnumElement";
  public name: Identifier;
  public value: NumberLiteral;
  constructor(name: Identifier, value: NumberLiteral, range: Range) {
    super();
    this.name = name;
    this.value = value;
    this.range = range;
  }
}
