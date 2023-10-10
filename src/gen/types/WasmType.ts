export enum WasmType {
    I32,
    Data,
    Void
}

export function typeToString(type: WasmType): string {
    switch (type) {
        case WasmType.I32: return "i32";
        case WasmType.Data: return "data";
        case WasmType.Void: return "void"
    }
}