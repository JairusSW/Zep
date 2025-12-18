import { Range } from "../range";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node";
import { Statement } from "./Statement.js";

export class IfStatement extends Statement {
  public nameOf: string = "IfStatement";
  public condition: Expression | null;
  public ifTrue: Statement;
  public ifFalse: Statement | null;
  public kind: IfStatementKind;
  constructor(
    condition: Expression | null,
    ifTrue: Statement,
    ifFalse: Statement | null,
    kind: IfStatementKind,
    range: Range,
  ) {
    super(NodeKind.IfStatement);
    this.condition = condition;
    this.ifTrue = ifTrue;
    this.ifFalse = ifFalse;
    this.kind = kind;
    this.range = range;
  }
}

export enum IfStatementKind {
  If = "if",
  ElseIf = "else if",
  Else = "else",
}
