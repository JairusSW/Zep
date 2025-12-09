/**
 * Represents different types of tokens.
 */
export enum Token {
  // GENERAL
  Identifier,    // variable names, function names, etc.
  Number,        // numeric literals, e.g., 0-9, _, .
  String,        // string literals, e.g., " ", ' ', ` `

  // PUNCTUATION
  Semi,          // ;
  Comma,         // ,
  Colon,         // :
  Question,      // ?
  Period,        // .
  LeftParen,     // (
  RightParen,    // )
  LeftBrace,     // {
  RightBrace,    // }
  LeftBracket,   // [
  RightBracket,  // ]
  Pipe,          // |

  // ASSIGNMENT OPERATORS
  Equals,            // =
  ColonEquals,       // :=
  PlusEquals,        // +=
  MinusEquals,       // -=
  AsteriskEquals,    // *=
  SlashEquals,       // /=
  PercentEquals,     // %=
  BitwiseAndEquals,  // &=
  BitwiseOrEquals,   // |=
  BitwiseXorEquals,  // ^=
  ShiftLeftEquals,   // <<=
  ShiftRightEquals,  // >>=

  // COMPARISON OPERATORS
  EqualsEquals,         // ==
  NotEquals,            // !=
  NotEqualsEquals,      // !==
  GreaterThan,          // >
  LessThan,             // <
  LessThanEquals,       // <=
  GreaterThanEquals,    // >=

  // ARITHMETIC OPERATORS
  Plus,           // +
  Minus,          // -
  Asterisk,       // *
  Slash,          // /
  Percent,        // %
  Exponent,       // **
  Increment,      // ++
  Decrement,      // --

  // LOGICAL OPERATORS
  And,            // &&
  Or,             // ||
  Not,            // !
  Ternary,        // ?:

  // BITWISE OPERATORS
  BitwiseAnd,     // &
  BitwiseXor,     // ^
  BitwiseNot,     // ~
  ShiftLeft,      // <<
  ShiftRight,     // >>

  // SYMBOLS
  Pound,          // #

  // UTILITY
  EOF,            // End of File / Exit
}
