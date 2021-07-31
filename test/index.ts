import express from 'express';
import path from 'path';
import RouteRegistry from '../src/RouteRegistry';

const genericMiddleware = (string) => (req, res, next) => { console.log(string); next(); };
const someMiddleware = genericMiddleware('Some Middleware');
const defaultGroupMiddleware = genericMiddleware('Default Group Middleware');
const meepCollectionMiddleware = genericMiddleware('Meep Collection Middlewar');
const meepGroupMiddleware = genericMiddleware('Meep Group Middlewar');
const minoCollectionMiddleware = genericMiddleware('Mino Collection Middlewar');
const minoGroupMiddleware = genericMiddleware('Mino Group Middlewar');

const registry = new RouteRegistry()
  .registerCollections([
    ['mino', [minoCollectionMiddleware]],
    ['meep', [meepCollectionMiddleware, someMiddleware]],
  ])
  .registerGroups([
    ['mino', [minoGroupMiddleware]],
    ['meep', [meepGroupMiddleware, someMiddleware]],
  ])
  .registerDefaultGroup([defaultGroupMiddleware])
  .registerRoutesIn({
    filter: /^([^.].*)\.(js|ts)$/,
    dirname: path.join(__dirname, 'routes'),
  });

const app = express();

app.use(registry.router);

app.listen(10000);
