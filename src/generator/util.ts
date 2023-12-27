import { w } from 'wazum';
import { Expression } from '../ast/nodes/Expression';
import { ReferenceExpression } from '../ast/nodes/ReferenceExpression';
import { ParameterExpression } from '../ast/nodes/ParameterExpression';
import { VariableDeclaration } from '../ast/nodes/VariableDeclaration';
import { Node } from '../ast/nodes/Node';
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

export function toNumericType(type: string): w.NumericDataType {
  switch (type) {
    case "i32":
    case "i64":
    case "f32":
    case "f64": return type as w.NumericDataType;
    default: throw new Error(`Could not convert type '${type}' to wasm numeric type!`);
  }
}


export function getTypeOf(node: Node): w.NumericDataType {
  if (node instanceof ReferenceExpression) {
    return getTypeOf(node.referencing);
  } else if (node instanceof ParameterExpression) {
    return toNumericType(node.type?.types[0]!);
  } else if (node instanceof VariableDeclaration) {
    return toNumericType(node.type.types[0]);
  } else {
    throw new Error(`Could not discern the type of expression`);
  }
}

export function getNameOf(node: Node): string {
  if (node instanceof ReferenceExpression) {
    return getTypeOf(node.referencing);
  } else if (node instanceof ParameterExpression) {
    return node.name.data;
  } else if (node instanceof VariableDeclaration) {
    return node.name.data;
  } else {
    throw new Error(`Could not discern the type of expression`);
  }
}