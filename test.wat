(module
 (import "env" "print" (func $print
   (param i32)
   (param i32)
  )
 )
 (memory $memory 5 5)
 (export "memory" (memory $memory))
 (data
  (i32.const 0)
  "hello world"
 )
 (export "main" (func $main))
 (func $main
  (call $print
   (i32.const 0)
   (i32.const 11)
  )
 )
)