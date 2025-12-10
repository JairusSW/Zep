/**
 * Represents different types of tokens.
 */
export enum Token {
  // GENERAL
  IDENTIFIER,    // variable names, function names, etc.
  TEXT,          // arbitrary text
  NUMBER,        // numeric literals, e.g., 0-9, _, .
  STRING,        // string literals, e.g., " ", ' ', ` `

  // PUNCTUATION
  SEMI,          // ;
  COMMA,         // ,
  COLON,         // :
  QUESTION,      // ?
  DOT,           // .
  LEFT_PAREN,     // (
  RIGHT_PAREN,    // )
  LEFT_BRACE,     // {
  RIGHT_BRACE,    // }
  LEFT_BRACKET,   // [
  RIGHT_BRACKET,  // ]
  PIPE,           // |

  // ASSIGNMENT OPERATORS
  EQUALS,            // =
  COLON_EQUALS,       // :=
  PLUS_EQUALS,        // +=
  MINUS_EQUALS,       // -=
  ASTERISK_EQUALS,    // *=
  SLASH_EQUALS,       // /=
  PERCENT_EQUALS,     // %=
  AMPERSAND_EQUALS,  // &=
  OR_EQUALS,   // |=
  XOR_EQUALS,  // ^=
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
  Fwd_Slash,      // /
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
