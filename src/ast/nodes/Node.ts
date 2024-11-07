import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export type Node = Statement | Expression;

export enum NodeKind {
    Source,
    While,
}