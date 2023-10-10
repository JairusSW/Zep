<p align="center">
    <img width="800" src="https://raw.githubusercontent.com/JairusSW/Zep/master/assets/logo.svg" alt="logo">
    <br>
</p>

<p align="center">
Zep is a Homebrew compiler built from the ground up<br>
Nothing to see here until I release specs.<br><br>
</p>

<p align="center">
<i>
- Scene 001 -<br>
Gently it touches the ground,<br>
A footprint without a sound,<br>
Its form remarkably delicate,<br>
Creating code, light and intricate.<br>
In this Tyrant's paradise,<br>
hand-tuned control, yet precise.<br><br>
- Scene 002 -<br>
Welcome, Zep, our hero.<br>
In the realm of the One and Zero,<br>
where the ruler's grip, firm and tight<br>
the developer is given power, shining bright.<br><br>
- Scene 003 -<br>
Reveal to us this Zep, they pled<br>
If only it was ready, was said.<br>
And so there was silence oh so profound,<br>
Between the darkness and daybreak's sound.
</i>
</p>

`std:io.zp`
```
#[ref]: env
fn print(data: i32) -> void
```

`hello.zp`
```
// Global Scope
import "std:io/print"

string foo = "Hello from Zep!"

fn main() -> void {
    // Local Scope
    print(foo)
}
```

For more details, see [Reference.md](/docs/Reference.md)