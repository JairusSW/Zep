(module
    (import "env" "buffer" (memory 1))
    (import "env" "print" (func $print (param i32)))
    (data (i32.const 0) "\16length-prefixed string")
    (func (export "main")
        (call $print (i32.const 0))
    )
)