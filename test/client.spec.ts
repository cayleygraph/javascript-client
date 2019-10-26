import assert = require("assert");
import CayleyClient, { NamedNode, Format, Graph } from "../client";

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

type TestCase = {
  name: string;
  query(path: Graph): Promise<any[]>;
  validate(result: any[]): void;
};

const testCases: TestCase[] = [
  {
    name: "g.V().all()",
    query: g => g.V().all(),
    validate: assert
  },
  {
    name: "g.V().getLimit(-1)",
    query: g => g.V().getLimit(-1),
    validate: result => {
      assert(result);
      assert(result.length);
      for (const item of result) {
        assert.deepStrictEqual(Object.keys(item), ["id"]);
        assert(typeof item["id"] === "string");
      }
    }
  },
  {
    name: "g.V().out(g.IRI('follows')).getLimit(-1)",
    query: g =>
      g
        .V()
        .out(g.IRI("follows"))
        .getLimit(-1),
    validate: result => {
      assert(result);
      assert(result.length);
      for (const item of result) {
        assert.deepStrictEqual(Object.keys(item), ["id"]);
        assert(typeof item["id"] === "string");
      }
    }
  },
  {
    name: "g.emit(g.V().toArray())",
    query: g => g.emit(g.V().toArray()),
    validate: result => {
      assert(result);
      assert(result.length);
      for (const item of result) {
        assert(Array.isArray(item));
        for (const subItem of item) {
          assert(typeof subItem === "string");
        }
      }
    }
  }
];

describe("Query Builder", () => {
  for (const testCase of testCases) {
    it(testCase.name, async () => {
      const client = new CayleyClient();
      const { g } = client;
      const result = await testCase.query(g);
      testCase.validate(result);
    });
  }
});
