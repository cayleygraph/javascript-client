import assert = require("assert");
import Client, { NamedNode, Format, Path } from "../cayley";

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
  query: Path;
  validate(result: any[]): void;
};

const testCases: TestCase[] = [
  {
    name: "g.vertex(g.IRI('bob'))",
    query: new Path().vertex([new NamedNode("bob")]),
    validate: result => {
      assert(result);
      assert(result.length === 1);
      assert(typeof result[0] === "object");
      assert(result[0].id["@id"] === "bob");
    }
  },
  {
    name: "g.vertex()",
    query: new Path().vertex([]),
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
    name: "g.vertex().view(g.IRI('follows'))",
    query: new Path()
      .vertex([])
      .view(new Path().vertex([new NamedNode("follows")])),
    validate: result => {
      assert(result);
      assert(result.length);
      for (const item of result) {
        assert.deepStrictEqual(Object.keys(item), ["id"]);
        assert(typeof item["id"] === "object");
        assert(typeof item["id"]["@id"] === "string");
      }
    }
  }
];

describe("Query Builder", () => {
  for (const testCase of testCases) {
    it(testCase.name, async () => {
      const client = new Client();
      const response = await client.query(testCase.query);
      const { result, error } = await response.json();
      if (error) {
        new Error(error);
      }
      testCase.validate(result);
    });
  }
});
