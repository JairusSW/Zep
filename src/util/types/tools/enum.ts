export function enumToString<T extends {}>(e: T, value: T[keyof T]): string {
    return Object.keys(e).find(key => e[key as keyof T] === value) || "";
}