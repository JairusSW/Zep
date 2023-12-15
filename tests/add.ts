const binary = Bun.file("./build/add.wasm");

const module = new WebAssembly.Module(await binary.arrayBuffer());
const instance = new WebAssembly.Instance(module, {});

console.log(instance.exports.add(3, 9));
