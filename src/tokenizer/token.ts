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
  Add, // +
  Sub, // -
  // COMPARISIONS
  GreaterThan, // >
  LessThan, // <
  // SYMBOLS
  Pound, // #
  // UTILITY
  EOF, // EXIT
}
