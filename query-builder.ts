type Step = { type: string; args?: any[] };

/**
 * Both `.Morphism()` and `.Vertex()` create path objects, which provide the following traversal methods.
 * Note that `.Vertex()` returns a query object, which is a subclass of path object.
 *
 * For these examples, suppose we have the following graph:
 *
 * ```
 * +-------+                        +------+
 * | alice |-----                 ->| fred |<--
 * +-------+     \---->+-------+-/  +------+   \-+-------+
 *               ----->| #bob# |       |         |*emily*|
 * +---------+--/  --->+-------+       |         +-------+
 * | charlie |    /                    v
 * +---------+   /                  +--------+
 *   \---    +--------+             |*#greg#*|
 *       \-->| #dani# |------------>+--------+
 *           +--------+
 * ```
 *
 * Where every link is a `<follows>` relationship, and the nodes with an extra `#` in the name have an extra `<status>` link. As in,
 *
 * ```
 * <dani> -- <status> --> "cool_person"
 * ```
 *
 * Perhaps these are the influencers in our community. So too are extra `*`s in the name -- these are our smart people,
 * according to the `<smart_graph>` label, eg, the quad:
 *
 * ```
 * <greg> <status> "smart_person" <smart_graph> .
 * ```
 */
export class Path {
  /** @todo make path to accept type variable of fields */
  steps: (Call | Step)[];
  constructor(steps: (Call | Step)[] = []) {
    this.steps = steps;
  }
  private chainStep(step: Step): Path {
    return new Path([...this.steps, step]);
  }
  /** Execute the query and adds the results, with all tags, as a string-to-string (tag to node) map in the output set, one for each path that a traversal could take. */
  all(): Path {
    return this.chainStep({ type: "all" });
  }
  /** Alias for intersect.
   */
  and(path: Path): Path {
    return this.chainStep({ type: "and", args: [path] });
  }
  /** Alias for tag.
   */
  as(...tags: string[]): Path {
    return this.tag(...tags);
  }
  /** Return current path to a set of nodes on a given tag, preserving all constraints.
   * If still valid, a path will now consider their vertex to be the same one as the previously tagged one, with the added constraint that it was valid all the way here. Useful for traversing back in queries and taking another route for things that have matched so far.
   */
  back(tag?: string): Path {
    const args = tag !== undefined ? [tag] : [];
    return this.chainStep({
      type: "back",
      args
    });
  }
  /** Follow the predicate in either direction. Same as out or in.
   */
  both(path: Path, ...tags: string[]): Path {
    return this.chainStep({
      type: "both",
      args: [path, ...tags]
    });
  }
  /** Return a number of results and returns it as a value. */
  count(): Path {
    return this.chainStep({ type: "count" });
  }
  /** Alias for Except */
  difference(path: Path): Path {
    return this.except(path);
  }
  /** Removes all paths which match query from current path. In a set-theoretic sense, this is (A - B). While `g.V().Except(path)` to achieve `U - B = !B` is supported, it's often very slow. */
  except(path: Path): Path {
    return this.chainStep({ type: "except", args: [path] });
  }
  /** Apply constraints to a set of nodes. Can be used to filter values by range or match strings. */
  filter(filter: Filter): Path {
    return this.chainStep({ type: "filter", args: [filter] });
  }
  /** The way to use a path prepared with Morphism. Applies the path chain on the morphism object to the current path.
   * Starts as if at the g.M() and follows through the morphism path. */
  follow(path: Path): Path {
    return this.chainStep({ type: "follow", args: [path] });
  }
  /** The same as follow but follows the chain in the reverse direction. Flips "In" and "Out" where appropriate,
  the net result being a virtual predicate followed in the reverse direction. Starts at the end of the morphism and follows it backwards (with appropriate flipped directions) to the g.M() location. */
  followR(path: Path): Path {
    return this.chainStep({ type: "followR", args: [path] });
    return this;
  }
  /** The same as follow but follows the chain recursively. Starts as if at the g.M() and follows through the morphism path multiple times, returning all nodes encountered. */
  followRecursive(path: Path): Path {
    return this.chainStep({ type: "followRecursive", args: [path] });
  }
  /** The same as All, but limited to the first N unique nodes at the end of the path, and each of their possible traversals. */
  getLimit(limit: number): Path {
    return this.chainStep({ type: "getLimit", args: [limit] });
  }
  /** Filter all paths which are, at this point, on the subject for the given predicate and object,
  but do not follow the path, merely filter the possible paths. Usually useful for starting with all nodes, or limiting to a subset depending on some predicate/value pair.
/
    */
  has(predicate: string, object: string): Path {
    return this.chainStep({ type: "has", args: [predicate, object] });
  }
  /** The same as Has, but sets constraint in reverse direction. */
  hasR(predicate: string, object: string): Path {
    return this.chainStep({ type: "hasR", args: [predicate, object] });
  }
  /** The inverse of out. Starting with the nodes in `path` on the object, follow the quads with predicates defined by `predicatePath` to their subjects.
   * * null or undefined: All predicates pointing into this node
   * * a string: The predicate name to follow into this node
   * * a list of strings: The predicates to follow into this node
   * * a query path object: The target of which is a set of predicates to follow.
   * * null or undefined: No tags
   * * a string: A single tag to add the predicate used to the output set.
   * * a list of strings: Multiple tags to use as keys to save the predicate used to the output set.
   */
  in(predicatePath?: Path, ...tags: string[]): Path {
    const args = predicatePath !== undefined ? [predicatePath, ...tags] : tags;
    return this.chainStep({ type: "in", args });
  }
  /** Get the list of predicates that are pointing in to a node. */
  inPredicates(): Path {
    return this.chainStep({ type: "inPredicates" });
  }
  /** Filter all paths by the result of another query path. This is essentially a join where, at the stage of each path, a node is shared. */
  intersect(path: Path): Path {
    return this.chainStep({ type: "intersect", args: [path] });
  }
  /** Filter all paths to ones which, at this point, are on the given node.
   */
  is(node: string, ...nodes: string[]): Path {
    return this.chainStep({ type: "is", args: [node, ...nodes] });
  }
  /** Set (or remove) the subgraph context to consider in the following traversals.
   * Affects all in(), out(), and both() calls that follow it. The default LabelContext is null (all subgraphs).
   * * null or undefined: In future traversals, consider all edges, regardless of subgraph.
   * * a string: The name of the subgraph to restrict traversals to.
   * * a list of strings: A set of subgraphs to restrict traversals to.
   * * a query path object: The target of which is a set of subgraphs.
   * * null or undefined: No tags
   * * a string: A single tag to add the last traversed label to the output set.
   * * a list of strings: Multiple tags to use as keys to save the label used to the output set.
   */
  labelContext(labelPath: Path, ...tags: string[]): Path {
    return this.chainStep({ type: "labelContext", args: [labelPath, ...tags] });
  }
  /** Get the list of inbound and outbound quad labels */
  labels(): Path {
    return this.chainStep({ type: "labels" });
  }
  /** Limit a number of nodes for current path. */
  limit(limit: number): Path {
    return this.chainStep({ type: "limit", args: [limit] });
  }
  /** Alias for Union. */
  or(path: Path): Path {
    return this.union(path);
  }
  /** The work-a-day way to get between nodes, in the forward direction. Starting with the nodes in `path` on the subject, follow the quads with predicates defined by `predicatePath` to their objects.
   * * null or undefined: All predicates pointing out from this node
   * * a string: The predicate name to follow out from this node
   * * a list of strings: The predicates to follow out from this node
   * * a query path object: The target of which is a set of predicates to follow.
   * * null or undefined: No tags
   * * a string: A single tag to add the predicate used to the output set.
   * * a list of strings: Multiple tags to use as keys to save the predicate used to the output set.
   */
  out(predicateOrPath?: Call | Call[] | Path, ...tags: string[]): Path {
    const args =
      predicateOrPath !== undefined ? [predicateOrPath, ...tags] : tags;
    return this.chainStep({ type: "out", args });
  }
  /** Get the list of predicates that are pointing out from a node. */
  outPredicates(): Path {
    return this.chainStep({ type: "outPredicates" });
  }
  /** Save the object of all quads with predicate into tag, without traversal.
   */
  save(predicate: string, tag: string): Path {
    return this.chainStep({ type: "save", args: [predicate, tag] });
  }
  /** The same as save, but returns empty tags if predicate does not exists. */
  saveOpt(predicate: string, tag: string): Path {
    return this.chainStep({ type: "saveOpt", args: [predicate, tag] });
  }
  /** The same as saveOpt, but tags values via reverse predicate. */
  saveOptR(predicate: string, tag: string): Path {
    return this.chainStep({ type: "saveOptR", args: [predicate, tag] });
  }
  /** The same as save, but tags values via reverse predicate. */
  saveR(predicate: string, tag: string): Path {
    return this.chainStep({ type: "saveR", args: [predicate, tag] });
  }
  /** Tag the list of predicates that are pointing in to a node. */
  saveInPredicates(tag: string): Path {
    return this.chainStep({ type: "saveInPredicates", args: [tag] });
  }
  /** Tag the list of predicates that are pointing out from a node. */
  saveOutPredicates(tag: string): Path {
    return this.chainStep({ type: "saveOutPredicates", args: [tag] });
  }
  /** Skip a number of nodes for current path.
   */
  skip(offset: number): Path {
    return this.chainStep({ type: "skip", args: [offset] });
  }
  /** Save a list of nodes to a given tag. In order to save your work or learn more about how a path got to the end, we have tags.
  The simplest thing to do is to add a tag anywhere you'd like to put each node in the result set.
/reached "Tag" */
  tag(...tags: string[]): Path {
    return this.chainStep({ type: "tag", args: tags });
  }
  /**
   * The same as toArray, but instead of a list of top-level nodes, returns an Array of tag-to-string dictionaries, much as All would, except inside the JS environment.
   */
  tagArray(): Path {
    return this.chainStep({ type: "tagArray" });
  }
  /** The same as TagArray, but limited to one result node. Returns a tag-to-string map. */
  tagValue(): Path {
    return this.chainStep({ type: "tagValue" });
  }
  /** Execute a query and returns the results at the end of the query path as an JS array. */
  toArray(): Path {
    return this.chainStep({ type: "toArray" });
  }
  /** The same as ToArray, but limited to one result node. */
  toValue(): Path {
    return this.chainStep({ type: "toValue" });
  }
  /** Return the combined paths of the two queries. Notice that it's per-path, not per-node. Once again, if multiple paths reach the same destination, they might have had different ways of getting there (and different tags). See also: `Path.prototype.tag()` */
  union(path: Path): Path {
    return this.chainStep({ type: "union", args: [path] });
  }
  /** Remove duplicate values from the path. */
  unique(): Path {
    return this.chainStep({ type: "unique" });
  }
  /** Order returns values from the path in ascending order. */
  order(): Path {
    return this.chainStep({ type: "order" });
  }
  private static createCallString(name: string, args): string {
    return `${name}(${args ? deepMap(args, Path.argToString).join() : ""})`;
  }
  private static argToString(arg): string {
    if (arg.function) {
      return Path.createCallString(arg.function, arg.args);
    }
    if (arg instanceof Path) {
      return Path.createGraphCallChainString(
        arg.steps.filter((step): step is Step => "type" in step)
      );
    }
    return JSON.stringify(arg);
  }
  private static createMethodCallString(
    expression: string,
    step: Step
  ): string {
    return `${expression}.${Path.createCallString(step.type, step.args)}`;
  }
  private static GraphExpression = "graph";
  private static createGraphCallChainString(steps: Step[]): string {
    return steps.reduce(Path.createMethodCallString, Path.GraphExpression);
  }
  toString(): string {
    const globalCalls = this.steps
      .filter((step): step is Call => "function" in step)
      .map(call => Path.createCallString(Path.GraphExpression, call));
    const steps = this.steps.filter((step): step is Step => "type" in step);
    return [...globalCalls, Path.createGraphCallChainString(steps)].join(";");
  }
}

