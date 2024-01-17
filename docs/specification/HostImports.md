# Host Imports

## Design

Host Imports allow Zep to interact with the greater world. The security of these values and functions is controlled by the host runtime.

```rust
#[extern]: env.print
fn print(data: i32) -> none
```

This imports a function provided by the host from the namespace `env`` and the name `print`and assigns all calls to`print` to instead call the host function.
