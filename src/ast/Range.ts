export class RangeData {
  public line: number = 0;
  public column: number = 0;
}

export class Range {
  public start: RangeData;
  public end: RangeData;
  // public source: Source;
  constructor(start: RangeData, end: RangeData) {
    this.start = start;
    this.end = end;
  }
  static from(start: Range, end: Range): Range {
    return new Range(start.start, end.end);
  }
}
