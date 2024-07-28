import { expect, test, describe } from "bun:test";
import { Tokenizer } from "../src/tokenizer";
import { Parser } from "../src/parser";
import { StringLiteral } from "../src/ast/nodes/StringLiteral";
import { NumberLiteral } from "../src/ast/nodes/NumberLiteral";
import { Scope } from "../src/checker/scope/Scope";
import { ReturnStatement } from "../src/ast/nodes/ReturnStatement";
import { BinaryExpression } from "../src/ast/nodes/BinaryExpression";
import { ReferenceExpression } from "../src/ast/nodes/ReferenceExpression";

let testScope: Scope | null = null;
describe("Should parse Expressions", () => {
  test(`
    1024
  `, () => {
    const tokenizer = new Tokenizer(`
      1024
    `);
    const parser = new Parser(tokenizer, "test.zp");
    const node = parser.parseNumberLiteral();

    expect(node?.data).toBe("1024");
  });

  test(`
    "this is a string"
  `, () => {
    const tokenizer = new Tokenizer(`
      "this is a string"
    `);
    const parser = new Parser(tokenizer, "test.zp");
    const node = parser.parseStringLiteral();

    expect(node?.data).toBe("this is a string");
  });
});

describe("Should parse Statements", () => {
  test(`
    #[extern]: env.print
    fn print(data: i32) -> void
  `, () => {
    const tokenizer = new Tokenizer(`
    #[extern]: env.print
    fn print(data: i32) -> void
  `);
    const parser = new Parser(tokenizer, "test.zp");
    const node = parser.parseFunctionImport();

    expect(node?.name.data).toBe("print");
    expect(node?.path.data).toBe("env.print");
    expect(node?.parameters.length).toBe(1);
    expect(node?.parameters[0].name.data).toBe("data");
    expect(node?.parameters[0].type?.types[0]).toBe("i32");
    expect(node?.returnType.types[0]).toBe("void");
    expect(parser.program.globalScope.has(node?.name.data!)).toBe(true);

    testScope = parser.program.globalScope;
  });

  test(`
    str foo = "bar"
  `, () => {
    const tokenizer = new Tokenizer(`
      str foo = "bar"
    `);
    const parser = new Parser(tokenizer, "test.zp");
    const node = parser.parseVariableDeclaration();

    expect(node?.mutable).toBe(false);
    expect(node?.name.data).toBe("foo");
    expect((node?.value as StringLiteral).data).toBe("bar");
  });

  test(`
    print(123)
  `, () => {
    const tokenizer = new Tokenizer(`
      print(123)
    `);
    const parser = new Parser(tokenizer, "test.zp");
    const node = parser.parseCallExpression();

    expect(node?.calling.data).toBe("print");
    expect(node?.parameters.length).toBe(1);
    expect((node?.parameters[0] as NumberLiteral).data).toBe("123");
    expect(testScope?.has(node?.calling.data!)).toBe(true);

    testScope = null;
  });

  test(`
    fn add(a: i32, b: i32) -> i32 {
      rt a + b
    }
  `, () => {
    const tokenizer = new Tokenizer(`
    fn add(a: i32, b: i32) -> i32 {
      rt a + b
    }
  `);
    const parser = new Parser(tokenizer, "test.zp");
    const node = parser.parseFunctionDeclaration();

    expect(node?.name.data).toBe("add");

    expect(node?.parameters.length).toBe(2);

    expect(node?.parameters[0].name.data).toBe("a");
    expect(node?.parameters[0].type?.types.length).toBe(1);
    expect(node?.parameters[0].type?.types[0]).toBe("i32");

    expect(node?.parameters[1].name.data).toBe("b");
    expect(node?.parameters[1].type?.types.length).toBe(1);
    expect(node?.parameters[1].type?.types[0]).toBe("i32");

    expect(node?.returnType.types.length).toBe(1);
    expect(node?.returnType.types[0]).toBe("i32");

    expect(node?.block.statements.length).toBe(1);

    expect(
      (
        (
          (node?.block.statements[0] as ReturnStatement)
            .returning as BinaryExpression
        ).left as ReferenceExpression
      ).referencing as Iden,
    );

    expect(parser.program.globalScope.has(node?.name.data!)).toBe(true);

    testScope = parser.program.globalScope;
  });
});
