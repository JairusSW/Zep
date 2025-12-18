"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const tokenizer_1 = require("../src/tokenizer");
const parser_1 = require("../src/parser");
let testScope = null;
(0, bun_test_1.describe)("Should parse Expressions", () => {
  (0, bun_test_1.test)(
    `
    1024
  `,
    () => {
      const tokenizer = new tokenizer_1.Tokenizer(`
      1024
    `);
      const parser = new parser_1.Parser(tokenizer, "test.zp");
      const node = parser.parseNumberLiteral();
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.data,
      ).toBe("1024");
    },
  );
  (0, bun_test_1.test)(
    `
    "this is a string"
  `,
    () => {
      const tokenizer = new tokenizer_1.Tokenizer(`
      "this is a string"
    `);
      const parser = new parser_1.Parser(tokenizer, "test.zp");
      const node = parser.parseStringLiteral();
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.data,
      ).toBe("this is a string");
    },
  );
});
(0, bun_test_1.describe)("Should parse Statements", () => {
  (0, bun_test_1.test)(
    `
    #[extern]: env.print
    fn print(data: i32) -> void
  `,
    () => {
      var _a;
      const tokenizer = new tokenizer_1.Tokenizer(`
    #[extern]: env.print
    fn print(data: i32) -> void
  `);
      const parser = new parser_1.Parser(tokenizer, "test.zp");
      const node = parser.parseFunctionImport();
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.name.data,
      ).toBe("print");
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.path.data,
      ).toBe("env.print");
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.parameters.length,
      ).toBe(1);
      (0, bun_test_1.expect)(
        node === null || node === void 0
          ? void 0
          : node.parameters[0].name.data,
      ).toBe("data");
      (0, bun_test_1.expect)(
        (_a =
          node === null || node === void 0
            ? void 0
            : node.parameters[0].type) === null || _a === void 0
          ? void 0
          : _a.types[0],
      ).toBe("i32");
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.returnType.types[0],
      ).toBe("void");
      (0, bun_test_1.expect)(
        parser.program.globalScope.has(
          node === null || node === void 0 ? void 0 : node.name.data,
        ),
      ).toBe(true);
      testScope = parser.program.globalScope;
    },
  );
  (0, bun_test_1.test)(
    `
    str foo = "bar"
  `,
    () => {
      const tokenizer = new tokenizer_1.Tokenizer(`
      str foo = "bar"
    `);
      const parser = new parser_1.Parser(tokenizer, "test.zp");
      const node = parser.parseVariableDeclaration();
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.mutable,
      ).toBe(false);
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.name.data,
      ).toBe("foo");
      (0, bun_test_1.expect)(
        (node === null || node === void 0 ? void 0 : node.value).data,
      ).toBe("bar");
    },
  );
  (0, bun_test_1.test)(
    `
    print(123)
  `,
    () => {
      const tokenizer = new tokenizer_1.Tokenizer(`
      print(123)
    `);
      const parser = new parser_1.Parser(tokenizer, "test.zp");
      const node = parser.parseCallExpression();
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.calling.data,
      ).toBe("print");
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.parameters.length,
      ).toBe(1);
      (0, bun_test_1.expect)(
        (node === null || node === void 0 ? void 0 : node.parameters[0]).data,
      ).toBe("123");
      (0, bun_test_1.expect)(
        testScope === null || testScope === void 0
          ? void 0
          : testScope.has(
              node === null || node === void 0 ? void 0 : node.calling.data,
            ),
      ).toBe(true);
      testScope = null;
    },
  );
  (0, bun_test_1.test)(
    `
    fn add(a: i32, b: i32) -> i32 {
      rt a + b
    }
  `,
    () => {
      var _a, _b, _c, _d;
      const tokenizer = new tokenizer_1.Tokenizer(`
    fn add(a: i32, b: i32) -> i32 {
      rt a + b
    }
  `);
      const parser = new parser_1.Parser(tokenizer, "test.zp");
      const node = parser.parseFunctionDeclaration();
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.name.data,
      ).toBe("add");
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.parameters.length,
      ).toBe(2);
      (0, bun_test_1.expect)(
        node === null || node === void 0
          ? void 0
          : node.parameters[0].name.data,
      ).toBe("a");
      (0, bun_test_1.expect)(
        (_a =
          node === null || node === void 0
            ? void 0
            : node.parameters[0].type) === null || _a === void 0
          ? void 0
          : _a.types.length,
      ).toBe(1);
      (0, bun_test_1.expect)(
        (_b =
          node === null || node === void 0
            ? void 0
            : node.parameters[0].type) === null || _b === void 0
          ? void 0
          : _b.types[0],
      ).toBe("i32");
      (0, bun_test_1.expect)(
        node === null || node === void 0
          ? void 0
          : node.parameters[1].name.data,
      ).toBe("b");
      (0, bun_test_1.expect)(
        (_c =
          node === null || node === void 0
            ? void 0
            : node.parameters[1].type) === null || _c === void 0
          ? void 0
          : _c.types.length,
      ).toBe(1);
      (0, bun_test_1.expect)(
        (_d =
          node === null || node === void 0
            ? void 0
            : node.parameters[1].type) === null || _d === void 0
          ? void 0
          : _d.types[0],
      ).toBe("i32");
      (0, bun_test_1.expect)(
        node === null || node === void 0
          ? void 0
          : node.returnType.types.length,
      ).toBe(1);
      (0, bun_test_1.expect)(
        node === null || node === void 0 ? void 0 : node.returnType.types[0],
      ).toBe("i32");
      (0, bun_test_1.expect)(
        node === null || node === void 0
          ? void 0
          : node.block.statements.length,
      ).toBe(1);
      (0, bun_test_1.expect)(
        (node === null || node === void 0 ? void 0 : node.block.statements[0])
          .returning.left.referencing,
      );
      (0, bun_test_1.expect)(
        parser.program.globalScope.has(
          node === null || node === void 0 ? void 0 : node.name.data,
        ),
      ).toBe(true);
      testScope = parser.program.globalScope;
    },
  );
});
