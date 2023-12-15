import binaryen from "binaryen";
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration";

export class Generator {
  public module = new binaryen.Module();
  constructor() {}
  addFunction(node: FunctionDeclaration): void {
    this.module.addFunction(
      node.name.data,
      binaryen.createType([binaryen.i32, binaryen.i32]),
      binaryen.i32,
      [binaryen.i32],
      this.module.block(null, [
        this.module.local.set(
          2,
          this.module.i32.add(
            this.module.local.get(0, binaryen.i32),
            this.module.local.get(1, binaryen.i32),
          ),
        ),
        this.module.return(this.module.local.get(2, binaryen.i32)),
      ]),
    );
    this.module.addFunctionExport(node.name.data, node.name.data);
  }
  optimize(): void {
    this.module.optimize();
  }
  validate(): boolean {
    return !!this.module.validate();
  }
  toWAT(): string {
    return this.module.emitText();
  }
  toWasm(): Uint8Array {
    return this.module.emitBinary();
  }
}
