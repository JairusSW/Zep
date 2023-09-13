import { TypeExpression } from "../nodes/TypeExpression.js";

const builtinTypes = [
    "string",
    "bool",
    "fn",
    "ptr",
    "null",
    "i8",
    "i16",
    "i32",
    "i64",
    "u8",
    "u16",
    "u32",
    "u64",
    "f32",
    "f64",
];

export function isType(text: string): boolean {
    return builtinTypes.includes(text);
}

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

export function isWhitespaceCode(code: number): boolean {
    return code === 32 || code === 10 || code === 9;
}

export function isWhitespace(char: string): boolean {
    return char === " " || char === "\n" || char === "\t";
}