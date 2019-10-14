# cayley-js

JavaScript client for [Cayley](github.com/cayleygraph/cayley)

### Installation

```bash
npm install @cayleygraph/client
```

### Usage

```javascript
import CayleyClient from "@cayleygraph/client";

const client = new CayleyClient();

client.g.V().all();
```
