declare class NamedNode {
  value: string;
  constructor(value: string);
}

declare module "@rdfjs/data-model/lib/named-node" {
  export = NamedNode;
}

declare module "@rdfjs/data-model/lib/blank-node" {
  class BlankNode {
    value: string;
    constructor(value?: string);
  }

  export = BlankNode;
}

declare module "@rdfjs/data-model/lib/literal" {
  class Literal {
    value: string;
    language: string;
    datatype: NamedNode;
    constructor(value: string, language?: string, datatype?: NamedNode);
  }

  export = Literal;
}
