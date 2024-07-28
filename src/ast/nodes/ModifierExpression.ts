import { Range } from "../Range.js";
import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";

export class ModifierExpression extends Expression {
  public nameOf: string = "ModifierExpression";
  public tag: Identifier;
  public content: Identifier | null;
  constructor(tag: Identifier, content: Identifier | null, range: Range) {
    super();
    this.tag = tag;
    this.content = content;
    this.range = range;
  }
}
