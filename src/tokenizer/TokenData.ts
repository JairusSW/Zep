import { Range } from "../ast/Range";
import { Token } from "./Token";

export class TokenData {
  public text: string;
  public token: Token;
  public range: Range;
  constructor(token: Token, text: string, range: Range) {
    this.token = token;
    this.text = text;
    this.range = range;
  }
}
