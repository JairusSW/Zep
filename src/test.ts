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
import { EnumDeclaration } from "./ast/EnumDeclaration";
import { VariableDeclaration } from "./ast/VariableDeclaration";
import { WhileStatement } from "./ast/WhileStatement";
import { Generator } from "./generator";
import { Formatter } from "./formatter/formatter";
import { Parser } from "./parser";
import { compileSource } from "./pipeline";
import { Source, SourceKind } from "./source";
import { Token, Tokenizer } from "./tokenizer";

function parse(text: string): Source {
  const source = new Source("test.zp", text, SourceKind.UserEntry);
  const parser = new Parser([source]);
  parser.parseSource(source);
  return source;
}

function scan(text: string): { token: Token; literal: string | null }[] {
  const source = new Source("scan.zp", text, SourceKind.UserEntry);
  const tokenizer = new Tokenizer(source);
  const out: { token: Token; literal: string | null }[] = [];
  while (true) {
    const token = tokenizer.next();
    out.push({ token, literal: tokenizer.nextLiteral });
    if (token === Token.EndOfFile) break;
  }
  return out;
}

describe("tokenizer stream", () => {
  test("scans keywords and identifiers distinctly", () => {
    const tokens = scan("fn foo(mutx: i32) { rt true }");
    expect(tokens[0].token).toBe(Token.Fn);
    expect(tokens[1]).toEqual({ token: Token.Identifier, literal: "foo" });
    expect(tokens.find((v) => v.token === Token.Return)?.literal).toBe("rt");
    expect(tokens.find((v) => v.token === Token.True)?.literal).toBe("true");
  });

  test("distinguishes dots from number literals", () => {
    const tokens = scan("1..10 foo.bar 3.14");
    const kinds = tokens.map((v) => v.token);
    expect(kinds).toContain(Token.NumberLiteral);
    expect(kinds).toContain(Token.DotDot);
    expect(kinds).toContain(Token.Dot);
    expect(tokens.find((v) => v.literal === "3.14")?.token).toBe(Token.NumberLiteral);
  });
});

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

  test("parses attributed struct and enum declarations", () => {
    const source = parse(`
#[export]
struct Point {
  x: i32
}

#[export]
enum Kind {
  A,
  B = 2
}
`);

    const structDecl = source.statements[0] as StructDeclaration;
    const enumDecl = source.statements[1] as EnumDeclaration;
    expect(structDecl).toBeInstanceOf(StructDeclaration);
    expect(structDecl.attributes[0].tag.data).toBe("export");
    expect(enumDecl).toBeInstanceOf(EnumDeclaration);
    expect(enumDecl.attributes[0].tag.data).toBe("export");
    expect(enumDecl.elements).toHaveLength(2);
  });

  test("recovers at top-level after invalid tokens", () => {
    const source = parse(`
@
fn add(a: i32, b: i32): i32 {
  rt a + b
}
`);

    expect(source.statements).toHaveLength(1);
    expect((source.statements[0] as FunctionDeclaration).name.data).toBe("add");
  });

  test("recovers inside blocks after invalid statements", () => {
    const source = parse(`
fn demo(a: i32): i32 {
  @
  rt a
}
`);

    const fn = source.statements[0] as FunctionDeclaration;
    const body = fn.block as BlockStatement;
    expect(body.statements).toHaveLength(1);
    expect(body.statements[0]).toBeInstanceOf(ReturnStatement);
  });

  test("recovers after missing binary rhs in return", () => {
    const source = parse(`
fn demo(a: i32): i32 {
  rt a +
  let b: i32 = 1
  rt b
}
`);

    const fn = source.statements[0] as FunctionDeclaration;
    const body = fn.block as BlockStatement;
    expect(body.statements).toHaveLength(3);
    expect(body.statements[1]).toBeInstanceOf(VariableDeclaration);
    expect(body.statements[2]).toBeInstanceOf(ReturnStatement);
  });

  test("recovers malformed postfix/call and continues block", () => {
    const source = parse(`
fn demo(): i32 {
  foo(1, )
  rt 1
}
`);

    const fn = source.statements[0] as FunctionDeclaration;
    const body = fn.block as BlockStatement;
    expect(body.statements).toHaveLength(2);
    expect(body.statements[0]).toBeDefined();
    expect(body.statements[1]).toBeInstanceOf(ReturnStatement);
  });

  test("keeps following statements after bare return error", () => {
    const source = parse(`
fn demo(): i32 {
  rt
  let x: i32 = 1
  rt x
}
`);

    const fn = source.statements[0] as FunctionDeclaration;
    const body = fn.block as BlockStatement;
    expect(body.statements).toHaveLength(2);
    expect(body.statements[0]).toBeInstanceOf(VariableDeclaration);
    expect(body.statements[1]).toBeInstanceOf(ReturnStatement);
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

describe("compile pipeline", () => {
  test("emits wasm bytes when target is wasm", () => {
    const result = compileSource({
      fileName: "main.zp",
      text: `
#[export]
fn add(a: i32, b: i32): i32 {
  rt a + b
}
`,
      format: "wasm",
    });

    expect(result.wat.length).toBeGreaterThan(0);
    expect(result.wasm).not.toBeNull();
    expect(result.wasm!.byteLength).toBeGreaterThan(8);
  });

  test("fails on unknown identifier", () => {
    expect(() =>
      compileSource({
        fileName: "bad_unknown.zp",
        text: `
#[export]
fn main(): i32 {
  rt missing_name
}
`,
        format: "wasm",
      }),
    ).toThrow();
  });

  test("fails on return type mismatch", () => {
    expect(() =>
      compileSource({
        fileName: "bad_return_type.zp",
        text: `
#[export]
fn main(): i32 {
  rt true
}
`,
        format: "wasm",
      }),
    ).toThrow();
  });

  test("fails on function call arity mismatch", () => {
    expect(() =>
      compileSource({
        fileName: "bad_arity.zp",
        text: `
fn add(a: i32, b: i32): i32 {
  rt a + b
}

#[export]
fn main(): i32 {
  rt add(1)
}
`,
        format: "wasm",
      }),
    ).toThrow();
  });

  test("fails on assignment to immutable variable", () => {
    expect(() =>
      compileSource({
        fileName: "bad_mutability.zp",
        text: `
#[export]
fn main(): i32 {
  let x: i32 = 1
  x = 2
  rt x
}
`,
        format: "wasm",
      }),
    ).toThrow();
  });
});

describe("formatter", () => {
  test("formats declarations and preserves key syntax", () => {
    const source = parse(`
#[extern("env.print")]
fn print(value:i32):void

#[export]
fn add(a:i32,b:i32):i32{
rt a+b
}

struct Point{
x:i32
y:i32=0
}
`);

    const formatted = Formatter.from(source);
    expect(formatted).toContain('#[extern("env.print")]');
    expect(formatted).toContain("fn print(value: i32): void");
    expect(formatted).toContain("fn add(a: i32, b: i32): i32 {");
    expect(formatted).toContain("struct Point {");
    expect(formatted).toContain("y: i32 = 0");
  });

  test("formatted output can be parsed again without parser diagnostics", () => {
    const original = `
#[export]
fn add(a:i32,b:i32):i32{
let c:i32=a+b
rt c
}
`;
    const source = parse(original);
    const formatted = Formatter.from(source);
    const reparsed = new Source("formatted.zp", formatted, SourceKind.UserEntry);
    const parser = new Parser([reparsed]);
    parser.parseSource(reparsed);
    expect(parser.diagnostics).toHaveLength(0);
  });
});
