(module
 (import "env" "print" (func $print
   (param i32)
  )
 )
 (memory $memory 5 5)
 (export "memory" (memory $memory))
 (data
  (i32.const 0)
  "\0bHello, Zep!"
 )
 (export "main" (func $main))
 (func $main
  (block
   (call $print
    (i32.const 0)
   )
  )
 )
)