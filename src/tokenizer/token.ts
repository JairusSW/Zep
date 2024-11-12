/**
 * Represents different types of tokens.
 */
export enum Token {
  // GENERAL
  Identifier,
  Number, // 0-9 _ .
  String, // " "   ' '   ` `
  // PUNCTUATION
  Semi, // ;
  Equals, // =
  EqualsEquals, // ==
  EqualsEqualsEquals, // ===
  ColonEquals, // :=
  QuestionEquals, // :=
  Question, // ?
  Colon, // :
  Comma, // ,
  LeftParen, // (
  RightParen, // )
  LeftBracket, // {
  RightBracket, // }
  LeftBrace, // [
  RightBrace, // ]
  Period, // .
  // Operators
  Plus, // +
  Minus, // -
  Asterisk, // *
  Percent, // %
  // COMPARISIONS
  GreaterThan, // >
  LessThan, // <
  // SYMBOLS
  Pound, // #
  // UTILITY
  EOF, // EXIT
}
