import { Range } from "../Range.js";
import { Expression } from "./Expression.js";
import { NodeKind } from "./Node.js";
import { Statement } from "./Statement.js";

export class WhileStatement extends Statement {
    public kind = NodeKind.While;
    public nameOf: string = "WhileStatement";
    public condition: Expression;
    public body: Statement;
    constructor(condition: Expression, body: Statement, range: Range) {
        super();
        this.condition = condition;
        this.body = body;
        this.range = range;
    }
}
