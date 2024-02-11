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
  (param $foo i32)
  (block
   (loop $a
    (call $printStr
     (i32.const 0)
    )
    (br $a)
   )
  )
 )
)