(module
 (import "env" "print"
  (func $print
    (param i32)
  )
 )
 (export "main" (func $main))
 (func $main
  (param $a i32)
  (param $b i32)
  (result i32)
  (local $c i32)
  (call $print
   (i32.const 123)
  )
  (i32.add
   (local.get $a)
   (local.get $b)
  )
 )
)