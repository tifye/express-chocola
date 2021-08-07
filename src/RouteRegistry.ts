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
import RouteTag, { ITagOptions } from './RouteTag';
import RouteGroup, { IRouteGroupOptions } from './RouteGroup';

export interface IRegisterRoutesInOptions {
  filter: RegExp | string;
  dirname?: string;
  recursive?: boolean;
}

export default class RouteRegistry {
  public readonly router: Router;
  public readonly routes: Map<string, Route>;
  public readonly tags: Map<string, RouteTag>;
  public readonly groups: Map<string, RouteGroup>;
  public readonly defaultGroupName = '';

  constructor() {
    this.router = Router();
    this.routes = new Map();
    this.tags = new Map();
    this.groups = new Map();
  }

  /* Routes */
  public registerRoute(route: Route, isDuplicate: boolean = false) {
    if (!isDuplicate) this.organizeRoute(route);
    const routeMiddleware = this.getRouteMiddleware(route);

    // Register Route on Router
    (this.router as any)[route.method](route.path, ...routeMiddleware,
      async (request: Request, response: Response, next: NextFunction) => {
        await route.wrappedRun({ request, response, next });
      });

    console.log(`✔️ ${route?.method} => ${route?.name} ${route.path}`);
  }

  private registerRoutes(routes: any[]) {
    if (!Array.isArray(routes)) throw new TypeError('Routes must be an Array type');
    // TODO: Range of priority via tags
    const lastPriority: Route[] = [];
    routes.forEach((_route) => {
      // TODO: Validate attempting Route
      const route = new _route(this) as Route;
      //
      if (route?.priority === IRouteOrderPosition.LAST) lastPriority.push(route);
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

  /* FIXME: need to remove route from router first */
  public reregisterRoute(route: Route, oldRoute: Route) {
    if (route.constructor !== oldRoute.constructor) {
      console.error(`📕 {Skipping over} Attempting to reregister Route as different type: - new: ${route.name} - old: ${oldRoute.name}`);
      return this;
    }

    if (route.name !== oldRoute.name || route.group !== oldRoute.group) {
      console.error(`📕 {Skipping over} Attempting to reregister Route with different name or group: - new: ${route.name} - old: ${oldRoute.name}`);
      return this;
    }

    return this.registerRoute(route, true);
  }

  public resolveRoute(routeName: string) {
    return this.routes.get(routeName);
  }

  /* Tags */
  public registerTag(collectionOptions: ITagOptions) {
    if (!this.tags.has(collectionOptions[0])) {
      this.tags.set(collectionOptions[0], new RouteTag(collectionOptions));
    }
    return this;
  }

  public registerTags(collectionsOptions: ITagOptions[]) {
    collectionsOptions.forEach((collectionOptions) => {
      this.registerTag(collectionOptions);
    });
    return this;
  }

  public registerMiddlewareOnTag(tagName: string, middleware: ((...args: any[]) => void)) {
    if (!this.tags.has(tagName)) {
      console.error(`📕 {Skipping over} Attempting to add middleware to unregistered RouteTag: ${tagName}`);
      return this;
    }
    this.tags.get(tagName)?.addMiddleware(middleware);
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
    if (this.routes.has(route.name)) {
      console.log(`📒 {Skipping over} Attempting to register Route with duplicate name: ${route.name}\nWith paths:\n\t${route.subPath}\n\t${this.routes.get(route.name)?.path}`);
    }
    this.routes.set(route.name, route);

    // Organize into tag
    if (route.tags !== undefined && !Array.isArray(route.tags)) throw TypeError('Tags must be an Array');
    route.tags?.forEach((tag) => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new RouteTag([tag]));
        console.log(`📒 RouteTag: ${tag} was auto generated from route ${route.name}`);
      }
      this.tags.get(tag)?.addRoute(route.name);
    });

    // Organize into Group
    if (route.group) {
      if (!this.groups.has(route.group)) {
        console.error(`📕 {Skipping over} Attempting to add Route to unregistered Group: ${route.group}`);
        return;
      }
      this.groups.get(route.group)?.addRoute(route.name);
    } else if (this.groups.has(this.defaultGroupName)) {
      this.groups.get(this.defaultGroupName)?.addRoute(route.name);
    }
  }

  private getRouteMiddleware(route: Route) {
    const routeMiddleware = new Set<((...args: any[]) => void)>();
    // Add RouteGroup middleware
    this.groups.get(route.group || this.defaultGroupName)?.middleware.forEach((middleware) => routeMiddleware.add(middleware));
    // Add RouteTag middleware
    route.tags?.forEach((collectionName) => {
      const tag = this.tags.get(collectionName);
      if (tag === undefined) return;
      tag.middleware.forEach((middleware) => {
        routeMiddleware.add(middleware);
      });
    });
    // Add Route middleware
    route.middleware?.forEach((middleware) => {
      routeMiddleware.add(middleware);
    });
    return [...routeMiddleware];
  }
}
