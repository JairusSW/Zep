<h6 align="center"><pre>███████ ███████ ██████  
   ███  ██      ██   ██ 
  ███   █████   ██████  
 ███    ██      ██      
███████ ███████ ██      </pre></h6>

# Zep

**Zep** is a TypeScript-inspired, statically typed programming language with clean syntax, powerful unions, structural typing, and a focus on developer ergonomics. Designed for simplicity and expressiveness.

[![npm](https://img.shields.io/npm/v/zep?color=blue)](https://www.npmjs.com/package/zep)
[![License](https://img.shields.io/github/license/JairusSW/zep.svg)](./LICENSE)

## ✨ Features

- **TypeScript-like types**: Unions (`A | B`), generics (`<T>`), structural records, type predicates
- **Clean syntax**: `fn name(a: i32): i32 { rt expr }`, `let x = 42`, `mut count: i32 = 0`
- **Smart narrowing**: `if (x is string) { ... }`, `if (isUser(x)) { ... }`
- **Borrowing & ownership**: `&T`, `&mut T`, `T*` with Rust-inspired safety
- **Pattern matching**: Exhaustive `match` with guards and destructuring
- **Go-style errors**: `(Result, Error | null)` tuples
- **Attributes**: `#[export]`, `#[extern("symbol")]`, `#[inline]`

## 💾 Installation

```bash
npm install zep

zep --help
zep run main.zep
zep build main.zep
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
    print("Result: ", result)  // Result: 8
}
```

```bash
zep main.zep
```

## 📚 Core Syntax Highlights

### Functions & Type Inference
```rust
fn parse(s: string): i32 | null {
    if (s is empty) { rt null }
    rt parse_int(s)
}
```

### Unions & Narrowing
```rust
fn process(x: i32 | string | null) {
    if (x is null) { return }
    if (x is string) {
        // x: string here
        print(x)
    } else {
        // x: i32 here
        print_int(x)
    }
}
```

### Structs with Defaults
```rust
struct User {
    id: i32
    name: string
    avatar: string | null = null
}
```

### Borrowing & Pointers
```rust
fn get_length(s: &string): i32 {
    rt s.length
}
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
