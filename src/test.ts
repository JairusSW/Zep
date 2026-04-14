import { describe, expect, test } from "bun:test";
import { BinaryExpression, BinaryOp } from "./ast/BinaryExpression";
import { BlockStatement } from "./ast/BlockStatement";
import { CallExpression } from "./ast/CallExpression";
import { FunctionDeclaration } from "./ast/FunctionDeclaration";
import { Identifier } from "./ast/Identifier";
import { IfStatement, IfStatementKind } from "./ast/IfStatement";
import { ImportDeclaration } from "./ast/ImportDeclaration";
import { NumberLiteral } from "./ast/NumberLiteral";
import { PropertyAccessExpression } from "./ast/PropertyAccessExpression";
import { ReturnStatement } from "./ast/ReturnStatement";
import { StructDeclaration } from "./ast/StructDeclaration";
import { VariableDeclaration } from "./ast/VariableDeclaration";
import { WhileStatement } from "./ast/WhileStatement";
import { Generator } from "./generator";
import { Parser } from "./parser";
import { Source, SourceKind } from "./source";

function parse(text: string): Source {
  const source = new Source("test.zp", text, SourceKind.UserEntry);
  const parser = new Parser([source]);
  parser.parseSource(source);
  return source;
}

describe("canonical syntax", () => {
  test("parses imports and extern/export attributes", () => {
    const source = parse(`
import "std/io"

#[extern("env.print")]
fn print(value: i32): void

#[export(alias = "add_numbers")]
fn add(a: i32, b: i32): i32 {
  rt a + b
}
`);

    expect(source.statements[0]).toBeInstanceOf(ImportDeclaration);
    expect((source.statements[0] as ImportDeclaration).path.data).toBe("std/io");

    const print = source.statements[1] as FunctionDeclaration;
    expect(print.attributes[0].tag.data).toBe("extern");
    expect(print.attributes[0].args.value).toBe("env.print");
    expect(print.returnType?.types).toEqual(["void"]);
    expect((print.block as BlockStatement).statements).toHaveLength(0);

    const add = source.statements[2] as FunctionDeclaration;
    expect(add.exported).toBe(true);
    expect(add.attributes[0].args.alias).toBe("add_numbers");
    expect(add.returnType?.types).toEqual(["i32"]);
  });

  test("parses let and mut declarations", () => {
    const source = parse(`
let name: string = "zep"
mut count: i32 = 0
`);

    const name = source.statements[0] as VariableDeclaration;
    const count = source.statements[1] as VariableDeclaration;

    expect(name.mutable).toBe(false);
    expect(name.name.data).toBe("name");
    expect(name.type?.types).toEqual(["string"]);
    expect(count.mutable).toBe(true);
    expect(count.type?.types).toEqual(["i32"]);
  });

  test("parses struct fields as name-colon-type", () => {
    const source = parse(`
struct Point {
  x: i32
  y: i32 = 0
}
`);

    const point = source.statements[0] as StructDeclaration;
    expect(point.name.data).toBe("Point");
    expect(point.fields.map((field) => field.name.data)).toEqual(["x", "y"]);
    expect(point.fields.map((field) => field.type.types[0])).toEqual(["i32", "i32"]);
  });

  test("keeps arithmetic precedence stable", () => {
    const source = parse(`
fn calc(a: i32, b: i32, c: i32): i32 {
  rt a + b * c
}
`);

    const calc = source.statements[0] as FunctionDeclaration;
    const ret = (calc.block as BlockStatement).statements[0] as ReturnStatement;
    const expr = ret.returning as BinaryExpression;

    expect(expr.operand).toBe(BinaryOp.Add);
    expect(expr.right).toBeInstanceOf(BinaryExpression);
    expect((expr.right as BinaryExpression).operand).toBe(BinaryOp.Mul);
  });

  test("keeps left-associative operators left nested", () => {
    const source = parse(`
fn calc(a: i32, b: i32, c: i32): i32 {
  rt a - b - c
}
`);

    const calc = source.statements[0] as FunctionDeclaration;
    const ret = (calc.block as BlockStatement).statements[0] as ReturnStatement;
    const expr = ret.returning as BinaryExpression;

    expect(expr.operand).toBe(BinaryOp.Sub);
    expect(expr.left).toBeInstanceOf(BinaryExpression);
    expect((expr.left as BinaryExpression).operand).toBe(BinaryOp.Sub);
  });

  test("keeps assignment right-associative", () => {
    const source = parse(`
fn assign(a: i32, b: i32): i32 {
  rt a = b = 1
}
`);

    const assign = source.statements[0] as FunctionDeclaration;
    const ret = (assign.block as BlockStatement).statements[0] as ReturnStatement;
    const expr = ret.returning as BinaryExpression;

    expect(expr.operand).toBe(BinaryOp.Assign);
    expect(expr.right).toBeInstanceOf(BinaryExpression);
    expect((expr.right as BinaryExpression).operand).toBe(BinaryOp.Assign);
  });

  test("lets parentheses override precedence", () => {
    const source = parse(`
fn calc(a: i32, b: i32, c: i32): i32 {
  rt (a + b) * c
}
`);

    const calc = source.statements[0] as FunctionDeclaration;
    const ret = (calc.block as BlockStatement).statements[0] as ReturnStatement;
    const expr = ret.returning as BinaryExpression;

    expect(expr.operand).toBe(BinaryOp.Mul);
    expect(expr.left).not.toBeInstanceOf(Identifier);
  });

  test("parses calls and property access as postfix chains", () => {
    const source = parse(`
fn use_value(a: i32): i32 {
  rt foo.bar(a + 1, 2).baz
}
`);

    const fn = source.statements[0] as FunctionDeclaration;
    const ret = (fn.block as BlockStatement).statements[0] as ReturnStatement;
    const baz = ret.returning as PropertyAccessExpression;
    const call = baz.expression as CallExpression;
    const callee = call.calling as PropertyAccessExpression;

    expect(baz).toBeInstanceOf(PropertyAccessExpression);
    expect(baz.property.data).toBe("baz");
    expect(call).toBeInstanceOf(CallExpression);
    expect(call.parameters).toHaveLength(2);
    expect(call.parameters[0]).toBeInstanceOf(BinaryExpression);
    expect(call.parameters[1]).toBeInstanceOf(NumberLiteral);
    expect(callee.property.data).toBe("bar");
  });

  test("parses empty parameter lists and empty blocks", () => {
    const source = parse(`
fn noop(): void {}
`);

    const noop = source.statements[0] as FunctionDeclaration;
    expect(noop.parameters).toHaveLength(0);
    expect((noop.block as BlockStatement).statements).toHaveLength(0);
  });

  test("parses calls with empty argument lists", () => {
    const source = parse(`
fn use_value(): i32 {
  rt read()
}
`);

    const fn = source.statements[0] as FunctionDeclaration;
    const ret = (fn.block as BlockStatement).statements[0] as ReturnStatement;
    const call = ret.returning as CallExpression;

    expect(call).toBeInstanceOf(CallExpression);
    expect(call.parameters).toHaveLength(0);
  });

  test("parses else-if chains", () => {
    const source = parse(`
fn choose(a: i32): i32 {
  if a == 0 {
    rt 0
  } else if a == 1 {
    rt 1
  } else {
    rt 2
  }
}
`);

    const choose = source.statements[0] as FunctionDeclaration;
    const ifStmt = (choose.block as BlockStatement).statements[0] as IfStatement;
    const elseIf = ifStmt.ifFalse as IfStatement;
    const fallback = elseIf.ifFalse as IfStatement;

    expect(ifStmt.kind).toBe(IfStatementKind.If);
    expect(elseIf.kind).toBe(IfStatementKind.ElseIf);
    expect(fallback.kind).toBe(IfStatementKind.Else);
  });

  test("parses while statements with block bodies", () => {
    const source = parse(`
fn loop_value(a: i32): i32 {
  while a > 0 {
    rt a
  }
}
`);

    const fn = source.statements[0] as FunctionDeclaration;
    const loop = (fn.block as BlockStatement).statements[0] as WhileStatement;

    expect(loop).toBeInstanceOf(WhileStatement);
    expect(loop.body).toBeInstanceOf(BlockStatement);
  });
});

describe("minimal wasm generation", () => {
  test("emits WAT for exported add", () => {
    const source = parse(`
#[export]
fn add(a: i32, b: i32): i32 {
  rt a + b
}
`);

    const generator = new Generator();
    generator.parseProgram(source);
    const wat = generator.toWat();

    expect(wat).toContain("(func $add");
    expect(wat).toContain("i32.add");
  });
});
