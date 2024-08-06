"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tinybench_1 = require("tinybench");
const index_js_1 = require("../src/tokenizer/index.js");
const token_js_1 = require("../src/tokenizer/token.js");
const bench = new tinybench_1.Bench({ time: 5000 });
const cachelessTokenizer = new index_js_1.Tokenizer("i32? foo = 123\nfn add(a: i32, b: i32) -> i32 {\n\trt a + b\n}".repeat(100));
cachelessTokenizer.pauseState();
bench.add("(cache off) tk/s", () => {
    const tok = cachelessTokenizer.getToken();
    if (tok.token === token_js_1.Token.EOF) {
        cachelessTokenizer.resumeState();
    }
});
bench.run().then(() => {
    console.table(bench.table());
});
