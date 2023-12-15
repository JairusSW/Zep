import { Range } from "../ast/Range";
import { Token } from "./token";

export class TokenData {
  /**
   * Represents a token along with its associated text and range.
   * @param token - An instance of the Token class representing the token itself.
   * @param text - A string representing the text associated with the token.
   * @param range - An instance of the Range class representing the range of the token within the source code.
   */
  public text: string;
  public token: Token;
  public range: Range;
  constructor(token: Token, text: string, range: Range) {
    this.token = token;
    this.text = text;
    this.range = range;
  }
}
