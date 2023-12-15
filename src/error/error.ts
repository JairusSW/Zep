import chalk from "chalk";
import { Range } from "../ast/Range";
import { TokenData } from "../tokenizer/tokendata";

export enum ErrorTypes {
  TokenMismatch,
  TypeError,
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
