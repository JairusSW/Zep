import { Node, NodeKind } from "./ast/Node";
import { Statement } from "./ast/Statement";
import { Source } from "./source";

export class Program extends Node {
  readonly source: Source;
  readonly statements: Node[];
  constructor(source: Source, statements: Statement[] = []) {
    super(NodeKind.Program);
    this.source = source;
    this.statements = statements;
  }
}
