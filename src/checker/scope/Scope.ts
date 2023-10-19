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
		// Recursively searches scopes in reverse to make sure that the parent does not have scope name.
		return this.nodes.has(name) || this.parentScope?.has(name) || false;
	}
	get(name: string): Node | null {
		// Get from parent scope
		return this.nodes.get(name) || this.parentScope?.get(name) || null;
	}
}