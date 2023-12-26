import { Type, f32, f64, i32, i64 } from "wasmati";

export function typeToWasm(type: string): Type<i32 | i64 | f32 | f64> {
  switch (type) {
    case "i32": {
      return i32;
    }
    case "i64": {
      return i64;
    }
    case "f32": {
      return f32;
    }
    case "f64": {
      return f64;
    }
    default: {
      throw new Error("Could not discern type of parameter!");
    }
  }
}