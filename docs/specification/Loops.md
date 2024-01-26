# Loops

## Design


```rust
#[extern]: env.print
fn print(data: i32) -> none

#[export]: main
fn main() -> none {
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