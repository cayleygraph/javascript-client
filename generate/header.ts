// @ts-ignore
import Client, { QueryLanguage, QueryContentType } from "./client";

class QueryException extends Error {}

class Operator {}

type Step = Object;

export default class Path {
  client: Client;
  private cursor: Step | null;
  constructor(client: Client) {
    this.client = client;
  }
  private addStep(step: Step): void {
    const previousCursor = this.cursor;
    this.cursor = step;
    if (previousCursor) {
      this.cursor = { ...this.cursor, "linkedql:from": previousCursor };
    }
  }
  private async execute(): Promise<Object[]> {
    let res = await this.client.query(
      JSON.stringify(this.cursor),
      QueryLanguage.linkedql,
      QueryContentType.jsonLD
    );
    res = await res.json();
    if ("error" in res) {
      throw new QueryException(res.error);
    }
    return res.result;
  }
  async [Symbol.asyncIterator]() {
    const res = await this.execute();
    return res[Symbol.iterator];
  }
}
