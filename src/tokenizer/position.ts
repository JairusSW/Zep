import { Range } from "../ast/Range";

/**
 * Represents a position in a text document.
 */
export class Position {
  public current = 0;
  public line = 0;
  public line_start = 0;

  public start = 0;
  public start_line = 0;
  public start_line_start = 0;

  /**
   * Creates a new Position instance.
   * @param index The current index in the text document.
   * @param line The current line number in the text document.
   */
  constructor(index: number, line: number) {
    this.current = index;
    this.line = line;
  }

  /**
   * Increments the line number by 1 and updates the lineStart property.
   */
  incrementLine(): void {
    this.line++;
    this.line_start = this.current;
  }

  /**
   * Sets the start property to the current index value.
   */
  markPosition(): void {
    this.start = this.current;
    this.start_line = this.line;
    this.start_line_start = this.line_start;
  }

  /**
   * Converts the position to a Range object.
   * @returns A Range object representing the current position in the text document.
   */
  toRange(): Range {
    return new Range(
      {
        line: this.start_line,
        column: this.start - this.start_line_start
      },
      {
        line: this.line,
        column: this.current - this.line_start
      }
    );
  }
}
