import { EnumDeclaration } from "./EnumDeclaration";
import { FunctionDeclaration } from "./FunctionDeclaration";
import { FunctionImportDeclaration } from "./FunctionImportDeclaration";
import { ImportDeclaration } from "./ImportDeclaration";
import { ImportFromDeclaration } from "./ImportFromDeclaration";
import { VariableDeclaration } from "./VariableDeclaration";

export type Declaration = FunctionDeclaration | FunctionImportDeclaration | VariableDeclaration | ImportDeclaration | ImportFromDeclaration | EnumDeclaration;