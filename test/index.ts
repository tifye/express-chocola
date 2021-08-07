import express from 'express';
import path from 'path';
import RouteRegistry from '../src/RouteRegistry';

const genericMiddleware = (string) => (req, res, next) => { console.log(string); next(); };
const someMiddleware = genericMiddleware('Some Middleware');
const defaultGroupMiddleware = genericMiddleware('Default Group Middleware');
const meepTagMiddleware = genericMiddleware('Meep RouteTag Middlewar');
const meepGroupMiddleware = genericMiddleware('Meep Group Middlewar');
const minoTagMiddleware = genericMiddleware('Mino RouteTag Middlewar');
const minoGroupMiddleware = genericMiddleware('Mino Group Middlewar');
const authMiddleware = genericMiddleware('Auth Middleware');
const afterRouteTagMiddleware = genericMiddleware('After Route Tag Middleware');

const registry = new RouteRegistry()
  .registerTags([
    ['mino'],
    ['meep', [meepTagMiddleware, someMiddleware]],
    ['authProtected', [authMiddleware, someMiddleware]],
  ])
  .registerGroups([
    ['mino', [minoGroupMiddleware]],
    ['meep', [someMiddleware]],
  ])
  .registerDefaultGroup()
  .registerRoutesIn({
    filter: /^([^.].*)\.(js|ts)$/,
    dirname: path.join(__dirname, 'routes'),
  });
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(registry.router);

app.listen(10000);
