(module
  ;; Import the external function 'env.print' (equivalent to print in the original code)
  (import "env" "print" (func $print (param i32)))

  ;; Define the factorial function
  (func $factorial (param $n i32) (result i32)
    ;; Local variables
    (local $result i32)

    ;; If statement: if (n == 0)
    (if (result i32)
      (i32.eq (local.get $n) (i32.const 0))
      ;; Then block: rt 1
      (then
        (i32.const 1)
      )
      ;; Else block: rt n * factorial(n - 1)
      (else
        ;; Recursive call to factorial(n - 1)
        (call $factorial (i32.sub (local.get $n) (i32.const 1)))
        (local.set $result)
        (i32.mul (local.get $n) (local.get $result))
      )
    )
  )

  ;; Define the main function
  (func $main (param $result i32)
    ;; Calculate factorial(5)
    (i32.const 5)
    (call $factorial)

    ;; Call print with the result
    (call $print (local.get $result))
  )

  ;; Export the main function so that it can be called externally
  (export "main" (func $main))
)
