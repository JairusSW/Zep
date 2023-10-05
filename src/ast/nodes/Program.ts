import { Statement } from "./Statement.js";

export class Program {
    public statements: Statement[] = [];
    constructor(statements: Statement[] | null = null) {
        if (statements) this.statements = statements;
    }
}