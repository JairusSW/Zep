import { Node } from "./Node";

export class CommentNode extends Node {
  constructor(public text: string) {
    super();
  }
}