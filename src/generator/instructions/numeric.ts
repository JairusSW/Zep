import { Instruction } from "../Instruction";

export const i32Ops = {
  add: new Instruction("i32.add", ["i32", "i32"]),
  sub: new Instruction("i32.sub", ["i32", "i32"]),
  mul: new Instruction("i32.mul", ["i32", "i32"])
}