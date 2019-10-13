import assert = require("assert");
import CayleyClient, { NamedNode, Format } from "../client";

describe("read", () => {
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

describe("write", () => {
  it("writes", async () => {
    const client = new CayleyClient();
    const response = await client.write(
      `[{"@id":"alice","likes":[{"@id":"bob"}]}]`
    );
    assert(response.status === 200);
    console.log(await response.text());
  });
});
