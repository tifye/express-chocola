# express-chocola
A small framework around express Routers providing an alternate way of defining routes in express.

## Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)

## Features
- Easy & readable way of defining and navigating through different routes
- Better route organization by concept of naming, grouping and labeling
- Register route group with own middleware
- Label routes with tags that carry own middleware
- Dynamic route finding & registering
- Automatic checking on inputs to routes in query, params & body

## Installing
```bash
$ npm install express-chocola
```

## Quick Start

Initialize the RouteRegistry and express where we want to look for our routes as a regexp.
Then acces the express router by the `router` member on the registry

index.js
```js
import express from 'express';
import path from 'path';
import { RouteRegistry } from 'express-chocola';

const app = express();
const registry = new RouteRegistry()
  .registerDefaultGroup()
  .registerRoutesIn({
    filter: /^([^.].*)\.(js|ts)$/,
    dirname: path.join(__dirname, 'routes'),
  });

app.use(registry.router);
```
Define a route by extending the base `Route` class

routes/chocola.js
```js
import { Route } from 'express-chocola';

export default class Default extends Route {
  constructor(registry) {
    super(registry, {
      name: 'default',
      method: 'get',
      path: '',
    });
  }

  async run(args) {
    const { response } = args;
    return response.send('Welcome to La Soleil!');
  }
}
```