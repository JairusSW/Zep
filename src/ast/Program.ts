import { Parser } from "../parser";
import { Source, SourceKind } from "./Source";

export class Program {
    public sources: Source[];
    public entry!: Source;
    constructor(sources: Source[]) {
        this.sources = sources;
        const entrySource = this.sources.filter(v => v.sourceKind == SourceKind.UserEntry);
        if (entrySource.length > 1) throw new Error("Cannot have more than two entry files!");
        for (const source of this.sources) {
            if (source.sourceKind === SourceKind.UserEntry) this.entry = source;
            source.parser = new Parser(source, this);
        }
    }
}