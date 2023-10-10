`add.zp`

```rust
fn add(a: i32, b: i32) -> i32 {
    rt a + b
}
```

Build Web Assembly Text (wat) format

`zep build ./add.zp -o ./add.wat`

Compile to WebAssembly Binary

`wavm assemble ./add.wat ./add.wasm`

Run WebAssembly Binary

`wasmtime ./add.wasm --invoke add 1 2`

Recieve output

`3`