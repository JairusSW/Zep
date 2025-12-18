import { BinaryOp } from "../ast";

export function opPrecedence(op: BinaryOp): number {
  switch (op) {
    // lowest
    case BinaryOp.Or:
      return 1;
    case BinaryOp.And:
      return 2;

    case BinaryOp.BitOr:
    case BinaryOp.BitOrEq:
      return 3;

    case BinaryOp.BitXor:
    case BinaryOp.BitXorEq:
      return 4;

    case BinaryOp.BitAnd:
    case BinaryOp.BitAndEq:
      return 5;

    case BinaryOp.Eq:
    case BinaryOp.NotEq:
      return 6;

    case BinaryOp.Lt:
    case BinaryOp.LtEq:
    case BinaryOp.Gt:
    case BinaryOp.GtEq:
      return 7;

    case BinaryOp.ShiftLeft:
    case BinaryOp.ShiftLeftEq:
    case BinaryOp.ShiftRight:
    case BinaryOp.ShiftRightEq:
      return 8;

    case BinaryOp.Add:
    case BinaryOp.AddEq:
    case BinaryOp.Sub:
    case BinaryOp.SubEq:
      return 9;

    case BinaryOp.Mul:
    case BinaryOp.MulEq:
    case BinaryOp.Div:
    case BinaryOp.DivEq:
    case BinaryOp.Mod:
    case BinaryOp.ModEq:
      return 10;

    default:
      return 0;
  }
}

export function isRightAssociative(op: BinaryOp): boolean {
  switch (op) {
    case BinaryOp.AddEq:
    case BinaryOp.SubEq:
    case BinaryOp.MulEq:
    case BinaryOp.DivEq:
    case BinaryOp.ModEq:
    case BinaryOp.BitAndEq:
    case BinaryOp.BitOrEq:
    case BinaryOp.BitXorEq:
    case BinaryOp.ShiftLeftEq:
    case BinaryOp.ShiftRightEq:
      return true;
    default:
      return false;
  }
}
