"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Position = void 0;
const Range_1 = require("../ast/Range");
/**
 * Represents a position in a text document.
 */
class Position {
  /**
   * Creates a new Position instance.
   * @param index The current index in the text document.
   * @param line The current line number in the text document.
   */
  constructor(index, line) {
    this.current = 0;
    this.line = 0;
    this.line_start = 0;
    this.start = 0;
    this.start_line = 0;
    this.start_line_start = 0;
    this.current = index;
    this.line = line;
  }
  /**
   * Increments the line number by 1 and updates the lineStart property.
   */
  incrementLine() {
    this.line++;
    this.line_start = this.current;
  }
  /**
   * Sets the start property to the current index value.
   */
  markPosition() {
    this.start = this.current;
    this.start_line = this.line;
    this.start_line_start = this.line_start;
  }
  /**
   * Converts the position to a Range object.
   * @returns A Range object representing the current position in the text document.
   */
  toRange() {
    return new Range_1.Range(
      {
        line: this.start_line,
        column: this.start - this.start_line_start,
      },
      {
        line: this.line,
        column: this.current - this.line_start,
      },
    );
  }
}
exports.Position = Position;
