<h6 align="center"><pre>███████ ███████ ██████  
   ███  ██      ██   ██ 
  ███   █████   ██████  
 ███    ██      ██      
███████ ███████ ██      </pre></h6>

# Zep

**Zep** is a TypeScript-inspired systems language targeting WebAssembly and WASI first. The goal is approachable syntax with a performance-oriented compiler and explicit low-level escape hatches as the language matures.

[![npm](https://img.shields.io/npm/v/zep?color=blue)](https://www.npmjs.com/package/zep)
[![License](https://img.shields.io/github/license/JairusSW/zep.svg)](./LICENSE)

## Current Direction

- **WASM/WASI-first**: the compiler currently emits WebAssembly text for a small numeric subset.
- **Friendly syntax**: `fn name(a: i32): i32 { rt expr }`, `let x = 42`, `mut count: i32 = 0`.
- **Explicit host bindings**: `#[export]` and `#[extern("module.symbol")]`.
- **Growing systems model**: `usize`, memory/allocator modules, and future low-level pointer/slice APIs.
- **Planned type power**: structs, enums, unions, generics, pattern matching, and result-based errors.

## 💾 Installation

```bash
npm install zep

zep --help
zep build main.zp -o main.wat
```

## 🚀 Quick Start

`main.zep`

```rust
#[export]
fn add(a: i32, b: i32): i32 {
    rt a + b
}

#[export]
fn main(): void {
    let result = add(5, 3)
    print(result)
}
```

```bash
zep build main.zp -o main.wat
```

## 📚 Core Syntax Highlights

### Functions

```rust
fn square(x: i32): i32 {
    rt x * x
}
```

### Variables

```rust
let answer: i32 = 42
mut count: i32 = 0
```

### Structs

```rust
struct User {
    id: i32
    name: string
}
```

### Host Bindings

```rust
#[extern("env.print")]
fn print(value: i32): void
```

## 🛠️ Development

```bash
# Build from source
npm run build

# Run tests
npm test

# Format code
npm run format
```

## 📖 Documentation

You can find the language reference here: [Language Reference](./docs/Reference.md)

Full language reference: [zep.jairus.dev](https://zep.jairus.dev/zep)

## 🤝 Contributing

Contributions welcome! See the [contributing guidelines](CONTRIBUTING.md).

## 📃 License

This project is distributed under the [MIT License](./LICENSE).

## 📫 Contact

Please send all issues to [GitHub Issues](https://github.com/JairusSW/zep/issues)

- **Email:** [me@jairus.dev](mailto:me@jairus.dev)
- **GitHub:** [JairusSW/zep](https://github.com/JairusSW/zep)
- **Website:** [jairus.dev](https://jairus.dev/)
- **Discord:** [My Discord](https://discord.com/users/600700584038760448) or [Zep Discord](https://discord.gg/zep-lang) (coming soon)
