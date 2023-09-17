import { TypeExpression } from "../nodes/TypeExpression.js";
import { TokenData } from "./tokenizer.js";
/*

export function parseType(text: string): TypeExpression | null {
    let union = false;
    let types = [];
    if (!isType(text)) {
        if (text.includes("|")) {
            for (const type of text.split("|")) {
                if (!isType(type.trim())) return null;
                types.push(type.trim());
            }
            union = true;
        } else {
            return null;
        }
    }
    return new TypeExpression(types || [text.trim()], union);
}
*/
export function isWhitespaceCode(code: number): boolean {
    return code === 32 || code === 10 || code === 9;
}

export function isWhitespace(char: string): boolean {
    return char === " " || char === "\n" || char === "\t";
}