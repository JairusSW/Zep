import { Statement } from "./ast";
import { Node, NodeKind } from "./ast/Node";
import { Tokenizer } from "./tokenizer";

export class Source extends Node {
  public kind = NodeKind.Source;
  public sourceKind: SourceKind;
  public fileName: string;
  public text: string;
  public statements: Statement[];
  public tokenizer!: Tokenizer;
  constructor(
    fileName: string,
    text: string,
    sourceKind: SourceKind,
    statements: Statement[] = [],
  ) {
    super(NodeKind.Source);
    this.fileName = fileName;
    this.text = text;
    this.sourceKind = sourceKind;
    this.statements = statements;
  }
}

export enum SourceKind {
  User = 1,
  UserEntry = 2,
  Library = 3,
  LibraryEntry = 4,
}
