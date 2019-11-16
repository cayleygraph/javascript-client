import NamedNode = require("@rdfjs/data-model/lib/named-node");
import BlankNode = require("@rdfjs/data-model/lib/blank-node");
// @ts-ignore
import { QueryLanguage, QueryContentType } from "./client";

class Operator {}

type Step = Object;

export type Identifier = NamedNode | BlankNode;

export default class Path {
  private cursor: Step | null;
  private addStep(step: Step): void {
    const previousCursor = this.cursor;
    this.cursor = step;
    if (previousCursor) {
      this.cursor = { ...this.cursor, "linkedql:from": previousCursor };
    }
  }
  toString(): string {
    return JSON.stringify(this.cursor);
  }
}