export class Graph {
  /** A shorthand for Vertex. */
  V(...nodeIds: (string | Call)[]): Path {
    return this.Vertex(...nodeIds);
  }
  /** A shorthand for Morphism */
  M(): Path {
    return this.Morphism();
  }
  /** Start a query path at the given vertex/vertices. No ids means "all vertices". */
  Vertex(...nodeIds: (string | Call)[]): Path {
    const step = {
      type: "Vertex",
      args: nodeIds
    };
    return new Path([step]);
  }
  /** Create a morphism path object. Unqueryable on it's own, defines one end of the path.
  Saving these to variables with */
  Morphism(): Path {
    return new Path([{ type: "Morphism" }]);
  }
  /** Load all namespaces saved to graph. */
  loadNamespaces(): Path {
    return new Path([{ function: "g.loadNamespaces", args: [] }]);
  }
  /** Register all default namespaces for automatic IRI resolution. */
  addDefaultNamespaces(): Path {
    return new Path([{ function: "g.addDefaultNamespaces", args: [] }]);
  }
  /** Associate prefix with a given IRI namespace. */
  addNamespace(pref: string, ns: string): Path {
    return new Path([{ function: "g.addNamespace", args: [pref, ns] }]);
  }
  /** Add data programmatically to the JSON result list. Can be any JSON type. */
  emit(value: Path): Path {
    return new Path([{ type: "emit", args: [value] }]);
  }
  /** Create an IRI values from a given string. */
  IRI(iri: string): Call {
    return { function: "g.IRI", args: [iri] };
  }
}

type Call = { function: string; args: any[] };

type Filter = Call;

/** Filter by match a regular expression ([syntax](https://github.com/google/re2/wiki/Syntax)). By default works only on literals unless includeIRIs is set to `true`. */
export function regex(expression: string, includeIRIs?: boolean): Filter {
  const args =
    includeIRIs === undefined ? [expression] : [expression, includeIRIs];
  return { function: "regex", args };
}

export function like(pattern: string) {
  return { function: "like", args: [pattern] };
}

interface DeepArray<T> extends Array<T | DeepArray<T>> {}

function deepMap<T, T2>(
  array: DeepArray<T>,
  func: (item: T) => T2
): DeepArray<T> {
  // @ts-ignore
  return array.map((item: T): T2 | DeepArray<T2> => {
    if (Array.isArray(item)) {
      return deepMap(item, func);
    }
    return func(item);
  });
}
