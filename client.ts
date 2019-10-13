import Graph from "./query-builder";
import * as N3 from "./n3";
import "isomorphic-fetch";
import NamedNode = require("@rdfjs/data-model/lib/named-node");
import BlankNode = require("@rdfjs/data-model/lib/blank-node");
import Literal = require("@rdfjs/data-model/lib/literal");
export { NamedNode, BlankNode, Literal };

type Identifier = NamedNode | BlankNode;

export enum Language {
  Gizmo = "gizmo",
  GraphQL = "graphql",
  MQL = "mql"
}

export enum Format {
  NQuads = "application/n-quads",
  Turtle = "text/turtle",
  JsonLD = "application/ld+json"
}

export default class CayleyClient {
  /** This is the only special object in the environment, generates the query objects.
   * Under the hood, they're simple objects that get compiled to a Go iterator tree when executed. */
  graph: Graph;
  /** Alias of graph. This is the only special object in the environment, generates the query objects.
  Under the hood, they're simple objects that get compiled to a Go iterator tree when executed. */
  g: Graph;
  url: string;
  constructor(url: string = "http://localhost:64210") {
    this.url = url;
    this.graph = new Graph(this);
    this.g = this.graph;
  }

  /**
   *
   * @param {Format} [format]
   * @returns {Promise.<Response>}
   */
  async read(
    subject?: Identifier,
    predicate?: NamedNode,
    object?: Identifier | Literal,
    label?: Identifier,
    format: Format = Format.JsonLD
  ): Promise<Response> {
    const searchParams = new URLSearchParams();
    if (subject) {
      searchParams.append("sub", N3.serializeTerm(subject));
    }
    if (predicate) {
      searchParams.append("pred", N3.serializeTerm(predicate));
    }
    if (object) {
      searchParams.append("obj", N3.serializeTerm(object));
    }
    if (label) {
      searchParams.append("label", N3.serializeTerm(label));
    }
    return fetch(`${this.url}/api/v2/read?${searchParams}`, {
      headers: {
        Accept: Format.JsonLD
      }
    });
  }

  write(text: string, format: Format = Format.JsonLD): Promise<Response> {
    return fetch(`${this.url}/api/v2/write`, {
      method: "POST",
      headers: {
        "Content-Type": format
      },
      body: text
    });
  }

  delete(text: string, format: Format = Format.JsonLD): Promise<Response> {
    return fetch(`${this.url}/api/v2/delete`, {
      method: "POST",
      headers: {
        "Content-Type": format
      },
      body: text
    });
  }

  query(
    query: string,
    language: Language = Language.Gizmo,
    limit: number = 100
  ): Promise<Response> {
    return fetch(
      `${this.url}/api/v2/query?${new URLSearchParams({
        query,
        lang: language,
        limit: String(limit)
      })}`
    );
  }
}
