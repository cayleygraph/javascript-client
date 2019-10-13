import NamedNode = require("@rdfjs/data-model/lib/named-node");
import BlankNode = require("@rdfjs/data-model/lib/blank-node");
import Literal = require("@rdfjs/data-model/lib/literal");

export function serializeTerm(term: NamedNode | BlankNode | Literal): string {
  if (term instanceof NamedNode) {
    return `<${term.value}>`;
  } else if (term instanceof BlankNode) {
    return `_:${term.value}`;
  } else if (term instanceof Literal) {
    if (term.language) {
      return `"${term.value}"`;
    } else if (term.datatype) {
      return `"${term.value}"^^${term.datatype}`;
    } else {
      return `"${term.value}"`;
    }
  } else {
    throw new Error(
      `Term ${term} is of unexpected type ${
        term ? term.constructor.name : typeof term
      }`
    );
  }
}
