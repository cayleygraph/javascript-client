import NamedNode = require("@rdfjs/data-model/lib/named-node");
import BlankNode = require("@rdfjs/data-model/lib/blank-node");
import Literal = require("@rdfjs/data-model/lib/literal");
import * as N3 from "./n3";
import { Graph } from "./query-builder";
import "isomorphic-fetch";

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
   * Reads all quads from the database
   * @param subject Subjects to filter quads by
   * @param predicate Predicates to filter quads by
   * @param object Objects to filter quads by
   * @param label Labels to filter quads by
   * @param format Data encoder to use for response.
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
        Accept: format
      }
    });
  }

  /**
   * Writes quads to the database
   * @param content Content in format specified
   * @param format Data decoder to use for request
   */
  async write(
    content: string,
    format: Format = Format.JsonLD
  ): Promise<string> {
    const res = await fetch(`${this.url}/api/v2/write`, {
      method: "POST",
      headers: {
        "Content-Type": format
      },
      body: content
    });
    if (res.status !== 200) {
      throw new Error(await res.text());
    }
    const { error, result } = await res.json();
    if (error) {
      throw new Error(error);
    }
    return result;
  }

  /**
   * Removes a node add all associated quads
   * @param content Content in format specified
   * @param format Data decoder to use for request
   */
  delete(content: string, format: Format = Format.JsonLD): Promise<Response> {
    return fetch(`${this.url}/api/v2/delete`, {
      method: "POST",
      headers: {
        "Content-Type": format
      },
      body: content
    });
  }

  /**
   * Query the graph
   * @param query Query text
   * @param language Query language to use
   * @param limit Globally limit the number of results
   */
  query(
    query: string,
    language: Language = Language.Gizmo,
    limit: number = 100
  ): Promise<Response> {
    return fetch(
      `${this.url}/api/v2/query?${new URLSearchParams({
        lang: language,
        limit: String(limit)
      })}`,
      {
        method: "POST",
        body: query
      }
    );
  }
}
