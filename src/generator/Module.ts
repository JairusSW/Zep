import { Func } from "./Func";

export type Exportable = Func;
export class Module {
  public exports: Exportable[] = [];
  public statements: Func[] = [];
  addFn(fn: Func): void {

  }
}