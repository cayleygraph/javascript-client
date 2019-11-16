// @ts-ignore
import Client, { QueryLanguage, QueryContentType } from "./client";
class QueryException extends Error {}
class Operator {}
type Step = Object;
export default class Path {
  client: Client;
  private cursor: Step | null;
  constructor(client: Client) {
    this.client = client;
  }
  private addStep(step: Step): void {
    const previousCursor = this.cursor;
    this.cursor = step;
    if (previousCursor) {
      this.cursor = { ...this.cursor, "linkedql:from": previousCursor };
    }
  }
  private async execute(): Promise<Object[]> {
    let res = await this.client.query(
      JSON.stringify(this.cursor),
      QueryLanguage.linkedql,
      QueryContentType.jsonLD
    );
    res = await res.json();
    if ("error" in res) {
      throw new QueryException(res.error);
    }
    return res.result;
  }
  async [Symbol.asyncIterator]() {
    const res = await this.execute();
    return res[Symbol.iterator];
  }
  has(via: Path, values: NamedNode): Path {
    this.addStep({
      "@type": "linkedql:Has",
      "linkedql:via": via,
      "linkedql:values": values
    });
    return this;
  }
  union(steps: Path): Path {
    this.addStep({ "@type": "linkedql:Union", "linkedql:steps": steps });
    return this;
  }
  select(tags: string): Path {
    this.addStep({ "@type": "linkedql:Select", "linkedql:tags": tags });
    return this;
  }
  is(values: NamedNode): Path {
    this.addStep({ "@type": "linkedql:Is", "linkedql:values": values });
    return this;
  }
  skip(offset: number): Path {
    this.addStep({ "@type": "linkedql:Skip", "linkedql:offset": offset });
    return this;
  }
  hasReverse(via: Path, values: NamedNode): Path {
    this.addStep({
      "@type": "linkedql:HasReverse",
      "linkedql:via": via,
      "linkedql:values": values
    });
    return this;
  }
  in(via: Path): Path {
    this.addStep({ "@type": "linkedql:In", "linkedql:via": via });
    return this;
  }
  reversePropertyNames(): Path {
    this.addStep({ "@type": "linkedql:ReversePropertyNames" });
    return this;
  }
  labels(): Path {
    this.addStep({ "@type": "linkedql:Labels" });
    return this;
  }
  properties(names: string): Path {
    this.addStep({ "@type": "linkedql:Properties", "linkedql:names": names });
    return this;
  }
  placeholder(): Path {
    this.addStep({ "@type": "Placeholder" });
    return this;
  }
  back(name: string): Path {
    this.addStep({ "@type": "linkedql:Back", "linkedql:name": name });
    return this;
  }
  view(via: Path): Path {
    this.addStep({ "@type": "linkedql:View", "linkedql:via": via });
    return this;
  }
  filter(filter: Operator): Path {
    this.addStep({ "@type": "linkedql:Filter", "linkedql:filter": filter });
    return this;
  }
  limit(limit: number): Path {
    this.addStep({ "@type": "linkedql:Limit", "linkedql:limit": limit });
    return this;
  }
  order(): Path {
    this.addStep({ "@type": "linkedql:Order" });
    return this;
  }
  intersect(steps: Path): Path {
    this.addStep({ "@type": "linkedql:Intersect", "linkedql:steps": steps });
    return this;
  }
  difference(steps: Path): Path {
    this.addStep({ "@type": "linkedql:Difference", "linkedql:steps": steps });
    return this;
  }
  viewBoth(via: Path): Path {
    this.addStep({ "@type": "linkedql:ViewBoth", "linkedql:via": via });
    return this;
  }
  vertex(values: NamedNode): Path {
    this.addStep({ "@type": "linkedql:Vertex", "linkedql:values": values });
    return this;
  }
  as(name: string): Path {
    this.addStep({ "@type": "linkedql:As", "linkedql:name": name });
    return this;
  }
  reverseProperties(names: string): Path {
    this.addStep({
      "@type": "linkedql:ReverseProperties",
      "linkedql:names": names
    });
    return this;
  }
  out(via: Path): Path {
    this.addStep({ "@type": "linkedql:Out", "linkedql:via": via });
    return this;
  }
  viewReverse(via: Path): Path {
    this.addStep({ "@type": "linkedql:ViewReverse", "linkedql:via": via });
    return this;
  }
  follow(followed: Path): Path {
    this.addStep({ "@type": "linkedql:Follow", "linkedql:followed": followed });
    return this;
  }
  followReverse(followed: Path): Path {
    this.addStep({
      "@type": "linkedql:FollowReverse",
      "linkedql:followed": followed
    });
    return this;
  }
  propertyNames(): Path {
    this.addStep({ "@type": "linkedql:PropertyNames" });
    return this;
  }
  reversePropertyNamesAs(tag: string): Path {
    this.addStep({
      "@type": "linkedql:ReversePropertyNamesAs",
      "linkedql:tag": tag
    });
    return this;
  }
  propertyNamesAs(tag: string): Path {
    this.addStep({ "@type": "linkedql:PropertyNamesAs", "linkedql:tag": tag });
    return this;
  }
  unique(): Path {
    this.addStep({ "@type": "linkedql:Unique" });
    return this;
  }
  selectFirst(tags: string): Path {
    this.addStep({ "@type": "linkedql:SelectFirst", "linkedql:tags": tags });
    return this;
  }
  count(): Path {
    this.addStep({ "@type": "linkedql:Count" });
    return this;
  }
}
