import { expect, test, describe } from "bun:test";
import { Tokenizer } from "../src/tokenizer/tokenizer";
import { Parser } from "../src/parser/parser";

describe("Should parse Expressions", () => {
  test("1024", () => {
    const tokenizer = new Tokenizer(`1024`);
    const parser = new Parser(tokenizer, "test.zp");
    const node = parser.parseNumberLiteral();

    expect(node?.data).toBe("1024");
  });
  test("\"this is a string\"", () => {
    const tokenizer = new Tokenizer(`"this is a string"`);
    const parser = new Parser(tokenizer, "test.zp");
    const node = parser.parseStringLiteral();
    
    expect(node?.data).toBe("this is a string");
  });
})