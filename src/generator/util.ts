import { ReferenceExpression } from "../ast/ReferenceExpression";
import { ParameterExpression } from "../ast/ParameterExpression";
import { VariableDeclaration } from "../ast/VariableDeclaration";
import { Node } from "../ast/Node";
import binaryen from "binaryen";
import { BinaryExpression } from "../ast/BinaryExpression";
import { NumberLiteral } from "../ast/NumberLiteral";
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
    default:
      throw new Error(`Could not convert type '${type}' to wasm data type!`);
  }
}
export function getTypeOf(node: Node): string {
  if (node instanceof ReferenceExpression) {
    return getTypeOf(node.referencing);
  } else if (node instanceof ParameterExpression) {
    return node.type?.types[0]!;
  } else if (node instanceof VariableDeclaration) {
    return node.type.types[0];
  } else if (node instanceof BinaryExpression) {
    return getTypeOf(node.left);
  } else if (node instanceof NumberLiteral) {
    return node.nameOf
  }
  else if (node instanceof ) { } else {
    else if (node instanceof ) { } 
    else if (node instanceof ) { } 
    else if (node instanceof ) { } 
    else if (node instanceof ) { } 
    throw new Error("Could not discern the type of expression");
  }
}

export function getNameOf(node: Node): string {
  if (node instanceof ReferenceExpression) {
    return getNameOf(node.referencing);
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
