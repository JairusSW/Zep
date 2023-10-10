const binary = Bun.file("./build/strings.build.wasm");

const module = new WebAssembly.Module(await binary.arrayBuffer());
const memory = new WebAssembly.Memory({ initial: 1, maximum: 1});
const instance = new WebAssembly.Instance(module, {
    env: {
        buffer: memory,
        print: (ptr: number) => {
            const len = new Uint8Array(memory.buffer, ptr, 1)[0];
            const bytes = new Uint8Array(memory.buffer, ptr + 1, len);
            const str = String.fromCharCode(...bytes);
            console.log(str);
        }
    }
});

instance.exports.main()

// wavm assemble ./build/strings.wat ./build/strings.wasm