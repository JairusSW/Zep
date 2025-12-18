declare function print(num: i32): void;

function factorial(n: i32): i32 {
  if (n == 0) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}

export function main(): void {
  const result = factorial(5);
  print(result);
}
