# Functions

## Design

Functions are the foundation for Zep. As a functional-inpired language, the importance of functions are critical.

The syntax in Zep is like so

```rust
fn add(a: i32, b: i32) -> i32 {
    rt a + b
}
```

Any varibles created within the function's scope will be `free`'d when they fall out of reference.
