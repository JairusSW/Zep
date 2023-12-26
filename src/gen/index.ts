import {
  i32,
  i64,
  func,
  Module
} from "wasmati";

(async () => {
  const add = func({ in: [i32, i32], out: [i32] }, ([x, y]) => {
    i32.add(x, y)
  });

  let module = Module({ exports: { add } });
  let { instance } = await module.instantiate();

  let result = instance.exports.add(45, 12);
  console.log({ result });
})();