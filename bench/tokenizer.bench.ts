import { Bench } from "tinybench";
import { Token, Tokenizer } from "../src/tokenizer/tokenizer.js";

const bench = new Bench({ time: 5000 });

const cachelessTokenizer = new Tokenizer("i32? foo = 123\nfn add(a: i32, b: i32) -> i32 {\n\trt a + b\n}".repeat(100));
cachelessTokenizer.freeze();
bench.add("(cache off) tk/s", () => {
    const tok = cachelessTokenizer.getToken();
    if (tok.token === Token.EOF) {
        cachelessTokenizer.release();
    }
});

const cacheTokenizer = new Tokenizer("i32? foo = 123\nfn add(a: i32, b: i32) -> i32 {\n\trt a + b\n}".repeat(100), true);
cacheTokenizer.freeze();

bench.add("(cache on) tk/s", () => {
    const tok = cacheTokenizer.getToken();
    if (tok.token === Token.EOF) {
        cacheTokenizer.release();
    }
});

bench.run().then(() => {
    console.table(bench.table());
});