(module
 (type $0 (func (param i32) (result i32)))
 (memory $0 0)
 (export "fib" (func $fib))
 (export "memory" (memory $0))
 (func $fib (param $n i32) (result i32)
  (local $a i32)
  (local $b i32)
  (local $t i32)
  i32.const 1
  local.set $b
  local.get $n
  i32.const 0
  i32.gt_s
  if
   loop $lp-0
    local.get $n
    i32.const 1
    i32.sub
    local.tee $n
    if
     local.get $b
     local.get $a
     i32.add
     local.set $t
     local.get $b
     local.set $a
     local.get $t
     local.set $b
     br $lp-0
    end
   end
   local.get $b
   return
  end
  i32.const 0
 )
)
