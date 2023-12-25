import { Node } from "../../ast/nodes/Node.js";

export class Scope {
  public nodes = new Map<string, Node>();
  constructor(public parentScope: Scope | null = null) {}
  add(name: string, node: Node): boolean {
    if (this.nodes.has(name)) {
      return false;
    } else {
      this.nodes.set(name, node);
      return true;
    }
  }
  has(name: string): boolean {
    return this.nodes.has(name) || this.parentScope?.has(name) || false;
  }
  get(name: string): Node | null {
    return this.nodes.get(name) || this.parentScope?.get(name) || null;
  }
}
