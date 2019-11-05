import assert = require("assert");
import Client, { NamedNode, Format, Graph } from "../cayley";

describe("Read", () => {
  it("simple", async () => {
    const client = new Client();
    const response = await client.read(new NamedNode("alice"));
    assert(response.status === 200);
    await response.json();
  });
  it("turtle", async () => {
    const client = new Client();
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
    const client = new Client();
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
    name: "g.V(g.IRI('bob'))",
    query: g => g.V(g.IRI("bob")).all(),
    validate: result => {
      assert(result);
      assert(result.length === 1);
      assert(typeof result[0] === "object");
      assert(result[0].id["@id"] === "bob");
    }
  },
  {
    name: "g.V().getLimit(-1)",
    query: g => g.V().getLimit(-1),
    validate: result => {
      assert(result);
      assert(result.length);
      for (const item of result) {
        assert.deepStrictEqual(Object.keys(item), ["id"]);
        assert(typeof item.id === "object" || typeof item.id === "string");
        if (typeof item.id === "object") {
          assert(typeof item.id["@id"] === "string");
        }
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
        assert(typeof item["id"] === "object");
        assert(typeof item["id"]["@id"] === "string");
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
          assert(typeof subItem === "object" || typeof subItem === "string");
          if (typeof subItem === "object") {
            assert(typeof subItem["@id"] === "string");
          }
        }
      }
    }
  }
];

describe("Query Builder", () => {
  for (const testCase of testCases) {
    it(testCase.name, async () => {
      const client = new Client();
      const { g } = client;
      const result = await testCase.query(g);
      testCase.validate(result);
    });
  }
});
