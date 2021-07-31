/* eslint-disable no-param-reassign */
/* eslint-disable global-require, import/no-dynamic-require */
import {
  Router,
  Request,
  Response,
  NextFunction,
} from 'express';
import { IRouteOrderPosition, Route } from './Route';
import { flatten } from './helperFunctions';
import Collection, { ICollectionOptions } from './Collection';
import RouteGroup, { IRouteGroupOptions } from './RouteGroup';

export interface IRegisterRoutesInOptions {
  filter: RegExp | string;
  dirname?: string;
  recursive?: boolean;
}

export default class RouteRegistry {
  public readonly router: Router;
  public readonly routes: Map<string, Route>;
  public readonly collections: Map<string, Collection>;
  public readonly groups: Map<string, RouteGroup>;
  public readonly defaultGroupName = '';

  constructor() {
    this.router = Router();
    this.routes = new Map();
    this.collections = new Map();
    this.groups = new Map();
  }

  /* Routes */
  private registerRoute(route: Route) {
    this.organizeRoute(route);
    const routeMiddleware = this.getRouteMiddleware(route);

    // Register Route on Router
    (this.router as any)[route.info.method](route.path, ...routeMiddleware,
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
    const routes = require('require-all')(options);
    return this.registerRoutes(flatten(routes));
  }

  /* Collections */
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

  /* Groups */
  public registerGroup(group: IRouteGroupOptions | RouteGroup, ignoreDuplicate: boolean = true) {
    group = (group instanceof RouteGroup) ? group : new RouteGroup(group);
    if (!this.groups.has(group.name) && ignoreDuplicate !== true) {
      console.log(`📒 {Skipping over} Attempting to register group with duplicate name: ${group.name}`);
    }
    this.groups.set(group.name, group);
    return this;
  }

  public registerGroups(groups: IRouteGroupOptions[] | RouteGroup[], ignoreDuplicate: boolean = true) {
    groups.forEach((group: RouteGroup | IRouteGroupOptions) => {
      this.registerGroup(group, ignoreDuplicate);
    });
    return this;
  }

  public registerDefaultGroup(middleware: ((...args: any[]) => void)[] = []) {
    return this.registerGroup([this.defaultGroupName, middleware]);
  }

  private organizeRoute(route: Route) {
    // Add Route
    if (this.routes.has(route.info.name)) {
      console.log(`📒 {Skipping over} Attempting to register Route with duplicate name: ${route.info.name}\nWith paths:\n\t${route.info.path}\n\t${this.routes.get(route.info.name)?.path}`);
    }
    this.routes.set(route.info.name, route);

    // Organize into collection
    if (route.info.collections !== undefined && !Array.isArray(route.info.collections)) throw TypeError('Collections must be an Array');
    route.info.collections?.forEach((collection) => {
      if (!this.collections.has(collection)) {
        this.collections.set(collection, new Collection([collection]));
        console.log(`📒 Collection: ${collection} was auto generated from route ${route.info.name}`);
      }
      this.collections.get(collection)?.addRoute(route.info.name);
    });

    // Organize into Group
    if (route.info.group) {
      if (!this.groups.has(route.info.group)) {
        console.error(`📕 {Skipping over} Attempting to add Route to unregistered Group: ${route.info.group}`);
        return;
      }
      this.groups.get(route.info.group)?.addRoute(route.info.name);
    } else if (this.groups.has(this.defaultGroupName)) {
      this.groups.get(this.defaultGroupName)?.addRoute(route.info.name);
    }
  }

  private getRouteMiddleware(route: Route) {
    const routeMiddleware = new Set<((...args: any[]) => void)>();
    // Add RouteGroup middleware
    this.groups.get(route.info.group || this.defaultGroupName)?.middleware.forEach((middleware) => routeMiddleware.add(middleware));
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
