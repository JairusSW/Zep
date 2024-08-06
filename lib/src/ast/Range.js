"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Range = exports.RangeData = void 0;
class RangeData {
    constructor() {
        this.line = 0;
        this.column = 0;
    }
}
exports.RangeData = RangeData;
class Range {
    // public source: Source;
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    static from(start, end) {
        return new Range(start.start, end.end);
    }
}
exports.Range = Range;
