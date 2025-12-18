import { Range } from "../range.js";
import { Token } from "../tokenizer.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";
import { Statement } from "./Statement.js";

export class BinaryExpression extends Expression {
  public left: Expression | Statement;
  public operand: BinaryOp;
  public right: Expression | Statement;
  constructor(
    left: Expression | Statement,
    operand: BinaryOp,
    right: Expression | Statement,
    range: Range,
  ) {
    super(NodeKind.BinaryExpression);
    this.left = left;
    this.operand = operand;
    this.right = right;
    this.range = range;
  }
}

export enum BinaryOp {
  Add,
  AddEq,
  Sub,
  SubEq,
  Mul,
  MulEq,
  Div,
  DivEq,
  Mod,
  ModEq,
  Eq,
  NotEq,
  Lt,
  LtEq,
  Gt,
  GtEq,
  And,
  Or,
  BitAnd,
  BitAndEq,
  BitOr,
  BitOrEq,
  BitXor,
  BitXorEq,
  ShiftLeft,
  ShiftLeftEq,
  ShiftRight,
  ShiftRightEq,
}

export function tokenToOp(token: Token): BinaryOp | null {
  switch (token) {
    // arithmetic
    case Token.Plus:
      return BinaryOp.Add;
    case Token.PlusEq:
      return BinaryOp.AddEq;
    case Token.Minus:
      return BinaryOp.Sub;
    case Token.MinusEq:
      return BinaryOp.SubEq;
    case Token.Star:
      return BinaryOp.Mul;
    case Token.StarEq:
      return BinaryOp.MulEq;
    case Token.Slash:
      return BinaryOp.Div;
    case Token.SlashEq:
      return BinaryOp.DivEq;
    case Token.Percent:
      return BinaryOp.Mod;
    case Token.PercentEq:
      return BinaryOp.ModEq;

    // comparisons
    case Token.EqEq:
      return BinaryOp.Eq;
    case Token.BangEq:
      return BinaryOp.NotEq;
    case Token.LessThan:
      return BinaryOp.Lt;
    case Token.LessThanEq:
      return BinaryOp.LtEq;
    case Token.GreaterThan:
      return BinaryOp.Gt;
    case Token.GreaterThanEq:
      return BinaryOp.GtEq;

    // logical (both keyword and symbol forms)
    case Token.And: // `and`
    case Token.AmpAmp: // &&
      return BinaryOp.And;

    case Token.Or: // `or`
    case Token.BarBar: // ||
      return BinaryOp.Or;

    // bitwise
    case Token.Amp:
      return BinaryOp.BitAnd;
    case Token.AmpEq:
      return BinaryOp.BitAndEq;
    case Token.Bar:
      return BinaryOp.BitOr;
    case Token.BarEq:
      return BinaryOp.BitOrEq;
    case Token.Caret:
      return BinaryOp.BitXor;
    case Token.CaretEq:
      return BinaryOp.BitXorEq;

    // shifts
    case Token.ShiftLeft:
      return BinaryOp.ShiftLeft;
    case Token.ShiftLeftEq:
      return BinaryOp.ShiftLeftEq;
    case Token.ShiftRight:
      return BinaryOp.ShiftRight;
    case Token.ShiftRightEq:
      return BinaryOp.ShiftRightEq;

    default:
      return null;
  }
}

export function opToString(op: BinaryOp): string {
  switch (op) {
    // arithmetic
    case BinaryOp.Add:
      return "+";
    case BinaryOp.AddEq:
      return "+=";
    case BinaryOp.Sub:
      return "-";
    case BinaryOp.SubEq:
      return "-=";
    case BinaryOp.Mul:
      return "*";
    case BinaryOp.MulEq:
      return "*=";
    case BinaryOp.Div:
      return "/";
    case BinaryOp.DivEq:
      return "/=";
    case BinaryOp.Mod:
      return "%";
    case BinaryOp.ModEq:
      return "%=";

    // comparisons
    case BinaryOp.Eq:
      return "==";
    case BinaryOp.NotEq:
      return "!=";
    case BinaryOp.Lt:
      return "<";
    case BinaryOp.LtEq:
      return "<=";
    case BinaryOp.Gt:
      return ">";
    case BinaryOp.GtEq:
      return ">=";

    // logical
    case BinaryOp.And:
      return "&&"; // or "and" if you prefer keyword form
    case BinaryOp.Or:
      return "||"; // or "or"

    // bitwise
    case BinaryOp.BitAnd:
      return "&";
    case BinaryOp.BitAndEq:
      return "&=";
    case BinaryOp.BitOr:
      return "|";
    case BinaryOp.BitOrEq:
      return "|=";
    case BinaryOp.BitXor:
      return "^";
    case BinaryOp.BitXorEq:
      return "^=";

    // shifts
    case BinaryOp.ShiftLeft:
      return "<<";
    case BinaryOp.ShiftLeftEq:
      return "<<=";
    case BinaryOp.ShiftRight:
      return ">>";
    case BinaryOp.ShiftRightEq:
      return ">>=";
  }
}
