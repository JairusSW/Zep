import { Scope } from "../checker/scope/Scope.js";
import { Parser } from "../parser/index.js";
import { Tokenizer } from "../tokenizer/index.js";
import { Declaration } from "./nodes/Declaration.js";
import { NodeKind } from "./nodes/Node.js";
import { Statement } from "./nodes/Statement.js";

export class Source {
  public kind = NodeKind.Source;
  public sourceKind: SourceKind;
  public fileName: string;
  public tokenizer: Tokenizer;
  public parser!: Parser;

  public topLevelStatements: Statement[] = [];
  public statements: Statement[] = [];
  public globalScope: Scope = new Scope();
  constructor(
    fileName: string,
    text: string,
    sourceKind: SourceKind
  ) {
    this.fileName = fileName;
    this.tokenizer = new Tokenizer(text);
    this.sourceKind = sourceKind;
  }
  parse(): Source {
    this.parser.parseSource();
    return this;
  }
}

export enum SourceKind {
  User = 1,
  UserEntry = 2,
  Library = 3,
  LibraryEntry = 4
}