import assert = require("assert");
import CayleyClient, { NamedNode, Format } from "../client";

describe("Read", () => {
  it("simple", async () => {
    const client = new CayleyClient();
    const response = await client.read(new NamedNode("alice"));
    assert(response.status === 200);
    await response.json();
  });
  it("turtle", async () => {
    const client = new CayleyClient();
    const response = await client.read(
      new NamedNode("alice"),
      null,
      null,
      null,
      Format.Turtle
    );
    assert(response.status === 200);
    await response.text();
  });
});

describe("Write", () => {
  it("writes", async () => {
    const client = new CayleyClient();
    const response = await client.write(
      `[{"@id":"alice","likes":[{"@id":"bob"}]}]`
    );
    assert(response);
  });
});

describe("Query Builder", () => {
  it("g.V().all()", async () => {
    const client = new CayleyClient();
    const { g } = client;
    const result = await g.V().all();
    assert(result);
  });
  it("g.V().getLimit(-1)", async () => {
    const client = new CayleyClient();
    const { g } = client;
    const result = await g.V().getLimit(-1);
    assert.deepStrictEqual(result, [
      { id: "<alice>" },
      { id: "<follows>" },
      { id: "<bob>" },
      { id: "<fred>" },
      { id: "<status>" },
      { id: "cool_person" },
      { id: "<dani>" },
      { id: "<charlie>" },
      { id: "<greg>" },
      { id: "<emily>" },
      { id: "<predicates>" },
      { id: "<are>" },
      { id: "smart_person" },
      { id: "<smart_graph>" }
    ]);
  });
  it("g.V().out(g.IRI('follows')).getLimit(-1)", async () => {
    const client = new CayleyClient();
    const { g } = client;
    const result = await g
      .V()
      .out(g.IRI("follows"))
      .getLimit(-1);
    assert.deepStrictEqual(result, [
      { id: "<bob>" },
      { id: "<fred>" },
      { id: "<bob>" },
      { id: "<bob>" },
      { id: "<dani>" },
      { id: "<greg>" },
      { id: "<fred>" },
      { id: "<greg>" }
    ]);
  });
  it("g.emit(g.V().toArray())", async () => {
    const client = new CayleyClient();
    const { g } = client;
    const result = await g.emit(g.V().toArray());
    assert.deepStrictEqual(result, [
      [
        "<alice>",
        "<follows>",
        "<bob>",
        "<fred>",
        "<status>",
        "cool_person",
        "<dani>",
        "<charlie>",
        "<greg>",
        "<emily>",
        "<predicates>",
        "<are>",
        "smart_person",
        "<smart_graph>"
      ]
    ]);
  });
});
