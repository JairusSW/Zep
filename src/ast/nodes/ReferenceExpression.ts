import { Range } from "../Range";
import { Expression } from "./Expression";
import { Statement } from "./Statement";

export class ReferenceExpression extends Expression {
  public nameOf: string = "ReferenceExpression";
  public name: string;
  public referencing: Statement;
  constructor(name: string, referencing: Statement, range: Range) {
    super();
    this.name = name;
    this.referencing = referencing;
    this.range = range;
  }
}
