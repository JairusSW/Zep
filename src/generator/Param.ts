import { Type } from "./Type";

export class Param {
  public name: string;
  public type: Type;
  constructor(name: string, type: Type) {
    this.name = name;
    this.type = type;
  }
}