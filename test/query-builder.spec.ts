import assert = require("assert");
import CayleyClient from "../client";
import { Graph } from "../query-builder";

describe("Query Builder", () => {
  it("g.V().all()", () => {
    const client = new CayleyClient();
    const { g } = client;
    const result = g.V().all();
    assert(result);
  });
  it("g.V().getLimit(-1)", () => {
    const client = new CayleyClient();
    const { g } = client;
    const result = g.V().getLimit(-1);
    assert(result);
  });
});
