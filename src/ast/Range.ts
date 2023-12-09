import { Program } from "./Program";

export class Range {
    public line: number;
    public start: number;
    public end: number;
    constructor(line: number, start: number, end: number) {
        this.line = line;
        this.start = start;
        this.end = end;
    }
}