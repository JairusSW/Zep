import { Type } from "./Type";

export class Instruction {
  public name: string;
  public params: Type[];
  constructor(name: string, params: Type[]) {
    this.name = name;
    this.params = params;
  }
}