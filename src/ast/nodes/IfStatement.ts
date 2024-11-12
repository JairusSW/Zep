import { Range } from "../Range";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class IfStatement extends Statement {
  public nameOf: string = "IfStatement";
  public condition: Expression | null;
  public ifTrue: Statement;
  public ifFalse: Statement | null;
  public kind: IfStatementKind;
  constructor(condition: Expression | null, ifTrue: Statement, ifFalse: Statement | null, kind: IfStatementKind, range: Range) {
    super();
    this.condition = condition;
    this.ifTrue = ifTrue;
    this.ifFalse = ifFalse;
    this.kind = kind;
    this.range = range;
  }
}

export enum IfStatementKind {
  If = 0,
  ElseIf = 1,
  Else = 2
}