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
    assert(result);
    assert(result.length);
    for (const item of result) {
      assert.deepStrictEqual(Object.keys(item), ["id"]);
      assert(typeof item["id"] === "string");
    }
  });
  it("g.V().out(g.IRI('follows')).getLimit(-1)", async () => {
    const client = new CayleyClient();
    const { g } = client;
    const result = await g
      .V()
      .out(g.IRI("follows"))
      .getLimit(-1);
    assert(result);
    assert(result.length);
    for (const item of result) {
      assert.deepStrictEqual(Object.keys(item), ["id"]);
      assert(typeof item["id"] === "string");
    }
  });
  it("g.emit(g.V().toArray())", async () => {
    const client = new CayleyClient();
    const { g } = client;
    const result = await g.emit(g.V().toArray());
    assert(result);
    assert(result.length);
    for (const item of result) {
      assert(Array.isArray(item));
      for (const subItem of item) {
        assert(typeof subItem === "string");
      }
    }
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
