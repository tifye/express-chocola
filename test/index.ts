import express from 'express';
import path from 'path';
import RouteRegistry from '../src/RouteRegistry';

const registry = new RouteRegistry()
  .registerCollections([
    ['mino', [(req, res, next) => { console.log(req.headers); next(); }]],
    ['meep'],
  ])
  .registerRoutesIn({
    filter: /^([^.].*)\.(js|ts)$/,
    dirname: path.join(__dirname, 'routes'),
  });

const app = express();

app.use(registry.router);

app.listen(10000);
