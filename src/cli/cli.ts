import chalk from "chalk";

const args = process.argv.slice(2);

const forest = chalk.bold.rgb(90, 172, 124);
if (!args.length) {
    console.log(`${forest("Zep:")} a homebrew compiler built from the ground up. ${chalk.dim(" (0.0.0)")}\n`);
    console.log(`     ${forest("run")}    ${chalk.dim("./main.zp")}                    Run a Zep program`);
    console.log(`     ${forest("build")}  ${chalk.dim("./main.zp -o ./main.wasm")}     Compile a Zep program to WebAssembly`);
    console.log(`     ${forest("init")}                                Initialize a Zep project`);
}