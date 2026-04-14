## Functions

```ts
fn add(a: i32, b: i32): i32 {
    rt a + b
}

fn square(x: i32): i32 {
    rt x * x
}
```

- Return types are written after `:`.
- `rt` is the canonical explicit return form.
- Extern declarations may omit a body when annotated with `#[extern("module.symbol")]`.

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

**Primitives:** `void`, `bool`, `i32`, `i64`, `f32`, `f64`, `usize`, `string`

**Structs:**

```ts
struct Point {
    x: i32
    y: i32 = 0
}
```

Unions, tuples, arrays, generics, type predicates, and pattern matching are planned features, not stable surface area yet.

## Control Flow

**If (statement):**

```ts
if x > 0 {
  print(x)
}
```

**Loops:**

```ts
while x > 0 {
    // ...
}
```

`for`, `match`, labeled jumps, and ternary expressions are planned.

## Modules & Attributes

**Imports:**

```ts
import "std/io"
// Named imports and aliases are planned.
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

**Supported attributes:** `#[export]`, `#[export(alias = "...")]`, `#[extern("...")]`.

## Planned Result Errors

```ts
struct Error {
    code: i32
    message: string
}
```

The intended error model is `Result<T, E>` rather than Go-style `(value, err)` tuples.

---

This reference documents the conservative syntax baseline. Future features should be added here only when parser, formatter, checker, and examples are updated together.
