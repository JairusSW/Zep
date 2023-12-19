import { Scope } from "../checker/scope/Scope.js";
import { Statement } from "./nodes/Statement.js";

export class Program {
  public topLevelStatements: Statement[] = [];
  public statements: Statement[] = [];
  public globalScope: Scope = new Scope();
  constructor(
    public name: string,
    statements: Statement[] | null = null,
    topLevelStatements: Statement[] | null = null,
  ) {
    if (statements) this.statements = statements;
  }
}
