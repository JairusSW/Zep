import { CompileTimeError } from "../error/error";

export function assert(
  condition: boolean,
  error: CompileTimeError,
): asserts condition {
  if (!condition) error.throw();
}
