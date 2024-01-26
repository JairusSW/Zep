(module
 (import "env" "printStr" (func $printStr
   (param i32)
  )
 )
 (import "env" "printNum" (func $printNum
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
   (call $printNum
    (i32.const 5)
   )
   (call $printStr
    (i32.const 0)
   )
  )
 )
)