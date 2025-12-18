import { Source } from "./source";

export interface RangeData {
  line: number;
  column: number;
}

export class Range {
  public start: RangeData;
  public end: RangeData;
  public readonly source: Source;
  constructor(start: RangeData, end: RangeData, source: Source) {
    this.start = start;
    this.end = end;
    this.source = source;
  }
  static from(start: Range, end: Range): Range {
    if (start.source.fileName !== end.source.fileName)
      throw new Error("Range mismatch when attempting to join Ranges");
    return new Range(start.start, end.end, start.source);
  }
  static fromLC(start: RangeData, end: RangeData, source: Source): Range {
    return new Range(start, end, source);
  }
}
