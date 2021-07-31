/* eslint-disable no-param-reassign */
/* eslint-disable global-require, import/no-dynamic-require */
import {
  Router,
  Request,
  Response,
  NextFunction,
} from 'express';
import { IRouteOrderPosition, Route } from './Route';
import Collection, { ICollectionOptions } from './Collection';

export interface IRegisterRoutesInOptions {
  filter: RegExp | string;
  dirname?: string;
  recursive?: boolean;
}

const flatten = (object: any): any[] => {
  const array: any[] = [];
  // eslint-disable-next-line no-underscore-dangle
  const _flatten = (_object: any) => {
    Object.keys(_object).forEach((key) => {
      if (typeof _object[key] === 'object') _flatten(_object[key]);
      else array.push(_object[key]);
    });
  };

  _flatten(object);
  return array;
};

export default class RouteRegistry {
  public readonly router: Router;
  private routes: Map<string, Route[]>;
  private collections: Map<string, Collection>;

  constructor() {
    this.router = Router();
    this.routes = new Map();
    this.collections = new Map();
  }

  private registerRoute(route: Route) {
    this.organizeRoute(route);
    const routeMiddleware = this.getRouteMiddleware(route);

    // Register Route on Router
    (this.router as any)[route.info.method](`/${route.info.group}/${route.info.path}`, ...routeMiddleware,
      async (request: Request, response: Response, next: NextFunction) => {
        await route.wrappedRun({ request, response, next });
      });

    console.log(`✔️ ${route.info?.method} => ${route.info?.name} ${route.path}`);
  }

  private registerRoutes(routes: any[]) {
    if (!Array.isArray(routes)) throw new TypeError('Routes must be an Array type');
    // TODO: Range of priority via collections
    const lastPriority: Route[] = [];
    routes.forEach((_route) => {
      // TODO: Validate attempting Route
      const route = new _route() as Route;
      //
      if (route.info?.priority === IRouteOrderPosition.LAST) lastPriority.push(route);
      else this.registerRoute(route);
    });
    // Register the rest
    lastPriority.forEach((route) => {
      this.registerRoute(route);
    });

    return this;
  }

  public registerRoutesIn(options: IRegisterRoutesInOptions | string) {
    if (typeof options === 'object' && options.recursive !== undefined) options.recursive = true;
    let routes = require('require-all')(options);
    console.log(routes);
    routes = flatten(routes);
    console.log(routes);
    return this.registerRoutes(routes);
  }

  public registerCollection(collectionOptions: ICollectionOptions) {
    if (!this.collections.has(collectionOptions[0])) {
      this.collections.set(collectionOptions[0], new Collection(collectionOptions));
    }

    return this;
  }

  public registerCollections(collectionsOptions: ICollectionOptions[]) {
    collectionsOptions.forEach((collectionOptions) => {
      this.registerCollection(collectionOptions);
    });

    return this;
  }

  private organizeRoute(route: Route) {
    // Organize into group
    if (!this.routes.has(route.info.group)) this.routes.set(route.info.group, []);
    this.routes.get(route.info.group)?.push(route);

    // Organize into collection
    if (route.info.collections !== undefined && !Array.isArray(route.info.collections)) throw TypeError('Collections must be an Array');
    route.info.collections?.forEach((collection) => {
      if (!this.collections.has(collection)) {
        this.collections.set(collection, new Collection([collection]));
        console.log(`📒 Collection: ${collection} was auto generated from route ${route.info.name}`);
      }
      this.collections.get(collection)?.addRoute(route);
    });
  }

  private getRouteMiddleware(route: Route) {
    const routeMiddleware = new Set<((...args: any[]) => void)>();
    // Add Collection middleware
    route.info.collections?.forEach((collectionName) => {
      const collection = this.collections.get(collectionName);
      if (collection === undefined) return;
      collection.middleware.forEach((middleware) => {
        routeMiddleware.add(middleware);
      });
    });
    // Add Route middleware
    route.info.middleware?.forEach((middleware) => {
      routeMiddleware.add(middleware);
    });
    return [...routeMiddleware];
  }
}
