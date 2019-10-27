# JavaScript Client for [Cayley](https://github.com/cayleygraph/cayley)

### [Documentation](https://cayleygraph.github.io/javascript-client/)

### Installation

```bash
npm install @cayleygraph/client
```

### Usage

#### Log 10 nodes from the graph

```javascript
import * as cayley from "@cayleygraph/cayley";

const client = new cayley.Client();

for (node of client.g.V().getLimit(10)) {
  console.log(node);
}
```
