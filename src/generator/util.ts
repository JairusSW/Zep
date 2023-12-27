import { w } from 'wazum';
export function toDataType(type: string): w.DataType {
  switch (type) {
    case "i32":
    case "i64":
    case "f32":
    case "f64":
    case "none": return type as w.DataType;
    default: throw new Error(`Could not convert type '${type}' to wasm data type!`);
  }
}