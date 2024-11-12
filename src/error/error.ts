import chalk from "chalk";
import { Range } from "../ast/Range";
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
}

export class TokenMismatchError extends CompileTimeError {
  public range: Range;
  constructor(message: string, code: number, range: Range) {
    super(message, ErrorTypes.TokenMismatch, code);
    this.range = range;
    console.log(chalk.bgRed("Error") + chalk.grey(":") + " " + message);
    console.log(
      " " +
        chalk.cyan("test.zp") +
        chalk.gray(":") +
        chalk.cyan(this.range.line) +
        chalk.gray(":") +
        chalk.cyan(this.range.start),
    );
  }
}

export class SyntaxError extends CompileTimeError {
  constructor(
    source: Source,
    prefix: string,
    message: string,
    code: number,
    range: Range,
    action: "FAIL" | "WARN" | "INFO",
  ) {
    super(message, ErrorTypes.SyntaxError, code);
    let color;
    if (action === "FAIL") {
      color = chalk.bold.red;
    } else if (action === "WARN") {
      color = chalk.bold.yellowBright;
    } else {
      color = chalk.bold.blue;
    }
    console.log(color(prefix) + chalk.grey(":") + " " + message);
    console.log(
      " " +
        chalk.cyan(source.fileName) +
        chalk.gray(":") +
        chalk.cyan(range.start.line) +
        chalk.gray(":") +
        chalk.cyan(range.start.column),
    );
    if (action === "FAIL") process.exit(0);
  }
}

export class UserError extends CompileTimeError {
  constructor(
    source: Source,
    prefix: string,
    message: string,
    code: number,
    range: Range,
    action: "FAIL" | "WARN" | "INFO",
  ) {
    super(message, ErrorTypes.UserError, code);
    let color;
    if (action === "FAIL") {
      color = chalk.bold.red;
    } else if (action === "WARN") {
      color = chalk.bold.yellowBright;
    } else {
      color = chalk.bold.blue;
    }
    console.log(color(prefix) + chalk.grey(":") + " " + message);
    console.log(
      " " +
        chalk.cyan(source.fileName) +
        chalk.gray(":") +
        chalk.cyan(range.start.line) +
        chalk.gray(":") +
        chalk.cyan(range.start.column),
    );
    if (action === "FAIL") process.exit(0);
  }
}
