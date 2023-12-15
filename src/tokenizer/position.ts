import { Range } from "../ast/Range";

export class Position {
  public index: number = 0;
  public line: number = 0;
  public start: number = 0;
  private lineStart: number = 0;
  private indexState: number = 0;
  private startState: number = 0;
  private lineState: number = 0;
  private lineStartState: number = 0;
  constructor(index: number, line: number) {
    this.index = index;
    this.line = line;
  }
  incrementLine(): void {
    this.line++;
    this.lineStart = this.index;
  }
  markPosition(): void {
    this.start = this.index;
  }
  pauseState(): void {
    this.indexState = this.index;
    this.lineState = this.line;
    this.startState = this.start;
    this.lineStartState = this.lineStart;
  }
  resumeState(): void {
    this.index = this.indexState;
    this.line = this.lineState;
    this.start = this.startState;
    this.lineStart = this.lineStartState;
  }
  toRange(): Range {
    return new Range(
      this.line,
      this.start - this.lineStart,
      this.index - this.lineStart,
    );
  }
}
