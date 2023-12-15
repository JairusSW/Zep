export enum Token {
  // GENERAL
  Identifier,
  Number, // 0-9 _ .
  String, // " "   ' '   ` `
  // PUNCTUATION
  Semi, // ;
  Equals, // =
  Question, // ?
  Colon, // :
  Comma, // ,
  LeftParen, // (
  RightParen, // )
  LeftBracket, // {
  RightBracket, // }
  LeftBrace, // [
  RightBrace, // ]
  // Operators
  Add, // +
  Sub, // -
  // SYMBOLS
  Pound, // #
  // UTILITY
  EOF, // EXIT
}
