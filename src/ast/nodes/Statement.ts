import { Range } from "../Range";

export class Statement {
  public nameOf: string = "Statement";
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
