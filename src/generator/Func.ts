import { Param } from "./Param";
import { Statement } from "./Statement";
import { Type } from "./Type";

export class Func {
  public name: string;
  public params: Param[];
  public returnType: Type;
  public exported: boolean;
  public body: Statement[];
  constructor(name: string, params: Param[], returnType: Type, exported: boolean, ...body: Statement[]) {
    this.name = name;
    this.params = params;
    this.returnType = returnType;
    this.exported = exported;
    this.body = body;
  }
}