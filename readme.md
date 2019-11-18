# JavaScript Client for [Cayley](https://github.com/cayleygraph/cayley)

### [Documentation](https://cayleygraph.github.io/javascript-client/)

### Installation

```bash
npm install @cayleygraph/cayley
```

### Usage

#### Log 10 nodes from the graph

```javascript
import * as cayley from "@cayleygraph/cayley";

const client = new cayley.Client();
const response = client.query(g.V().getLimit(10));
response
  .then(res => res.json())
  .then(nodes => {
    for (const node of nodes) {
      console.log(node);
    }
  });
```
