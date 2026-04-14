import { ParameterExpression } from "../ast/ParameterExpression";
import { VariableDeclaration } from "../ast/VariableDeclaration";
import { Node } from "../ast/Node";
import binaryen from "binaryen";
import { BinaryExpression } from "../ast/BinaryExpression";
import { NumberLiteral } from "../ast/NumberLiteral";
import { Identifier } from "../ast/Identifier";

export function toDataType(type: string): binaryen.Type {
  switch (type) {
    case "i32":
      return binaryen.i32;
    case "i64":
      return binaryen.i64;
    case "f32":
      return binaryen.f32;
    case "f64":
      return binaryen.f64;
    case "void":
      return binaryen.none;
    case "usize":
      return binaryen.i32;
    default:
      throw new Error(`Could not convert type '${type}' to wasm data type!`);
  }
}

export function getTypeNameOf(node: Node): string {
  if (node instanceof ParameterExpression) {
    if (!node.type) throw new Error(`Parameter '${node.name.data}' has no type`);
    return node.type.types[0];
  } else if (node instanceof VariableDeclaration) {
    if (!node.type) throw new Error(`Variable '${node.name.data}' has no type`);
    return node.type.types[0];
  } else if (node instanceof BinaryExpression) {
    return getTypeNameOf(node.left);
  } else if (node instanceof NumberLiteral) {
    return node.type?.types[0] ?? "i32";
  }

  throw new Error(`Could not discern the type of ${node.constructor.name}`);
}

export function getTypeOf(node: Node): binaryen.Type {
  return toDataType(getTypeNameOf(node));
}

export function getNameOf(node: Node): string {
  if (node instanceof Identifier) {
    return node.data;
  } else if (node instanceof ParameterExpression) {
    return node.name.data;
  } else if (node instanceof VariableDeclaration) {
    return node.name.data;
  } else {
    throw new Error(`Could not discern the type of expression`);
  }
}

// shitty af
export function writeLength(value: number): string {
  const high = (value >> 8) & 0xff;
  const low = value & 0xff;

  const highString =
    high > 9 ? high.toString() : high.toString().padStart(2, "0");
  const lowString = low > 9 ? low.toString() : low.toString().padStart(2, "0");

  return `\\${lowString}\\${highString}`;
}
