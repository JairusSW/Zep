import { Range } from "../ast/Range";

/**
 * Represents a position in a text document.
 */
export class Position {
  public index: number = 0;
  public line: number = 0;
  public start: number = 0;
  public lineStart: number = 0;

  /**
   * Creates a new Position instance.
   * @param index The current index in the text document.
   * @param line The current line number in the text document.
   */
  constructor(index: number, line: number) {
    this.index = index;
    this.line = line;
  }

  /**
   * Increments the line number by 1 and updates the lineStart property.
   */
  incrementLine(): void {
    this.line++;
    this.lineStart = this.index;
  }

  /**
   * Sets the start property to the current index value.
   */
  markPosition(): void {
    this.start = this.index;
  }

  /**
   * Converts the position to a Range object.
   * @returns A Range object representing the current position in the text document.
   */
  toRange(): Range {
    return new Range(
      this.line,
      this.start - this.lineStart,
      this.index - this.lineStart,
    );
  }
}
