# Memory

## Design

Zep caters to developers that desire to control every aspect of their code. It means to fill a spot of a mid-level language that is transparent, allowing the developer to know *exactly* what is happening.

To achieve this, Zep is shipped without a Garbage Collector by default. Instead, it will require the dev to call

`malloc`
`realloc`
`free`

Manually.

Zep will automatically clean up after a scope is finished or a reference falls out of authority.

With its debugging features and `.zpl` configuration format, it will be possible to manage these cases and edit each implied call individually.