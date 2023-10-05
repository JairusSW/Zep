export enum WasmType {
    I32
}

export function typeToString(type: WasmType): string {
    switch (type) {
        case WasmType.I32: return "i32"
    }
}