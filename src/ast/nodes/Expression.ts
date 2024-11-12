import { Range } from "../Range";

export class Expression {
  public nameOf: string = "Expression";
  public range: Range = new Range(
    {
      line: -1,
      column: -1
    },
    {
      line: -1,
      column: -1
    }
  );
}
