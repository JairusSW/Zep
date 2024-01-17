`hello.zp`

```rust
#[extern]: env
fn print(data: *string) -> none

fn main() -> none {
    print("Hi there... Its me, Zep!")
}
```

Build Web Assembly Text (wat) format

`zep build ./hello.zp -o ./hello.wat`

Compile to WebAssembly Binary

`wavm assemble ./hello.wat ./hello.wasm`

Run WebAssembly Binary

```js
const binary = fs.readFileSync("hello.wasm");
//const binary = Bun.file("hello.wasm");

const module = new WebAssembly.Module(await binary.arrayBuffer());
const memory = new WebAssembly.Memory({ initial: 1, maximum: 1});
const instance = new WebAssembly.Instance(module, {
    env: {
        buffer: memory,
        print: (ptr: number) => {
            const len = new Uint8Array(memory.buffer, ptr, 1)[0];
            const bytes = new Uint8Array(memory.buffer, ptr + 1, len);
            const str = String.fromCharCode(...bytes);
            console.log(str);
        }
    }
});

instance.exports.main();
```

Recieve output

`Hello there... Its me, Zep!`
