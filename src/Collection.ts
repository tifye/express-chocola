import { Route } from './Route';

export type ICollectionOptions = [string, ((...args: any[]) => void)[]?];

export default class Collection {
  public routes: string[];
  public readonly middleware: ((...args: any[]) => void)[];
  public readonly name: string;

  constructor([name, middleware = undefined]: ICollectionOptions) {
    this.routes = [];
    this.middleware = middleware || [];
    this.name = name;
  }

  public addRoute(routeName: string) {
    this.routes.push(routeName);
    return this;
  }

  public addRoutes(routes: string[]) {
    return routes.forEach((routeName) => this.addRoute(routeName));
  }
}
