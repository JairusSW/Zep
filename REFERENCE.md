## Functions

```ts
fn add(a: i32, b: i32): i32 {
    rt a + b
}

fn parse(s: string) {  // inferred: string -> i32 | null
    if (s is empty) {
        rt null
    }
    rt parse_int(s)
}
```

- Return types after `:`, optional (inferred from `rt` expressions).
- `rt` for explicit returns; last expression may implicitly return if no `rt`.
- Type predicates: `fn isString<T>(x: T): T is string { ... }`

**Lambdas:**

```ts
let double = (x: i32): i32 => x * 2
let complex = (x: i32): i32 => {
    let y = x + 1
    rt y * 2
}
```

## Variables

Immutable by default:

```ts
let x = 42           // inferred i32
let name: string = "world"
mut count: i32 = 0   // mutable
mut counter = 0      // inferred i32
```

- `let`: immutable binding
- `mut name: Type = value`: mutable binding (type optional if inferable)

## Types

**Primitives:** `i32`, `i64`, `f32`, `bool`, `string`, `null`

**Tuples:** `(i32, string)`

```ts
let pair = (42, "hello")
let (num, msg) = pair
let first = pair.0
```

**Unions:** `string | i32 | null`

- Narrowing: `if (x is string) { ... }`

**Structs:**

```ts
struct Point {
    x: i32
    y: i32 = 0
}

let p = Point { x: 10 }
```

**Generics:**

```ts
fn first<T>(arr: [T]): T | null { ... }
struct Box<T> { value: T }
```

## Control Flow

**If (statement):**

```ts
if (x > 0) {
  print("positive");
}
```

**Ternary (expression):**

```ts
let msg = x > 0 ? "pos" : "neg";
```

**Loops:**

```ts
for i in 0..10 {     // exclusive upper
    print(i)
}

while (cond) {
    // ...
}

outer: while (true) {
    inner: for x in items {
        jump outer      // break outer
        jump inner      // continue inner
    }
}
```

**Match:**

```ts
match value {
    case n is i32 && n > 0 { ... }
    case s is string { ... }
    default { ... }
}
```

## Modules & Attributes

**Imports:**

```ts
import "std/io"
import { print } from "std/io"
import "std/io" as io
```

**Exports:**

```ts
#[export]
fn public_fn() { ... }

#[export(alias = "add_numbers")]
fn add(a: i32, b: i32): i32 { ... }

#[extern("env.log")]
fn log(msg: string): void
```

**Supported attributes:** `#[export]`, `#[export(alias = "...")]`, `#[extern("...")]`, `#[inline]`

## Narrowing

```ts
fn process(x: i32 | string | null) {
    if (x is null) {
        return
    }
    if (x is string) {
        // x: string
        print(x)
    } else {
        // x: i32
        print_int(x)
    }
}
```

**Type predicates:**

```ts
if (isUser(x)) {
  // x narrowed to User
}
```

## Overloading & Named Arguments

```ts
fn greet(name: string) { ... }
fn greet(age: i32) { ... }

greet(name: "alice")
greet(age: 30)
```

Resolution: exact type/arity match or error.

## Error Handling

```ts
fn read_file(path: string): (string, Error) {
    // ...
}

let (content, err) = read_file("file.txt")
if (err is Error) {
    print("Error: ", err.message)
}
```

---

This covers the core you've designed so far. Next would be enums, full `impl` syntax, and stdlib sketches.
