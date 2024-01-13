(module
 (import "env" "print" (func $print
   (param i32)
  )
 )
 (memory $memory 5 5)
 (export "memory" (memory $memory))
 (data
  (i32.const 0)
  "\11\00hello world"
 )
 (export "main" (func $main))
 (func $main
  (call $print
   (i32.const 0)
  )
 )
)