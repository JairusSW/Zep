import { Bench } from "tinybench";
import { Tokenizer } from "../src/tokenizer/tokenizer.js";
import { Token } from "../src/tokenizer/token.js";

const bench = new Bench({ time: 5000 });

const cachelessTokenizer = new Tokenizer(
  "i32? foo = 123\nfn add(a: i32, b: i32) -> i32 {\n\trt a + b\n}".repeat(100),
);
cachelessTokenizer.pauseState();
bench.add("(cache off) tk/s", () => {
  const tok = cachelessTokenizer.getToken();
  if (tok.token === Token.EOF) {
    cachelessTokenizer.resumeState();
  }
});

bench.run().then(() => {
  console.table(bench.table());
});
