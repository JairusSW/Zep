import chalk from "chalk";
import { Range } from "../ast/Range";

export enum ErrorTypes {
    TypeError
}
export class TypeError {
    constructor(
        public message: string,
        public range: Range
    ) {
        console.log(chalk.bgRed("Error") + chalk.grey(":") + " " + message);
        console.log(" " + chalk.cyan("test.zp") + chalk.gray(":") + chalk.cyan(range.line) + chalk.gray(":") + chalk.cyan(range.start));
    }
}
