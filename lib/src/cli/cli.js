"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const index_js_1 = require("../parser/index.js");
const index_js_2 = require("../tokenizer/index.js");
const index_js_3 = require("../generator/index.js");
(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    const args = process.argv.slice(2);
    if (!args.length) {
      console.log(
        chalk_1.default.bold.blueBright("Zep") +
          " is a homebrew compiler built from the ground up." +
          "\n",
      );
      console.log(
        chalk_1.default.bold(
          "Usage: zpc <command> " +
            chalk_1.default.cyanBright("[...flags]") +
            " [...args]",
        ) + "\n",
      );
      console.log(chalk_1.default.bold("Commands:") + "\n");
      console.log(
        `  ${chalk_1.default.bold.blueBright("run")}    ${chalk_1.default.dim("./main.zp")}                    Run a Zep program`,
      );
      console.log(
        `  ${chalk_1.default.bold.blueBright("build")}  ${chalk_1.default.dim("./main.zp -o ./main.wasm")}     Compile a Zep program to WebAssembly`,
      );
      console.log(
        `  ${chalk_1.default.bold.blueBright("init")}                                Initialize a Zep project`,
      );
    } else if (args[0] === "build") {
      yield build();
    } else if (args[0] === "run") {
      const input = args[1];
      if (input.endsWith(".wat")) {
        Bun.spawnSync([
          `wat2wasm ${input} -o ${input.slice(0, input.length - 4)}.wasm`,
        ]);
      }
    }
    function build() {
      return __awaiter(this, void 0, void 0, function* () {
        const start = Date.now();
        const input = args[1];
        console.log(
          `${chalk_1.default.blueBright("Zep Compiler")} ${chalk_1.default.dim("(0.0.0)")}`,
        );
        const inputFile = Bun.file(input);
        const output = args[args.indexOf("-o") + 1];
        console.log(chalk_1.default.bold.dim(`${input} > ${output}`));
        if (output.endsWith(".wat")) {
          console.log(chalk_1.default.dim("Target: WAT\n"));
        } else if (output.endsWith(".wasm")) {
          console.log(chalk_1.default.dim("Target: WASM\n"));
        }
        const inputText = yield inputFile.text();
        const tokenizer = new index_js_2.Tokenizer(inputText);
        const parser = new index_js_1.Parser(tokenizer, input);
        parser.parseFunctionImport();
        parser.parseFunctionDeclaration();
        const connector = new index_js_3.Generator();
        connector.parseProgram(parser.program);
        const watText = connector.toWat();
        yield Bun.write(output, watText);
        console.log("\n" + chalk_1.default.dim(watText) + "\n");
        console.log(
          chalk_1.default.dim("Done in " + (Date.now() - start) + "ms"),
        );
      });
    }
  }))();
