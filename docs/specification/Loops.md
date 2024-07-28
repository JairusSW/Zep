# Loops

## Design

```rust
#[extern]: env.print
fn print(data: i32) -> void

#[export]: main
fn main() -> void {
  print(5)

  for i in 0..5 {
    print(i)
  }

  let numbers = [6, 7, 8, 9, 10]

  for num in numbers {
    print(num)
  }
}
```
