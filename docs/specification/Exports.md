# Exports

## Design

Imports allow top-level-statements exported to other files.

The syntax in Zep is like so

```rust
#[export]: alias-name
fn add(a: i32, b: i32) -> i32 {
    rt a + b
}
```
