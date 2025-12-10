import { Range } from "../Range";

export class Node {
    public nameOf: string = "Node";
    public range: Range = new Range(
        {
            line: -1,
            column: -1
        },
        {
            line: -1,
            column: -1
        }
    );
}


export enum NodeKind {
    Source,
    While,
}