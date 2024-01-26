# Imports

## Design

Imports allow top-level-statements to be accessed from other files.

The syntax in Zep is like so

```rust
import "file.zp" as foo
```

```rust
import "file.zp" as { foo, bar, baz }

foo();
bar();
baz();
```

If no `as` option is supplied, the exports are attached to the namespace of the file's name.