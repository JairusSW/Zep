import chalk from "chalk";
import { Range } from "../range";
import { Source } from "../ast/Source";

export enum ErrorTypes {
  UserError,
  TokenMismatch,
  TypeError,
  SyntaxError,
}

export class CompileTimeError {
  public message: string;
  public type: ErrorTypes;
  public code: number;
  constructor(message: string, type: ErrorTypes, code: number) {
    this.message = message;
    this.type = type;
    this.code = code;
  }
  throw(): void {}
}

export class TokenMismatchError extends CompileTimeError {
  public range: Range;
  constructor(message: string, code: number, range: Range) {
    super(message, ErrorTypes.TokenMismatch, code);
    this.range = range;
  }
  throw(): void {
    console.log(chalk.bgRed("Error") + chalk.grey(":") + " " + this.message);
    console.log(
      " " +
        chalk.cyan("test.zp") +
        chalk.gray(":") +
        chalk.cyan(this.range.start.line) +
        chalk.gray(":") +
        chalk.cyan(this.range.end.column),
    );
  }
}

export class SyntaxError extends CompileTimeError {
  constructor(
    public source: Source,
    public prefix: string,
    message: string,
    code: number,
    public range: Range,
    public action: "FAIL" | "WARN" | "INFO",
  ) {
    super(message, ErrorTypes.SyntaxError, code);
  }
  throw(): void {
    let color;
    if (this.action === "FAIL") {
      color = chalk.bold.red;
    } else if (this.action === "WARN") {
      color = chalk.bold.yellowBright;
    } else {
      color = chalk.bold.blue;
    }
    console.log(color(this.prefix) + chalk.grey(":") + " " + this.message);
    console.log(
      " " +
        chalk.cyan(this.source.fileName) +
        chalk.gray(":") +
        chalk.cyan(this.range.start.line) +
        chalk.gray(":") +
        chalk.cyan(this.range.start.column),
    );
    if (this.action === "FAIL") process.exit(0);
  }
}

export class UserError extends CompileTimeError {
  constructor(
    public source: Source,
    public prefix: string,
    message: string,
    code: number,
    public range: Range,
    public action: "FAIL" | "WARN" | "INFO",
  ) {
    super(message, ErrorTypes.UserError, code);
  }
  throw(): void {
    let color;
    if (this.action === "FAIL") {
      color = chalk.bold.red;
    } else if (this.action === "WARN") {
      color = chalk.bold.yellowBright;
    } else {
      color = chalk.bold.blue;
    }
    console.log(color(this.prefix) + chalk.grey(":") + " " + this.message);
    console.log(
      " " +
        chalk.cyan(this.source.fileName) +
        chalk.gray(":") +
        chalk.cyan(this.range.start.line) +
        chalk.gray(":") +
        chalk.cyan(this.range.start.column),
    );
    if (this.action === "FAIL") process.exit(0);
  }
}
