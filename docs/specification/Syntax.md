# Syntax

## Variables

Variables hold a specific `value` to its `reference`. They can be expressed as

`string? foo = "bar"`

> The `?` following the type represents its mutability. Without it, the variable is declared immutable.

## Functions

Functions contain blocks of code that may be executed multiple times. They can be expressed as

```
fn add(a: i32, b: i32) -> i32 {
    rt a + b
}
```

> If the return type is `none`, no result needs to be returned and `rt none` is implied.

## Imported Functions

Imported functions link a function supplied by the `host` and make it callable by Zep. They can be expressed as

```
#[extern]: env
fn print(data: string) -> none
```

> The name of the function is imported from the specified namespace. In this case, `env`.

## Function Calls

Function calls execute a function with given param(s). They can be expressed as

```
print("Hello... Its me, Zep!")
```

## Import Module

Imports will bind a module's exports to a reference. They can be expressed as

```
import "std:io"

print("Hello Standard Libarary Print!")
```

## Modifiers

Modifiers are used as a marker, specifying the behavior of any element. They can be expressed as

```
#[extern]: env
fn print(data: string) -> none

#[inline]
fn add(a: i32, b: i32) -> i32 {
    rt a + b
}
```
