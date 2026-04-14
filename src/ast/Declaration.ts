import { EnumDeclaration } from "./EnumDeclaration";
import { FunctionDeclaration } from "./FunctionDeclaration";
import { ImportDeclaration } from "./ImportDeclaration";
import { VariableDeclaration } from "./VariableDeclaration";

export type Declaration =
  | FunctionDeclaration
  | VariableDeclaration
  | ImportDeclaration
  | EnumDeclaration;
